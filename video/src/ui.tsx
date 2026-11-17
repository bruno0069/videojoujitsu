import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "./theme";
import type { SceneTiming } from "./timeline";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Duração padrão das animações: 400 ms. */
export const ANIM = Math.round(0.4 * FPS);

/** Progresso 0→1 de uma entrada a partir de `from`. */
export const useIn = (from: number, dur = ANIM) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [from, from + dur], [0, 1], { ...clamp, easing: ease });
};

/** Opacidade de algo visível entre `from` e `to` (fade de entrada e saída). */
export const useWindow = (from: number, to: number = Infinity, dur = ANIM) => {
  const frame = useCurrentFrame();
  const inP = interpolate(frame, [from, from + dur], [0, 1], { ...clamp, easing: ease });
  const outP = to === Infinity ? 1 : interpolate(frame, [to - dur, to], [1, 0], { ...clamp, easing: ease });
  return Math.min(inP, outP);
};

/** Wrapper com fade + slide de entrada. */
export const Reveal: React.FC<{
  from: number;
  to?: number;
  dx?: number;
  dy?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ from, to, dx = 0, dy = 40, style, children }) => {
  const p = useIn(from);
  const o = useWindow(from, to);
  return (
    <div
      style={{
        opacity: o,
        translate: `${(1 - p) * dx}px ${(1 - p) * dy}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Header: React.FC<{ num?: string; title: string; icon?: React.ReactNode; color?: string }> = ({
  num,
  title,
  icon,
  color = C.green,
}) => {
  const p = useIn(0);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1920,
        height: 120,
        background: color,
        display: "flex",
        alignItems: "center",
        gap: 28,
        paddingLeft: 90,
        boxSizing: "border-box",
        translate: `0px ${(p - 1) * 120}px`,
        fontFamily: FONT,
        color: C.white,
      }}
    >
      {icon ? <div style={{ width: 76, height: 76 }}>{icon}</div> : null}
      {num ? (
        <div style={{ fontSize: 34, fontWeight: 700, opacity: 0.85, letterSpacing: 2 }}>{num}</div>
      ) : null}
      <div style={{ fontSize: 54, fontWeight: 800, letterSpacing: 0.5 }}>{title}</div>
    </div>
  );
};

/** Legenda: uma frase por vez, sincronizada com os tempos do áudio. */
export const Subtitles: React.FC<{ scene: SceneTiming }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const caps = scene.captions;
  let idx = -1;
  for (let i = 0; i < caps.length; i++) {
    if (t >= caps[i].start) idx = i;
  }
  if (idx < 0) return null;
  const cap = caps[idx];
  // A frase permanece até a próxima começar (ou até o fim da fala + 0,3 s).
  const hideAt = idx + 1 < caps.length ? caps[idx + 1].start : cap.end + 0.3;
  if (t >= hideAt) return null;
  const startF = Math.round(cap.start * FPS);
  const o = interpolate(frame, [startF, startF + 6], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 36,
        display: "flex",
        justifyContent: "center",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          maxWidth: 1680,
          background: "rgba(10,14,12,0.88)",
          color: C.white,
          fontSize: 46,
          fontWeight: 600,
          lineHeight: 1.28,
          padding: "16px 36px",
          borderRadius: 14,
          textAlign: "center",
          opacity: o,
        }}
      >
        {cap.text}
      </div>
    </div>
  );
};

export const SceneBg: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = C.bg, children }) => (
  <div style={{ position: "absolute", inset: 0, background: color, fontFamily: FONT, color: C.ink, overflow: "hidden" }}>
    {children}
  </div>
);
