import React from "react";
import type { Caption } from "@remotion/captions";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { MUSIC, SFX } from "./audioLibrary";
import { Captions } from "./components/Captions";
import { Stamp, Timer } from "./components/elements/Props";
import { LoopLength, SceneOffset } from "./components/GlobalFrame";
import { SceneRenderer } from "./components/SceneRenderer";
import { audio, colors } from "./theme";
import {
  duckAt,
  estimateEpisodeCaptions,
  markSceneBreaks,
  resolveCue,
  sceneWords,
  speechIntervals,
} from "./timing";
import type { Direction, EpisodeData } from "./types";

export type EpisodeProps = {
  id: string;
  episode: EpisodeData;
  direction: Direction;
  // Entrada: arquivo de timestamps por palavra (JSON). "src/audio/…" é lido do projeto;
  // qualquer outro caminho é relativo a public/. Ver README.
  legendas: string;
  // Preenchidos por calculateMetadata quando os arquivos existem em public/
  narrationSrc: string | null;
  captions: Caption[] | null;
  // Stems para medir a mixagem: "voz" só a narração, "fundo" só música + efeitos
  stem: "mix" | "voz" | "fundo";
};

// Junta cenas seguidas que usam a mesma música numa faixa contínua.
const musicRuns = (ep: EpisodeData) => {
  const runs: { id: string; from: number; to: number }[] = [];
  for (const s of ep.scenes) {
    const last = runs[runs.length - 1];
    if (s.music && last && last.id === s.music && last.to === s.startFrame)
      last.to = s.startFrame + s.durationInFrames;
    else if (s.music)
      runs.push({
        id: s.music,
        from: s.startFrame,
        to: s.startFrame + s.durationInFrames,
      });
  }
  // Se a cena seguinte não tem música, a faixa sai em fade por 1,5 s dentro dela (sem buraco mudo)
  for (const r of runs) {
    const next = ep.scenes.find((s) => s.startFrame === r.to);
    if (next && !next.music) r.to = Math.min(ep.totalFrames, r.to + Math.round(ep.fps * 1.5));
  }
  return runs;
};

