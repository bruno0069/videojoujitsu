import React from "react";
import { Easing, interpolate, interpolateColors, Sequence } from "remotion";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { Cloud, SkyFill, Stars } from "../Sky";
import { PlacaLinhas } from "./Ep08v2";
import { clamp, n, NicoEm, on, pop, ramp, T } from "./Ep07";

// Cenários do ep10 (episódio 9: E se a gravidade desaparecesse por cinco segundos?).
// Rua de bairro carioca genérica (prédios simples, morro, coqueiro, calçada de ondinhas, barraca de
// almofadas), sem placa, marca, logotipo, mapa nem fotografia; e a Terra chapada no espaço.
// O Nico é desenhado dentro do cenário (personagens: [] na direção) para acompanhar pulo, flutuação,
// giro e queda. Tudo chapado: sem degradê, desfoque ou filtro SVG. Texto obrigatório na zona segura
// (y 230–1382, x 90–990). Números na tela: só os dígitos do contador (5…0) e "5 SEGUNDOS" (texto da cena).

type Params = Record<string, number | number[]>;
const lista = (v: number | number[] | undefined) => (Array.isArray(v) ? v : typeof v === "number" ? [v] : []);
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

const G = 1225; // linha da calçada (pés do Nico)
const S_NICO = 0.45;
const ASFALTO = interpolateColors(0.55, [0, 1], [colors.chaoSombra, colors.tinta]);

// ---------------------------------------------------------------- ContadorGravidade
// Círculo de tinta no topo com o dígito grande. `valor` muda com um "pop"; `anel` (0..1) é o
// mostrador em câmera lenta em volta (sem números).
export const CONT = { x: 540, y: 350, r: 80 };
export const ContadorGravidade: React.FC<{ valor: number; troca: number; frame: number; s?: number; anel?: number; grande?: number }> = ({ valor, troca, frame, s = 1, anel = 0, grande = 0 }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const bate = Number.isFinite(troca) && frame >= troca ? 1 + 0.18 * (1 - ramp(frame, troca, troca + 10, { ...clamp, easing: Easing.out(Easing.quad) })) : 1;
  const k = s * bate * (1 + 0.3 * grande);
  const { x, y, r } = CONT;
  const a = Math.max(0, Math.min(1, anel)) * 2 * Math.PI;
  const arco = anel > 0.001 && anel < 0.999 ? `M ${x} ${y - r - 14} A ${r + 14} ${r + 14} 0 ${a > Math.PI ? 1 : 0} 1 ${x + Math.sin(a) * (r + 14)} ${y - Math.cos(a) * (r + 14)}` : "";
  return (
    <g transform={`translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})`}>
      <circle cx={x} cy={y} r={r + 14} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      {anel >= 0.999 ? <circle cx={x} cy={y} r={r + 14} fill="none" stroke={colors.coral} strokeWidth={14} /> : null}
      {arco ? <path d={arco} fill="none" stroke={colors.coral} strokeWidth={14} strokeLinecap="round" /> : null}
      <circle cx={x} cy={y} r={r} fill={colors.tinta} />
      <circle cx={x} cy={y} r={r - 10} fill="none" stroke={colors.creme} strokeWidth={4} />
      <T x={x} y={y + 44} size={124} fill={valor === 0 ? colors.coral : colors.amarelo}>{`${valor}`}</T>
    </g>
  );
};
// valor do contador num frame: `cont0` + trocas (`trocas` cues, `valores`)
const valorContador = (frame: number, params: Params) => {
  let v = n(params.cont0, 5);
  let t = -Infinity;
  const tr = lista(params.trocas);
  const vs = lista(params.valores);
  tr.forEach((at, i) => {
    if (on(frame, at)) {
      v = vs[i] ?? v;
      t = at;
    }
  });
  return { v, t };
};

