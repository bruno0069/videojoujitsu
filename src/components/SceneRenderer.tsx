import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { idle, loopPhase, shots, sun } from "../theme";
import { resolveCue, TimedWord } from "../timing";
import type { CharacterKey, Cue, Plano, Scene, SceneDirection } from "../types";
import { Background, nightLevel } from "./Background";
import { ORBIT, orbitAngle } from "./backgrounds/DiagramaOrbita";
import { Cam, Layer, shakeOffset, shotCamera, toScreen } from "./Camera";
import { GLOBE_ON_DESK, headDrop, NightLevel, RIG_CHIN_Y } from "./Character";
import {
  GLOBO_DIA_NOITE,
  GLOBO_DIAGRAMA,
  MAPA,
} from "./backgrounds/DiagramasTerra";
import { CALENDARIO, ESPACO, MALA, QUARTO_DEPTH } from "./backgrounds/Ep03";
import { HABITAT, NAVE } from "./backgrounds/Ep03Longo";
import { MAPA_RIO, RIO_DEPTH } from "./backgrounds/MapaRio";
import { GLOBO_QUADRO, JANELA, MESA_DEPTH, MESA_PROF, SALA_DEPTH } from "./backgrounds/SalaAula";
import { Dani } from "./Dani";
import {
  Flash,
  Moon,
  NameTag,
  SpeechBubble,
  TestPaper,
  Thermometer,
  WindStreaks,
} from "./elements/Props";
import { Sun } from "./elements/Sun";
import { useGlobalFrame, useLoopFrames } from "./GlobalFrame";
import { InkScale } from "./Ink";
import { Nico } from "./Nico";
import { Professora } from "./Professora";
import { OnScreenText, repeatsNarration } from "./OnScreenText";

const HEAD_Y = -790;
const TAG_Y = -1240; // acima do topete

type Vec = [number, number];
type CharBase = {
  id: string;
  pose: string;
  expression: string;
  holding?: string | null;
  action?: string | null;
  small?: boolean;
  traje?: boolean;
  capacete?: boolean;
};
type Placed = CharBase & { x: number; y: number; s: number; screen: boolean };
type PlanoChar = NonNullable<Plano["personagens"]>[number];

const SHOT_FROM_JSON: Record<string, Plano["enquadramento"]> = {
  close: "close",
  plano_medio: "medio",
  plano_aberto: "aberto",
};

// Posição de cada personagem conforme o enquadramento do plano. `pose` é a pose no começo
// do plano (o close usa para deixar o queixo sempre na mesma altura da tela).
const place = (
  chars: CharBase[],
  plano: Plano,
  poseAtStart: (id: string) => string,
): Placed[] => {
  // "inserto_pequeno" do roteiro só vale em plano aberto; em close/médio o personagem aparece grande
  const isSmall = (c: CharBase) =>
    plano.enquadramento === "inserto_pequeno" ||
    (c.small && plano.enquadramento === "aberto");
  const big = chars.filter((c) => !isSmall(c));
  const xOf = (id: string): number | undefined =>
    plano.personagens?.find((pc: PlanoChar) => pc.id === id)?.x;
  const yOf = (id: string): number | undefined =>
    plano.personagens?.find((pc: PlanoChar) => pc.id === id)?.y;
  const sOf = (id: string): number | undefined =>
    plano.personagens?.find((pc: PlanoChar) => pc.id === id)?.escala;
  return chars.flatMap((c): Placed[] => {
    if (isSmall(c)) {
      const p = shots.inserto_pequeno;
      return [{ ...c, x: xOf(c.id) ?? p.x, y: yOf(c.id) ?? p.y, s: p.scale, screen: true }];
    }
    const i = big.indexOf(c);
    switch (plano.enquadramento) {
      case "close": {
        const focus = plano.foco ?? big[0]?.id;
        const { x, chinY, scale } = shots.close;
        const y = chinY - (RIG_CHIN_Y + headDrop(poseAtStart(c.id))) * scale;
        return c.id === focus
          ? [{ ...c, x: xOf(c.id) ?? x, y, s: scale, screen: false }]
          : [];
      }
      case "aberto":
        return [
          {
            ...c,
            x: xOf(c.id) ?? (big.length === 1 ? 540 : shots.aberto.xs[i % 2]),
            y: shots.aberto.y,
            s: shots.aberto.scale,
            screen: false,
          },
        ];
      case "medio": {
        const m = shots.plano_medio;
        if (big.length === 1)
          return [
            {
              ...c,
              x: xOf(c.id) ?? m.x,
              y: yOf(c.id) ?? m.y,
              s: sOf(c.id) ?? m.scale,
              screen: false,
            },
          ];
        return [
          {
            ...c,
            x: xOf(c.id) ?? m.duo.xs[i % 2],
            y: yOf(c.id) ?? m.y,
            s: sOf(c.id) ?? m.duo.scale * (c.id === "dani" ? 0.97 : 1),
            screen: false,
          },
        ];
      }
      default:
        return [];
    }
  });
};

