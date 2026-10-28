import React from "react";
import { interpolateColors } from "remotion";
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
const STARS = Array.from({ length: 64 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  const b = Math.sin(i * 78.233) * 12345.6789;
  return { x: (a - Math.floor(a)) * 1180 - 50, y: (b - Math.floor(b)) * 1800 + 60, r: 4 + ((i * 7) % 5) * 1.6, p: i * 0.7 };
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

// Via Láctea chapada: duas faixas diagonais um pouco mais claras que o céu (sem degradê),
// para o espaço não virar tela vazia.
export const MilkyWay: React.FC<{ bg: string }> = ({ bg }) => {
  const outer = interpolateColors(0.07, [0, 1], [bg, colors.creme]);
  const inner = interpolateColors(0.14, [0, 1], [bg, colors.creme]);
  return (
    <g>
      <path
        d="M -400 1900 C -100 1500 150 1450 420 1150 C 700 840 860 700 1500 -100 L 1500 420 C 1040 900 880 1080 640 1380 C 380 1700 120 1900 -100 2500 Z"
        fill={outer}
      />
      <path d="M -300 2050 C 0 1700 220 1560 470 1300 C 720 1040 900 820 1500 120 L 1500 260 C 1000 820 820 1000 600 1260 C 360 1540 140 1760 -150 2300 Z" fill={inner} />
    </g>
  );
};
