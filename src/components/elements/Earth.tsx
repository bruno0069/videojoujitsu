import React from "react";
import { colors } from "../../theme";
import { useInk } from "../Ink";

export const Earth: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />
      <path
        d={`M ${-r * 0.6} ${-r * 0.5} Q ${-r * 0.1} ${-r * 0.8} ${r * 0.1} ${-r * 0.35} Q ${-r * 0.15} ${-r * 0.05} ${-r * 0.55} ${r * 0.05} Z`}
        fill={colors.turquesa}
        stroke={colors.tinta}
        strokeWidth={ink * 0.6}
        strokeLinejoin="round"
      />
      <path
        d={`M ${r * 0.25} ${r * 0.05} Q ${r * 0.75} ${-r * 0.1} ${r * 0.6} ${r * 0.45} Q ${r * 0.35} ${r * 0.75} ${r * 0.15} ${r * 0.45} Z`}
        fill={colors.turquesa}
        stroke={colors.tinta}
        strokeWidth={ink * 0.6}
        strokeLinejoin="round"
      />
    </g>
  );
};
