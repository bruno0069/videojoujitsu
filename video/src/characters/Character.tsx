import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * Moldura comum: posicionamento, entrada com slide + spring,
 * respiração (escala 1 → 1,02 em loop) e espelhamento opcional.
 */
export const CharacterFrame: React.FC<{
  x: number; // posição do centro dos pés, em px
  y: number; // linha do chão, em px
  height?: number; // altura em px
  flip?: boolean;
  enterAt?: number;
  enterFrom?: "left" | "right" | "none";
  breathOffset?: number;
  children: React.ReactNode;
}> = ({ x, y, height = 520, flip, enterAt = 0, enterFrom = "none", breathOffset = 0, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vbW = 320;
  const vbH = 340;
  const width = (height * vbW) / vbH;
  const s = spring({ frame: frame - enterAt, fps, config: { damping: 18, stiffness: 90 } });
  const dx = enterFrom === "none" ? 0 : (1 - s) * (enterFrom === "left" ? -1 : 1) * 900;
  const opacity = enterFrom === "none" ? Math.min(1, Math.max(0, (frame - enterAt) / 10)) : frame < enterAt ? 0 : 1;
  const breath = 1 + (Math.sin(((frame + breathOffset) / fps) * Math.PI * 2 * 0.3) + 1) * 0.01;
  // Pés no centro do viewBox: x = 100 de 320 (viewBox começa em -60) → 160/320 = 0,5.
  return (
    <div
      style={{
        position: "absolute",
        left: x - width / 2,
        top: y - height,
        width,
        height,
        translate: `${dx}px 0px`,
        opacity,
      }}
    >
      <svg
        viewBox="-60 10 320 340"
        width={width}
        height={height}
        style={{ overflow: "visible", scale: `${flip ? -1 : 1} ${breath}`, transformOrigin: "50% 100%" }}
      >
        {children}
      </svg>
    </div>
  );
};
