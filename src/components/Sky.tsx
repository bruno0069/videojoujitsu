import React from "react";
import { colors } from "../theme";
import { useInk } from "./Ink";

// Céu chapado (uma cor por frame) + nuvens e estrelas simples.
export const SkyFill: React.FC<{ color: string }> = ({ color }) => (
  <rect x={-1000} y={-1000} width={3080} height={3920} fill={color} />
);

export const Cloud: React.FC<{ x: number; y: number; s: number; opacity?: number }> = ({ x, y, s, opacity = 1 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <path
        d="M -150 40 Q -170 -10 -110 -20 Q -100 -80 -30 -70 Q 10 -120 70 -80 Q 140 -90 140 -20 Q 190 -10 170 40 Z"
        fill={colors.creme}
        stroke={colors.tinta}
        strokeWidth={ink / s}
        strokeLinejoin="round"
      />
    </g>
  );
};

// Estrelas determinísticas (sem Math.random)
const STARS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 1180 - 50, y: (b - Math.floor(b)) * 1250 + 120, r: 5 + ((i * 7) % 5) * 2, p: i * 0.7 };
});

export const Stars: React.FC<{ frame: number; opacity?: number; maxY?: number }> = ({ frame, opacity = 1, maxY = 2000 }) => (
  <g opacity={opacity}>
    {STARS.filter((s) => s.y < maxY).map((s, i) => {
      const tw = 0.6 + 0.4 * Math.sin(frame / 14 + s.p);
      const r = s.r * tw;
      return (
        <path
          key={i}
          d={`M ${s.x} ${s.y - r * 2} L ${s.x + r * 0.5} ${s.y - r * 0.5} L ${s.x + r * 2} ${s.y} L ${s.x + r * 0.5} ${s.y + r * 0.5} L ${s.x} ${s.y + r * 2} L ${s.x - r * 0.5} ${s.y + r * 0.5} L ${s.x - r * 2} ${s.y} L ${s.x - r * 0.5} ${s.y - r * 0.5} Z`}
          fill={colors.creme}
        />
      );
    })}
  </g>
);
