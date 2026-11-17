import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "./theme";

type P = { size?: number; style?: React.CSSProperties };

/** Cruz de primeiros socorros (placa verde com cruz branca). */
export const FirstAidCross: React.FC<P & { bg?: string; fg?: string }> = ({ size = 100, style, bg = C.green, fg = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <rect x="2" y="2" width="96" height="96" rx="16" fill={bg} />
    <path d="M38 18h24v20h20v24H62v20H38V62H18V38h20z" fill={fg} />
  </svg>
);

/** Chama com leve oscilação. */
export const Flame: React.FC<P> = ({ size = 100, style }) => {
  const f = useCurrentFrame();
  const s = 1 + Math.sin(f / 4) * 0.04;
  const sk = Math.sin(f / 6) * 3;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <g style={{ transformOrigin: "50px 95px", transform: `scaleY(${s}) skewX(${sk}deg)` }}>
        <path d="M50 4C56 24 78 34 78 60a28 28 0 0 1-56 0c0-14 8-22 12-30 2 10 6 14 10 16C42 30 44 16 50 4z" fill="#E53935" />
        <path d="M50 36c4 12 16 18 16 32a16 16 0 0 1-32 0c0-8 4-12 7-17 1 6 4 8 6 9-1-8 0-16 3-24z" fill="#FF9800" />
        <path d="M50 62c2 6 8 9 8 15a8 8 0 0 1-16 0c0-5 4-8 8-15z" fill="#FFEB3B" />
      </g>
    </svg>
  );
};

/** Gota d'água. */
export const Drop: React.FC<P> = ({ size = 100, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M50 6C62 28 80 46 80 64a30 30 0 0 1-60 0C20 46 38 28 50 6z" fill="#1E88E5" />
    <path d="M36 62c0 10 6 16 14 18" stroke="#BBDEFB" strokeWidth="6" fill="none" strokeLinecap="round" />
  </svg>
);

/** Cronômetro: `progress` 0→1 preenche o arco. */
export const Timer: React.FC<P & { progress: number; label?: string }> = ({ size = 160, style, progress, label }) => {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const ang = progress * 360;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <rect x="44" y="2" width="12" height="9" rx="2" fill={C.ink} />
      <rect x="76" y="12" width="9" height="7" rx="2" fill={C.ink} transform="rotate(45 80 15)" />
      <circle cx="50" cy="56" r="42" fill={C.white} stroke={C.ink} strokeWidth="5" />
      <circle
        cx="50"
        cy="56"
        r={r}
        fill="none"
        stroke="#1E88E5"
        strokeWidth="8"
        strokeDasharray={`${circ * progress} ${circ}`}
        transform="rotate(-90 50 56)"
      />
      <line
        x1="50"
        y1="56"
        x2={50 + 28 * Math.sin((ang * Math.PI) / 180)}
        y2={56 - 28 * Math.cos((ang * Math.PI) / 180)}
        stroke={C.red}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="50" cy="56" r="4" fill={C.ink} />
      {label ? (
        <text x="50" y="80" fontSize="11" fontWeight="800" textAnchor="middle" fill={C.ink} fontFamily="Inter, sans-serif">
          {label}
        </text>
      ) : null}
    </svg>
  );
};

/** Nuvem de gás que deriva suavemente. */
export const GasCloud: React.FC<P> = ({ size = 400, style }) => {
  const f = useCurrentFrame();
  const puffs = [
    [30, 60, 22],
    [52, 48, 26],
    [76, 58, 22],
    [44, 70, 20],
    [66, 72, 20],
    [90, 70, 14],
    [16, 72, 13],
  ];
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 110 90" style={style}>
      {puffs.map(([x, y, r], i) => (
        <circle
          key={i}
          cx={x + Math.sin(f / 25 + i) * 2.5}
          cy={y + Math.cos(f / 30 + i * 1.7) * 2}
          r={r + Math.sin(f / 20 + i) * 1}
          fill={i % 2 ? "#B5C96B" : "#C9D982"}
          opacity={0.85}
        />
      ))}
    </svg>
  );
};

/** Respirador autônomo (máscara facial + mangueira + cilindro). */
export const SCBA: React.FC<P> = ({ size = 260, style }) => (
  <svg width={size} height={size} viewBox="0 0 120 120" style={style}>
    {/* cilindro */}
    <rect x="78" y="14" width="30" height="94" rx="14" fill={C.yellow} stroke={C.ink} strokeWidth="3" />
    <rect x="86" y="4" width="14" height="12" rx="3" fill="#78909C" stroke={C.ink} strokeWidth="3" />
    <rect x="78" y="44" width="30" height="8" fill={C.ink} opacity="0.85" />
    {/* mangueira */}
    <path d="M86 92 C70 112, 46 112, 42 94" fill="none" stroke={C.ink} strokeWidth="6" strokeLinecap="round" />
    {/* máscara */}
    <path d="M12 36 C12 14, 72 14, 72 36 L70 70 C66 88, 18 88, 14 70 Z" fill="#37474F" stroke={C.ink} strokeWidth="3" />
    <path d="M20 36 C20 22, 64 22, 64 36 L62 56 C58 64, 26 64, 22 56 Z" fill="#81D4FA" stroke={C.ink} strokeWidth="2" />
    <path d="M28 32 C34 28, 40 28, 44 30" stroke={C.white} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
    <circle cx="42" cy="78" r="9" fill="#90A4AE" stroke={C.ink} strokeWidth="3" />
    <circle cx="42" cy="78" r="3" fill={C.ink} />
  </svg>
);

