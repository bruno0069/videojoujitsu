import React from "react";
import { colors } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { SkyFill } from "../Sky";

// Inserto em close: o pão de queijo, ainda bem quente, soltando fumaça.
export const InsertoPao: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <>
    <Layer cam={cam} depth={0.2}>
      <SkyFill color={colors.ceu} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <Bread frame={frame} />
    </Layer>
  </>
);

const Bread: React.FC<{ frame: number }> = ({ frame }) => {
  const ink = useInk();
  const cx = 540;
  const cy = 1000;
  const steam = [-120, 0, 120].map((dx, i) => {
    const k = ((frame + i * 9) % 36) / 36; // cada fio sobe e recomeça
    const phase = frame / 5 + i * 2;
    const y0 = cy - 230 - k * 120;
    const d = `M ${cx + dx} ${y0} q ${40 * Math.sin(phase)} -70 0 -130 q ${-40 * Math.sin(phase)} -60 0 -120`;
    return <path key={i} d={d} stroke={colors.creme} strokeWidth={ink * 2.2} fill="none" strokeLinecap="round" opacity={1 - k * 0.7} />;
  });
  return (
    <g>
      {/* prato */}
      <ellipse cx={cx} cy={cy + 210} rx={420} ry={110} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      {steam}
      <ellipse cx={cx} cy={cy + 20} rx={330} ry={250} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M ${cx - 230} ${cy - 70} Q ${cx - 120} ${cy - 170} ${cx + 30} ${cy - 160}`} stroke={colors.creme} strokeWidth={ink * 1.6} fill="none" strokeLinecap="round" opacity={0.8} />
      <circle cx={cx - 120} cy={cy - 20} r={34} fill={colors.muroSombra} />
      <circle cx={cx + 100} cy={cy - 60} r={26} fill={colors.muroSombra} />
      <circle cx={cx + 30} cy={cy + 110} r={30} fill={colors.muroSombra} />
      <circle cx={cx + 190} cy={cy + 60} r={20} fill={colors.muroSombra} />
      <circle cx={cx - 200} cy={cy + 90} r={22} fill={colors.muroSombra} />
    </g>
  );
};
