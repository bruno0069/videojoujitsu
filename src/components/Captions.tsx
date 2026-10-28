import React, { useMemo } from "react";
import type { Caption } from "@remotion/captions";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { captions as c, fonts, layout } from "../theme";

type Page = { startMs: number; endMs: number; tokens: Caption[] };

// Agrupa as palavras em páginas de N palavras, sem atravessar o fim de uma cena.
const toPages = (captions: Caption[], size: number): Page[] => {
  const pages: Page[] = [];
  let cur: Caption[] = [];
  captions.forEach((cap, i) => {
    cur.push(cap);
    if (cur.length === size || cap.pageBreakAfter || i === captions.length - 1) {
      pages.push({ startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, tokens: cur });
      cur = [];
    }
  });
  return pages;
};

// Legenda palavra por palavra; a palavra atual fica em amarelo e dá um pulinho.
export const Captions: React.FC<{ captions: Caption[]; showFromFrame: number; hideAfterFrame: number }> = ({
  captions,
  showFromFrame,
  hideAfterFrame,
}) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(() => toPages(captions, c.wordsPerPage), [captions]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const next = pages[index + 1] ?? null;
        const startFrame = Math.max(showFromFrame, Math.round((page.startMs / 1000) * fps));
        // Some logo depois da última palavra, para não invadir a cena seguinte nem o quadro final do loop
        const endMs = next ? Math.min(next.startMs, page.endMs + c.holdMs) : page.endMs + c.holdMs;
        const endFrame = Math.min(hideAfterFrame, Math.round((endMs / 1000) * fps));
        if (endFrame <= startFrame) return null;
        return (
          <Sequence key={index} from={startFrame} durationInFrames={endFrame - startFrame} layout="none" name={`Legenda ${index + 1}`}>
            <CaptionPage page={page} fromMs={(startFrame / fps) * 1000} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: Page; fromMs: number }> = ({ page, fromMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = fromMs + (frame / fps) * 1000;
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
          color: c.textColor,
          WebkitTextStroke: `${c.stroke}px ${c.strokeColor}`,
          paintOrder: "stroke fill",
          scale: String(0.85 + 0.15 * enter),
        }}
      >
        {page.tokens.map((token, i) => {
          const nextToken = page.tokens[i + 1];
          const active = token.startMs <= nowMs && (nextToken ? nextToken.startMs > nowMs : token.endMs > nowMs);
          const since = ((nowMs - token.startMs) / 1000) * fps;
          const bump = active ? 1 + 0.18 * (1 - spring({ frame: since, fps, config: { damping: 9, mass: 0.4, stiffness: 220 } })) + 0.06 : 1;
          return (
            <span
              key={`${token.startMs}-${i}`}
              style={{ display: "inline-block", margin: "0 0.26em", color: active ? c.activeColor : c.textColor, scale: String(bump) }}
            >
              {token.text.trim()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
