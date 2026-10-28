import React from "react";
import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile } from "remotion";
import { MUSIC, SFX } from "./audioLibrary";
import { Captions } from "./components/Captions";
import { SceneRenderer } from "./components/SceneRenderer";
import { audio, colors } from "./theme";
import { estimateEpisodeCaptions, resolveCue, sceneWords } from "./timing";
import type { Direction, EpisodeData } from "./types";

export type EpisodeProps = {
  id: string;
  episode: EpisodeData;
  direction: Direction;
  // Preenchidos por calculateMetadata quando os arquivos existem em public/
  narrationSrc: string | null;
  captions: Caption[] | null;
};

// Junta cenas seguidas que usam a mesma música numa faixa contínua.
const musicRuns = (ep: EpisodeData) => {
  const runs: { id: string; from: number; to: number }[] = [];
  for (const s of ep.scenes) {
    const last = runs[runs.length - 1];
    if (s.music && last && last.id === s.music && last.to === s.startFrame) last.to = s.startFrame + s.durationInFrames;
    else if (s.music) runs.push({ id: s.music, from: s.startFrame, to: s.startFrame + s.durationInFrames });
  }
  return runs;
};

export const Episode: React.FC<EpisodeProps> = ({ episode, direction, narrationSrc, captions }) => {
  const allCaptions = captions ?? estimateEpisodeCaptions(episode);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.creme }}>
      {episode.scenes.map((scene) => {
        const dir = direction.cenas[scene.id] ?? {};
        const words = sceneWords(allCaptions, scene, episode.fps);
        return (
          <Sequence key={scene.id} name={scene.id} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
            <SceneRenderer scene={scene} direction={dir} words={words} />
            {scene.sfx.map((id) => {
              const sfx = SFX[id];
              if (!sfx || !sfx.file) return null;
              const at = dir.sfx?.[id] !== undefined ? resolveCue(dir.sfx[id], words) : 0;
              const len = scene.durationInFrames - at;
              return (
                <Sequence key={id} from={at} durationInFrames={sfx.loop ? len : Math.min(len, 90)} layout="none" name={`sfx ${id}`}>
                  <Audio
                    src={staticFile(sfx.file)}
                    loop={sfx.loop}
                    volume={(f) =>
                      sfx.loop
                        ? sfx.volume * interpolate(f, [0, 8, len - 8, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
                        : sfx.volume
                    }
                  />
                </Sequence>
              );
            })}
          </Sequence>
        );
      })}

      {musicRuns(episode).map((run) => (
        <Sequence key={`${run.id}-${run.from}`} from={run.from} durationInFrames={run.to - run.from} layout="none" name={`música ${run.id}`}>
          <Audio
            src={staticFile(MUSIC[run.id])}
            loop
            volume={(f) =>
              audio.musicVolume *
              interpolate(f, [0, 15, run.to - run.from - 15, run.to - run.from], [0, 1, 1, 0], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            }
          />
        </Sequence>
      ))}

      {narrationSrc ? <Audio src={narrationSrc} volume={audio.narrationVolume} /> : null}

      <Captions captions={allCaptions} />
    </AbsoluteFill>
  );
};
