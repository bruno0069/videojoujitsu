import React, { useId } from "react";
import { Easing, interpolate, spring } from "remotion";
import { colors, fonts, loopPhase, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { InfoLabel } from "../elements/Props";
import { Sun } from "../elements/Sun";
import { useLoopFrames } from "../GlobalFrame";
import { useInk } from "../Ink";
import { Cloud, MilkyWay, SkyFill, Stars } from "../Sky";

// Cenários do ep03 (E se o Nico tivesse que sair da Terra amanhã?). Mesma paleta, mesmo traço
// e as mesmas peças dos episódios 1 e 2 (céu, nuvens, estrelas, globo, rótulos); só os lugares
// são novos. `frame` é o frame da cena; os parâmetros vêm de `fundo` na direção, em frames.

const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;
const pop = (frame: number, at: number) =>
  Number.isFinite(at) && frame >= at ? spring({ frame: frame - at, fps: 30, config: { damping: 9, mass: 0.6, stiffness: 170 } }) : 0;

// ---------------------------------------------------------------- quarto_dia
// Quarto do Nico: janela à esquerda, pôster, cama à direita com a mala aberta.
// `casaco`, `celular`, `escova`: frames em que cada coisa entra na mala (sem cue = já está lá
// se `cheia` = 1, senão não aparece); `tiraCelular`: o celular sai da mala.
export const QUARTO_DEPTH = 0.8;
export const MALA = { x: 900, y: 1075, w: 300 }; // centro da base e largura
export const QuartoDia: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Record<string, number | number[]> }> = ({
  cam,
  frame,
  globalFrame,
  params,
}) => (
  <>
    <Layer cam={cam} depth={0.6}>
      <ParedeQuarto frame={frame} globalFrame={globalFrame} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <PisoQuarto />
    </Layer>
    <Layer cam={cam} depth={QUARTO_DEPTH}>
      <Cama />
      <Mala frame={frame} params={params} />
    </Layer>
  </>
);

const ParedeQuarto: React.FC<{ frame: number; globalFrame: number }> = ({ globalFrame }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const loopFrames = useLoopFrames();
  const j = { x: 60, y: 380, w: 380, h: 480 };
  const cloudX = j.x + 40 + loopPhase(globalFrame, 1, loopFrames) * (j.w - 80);
  return (
    <g>
      <rect x={-1000} y={-1000} width={3080} height={3700} fill={colors.creme} />
      <rect x={-1000} y={1180} width={3080} height={36} fill={sombra(colors.creme)} stroke={colors.tinta} strokeWidth={ink} />
      {/* janela */}
      <clipPath id={`jq-${id}`}>
        <rect x={j.x} y={j.y} width={j.w} height={j.h} />
      </clipPath>
      <g clipPath={`url(#jq-${id})`}>
        <SkyFill color={colors.ceu} />
        <Cloud x={cloudX} y={j.y + 120} s={0.55} />
        <rect x={j.x} y={j.y + j.h - 70} width={j.w} height={70} fill={colors.folha} />
      </g>
      <rect x={j.x} y={j.y} width={j.w} height={j.h} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.4} />
      <rect x={j.x} y={j.y} width={j.w} height={j.h} fill="none" stroke={colors.creme} strokeWidth={ink * 1.2} />
      <path d={`M ${j.x + j.w / 2} ${j.y} L ${j.x + j.w / 2} ${j.y + j.h}`} stroke={colors.tinta} strokeWidth={ink * 1.2} />
      <rect x={j.x - 24} y={j.y + j.h} width={j.w + 48} height={30} rx={8} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
      {/* pôster de foguete */}
      <g transform="translate(760 330) rotate(3)">
        <rect x={-120} y={-150} width={240} height={300} rx={10} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
        <circle cx={60} cy={-80} r={34} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        <path d="M 0 -90 C 30 -60 34 0 26 60 L -26 60 C -34 0 -30 -60 0 -90 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
        <path d="M -26 30 L -52 80 L -24 66 Z M 26 30 L 52 80 L 24 66 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" />
        <circle cx={0} cy={-20} r={12} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.5} />
        <path d="M -14 64 Q 0 120 14 64 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.5} />
      </g>
    </g>
  );
};

const PisoQuarto: React.FC = () => {
  const ink = useInk();
  return <rect x={-1000} y={1300} width={3080} height={1400} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />;
};