// Estado de um personagem no frame: base da cena, chaves anteriores ao plano, campos do plano
// e, por cima, chaves dentro do plano. Mudanças de pose/olhar dentro do plano são suavizadas;
// no corte, trocam seco.
const characterState = (
  base: CharBase,
  plano: Partial<CharBase>,
  keys: CharacterKey[] | undefined,
  frame: number,
  planoStart: number,
  cue: (c: Cue) => number,
) => {
  const resolved = (keys ?? [])
    .map((k) => ({ ...k, at: cue(k.de) }))
    .filter((k) => k.at <= frame);
  const s: CharBase & { visible: boolean; look?: Vec } = {
    ...base,
    visible: true,
  };
  const apply = (k: CharacterKey) => {
    if (k.visivel !== undefined) s.visible = k.visivel;
    if (k.expressao) s.expression = k.expressao;
    if (k.segurando !== undefined) s.holding = k.segurando;
    if (k.acao !== undefined) s.action = k.acao;
    if (k.pose) s.pose = k.pose;
    if (k.olhar) s.look = k.olhar;
    if (k.traje !== undefined) s.traje = k.traje;
    if (k.capacete !== undefined) s.capacete = k.capacete;
  };
  resolved.filter((k) => k.at <= planoStart).forEach(apply);
  for (const [k, v] of Object.entries(plano)) {
    if (v !== undefined) (s as Record<string, unknown>)[k] = v;
  }
  let prevPose = s.pose;
  let poseAt = -Infinity;
  let prevLook = s.look;
  let lookAt = -Infinity;
  for (const k of resolved.filter((r) => r.at > planoStart)) {
    if (k.pose && k.pose !== s.pose) {
      prevPose = s.pose;
      poseAt = k.at;
    }
    if (k.olhar) {
      prevLook = s.look;
      lookAt = k.at;
    }
    apply(k);
  }
  return { ...s, prevPose, poseAt, prevLook, lookAt };
};

