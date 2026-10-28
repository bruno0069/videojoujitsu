import React from "react";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { SkyFill } from "../Sky";

// Inserto em close: o pão de queijo, ainda bem quente, soltando fumaça, sobre fundo creme
// com raios radiais em coral claro (girando devagar).
const Rays: React.FC<{ frame: number }> = ({ frame }) => {
  const n = 14;
  const cx = 540;
  const cy = 980;
  const R = 2400;
  const rot = frame * 0.25;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      {Array.from({ length: n }, (_, i) => {
        const a0 = (i / n) * Math.PI * 2;
        const a1 = a0 + Math.PI / n;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)} L ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)} Z`}
            fill={colors.coralClaro}
            opacity={0.55}
          />
        );
      })}
    </g>
  );
};

export const InsertoPao: React.FC<{ cam: Cam; frame: number }> = ({ cam, frame }) => (
  <>
    <Layer cam={cam} depth={0.2}>
      <SkyFill color={colors.creme} />
      <Rays frame={frame} />
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
    // fumaça branca com contorno de tinta (sobre o fundo creme)
    return (
      <g key={i} opacity={1 - k * 0.7}>
        <path d={d} stroke={colors.tinta} strokeWidth={ink * 4.2} fill="none" strokeLinecap="round" />
        <path d={d} stroke={colors.branco} strokeWidth={ink * 2.2} fill="none" strokeLinecap="round" />
      </g>
    );
  });
  return (
    <g>
      {/* sombra chapada do prato */}
      <ellipse cx={cx + 30} cy={cy + 250} rx={430} ry={110} fill={sombra(colors.coralClaro)} />
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
