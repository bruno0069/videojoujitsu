import React from "react";
import type { Caption } from "@remotion/captions";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Episode, EpisodeProps } from "./Episode";
import { applyExtension } from "./extend";
import { EPISODES } from "./episodes";
import { deriveSceneBounds, normalizeWordTimestamps, validateEpisode } from "./timing";

// Arquivos de timestamps por palavra versionados no projeto (src/audio/epNN-words.json)
const wordFiles = require.context("./audio", false, /-words\.json$/);
const fromProject = (path: string): unknown | null => {
  const key = `./${path.replace(/^src\/audio\//, "")}`;
  return path.startsWith("src/audio/") && wordFiles.keys().includes(key) ? wordFiles(key) : null;
};

// Usa o arquivo só se ele existir de verdade em public/ (o servidor pode responder HTML para caminhos inexistentes).
const fetchIfExists = async (src: string, type: string) => {
  try {
    const res = await fetch(src);
    if (!res.ok || !(res.headers.get("content-type") ?? "").includes(type)) return null;
    return res;
  } catch {
    return null;
  }
};

const calculateMetadata: CalculateMetadataFunction<EpisodeProps> = async ({ props }) => {
  const errors = validateEpisode(props.episode);
  if (errors.length > 0) throw new Error(`Episódio ${props.id} inválido:\n${errors.join("\n")}`);

  const long = props.extendTo70s === true;
  const narration = staticFile(`audio/${props.id}-narracao${long ? "-70s" : ""}.mp3`);
  const hasNarration = (await fetchIfExists(narration, "audio")) !== null;
  // Legenda e limites de cena: timestamps por palavra vindos de um arquivo (entrada `legendas`).
  // "src/audio/…" vem do projeto; outro caminho é buscado em public/. Sem arquivo, usa tempo estimado.
  const path = props.legendas || `src/audio/${props.id}-words.json`;
  let raw = fromProject(path);
  if (raw === null) {
    const res = await fetchIfExists(staticFile(path), "json");
    raw = res ? await res.json() : null;
  }
  const captions: Caption[] | null = raw ? normalizeWordTimestamps(raw) : null;
  if (!captions) console.warn(`[${props.id}] arquivo de palavras "${path}" não encontrado; usando tempo estimado.`);
  const base = captions ? deriveSceneBounds(props.episode, captions, 3) : props.episode;
  // Versão longa: insertos só de imagem; voz com silêncio nos mesmos pontos (scripts/estender-narracao.py)
  const ext = long ? applyExtension(base, props.direction, captions) : { episode: base, direction: props.direction, words: captions };
  const episode = ext.episode;

  return {
    durationInFrames: episode.totalFrames,
    fps: props.episode.fps,
    width: props.episode.width,
    height: props.episode.height,
    props: { ...props, episode, direction: ext.direction, narrationSrc: hasNarration ? narration : null, captions: ext.words },
  };
};

const compositionId = (id: string) => id.charAt(0).toUpperCase() + id.slice(1); // ep01 -> Ep01

export const RemotionRoot: React.FC = () => (
  <>
    {EPISODES.map((ep) => (
      <Composition
        key={ep.id}
        id={compositionId(ep.id)}
        component={Episode}
        durationInFrames={ep.data.totalFrames}
        fps={ep.data.fps}
        width={ep.data.width}
        height={ep.data.height}
        defaultProps={{
          id: ep.id,
          episode: ep.data,
          direction: ep.direction,
          legendas: `src/audio/${ep.id}-words.json`,
          extendTo70s: false,
          narrationSrc: null,
          captions: null,
        }}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