export const Episode: React.FC<EpisodeProps> = ({
  episode,
  direction,
  narrationSrc,
  captions,
  stem,
}) => {
  const allCaptions = markSceneBreaks(
    captions ?? estimateEpisodeCaptions(episode),
    episode,
  );
  // Duck de música e efeitos sob a fala (só quando há narração real)
  const spans = narrationSrc
    ? speechIntervals(allCaptions, episode.fps, audio.duckGapMs)
    : [];
  const duck = (absFrame: number) =>
    duckAt(
      absFrame,
      spans,
      audio.duckGain,
      audio.duckAttackFrames,
      audio.duckReleaseFrames,
    );
  const hookEnd = episode.scenes[1]?.startFrame ?? 0;

  return (
    <LoopLength frames={episode.totalFrames - 1}>
      <AbsoluteFill style={{ backgroundColor: colors.creme }}>
        {episode.scenes.map((scene) => {
          const dir = direction.cenas[scene.id] ?? {};
          const words = sceneWords(allCaptions, scene, episode.fps);
          return (
            <Sequence
              key={scene.id}
              name={scene.id}
              from={scene.startFrame}
              durationInFrames={scene.durationInFrames}
            >
              <Freeze
                frame={dir.congelar ?? 0}
                active={(f) => dir.congelar !== undefined && f >= dir.congelar}
              >
                <SceneOffset offset={scene.startFrame}>
                  <SceneRenderer scene={scene} direction={dir} words={words} />
                </SceneOffset>
              </Freeze>
            </Sequence>
          );
        })}

        {/* Efeitos em frames absolutos: um cue negativo põe o efeito antes da cena (numa pausa da fala).
            Além dos sfx do roteiro, `efeitos` na direção acrescenta efeitos curtos de transição. */}
        {stem !== "voz" &&
          episode.scenes.flatMap((scene) => {
            const dir = direction.cenas[scene.id] ?? {};
            const words = sceneWords(allCaptions, scene, episode.fps);
            const cueOf = (id: string) => {
              const c = dir.sfx?.[id];
              if (c === undefined) return { at: 0, until: undefined };
              if (typeof c === "object" && c !== null) return { at: resolveCue(c.de, words), until: c.ate !== undefined ? resolveCue(c.ate, words) : undefined };
              return { at: resolveCue(c, words), until: undefined };
            };
            const list = [
              ...scene.sfx.map((id) => ({ id, ...cueOf(id) })),
              ...(dir.efeitos ?? []).map((e) => ({ id: e.id, at: resolveCue(e.de, words), until: undefined as number | undefined })),
            ];
            return list.map(({ id, at, until }, k) => {
              const sfx = SFX[id];
              if (!sfx || !sfx.file) return null;
              const from = scene.startFrame + at;
              const len = Math.min((until ?? scene.durationInFrames) - at, sfx.maxFrames ?? Infinity);
              if (len <= 0) return null;
              return (
                <Sequence
                  key={`${scene.id}-${id}-${k}`}
                  from={from}
                  durationInFrames={sfx.loop ? len : Math.min(len, 90)}
                  layout="none"
                  name={`sfx ${id}`}
                >
                  <Audio
                    src={staticFile(sfx.file)}
                    loop={sfx.loop}
                    volume={(f) =>
                      duck(from + f) *
                      (sfx.loop || sfx.maxFrames
                        ? sfx.volume *
                          interpolate(f, [0, 2, len - 10, len], [0, 1, 1, 0], {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                          })
                        : sfx.volume)
                    }
                  />
                </Sequence>
              );
            });
          })}

        {stem !== "voz" &&
          musicRuns(episode).map((run) => (
          <Sequence
            key={`${run.id}-${run.from}`}
            from={run.from}
            durationInFrames={run.to - run.from}
            layout="none"
            name={`música ${run.id}`}
          >
            <Audio
              src={staticFile(MUSIC[run.id])}
              loop
              volume={(f) =>
                duck(run.from + f) *
                audio.musicVolume *
                interpolate(
                  f,
                  [0, 15, run.to - run.from - 15, run.to - run.from],
                  [0, 1, 1, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  },
                )
              }
            />
          </Sequence>
        ))}

        {narrationSrc && stem !== "fundo" ? (
          <Audio src={narrationSrc} volume={audio.narrationVolume} />
        ) : null}

        {(direction.hud ?? []).map((h, i) => (
          <Sequence
            key={`hud-${i}`}
            from={h.de}
            durationInFrames={h.ate - h.de}
            layout="none"
            name={`hud ${h.type}`}
          >
            <HudTimer
              bigFrom={h.grandeDe - h.de}
              bigUntil={h.grandeAte - h.de}
              holdUntil={h.seguraAte - h.de}
              zeroAt={h.zeroEm - h.de}
              lockAt={h.travaEm !== undefined ? h.travaEm - h.de : undefined}
              start={h.inicio}
              end={h.fim}
            />
          </Sequence>
        ))}

        {direction.sunReturnsAfterHook && hookEnd > 0 ? (
          <Sequence
            from={hookEnd}
            durationInFrames={12}
            layout="none"
            name="selo agora"
          >
            <StampLayer />
          </Sequence>
        ) : null}

        <Captions
          captions={allCaptions}
          showFromFrame={direction.legendaDe ?? 0}
          hideAfterFrame={episode.totalFrames - 6}
          stripPunctuation={direction.legendaSemPontuacao}
        />
      </AbsoluteFill>
    </LoopLength>
  );
};

const HudTimer: React.FC<{
  bigFrom: number;
  bigUntil: number;
  holdUntil: number;
  zeroAt: number;
  lockAt?: number;
  start: string;
  end: string;
}> = (props) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Timer frame={frame} {...props} />
      </svg>
    </AbsoluteFill>
  );
};

const StampLayer: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <Stamp frame={frame} length={12} text="agora" />
      </svg>
    </AbsoluteFill>
  );
};
