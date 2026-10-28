import React, { createContext, useContext, useId } from "react";
import { interpolate, interpolateColors, useCurrentFrame } from "remotion";
import { colors, loopPhase, idle, night, sombra } from "../theme";
import { useGlobalFrame, useLoopFrames } from "./GlobalFrame";
import { useInk } from "./Ink";

// Rig 2D em camadas. Origem nos pés (0,0); y negativo para cima.
// Unidades do rig: cabeça com raio 230, altura total ~1150.

type Vec = [number, number];

export type PoseName =
  | "parado"
  | "andando"
  | "caindo"
  | "apontando"
  | "de_costas"
  | "encolhido"
  | "olhando_para_cima"
  | "mao_levantada"
  | "bracos_cruzados"
  | "joinha";

export type ExpressionName = "neutro" | "surpresa" | "medo" | "vergonha" | "cetica";

type PoseDef = {
  handL: Vec;
  handR: Vec;
  footL: Vec;
  footR: Vec;
  crouch: number;
  lean: number;
  headTilt: number;
  headDy: number;
  look: Vec;
  back?: boolean;
  pointR?: boolean;
  thumbR?: boolean;
  shiver?: boolean;
};

const SHOULDER_L: Vec = [-125, -530];
const SHOULDER_R: Vec = [125, -530];
const HIP_L: Vec = [-50, -300];
const HIP_R: Vec = [50, -300];
const ARM = [172, 172];
const LEG = [140, 140];
const HEAD_Y = -790;
const HEAD_R = 230;

const POSES: Record<PoseName, PoseDef> = {
  parado: {
    handL: [-170, -250], handR: [170, -250], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: 0, headDy: 0, look: [0, 0],
  },
  andando: {
    handL: [-170, -250], handR: [170, -250], footL: [-58, -22], footR: [58, -22],
    crouch: 6, lean: 0, headTilt: 0, headDy: 0, look: [0.6, 0],
  },
  caindo: {
    handL: [-300, -760], handR: [290, -800], footL: [-130, -60], footR: [90, -10],
    crouch: 0, lean: 16, headTilt: 10, headDy: 0, look: [0, -0.6],
  },
  apontando: {
    handL: [-170, -250], handR: [430, -660], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: 4, headDy: 0, look: [0.8, -0.3], pointR: true,
  },
  de_costas: {
    handL: [-172, -252], handR: [172, -252], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: 0, headDy: 0, look: [0, 0], back: true,
  },
  encolhido: {
    handL: [70, -430], handR: [-70, -450], footL: [-70, -22], footR: [70, -22],
    crouch: 95, lean: 0, headTilt: 0, headDy: 55, look: [0.3, -0.2], shiver: true,
  },
  olhando_para_cima: {
    handL: [-170, -250], handR: [172, -252], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: -7, headDy: -12, look: [0.7, -0.9],
  },
  mao_levantada: {
    handL: [-170, -250], handR: [300, -860], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: -4, headDy: -8, look: [0.7, -0.9],
  },
  joinha: {
    handL: [-170, -250], handR: [175, -520], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: 5, headDy: 0, look: [0.3, 0.1], thumbR: true,
  },
  bracos_cruzados: {
    handL: [110, -410], handR: [-110, -428], footL: [-58, -22], footR: [58, -22],
    crouch: 0, lean: 0, headTilt: 3, headDy: 0, look: [-0.9, 0],
  },
};

type Brow = { dy: number; rot: number };
type ExprDef = {
  browL: Brow;
  browR: Brow;
  eye: number;
  pupil: number;
  lid: number;
  mouth: "sorriso" | "o" | "ondulada" | "reta" | "canto";
  blush?: boolean;
  sweat?: boolean;
  look?: Vec;
};

const EXPRESSIONS: Record<ExpressionName, ExprDef> = {
  neutro: { browL: { dy: 0, rot: 0 }, browR: { dy: 0, rot: 0 }, eye: 1, pupil: 25, lid: 0, mouth: "sorriso" },
  surpresa: { browL: { dy: -34, rot: -4 }, browR: { dy: -34, rot: -4 }, eye: 1.12, pupil: 19, lid: 0, mouth: "o" },
  medo: { browL: { dy: -18, rot: 20 }, browR: { dy: -18, rot: 20 }, eye: 1.05, pupil: 15, lid: 0, mouth: "ondulada", sweat: true },
  vergonha: { browL: { dy: -4, rot: 14 }, browR: { dy: -4, rot: 14 }, eye: 0.95, pupil: 23, lid: 0.2, mouth: "ondulada", blush: true, look: [-0.6, 0.6] },
  cetica: { browL: { dy: -30, rot: -12 }, browR: { dy: 8, rot: -14 }, eye: 1, pupil: 24, lid: 0.45, mouth: "canto" },
};

