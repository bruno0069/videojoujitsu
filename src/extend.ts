import type { Caption } from "@remotion/captions";
import type { Direction, EpisodeData, Plano, SceneDirection } from "./types";

// Versão longa: cada inserto abre `frames` de imagem nova no frame `em` da cena,
// empurrando para frente tudo o que vem depois (cenas, cues numéricos, HUD e palavras).
// Cues por palavra andam sozinhos, porque as palavras também são deslocadas.

const shiftNum = <T,>(v: T, at: number, by: number): T => (typeof v === "number" && v >= at ? ((v + by) as T) : v);

const shiftScene = (d: SceneDirection, at: number, by: number): SceneDirection => {
  const s = <T,>(v: T) => shiftNum(v, at, by);
  return {
    ...d,
    planos: d.planos?.map((p) => ({ ...p, de: s(p.de) })),
    elementos: d.elementos?.map((e) => {
      const out: Record<string, unknown> = { ...e };
      for (const k of ["de", "ate", "some", "aparece", "pisca", "apaga", "notaEm"]) out[k] = s(out[k]);
      return out as typeof e;
    }),
    personagens: d.personagens
      ? Object.fromEntries(Object.entries(d.personagens).map(([id, keys]) => [id, keys.map((k) => ({ ...k, de: s(k.de) }))]))
      : undefined,
    sfx: d.sfx ? Object.fromEntries(Object.entries(d.sfx).map(([k, v]) => [k, s(v)])) : undefined,
    fundo: d.fundo
      ? Object.fromEntries(Object.entries(d.fundo).map(([k, v]) => [k, Array.isArray(v) ? v.map((x) => s(x)) : s(v)]))
      : undefined,
    tremidas: d.tremidas?.map((t) => ({ ...t, de: s(t.de) })),
    texto: d.texto ? { ...d.texto, de: s(d.texto.de), ate: s(d.texto.ate) } : undefined,
    congelar: s(d.congelar),
  };
};

// Inserto + retomada do plano que estava no ar (se o próximo plano não começar logo em seguida)
const insertPlanos = (planos: Plano[], at: number, by: number, enquadramento: Plano["enquadramento"]): Plano[] => {
  const numeric = planos.filter((p) => typeof p.de === "number");
  const active = [...numeric].reverse().find((p) => (p.de as number) < at);
  const resumeAt = at + by;
  const nextStart = Math.min(...numeric.map((p) => p.de as number).filter((n) => n >= resumeAt), Infinity);
  const out: Plano[] = [...planos, { de: at, enquadramento, zoom: [1, 1.08], entrada: "corte", personagens: [] }];
  if (active && nextStart - resumeAt > 15) out.push({ ...active, de: resumeAt, entrada: "corte" });
  return out.sort((a, b) => (typeof a.de === "number" ? a.de : Infinity) - (typeof b.de === "number" ? b.de : Infinity));
};

export const applyExtension = (ep: EpisodeData, dir: Direction, caps: Caption[] | null) => {
  let episode: EpisodeData = { ...ep, scenes: ep.scenes.map((s) => ({ ...s })) };
  let direction: Direction = { ...dir, cenas: { ...dir.cenas }, hud: dir.hud?.map((h) => ({ ...h })) };
  let words = caps?.map((c) => ({ ...c })) ?? null;
  // do último para o primeiro, para os frames de referência não mudarem no meio do caminho
  const inserts = [...(dir.extensao ?? [])].sort((a, b) => {
    const sa = ep.scenes.find((s) => s.id === a.cena)!.startFrame + a.em;
    const sb = ep.scenes.find((s) => s.id === b.cena)!.startFrame + b.em;
    return sb - sa;
  });
  for (const ins of inserts) {
    const scene = episode.scenes.find((s) => s.id === ins.cena);
    if (!scene) continue;
    const abs = scene.startFrame + ins.em;
    const by = ins.frames;
    episode = {
      ...episode,
      totalFrames: episode.totalFrames + by,
      scenes: episode.scenes.map((s) =>
        s.id === ins.cena ? { ...s, durationInFrames: s.durationInFrames + by } : s.startFrame > scene.startFrame ? { ...s, startFrame: s.startFrame + by } : s,
      ),
    };
    const sd = shiftScene(direction.cenas[ins.cena] ?? {}, ins.em, by);
    direction = {
      ...direction,
      cenas: { ...direction.cenas, [ins.cena]: { ...sd, planos: insertPlanos(sd.planos ?? [], ins.em, by, ins.enquadramento) } },
      hud: direction.hud?.map((h) => ({
        ...h,
        ate: shiftNum(h.ate, abs, by),
        grandeDe: shiftNum(h.grandeDe, abs, by),
        grandeAte: shiftNum(h.grandeAte, abs, by),
        seguraAte: shiftNum(h.seguraAte, abs, by),
        zeroEm: shiftNum(h.zeroEm, abs, by),
        travaEm: shiftNum(h.travaEm, abs, by),
      })),
    };
    const atMs = (abs / ep.fps) * 1000;
    const byMs = (by / ep.fps) * 1000;
    words = words?.map((w) => (w.startMs >= atMs ? { ...w, startMs: w.startMs + byMs, endMs: w.endMs + byMs } : w)) ?? null;
  }
  return { episode, direction, words };
};
