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

// Marca quebra de página da legenda onde a próxima palavra já é de outra cena, e depois de uma
// pergunta seguida de pausa longa (a resposta não aparece na tela antes de ser dita).
const PAUSA_PERGUNTA_MS = 600;
export const markSceneBreaks = (caps: Caption[], ep: EpisodeData): Caption[] => {
  const sceneOf = (ms: number) => {
    const f = (ms / 1000) * ep.fps;
    return ep.scenes.findIndex((s) => f >= s.startFrame && f < s.startFrame + s.durationInFrames);
  };
  return caps.map((c, i) => {
    const next = caps[i + 1];
    const pergunta = next !== undefined && c.text.trim().endsWith("?") && next.startMs - c.endMs >= PAUSA_PERGUNTA_MS;
    return { ...c, pageBreakAfter: c.pageBreakAfter || pergunta || (next !== undefined && sceneOf(next.startMs) !== sceneOf(c.startMs)) };
  });
};

// Aceita timestamps por palavra em formatos comuns e converte para Caption[]:
//  - { text, startMs, endMs }            (formato @remotion/captions)
//  - { word | text, start, end }         (segundos: ElevenLabs, Whisper e afins)
//  - { words: [...] }                    (lista dentro de um objeto)
type RawWord = { text?: string; word?: string; startMs?: number; endMs?: number; start?: number; end?: number };
export const normalizeWordTimestamps = (raw: unknown): Caption[] => {
  const list = (Array.isArray(raw) ? raw : (raw as { words?: unknown[] })?.words ?? []) as RawWord[];
  return list
    .map((w) => {
      const text = (w.text ?? w.word ?? "").trim();
      const startMs = w.startMs ?? Math.round((w.start ?? 0) * 1000);
      const endMs = w.endMs ?? Math.round((w.end ?? 0) * 1000);
      return { text, startMs, endMs, timestampMs: null, confidence: null };
    })
    .filter((w) => w.text.length > 0)
    .sort((a, b) => a.startMs - b.startMs);
};

// Trechos com fala (em frames absolutos), juntando palavras separadas por pausas curtas.
export const speechIntervals = (caps: Caption[], fps: number, gapMs: number) => {
  const out: { from: number; to: number }[] = [];
  for (const c of caps) {
    const last = out[out.length - 1];
    if (last && c.startMs - last.to <= gapMs) last.to = Math.max(last.to, c.endMs);
    else out.push({ from: c.startMs, to: c.endMs });
  }
  return out.map((i) => ({ from: (i.from / 1000) * fps, to: (i.to / 1000) * fps }));
};

// Ganho de duck (1 = sem duck) para um frame absoluto
export const duckAt = (frame: number, spans: { from: number; to: number }[], gain: number, attack: number, release: number) => {
  let k = 0;
  for (const s of spans) {
    if (frame >= s.from - attack && frame <= s.to + release) {
      const inK = Math.min(1, (frame - (s.from - attack)) / attack);
      const outK = Math.min(1, (s.to + release - frame) / release);
      k = Math.max(k, Math.min(inK, outK));
    }
  }
  return 1 - (1 - gain) * k;
};

// Limites de cena derivados das palavras. O limite planejado (JSON) é mantido enquanto a
// fala da cena anterior termina antes dele e a da cena seguinte começa depois; se alguma fala
// invadir a vizinha, o limite vai para o meio da pausa entre as duas falas (empresta frames).
// Só vale quando o arquivo traz exatamente as palavras do roteiro (mesma contagem).
export const deriveSceneBounds = (ep: EpisodeData, caps: Caption[], lead: number): EpisodeData => {
  const counts = ep.scenes.map((s) => s.narration.split(/\s+/).filter(Boolean).length);
  if (counts.reduce((a, b) => a + b, 0) !== caps.length) return ep;
  const toF = (ms: number) => (ms / 1000) * ep.fps;
  const starts: number[] = [0];
  let idx = 0;
  for (let k = 1; k < ep.scenes.length; k++) {
    const prevEnd = toF(caps[idx + counts[k - 1] - 1].endMs);
    idx += counts[k - 1];
    const nextStart = toF(caps[idx].startMs);
    const planned = ep.scenes[k].startFrame;
    const fits = prevEnd <= planned && nextStart - lead >= planned;
    starts.push(fits ? planned : Math.max(starts[k - 1] + 1, Math.round((prevEnd + nextStart) / 2)));
  }
  const scenes = ep.scenes.map((s, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : ep.totalFrames;
    return { ...s, startFrame: starts[k], durationInFrames: end - starts[k] };
  });
  return { ...ep, scenes };
};