const Cama: React.FC = () => {
  const ink = useInk();
  return (
    <g>
      <rect x={1180} y={760} width={60} height={560} rx={14} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={560} y={1080} width={660} height={150} rx={20} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={560} y={1120} width={660} height={190} rx={20} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={560} y={1120} width={90} height={190} rx={20} fill={sombra(colors.ceu)} />
      <rect x={560} y={1290} width={660} height={60} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Mala: React.FC<{ frame: number; params: Record<string, number | number[]> }> = ({ frame, params }) => {
  const ink = useInk();
  const { x, y, w } = MALA;
  const h = 110;
  const cheia = params.cheia === 1;
  const item = (key: string) => (cheia ? 1 : pop(frame, n(params[key])));
  const tira = n(params.tiraCelular);
  const sai = ramp(frame, tira, tira + 16, { ...clamp, easing: Easing.in(Easing.quad) });
  const casaco = item("casaco");
  const celular = item("celular");
  const escova = item("escova");
  return (
    <g>
      {/* tampa aberta, encostada atrás */}
      <path d={`M ${x - w / 2 + 6} ${y - h} L ${x - w / 2 + 30} ${y - h - 190} L ${x + w / 2 - 30} ${y - h - 190} L ${x + w / 2 - 6} ${y - h} Z`} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d={`M ${x - w / 2 + 40} ${y - h - 20} L ${x - w / 2 + 52} ${y - h - 170} L ${x + w / 2 - 52} ${y - h - 170} L ${x + w / 2 - 40} ${y - h - 20} Z`} fill={sombra(colors.roxo)} />
      {/* coisas dentro da mala (aparecem por cima da borda) */}
      {casaco > 0 ? (
        <g transform={`translate(${x - 80} ${y - h + 6}) scale(${casaco})`}>
          <path d="M -60 0 L -46 -56 L -16 -70 L 0 -54 L 16 -70 L 46 -56 L 60 0 Z" fill={colors.folhaSombra} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
          <path d="M 0 -54 L 0 0" stroke={colors.tinta} strokeWidth={ink * 0.6} />
        </g>
      ) : null}
      {escova > 0 ? (
        <g transform={`translate(${x + 95} ${y - h + 2}) rotate(-35) scale(${escova})`}>
          <rect x={-8} y={-120} width={16} height={120} rx={8} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          <rect x={-12} y={-160} width={24} height={44} rx={6} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        </g>
      ) : null}
      {celular > 0 && sai < 1 ? (
        <g transform={`translate(${x + 20 - 260 * sai} ${y - h - 10 - 220 * sai}) rotate(${-12 - 20 * sai}) scale(${celular})`} opacity={1 - sai * 0.4}>
          <rect x={-26} y={-48} width={52} height={96} rx={10} fill={colors.tinta} />
          <rect x={-19} y={-38} width={38} height={72} rx={5} fill={colors.ceu} />
        </g>
      ) : null}
      {/* base da mala */}
      <rect x={x - w / 2} y={y - h} width={w} height={h} rx={14} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={x - w / 2} y={y - h + 30} width={w} height={14} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.5} />
      <rect x={x - 30} y={y - h - 2} width={60} height={14} rx={6} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.5} />
    </g>
  );
};

