import type { Direction, EpisodeData } from "../types";

// Descobre automaticamente src/episodes/epNN.json (+ epNN.direcao.json, opcional).
// Versões alternativas: epNN_vK.json (ex.: ep03_v3 -> composição Ep03V3).
// Episódio novo = arquivo novo; nenhuma linha de código precisa mudar.
const ctx = require.context("./", false, /^\.\/ep\d+(_v\d+)?(\.direcao)?\.json$/);

export type EpisodeEntry = { id: string; data: EpisodeData; direction: Direction };

export const EPISODES: EpisodeEntry[] = ctx
  .keys()
  .filter((k) => /^\.\/ep\d+(_v\d+)?\.json$/.test(k))
  .sort()
  .map((k) => {
    const id = k.replace(/^\.\//, "").replace(/\.json$/, "");
    const dirKey = `./${id}.direcao.json`;
    const direction = ctx.keys().includes(dirKey) ? ctx<Direction>(dirKey) : { cenas: {} };
    return { id, data: ctx<EpisodeData>(k), direction };
  });
