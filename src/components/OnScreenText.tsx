import React from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { colors, cornerText, fonts, ink, onScreenText as t, sticker as stickerTheme } from "../theme";

// Quebra em no máximo 2 linhas: " · " vira quebra; texto longo é dividido no espaço mais equilibrado.
export const splitLines = (text: string): string[] => {
  if (text.includes(" · ")) return text.split(" · ").slice(0, 2);
  if (text.length <= 18) return [text];
  const spaces = [...text.matchAll(/ /g)].map((m) => m.index ?? 0);
  let best = spaces[0] ?? text.length;
  for (const i of spaces) {
    if (Math.max(i, text.length - i - 1) < Math.max(best, text.length - best - 1)) best = i;
  }
  return [text.slice(0, best), text.slice(best + 1)];
};

const charWidth = (line: string) => {
  const upper = line.replace(/[^A-ZÀ-Ý]/g, "").length;
  return upper > line.length / 2 ? 0.6 : 0.5;
};

export const fitFontSize = (lines: string[]) => {
  const avail = t.maxWidth - 2 * t.paddingX;
  const sizes = lines.map((l) => avail / (l.length * charWidth(l)));
  return Math.round(Math.max(t.minFontSize, Math.min(t.maxFontSize, ...sizes)));
};

const words = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// O texto só repete a fala? (75% ou mais das palavras aparecem na narração da cena)
export const repeatsNarration = (text: string, narration: string) => {
  const t = words(text);
  if (t.length === 0) return true;
  const n = new Set(words(narration));
  return t.filter((w) => n.has(w)).length / t.length >= 0.75;
};

// Números ficam em amarelo (destaque)
const renderLine = (line: string) =>
  line.split(/(\d+)/).map((part, i) =>
    /^\d+$/.test(part) ? (
      <span key={i} style={{ color: t.highlightColor }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  );

export const OnScreenText: React.FC<{ text: string; frame: number; from: number; to: number; animate: boolean; sticker?: boolean; corner?: boolean; top?: number }> = ({
  text,
  frame,
  from,
  to,
  animate,
  sticker,
  corner,
  top,
}) => {
  const { fps } = useVideoConfig();
  if (!text || frame < from || frame >= to) return null;
  if (sticker) return <Sticker text={text} frame={frame} from={from} to={to} />;
  if (corner) return <Corner text={text} />;
  const enter = animate ? spring({ frame: frame - from, fps, config: { damping: 9, mass: 0.6, stiffness: 170 } }) : 1;
  // Sem animação (título de capa), o texto entra e sai seco
  const exit = animate ? interpolate(frame, [to - 5, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  const s = enter * exit;
  const lines = splitLines(text);
  const fontSize = fitFontSize(lines);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: top ?? t.top,
          maxWidth: t.maxWidth,
          padding: `${t.paddingY}px ${t.paddingX}px`,
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          // filete creme por dentro + sombra chapada de tinta
          boxShadow: `inset 0 0 0 9px ${t.boxColor}, inset 0 0 0 13px ${t.innerLine}, 0 ${ink.stroke * 0.6}px 0 ${t.borderColor}`,
          scale: String(s),
          transformOrigin: "50% 0%",
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize,
          lineHeight: 1.08,
          color: t.textColor,
          WebkitTextStroke: `${ink.textStroke}px ${colors.tinta}`,
          paintOrder: "stroke fill",
          whiteSpace: "pre",
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{renderLine(l)}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Selo pequeno de lugar (caixa tinta com filete creme), parado no canto superior esquerdo
const Corner: React.FC<{ text: string }> = ({ text }) => {
  const c = cornerText;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: c.top,
          left: c.left,
          padding: `${c.paddingY}px ${c.paddingX}px`,
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.5}px solid ${t.borderColor}`,
          borderRadius: c.radius,
          boxShadow: `inset 0 0 0 6px ${t.boxColor}, inset 0 0 0 9px ${t.innerLine}, 0 ${ink.stroke * 0.5}px 0 ${t.borderColor}`,
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: c.fontSize,
          lineHeight: 1.1,
          color: t.textColor,
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// Sticker grande de chamada (CTA): entra em pop com bounce na faixa de 55–65% da altura
const Sticker: React.FC<{ text: string; frame: number; from: number; to: number }> = ({ text, frame, from, to }) => {
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - from, fps, config: { damping: 7, mass: 0.6, stiffness: 190 } });
  const exit = interpolate(frame, [to - 5, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lines = splitLines(text);
  const st = stickerTheme;
  // Cabe na largura mesmo girado (maiúsculas do Baloo 2 ocupam ~0,7 em)
  const avail = st.maxWidth - 2 * st.paddingX - 60;
  const fontSize = Math.min(st.fontSize, ...lines.map((l) => avail / (l.length * 0.7)));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: st.centerY,
          translate: "0 -50%",
          maxWidth: st.maxWidth,
          padding: `${st.paddingY}px ${st.paddingX}px`,
          backgroundColor: st.boxColor,
          border: `${ink.stroke * 0.7}px solid ${colors.tinta}`,
          borderRadius: st.radius,
          boxShadow: `0 ${ink.stroke}px 0 ${colors.tinta}`,
          scale: String(enter * exit),
          rotate: `${st.rotate}deg`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize,
          lineHeight: 1.06,
          color: colors.creme,
          WebkitTextStroke: `${ink.textStroke + 2}px ${colors.tinta}`,
          paintOrder: "stroke fill",
          whiteSpace: "pre",
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{renderLine(l)}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
