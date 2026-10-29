import React from "react";
import { Easing, interpolate } from "remotion";
import { colors, night, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { InfoLabel } from "../elements/Props";
import { useInk } from "../Ink";
import { Cloud, SkyFill } from "../Sky";

// Orla do Rio de Janeiro (ep02), desenho original no estilo do canal: ao fundo o Corcovado com
// o Cristo Redentor e o Pão de Açúcar com o Morro da Urca na Baía de Guanabara; na frente os
// prédios da orla, o calçadão de ondas, a areia e o mar. A casa do Nico fica na orla com o pino.
// Parâmetros (frames da cena): `onda` (a água começa a avançar), `ondaAte` (chega ao calçadão),
// `cobre` (a água cobre a casa e a etiqueta vira "costa nova").

export const RIO_DEPTH = 0.6; // profundidade dos morros (parallax)
const PINO = 0.8; // escala do pino
const CASA = 1.3; // escala da casa
export const MAPA_RIO = {
  casa: { x: 470, y: 1190 }, // base da casa
  pino: { x: 470, y: 995 }, // ponta do pino (mesmo lugar o tempo todo)
  orla: { x: 470, y: 1290 },
  morros: { x: 560, y: 560 },
  praia: 1420, // linha do mar antes da água avançar
  calcadao: 1215,
  costaNova: 960,
};

const n = (v: number | number[] | undefined) => (typeof v === "number" ? v : Infinity);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Linha da frente da água (y) no frame da cena
export const frenteAgua = (frame: number, params: Record<string, number | number[]>) => {
  const m = MAPA_RIO;
  const onda = n(params.onda);
  const ate = Number.isFinite(n(params.ondaAte)) ? n(params.ondaAte) : onda + 90;
  const cobre = Number.isFinite(n(params.cobre)) ? n(params.cobre) : ate + 60;
  if (!Number.isFinite(onda) || frame < onda) return m.praia;
  if (frame < ate) return interpolate(frame, [onda, ate], [m.praia, m.calcadao], { ...clamp, easing: Easing.inOut(Easing.quad) });
  if (frame < cobre) return interpolate(frame, [ate, cobre], [m.calcadao, m.calcadao - 15], clamp);
  return interpolate(frame, [cobre, cobre + 20], [m.calcadao - 15, m.costaNova], { ...clamp, easing: Easing.out(Easing.quad) });
};

export const MapaRio: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const m = MAPA_RIO;
  const front = frenteAgua(frame, params);
  const coberta = front <= 1010; // a água passou do telhado
  const wobble = (x: number) => Math.sin(x / 60 + frame / 4) * 10;
  const xs = Array.from({ length: 30 }, (_, i) => -200 + i * 55);
  const water = `M -400 2800 L -400 ${front} L ${xs.map((x) => `${x} ${front + wobble(x)}`).join(" L ")} L 1480 ${front} L 1480 2800 Z`;
  // primeiro frame em que a casa está coberta: a etiqueta troca com um pop
  const cobre = n(params.cobre);
  const pop = coberta && Number.isFinite(cobre) ? interpolate(frame, [cobre + 8, cobre + 16], [0.6, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) }) : 1;
  return (
    <>
      <Layer cam={cam} depth={0.2}>
        <SkyFill color={colors.ceu} />
        <Cloud x={220 + frame * 0.3} y={190} s={0.8} />
        <Cloud x={820 - frame * 0.2} y={300} s={0.55} />
      </Layer>
      <Layer cam={cam} depth={RIO_DEPTH}>
        <Morros />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Orla />
        <Casa />
        {front < m.praia ? (
          <>
            <path d={water} fill={colors.ceu} />
            <path d={`M ${xs.map((x) => `${x} ${front + wobble(x)}`).join(" L ")}`} fill="none" stroke={colors.creme} strokeWidth={ink * 1.4} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {/* ondinhas do mar */}
        {Array.from({ length: 8 }, (_, i) => {
          const y = 1480 + i * 110;
          if (y < front + 40) return null;
          return <path key={i} d={`M ${-80 + ((i * 260 + frame * 3) % 1300)} ${y} q 30 -22 60 0 q 30 22 60 0`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.8} strokeLinecap="round" opacity={0.6} />;
        })}
        <Pino />
        <InfoLabel x={m.pino.x} y={m.pino.y - 175 * PINO - 56} text={coberta ? "costa nova" : "aqui mora o Nico"} s={pop} />
      </Layer>
    </>
  );
};

// Corcovado com o Cristo, Morro da Urca e Pão de Açúcar com o bondinho, sobre a baía
const Morros: React.FC = () => {
  const ink = useInk();
  const rocha = colors.folhaSombra;
  return (
    <g>
      {/* morros distantes */}
      <path d="M -300 880 C -150 760 0 730 120 780 C 300 690 520 760 640 800 C 800 720 1000 700 1380 840 L 1380 960 L -300 960 Z" fill={sombra(colors.ceu)} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinejoin="round" />
      {/* Baía de Guanabara (desce bem para não abrir buraco com o parallax) */}
      <rect x={-600} y={880} width={2280} height={700} fill={colors.ceu} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${80 + i * 330} ${905 + (i % 2) * 14} q 24 -14 48 0 q 24 14 48 0`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.6} strokeLinecap="round" opacity={0.7} />
      ))}
      {/* Corcovado */}
      <path d="M 40 910 C 150 720 230 450 290 312 L 336 302 C 390 440 480 720 590 910 Z" fill={rocha} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M 314 306 C 350 450 410 650 480 850 L 540 905 C 470 720 390 470 336 302 Z" fill={sombra(rocha)} />
      {/* Cristo Redentor (silhueta) */}
      <g fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinejoin="round">
        <rect x={296} y={284} width={36} height={22} rx={3} />
        <path d="M 304 288 L 308 206 L 320 206 L 324 288 Z" />
        <rect x={256} y={212} width={116} height={15} rx={6} />
        <circle cx={314} cy={194} r={11} />
      </g>
      {/* Morro da Urca */}
      <path d="M 520 910 C 550 760 600 660 648 654 C 704 660 748 760 770 910 Z" fill={rocha} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      {/* Pão de Açúcar */}
      <path d="M 712 912 C 716 660 764 420 862 398 C 960 420 1008 660 1016 912 Z" fill={rocha} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <path d="M 892 404 C 950 440 990 640 996 905 L 954 905 C 948 680 924 520 880 400 Z" fill={sombra(rocha)} />
      {/* bondinho */}
      <path d="M 440 800 L 648 656 L 862 400" fill="none" stroke={colors.tinta} strokeWidth={ink * 0.4} />
      <g transform="translate(760 520)">
        <rect x={-14} y={0} width={28} height={20} rx={4} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.4} />
        <path d="M 0 0 L 0 -8" stroke={colors.tinta} strokeWidth={ink * 0.4} />
      </g>
    </g>
  );
};

// Prédios da orla, avenida, calçadão de ondas, areia e mar
const PREDIOS: [number, number, number][] = [
  // x, largura, altura
  [-40, 110, 190], [70, 90, 150], [160, 100, 220], [260, 80, 170], [600, 90, 200], [690, 110, 160], [800, 90, 230], [890, 100, 180], [990, 110, 210],
];
const Orla: React.FC = () => {
  const ink = useInk();
  const base = MAPA_RIO.casa.y;
  const cores = [colors.creme, colors.muro, colors.coralClaro];
  const onda = Array.from({ length: 24 }, (_, i) => `q 25 ${i % 2 ? 9 : -9} 50 0`).join(" ");
  return (
    <g>
      <rect x={-400} y={925} width={1880} height={300} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
      {PREDIOS.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={base - h} width={w} height={h} fill={cores[i % 3]} stroke={colors.tinta} strokeWidth={ink * 0.8} />
          {Array.from({ length: Math.floor((h - 30) / 40) }, (_, r) =>
            [0, 1].map((c) => <rect key={`${r}-${c}`} x={x + 16 + c * (w / 2 - 4)} y={base - h + 20 + r * 40} width={w / 2 - 28} height={16} rx={3} fill={sombra(cores[i % 3])} />),
          )}
        </g>
      ))}
      {/* avenida e calçadão de ondas */}
      <rect x={-400} y={base} width={1880} height={16} fill={night.chao} />
      <rect x={-400} y={base + 16} width={1880} height={28} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d={`M -200 ${base + 30} ${onda}`} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.8} />
      {/* areia e mar */}
      <path d={`M -400 ${base + 44} L 1480 ${base + 44} L 1480 1410 C 1100 1440 700 1420 540 1416 C 300 1412 0 1440 -400 1420 Z`} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      <path d="M -400 1420 C 0 1440 300 1412 540 1416 C 700 1420 1100 1440 1480 1410 L 1480 2800 L -400 2800 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.8} />
    </g>
  );
};

const Casa: React.FC = () => {
  const ink = useInk();
  const { x, y } = MAPA_RIO.casa;
  return (
    <g transform={`translate(${x} ${y}) scale(${CASA}) translate(${-x} ${-y})`} stroke={colors.tinta} strokeWidth={ink / CASA} strokeLinejoin="round">
      <rect x={x - 65} y={y - 80} width={130} height={80} fill={colors.creme} />
      <path d={`M ${x - 82} ${y - 78} L ${x} ${y - 140} L ${x + 82} ${y - 78} Z`} fill={colors.coral} />
      <rect x={x - 16} y={y - 46} width={32} height={46} fill={colors.muroSombra} strokeWidth={(ink * 0.7) / CASA} />
      <rect x={x + 26} y={y - 62} width={26} height={24} fill={colors.ceu} strokeWidth={(ink * 0.6) / CASA} />
      <rect x={x - 52} y={y - 62} width={26} height={24} fill={colors.ceu} strokeWidth={(ink * 0.6) / CASA} />
    </g>
  );
};

// Pino fincado sobre o telhado da casa (fica no mesmo lugar quando a água cobre a casa)
const Pino: React.FC = () => {
  const ink = useInk();
  const { x, y } = MAPA_RIO.pino;
  return (
    <g transform={`translate(${x} ${y}) scale(${PINO})`}>
      <path d="M 0 0 C -40 -50 -60 -80 -60 -110 C -60 -150 -30 -175 0 -175 C 30 -175 60 -150 60 -110 C 60 -80 40 -50 0 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink / PINO} strokeLinejoin="round" />
      <circle cx={0} cy={-112} r={22} fill={colors.creme} stroke={colors.tinta} strokeWidth={(ink * 0.7) / PINO} />
    </g>
  );
};
