import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { InkScale } from "./Ink";

// Câmera virtual: o ponto (x, y) do mundo fica no centro da tela, com zoom.
// Cada camada do cenário aplica a câmera multiplicada pela sua profundidade (parallax).
export type Cam = { zoom: number; x: number; y: number };

export const BASE_CAM: Cam = { zoom: 1, x: 540, y: 960 };

export const Layer: React.FC<{ cam: Cam; depth: number; children: React.ReactNode }> = ({ cam, depth, children }) => {
  const z = 1 + (cam.zoom - 1) * depth;
  const x = 540 + (cam.x - 540) * depth;
  const y = 960 + (cam.y - 960) * depth;
  return (
    <g transform={`translate(540 960) scale(${z}) translate(${-x} ${-y})`}>
      <InkScale scale={z}>{children}</InkScale>
    </g>
  );
};

type Segment = { from: number; to: number; target: Cam };

// Gera um movimento de câmera a cada 2–4 s, sem cortes: cada trecho
// muda o enquadramento com mola (leve overshoot) e segue com um empurrão lento.
export const planCamera = (opts: {
  duration: number;
  cuts: number[];
  focus: { x: number; y: number }[];
  shot: string;
  start: "base" | "punch";
  endAtBase: boolean;
}): Segment[] => {
  const bounds = [0, ...opts.cuts.filter((c) => c > 0 && c < opts.duration), opts.duration];
  const segs: Segment[] = [];
  const amp = opts.shot === "close" ? 0.5 : 1;
  const pattern = [
    { zoom: 1.0, dx: 0, dy: 0, f: -1 },
    { zoom: 1.13, dx: 0, dy: 0, f: 0 },
    { zoom: 1.06, dx: 0, dy: 0, f: 1 },
    { zoom: 1.16, dx: 0, dy: 30, f: 0 },
    { zoom: 1.04, dx: -40, dy: -20, f: -1 },
  ];
  for (let b = 0; b < bounds.length - 1; b++) {
    const len = bounds[b + 1] - bounds[b];
    const n = Math.max(1, Math.round(len / 90));
    for (let i = 0; i < n; i++) {
      const from = bounds[b] + Math.round((len * i) / n);
      const to = bounds[b] + Math.round((len * (i + 1)) / n);
      const p = pattern[(i + b) % pattern.length];
      const focus = p.f >= 0 && opts.focus.length > 0 ? opts.focus[p.f % opts.focus.length] : { x: 540, y: 960 };
      const zoom = 1 + (p.zoom - 1) * amp;
      // Aproxima o centro do ponto de foco na proporção do zoom
      const k = p.f >= 0 ? Math.min(0.6, (zoom - 1) * 4) : 0;
      segs.push({
        from,
        to,
        target: {
          zoom,
          x: 540 + (focus.x - 540) * k + p.dx * amp,
          y: 960 + (focus.y - 960) * k + p.dy * amp,
        },
      });
    }
  }
  if (opts.endAtBase && segs.length > 0) segs[segs.length - 1].target = BASE_CAM;
  return segs;
};

const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  zoom: a.zoom + (b.zoom - a.zoom) * t,
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export const cameraAt = (
  frame: number,
  fps: number,
  segs: Segment[],
  cuts: number[],
  start: "base" | "punch",
  endAtBase: boolean,
): Cam => {
  const idx = Math.max(0, segs.findIndex((s) => frame >= s.from && frame < s.to));
  const seg = segs[idx] ?? segs[segs.length - 1];
  const isCutStart = idx === 0 || cuts.includes(seg.from);
  const prev: Cam = isCutStart
    ? start === "base" && idx === 0
      ? seg.target
      : { ...seg.target, zoom: seg.target.zoom * 1.07 }
    : segs[idx - 1].target;
  const local = frame - seg.from;
  const s = spring({ frame: local, fps, config: { damping: 13, mass: 0.9, stiffness: 110 } });
  const cam = lerpCam(prev, seg.target, s);
  // Empurrão contínuo, para nenhum plano ficar parado
  const isLast = idx === segs.length - 1;
  const segLen = seg.to - seg.from;
  const drift = isLast && endAtBase
    ? interpolate(local, [0, segLen], [0.035, 0], { easing: Easing.out(Easing.quad), extrapolateRight: "clamp" })
    : interpolate(local, [0, segLen], [0, 0.03], { extrapolateRight: "clamp" });
  return { ...cam, zoom: cam.zoom + drift };
};
