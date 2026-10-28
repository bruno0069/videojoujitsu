import React, { useMemo } from "react";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption, TikTokPage } from "@remotion/captions";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { captions as c, fonts, ink, layout } from "../theme";

// Legenda palavra por palavra; a palavra atual fica em amarelo.
export const Captions: React.FC<{ captions: Caption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();
  const { pages } = useMemo(
    () => createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds: c.combineWithinMs }),
    [captions],
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const lastToken = page.tokens[page.tokens.length - 1];
        const startFrame = Math.round((page.startMs / 1000) * fps);
        // Some logo depois da última palavra, para não invadir a cena seguinte
        const endMs = next ? Math.min(next.startMs, lastToken.toMs + 250) : lastToken.toMs + 250;
        const endFrame = Math.round((endMs / 1000) * fps);
        if (endFrame <= startFrame) return null;
        return (
          <Sequence key={index} from={startFrame} durationInFrames={endFrame - startFrame} layout="none" name={`Legenda ${index + 1}`}>
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6, stiffness: 160 } });

  return (
    <AbsoluteFill
      style={{
        top: c.centerY - (c.fontSize * c.lineHeight * c.maxLines) / 2,
        height: c.fontSize * c.lineHeight * c.maxLines,
        left: layout.sideMargin,
        right: layout.sideMargin,
        width: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: c.fontSize,
          lineHeight: c.lineHeight,
          textAlign: "center",
          whiteSpace: "pre-wrap",
          color: c.textColor,
          WebkitTextStroke: `${ink.textStroke}px ${c.strokeColor}`,
          paintOrder: "stroke fill",
          scale: String(0.85 + 0.15 * enter),
        }}
      >
        {page.tokens.map((token, i) => {
          const nextToken = page.tokens[i + 1];
          const active = token.fromMs <= nowMs && (nextToken ? nextToken.fromMs > nowMs : token.toMs > nowMs);
          return (
            <span key={`${token.fromMs}-${i}`} style={{ color: active ? c.activeColor : c.textColor }}>
              {token.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
