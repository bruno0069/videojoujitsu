import React from "react";
import { Easing, interpolate, interpolateColors, spring, useVideoConfig } from "remotion";
import { colors } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Earth } from "../elements/Earth";
import { Sun } from "../elements/Sun";
import { InfoLabel } from "../elements/Props";
import { useInk } from "../Ink";
import { MilkyWay, SkyFill, Stars } from "../Sky";

// Insertos da versão longa (só imagem, sem fala). `frame` é relativo ao começo do inserto.

// Raio de luz Sol -> Terra: a última luz ainda viaja enquanto o timer conta.
export const RaioLuz: React.FC<{ cam: Cam; frame: number; length: number }> = ({ cam, frame, length }) => (
  <>
    <Layer cam={cam} depth={0.1}>
      <SkyFill color={colors.noite} />
      <MilkyWay bg={colors.noite} />
      <Stars frame={frame} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <RaioConteudo frame={frame} length={length} />
    </Layer>
  </>
);

const RaioConteudo: React.FC<{ frame: number; length: number }> = ({ frame, length }) => {
  const ink = useInk();
  const { fps } = useVideoConfig();
  const sun = { x: 250, y: 860 };
  const earth = { x: 820, y: 1120 };
  const head = interpolate(frame, [6, length - 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const tail = Math.max(0, head - 0.28);
  const at = (k: number) => ({ x: sun.x + (earth.x - sun.x) * k, y: sun.y + (earth.y - sun.y) * k });
  const h = at(head);
  const tl = at(tail);
  const label = spring({ frame: frame - 10, fps, config: { damping: 8, mass: 0.6, stiffness: 170 } });
  const hit = frame >= length - 14 ? 1 + 0.12 * Math.sin(((frame - (length - 14)) / 7) * Math.PI) : 1;
  return (
    <g>
      {/* órbita da Terra em volta de onde o Sol estava */}
      <circle cx={sun.x} cy={sun.y} r={Math.hypot(earth.x - sun.x, earth.y - sun.y)} fill="none" stroke={colors.creme} strokeWidth={ink * 0.5} strokeDasharray={`${ink * 2} ${ink * 2}`} opacity={0.3} />
      {/* trajeto */}
      <path d={`M ${sun.x} ${sun.y} L ${earth.x} ${earth.y}`} stroke={colors.creme} strokeWidth={ink * 0.5} strokeDasharray={`${ink * 1.5} ${ink * 1.5}`} opacity={0.5} />
      {/* o Sol já sumiu: só o contorno pontilhado */}
      <circle cx={sun.x} cy={sun.y} r={150} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.8} strokeDasharray={`${ink * 1.4} ${ink * 1.4}`} />
      {/* pacote de luz viajando */}
      <path d={`M ${tl.x} ${tl.y} L ${h.x} ${h.y}`} stroke={colors.tinta} strokeWidth={ink * 3.4} strokeLinecap="round" />
      <path d={`M ${tl.x} ${tl.y} L ${h.x} ${h.y}`} stroke={colors.amarelo} strokeWidth={ink * 2} strokeLinecap="round" />
      <g transform={`translate(${earth.x} ${earth.y}) scale(${hit}) translate(${-earth.x} ${-earth.y})`}>
        <Earth x={earth.x} y={earth.y} r={140} />
      </g>
      <InfoLabel x={540} y={640} text="a última luz ainda viaja" s={label} />
    </g>
  );
};

// Diagrama Sol -> Lua -> Terra: a Lua só devolve a luz do Sol; sem Sol, ela apaga.
export const DiagramaLua: React.FC<{ cam: Cam; frame: number; length: number }> = ({ cam, frame, length }) => (
  <>
    <Layer cam={cam} depth={0.1}>
      <SkyFill color={colors.noiteEscura} />
      <Stars frame={frame} opacity={0.7} />
    </Layer>
    <Layer cam={cam} depth={1}>
      <LuaConteudo frame={frame} length={length} />
    </Layer>
  </>
);

const LuaConteudo: React.FC<{ frame: number; length: number }> = ({ frame, length }) => {
  const ink = useInk();
  const { fps } = useVideoConfig();
  const sunP = { x: 200, y: 1150 };
  const moon = { x: 560, y: 640 };
  const earth = { x: 880, y: 1150 };
  const ray1 = interpolate(frame, [4, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ray2 = interpolate(frame, [24, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const off = length - 24; // o Sol some e a Lua apaga
  const sunGone = interpolate(frame, [off, off + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const moonFill = interpolateColors(frame, [off + 4, off + 10], [colors.creme, "#2A2350"]);
  const label = spring({ frame: frame - 26, fps, config: { damping: 8, mass: 0.6, stiffness: 170 } });
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }, k: number, key: string) =>
    k > 0 ? (
      <g key={key} opacity={sunGone}>
        <path d={`M ${a.x} ${a.y} L ${a.x + (b.x - a.x) * k} ${a.y + (b.y - a.y) * k}`} stroke={colors.tinta} strokeWidth={ink * 2.6} strokeLinecap="round" />
        <path d={`M ${a.x} ${a.y} L ${a.x + (b.x - a.x) * k} ${a.y + (b.y - a.y) * k}`} stroke={colors.amarelo} strokeWidth={ink * 1.4} strokeLinecap="round" />
      </g>
    ) : null;
  return (
    <g>
      {seg(sunP, moon, ray1, "r1")}
      {seg(moon, earth, ray2, "r2")}
      {sunGone > 0 ? (
        <Sun x={sunP.x} y={sunP.y} r={80} scale={sunGone} />
      ) : (
        <circle cx={sunP.x} cy={sunP.y} r={80} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.8} strokeDasharray={`${ink * 1.4} ${ink * 1.4}`} />
      )}
      <circle cx={moon.x} cy={moon.y} r={90} fill={moonFill} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={moon.x - 28} cy={moon.y - 20} r={18} fill={colors.chaoSombra} opacity={0.6} />
      <Earth x={earth.x} y={earth.y} r={90} />
      <InfoLabel x={560} y={460} text="luz emprestada" s={label} />
    </g>
  );
};
