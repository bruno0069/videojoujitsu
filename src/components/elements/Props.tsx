import React from "react";
import { Easing, interpolate, interpolateColors, spring, useVideoConfig } from "remotion";
import { colors, fonts, hud, infoLabel, ink as inkTheme } from "../../theme";
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

// Rótulo de informação: caixa tinta com filete creme (mesmo estilo do texto na tela).
// Vale dentro de camadas com câmera: o tamanho acompanha o zoom (nunca abaixo de 56 px).
// anchor "start" = a caixa começa em x; "middle" = centrada em x.
export const InfoLabel: React.FC<{ x: number; y: number; text: string; s?: number; anchor?: "start" | "middle"; fontSize?: number }> = ({
  x,
  y,
  text,
  s = 1,
  anchor = "middle",
  fontSize = infoLabel.fontSize,
}) => {
  const ink = useInk();
  if (s <= 0) return null;
  // maiúsculas são mais largas (rótulo todo em caixa alta, ex.: "EQUADOR")
  const upper = text.replace(/[^A-ZÀ-Ý]/g, "").length > text.length / 2;
  const w = text.length * fontSize * (upper ? 0.64 : 0.5) + 2 * infoLabel.paddingX;
  const h = fontSize * 1.05 + 2 * infoLabel.paddingY;
  const cx = anchor === "start" ? x + w / 2 : x;
  return (
    <g transform={`translate(${cx} ${y}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2 + ink * 0.6} width={w} height={h} rx={infoLabel.radius} fill={colors.tinta} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={infoLabel.radius} fill={colors.tinta} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <rect x={-w / 2 + 9} y={-h / 2 + 9} width={w - 18} height={h - 18} rx={infoLabel.radius - 8} fill="none" stroke={colors.creme} strokeWidth={4} />
      <text x={0} y={fontSize * 0.34} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={fontSize} fill={colors.creme}>
        {text}
      </text>
    </g>
  );
};

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

// Etiqueta curta com o nome sobre a cabeça (tela): sticker coral, o mesmo estilo da chamada final
export const NameTag: React.FC<{ frame: number; from: number; to: number; text: string; x: number; y: number }> = ({
  frame,
  from,
  to,
  text,
  x,
  y,
}) => {
  const color = colors.coral;
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

// Timer em contagem regressiva, fixo num canto (HUD). Entre `bigFrom` e `bigUntil` cresce
// para o close acima do Nico e depois volta. Fica parado no valor inicial até `holdUntil`,
// depois conta até 00:00 em `zeroAt` e pisca em coral.
// `frame` aqui é relativo ao início do timer.
export const Timer: React.FC<{
  frame: number;
  bigFrom: number;
  bigUntil: number;
  holdUntil: number;
  zeroAt: number;
  lockAt?: number;
  start: string;
  end: string;
}> = ({ frame, bigFrom, bigUntil, holdUntil, zeroAt, lockAt, start, end }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } });
  const cfg = { damping: 14, mass: 0.8, stiffness: 120 };
  const big = spring({ frame: frame - bigFrom, fps, config: cfg }) - spring({ frame: frame - bigUntil, fps, config: cfg });
  const value = interpolate(frame, [holdUntil, zeroAt], [parseClock(start), parseClock(end)], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(big, [0, 1], [hud.timer.x, hud.timerBig.x]);
  const y = interpolate(big, [0, 1], [hud.timer.y, hud.timerBig.y]);
  const s = interpolate(big, [0, 1], [hud.timer.scale, hud.timerBig.scale]) * enter;
  // No zero: pisca em coral; depois de travar, fica coral parado
  const locked = lockAt !== undefined && frame >= lockAt;
  const alert = frame >= zeroAt && (locked || Math.floor((frame - zeroAt) / 2) % 2 === 0);
  const digits = alert ? colors.coral : colors.amarelo;
  const pulse = frame >= zeroAt && !locked ? 1 + 0.12 * Math.abs(Math.sin(((frame - zeroAt) / 4) * Math.PI)) : 1;
  const ink = inkTheme.stroke / Math.max(0.01, s);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * pulse})`}>
      <rect x={-230} y={-85} width={460} height={170} rx={30} fill={colors.tinta} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-214} y={-69} width={428} height={138} rx={20} fill="none" stroke={colors.creme} strokeWidth={6 / Math.max(0.01, s)} />
      <text x={0} y={48} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={140} fill={digits} style={{ fontVariantNumeric: "tabular-nums" }}>
        {fmt(value)}
      </text>
    </g>
  );
};