// ---------------------------------------------------------------- SorveteGenerico
// Casquinha com duas bolas (sem marca, sem texto). `derrete` 0..1: as bolas escorrem e pingam.
export const SorveteGenerico: React.FC<{ x: number; y: number; s: number; derrete?: number; frame?: number; rot?: number }> = ({ x, y, s, derrete = 0, frame = 0, rot = 0 }) => {
  const ink = useInk();
  const d = derrete;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* casquinha */}
      <path d="M -38 -10 L 38 -10 L 0 110 Z" fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M -22 14 L 14 50 M 0 -6 L 26 22 M -12 54 L 8 74" stroke={colors.muroSombra} strokeWidth={6} strokeLinecap="round" />
      {d < 0.5 ? (
        <g transform={`translate(0 ${d * 30}) scale(${1 - d * 0.4} ${1 - d * 0.9})`}>
          <circle cx={0} cy={-42} r={42} fill={colors.coralClaro} stroke={colors.tinta} strokeWidth={ink} />
          <circle cx={0} cy={-102} r={36} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        </g>
      ) : null}
      {d > 0 ? (
        <g opacity={Math.min(1, d * 2)}>
          {/* poça derretida escorrendo pela casquinha */}
          <path d={`M -46 -14 Q -50 ${10 + 30 * d} -30 ${18 + 40 * d} Q -20 ${-2 + 20 * d} -6 ${20 + 50 * d} Q 6 ${4 + 20 * d} 22 ${26 + 44 * d} Q 34 ${0 + 10 * d} 46 -14 Q 0 -40 -46 -14 Z`} fill={colors.coralClaro} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
          <path d="M -26 -24 Q 0 -36 26 -24" fill="none" stroke={colors.creme} strokeWidth={10} strokeLinecap="round" />
          {/* pingos */}
          {[0, 1, 2].map((i) => {
            const fase = ((frame + i * 13) % 39) / 39;
            return <circle key={i} cx={-24 + i * 24} cy={30 + 50 * d + fase * 120} r={7 + (i % 2) * 3} fill={i === 1 ? colors.creme : colors.coralClaro} stroke={colors.tinta} strokeWidth={ink * 0.35} opacity={d * (1 - fase)} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- CopoComGotas
// Copo genérico inclinado; as gotas viram esferas chapadas com um brilho de cor sólida.
export const Esfera: React.FC<{ x: number; y: number; r: number; achata?: number }> = ({ x, y, r, achata = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) scale(${1 + achata * 0.9} ${1 - achata * 0.75})`}>
      <circle r={r} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.45} />
      <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.28} fill={colors.branco} />
    </g>
  );
};
export const CopoComGotas: React.FC<{ x: number; y: number; s: number; inclina: number }> = ({ x, y, s, inclina }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${inclina * 40}) scale(${s})`}>
      <path d="M -50 -130 L 50 -130 L 38 0 L -38 0 Z" fill={colors.branco} fillOpacity={0.55} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${-48 + 2} ${-110 + 40 * inclina} L 46 ${-110 - 20 * inclina} L 38 -4 L -38 -4 Z`} fill={colors.ceu} />
      <path d="M -50 -130 L 50 -130 L 38 0 L -38 0 Z" fill="none" stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={-34} y={-118} width={10} height={90} rx={5} fill={colors.branco} opacity={0.8} />
    </g>
  );
};

// ---------------------------------------------------------------- SetaMovimento
export const SetaMovimento: React.FC<{ x: number; y: number; len: number; ang?: number; s?: number; cor?: string; larg?: number }> = ({ x, y, len, ang = 0, s = 1, cor = colors.amarelo, larg = 34 }) => {
  const ink = useInk();
  if (s <= 0 || len <= 0) return null;
  const h = larg / 2;
  const cab = Math.min(len * 0.6, larg * 1.4);
  return (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
      <path d={`M ${-h} 0 L ${-h} ${-(len - cab)} L ${-h * 2.1} ${-(len - cab)} L 0 ${-len} L ${h * 2.1} ${-(len - cab)} L ${h} ${-(len - cab)} L ${h} 0 Z`} fill={cor} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" />
    </g>
  );
};

// ---------------------------------------------------------------- ObjetosSoltos
export const Chinelo: React.FC<{ x: number; y: number; s: number; rot?: number; cor?: string }> = ({ x, y, s, rot = 0, cor = colors.turquesa }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-34} y={-90} width={68} height={180} rx={34} fill={cor} stroke={colors.tinta} strokeWidth={ink} />
      <path d="M -28 -40 L 0 -60 L 28 -40" fill="none" stroke={colors.creme} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
export const GuardaChuva: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -130 0 Q -130 -120 0 -120 Q 130 -120 130 0 Q 108 -22 86 0 Q 64 -22 43 0 Q 22 -22 0 0 Q -22 -22 -43 0 Q -64 -22 -86 0 Q -108 -22 -130 0 Z" fill={colors.roxo} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M -43 0 Q -40 -80 0 -120 Q 40 -80 43 0" fill="none" stroke={sombra(colors.roxo)} strokeWidth={10} />
      <path d="M 0 0 L 0 120 Q 0 150 -28 150" fill="none" stroke={colors.tinta} strokeWidth={12} strokeLinecap="round" />
    </g>
  );
};
export const Bone: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -70 0 Q -70 -80 0 -80 Q 70 -80 70 0 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M 50 0 L 140 0 Q 140 20 110 22 L 50 14 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <circle cx={0} cy={-80} r={10} fill={colors.tinta} />
    </g>
  );
};
export const Folha: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -40 0 Q 0 -34 40 0 Q 0 34 -40 0 Z" fill={colors.folha} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d="M -34 0 L 34 0" stroke={colors.folhaSombra} strokeWidth={5} />
    </g>
  );
};
export const Passarinho: React.FC<{ x: number; y: number; s: number; asa: number }> = ({ x, y, s, asa }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={40} ry={26} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d={`M -6 -6 Q -30 ${-50 * asa} -50 ${-30 * asa}`} fill="none" stroke={colors.tinta} strokeWidth={10} strokeLinecap="round" />
      <path d="M -40 0 L -64 -10 L -60 10 Z" fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 38 -4 L 56 2 L 38 8 Z" fill={colors.muro} />
      <circle cx={22} cy={-8} r={5} fill={colors.tinta} />
    </g>
  );
};
export const CarroGenerico: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -200 -40 L -190 -100 Q -180 -120 -150 -120 L -110 -120 L -60 -190 L 90 -190 L 140 -120 L 190 -112 Q 210 -108 210 -80 L 210 -40 Z" fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M -88 -126 L -50 -176 L 6 -176 L 6 -126 Z M 22 -126 L 22 -176 L 80 -176 L 116 -126 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" />
      <rect x={-210} y={-70} width={30} height={20} rx={6} fill={colors.amarelo} />
      {[-120, 120].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={-36} r={46} fill={colors.tinta} />
          <circle cx={cx} cy={-36} r={20} fill={colors.chaoSombra} />
        </g>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- SilhuetasPessoas
// Figurantes chapados, sem rosto, em cor do tema; `bracos` 0 = para baixo, 1 = para cima
export const Silhueta: React.FC<{ x: number; y: number; s: number; cor: string; bracos?: number; rot?: number }> = ({ x, y, s, cor, bracos = 0, rot = 0 }) => {
  const ink = useInk();
  const by = interpolate(bracos, [0, 1], [-230, -560]);
  const bx = interpolate(bracos, [0, 1], [150, 130]);
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d={`M -80 -470 L ${-bx} ${by} M 80 -470 L ${bx} ${by}`} stroke={colors.tinta} strokeWidth={70 + ink} strokeLinecap="round" />
      <path d={`M -80 -470 L ${-bx} ${by} M 80 -470 L ${bx} ${by}`} stroke={cor} strokeWidth={70} strokeLinecap="round" />
      <path d="M -50 -260 L -60 -20 M 50 -260 L 60 -20" stroke={colors.tinta} strokeWidth={80 + ink} strokeLinecap="round" />
      <path d="M -50 -260 L -60 -20 M 50 -260 L 60 -20" stroke={sombra(cor)} strokeWidth={80} strokeLinecap="round" />
      <rect x={-110} y={-520} width={220} height={290} rx={90} fill={cor} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={0} cy={-640} r={110} fill={cor} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

// ---------------------------------------------------------------- MonteAlmofadas e NuvemPoeira
export const MonteAlmofadas: React.FC<{ x: number; y: number; s: number; amassa?: number }> = ({ x, y, s, amassa = 0 }) => {
  const ink = useInk();
  const almofadas: [number, number, number, string][] = [
    [-120, -40, -4, colors.coral],
    [10, -50, 6, colors.amarelo],
    [130, -38, -8, colors.turquesa],
    [-60, -120, 8, colors.roxo],
    [70, -126, -6, colors.coralClaro],
    [0, -196, 3, colors.folha],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + amassa * 0.25)} ${s * (1 - amassa * 0.35)})`}>
      {almofadas.map(([ax, ay, r, c], i) => (
        <g key={i} transform={`translate(${ax} ${ay}) rotate(${r})`}>
          <path d="M -86 -36 Q -96 -48 -80 -50 Q 0 -60 80 -50 Q 96 -48 86 -36 Q 96 0 86 36 Q 96 48 80 50 Q 0 60 -80 50 Q -96 48 -86 36 Q -96 0 -86 -36 Z" fill={c} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
          <circle r={7} fill={sombra(c)} />
        </g>
      ))}
    </g>
  );
};
export const NuvemPoeira: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  const ink = useInk();
  if (k <= 0 || k >= 1) return null;
  const sai = Math.sin(k * Math.PI);
  return (
    <g opacity={Math.min(1, (1 - k) * 2.5)}>
      {[-1, 1].map((lado) =>
        [0, 1, 2].map((i) => (
          <circle key={`${lado}${i}`} cx={x + lado * (70 + i * 60) * (0.4 + k)} cy={y - 20 - i * 26 * k - sai * 30} r={(34 - i * 6) * (0.5 + sai)} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.45} />
        )),
      )}
    </g>
  );
};

