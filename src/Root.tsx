import React from "react";
import type { Caption } from "@remotion/captions";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Episode, EpisodeProps } from "./Episode";
import { EPISODES } from "./episodes";
import { normalizeWordTimestamps, validateEpisode } from "./timing";

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
  // Legenda: timestamps por palavra vindos de um arquivo (entrada `legendas`).
  // Sem o arquivo, cai no tempo estimado pelo roteiro e avisa no console.
  const captionsRes = await fetchIfExists(staticFile(props.legendas || `captions/${props.id}.json`), "json");
  const captions: Caption[] | null = captionsRes ? normalizeWordTimestamps(await captionsRes.json()) : null;
  if (!captions) console.warn(`[${props.id}] arquivo de legendas "${props.legendas}" não encontrado; usando tempo estimado.`);

  return {
    durationInFrames: props.episode.totalFrames,
    fps: props.episode.fps,
    width: props.episode.width,
    height: props.episode.height,
    props: { ...props, narrationSrc: hasNarration ? narration : null, captions },
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
          legendas: `captions/${ep.id}.json`,
          narrationSrc: null,
          captions: null,
        }}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
