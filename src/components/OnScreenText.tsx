import React from "react";
import { AbsoluteFill, spring, useVideoConfig } from "remotion";
import { colors, fonts, ink, onScreenText as t } from "../theme";

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

export const OnScreenText: React.FC<{ text: string; frame: number; from: number; animate: boolean }> = ({
  text,
  frame,
  from,
  animate,
}) => {
  const { fps } = useVideoConfig();
  if (!text || frame < from) return null;
  const s = animate ? spring({ frame: frame - from, fps, config: { damping: 11, mass: 0.7, stiffness: 140 } }) : 1;
  const lines = splitLines(text);
  const fontSize = fitFontSize(lines);
  return (
    <AbsoluteFill style={{ alignItems: "center", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: t.top,
          maxWidth: t.maxWidth,
          padding: `${t.paddingY}px ${t.paddingX}px`,
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `0 ${ink.stroke * 0.6}px 0 ${t.borderColor}`,
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