export type CharacterStyle = {
  hoodie: string;
  hair: "topete" | "longo";
  pocket: boolean;
  blinkSeed: number;
};

export type CharacterProps = {
  style: CharacterStyle;
  pose: string;
  expression: string;
  holding?: string | null;
  action?: string | null;
  // Transição suave entre poses: pose anterior e progresso (0..1)
  fromPose?: string;
  poseT?: number;
  // Direção do olhar (-1..1), já suavizada por quem chama; sobrepõe a da pose
  look?: Vec;
};

// Quanto a cabeça desce na pose (agachar + inclinar), em unidades do rig. Usado pelo close
// para manter o queixo na mesma altura da tela em qualquer pose.
export const headDrop = (pose: string | undefined) => {
  const p = getPose(pose);
  return p.crouch + p.headDy;
};
export const RIG_CHIN_Y = HEAD_Y + HEAD_R;

// Nível de noite do cenário (0 = dia, 1 = noite cheia): pele mais escura e quente,
// luz de recorte turquesa e bochechas azuladas de frio.
export const NightLevel = createContext(0);

const getPose = (name: string | undefined): PoseDef => POSES[(name as PoseName) in POSES ? (name as PoseName) : "parado"];

const lerpV = (a: Vec, b: Vec, t: number): Vec => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

const blendPose = (a: PoseDef, b: PoseDef, t: number): PoseDef => {
  if (t >= 1) return b;
  const n = (x: number, y: number) => x + (y - x) * t;
  return {
    ...b,
    handL: lerpV(a.handL, b.handL, t),
    handR: lerpV(a.handR, b.handR, t),
    footL: lerpV(a.footL, b.footL, t),
    footR: lerpV(a.footR, b.footR, t),
    crouch: n(a.crouch, b.crouch),
    lean: n(a.lean, b.lean),
    headTilt: n(a.headTilt, b.headTilt),
    headDy: n(a.headDy, b.headDy),
    look: lerpV(a.look, b.look, t),
  };
};

// Cinemática inversa de dois segmentos: devolve o cotovelo/joelho.
const ik = (s: Vec, t: Vec, [l1, l2]: number[], side: number): Vec => {
  const dx = t[0] - s[0];
  const dy = t[1] - s[1];
  const d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5);
  const base = Math.atan2(dy, dx);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const a = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const e1: Vec = [s[0] + l1 * Math.cos(base + a), s[1] + l1 * Math.sin(base + a)];
  const e2: Vec = [s[0] + l1 * Math.cos(base - a), s[1] + l1 * Math.sin(base - a)];
  // Prefere o cotovelo/joelho para fora e para baixo
  const score = (e: Vec) => (e[0] - s[0]) * side + (e[1] - s[1]) * 0.8;
  return score(e1) > score(e2) ? e1 : e2;
};