const centerOf = (
  focus: string | undefined,
  placed: Placed[],
  sceneFrame: number,
  close: boolean,
) => {
  if (focus === "orbita") return { x: ORBIT.cx, y: ORBIT.cy };
  if (focus === "terra") {
    const a = orbitAngle(sceneFrame);
    return {
      x: ORBIT.cx + ORBIT.r * Math.cos(a),
      y: ORBIT.cy + ORBIT.r * Math.sin(a),
    };
  }
  if (focus === "ceu") return { x: 540, y: 620 };
  // Pontos de cenários desenhados numa camada de fundo (profundidade d): o equivalente em
  // profundidade 1 para a câmera centralizar neles
  const atDepth = (x: number, y: number, d: number) => ({
    x: 540 + (x - 540) / d,
    y: 960 + (y - 960) / d,
  });
  if (focus === "janela")
    return atDepth(
      JANELA.x + JANELA.w / 2,
      JANELA.y + JANELA.h / 2,
      SALA_DEPTH,
    );
  if (focus === "quadro")
    return atDepth(GLOBO_QUADRO.x - 60, GLOBO_QUADRO.y, SALA_DEPTH);
  if (focus === "equador")
    return {
      x: GLOBO_DIAGRAMA.x + GLOBO_DIAGRAMA.r * 0.55,
      y: GLOBO_DIAGRAMA.y,
    };
  if (focus === "mala") return atDepth(MALA.x, MALA.y - 80, QUARTO_DEPTH);
  if (focus === "calendario") return atDepth(CALENDARIO.x, CALENDARIO.y, 0.7);
  if (focus === "marte") return ESPACO.marte;
  if (focus === "escotilha") return atDepth(NAVE.escotilha.x, NAVE.escotilha.y, 0.7);
  if (focus === "biscoito_nave") return NAVE.biscoito;
  if (focus === "calendario_nave") return atDepth(NAVE.calendario.x, NAVE.calendario.y, 0.7);
  if (focus === "painel_hab") return atDepth(HABITAT.painel.x, HABITAT.painel.y, 0.6);
  if (focus === "biscoito_hab") return atDepth(HABITAT.biscoito.x, HABITAT.biscoito.y, 0.6);
  if (focus === "janela_hab") return atDepth(HABITAT.janela.x + HABITAT.janela.w / 2, HABITAT.janela.y + HABITAT.janela.h / 2, 0.6);
  if (focus === "terra_espaco") return ESPACO.terra;
  if (focus === "polo") return { x: GLOBO_DIAGRAMA.x, y: GLOBO_DIAGRAMA.y - GLOBO_DIAGRAMA.r + 60 };
  if (focus === "mesa_globo") return atDepth(MESA_PROF.globo.x, MESA_PROF.globo.y + 40, MESA_DEPTH);
  if (focus === "noite")
    return {
      x: GLOBO_DIA_NOITE.x + GLOBO_DIA_NOITE.r * 0.5,
      y: GLOBO_DIA_NOITE.y,
    };
  if (focus === "costa") return { x: MAPA.costaX + 160, y: 900 };
  if (focus === "pino") return { x: MAPA.pino.x - 40, y: MAPA.pino.y - 60 };
  if (focus === "orla") return MAPA_RIO.orla;
  if (focus === "casa") return { x: MAPA_RIO.pino.x, y: MAPA_RIO.pino.y + 20 };
  if (focus === "morros") return atDepth(MAPA_RIO.morros.x, MAPA_RIO.morros.y, RIO_DEPTH);
  if (focus === "globo_mesa") {
    const n = placed.find((c) => c.id === "nico");
    if (n)
      return { x: n.x + GLOBE_ON_DESK.x * n.s, y: n.y + GLOBE_ON_DESK.y * n.s };
  }
  const p = placed.find((c) => c.id === focus) ?? placed.find((c) => !c.screen);
  // No close o zoom cresce a partir do queixo: o rosto nunca desce para a faixa da legenda
  if (p && close) return { x: p.x, y: shots.close.chinY };
  return p ? { x: p.x, y: p.y + HEAD_Y * p.s } : { x: 540, y: 960 };
};

