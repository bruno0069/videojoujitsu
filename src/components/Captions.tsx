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

// Estilo "placa" (ep03 v4 em diante): uma linha só, até 4 palavras, quebra em fronteira de
// sentido (depois de pontuação, nunca deixando artigo/preposição/conjunção no fim da página),
// placa de tinta translúcida atrás e destaque amarelo só em palavra de conteúdo.
const FUNCIONAIS = new Set(
  "a o as os um uma uns umas de da do das dos em na no nas nos e ou mas que se por para pra pro com sem ao à aos às num numa nem como".split(" "),
);
const nua = (t: string) => t.toLowerCase().replace(/[^\p{L}\d]/gu, "");
const funcional = (t: string) => FUNCIONAIS.has(nua(t));
const toPagesPlaca = (captions: Caption[], size: number): Page[] => {
  const pages: Page[] = [];
  let cur: Caption[] = [];
  const flush = () => {
    if (cur.length) pages.push({ startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, tokens: cur });
    cur = [];
  };
  captions.forEach((cap, i) => {
    cur.push(cap);
    const fim = cap.pageBreakAfter || i === captions.length - 1 || /[.,:;?!…]$/.test(cap.text.trim());
    if (fim) return flush();
    if (cur.length >= size) {
      // não termina a página em palavra funcional: ela passa para a próxima
      const carry: Caption[] = [];
      while (cur.length > 1 && funcional(cur[cur.length - 1].text)) carry.unshift(cur.pop() as Caption);
      flush();
      cur = carry;
    }
  });
  flush();
  return pages;
};

// Legenda palavra por palavra; a palavra atual fica em amarelo e dá um pulinho.
// Sem pontuação na tela: tira ponto, vírgula, dois-pontos e ponto e vírgula do fim de cada
// palavra (o "1.700" fica como está) e a maiúscula que sobrava no meio do bloco. O texto da
// narração não muda.
const semPontuacao = (t: string) => t.replace(/[.,:;]+$/, "");
// Depois de um ponto tirado, a palavra seguinte do bloco fica minúscula (menos nomes próprios)
const semMaiuscula = (t: string, prev: string | undefined) =>
  prev !== undefined && /[.:;]$/.test(prev.trim()) && !c.nomesProprios.includes(t.replace(/[^\p{L}]/gu, ""))
    ? t.charAt(0).toLowerCase() + t.slice(1)
    : t;

export const Captions: React.FC<{ captions: Caption[]; showFromFrame: number; hideAfterFrame: number; stripPunctuation?: boolean; placa?: boolean }> = ({
  captions,
  showFromFrame,
  hideAfterFrame,
  stripPunctuation,
  placa,
}) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(() => (placa ? toPagesPlaca(captions, 4) : toPages(captions, c.wordsPerPage)), [captions, placa]);

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
            <CaptionPage page={page} fromMs={(startFrame / fps) * 1000} strip={stripPunctuation === true} placa={placa === true} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const CaptionPage: React.FC<{ page: Page; fromMs: number; strip: boolean; placa: boolean }> = ({ page, fromMs, strip, placa }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = fromMs + (frame / fps) * 1000;
  const enter = spring({ frame, fps, config: { damping: 12, mass: 0.6, stiffness: 160 } });
  const textos = page.tokens.map((token, i) => (strip ? semMaiuscula(semPontuacao(token.text.trim()), page.tokens[i - 1]?.text) : token.text.trim()));
  // placa: uma linha só; a fonte diminui se as palavras não couberem
  const chars = textos.join(" ").length;
  const fontSize = placa ? Math.min(c.fontSize, Math.floor((1080 - 2 * layout.sideMargin - 80) / (chars * 0.56))) : c.fontSize;

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
          fontSize,
          lineHeight: c.lineHeight,
          textAlign: "center",
          color: c.textColor,
          WebkitTextStroke: `${placa ? 7 : c.stroke}px ${c.strokeColor}`,
          paintOrder: "stroke fill",
          scale: String(0.85 + 0.15 * enter),
          ...(placa
            ? { whiteSpace: "nowrap", backgroundColor: "rgba(27, 27, 47, 0.7)", borderRadius: 28, padding: "12px 26px 16px" }
            : {}),
        }}
      >
        {page.tokens.map((token, i) => {
          const nextToken = page.tokens[i + 1];
          const falando = token.startMs <= nowMs && (nextToken ? nextToken.startMs > nowMs : token.endMs > nowMs);
          // no estilo placa, o destaque só cai em palavra de conteúdo
          const active = falando && !(placa && funcional(token.text));
          const since = ((nowMs - token.startMs) / 1000) * fps;
          const bump = active ? 1 + 0.18 * (1 - spring({ frame: since, fps, config: { damping: 9, mass: 0.4, stiffness: 220 } })) + 0.06 : 1;
          return (
            <span
              key={`${token.startMs}-${i}`}
              style={{ display: "inline-block", margin: "0 0.26em", color: active ? c.activeColor : c.textColor, scale: String(bump) }}
            >
              {textos[i]}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