/** Telefone (handset clássico). */
export const Phone: React.FC<P & { color?: string }> = ({ size = 100, style, color = C.white }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path
      d="M30 10c4 0 6 2 8 6l7 15c2 4 1 7-2 10l-6 5c4 9 11 17 20 22l5-6c3-3 6-4 10-2l15 7c4 2 6 4 6 8v8c0 7-5 12-12 12C42 95 5 58 5 22c0-7 5-12 12-12z"
      fill={color}
    />
  </svg>
);

/** Círculo vermelho com X branco (proibido). */
export const XIcon: React.FC<P> = ({ size = 70, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="46" fill={C.red} />
    <path d="M32 32L68 68M68 32L32 68" stroke={C.white} strokeWidth="12" strokeLinecap="round" />
  </svg>
);

/** Triângulo amarelo de atenção. */
export const Warning: React.FC<P> = ({ size = 90, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M50 6L96 90H4z" fill={C.yellow} stroke={C.ink} strokeWidth="7" strokeLinejoin="round" />
    <rect x="45" y="34" width="10" height="32" rx="4" fill={C.ink} />
    <circle cx="50" cy="77" r="6" fill={C.ink} />
  </svg>
);

/** Check verde. */
export const Check: React.FC<P> = ({ size = 70, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <circle cx="50" cy="50" r="46" fill={C.green} />
    <path d="M28 52l15 15 30-32" stroke={C.white} strokeWidth="11" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Escudo (proteger). */
export const Shield: React.FC<P & { color?: string; check?: string }> = ({ size = 100, style, color = C.white, check = C.green }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M50 6l36 14v26c0 24-16 40-36 48C30 86 14 70 14 46V20z" fill={color} />
    <path d="M34 50l12 12 22-24" stroke={check} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Coração com batimento (vida). */
export const Heart: React.FC<P> = ({ size = 100, style }) => {
  const f = useCurrentFrame();
  const beat = 1 + Math.max(0, Math.sin(f / 5)) * 0.06;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <g style={{ transformOrigin: "50px 50px", transform: `scale(${beat})` }}>
        <path d="M50 88C20 66 6 50 6 32 6 18 17 8 30 8c9 0 16 5 20 12 4-7 11-12 20-12 13 0 24 10 24 24 0 18-14 34-44 56z" fill={C.red} />
        <path d="M18 46h18l6-12 8 24 6-14h26" stroke={C.white} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
};

/** Capacete de segurança (EPI). */
export const Helmet: React.FC<P> = ({ size = 100, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <path d="M14 66C14 38 30 22 50 22s36 16 36 44z" fill={C.yellow} stroke={C.ink} strokeWidth="4" />
    <rect x="44" y="16" width="12" height="40" rx="5" fill="#F0A800" stroke={C.ink} strokeWidth="3" />
    <rect x="6" y="64" width="88" height="12" rx="6" fill="#F0A800" stroke={C.ink} strokeWidth="4" />
  </svg>
);

/** Treinamento (quadro com instrutor). */
export const Training: React.FC<P> = ({ size = 100, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <rect x="30" y="10" width="64" height="44" rx="4" fill={C.white} stroke={C.ink} strokeWidth="4" />
    <path d="M40 42l12-12 10 8 20-18" stroke={C.green} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="40" r="10" fill={C.green} />
    <path d="M4 92c0-20 6-36 14-36s14 16 14 36z" fill={C.green} />
    <path d="M26 64l14-14" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

/** Relógio/anel (retirar acessórios). */
export const Watch: React.FC<P> = ({ size = 100, style }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={style}>
    <rect x="36" y="4" width="28" height="92" rx="8" fill="#78909C" />
    <circle cx="50" cy="50" r="24" fill={C.white} stroke={C.ink} strokeWidth="5" />
    <path d="M50 36v14l9 6" stroke={C.ink} strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
);

/** Animação contínua: retorna 0→1 em loop a cada `period` frames. */
export const useLoop = (period: number) => {
  const f = useCurrentFrame();
  return interpolate(f % period, [0, period], [0, 1]);
};

/** Torneira na parede; `flow` 0→1 controla a água (gotas descendo). */
export const Faucet: React.FC<{ flow: number; streamLength: number; style?: React.CSSProperties }> = ({ flow, streamLength, style }) => {
  const f = useCurrentFrame();
  const w = 200;
  const h = 120 + streamLength;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible", ...style }}>
      <rect x={110} y={10} width={90} height={34} rx={8} fill="#90A4AE" />
      <rect x={60} y={14} width={70} height={26} rx={13} fill="#B0BEC5" />
      <rect x={54} y={20} width={30} height={60} rx={12} fill="#B0BEC5" />
      <rect x={112} y={0} width={14} height={18} rx={4} fill={C.red} />
      <rect x={100} y={-8} width={38} height={10} rx={5} fill={C.red} />
      {flow > 0 ? (
        <g opacity={flow}>
          <rect x={59} y={78} width={20} height={streamLength * flow} rx={10} fill="#64B5F6" opacity={0.75} />
          {[0, 1, 2, 3, 4].map((i) => {
            const y = 80 + (((f * 6 + i * (streamLength / 5)) % streamLength) * flow);
            return <ellipse key={i} cx={69} cy={y} rx={5} ry={9} fill="#E3F2FD" opacity={0.9} />;
          })}
        </g>
      ) : null}
    </svg>
  );
};
