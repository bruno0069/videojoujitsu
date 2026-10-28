import React from "react";
import { Easing, interpolate, interpolateColors, spring, useVideoConfig } from "remotion";
import { colors, fonts, hud, ink as inkTheme } from "../../theme";
import { useInk } from "../Ink";

// Entrada em "pop" com mola; `bouncy` dá mais overshoot. Sai encolhendo em 6 frames.
export const pop = (frame: number, from: number, to: number, fps: number, bouncy = false) => {
  if (frame < from || frame >= to) return 0;
  const inS = spring({
    frame: frame - from,
    fps,
    config: bouncy ? { damping: 6, mass: 0.6, stiffness: 180 } : { damping: 11, mass: 0.7, stiffness: 140 },
  });
  const outS = interpolate(frame, [to - 6, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return inS * outS;
};

const outlined = (stroke: number): React.CSSProperties => ({
  WebkitTextStroke: `${stroke}px ${colors.tinta}`,
  paintOrder: "stroke fill",
});

// Balão de fala (tela), com rabicho apontando para (ax, ay)
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
  const s = pop(frame, from, to, fps, true);
  if (s <= 0) return null;
  const fontSize = text.length <= 4 ? 100 : 70;
  const w = Math.max(240, text.length * fontSize * 0.6 + 90);
  const h = fontSize * 1.45;
  const bx = Math.min(ax + 40, 990 - w);
  const by = ay - h - 70;
  const tx = Math.max(bx + 30, Math.min(ax - 30, bx + w - 110));
  return (
    <g transform={`translate(${ax} ${ay}) scale(${s}) translate(${-ax} ${-ay})`}>
      <path d={`M ${tx} ${by + h - 4} L ${ax} ${ay} L ${tx + 80} ${by + h - 4} Z`} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={bx} y={by} width={w} height={h} rx={h / 2} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M ${tx + 6} ${by + h - 4} L ${tx + 74} ${by + h - 4}`} stroke={colors.creme} strokeWidth={ink * 1.4} />
      <text x={bx + w / 2} y={by + h / 2 + fontSize * 0.33} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={fontSize} fill={colors.tinta}>
        {text}
      </text>
    </g>
  );
};

// Etiqueta curta com o nome, na cor do personagem, sobre a cabeça (tela)
export const NameTag: React.FC<{ frame: number; from: number; to: number; text: string; color: string; x: number; y: number }> = ({
  frame,
  from,
  to,
  text,
  color,
  x,
  y,
}) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to, fps, true);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const fontSize = 76;
  const w = text.length * fontSize * 0.66 + 70;
  const h = fontSize * 1.3;
  const cx = Math.max(90 + w / 2, Math.min(990 - w / 2, x));
  const cy = Math.max(250, y - h / 2);
  return (
    <g transform={`translate(${cx} ${cy + h / 2}) scale(${s}) rotate(${-4}) translate(${-cx} ${-(cy + h / 2)})`}>
      <rect x={cx - w / 2} y={cy - h / 2 + 8} width={w} height={h} rx={22} fill={colors.tinta} />
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={22} fill={color} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      <text x={cx} y={cy + fontSize * 0.36} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={fontSize} fill={colors.creme} style={outlined(12)}>
        {text}
      </text>
    </g>
  );
};

const parseClock = (s: string) => {
  const [m, sec] = s.split(":").map((v) => parseInt(v, 10));
  return m * 60 + sec;
};

const fmt = (total: number) => {
  const t = Math.max(0, Math.ceil(total));
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

// Timer em contagem regressiva. Começa grande no centro (close) e vira HUD fixo num canto.
// `frame` aqui é relativo ao início do timer.
export const Timer: React.FC<{ frame: number; length: number; bigUntil: number; start: string; end: string }> = ({
  frame,
  length,
  bigUntil,
  start,
  end,
}) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } });
  const move = spring({ frame: frame - bigUntil, fps, config: { damping: 14, mass: 0.8, stiffness: 120 } });
  const value = interpolate(frame, [12, length - 1], [parseClock(start), parseClock(end)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const big = { x: 540, y: 760, s: 1.6 };
  const x = interpolate(move, [0, 1], [big.x, hud.timer.x]);
  const y = interpolate(move, [0, 1], [big.y, hud.timer.y]);
  const s = interpolate(move, [0, 1], [big.s, hud.timer.scale]) * enter;
  // Pulso no zero
  const zero = frame >= length - 8 ? 1 + 0.12 * Math.sin(((frame - (length - 8)) / 8) * Math.PI) : 1;
  const ink = inkTheme.stroke / s;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * zero})`}>
      <rect x={-230} y={-85} width={460} height={170} rx={30} fill={colors.tinta} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-214} y={-69} width={428} height={138} rx={20} fill={colors.noite} />
      <text x={0} y={48} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={140} fill={colors.amarelo} style={{ fontVariantNumeric: "tabular-nums" }}>
        {fmt(value)}
      </text>
    </g>
  );
};

