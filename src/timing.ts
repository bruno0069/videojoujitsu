import type { Caption } from "@remotion/captions";
import { captions as captionTheme } from "./theme";
import type { Cue, EpisodeData, Scene } from "./types";

// Palavra com tempo relativo ao início da cena, em frames.
export type TimedWord = { text: string; from: number; to: number };

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

// Peso de pausa depois da pontuação (em "caracteres")
const pauseWeight = (word: string): number => {
  if (/[.?!…]$/.test(word)) return 5;
  if (/[:;]$/.test(word)) return 3;
  if (/,$/.test(word)) return 2;
  return 0;
};

// Sem áudio: distribui as palavras da cena pelo número de caracteres.
export const estimateSceneCaptions = (scene: Scene, fps: number): Caption[] => {
  const words = scene.narration.split(/\s+/).filter(Boolean);
  const lead = captionTheme.leadFrames;
  const usable = scene.durationInFrames - lead - captionTheme.tailFrames;
  const weights = words.map((w) => w.length + 1);
  const pauses = words.map((w, i) => (i === words.length - 1 ? 0 : pauseWeight(w)));
  const total = weights.reduce((a, b) => a + b, 0) + pauses.reduce((a, b) => a + b, 0);
  const framesPerUnit = usable / total;

  let cursor = 0;
  return words.map((w, i) => {
    const fromF = scene.startFrame + lead + cursor * framesPerUnit;
    cursor += weights[i];
    const toF = scene.startFrame + lead + cursor * framesPerUnit;
    cursor += pauses[i];
    return {
      text: (i === 0 ? "" : " ") + w,
      startMs: Math.round((fromF / fps) * 1000),
      endMs: Math.round((toF / fps) * 1000),
      timestampMs: null,
      confidence: null,
      pageBreakAfter: i === words.length - 1,
    };
  });
};

export const estimateEpisodeCaptions = (ep: EpisodeData): Caption[] =>
  ep.scenes.flatMap((s) => estimateSceneCaptions(s, ep.fps));

// Palavras de uma cena (frames relativos) a partir das legendas do episódio inteiro.
export const sceneWords = (all: Caption[], scene: Scene, fps: number): TimedWord[] => {
  const startMs = (scene.startFrame / fps) * 1000;
  const endMs = ((scene.startFrame + scene.durationInFrames) / fps) * 1000;
  return all
    .filter((c) => c.startMs >= startMs - 1 && c.startMs < endMs)
    .map((c) => ({
      text: c.text.trim(),
      from: (c.startMs / 1000) * fps - scene.startFrame,
      to: (c.endMs / 1000) * fps - scene.startFrame,
    }));
};

// Resolve um Cue para um frame relativo à cena.
export const resolveCue = (cue: Cue | undefined, words: TimedWord[], fallback = 0): number => {
  if (cue === undefined) return fallback;
  if (typeof cue === "number") return cue;
  const m = cue.match(/^(.+?)(#\d+)?(\$)?([+-]\d+)?$/);
  if (!m) return fallback;
  const target = normalize(m[1]);
  const occurrence = m[2] ? parseInt(m[2].slice(1), 10) : 1;
  const useEnd = Boolean(m[3]);
  const offset = m[4] ? parseInt(m[4], 10) : 0;
  let seen = 0;
  for (const w of words) {
    if (normalize(w.text) === target) {
      seen++;
      if (seen === occurrence) return Math.round((useEnd ? w.to : w.from) + offset);
    }
  }
  return fallback;
};

// Verificação do arquivo de episódio: cenas contíguas que somam totalFrames.
export const validateEpisode = (ep: EpisodeData): string[] => {
  const errors: string[] = [];
  let expected = 0;
  for (const s of ep.scenes) {
    if (s.startFrame !== expected) {
      errors.push(`Cena "${s.id}" começa em ${s.startFrame}, esperado ${expected} (buraco ou sobreposição).`);
    }
    expected = s.startFrame + s.durationInFrames;
  }
  const sum = ep.scenes.reduce((a, s) => a + s.durationInFrames, 0);
  if (sum !== ep.totalFrames) errors.push(`Soma das cenas = ${sum}, totalFrames = ${ep.totalFrames}.`);
  return errors;
};
