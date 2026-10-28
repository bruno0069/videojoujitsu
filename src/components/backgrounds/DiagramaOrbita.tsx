import React from "react";
import { colors } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Earth } from "../elements/Earth";
import { useInk } from "../Ink";
import { SkyFill, Stars } from "../Sky";

export const ORBIT = { cx: 570, cy: 840, r: 270 };

// Diagrama: a Terra percorre a órbita ao redor de um ponto vazio.
export const DiagramaOrbita: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => {
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={0.8}>
        <OrbitContent frame={frame} />
      </Layer>
    </>
  );
};

const OrbitContent: React.FC<{ frame: number }> = ({ frame }) => {
  const ink = useInk();
  // Termina no alto à direita (-45°), de onde a Terra sai pela tangente no fecho
  const angle = -Math.PI / 4 + (360 - frame) * 0.006;
  const ex = ORBIT.cx + ORBIT.r * Math.cos(angle);
  const ey = ORBIT.cy + ORBIT.r * Math.sin(angle);
  const pulse = 1 + 0.06 * Math.sin(frame / 8);
  return (
    <g>
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ORBIT.r} fill="none" stroke={colors.creme} strokeWidth={ink * 0.6} strokeDasharray={`${ink * 2} ${ink * 2}`} opacity={0.7} />
      {/* Ponto vazio onde estava o Sol */}
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={95 * pulse} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.7} strokeDasharray={`${ink * 1.4} ${ink * 1.4}`} />
      <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ink * 0.6} fill={colors.amarelo} />
      {/* A "gravidade" ainda puxa para o ponto vazio */}
      <path d={`M ${ex} ${ey} L ${ORBIT.cx} ${ORBIT.cy}`} stroke={colors.amarelo} strokeWidth={ink * 0.5} strokeDasharray={`${ink} ${ink}`} opacity={0.8} />
      <Earth x={ex} y={ey} r={62} />
    </g>
  );
};