// Membro com contorno de tinta. `shade`: sombra chapada de um tom no lado esquerdo
// (a luz vem do alto à direita, onde fica o Sol).
const Limb: React.FC<{ a: Vec; b: Vec; c: Vec; width: number; color: string; shade?: boolean }> = ({ a, b, c, width, color, shade }) => {
  const ink = useInk();
  const d = `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} L ${c[0]} ${c[1]}`;
  return (
    <>
      <path d={d} stroke={colors.tinta} strokeWidth={width + 2 * ink} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={shade ? sombra(color) : color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {shade ? (
        <path
          d={d}
          transform={`translate(${width * 0.2} ${-width * 0.06})`}
          stroke={color}
          strokeWidth={width * 0.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </>
  );
};

const PaoDeQueijo: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={r * 1.15} ry={r} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={-r * 0.35} cy={-r * 0.25} r={r * 0.14} fill={colors.muroSombra} />
      <circle cx={r * 0.3} cy={-r * 0.35} r={r * 0.11} fill={colors.muroSombra} />
      <circle cx={r * 0.1} cy={r * 0.25} r={r * 0.12} fill={colors.muroSombra} />
    </g>
  );
};

export const Character: React.FC<CharacterProps> = ({ style, pose, expression, holding, action, fromPose, poseT = 1, look: lookOverride }) => {
  const frame = useCurrentFrame();
  const g = useGlobalFrame();
  const loopFrames = useLoopFrames();
  const ink = useInk();
  const nightK = useContext(NightLevel);
  const uid = useId().replace(/:/g, "");
  const skin = interpolateColors(nightK, [0, 1], [colors.pele, night.pele]);
  const p = fromPose && fromPose !== pose ? blendPose(getPose(fromPose), getPose(pose), poseT) : getPose(pose);
  const e = EXPRESSIONS[(expression as ExpressionName) in EXPRESSIONS ? (expression as ExpressionName) : "neutro"];

  // Respiração e piscada, sempre ativas (relógio do episódio, para o loop casar)
  const breath = Math.sin(loopPhase(g, idle.breathCycles, loopFrames) * 2 * Math.PI);
  const breathDy = -breath * 5;
  const blinkCycles = idle.blinkCycles - style.blinkSeed;
  const blinkPeriod = loopFrames / blinkCycles;
  const bf = loopPhase(g + style.blinkSeed * 37, blinkCycles, loopFrames) * blinkPeriod;
  const blink = interpolate(bf, [0, 2, 4, 6], [1, 0.08, 0.08, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cold = action === "frio";
  const coldCheeks = cold || nightK > 0.5;
  const shiverX = cold ? Math.sin(frame * 2.9) * 7 : p.shiver ? Math.sin(frame * 2.4) * 3 : 0;

  // Andar: passo no lugar, com balanço dos braços
  const walk = pose === "andando" ? Math.sin((frame / 9) * Math.PI) : 0;
  const crouch = p.crouch + (pose === "andando" ? Math.abs(walk) * 8 : 0);
  const bodyDy = crouch;

  const footL: Vec = [p.footL[0], p.footL[1] - Math.max(0, walk) * 36];
  const footR: Vec = [p.footR[0], p.footR[1] - Math.max(0, -walk) * 36];

  const shL: Vec = [SHOULDER_L[0], SHOULDER_L[1] + bodyDy + breathDy];
  const shR: Vec = [SHOULDER_R[0], SHOULDER_R[1] + bodyDy + breathDy];
  const hipL: Vec = [HIP_L[0], HIP_L[1] + bodyDy];
  const hipR: Vec = [HIP_R[0], HIP_R[1] + bodyDy];

  // Ação "comendo": a mão direita leva o lanche à boca em ciclos
  const eatCycle = 42;
  const eatPhase = (frame % eatCycle) / eatCycle;
  const eatLift = action === "comendo" ? interpolate(eatPhase, [0, 0.25, 0.5, 0.75], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  // Segurando algo (sem comer): mão à altura do peito, mostrando o objeto
  const holdUp = holding && action !== "comendo" && pose === "parado";
  const restR: Vec = holdUp
    ? [150, -435 + bodyDy + breathDy * 0.5]
    : [p.handR[0], p.handR[1] + bodyDy + breathDy * 0.5 - walk * 20];
  const mouthTarget: Vec = [55, HEAD_Y + 115 + bodyDy + p.headDy];
  const handR: Vec = [
    restR[0] + (mouthTarget[0] - restR[0]) * eatLift,
    restR[1] + (mouthTarget[1] - restR[1]) * eatLift,
  ];
  const handL: Vec = [p.handL[0], p.handL[1] + bodyDy + breathDy * 0.5 + walk * 20];
  const bites = action === "comendo" ? Math.floor((frame + eatCycle * 0.5) / eatCycle) : 0;
  const breadR = 58 * Math.max(0.45, 1 - bites * 0.14);

  const elbowL = ik(shL, handL, ARM, -1);
  // Segurando à frente do peito: cotovelo junto ao corpo e antebraço em escorço
  const elbowR: Vec = holdUp || p.thumbR ? [shR[0] + 40, shR[1] + 160] : ik(shR, handR, ARM, 1);
  const kneeL = ik(hipL, footL, LEG, -1);
  const kneeR = ik(hipR, footR, LEG, 1);

  const chewing = action === "comendo" && eatPhase > 0.45 && Math.floor(frame / 5) % 2 === 0;
  const mouth = chewing ? "aberta" : e.mouth;
  // Revirar os olhos: as pupilas dão a volta por cima, de um lado ao outro
  const rollT = (frame % 54) / 54;
  const rollA = interpolate(rollT, [0, 0.6, 1], [Math.PI, 2 * Math.PI, 2 * Math.PI], { extrapolateRight: "clamp" });
  const rolling: Vec = [Math.cos(rollA) * 0.9, -Math.abs(Math.sin(rollA)) - 0.1];
  const look =
    action === "revirar_olhos"
      ? rolling
      : lookOverride ?? (e.look && pose !== "olhando_para_cima" && pose !== "mao_levantada" ? e.look : p.look);

  const headY = HEAD_Y + bodyDy + p.headDy + breathDy;
  const torsoScale = 1 + breath * 0.012;

  const hoodiePath =
    "M -150 -280 L -140 -500 Q -135 -578 -60 -580 L 60 -580 Q 135 -578 140 -500 L 150 -280 Q 150 -262 132 -262 L -132 -262 Q -150 -262 -150 -280 Z";

  const arms = (
    <>
      <Limb a={shL} b={elbowL} c={handL} width={66} color={style.hoodie} shade />
      <circle cx={handL[0]} cy={handL[1]} r={34} fill={skin} stroke={colors.tinta} strokeWidth={ink} />
      <Limb a={shR} b={elbowR} c={handR} width={66} color={style.hoodie} shade />
      {p.pointR ? (
        (() => {
          const dx = handR[0] - elbowR[0];
          const dy = handR[1] - elbowR[1];
          const len = Math.hypot(dx, dy) || 1;
          const tip: Vec = [handR[0] + (dx / len) * 62, handR[1] + (dy / len) * 62];
          return <Limb a={handR} b={handR} c={tip} width={22} color={skin} />;
        })()
      ) : null}
      <circle cx={handR[0]} cy={handR[1]} r={34} fill={skin} stroke={colors.tinta} strokeWidth={ink} />
      {p.thumbR ? <Limb a={[handR[0] - 6, handR[1] - 20]} b={[handR[0] - 6, handR[1] - 20]} c={[handR[0] - 6, handR[1] - 78]} width={26} color={skin} /> : null}
      {holding === "pao_de_queijo" ? <PaoDeQueijo x={handR[0] - 8} y={handR[1] - 40} r={breadR} /> : null}
    </>
  );

  // Luz de recorte turquesa (noite): faixa por dentro da silhueta, do lado da Lua (alto à direita)
  const rim = nightK > 0.01;
  return (
    <g transform={`translate(${shiverX} 0) rotate(${p.lean} 0 -400)`} filter={rim ? `url(#recorte-${uid})` : undefined}>
      {rim ? (
        <filter id={`recorte-${uid}`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius={ink * 0.6} result="dentro" />
          <feOffset in="dentro" dx={-ink * 0.95} dy={ink * 0.75} result="deslocado" />
          <feComposite in="dentro" in2="deslocado" operator="out" result="faixa" />
          <feFlood floodColor={night.rimLight} floodOpacity={nightK * 0.85} />
          <feComposite in2="faixa" operator="in" result="luz" />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="luz" />
          </feMerge>
        </filter>
      ) : null}
      {/* Sombra chapada no chão */}
      <ellipse cx={0} cy={-6} rx={190} ry={30} fill={colors.tinta} opacity={0.18} />

      {/* Pernas */}
      <Limb a={hipL} b={kneeL} c={footL} width={74} color={colors.calca} shade />
      <Limb a={hipR} b={kneeR} c={footR} width={74} color={colors.calca} shade />
      <ellipse cx={footL[0] - 14} cy={footL[1]} rx={54} ry={26} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <ellipse cx={footR[0] + 14} cy={footR[1]} rx={54} ry={26} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />

      {/* Tronco: moletom com bolso (silhueta) */}
      <g transform={`translate(0 ${bodyDy}) translate(0 -262) scale(1 ${torsoScale}) translate(0 262)`}>
        <clipPath id={`moletom-${uid}`}>
          <path d={hoodiePath} />
        </clipPath>
        <path d={hoodiePath} fill={sombra(style.hoodie)} />
        <g clipPath={`url(#moletom-${uid})`}>
          <path d={hoodiePath} transform="translate(46 -10)" fill={style.hoodie} />
        </g>
        <path d={hoodiePath} fill="none" stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <path d="M -146 -306 L 146 -306" stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinecap="round" />
        {p.back ? (
          <path
            d="M -110 -560 Q -120 -420 0 -400 Q 120 -420 110 -560 Z"
            fill={style.hoodie}
            stroke={colors.tinta}
            strokeWidth={ink}
            strokeLinejoin="round"
          />
        ) : style.pocket ? (
          <path d="M -92 -306 L -72 -410 L 72 -410 L 92 -306 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        ) : null}
      </g>

      {/* Gola do capuz */}
      <ellipse cx={0} cy={-575 + bodyDy + breathDy} rx={138} ry={56} fill={style.hoodie} stroke={colors.tinta} strokeWidth={ink} />

      {/* Cabeça */}
      <g transform={`translate(0 ${headY}) rotate(${p.headTilt})`}>
        {style.hair === "longo" ? (
          <path
            d="M -262 -10 C -285 -260 -130 -282 0 -282 C 130 -282 285 -260 262 -10 L 272 290 Q 205 330 150 288 L 150 80 L -150 80 L -150 288 Q -205 330 -272 290 Z"
            fill={colors.cabelo}
            stroke={colors.tinta}
            strokeWidth={ink}
            strokeLinejoin="round"
          />
        ) : null}
        <circle cx={-224} cy={14} r={44} fill={skin} stroke={colors.tinta} strokeWidth={ink} />
        <circle cx={224} cy={14} r={44} fill={skin} stroke={colors.tinta} strokeWidth={ink} />
        <clipPath id={`cabeca-${uid}`}>
          <circle r={HEAD_R} />
        </clipPath>
        <circle r={HEAD_R} fill={sombra(skin)} />
        <g clipPath={`url(#cabeca-${uid})`}>
          <circle cx={44} cy={-30} r={HEAD_R} fill={skin} />
        </g>
        <circle r={HEAD_R} fill="none" stroke={colors.tinta} strokeWidth={ink} />

        {p.back ? (
          <path
            d="M -232 40 C -260 -190 -120 -258 0 -258 C 120 -258 260 -190 232 40 C 200 110 100 140 0 140 C -100 140 -200 110 -232 40 Z"
            fill={colors.cabelo}
            stroke={colors.tinta}
            strokeWidth={ink}
          />
        ) : (
          <Face e={e} look={look} blink={blink} mouth={mouth} frame={frame} skin={skin} coldCheeks={coldCheeks} />
        )}

        {!p.back && style.hair === "topete" ? (
          <>
            <path
              d="M -233 20 C -252 -170 -130 -252 0 -252 C 140 -252 252 -170 233 20 C 222 -90 165 -168 70 -184 C -20 -198 -165 -165 -233 20 Z"
              fill={colors.cabelo}
              stroke={colors.tinta}
              strokeWidth={ink}
              strokeLinejoin="round"
            />
            <path
              d="M -80 -236 C -70 -340 90 -372 185 -300 C 120 -304 88 -276 76 -236 Z"
              fill={colors.cabelo}
              stroke={colors.tinta}
              strokeWidth={ink}
              strokeLinejoin="round"
            />
          </>
        ) : null}
        {!p.back && style.hair === "longo" ? (
          <path
            d="M -234 10 C -252 -180 -122 -258 0 -258 C 132 -258 252 -180 234 10 C 215 -110 160 -165 100 -176 L 62 -146 L 26 -180 C -90 -188 -200 -150 -234 10 Z"
            fill={colors.cabelo}
            stroke={colors.tinta}
            strokeWidth={ink}
            strokeLinejoin="round"
          />
        ) : null}
      </g>

      {arms}
      {cold ? <Breath frame={frame} x={70} y={headY + 150} /> : null}
    </g>
  );
};

// Bafo de frio: nuvenzinhas que saem da boca, sobem e somem
const Breath: React.FC<{ frame: number; x: number; y: number }> = ({ frame, x, y }) => {
  const ink = useInk();
  const cycle = 40;
  const k = (frame % cycle) / cycle;
  if (k > 0.75) return null;
  const s = interpolate(k, [0, 0.2, 0.75], [0.3, 1, 1.3]);
  const o = interpolate(k, [0, 0.1, 0.55, 0.75], [0, 0.9, 0.9, 0]);
  return (
    <g transform={`translate(${x + k * 120} ${y - k * 60}) scale(${s})`} opacity={o}>
      <circle cx={0} cy={0} r={34} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <circle cx={38} cy={-14} r={26} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <circle cx={22} cy={18} r={22} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
    </g>
  );
};

const Face: React.FC<{ e: ExprDef; look: Vec; blink: number; mouth: string; frame: number; skin: string; coldCheeks: boolean }> = ({
  e,
  look,
  blink,
  mouth,
  skin,
  coldCheeks,
}) => {
  const ink = useInk();
  const eyeRx = 50;
  const eyeRy = 60 * e.eye;
  const eye = (x: number) => (
    <g transform={`translate(${x} 0) scale(1 ${blink})`}>
      <ellipse rx={eyeRx * e.eye} ry={eyeRy} fill={colors.branco} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={look[0] * 16} cy={look[1] * 20} r={e.pupil} fill={colors.tinta} />
      <circle cx={look[0] * 16 + e.pupil * 0.35} cy={look[1] * 20 - e.pupil * 0.4} r={Math.max(5, e.pupil * 0.3)} fill={colors.branco} />
      {e.lid > 0 ? (
        <>
          <rect x={-eyeRx * e.eye - 14} y={-eyeRy - 16} width={eyeRx * e.eye * 2 + 28} height={16 + eyeRy * 2 * e.lid} fill={skin} />
          <path
            d={`M ${-eyeRx * e.eye} ${-eyeRy + eyeRy * 2 * e.lid} L ${eyeRx * e.eye} ${-eyeRy + eyeRy * 2 * e.lid}`}
            stroke={colors.tinta}
            strokeWidth={ink}
            strokeLinecap="round"
          />
        </>
      ) : null}
    </g>
  );

  const brow = (side: -1 | 1, b: Brow) => {
    const cx = side * 88;
    const rot = side === -1 ? -b.rot : b.rot;
    return (
      <path
        d={`M ${cx - 46} ${-100 + b.dy} L ${cx + 46} ${-100 + b.dy}`}
        transform={`rotate(${rot} ${cx} ${-100 + b.dy})`}
        stroke={colors.tinta}
        strokeWidth={24}
        strokeLinecap="round"
      />
    );
  };

  const mouthEl = (() => {
    switch (mouth) {
      case "o":
        return <ellipse cx={0} cy={128} rx={30} ry={40} fill={colors.tinta} />;
      case "aberta":
        return <ellipse cx={0} cy={125} rx={40} ry={20} fill={colors.tinta} />;
      case "ondulada":
        return (
          <path d="M -55 125 Q -37 107 -18 125 Q 0 143 18 125 Q 37 107 55 125" stroke={colors.tinta} strokeWidth={ink} fill="none" strokeLinecap="round" />
        );
      case "reta":
        return <path d="M -35 125 L 35 125" stroke={colors.tinta} strokeWidth={ink} strokeLinecap="round" />;
      case "canto":
        return <path d="M -42 130 Q 5 132 48 110" stroke={colors.tinta} strokeWidth={ink} fill="none" strokeLinecap="round" />;
      default:
        return <path d="M -45 112 Q 0 145 45 112" stroke={colors.tinta} strokeWidth={ink} fill="none" strokeLinecap="round" />;
    }
  })();

  return (
    <>
      {e.blush || coldCheeks ? (
        <>
          <ellipse cx={-140} cy={78} rx={42} ry={22} fill={coldCheeks ? night.bochechaFrio : colors.coral} />
          <ellipse cx={140} cy={78} rx={42} ry={22} fill={coldCheeks ? night.bochechaFrio : colors.coral} />
        </>
      ) : null}
      {eye(-88)}
      {eye(88)}
      {brow(-1, e.browL)}
      {brow(1, e.browR)}
      <path d="M -14 58 Q 0 72 14 58" stroke={colors.tinta} strokeWidth={ink * 0.8} fill="none" strokeLinecap="round" />
      {mouthEl}
      {e.sweat ? (
        <path d="M 282 -150 Q 307 -110 297 -90 Q 282 -70 267 -90 Q 260 -110 282 -150 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      ) : null}
    </>
  );
};
