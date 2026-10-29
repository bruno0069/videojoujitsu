import React, { useId } from "react";
import { Easing, interpolate } from "remotion";
import { colors, loopPhase, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { useLoopFrames } from "../GlobalFrame";
import { useInk } from "../Ink";
import { Cloud, SkyFill } from "../Sky";

// Sala de aula de geografia: parede com janela (à esquerda, árvores lá fora) e quadro com o
// mapa-múndi e um globo desenhado (à direita); chão na frente. As carteiras vêm com os
// personagens sentados (Character). Parâmetros: `vento` (frame em que o vento começa lá fora),
// `ponteiro` (frame em que o ponteiro da professora entra, vindo de fora do quadro).

export const SALA_DEPTH = 0.6; // profundidade da parede (parallax)
export const JANELA = { x: 60, y: 380, w: 380, h: 500 };
export const QUADRO = { x: 520, y: 330, w: 760, h: 520 };
export const GLOBO_QUADRO = { x: 1010, y: 600, r: 150 };

export const SalaAula: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Record<string, number | number[]> }> = ({
  cam,
  frame,
  globalFrame,
  params,
}) => {
  const vento = typeof params.vento === "number" ? params.vento : Infinity;
  const ponteiro = typeof params.ponteiro === "number" ? params.ponteiro : Infinity;
  // `giroQuadro: [de, ate]`: o globo desenhado no quadro gira (0,6 volta) nesse intervalo e para
  const gq = Array.isArray(params.giroQuadro) ? params.giroQuadro : null;
  const boardLon =
    -50 -
    (gq
      ? 216 * interpolate(frame, [gq[0], Math.max(gq[0] + 1, gq[1])], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) })
      : 0);
  const wind = Number.isFinite(vento)
    ? interpolate(frame, [vento, vento + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.quad) })
    : 0;
  return (
    <>
      <Layer cam={cam} depth={SALA_DEPTH}>
        <Parede />
        <Janela frame={frame} globalFrame={globalFrame} wind={wind} />
        <Quadro lon={boardLon} />
        <Ponteiro frame={frame} at={ponteiro} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Piso />
      </Layer>
    </>
  );
};

