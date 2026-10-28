import React from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Earth } from "../elements/Earth";
import { InfoLabel } from "../elements/Props";
import { useInk } from "../Ink";
import { SkyFill, Stars } from "../Sky";

// Órbita ocupando ~80% da largura
export const ORBIT = { cx: 560, cy: 880, r: 420 };
const SPEED = 0.006; // rad por frame (exagerado, é um diagrama)
const END_ANGLE = -Math.PI / 4; // termina no alto à direita, de onde a Terra sai pela tangente no fecho

export const orbitAngle = (frame: number, length = 360) => END_ANGLE + (length - frame) * SPEED;

// Diagrama: a Terra percorre a órbita ao redor de um ponto vazio.
export const DiagramaOrbita: React.FC<{ cam: Cam; frame: number; labelAt?: number; labelUntil?: number }> = ({
  cam,
  frame,
  labelAt = 20,
  labelUntil = Infinity,
}) => (
  <>
    <Layer cam={cam} depth={0.1}>
      <SkyFill color={colors.noite} />
      <Stars frame={frame} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <OrbitContent frame={frame} labelAt={labelAt} labelUntil={labelUntil} />
    </Layer>
  </>
);

const OrbitContent: React.FC<{ frame: number; labelAt: number; labelUntil: number }> = ({ frame, labelAt, labelUntil }) => {
  const ink = useInk();
  const { fps } = useVideoConfig();
  const angle = orbitAngle(frame);
  const at = (a: number) => [ORBIT.cx + ORBIT.r * Math.cos(a), ORBIT.cy + ORBIT.r * Math.sin(a)];
  const [ex, ey] = at(angle);
  const pulse = 1 + 0.06 * Math.sin(frame / 8);
  // Rastro: três trechos de arco atrás da Terra, cada vez mais apagados
  const trail = [0, 1, 2].map((i) => {
    const a0 = angle + 0.04 + i * 0.16;
    const a1 = a0 + 0.16;
    const [x0, y0] = at(a0);
    const [x1, y1] = at(a1);
    return (
      <path
        key={i}
        d={`M ${x0} ${y0} A ${ORBIT.r} ${ORBIT.r} 0 0 1 ${x1} ${y1}`}
        stroke={colors.ceu}
        strokeWidth={(46 - i * 12)}
        strokeLinecap="round"
        fill="none"
        opacity={0.55 - i * 0.16}
      />
    );
  });
  const label = frame >= labelAt && frame < labelUntil ? spring({ frame: frame - labelAt, fps, config: { damping: 7, mass: 0.6, stiffness: 180 } }) : 0;
  const labelY = ORBIT.cy - 135; // acima do círculo vazio, longe do Nico
  return (
    <g>
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ORBIT.r} fill="none" stroke={colors.creme} strokeWidth={ink * 0.6} strokeDasharray={`${ink * 2} ${ink * 2}`} opacity={0.7} />
      {/* Ponto vazio onde estava o Sol */}
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={95 * pulse} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.8} strokeDasharray={`${ink * 1.4} ${ink * 1.4}`} />
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ink * 0.6} fill={colors.amarelo} />
      <InfoLabel x={ORBIT.cx} y={labelY} text="onde o Sol estava" s={label} />
      {/* A "gravidade" ainda puxa para o ponto vazio */}
      <path d={`M ${ex} ${ey} L ${ORBIT.cx} ${ORBIT.cy}`} stroke={colors.amarelo} strokeWidth={ink * 0.5} strokeDasharray={`${ink} ${ink}`} opacity={interpolate(frame, [0, 20], [0, 0.8], { extrapolateRight: "clamp" })} />
      {trail}
      <Earth x={ex} y={ey} r={66} />
    </g>
  );
};
