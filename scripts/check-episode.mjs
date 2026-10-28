// Confere se as cenas de um episódio são contíguas e somam totalFrames.
// Uso: node scripts/check-episode.mjs src/episodes/ep01.json
import { readFileSync } from "node:fs";

const file = process.argv[2] ?? "src/episodes/ep01.json";
const ep = JSON.parse(readFileSync(file, "utf8"));
let expected = 0;
let ok = true;
for (const s of ep.scenes) {
  const status = s.startFrame === expected ? "ok" : `ERRO: esperado ${expected}`;
  if (s.startFrame !== expected) ok = false;
  console.log(`${s.id.padEnd(14)} ${String(s.startFrame).padStart(5)} + ${String(s.durationInFrames).padStart(4)}  ${status}`);
  expected = s.startFrame + s.durationInFrames;
}
const sum = ep.scenes.reduce((a, s) => a + s.durationInFrames, 0);
console.log(`soma = ${sum} / totalFrames = ${ep.totalFrames} (${(sum / ep.fps).toFixed(2)} s)`);
if (!ok || sum !== ep.totalFrames || expected !== ep.totalFrames) {
  console.error("Episódio inválido.");
  process.exit(1);
}
