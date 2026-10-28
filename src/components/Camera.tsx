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

// Converte um ponto do mundo para a tela com a câmera atual.
export const toScreen = (cam: Cam, x: number, y: number) => ({
  x: 540 + (x - cam.x) * cam.zoom,
  y: 960 + (y - cam.y) * cam.zoom,
});

// Câmera de um plano: zoom de `from` para `to` mantendo o ponto de foco parado na tela.
// "punch" = entra com mola (leve overshoot) e segue num empurrão lento de 3%.
export const shotCamera = (opts: {
  local: number;
  length: number;
  fps: number;
  from: number;
  to: number;
  focus: { x: number; y: number };
  punch: boolean;
}): Cam => {
  const { local, length, fps, from, to, focus, punch } = opts;
  const zoom = punch
    ? from +
      (to - from) * spring({ frame: local, fps, config: { damping: 12, mass: 0.6, stiffness: 170 } }) +
      interpolate(local, [12, length], [0, to * 0.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : interpolate(local, [0, Math.max(1, length - 1)], [from, to], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.inOut(Easing.quad),
      });
  return {
    zoom,
    x: focus.x - (focus.x - 540) / zoom,
    y: focus.y - (focus.y - 960) / zoom,
  };
};

// Tremida de tela: deslocamento pseudoaleatório que perde força ao longo de `frames`.
export const shakeOffset = (frame: number, at: number, frames: number, force: number) => {
  if (frame < at || frame >= at + frames) return { x: 0, y: 0 };
  const k = 1 - (frame - at) / frames;
  return {
    x: Math.sin(frame * 12.9898) * force * k,
    y: Math.cos(frame * 78.233) * force * k,
  };
};