// Linhas de movimento (queda): traços verticais acima do corpo
const LinhasMovimento: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) =>
  s <= 0 ? null : (
    <g opacity={Math.min(1, s)}>
      {[-60, -20, 25, 65].map((dx, i) => {
        const h = 60 + ((frame * 7 + i * 23) % 50);
        return <path key={i} d={`M ${x + dx} ${y - 30 - i * 8} L ${x + dx} ${y - 30 - i * 8 - h}`} stroke={colors.tinta} strokeWidth={9} strokeLinecap="round" />;
      })}
    </g>
  );

// ================================================================ Nico com sorvete
// Mão do sorvete (mão direita) aproximada a partir da pose do rig (unidades do rig, pés na origem)
const MAO_R: Record<string, [number, number]> = {
  andando: [170, -250],
  parado: [170, -250],
  olhando_para_cima: [172, -252],
  pulando: [250, -870],
  flutuando: [290, -620],
  mao_levantada: [300, -860],
  caindo: [290, -800],
  sentado_livre: [120, -360],
};
const NicoSorvete: React.FC<{
  x: number;
  y: number;
  s?: number;
  rot?: number;
  pose: string;
  expr: string;
  look?: [number, number];
  derrete?: number;
  frame: number;
  walkFrame?: number;
  sorvete?: boolean;
  ergue?: number;
}> = ({ x, y, s = S_NICO, rot = 0, pose, expr, look, derrete = 0, frame, walkFrame, sorvete = true, ergue = 0 }) => {
  // y = pés; a rotação gira em volta do centro do corpo (560 unidades acima dos pés)
  const cy = y - 560 * s;
  const wf = walkFrame ?? frame;
  const walk = pose === "andando" ? Math.sin((wf / 9) * Math.PI) : 0;
  const crouch = pose === "andando" ? 6 + Math.abs(walk) * 8 : pose === "sentado_livre" ? 150 : 0;
  const m = MAO_R[pose] ?? [170, -250];
  const mx = m[0];
  const my = m[1] + crouch - walk * 20 - ergue * 160;
  return (
    <g transform={`translate(${x} ${cy}) rotate(${rot})`}>
      <NicoEm x={0} y={560 * s} s={s} pose={pose} expression={expr} look={look} />
      {sorvete ? <SorveteGenerico x={mx * s + 6} y={(my + 560) * s - 40} s={s * 1.25} derrete={derrete} frame={frame} rot={pose === "andando" || pose === "parado" ? -8 : 0} /> : null}
    </g>
  );
};