const Parede: React.FC = () => {
  const ink = useInk();
  return (
    <g>
      <rect x={-1000} y={-1000} width={3080} height={3700} fill={colors.creme} />
      {/* rodameio e rodapé */}
      <rect x={-1000} y={1020} width={3080} height={280} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-1000} y={1020} width={3080} height={36} fill={sombra(colors.muro)} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Janela: React.FC<{ frame: number; globalFrame: number; wind: number }> = ({ frame, globalFrame, wind }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const loopFrames = useLoopFrames();
  const { x, y, w, h } = JANELA;
  // árvores: curvam com o vento, com rajadas
  const gust = wind * (16 + 6 * Math.sin(frame / 4));
  const tree = (tx: number, ty: number, s: number, k: number) => (
    <g key={tx} transform={`translate(${tx} ${ty}) rotate(${gust * k}) scale(${s})`}>
      <rect x={-14} y={-150} width={28} height={150} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink / s} />
      <circle cx={0} cy={-200} r={92} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink / s} />
      <circle cx={-56} cy={-150} r={58} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink / s} />
      <circle cx={-20} cy={-206} r={40} fill={sombra(colors.folha)} />
    </g>
  );
  // folhas voando com o vento
  const leaves =
    wind > 0
      ? Array.from({ length: 7 }, (_, i) => {
          const t = ((frame * (6 + i) + i * 97) % 520) / 520;
          return <ellipse key={i} cx={x - 40 + t * (w + 80)} cy={y + 90 + ((i * 61) % 300) + Math.sin(frame / 5 + i) * 20} rx={14} ry={7} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink * 0.4} opacity={wind} />;
        })
      : null;
  const cloudX = x + 60 + loopPhase(globalFrame, 1, loopFrames) * (w - 120) + wind * frame * 2;
  return (
    <g>
      <clipPath id={`janela-${id}`}>
        <rect x={x} y={y} width={w} height={h} />
      </clipPath>
      <g clipPath={`url(#janela-${id})`}>
        <SkyFill color={colors.ceu} />
        <Cloud x={((cloudX - x) % (w + 200)) + x - 60} y={y + 110} s={0.6} />
        <rect x={x} y={y + h - 60} width={w} height={60} fill={colors.chao} />
        {tree(x + 110, y + h - 40, 0.9, 1)}
        {tree(x + 300, y + h - 20, 1.05, 0.8)}
        {leaves}
      </g>
      {/* moldura e travessas */}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.4} />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={colors.creme} strokeWidth={ink * 1.2} />
      <path d={`M ${x + w / 2} ${y} L ${x + w / 2} ${y + h} M ${x} ${y + h * 0.45} L ${x + w} ${y + h * 0.45}`} stroke={colors.tinta} strokeWidth={ink * 1.2} />
      <rect x={x - 24} y={y + h} width={w + 48} height={30} rx={8} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Quadro: React.FC<{ lon: number }> = ({ lon }) => {
  const ink = useInk();
  const { x, y, w, h } = QUADRO;
  const g = GLOBO_QUADRO;
  return (
    <g>
      <rect x={x - 22} y={y - 22} width={w + 44} height={h + 44} rx={14} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={x} y={y} width={w} height={h} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
      {/* mapa-múndi a giz (faixa achatada do globo, sem rotação) */}
      <g transform={`translate(${x + 230} ${y + 170}) scale(1.5 0.62)`} opacity={0.9}>
        <Globe x={0} y={0} r={120} lon={-20} grade={false} />
      </g>
      <rect x={x + 40} y={y + 330} width={360} height={10} rx={5} fill={colors.creme} opacity={0.55} />
      <rect x={x + 40} y={y + 370} width={250} height={10} rx={5} fill={colors.creme} opacity={0.55} />
      {/* globo desenhado com a seta de rotação */}
      <Globe x={g.x} y={g.y} r={g.r} lon={lon} tilt={20} />
      <path d={`M ${g.x - g.r - 30} ${g.y + 40} Q ${g.x} ${g.y + g.r + 70} ${g.x + g.r + 30} ${g.y + 40}`} fill="none" stroke={colors.amarelo} strokeWidth={ink * 1.1} strokeLinecap="round" />
      <path d={`M ${g.x + g.r + 30} ${g.y + 40} l -40 -6 m 40 6 l -18 36`} fill="none" stroke={colors.amarelo} strokeWidth={ink * 1.1} strokeLinecap="round" />
      {/* calha do giz */}
      <rect x={x - 10} y={y + h + 6} width={w + 20} height={22} rx={8} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

// Ponteiro da professora (fora de quadro): entra pela esquerda e bate no globo do quadro
const Ponteiro: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const ink = useInk();
  if (frame < at) return null;
  const k = interpolate(frame, [at, at + 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const tap = Math.max(0, Math.sin(((frame - at - 10) / 9) * Math.PI)) * (frame > at + 10 ? 1 : 0);
  const tip = { x: GLOBO_QUADRO.x - 40 - 30 * tap, y: GLOBO_QUADRO.y + 20 + 10 * tap };
  const base = { x: -420, y: 1180 };
  const ex = base.x + (tip.x - base.x) * k;
  const ey = base.y + (tip.y - base.y) * k;
  return (
    <g>
      <path d={`M ${base.x} ${base.y} L ${ex} ${ey}`} stroke={colors.tinta} strokeWidth={ink * 2.6} strokeLinecap="round" />
      <path d={`M ${base.x} ${base.y} L ${ex} ${ey}`} stroke={colors.muroSombra} strokeWidth={ink * 1.3} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={ink * 0.9} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.5} />
    </g>
  );
};

const Piso: React.FC = () => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <pattern id={`taco-${id}`} x={0} y={1300} width={64} height={56} patternUnits="userSpaceOnUse">
        <circle cx={14} cy={14} r={5} fill={colors.chaoSombra} opacity={0.55} />
        <circle cx={46} cy={42} r={4} fill={colors.chaoSombra} opacity={0.4} />
      </pattern>
      <rect x={-1000} y={1300} width={3080} height={1400} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-1000} y={1310} width={3080} height={1390} fill={`url(#taco-${id})`} />
    </g>
  );
};
