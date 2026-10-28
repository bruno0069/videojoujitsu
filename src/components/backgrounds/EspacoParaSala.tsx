import React from "react";
import { Easing, interpolate } from "remotion";
import { colors, sun } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Earth } from "../elements/Earth";
import { Sun } from "../elements/Sun";
import { useInk } from "../Ink";
import { SkyFill, Stars } from "../Sky";
import { ORBIT } from "./DiagramaOrbita";

export const EspacoEscuro: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <EspacoParaSala cam={cam} frame={frame} cut={Infinity} spaceLength={90} />
);

// Espaço escuro (a Terra sai pela tangente, em linha reta) e, depois do corte, a sala de aula.
export const EspacoParaSala: React.FC<{ cam: Cam; frame: number; cut: number; spaceLength?: number }> = ({ cam, frame, cut, spaceLength }) => {
  if (frame < cut) {
    return (
      <>
        <Layer cam={cam} depth={0.1}>
          <SkyFill color={colors.noiteEscura} />
          <Stars frame={frame} opacity={0.6} />
        </Layer>
        <Layer cam={cam} depth={0.8}>
          <StraightLine frame={frame} cut={spaceLength ?? cut} />
        </Layer>
      </>
    );
  }
  return <Classroom cam={cam} />;
};

const StraightLine: React.FC<{ frame: number; cut: number }> = ({ frame, cut }) => {
  const ink = useInk();
  // Ponto de saída na órbita antiga e direção tangente
  // Continua de onde a Terra estava no diagrama (sentido anti-horário na tela)
  const a = -Math.PI / 4;
  const sx = ORBIT.cx + ORBIT.r * Math.cos(a);
  const sy = ORBIT.cy + ORBIT.r * Math.sin(a);
  const tx = Math.sin(a);
  const ty = -Math.cos(a);
  const t = interpolate(frame, [0, cut], [0, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.quad) });
  const dist = 20 + t * 520;
  const ex = sx + tx * dist;
  const ey = sy + ty * dist;
  const r = interpolate(t, [0, 1], [66, 26]);
  return (
    <g>
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ORBIT.r} fill="none" stroke={colors.creme} strokeWidth={ink * 0.5} strokeDasharray={`${ink * 2} ${ink * 2}`} opacity={0.25} />
      <path d={`M ${sx} ${sy} L ${ex} ${ey}`} stroke={colors.creme} strokeWidth={ink * 0.6} strokeDasharray={`${ink * 1.5} ${ink * 1.5}`} opacity={0.8} />
      <Earth x={ex} y={ey} r={r} />
    </g>
  );
};

const Classroom: React.FC<{ cam: Cam }> = ({ cam }) => (
  <>
    <Layer cam={cam} depth={0.3}>
      <ClassWall />
    </Layer>
    <Layer cam={cam} depth={0.6}>
      <Desks />
    </Layer>
  </>
);

const ClassWall: React.FC = () => {
  const ink = useInk();
  return (
    <g>
      <rect x={-1000} y={-1000} width={3080} height={3920} fill={colors.creme} />
      {/* Janela com o céu e o Sol no mesmo lugar do gancho (fecha o loop) */}
      <rect x={690} y={420} width={520} height={440} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />
      <Sun x={sun.x} y={sun.y} r={sun.r} />
      <path d="M 1040 420 L 1040 860" stroke={colors.tinta} strokeWidth={ink} />
      <rect x={670} y={850} width={560} height={36} rx={8} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      {/* Lousa à esquerda */}
      <rect x={-300} y={420} width={560} height={420} rx={12} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
      {/* Rodapé */}
      <rect x={-1000} y={1240} width={3080} height={1400} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Desks: React.FC = () => {
  const ink = useInk();
  return (
    <g>
      <rect x={-200} y={1500} width={1480} height={60} rx={14} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-200} y={1555} width={1480} height={600} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};
