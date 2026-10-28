import React from "react";
import type { Caption } from "@remotion/captions";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { Episode, EpisodeProps } from "./Episode";
import { EPISODES } from "./episodes";
import { validateEpisode } from "./timing";

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
  const captionsRes = await fetchIfExists(staticFile(`captions/${props.id}.json`), "json");
  const captions = captionsRes ? ((await captionsRes.json()) as Caption[]) : null;

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
        defaultProps={{ id: ep.id, episode: ep.data, direction: ep.direction, narrationSrc: null, captions: null }}
        calculateMetadata={calculateMetadata}
      />
    ))}
  </>
);
