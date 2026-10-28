import React from "react";
import { colors } from "../../theme";
import { useInk } from "../Ink";

export const Sun: React.FC<{ x: number; y: number; r: number; rot?: number; scale?: number }> = ({ x, y, r, rot = 0, scale = 1 }) => {
  const ink = useInk();
  const rays = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    const r1 = r * 1.22;
    const r2 = r * 1.5;
    return (
      <path
        key={i}
        d={`M ${Math.cos(a) * r1} ${Math.sin(a) * r1} L ${Math.cos(a) * r2} ${Math.sin(a) * r2}`}
        stroke={colors.tinta}
        strokeWidth={ink * 1.6}
        strokeLinecap="round"
      />
    );
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale}) rotate(${rot})`}>
      {rays}
      <circle r={r} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};