// ---------------------------------------------------------------- diagrama_espaco
// Reaproveita o fundo de espaço dos diagramas do ep01/ep02 (céu noite + Via Láctea + estrelas)
// e o globo; novo é só Marte, a linha pontilhada e o aviãozinho.
// `aviao`: o avião sai da Terra pela linha; `some`: ele some no meio do caminho (puf).
export const ESPACO = {
  terra: { x: 250, y: 1060, r: 120 },
  marte: { x: 820, y: 560, r: 90 },
  ctrl: { x: 980, y: 1180 },
};
const arco = (t: number) => {
  const a = { x: ESPACO.terra.x + 110, y: ESPACO.terra.y - 40 };
  const b = { x: ESPACO.marte.x + 10, y: ESPACO.marte.y + 95 };
  const c = ESPACO.ctrl;
  const u = 1 - t;
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
    dx: 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x),
    dy: 2 * u * (c.y - a.y) + 2 * t * (b.y - c.y),
  };
};
export const DiagramaEspaco: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const e = ESPACO;
  const aviao = n(params.aviao);
  const some = n(params.some, aviao + 40);
  const t = 0.42 * ramp(frame, aviao, some, { ...clamp, easing: Easing.out(Easing.quad) });
  const p = arco(t);
  const ang = (Math.atan2(p.dy, p.dx) * 180) / Math.PI;
  const fade = 1 - ramp(frame, some, some + 8);
  const puff = ramp(frame, some, some + 14);
  const pts = Array.from({ length: 41 }, (_, i) => arco(i / 40));
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <path d={`M ${pts.map((q) => `${q.x} ${q.y}`).join(" L ")}`} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.9} strokeDasharray={`${ink * 1.6} ${ink * 1.2}`} strokeLinecap="round" />
        <Globe x={e.terra.x} y={e.terra.y} r={e.terra.r} lon={-50 - frame * 0.6} />
        <Marte x={e.marte.x} y={e.marte.y} r={e.marte.r} />
        <InfoLabel x={e.terra.x} y={e.terra.y - e.terra.r - 60} text="Terra" />
        <InfoLabel x={e.marte.x} y={e.marte.y - e.marte.r - 60} text="Marte" />
        {Number.isFinite(aviao) && frame >= aviao && fade > 0 ? (
          <g transform={`translate(${p.x} ${p.y}) rotate(${ang}) scale(${fade})`}>
            <Aviao />
          </g>
        ) : null}
        {puff > 0 && puff < 1 ? (
          <g transform={`translate(${p.x} ${p.y})`} opacity={1 - puff}>
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} cx={Math.cos(i * 1.26) * 60 * puff} cy={Math.sin(i * 1.26) * 60 * puff} r={22 * (1 - puff * 0.5)} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.5} />
            ))}
          </g>
        ) : null}
      </Layer>
    </>
  );
};

