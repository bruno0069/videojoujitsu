import React, { useId } from "react";
import { Easing, interpolate } from "remotion";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { InfoLabel } from "../elements/Props";
import { Sun } from "../elements/Sun";
import { useInk } from "../Ink";
import { MilkyWay, SkyFill, Stars } from "../Sky";

// Diagramas do ep02 (a Terra para de girar). `frame` é o frame da cena; os parâmetros vêm de
// `fundo` na direção, já convertidos em frames.

export const GLOBO_DIAGRAMA = { x: 600, y: 800, r: 320 };
const SPIN = 1.2; // graus de longitude por frame (exagerado, é um diagrama)
const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// interpolate com início opcional: sem cue (Infinity) fica no valor inicial
const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;

// Globo girando com o equador e a seta da velocidade. `para`: a Terra para (a seta não);
// `seta`: a seta aparece; `vento`: a seta vira linhas de vento varrendo o globo.
export const DiagramaGlobo: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const para = n(params.para);
  const lon = -20 - SPIN * Math.min(frame, para);
  const g = GLOBO_DIAGRAMA;
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Globe x={g.x} y={g.y} r={g.r} lon={lon} equador />
        <SetaEquador frame={frame} seta={n(params.seta)} para={para} vento={n(params.vento)} />
        <VentoGlobo frame={frame} at={n(params.vento)} />
      </Layer>
    </>
  );
};

// A seta acompanha a superfície no equador. Quando a Terra para, ela segue em frente e sai
// pela borda do globo.
const SetaEquador: React.FC<{ frame: number; seta: number; para: number; vento: number }> = ({ frame, seta, para, vento }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  if (frame < seta || frame >= vento + 20) return null;
  const grow = ramp(frame, seta, seta + 12);
  const fly = ramp(frame, para, para + 45, { ...clamp, easing: Easing.in(Easing.quad) });
  const x0 = g.x - g.r * 0.55 + fly * g.r * 1.4;
  const len = g.r * 0.9 * grow;
  const fade = 1 - ramp(frame, vento, vento + 20);
  const x1 = x0 + len;
  return (
    <g opacity={fade}>
      <path d={`M ${x0} ${g.y} L ${x1} ${g.y}`} stroke={colors.tinta} strokeWidth={ink * 3.2} strokeLinecap="round" />
      <path d={`M ${x0} ${g.y} L ${x1} ${g.y}`} stroke={colors.amarelo} strokeWidth={ink * 1.8} strokeLinecap="round" />
      <path d={`M ${x1 - 46} ${g.y - 40} L ${x1 + 14} ${g.y} L ${x1 - 46} ${g.y + 40} Z`} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
    </g>
  );
};