// Selo curto ("agora") que marca a volta ao presente depois do gancho
export const Stamp: React.FC<{ frame: number; length: number; text: string }> = ({ frame, length, text }) => {
  const { fps } = useVideoConfig();
  const s = pop(frame, 0, length, fps, true);
  if (s <= 0) return null;
  const ink = inkTheme.stroke;
  const cx = 540;
  const cy = 330;
  const w = text.length * 96 * 0.62 + 90;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s}) rotate(-8)`}>
      <rect x={-w / 2} y={-70} width={w} height={140} rx={24} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-w / 2 + 14} y={-56} width={w - 28} height={112} rx={16} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.5} />
      <text x={0} y={34} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={96} fill={colors.tinta}>
        {text}
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
  const cx = 830;
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
  const x = big ? 830 : 790;
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
      <path d={`M ${x - tube} ${zeroY} L ${x + tube + 22} ${zeroY}`} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" />
      {/* Etiqueta acima do tubo, dentro do quadro e longe da cabeça do Nico */}
      <InfoLabel x={x} y={top - 110} text="0 °C" />
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

// Vento atravessando a tela (da esquerda para a direita): traços creme com contorno de tinta
// e, opcionalmente, folhas de papel girando. `forca` 0..1 controla quantos traços aparecem.
export const WindStreaks: React.FC<{ frame: number; from: number; to: number; forca?: number; papeis?: boolean }> = ({
  frame,
  from,
  to,
  forca = 1,
  papeis,
}) => {
  if (frame < from || frame >= to) return null;
  const ink = inkTheme.stroke;
  const k = interpolate(frame, [from, from + 12, to - 6, to], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const count = Math.round(4 + 8 * forca);
  const streaks = Array.from({ length: count }, (_, i) => {
    const y = 180 + ((i * 397) % 1500);
    const speed = 38 + (i % 4) * 10;
    const len = 160 + (i % 3) * 110;
    const x = ((frame - from) * speed + i * 263) % 1700 - 450;
    const curl = i % 4 === 1 ? " q 46 -8 34 -44 q -14 -28 -40 -6" : "";
    const d = `M ${x} ${y} l ${len} ${-len * 0.06}${curl}`;
    return (
      <g key={i} opacity={k * 0.9}>
        <path d={d} fill="none" stroke={colors.tinta} strokeWidth={ink * 1.9} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={colors.creme} strokeWidth={ink * 0.8} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  });
  const sheets = papeis
    ? [0, 1, 2].map((i) => {
        const t = (((frame - from) * (0.011 + i * 0.003) + i * 0.31) % 1) * 1.4 - 0.2;
        const x = t * 1300 - 100;
        const y = [300, 1640, 1780][i] + Math.sin(frame / 6 + i * 2) * 50; // longe dos rostos e da legenda
        return (
          <g key={`p${i}`} transform={`translate(${x} ${y}) rotate(${frame * (9 + i * 4)}) scale(1 ${0.6 + 0.4 * Math.sin(frame / 5 + i)})`} opacity={k}>
            <rect x={-46} y={-60} width={92} height={120} rx={6} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
            <path d="M -28 -30 L 28 -30 M -28 -6 L 22 -6 M -28 18 L 14 18" stroke={colors.tinta} strokeWidth={ink * 0.35} opacity={0.5} />
          </g>
        );
      })
    : null;
  return (
    <g>
      {streaks}
      {sheets}
    </g>
  );
};
