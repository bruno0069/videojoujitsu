// Gera um arquivo de timestamps por palavra ESTIMADO a partir do roteiro, no mesmo formato
// que a legenda lê da voz real ({ text, startMs, endMs }). Serve até a narração existir.
// Uso: node scripts/gerar-timestamps-estimados.mjs src/episodes/ep01.json public/captions/ep01.json
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const [input = "src/episodes/ep01.json", output = "public/captions/ep01.json"] = process.argv.slice(2);
const ep = JSON.parse(readFileSync(input, "utf8"));
const LEAD = 4; // frames de folga no começo da cena
const TAIL = 8; // e no fim

const pause = (w) => (/[.?!…]$/.test(w) ? 5 : /[:;]$/.test(w) ? 3 : /,$/.test(w) ? 2 : 0);

const words = [];
for (const s of ep.scenes) {
  const list = s.narration.split(/\s+/).filter(Boolean);
  const weights = list.map((w) => w.length + 1);
  const pauses = list.map((w, i) => (i === list.length - 1 ? 0 : pause(w)));
  const total = weights.reduce((a, b) => a + b, 0) + pauses.reduce((a, b) => a + b, 0);
  const perUnit = (s.durationInFrames - LEAD - TAIL) / total;
  let cursor = 0;
  list.forEach((w, i) => {
    const from = s.startFrame + LEAD + cursor * perUnit;
    cursor += weights[i];
    const to = s.startFrame + LEAD + cursor * perUnit;
    cursor += pauses[i];
    words.push({ text: w, startMs: Math.round((from / ep.fps) * 1000), endMs: Math.round((to / ep.fps) * 1000) });
  });
}
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(words, null, 1) + "\n");
console.log(`${words.length} palavras -> ${output} (tempo ESTIMADO; troque pelo arquivo da voz real)`);