// ================================================================ rua_bairro_dia
// Morro, prédios simples do outro lado da rua, asfalto, calçada de ondinhas e a barraca de
// almofadas à direita. `t` = relógio para nuvens/folhas.
const PREDIOS: [number, number, number, string][] = [
  [-260, 300, 420, colors.muro],
  [60, 220, 520, colors.creme],
  [300, 260, 380, colors.coralClaro],
  [580, 230, 470, colors.chaoSombra],
  [830, 300, 400, colors.muro],
  [1150, 260, 500, colors.creme],
];
const Rua: React.FC<{ t: number }> = ({ t }) => {
  const ink = useInk();
  const BASE = 960; // pé dos prédios (outro lado da rua)
  return (
    <g>
      <SkyFill color={colors.ceu} />
      <Cloud x={160 + ((t * 0.3) % 40)} y={540} s={0.7} />
      <Cloud x={880 - ((t * 0.2) % 30)} y={620} s={0.55} />
      {/* morro genérico */}
      <path d="M -400 960 Q -200 560 60 640 Q 300 700 420 600 Q 560 480 760 620 Q 980 760 1500 640 L 1500 980 L -400 980 Z" fill={colors.folhaSombra} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      {PREDIOS.map(([x, w, h, c], i) => (
        <g key={i}>
          <rect x={x} y={BASE - h} width={w} height={h} fill={c} stroke={colors.tinta} strokeWidth={ink * 0.8} />
          {Array.from({ length: Math.floor((h - 60) / 90) }, (_, r) =>
            Array.from({ length: Math.floor((w - 40) / 70) }, (_, cc) => (
              <rect key={`${r}-${cc}`} x={x + 30 + cc * 70} y={BASE - h + 36 + r * 90} width={40} height={50} rx={6} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.45} />
            )),
          )}
        </g>
      ))}
      {/* asfalto */}
      <rect x={-600} y={BASE} width={2280} height={200} fill={ASFALTO} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={-560 + i * 200} y={BASE + 92} width={110} height={14} rx={7} fill={colors.creme} opacity={0.8} />
      ))}
      {/* meio-fio e calçada de ondinhas */}
      <rect x={-600} y={BASE + 190} width={2280} height={24} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <rect x={-600} y={BASE + 214} width={2280} height={1400} fill={colors.creme} />
      {Array.from({ length: 8 }, (_, r) => (
        <path
          key={r}
          d={`M -600 ${BASE + 270 + r * 90} ${Array.from({ length: 24 }, () => `q 50 -34 100 0`).join(" ")}`}
          fill="none"
          stroke={colors.tinta}
          strokeWidth={14}
          opacity={0.85}
        />
      ))}
    </g>
  );
};
// Poste e coqueiro na calçada (camada da frente, atrás do Nico)
const Calcada: React.FC<{ t: number; folhasSoltas: number }> = ({ t, folhasSoltas }) => {
  const ink = useInk();
  const sway = Math.sin((2 * Math.PI * t * 10) / 2400) * 3;
  return (
    <g>
      {/* coqueiro */}
      <path d={`M 40 ${G} Q 70 ${G - 300} ${30 + sway} ${G - 560}`} fill="none" stroke={colors.tinta} strokeWidth={46 + ink} strokeLinecap="round" />
      <path d={`M 40 ${G} Q 70 ${G - 300} ${30 + sway} ${G - 560}`} fill="none" stroke={colors.muroSombra} strokeWidth={46} strokeLinecap="round" />
      {[-150, -95, -35, 30, 90, 150].map((a, i) =>
        i < 6 - folhasSoltas ? (
          <path key={a} d={`M ${30 + sway} ${G - 560} q ${Math.sin((a * Math.PI) / 180) * 120} ${-60 - Math.cos((a * Math.PI) / 180) * 40} ${Math.sin((a * Math.PI) / 180) * 210} ${30 - Math.cos((a * Math.PI) / 180) * 70}`} fill="none" stroke={colors.folha} strokeWidth={34} strokeLinecap="round" />
        ) : null,
      )}
      {/* poste */}
      <rect x={1000} y={G - 640} width={22} height={640} rx={8} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d={`M 1011 ${G - 630} Q 1011 ${G - 690} 950 ${G - 690}`} fill="none" stroke={colors.tinta} strokeWidth={14} strokeLinecap="round" />
      <rect x={918} y={G - 700} width={60} height={26} rx={10} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.5} />
    </g>
  );
};
// Barraca de almofadas (lojinha de sofá genérica na calçada): toldo listrado, sofá, sem texto
const Barraca: React.FC<{ amassa: number }> = ({ amassa }) => {
  const ink = useInk();
  const X = 640;
  const W = 360;
  return (
    <g>
      <rect x={X + 16} y={G - 330} width={14} height={330} fill={colors.tinta} />
      <rect x={X + W - 30} y={G - 330} width={14} height={330} fill={colors.tinta} />
      <path d={`M ${X - 10} ${G - 330} L ${X + W + 10} ${G - 330} L ${X + W + 30} ${G - 280} L ${X - 30} ${G - 280} Z`} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M ${X - 10 + i * 64 + 6} ${G - 330} L ${X - 10 + i * 64 + 38} ${G - 330} L ${X - 30 + i * 70 + 46} ${G - 280} L ${X - 30 + i * 70 + 8} ${G - 280} Z`} fill={colors.coral} />
      ))}
      <path d={`M ${X - 30} ${G - 280} ${Array.from({ length: 7 }, () => "q 30 30 60 0").join(" ")}`} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      {/* sofá */}
      <rect x={X + 40} y={G - 170} width={280} height={110} rx={30} fill={colors.roxo} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      <rect x={X + 24} y={G - 110} width={312} height={70} rx={26} fill={sombra(colors.roxo)} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      <rect x={X + 40} y={G - 40} width={20} height={40} fill={colors.tinta} />
      <rect x={X + 300} y={G - 40} width={20} height={40} fill={colors.tinta} />
      <MonteAlmofadas x={X + 190} y={G + 10} s={0.62} amassa={amassa} />
    </g>
  );
};

// Onda chapada pequena ("E os oceanos?")
const OndaCanto: React.FC<{ x: number; y: number; s: number; frame: number }> = ({ x, y, s, frame }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const b = Math.sin(frame / 6) * 6;
  return (
    <g transform={`translate(${x} ${y + b}) scale(${s})`}>
      <path d="M -120 40 Q -110 -60 -20 -70 Q 70 -76 90 -10 Q 50 -40 20 -10 Q 0 10 30 30 L 120 40 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M -60 -30 Q -20 -56 30 -48" fill="none" stroke={colors.branco} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

// Régua sem números (só traços) que cresce ao lado do pulo
const ReguaSemNumeros: React.FC<{ x: number; y: number; h: number; s: number }> = ({ x, y, h, s }) => {
  const ink = useInk();
  if (s <= 0 || h <= 4) return null;
  return (
    <g opacity={Math.min(1, s)}>
      <rect x={x - 14} y={y - h} width={28} height={h} rx={8} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.5} />
      {Array.from({ length: Math.floor(h / 24) }, (_, i) => (
        <path key={i} d={`M ${x - 14} ${y - 12 - i * 24} L ${x + (i % 2 ? 0 : 6)} ${y - 12 - i * 24}`} stroke={colors.tinta} strokeWidth={5} />
      ))}
    </g>
  );
};

// ----------------------------------------------------------------- figurantes e objetos da cena 3
const FIGS: [number, number, string, number][] = [
  [-120, 0.34, colors.noite, 0],
  [140, 0.3, colors.folhaSombra, 12],
  [930, 0.32, colors.muroSombra, 6],
  [1180, 0.36, colors.roxo, 20],
];

// ================================================================ RuaBairro (cenas 1, 2, 3, 4, 6, 7)
// `modo`: 1 gancho, 2 surpresa, 3 todo_mundo, 4 agua, 6 volta, 7 fecho. Contador: `cont0`,
// `trocas`/`valores`, `contDe`/`contAte`, `anelDe`/`anelAte` (mostrador lento), `grande` (pulso).
export const RuaBairro: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Params }> = ({ cam, frame: f, globalFrame: g, params }) => {
  const modo = n(params.modo, 1);
  const ink = useInk();
  const { v, t: troca } = valorContador(f, params);
  const anel = n(params.anelIni, 0) + (n(params.anelFim, 1) - n(params.anelIni, 0)) * ramp(f, n(params.anelDe), n(params.anelAte));
  const contS = on(f, n(params.contAte)) ? 0 : on(f, n(params.contDe, 0)) ? 1 : 0;
  const grande = n(params.grande) < Infinity ? Math.sin(Math.PI * ramp(f, n(params.grande), n(params.grande) + 24)) : 0;

  // ------------------------------------------------ estado de cada cena
  let nico: React.ReactNode = null;
  let extra: React.ReactNode = null;
  let frente: React.ReactNode = null;
  let passaro: React.ReactNode = null;
  let folhasSoltas = 0;
  let amassa = 0;
  let carroDy = 0;
  let carroRot = 0;
  let rodape: React.ReactNode = null;

  const congela = n(params.congela);
  // pássaro e folhas voando (congelam em `congela`; no fecho, voltam ao quadro do gancho)
  const voo = (tf: number) => (
    <>
      <Passarinho x={880 - tf * 2.2} y={700 + Math.sin(tf / 5) * 6} s={0.7} asa={Math.abs(Math.sin(tf / 3))} />
      <Folha x={260 + tf * 0.8} y={740 + tf * 1.1} s={0.9} rot={20 + tf * 3} />
      <Folha x={560 - tf * 0.6} y={680 + tf * 1.3} s={0.75} rot={-30 - tf * 2} />
    </>
  );

  if (modo === 1) {
    // gancho: Nico anda; em `congela` o mundo para; olha em volta
    const tf = Math.min(f, Number.isFinite(congela) ? congela : f);
    const x = 330 + tf * 0.6;
    const parou = on(f, congela);
    const expr = on(f, n(params.oceanos)) ? "surpresa" : on(f, n(params.voando)) ? "confusao" : parou ? "atento" : "neutro";
    const look: [number, number] | undefined = parou ? [Math.sin((f - congela) / 14) * 0.9, -0.3] : undefined;
    nico = <NicoSorvete x={x} y={G} pose={parou ? "parado" : "andando"} expr={expr} look={look} frame={f} />;
    passaro = voo(tf);
    carroDy = on(f, n(params.carros)) ? -Math.abs(Math.sin((f - n(params.carros)) / 5)) * 10 * (1 - ramp(f, n(params.carros) + 30, n(params.carros) + 50)) : 0;
    carroRot = carroDy * 0.3;
    extra = <OndaCanto x={190} y={1110} s={pop(f, n(params.oceanos), true)} frame={f} />;
  } else if (modo === 2) {
    // surpresa: pulinho que não para de subir devagar; seta para cima; régua sem números
    const pula = n(params.pula);
    const agacha = on(f, pula - 8) && !on(f, pula) ? Math.sin(Math.PI * ramp(f, pula - 8, pula)) * 14 : 0;
    const sobe = on(f, pula) ? 26 * ramp(f, pula, pula + 8, { ...clamp, easing: Easing.out(Easing.quad) }) + (f - pula) * 0.2 : 0;
    const x = 387;
    const y = G + agacha - sobe;
    const expr = on(f, n(params.camera)) ? "preocupacao" : on(f, n(params.baixo)) ? "medo" : on(f, pula) ? "surpresa" : "atento";
    const look: [number, number] | undefined = on(f, n(params.camera)) ? [0, 0] : on(f, n(params.baixo)) ? [0.1, 0.9] : undefined;
    nico = <NicoSorvete x={x} y={y} pose={on(f, pula) ? "pulando" : "parado"} expr={expr} look={look} frame={f} />;
    const seta = pop(f, n(params.seta));
    const alonga = ramp(f, n(params.problemao), n(params.problemao) + 16, { ...clamp, easing: Easing.out(Easing.back(1.6)) });
    extra = (
      <>
        <ReguaSemNumeros x={x - 160} y={G} h={sobe} s={on(f, pula + 10) ? 1 : 0} />
        <path d={`M ${x - 190} ${G} L ${x - 130} ${G}`} stroke={colors.tinta} strokeWidth={8} opacity={on(f, pula + 10) ? 1 : 0} />
        <SetaMovimento x={x + 190} y={y - 220} len={110 + 170 * alonga} s={seta} />
      </>
    );
    passaro = voo(n(params.congelaAntes, 95));
  } else if (modo === 3) {
    // todo_mundo: Nico continua subindo; figurantes e objetos sobem aos poucos
    const y0 = n(params.y0, 140);
    const subir = y0 + f * 0.75;
    const x = 387 + f * 0.08;
    nico = <NicoSorvete x={x} y={G - subir} pose="pulando" expr={on(f, n(params.desce)) ? "medo" : "surpresa"} look={on(f, n(params.desce)) ? [0.1, 0.9] : [0.4, -0.6]} frame={f} rot={Math.sin(f / 20) * 4} />;
    const p = pop(f, n(params.pessoas));
    const o = n(params.objetos);
    extra = (
      <>
        {FIGS.map(([fx, s, c, d], i) =>
          p > 0 ? (
            <g key={i} opacity={Math.min(1, p)}>
              <Silhueta x={fx} y={G + 30 - Math.max(0, f - n(params.pessoas) - d) * (0.55 + i * 0.12)} s={s} cor={c} bracos={0.9} rot={Math.sin((f + i * 20) / 18) * 6} />
            </g>
          ) : null,
        )}
        {on(f, o) ? (
          <>
            <Chinelo x={250} y={G - 20 - (f - o) * 0.9} s={0.32} rot={(f - o) * 2} />
            <Chinelo x={330} y={G - 10 - (f - o) * 0.7} s={0.32} rot={40 - (f - o) * 1.5} cor={colors.coral} />
            <GuardaChuva x={720} y={G - 60 - (f - o) * 0.8} s={0.45} rot={-20 + (f - o) * 0.8} />
            <Bone x={560} y={G - 30 - (f - o) * 1.0} s={0.42} rot={(f - o) * 1.8} />
          </>
        ) : null}
      </>
    );
    passaro = voo(n(params.congelaAntes, 95));
  } else if (modo === 4) {
    // agua: copo na mesinha do quiosque; gotas viram esferas; Nico tenta pegar e gira de cabeça para baixo
    const gotas = n(params.gotas);
    const inclina = ramp(f, n(params.copo), n(params.copo) + 14);
    const gira = ramp(f, n(params.gira), n(params.giraAte), suave);
    const pega = on(f, n(params.pega));
    const expr = on(f, n(params.ironia)) ? "malandro" : on(f, n(params.gira)) ? "susto" : pega ? "curiosidade" : "surpresa";
    nico = (
      <NicoSorvete
        x={610 + Math.sin(f / 16) * 10}
        y={1090 + Math.sin(f / 12) * 8 - gira * 0}
        s={0.44}
        rot={gira * 180 + Math.sin(f / 15) * 3}
        pose={pega && !on(f, n(params.gira)) ? "mao_levantada" : "flutuando"}
        expr={expr}
        look={on(f, n(params.ironia)) ? [0, 0] : [-0.8, 0.2]}
        frame={f}
      />
    );
    const esferas = [
      [300, 780, 30],
      [400, 700, 22],
      [470, 840, 26],
      [360, 900, 16],
      [520, 660, 18],
      [240, 680, 14],
    ];
    extra = (
      <>
        {/* mesinha do quiosque */}
        <rect x={120} y={1060} width={300} height={30} rx={10} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink * 0.7} />
        <rect x={258} y={1090} width={24} height={135} fill={colors.tinta} />
        <rect x={190} y={1210} width={160} height={18} rx={8} fill={colors.tinta} />
        <CopoComGotas x={270} y={1060} s={0.85} inclina={inclina} />
        {esferas.map(([ex, ey, r], i) => {
          const k = ramp(f, gotas + i * 6, gotas + i * 6 + 40, { ...clamp, easing: Easing.out(Easing.quad) });
          if (k <= 0) return null;
          const bx = 300 + (ex - 300) * k + Math.sin((f + i * 30) / 20) * 8;
          const by = 960 + (ey - 960) * k + Math.cos((f + i * 25) / 22) * 8;
          return <Esfera key={i} x={bx} y={by} r={r * (0.4 + 0.6 * k)} />;
        })}
      </>
    );
    passaro = voo(n(params.congelaAntes, 95));
  } else if (modo === 6) {
    // volta: tudo despenca; Nico cai de braços abertos nas almofadas; poeira; tremor (na direção)
    const cai = n(params.cai);
    const pousa = n(params.pousa);
    const q = ramp(f, cai, pousa, { ...clamp, easing: Easing.in(Easing.quad) });
    const pousou = on(f, pousa);
    const x0 = 520;
    const y0 = G - 160;
    const xL = 830;
    const yL = G - 70;
    const nx = pousou ? xL : x0 + (xL - x0) * q;
    const ny = pousou ? yL : y0 + (yL - y0) * q + (on(f, cai) ? 0 : Math.sin(f / 9) * 8);
    amassa = pousou ? Math.max(0, Math.sin(Math.PI * ramp(f, pousa, pousa + 12)) * 1 - ramp(f, pousa + 12, pousa + 30) * 0) : 0;
    const expr = on(f, n(params.zonzo)) ? "confusao" : on(f, cai) ? "susto" : "medo";
    nico = pousou ? (
      <NicoSorvete x={nx} y={ny + amassa * 20} pose="sentado_livre" expr={expr} frame={f} derrete={ramp(f, pousa, pousa + 40)} rot={Math.sin(Math.PI * ramp(f, pousa, pousa + 20)) * -8} />
    ) : (
      <NicoSorvete x={nx} y={ny} pose="caindo" expr={expr} frame={f} rot={q * 8} />
    );
    const objetos = (ox: number, oy: number, i: number) => {
      const qq = ramp(f, cai + i * 3, pousa - 4 + i * 3, { ...clamp, easing: Easing.in(Easing.quad) });
      return { y: oy + (G - 20 - oy) * qq, chao: qq >= 1 };
    };
    const c1 = objetos(250, G - 420, 0);
    const c2 = objetos(330, G - 380, 1);
    const gc = objetos(150, G - 470, 2);
    const bo = objetos(560, G - 520, 3);
    extra = (
      <>
        <Chinelo x={250} y={c1.y} s={0.32} rot={c1.chao ? 90 : 30} />
        <Chinelo x={330} y={c2.y} s={0.32} rot={c2.chao ? 80 : -20} cor={colors.coral} />
        <GuardaChuva x={150} y={gc.chao ? G - 40 : gc.y} s={0.45} rot={gc.chao ? 70 : -10} />
        <Bone x={560} y={bo.y} s={0.42} rot={bo.chao ? 0 : 25} />
        {[
          [420, G - 560, 22],
          [620, G - 600, 18],
          [700, G - 470, 26],
        ].map(([ex, ey, r], i) => {
          const qq = ramp(f, cai + i * 4, pousa + i * 4, { ...clamp, easing: Easing.in(Easing.quad) });
          return qq >= 1 ? <ellipse key={i} cx={ex} cy={G + 4} rx={r * 1.8} ry={r * 0.45} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.4} /> : <Esfera key={i} x={ex} y={ey + (G - ey) * qq} r={r} achata={0} />;
        })}
        {!pousou ? <LinhasMovimento x={nx} y={ny - 560 * S_NICO - 260 * S_NICO} s={on(f, cai) ? 1 : 0} frame={f} /> : null}
      </>
    );
    frente = <NuvemPoeira x={xL} y={G + 10} k={ramp(f, pousa, pousa + 26)} />;
    rodape = <PlacaLinhas linhas={["É ANIMAÇÃO. NÃO REPRODUZA."]} y={478} s={1} cor={colors.coral} tinta={colors.creme} size={40} />;
    passaro = null;
  } else if (modo === 7) {
    // fecho: sentado entre as almofadas, ergue o sorvete derretido; nos últimos 20 frames, corte
    // seco para o quadro do gancho (anda pela rua, sorvete inteiro, contador em 5)
    const corte = n(params.corte);
    if (on(f, corte)) {
      const tf = f - n(params.fim, 329); // ≤ 0, chega a 0 no último frame
      nico = (
        <Sequence from={n(params.fim, 329) - 36} layout="none">
          <NicoSorvete x={330 + tf * 0.6} y={G} pose="andando" expr="neutro" frame={f} walkFrame={f - (n(params.fim, 329) - 36)} />
        </Sequence>
      );
      passaro = voo(tf);
    } else {
      const ergue = ramp(f, n(params.ergue), n(params.ergue) + 14, { ...clamp, easing: Easing.out(Easing.back(1.5)) });
      const expr = on(f, n(params.camera)) ? "vergonha" : "medo";
      nico = <NicoSorvete x={830} y={G - 70} pose="sentado_livre" expr={expr} look={on(f, n(params.camera)) ? [0, 0.1] : [-0.6, -0.2]} frame={f} derrete={1} ergue={ergue} />;
      folhasSoltas = 0;
    }
  }

  return (
    <>
      <Layer cam={cam} depth={1}>
        <Rua t={g} />
        <g transform={`translate(0 ${carroDy}) rotate(${carroRot} 360 1150)`}>
          <CarroGenerico x={360} y={1152} s={0.62} />
        </g>
        <Calcada t={g} folhasSoltas={folhasSoltas} />
        <Barraca amassa={amassa} />
        {passaro}
        {extra}
        {nico}
        {frente}
      </Layer>
      {rodape}
      <ContadorGravidade valor={v} troca={troca} frame={f} s={contS} anel={anel} grande={grande} />
    </>
  );
};

// ================================================================ terra_espaco (cena 5)
// TerraChapada: disco com oceanos, continentes genéricos (manchas, não um mapa) e faixa fina de
// atmosfera. `setas`: setas curtas e discretas nos oceanos e na atmosfera (o movimento só começa).
const MANCHAS = [
  "M -150 -120 Q -60 -190 30 -140 Q 70 -90 10 -50 Q -40 -20 -90 -40 Q -170 -60 -150 -120 Z",
  "M 60 20 Q 150 -10 190 60 Q 200 140 120 170 Q 60 150 70 100 Q 30 60 60 20 Z",
  "M -200 60 Q -140 40 -110 90 Q -100 150 -160 170 Q -220 140 -200 60 Z",
];
export const TerraChapada: React.FC<{ x: number; y: number; r: number; giro: number; frame: number; setas: number }> = ({ x, y, r, giro, frame, setas }) => {
  const ink = useInk();
  const id = "terra-recorte";
  return (
    <g>
      {/* atmosfera: faixa fina, uma cor lisa */}
      <circle cx={x} cy={y} r={r + 22} fill={colors.ceu} opacity={0.35} />
      <circle cx={x} cy={y} r={r} fill={colors.ceuMeio} stroke={colors.tinta} strokeWidth={ink} />
      <clipPath id={id}>
        <circle cx={x} cy={y} r={r - 4} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <circle cx={x} cy={y} r={r} fill={colors.ceu} />
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${x + ((giro + k) % 2) * 2 * r - r * 1.2} ${y}) scale(${r / 300})`}>
            {MANCHAS.map((d, i) => (
              <path key={i} d={d} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" />
            ))}
          </g>
        ))}
        {/* nuvens chapadas que se mexem de leve */}
        {[
          [-0.4, -0.55, 70],
          [0.35, -0.2, 90],
          [-0.1, 0.5, 80],
        ].map(([cx, cy, w], i) => (
          <rect key={i} x={x + cx * r + Math.sin((frame + i * 40) / 30) * 14 - w / 2} y={y + cy * r} width={w} height={22} rx={11} fill={colors.branco} opacity={0.9} />
        ))}
      </g>
      {/* setas curtas e discretas (tamanhos diferentes) */}
      {setas > 0
        ? [
            [-0.62, -0.62, 40],
            [0.2, -0.95, 30],
            [0.78, -0.45, 46],
            [-0.9, 0.1, 28],
            [0.5, 0.55, 34],
          ].map(([ax, ay, len], i) => {
            const ang = (Math.atan2(ay, ax) * 180) / Math.PI + 90;
            const k = ramp(setas, i * 0.12, i * 0.12 + 0.4);
            return <SetaMovimento key={i} x={x + ax * (r + 30)} y={y + ay * (r + 30)} len={len * 1.5 * k} ang={ang} larg={22} cor={colors.amarelo} />;
          })
        : null}
    </g>
  );
};
export const TerraEspaco: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame: f, params }) => {
  const { v, t: troca } = valorContador(f, params);
  const anel = n(params.anelIni, 0) + (n(params.anelFim, 1) - n(params.anelIni, 0)) * ramp(f, n(params.anelDe), n(params.anelAte));
  const setas = ramp(f, n(params.setas), n(params.setas) + 40);
  return (
    <>
      <Layer cam={cam} depth={1}>
        <SkyFill color={colors.noite} />
        <Stars frame={f} opacity={1} />
        <TerraChapada x={590} y={960} r={250} giro={f / 900} frame={f} setas={setas} />
        <NicoSorvete x={150} y={1250 + Math.sin(f / 10) * 6} s={0.3} pose="flutuando" expr={on(f, n(params.setas)) ? "curiosidade" : "atento"} look={[0.8, -0.3]} frame={f} rot={Math.sin(f / 25) * 6} />
      </Layer>
      <ContadorGravidade valor={v} troca={troca} frame={f} anel={anel} />
    </>
  );
};
