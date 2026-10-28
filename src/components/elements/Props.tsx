import React from "react";
import { Easing, interpolate, interpolateColors, spring, useVideoConfig } from "remotion";
import { colors, fonts, ink as inkTheme } from "../../theme";
import { useInk } from "../Ink";

const pop = (frame: number, from: number, to: number, fps: number) => {
  if (frame < from || frame >= to) return 0;
  const inS = spring({ frame: frame - from, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } });
  const outS = interpolate(frame, [to - 6, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return inS * outS;
};

const outlined = (stroke: number): React.CSSProperties => ({
  WebkitTextStroke: `${stroke}px ${colors.tinta}`,
  paintOrder: "stroke fill",
});

// Balão de fala (no mundo, acompanha o personagem)
export const SpeechBubble: React.FC<{ frame: number; from: number; to: number; text: string; ax: number; ay: number }> = ({
  frame,
  from,
  to,
  text,
  ax,
  ay,
}) => {
  const { fps } = useVideoConfig();
  const ink = useInk();
  const s = pop(frame, from, to, fps);
  if (s <= 0) return null;
  const fontSize = text.length <= 4 ? 92 : 70;
  const w = Math.max(220, text.length * fontSize * 0.6 + 90);
  const h = fontSize * 1.45;
  const bx = Math.min(ax + 40, 990 - w);
  const by = ay - h - 70;
  const tx = Math.max(bx + 30, Math.min(ax - 30, bx + w - 110));
  return (
    <g transform={`translate(${ax} ${ay}) scale(${s}) translate(${-ax} ${-ay})`}>
      <path
        d={`M ${tx} ${by + h - 4} L ${ax} ${ay} L ${tx + 80} ${by + h - 4} Z`}
        fill={colors.creme}
        stroke={colors.tinta}
        strokeWidth={ink}
        strokeLinejoin="round"
      />
      <rect x={bx} y={by} width={w} height={h} rx={h / 2} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M ${tx + 6} ${by + h - 4} L ${tx + 74} ${by + h - 4}`} stroke={colors.creme} strokeWidth={ink * 1.4} />
      <text
        x={bx + w / 2}
        y={by + h / 2 + fontSize * 0.33}
        textAnchor="middle"
        fontFamily={fonts.main}
        fontWeight={fonts.weight}
        fontSize={fontSize}
        fill={colors.tinta}
      >
        {text}
      </text>
    </g>
  );
};

// Inserto circular do pão de queijo soltando fumaça (tela)
export const BreadInsert: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to, fps);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const cx = 790;
  const cy = 610;
  const steam = [-50, 0, 50].map((dx, i) => {
    const phase = frame / 6 + i * 2;
    const y0 = cy - 30;
    const d = `M ${cx + dx} ${y0} q ${18 * Math.sin(phase)} -30 0 -55 q ${-18 * Math.sin(phase)} -25 0 -50`;
    return <path key={i} d={d} stroke={colors.tinta} strokeWidth={ink * 0.8} fill="none" strokeLinecap="round" opacity={0.85} />;
  });
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <circle cx={cx} cy={cy} r={175} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      {steam}
      <ellipse cx={cx} cy={cy + 55} rx={105} ry={82} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={cx - 35} cy={cy + 35} r={13} fill={colors.muroSombra} />
      <circle cx={cx + 30} cy={cy + 25} r={10} fill={colors.muroSombra} />
      <circle cx={cx + 5} cy={cy + 80} r={12} fill={colors.muroSombra} />
    </g>
  );
};

const parseClock = (s: string) => {
  const [m, sec] = s.split(":").map((v) => parseInt(v, 10));
  return m * 60 + sec;
};

const fmt = (total: number) => {
  const t = Math.max(0, Math.round(total));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Relógio digital em contagem regressiva (tela), acelerando com o tempo
export const Clock: React.FC<{ frame: number; from: number; to: number; start: string; end: string }> = ({ frame, from, to, start, end }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to + 1000, fps);
  if (s <= 0) return null;
  const value = interpolate(frame, [from + 15, to], [parseClock(start), parseClock(end)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const cx = 540;
  const cy = 500;
  const ink = inkTheme.stroke;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}>
      <rect x={cx - 230} y={cy - 85} width={460} height={170} rx={30} fill={colors.tinta} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={cx - 214} y={cy - 69} width={428} height={138} rx={20} fill={colors.noite} />
      <text
        x={cx}
        y={cy + 48}
        textAnchor="middle"
        fontFamily={fonts.main}
        fontWeight={fonts.weight}
        fontSize={140}
        fill={colors.amarelo}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {fmt(value)}
      </text>
    </g>
  );
};

// Termômetro (tela) que desce até abaixo de zero
export const Thermometer: React.FC<{ frame: number; from: number; to: number }> = ({ frame, from, to }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to + 1000, fps);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const x = 790;
  const top = 700;
  const bottom = 1090;
  const zeroLevel = 0.32;
  const level = interpolate(frame, [from + 12, to], [0.85, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const liquidTop = bottom - (bottom - top) * level;
  const zeroY = bottom - (bottom - top) * zeroLevel;
  const below = level < zeroLevel;
  return (
    <g transform={`translate(${x} ${bottom}) scale(${s}) translate(${-x} ${-bottom})`}>
      <rect x={x - 38} y={top - 20} width={76} height={bottom - top + 40} rx={38} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={x - 18} y={liquidTop} width={36} height={bottom - liquidTop + 20} fill={below ? colors.ceu : colors.coral} />
      <circle cx={x} cy={bottom + 40} r={62} fill={below ? colors.ceu : colors.coral} stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M ${x - 38} ${zeroY} L ${x + 60} ${zeroY}`} stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinecap="round" />
      <text
        x={x + 72}
        y={zeroY + 22}
        fontFamily={fonts.main}
        fontWeight={fonts.weight}
        fontSize={64}
        fill={colors.amarelo}
        style={outlined(12)}
      >
        0 °C
      </text>
    </g>
  );
};

// Lua: aparece e depois apaga (fica só o contorno escuro)
export const Moon: React.FC<{ frame: number; appear: number; off: number }> = ({ frame, appear, off }) => {
  const { fps } = useVideoConfig();
  const ink = useInk();
  if (frame < appear) return null;
  const s = spring({ frame: frame - appear, fps, config: { damping: 12, mass: 0.7 } });
  const fill = interpolateColors(frame, [off, off + 14], [colors.creme, "#2A2350"]);
  const crater = interpolateColors(frame, [off, off + 14], [colors.chao, "#241E46"]);
  const x = 800;
  const y = 560;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={88} fill={fill} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={-28} cy={-20} r={18} fill={crater} />
      <circle cx={30} cy={22} r={13} fill={crater} />
      <circle cx={-6} cy={40} r={9} fill={crater} />
    </g>
  );
};

// Flash curto em tela cheia
export const Flash: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const o = interpolate(frame, [at, at + 1, at + 7], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return <rect x={0} y={0} width={1080} height={1920} fill={colors.creme} opacity={o} />;
};