// Prova de matemática com a nota em pop (tela)
export const TestPaper: React.FC<{ frame: number; from: number; to: number; gradeAt: number; grade: string }> = ({ frame, from, to, gradeAt, grade }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to, fps);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const cx = 770;
  const cy = 820;
  const g = frame >= gradeAt ? spring({ frame: frame - gradeAt, fps, config: { damping: 6, mass: 0.5, stiffness: 200 } }) : 0;
  const lines = [0, 1, 2, 3, 4].map((i) => (
    <path key={i} d={`M ${cx - 110} ${cy - 30 + i * 46} L ${cx + 110 - (i % 2) * 50} ${cy - 30 + i * 46}`} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinecap="round" opacity={0.5} />
  ));
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) rotate(6) translate(${-cx} ${-cy})`}>
      <rect x={cx - 150} y={cy - 200} width={300} height={400} rx={14} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <text x={cx - 120} y={cy - 130} fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={50} fill={colors.tinta}>
        PROVA
      </text>
      <text x={cx - 120} y={cy - 85} fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={30} fill={colors.tinta}>
        MATEMÁTICA
      </text>
      {lines}
      {g > 0 ? (
        <g transform={`translate(${cx + 70} ${cy - 120}) scale(${g}) rotate(-12)`}>
          <circle r={78} fill="none" stroke={colors.coral} strokeWidth={ink * 0.9} />
          <text x={0} y={26} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={78} fill={colors.coral}>
            {grade}
          </text>
        </g>
      ) : null}
    </g>
  );
};

// Termômetro (tela) que desce até abaixo de zero
export const Thermometer: React.FC<{ frame: number; from: number; to: number; big?: boolean }> = ({ frame, from, to, big }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, from, to + 10000, fps, true);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const x = big ? 800 : 790;
  const top = big ? 520 : 700;
  const bottom = big ? 1110 : 1090;
  const tube = big ? 58 : 38;
  const bulb = big ? 92 : 62;
  const zeroLevel = 0.3;
  const level = interpolate(frame, [from + 12, to], [0.88, 0.1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const liquidTop = bottom - (bottom - top) * level;
  const zeroY = bottom - (bottom - top) * zeroLevel;
  const below = level < zeroLevel;
  const fill = below ? colors.ceu : colors.coral;
  const ticks = [0.1, 0.5, 0.7, 0.9].map((l) => {
    const y = bottom - (bottom - top) * l;
    return <path key={l} d={`M ${x - tube} ${y} L ${x - tube + 26} ${y}`} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinecap="round" />;
  });
  return (
    <g transform={`translate(${x} ${bottom}) scale(${s}) translate(${-x} ${-bottom})`}>
      <rect x={x - tube} y={top - 30} width={tube * 2} height={bottom - top + 60} rx={tube} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={x - tube * 0.45} y={liquidTop} width={tube * 0.9} height={bottom - liquidTop + 30} fill={fill} />
      <circle cx={x} cy={bottom + bulb * 0.65} r={bulb} fill={fill} stroke={colors.tinta} strokeWidth={ink} />
      {ticks}
      <path d={`M ${x - tube} ${zeroY} L ${x + tube + 24} ${zeroY}`} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" />
      <text x={x - tube - 18} y={zeroY + 24} textAnchor="end" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={big ? 72 : 64} fill={colors.amarelo} style={outlined(12)}>
        0 °C
      </text>
    </g>
  );
};

// Lua: aparece, pisca e apaga (fica só o contorno escuro)
export const Moon: React.FC<{ frame: number; appear: number; blink?: number; off: number }> = ({ frame, appear, blink, off }) => {
  const { fps } = useVideoConfig();
  const ink = useInk();
  if (frame < appear) return null;
  const s = spring({ frame: frame - appear, fps, config: { damping: 12, mass: 0.7 } });
  const flicker = blink !== undefined && frame >= blink && frame < off && Math.floor((frame - blink) / 4) % 2 === 1;
  const dark = "#2A2350";
  const fill = flicker ? dark : interpolateColors(frame, [off, off + 6], [colors.creme, dark]);
  const crater = flicker ? "#241E46" : interpolateColors(frame, [off, off + 6], [colors.chao, "#241E46"]);
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

// Flash branco curto (no máximo 4 frames)
export const Flash: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const o = interpolate(frame, [at, at + 1, at + 4], [0, 0.95, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (o <= 0) return null;
  return <rect x={0} y={0} width={1080} height={1920} fill={colors.branco} opacity={o} />;
};

// Vinheta chapada (sem gradiente): moldura azul-noite com cantos arredondados que se fecha aos poucos
export const Vignette: React.FC<{ frame: number; from: number }> = ({ frame, from }) => {
  if (frame < from) return null;
  const t = interpolate(frame, [from, from + 60], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const m = 10 + 40 * t;
  const r = 140;
  const d = `M 0 0 H 1080 V 1920 H 0 Z M ${m + r} ${m} H ${1080 - m - r} A ${r} ${r} 0 0 1 ${1080 - m} ${m + r} V ${1920 - m - r} A ${r} ${r} 0 0 1 ${1080 - m - r} ${1920 - m} H ${m + r} A ${r} ${r} 0 0 1 ${m} ${1920 - m - r} V ${m + r} A ${r} ${r} 0 0 1 ${m + r} ${m} Z`;
  return <path d={d} fill={colors.ceuMeio} fillRule="evenodd" opacity={0.4 * t} />;
};