const Marte: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  return (
    <g transform={`translate(${x} ${y})`}>
      <clipPath id={`marte-${id}`}>
        <circle r={r} />
      </clipPath>
      <circle r={r} fill={colors.muroSombra} />
      <g clipPath={`url(#marte-${id})`}>
        <circle cx={-r * 0.35} cy={-r * 0.2} r={r * 0.22} fill={sombra(colors.muroSombra)} />
        <circle cx={r * 0.3} cy={r * 0.35} r={r * 0.16} fill={sombra(colors.muroSombra)} />
        <circle cx={r * 0.45} cy={-r * 0.45} r={r * 0.1} fill={sombra(colors.muroSombra)} />
        <path d={`M ${r * 0.2} ${-r * 1.2} A ${r} ${r} 0 0 1 ${r * 0.2} ${r * 1.2} L ${r * 1.3} ${r * 1.3} L ${r * 1.3} ${-r * 1.3} Z`} fill={colors.tinta} opacity={0.18} />
      </g>
      <circle r={r} fill="none" stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Aviao: React.FC = () => {
  const ink = useInk();
  return (
    <g stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round">
      <path d="M -50 -6 L 40 -8 Q 58 0 40 8 L -50 6 Z" fill={colors.creme} />
      <path d="M -6 -6 L -26 -46 L -10 -46 L 16 -6 Z M -6 6 L -26 46 L -10 46 L 16 6 Z" fill={colors.coral} />
      <path d="M -50 -6 L -62 -26 L -52 -26 L -38 -6 Z" fill={colors.coral} />
    </g>
  );
};

// ---------------------------------------------------------------- capsula_interior
// Cápsula apertada: paredes com painéis, uma escotilha com a Terra ficando pequena e um
// calendário na parede. `calendario`: frame em que os dias começam a passar; `dias`: total
// (padrão 228, ≈ 7 meses e meio); `calendarioAte`: frame em que chega ao total (acelera).
export const CALENDARIO = { x: 800, y: 560 };
export const CapsulaInterior: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const de = n(params.calendario);
  const ate = n(params.calendarioAte, de + 240);
  const total = n(params.dias, 228);
  const k = ramp(frame, de, ate, { ...clamp, easing: Easing.in(Easing.cubic) });
  const dia = Math.max(1, Math.round(1 + (total - 1) * k));
  const terraR = 70 - 50 * k;
  const c = CALENDARIO;
  // folha voando: a cada troca de número sai uma folha (mais rápida conforme acelera)
  const folha = Number.isFinite(de) && frame >= de && k < 1 ? ((1 + (total - 1) * k) % 1) : 0;
  return (
    <>
      <Layer cam={cam} depth={0.7}>
        <rect x={-1000} y={-1000} width={3080} height={3700} fill={sombra(colors.creme)} />
        {/* painéis */}
        {[-200, 160, 520, 880, 1240].map((px) => (
          <rect key={px} x={px} y={260} width={330} height={960} rx={30} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        ))}
        {[300, 1140].map((py) => (
          <rect key={py} x={-1000} y={py} width={3080} height={22} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        ))}
        {/* escotilha */}
        <clipPath id={`esc-${id}`}>
          <circle cx={300} cy={620} r={150} />
        </clipPath>
        <g clipPath={`url(#esc-${id})`}>
          <rect x={100} y={420} width={400} height={400} fill={colors.noite} />
          <Stars frame={frame} />
          <Globe x={360} y={680} r={terraR} lon={-40 - frame * 0.5} grade={false} />
        </g>
        <circle cx={300} cy={620} r={150} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.6} />
        <circle cx={300} cy={620} r={150} fill="none" stroke={colors.amarelo} strokeWidth={ink * 1.1} />
        {/* calendário */}
        <g transform={`translate(${c.x} ${c.y})`}>
          <rect x={-120} y={-130} width={240} height={260} rx={14} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
          <rect x={-120} y={-130} width={240} height={70} rx={14} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
          <text x={0} y={-82} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={40} fill={colors.creme}>DIA</text>
          <text x={0} y={70} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={dia > 99 ? 104 : 120} fill={colors.tinta}>{dia}</text>
          {dia > 1 && folha > 0.3 ? (
            <g transform={`translate(${80 + folha * 160} ${-80 - folha * 220}) rotate(${20 + folha * 60})`} opacity={1 - folha}>
              <rect x={-110} y={-60} width={220} height={180} rx={10} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
            </g>
          ) : null}
        </g>
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-1000} y={1300} width={3080} height={1400} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink} />
        {[-100, 260, 620, 980].map((gx) => (
          <rect key={gx} x={gx} y={1340} width={300} height={24} rx={12} fill={sombra(colors.chaoSombra)} />
        ))}
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- marte_superficie
// Chão alaranjado, céu cor de poeira, morros ao fundo, pedras, um Sol pequeno e a Terra como um
// pontinho azul no céu. Poeira passando devagar.
export const MarteSuperficie: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => {
  const ink = useInk();
  return (
    <>
      <Layer cam={cam} depth={0.15}>
        <SkyFill color={colors.coralClaro} />
        <rect x={-1000} y={700} width={3080} height={600} fill={colors.muro} opacity={0.45} />
        <Sun x={860} y={330} r={46} />
        <circle cx={220} cy={260} r={9} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.4} />
      </Layer>
      <Layer cam={cam} depth={0.5}>
        <path d="M -500 1120 C -200 980 0 1000 200 1060 C 400 960 600 980 760 1050 C 900 990 1100 980 1600 1100 L 1600 1400 L -500 1400 Z" fill={sombra(colors.muro)} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-1000} y={1180} width={3080} height={1600} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} />
        {[
          [80, 1420, 70],
          [960, 1380, 50],
          [700, 1700, 90],
          [180, 1780, 40],
          [1020, 1640, 60],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.62} fill={sombra(colors.muroSombra)} stroke={colors.tinta} strokeWidth={ink * 0.8} />
            <ellipse cx={x - r * 0.25} cy={y - r * 0.2} rx={r * 0.35} ry={r * 0.18} fill={colors.muro} opacity={0.5} />
          </g>
        ))}
        {[300, 520, 860].map((x, i) => (
          <ellipse key={x} cx={x} cy={1290 + i * 30} rx={70} ry={12} fill={sombra(colors.muroSombra)} opacity={0.7} />
        ))}
        {/* poeira */}
        {Array.from({ length: 12 }, (_, i) => {
          const t = ((frame * (2 + (i % 3)) + i * 173) % 1300) / 1300;
          return <circle key={i} cx={-100 + t * 1300} cy={900 + ((i * 97) % 700) + Math.sin(frame / 9 + i) * 14} r={4 + (i % 3) * 2} fill={colors.creme} opacity={0.45} />;
        })}
      </Layer>
    </>
  );
};