// Linhas de vento atravessando o globo da esquerda para a direita
const VentoGlobo: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  if (frame < at) return null;
  const k = interpolate(frame, [at, at + 15], [0, 1], clamp);
  const lines = Array.from({ length: 9 }, (_, i) => {
    const y = g.y - g.r * 0.8 + (i * g.r * 1.6) / 8;
    const speed = 26 + (i % 3) * 8;
    const x = ((frame - at) * speed + i * 210) % 1700 - 400;
    const l = 180 + (i % 2) * 120;
    const curl = i % 3 === 0 ? ` q 40 -10 30 -40 q -12 -26 -36 -6` : "";
    return (
      <g key={i} opacity={k}>
        <path d={`M ${x} ${y} l ${l} 0${curl}`} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${x} ${y} l ${l} 0${curl}`} fill="none" stroke={colors.creme} strokeWidth={ink * 1.0} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  });
  return <g>{lines}</g>;
};

// Mapa: continente simplificado; a água chega pela esquerda e avança sobre ele.
// `onda`/`ondaAte`: começo e fim do avanço; `pino`: marca onde o Nico mora (costa nova).
export const MAPA = { costaX: 260, novaX: 700, pino: { x: 760, y: 980 } };
const CONTINENTE =
  "M 240 420 C 330 380 470 400 560 430 C 700 470 820 520 900 600 C 980 690 1000 800 960 900 C 920 1010 860 1100 800 1200 C 740 1300 700 1420 640 1500 C 590 1560 540 1540 520 1470 C 500 1380 470 1290 420 1220 C 360 1140 300 1080 280 980 C 260 880 230 780 220 680 C 210 580 200 470 240 420 Z";

export const MapaOnda: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const onda = n(params.onda);
  const ate = n(params.ondaAte, onda + 90);
  const pino = n(params.pino);
  const k = ramp(frame, onda, ate, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const front = -200 + (MAPA.novaX + 200) * k; // frente da água (x)
  const wobble = (y: number) => Math.sin(y / 70 + frame / 4) * 22;
  const ys = Array.from({ length: 25 }, (_, i) => 300 + i * 60);
  const water = `M -400 200 L ${ys.map((y) => `${front + wobble(y)} ${y}`).join(" L ")} L -400 1800 Z`;
  const pin = ramp(frame, pino, pino + 10, { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <>
      <Layer cam={cam} depth={0.2}>
        <SkyFill color={colors.ceu} />
        {/* ondinhas do oceano */}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M ${-100 + ((i * 230 + frame * 3) % 1400)} ${260 + i * 150} q 30 -24 60 0 q 30 24 60 0`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.8} strokeLinecap="round" opacity={0.6} />
        ))}
      </Layer>
      <Layer cam={cam} depth={1}>
        <clipPath id={`continente-${id}`}>
          <path d={CONTINENTE} />
        </clipPath>
        <path d={CONTINENTE} fill={colors.turquesa} />
        <g clipPath={`url(#continente-${id})`}>
          <rect x={150} y={300} width={140} height={1400} fill={sombra(colors.turquesa)} />
          {/* água invadindo: mesma cor do mar, com espuma na frente */}
          {k > 0 ? <path d={water} fill={colors.ceu} /> : null}
        </g>
        <path d={CONTINENTE} fill="none" stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        {k > 0 ? (
          <>
            <path d={`M ${ys.map((y) => `${front + wobble(y)} ${y}`).join(" L ")}`} fill="none" stroke={colors.creme} strokeWidth={ink * 1.6} strokeLinecap="round" strokeLinejoin="round" />
            <path d={`M ${front - 150} 880 l 110 0 m -40 -34 l 40 34 l -40 34`} fill="none" stroke={colors.tinta} strokeWidth={ink * 1.2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : null}
        {pin > 0 ? (
          <g transform={`translate(${MAPA.pino.x} ${MAPA.pino.y}) scale(${pin})`}>
            <path d="M 0 0 C -40 -50 -60 -80 -60 -110 C -60 -150 -30 -175 0 -175 C 30 -175 60 -150 60 -110 C 60 -80 40 -50 0 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
            <circle cx={0} cy={-112} r={22} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
          </g>
        ) : null}
        {pin > 0 ? <InfoLabel x={MAPA.pino.x - 20} y={MAPA.pino.y + 90} text="costa nova" s={pin} /> : null}
      </Layer>
    </>
  );
};

// Globo parado: metade dia (esquerda, com o Sol) e metade noite (direita), para sempre.
export const GLOBO_DIA_NOITE = { x: 540, y: 880, r: 380 };
export const GloboDiaNoite: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const g = GLOBO_DIA_NOITE;
  const rotulos = n(params.rotulos);
  const s = (at: number) => interpolate(frame, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noiteEscura} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={0.4}>
        <Sun x={-120} y={g.y - 40} r={170} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Globe x={g.x} y={g.y} r={g.r} lon={-35} noite={1} grade={false} />
        {frame >= rotulos ? (
          <>
            <InfoLabel x={g.x - g.r * 0.5} y={g.y - g.r - 70} text="dia" s={s(rotulos)} />
            <InfoLabel x={g.x + g.r * 0.5} y={g.y - g.r - 70} text="noite" s={s(rotulos + 6)} />
          </>
        ) : null}
      </Layer>
    </>
  );
};