export const SceneRenderer: React.FC<{
  scene: Scene;
  direction: SceneDirection;
  words: TimedWord[];
}> = ({ scene, direction, words }) => {
  const frame = useCurrentFrame();
  const g = useGlobalFrame();
  const loopFrames = useLoopFrames();
  const { fps } = useVideoConfig();
  const cue = (c: Cue | undefined, fb = 0) => resolveCue(c, words, fb);
  const duration = scene.durationInFrames;

  // Plano atual
  const planos: Plano[] = direction.planos ?? [
    { de: 0, enquadramento: SHOT_FROM_JSON[scene.visual.camera] ?? "medio" },
  ];
  const starts = planos.map((p) => cue(p.de));
  let idx = 0;
  starts.forEach((st, i) => {
    if (st <= frame) idx = i;
  });
  const plano = planos[idx];
  const planoStart = starts[idx];
  const planoEnd = starts[idx + 1] ?? duration;
  const local = frame - planoStart;

  // Personagens do plano
  const sceneChars: CharBase[] = scene.visual.characters.map((c) => ({
    id: c.id,
    pose: c.pose,
    expression: c.expression,
    small: c.scale === "inserto_pequeno",
    traje: c.traje,
  }));
  const noChars = ["ceu", "inserto_pao", "raio_luz", "diagrama_lua"].includes(
    plano.enquadramento,
  );
  const baseChars: CharBase[] = plano.personagens
    ? plano.personagens.map((pc) => {
        const fromScene = sceneChars.find((c) => c.id === pc.id);
        return {
          id: pc.id,
          pose: fromScene?.pose ?? "parado",
          expression: fromScene?.expression ?? "neutro",
          small: fromScene?.small,
          traje: fromScene?.traje,
        };
      })
    : noChars
      ? []
      : sceneChars;
  const planoFields = (id: string): Partial<CharBase> => {
    const pc = plano.personagens?.find((c) => c.id === id);
    return pc
      ? {
          pose: pc.pose,
          expression: pc.expressao,
          holding: pc.segurando,
          action: pc.acao,
        }
      : {};
  };
  const poseAtStart = (id: string) => {
    const base = baseChars.find((c) => c.id === id)!;
    return characterState(
      base,
      planoFields(id),
      direction.personagens?.[id],
      planoStart,
      planoStart,
      (c) => cue(c),
    ).pose;
  };
  const placed = place(baseChars, plano, poseAtStart);

  // Câmera do plano
  const [zFrom, zTo] = plano.zoom ?? [1, 1.08];
  const cam: Cam = shotCamera({
    local,
    length: planoEnd - planoStart,
    fps,
    from: zFrom,
    to: zTo,
    focus: centerOf(plano.foco, placed, frame, plano.enquadramento === "close"),
    punch: plano.entrada === "punch",
    center: plano.centralizar,
  });
  const shake = (direction.tremidas ?? []).reduce(
    (acc, t) => {
      const o = shakeOffset(frame, cue(t.de), t.frames, t.forca);
      return { x: acc.x + o.x, y: acc.y + o.y };
    },
    { x: 0, y: 0 },
  );

  // Parâmetros do cenário (cues -> frames)
  const params: Record<string, number | number[]> = {};
  for (const [k, v] of Object.entries(direction.fundo ?? {})) {
    params[k] = Array.isArray(v) ? v.map((x) => cue(x)) : cue(v);
  }
  const ownBackground = ["inserto_pao", "raio_luz", "diagrama_lua"].includes(
    plano.enquadramento,
  );
  const backgroundName =
    plano.cenario ??
    (ownBackground ? plano.enquadramento : scene.visual.background);
  const nightK = nightLevel(backgroundName, frame, params, duration);

  const elements = direction.elementos ?? [];
  const inWindow = (el: { de?: Cue; ate?: Cue }) =>
    frame >= cue(el.de, 0) && frame < cue(el.ate, duration);

  // Elementos no céu (camada de fundo, com parallax)
  const skyElements = elements.map((el, i) => {
    if (el.type === "sol" && inWindow(el) && !noChars) {
      const len = el.encolhe ?? 12;
      const shrink =
        el.some === undefined
          ? 1
          : interpolate(frame, [cue(el.some), cue(el.some) + len], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
      if (shrink <= 0) return null;
      const lift = (1 - shrink) * 40;
      // rotação e pulso no relógio do episódio: no último quadro voltam ao estado do primeiro
      const wobble =
        1 + 0.03 * Math.sin(2 * Math.PI * loopPhase(g, 20, loopFrames));
      const rot = loopPhase(g, idle.sunTurns, loopFrames) * 36;
      return (
        <Sun
          key={i}
          x={el.x ?? sun.x}
          y={(el.y ?? sun.y) - lift}
          r={sun.r}
          rot={rot}
          scale={shrink * wobble}
        />
      );
    }
    if (el.type === "lua" && inWindow(el)) {
      return (
        <Moon
          key={i}
          frame={frame}
          appear={cue(el.aparece)}
          blink={el.pisca !== undefined ? cue(el.pisca) : undefined}
          off={cue(el.apaga)}
        />
      );
    }
    return null;
  });

  // Personagens
  const states = placed.map((p) => ({
    p,
    st: characterState(
      p,
      planoFields(p.id),
      direction.personagens?.[p.id],
      frame,
      planoStart,
      (c) => cue(c),
    ),
  }));
  // Globo de mesa: longitude no frame (gira, trava com solavanco, volta a girar fechando o loop)
  const GLOBE_LON0 = 30;
  const globeFor = (id: string) => {
    const el = elements.find(
      (e) =>
        e.type === "globo" && (e.personagem ?? "nico") === id && inWindow(e),
    );
    if (!el || el.type !== "globo") return null;
    const vel = el.velocidade ?? 5;
    const sceneG = g - frame; // frame global do começo da cena
    if (el.volta !== undefined) {
      const v = cue(el.volta);
      return {
        lon: GLOBE_LON0 + vel * (loopFrames - (sceneG + Math.max(frame, v))),
        jolt: 0,
      };
    }
    const t = el.trava !== undefined ? cue(el.trava) : Infinity;
    const jolt = frame >= t ? Math.max(0, 1 - (frame - t) / 14) : 0;
    const spin = el.giro
      ? 360 *
        el.giro.voltas *
        interpolate(
          Math.min(frame, t),
          [cue(el.giro.de), cue(el.giro.ate)],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.inOut(Easing.sin),
          },
        )
      : 0;
    return {
      lon: GLOBE_LON0 - vel * (sceneG + Math.min(frame, t)) - spin,
      jolt,
    };
  };
  // Deslocamento horizontal do plano (personagem arrastado para fora do quadro)
  const slide = plano.deslocar
    ? interpolate(
        frame,
        [cue(plano.deslocar.de, planoStart), cue(plano.deslocar.ate, planoEnd)],
        [0, plano.deslocar.x],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        },
      )
    : 0;
  const jump = plano.pulo
    ? -plano.pulo.altura *
      Math.sin(
        Math.PI *
          interpolate(frame, [cue(plano.pulo.de), cue(plano.pulo.ate)], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
      )
    : 0;
  const bob = plano.flutuar ? Math.sin(frame / 16) * 26 : 0;
  const spinF = plano.flutuar ? Math.sin(frame / 23) * 6 : 0;
  // Personagem espelhado no plano (ex.: professora apontando para a esquerda)
  const flipOf = (id: string) =>
    plano.personagens?.find((c) => c.id === id)?.espelhar === true;
  const drawChar = ({ p, st }: (typeof states)[number]) => {
    if (!st.visible) return null;
    const poseT = Number.isFinite(st.poseAt)
      ? spring({
          frame: frame - st.poseAt,
          fps,
          config: { damping: 12, mass: 0.6, stiffness: 150 },
        })
      : 1;
    const lookT = Number.isFinite(st.lookAt)
      ? spring({
          frame: frame - st.lookAt,
          fps,
          config: { damping: 14, mass: 0.4, stiffness: 200 },
        })
      : 1;
    const look: Vec | undefined =
      st.look && st.prevLook && lookT < 1
        ? [
            st.prevLook[0] + (st.look[0] - st.prevLook[0]) * lookT,
            st.prevLook[1] + (st.look[1] - st.prevLook[1]) * lookT,
          ]
        : st.look;
    const props = {
      pose: st.pose,
      fromPose: st.prevPose,
      poseT,
      expression: st.expression,
      holding: st.holding ?? null,
      action: st.action ?? null,
      look,
      globe: globeFor(p.id),
      deskOnly: plano.personagens?.find((c) => c.id === p.id)?.soMesa === true,
      traje: st.traje ? { capacete: st.capacete !== false } : null,
    };
    return (
      <g
        key={p.id}
        transform={`translate(${p.x + (p.screen ? 0 : slide)} ${p.y + (p.screen ? 0 : jump + bob)}) rotate(${p.screen ? 0 : spinF}) scale(${flipOf(p.id) ? -p.s : p.s} ${p.s})`}
      >
        <InkScale scale={p.s}>
          {p.id === "dani" ? (
            <Dani {...props} />
          ) : p.id === "professora" ? (
            <Professora {...props} />
          ) : (
            <Nico {...props} />
          )}
        </InkScale>
      </g>
    );
  };
  const worldChars = states.filter((s) => !s.p.screen).map(drawChar);
  const screenChars = states.filter((s) => s.p.screen).map(drawChar);

  // Âncoras em tela (balões e etiquetas ficam sempre dentro do quadro)
  const anchor = (id: string | undefined, dy: number) => {
    const p = placed.find((c) => c.id === (id ?? "nico"));
    if (!p) return null;
    if (p.screen) return { x: p.x, y: p.y + dy * p.s };
    return toScreen(cam, p.x, p.y + dy * p.s);
  };

  const overlay = elements.map((el, i) => {
    switch (el.type) {
      case "balao": {
        const a = anchor(el.personagem, HEAD_Y - 120);
        const p = placed.find((c) => c.id === (el.personagem ?? "nico"));
        if (!a || !p) return null;
        return (
          <SpeechBubble
            key={i}
            frame={frame}
            from={cue(el.de)}
            to={cue(el.ate, duration)}
            text={el.texto}
            ax={a.x + 170 * p.s * cam.zoom}
            ay={a.y}
          />
        );
      }
      case "etiqueta": {
        const a = anchor(el.personagem, TAG_Y);
        if (!a) return null;
        return (
          <NameTag
            key={i}
            frame={frame}
            from={cue(el.de)}
            to={cue(el.ate, duration)}
            text={el.texto}
            x={a.x}
            y={a.y}
          />
        );
      }
      case "prova":
        return (
          <TestPaper
            key={i}
            frame={frame}
            from={cue(el.de)}
            to={cue(el.ate, duration)}
            gradeAt={cue(el.notaEm)}
            grade={el.nota}
          />
        );
      case "termometro":
        return (
          <Thermometer
            key={i}
            frame={frame}
            from={cue(el.de)}
            to={cue(el.ate, duration)}
            big={el.grande}
            rotulo={el.texto}
            frio={el.frio}
          />
        );
      case "globo":
        return el.flash && el.trava !== undefined ? (
          <Flash key={i} frame={frame} at={cue(el.trava)} />
        ) : null;
      case "sol": {
        if (!el.flash || el.some === undefined) return null;
        return (
          <Flash
            key={i}
            frame={frame}
            at={cue(el.some) + (el.encolhe ?? 12) - 2}
          />
        );
      }
      default:
        return null;
    }
  });

  // Texto na tela: some quando só repete a fala
  const showText =
    direction.texto?.mostrar ??
    !repeatsNarration(scene.onScreenText, scene.narration);

  return (
    <AbsoluteFill>
      {/* a tremida mexe a imagem; o texto na tela fica parado */}
      <AbsoluteFill style={{ translate: `${shake.x}px ${shake.y}px` }}>
        <svg
          width={1080}
          height={1920}
          viewBox="0 0 1080 1920"
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          <Background
            name={backgroundName}
            cam={cam}
            frame={frame}
            globalFrame={g}
            duration={duration}
            params={params}
            skyElements={skyElements}
            shotFrame={local}
            shotLength={planoEnd - planoStart}
          />
          {/* vento por trás dos personagens */}
          {elements.map((el, i) =>
            el.type === "vento" ? (
              <WindStreaks
                key={`v${i}`}
                frame={frame}
                from={cue(el.de, 0)}
                to={cue(el.ate, duration)}
                forca={el.forca}
                papeis={el.papeis}
              />
            ) : null,
          )}
          <NightLevel.Provider value={nightK}>
            <Layer cam={cam} depth={1}>
              {worldChars}
            </Layer>
            {screenChars}
          </NightLevel.Provider>
          {overlay}
        </svg>
      </AbsoluteFill>
      {showText ? (
        <OnScreenText
          text={scene.onScreenText}
          frame={frame}
          from={cue(direction.texto?.de, 0)}
          to={cue(direction.texto?.ate, duration)}
          animate={direction.texto?.animar !== false}
          sticker={direction.texto?.estilo === "sticker"}
          corner={direction.texto?.estilo === "canto"}
          top={direction.texto?.topo}
        />
      ) : null}
    </AbsoluteFill>
  );
};
