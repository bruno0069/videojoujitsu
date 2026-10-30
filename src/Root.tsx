import React from "react";
import type { Caption } from "@remotion/captions";
import { CalculateMetadataFunction, Composition, staticFile, Still } from "remotion";
import { Capa02 } from "./Capa";
import { Episode, EpisodeProps } from "./Episode";
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

  const narration = staticFile(`audio/${props.id}-narracao.mp3`);
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
  const episode = captions && !props.direction.limitesFixos ? deriveSceneBounds(props.episode, captions, 3) : props.episode;

  return {
    durationInFrames: episode.totalFrames,
    fps: props.episode.fps,
    width: props.episode.width,
    height: props.episode.height,
    props: { ...props, episode, narrationSrc: hasNarration ? narration : null, captions },
  };
};

// ep01 -> Ep01; ep03_v3 -> Ep03V3
const compositionId = (id: string) => (id.charAt(0).toUpperCase() + id.slice(1)).replace(/_(\w)/g, (_, c: string) => c.toUpperCase());

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="Capa02" component={Capa02} width={1080} height={1920} />
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
          narrationSrc: null,
          stem: "mix",
          captions: null,
        }}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
