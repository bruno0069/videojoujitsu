import timings from "./timings.json";
import { BREATH, FPS } from "./theme";

export type Caption = { text: string; start: number; end: number; spoken: string };
export type SceneTiming = {
  id: string;
  audio: string;
  audioDuration: number;
  captions: Caption[];
};

export const SCENES = timings.scenes as SceneTiming[];

/** Duração da cena = áudio real medido + respiro (nunca fixa). */
export const sceneFrames = (s: SceneTiming) => Math.ceil((s.audioDuration + BREATH) * FPS);

export const TOTAL_FRAMES = SCENES.reduce((acc, s) => acc + sceneFrames(s), 0);

export const getScene = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Cena ${id} não encontrada`);
  return s;
};

/** Frame (relativo à cena) em que a frase i começa a ser falada. */
export const cueFrame = (s: SceneTiming, i: number) => Math.round(s.captions[i].start * FPS);
