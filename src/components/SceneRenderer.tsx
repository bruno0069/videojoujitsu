import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { shots, sun } from "../theme";
import { resolveCue, TimedWord } from "../timing";
import type { CharacterKey, Cue, Scene, SceneDirection } from "../types";
import { Background } from "./Background";
import { cameraAt, Layer, planCamera } from "./Camera";
import { Dani } from "./Dani";
import { BreadInsert, Clock, Flash, Moon, SpeechBubble, Thermometer } from "./elements/Props";
import { Sun } from "./elements/Sun";
import { InkScale } from "./Ink";
import { Nico } from "./Nico";
import { OnScreenText } from "./OnScreenText";

const HEAD_Y = -790;

type Placed = { id: string; x: number; y: number; s: number };

// Posição de cada personagem conforme o enquadramento e o número de personagens.
const placeCharacters = (scene: Scene): Placed[] => {
  const chars = scene.visual.characters;
  const shot = scene.visual.camera;
  return chars.map((c, i) => {
    if (c.scale === "inserto_pequeno" || shot === "plano_aberto") {
      return { id: c.id, ...shots.plano_aberto, s: shots.plano_aberto.scale };
    }
    if (shot === "close") return { id: c.id, x: shots.close.x, y: shots.close.y, s: shots.close.scale };
    const base = shots.plano_medio;
    if (chars.length === 1) return { id: c.id, x: 430, y: base.y, s: base.scale };
    const xs = [330, 770];
    return { id: c.id, x: xs[i % 2], y: base.y, s: base.scale * (c.id === "dani" ? 0.97 : 1) };
  });
};

const activeKey = (keys: CharacterKey[] | undefined, frame: number, words: TimedWord[], basePose: string) => {
  const state: Omit<CharacterKey, "de"> = {};
  let pose = basePose;
  let prevPose = basePose;
  let poseChangedAt = -Infinity;
  for (const k of keys ?? []) {
    const at = resolveCue(k.de, words);
    if (at > frame) continue;
    Object.assign(state, k);
    if (k.pose && k.pose !== pose) {
      prevPose = pose;
      pose = k.pose;
      poseChangedAt = at;
    }
  }
  return { state, pose, prevPose, poseChangedAt };
};

export const SceneRenderer: React.FC<{ scene: Scene; direction: SceneDirection; words: TimedWord[] }> = ({ scene, direction, words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = (c: Cue | undefined, fb = 0) => resolveCue(c, words, fb);
  const duration = scene.durationInFrames;

  // Parâmetros do cenário (cues -> frames)
  const params: Record<string, number | number[]> = {};
  for (const [k, v] of Object.entries(direction.fundo ?? {})) {
    params[k] = Array.isArray(v) ? v.map((x) => cue(x)) : cue(v);
  }
  const cuts = (direction.cortes ?? []).map((c) => cue(c));
  if (typeof params.corte === "number") cuts.push(params.corte);

  const placed = placeCharacters(scene);
  const cam = cameraAt(
    frame,
    fps,
    planCamera({
      duration,
      cuts,
      focus: placed.map((p) => ({ x: p.x, y: p.y + HEAD_Y * p.s })),
      shot: scene.visual.camera,
      start: direction.camera?.inicio ?? "punch",
      endAtBase: direction.camera?.fim === "base",
    }),
    cuts,
    direction.camera?.inicio ?? "punch",
    direction.camera?.fim === "base",
  );

  const elements = direction.elementos ?? [];

  // Elementos no céu (camada de fundo)
  const skyElements = elements.map((el, i) => {
    if (el.type === "sol") {
      const goneAt = el.some !== undefined ? cue(el.some) : Infinity;
      const s = frame < goneAt ? 1 : 1 - interpolate(frame, [goneAt, goneAt + 5], [0, 1], { extrapolateRight: "clamp" });
      const wobble = 1 + 0.03 * Math.sin(frame / 7);
      if (s <= 0) return null;
      return <Sun key={i} x={el.x ?? sun.x} y={el.y ?? sun.y} r={sun.r} rot={frame * 0.4} scale={s * wobble} />;
    }
    if (el.type === "lua") return <Moon key={i} frame={frame} appear={cue(el.aparece)} off={cue(el.apaga)} />;
    return null;
  });

  // Personagens + balões (camada da frente, mundo)
  const characters = scene.visual.characters.map((c, i) => {
    const p = placed[i];
    const { state: k, pose, prevPose, poseChangedAt } = activeKey(direction.personagens?.[c.id], frame, words, c.pose);
    if (k.visivel === false) return null;
    const props = {
      pose,
      fromPose: prevPose,
      poseT: Number.isFinite(poseChangedAt)
        ? spring({ frame: frame - poseChangedAt, fps, config: { damping: 12, mass: 0.6, stiffness: 150 } })
        : 1,
      expression: k.expressao ?? c.expression,
      holding: k.segurando ?? null,
      action: k.acao ?? null,
    };
    // Pequena entrada com mola quando o personagem aparece no meio da cena
    const appearKey = (direction.personagens?.[c.id] ?? []).find((key) => key.visivel === true);
    const appearAt = appearKey ? cue(appearKey.de) : 0;
    const enter = appearAt > 0 ? spring({ frame: frame - appearAt, fps, config: { damping: 12, mass: 0.7 } }) : 1;
    const dy = (1 - enter) * 160;
    return (
      <g key={c.id} transform={`translate(${p.x} ${p.y + dy}) scale(${p.s})`}>
        <InkScale scale={p.s}>{c.id === "dani" ? <Dani {...props} /> : <Nico {...props} />}</InkScale>
      </g>
    );
  });

  const bubbles = elements.map((el, i) => {
    if (el.type !== "balao") return null;
    const idx = Math.max(0, scene.visual.characters.findIndex((c) => c.id === (el.personagem ?? "nico")));
    const p = placed[idx];
    return (
      <SpeechBubble
        key={i}
        frame={frame}
        from={cue(el.de)}
        to={cue(el.ate, duration)}
        text={el.texto}
        // âncora convertida do mundo para a tela (balão fica sempre dentro do quadro)
        ax={540 + (p.x + 170 * p.s - cam.x) * cam.zoom}
        ay={960 + (p.y + (HEAD_Y - 120) * p.s - cam.y) * cam.zoom}
      />
    );
  });

  const hud = elements.map((el, i) => {
    switch (el.type) {
      case "inserto":
        return <BreadInsert key={i} frame={frame} from={cue(el.de)} to={cue(el.ate, duration)} />;
      case "relogio":
        return <Clock key={i} frame={frame} from={cue(el.de)} to={cue(el.ate, duration)} start={el.inicio} end={el.fim} />;
      case "termometro":
        return <Thermometer key={i} frame={frame} from={cue(el.de)} to={cue(el.ate, duration)} />;
      case "sol":
        return el.flash && el.some !== undefined ? <Flash key={i} frame={frame} at={cue(el.some)} /> : null;
      default:
        return null;
    }
  });

  const textFrom = cue(direction.texto?.de, 0);

  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <Background
          name={scene.visual.background}
          cam={cam}
          frame={frame}
          duration={duration}
          params={params}
          skyElements={skyElements}
        />
        <Layer cam={cam} depth={1}>
          {characters}
        </Layer>
        {bubbles}
        {hud}
      </svg>
      <OnScreenText text={scene.onScreenText} frame={frame} from={textFrom} animate={direction.texto?.animar !== false} />
    </AbsoluteFill>
  );
};
