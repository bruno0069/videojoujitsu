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
// `rotuloEquador`: rótulo "EQUADOR" encostado na linha pontilhada.
// ep05: `brilho` (faixa brilhante no equador), `giro` (graus por frame), `polo` (ponto no Polo Norte), `numeros` (velocidades subindo ao
// lado do equador e do polo), `pulsaEquador`/`pulsaPolo` (destaque pulsando, com rótulo),
// `numerosPolo` (o ≈ 0 do polo entra depois), `ventoEquador` (vento saindo da faixa do equador), `seca` (o mar escorre para os polos).
export const DiagramaGlobo: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const para = n(params.para);
  const spin = n(params.giro, SPIN);
  const lon = -20 - spin * Math.min(frame, para);
  const g = GLOBO_DIAGRAMA;
  const seca = ramp(frame, n(params.seca), n(params.seca) + 90, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        {Number.isFinite(n(params.brilho)) || Number.isFinite(n(params.pulsaEquador)) ? <BrilhoEquador frame={frame} pulsa={n(params.pulsaEquador)} /> : null}
        <Globe x={g.x} y={g.y} r={g.r} lon={lon} equador seca={seca} />
        <SetaEquador frame={frame} seta={n(params.seta)} para={para} vento={n(params.vento)} />
        <VentoGlobo frame={frame} at={n(params.vento)} />
        <VentoEquador frame={frame} at={n(params.ventoEquador)} />
        <MaresPolos frame={frame} at={n(params.seca)} />
        <PontoPolo frame={frame} at={n(params.polo)} pulsa={n(params.pulsaPolo)} />
        <Numeros frame={frame} at={n(params.numeros)} polo={n(params.numerosPolo, n(params.numeros))} />
        {frame >= n(params.rotuloEquador) ? <InfoLabel x={g.x + g.r * 0.62} y={g.y - 90} text="EQUADOR" s={ramp(frame, n(params.rotuloEquador), n(params.rotuloEquador) + 8, { ...clamp, easing: Easing.out(Easing.back(2)) })} /> : null}
        <RotuloPulso frame={frame} at={n(params.pulsaEquador)} x={g.x - g.r - 20} y={g.y - 70} text="Equador" />
        <RotuloPulso frame={frame} at={n(params.pulsaPolo)} x={g.x + 60} y={g.y - g.r - 10} text="Polo" />
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

// Pulso de destaque (0..1) que começa em `at` e repete a cada 30 frames
const pulse = (frame: number, at: number) => (frame < at ? 0 : 0.5 - 0.5 * Math.cos(((frame - at) / 30) * 2 * Math.PI));

// Faixa brilhante do equador (por trás da linha tracejada): sempre acesa, pulsa com `pulsa`
const BrilhoEquador: React.FC<{ frame: number; pulsa: number }> = ({ frame, pulsa }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  const k = pulse(frame, pulsa);
  return (
    <g>
      <path d={`M ${g.x - g.r - 40} ${g.y} L ${g.x + g.r + 40} ${g.y}`} stroke={colors.amarelo} strokeWidth={ink * (2.4 + 3 * k)} strokeLinecap="round" opacity={0.35 + 0.4 * k} />
    </g>
  );
};

// Ponto no Polo Norte (topo do globo), com pulso opcional
const PontoPolo: React.FC<{ frame: number; at: number; pulsa: number }> = ({ frame, at, pulsa }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  const start = Math.min(at, pulsa);
  if (frame < start) return null;
  const s = ramp(frame, start, start + 8, { ...clamp, easing: Easing.out(Easing.back(2)) });
  const k = pulse(frame, pulsa);
  return (
    <g transform={`translate(${g.x} ${g.y - g.r}) scale(${s})`}>
      {k > 0 ? <circle r={34 + 30 * k} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.9} opacity={1 - k * 0.6} /> : null}
      <circle r={22} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
      <circle r={8} fill={colors.creme} />
    </g>
  );
};

// Rótulo que entra junto com o pulso
const RotuloPulso: React.FC<{ frame: number; at: number; x: number; y: number; text: string }> = ({ frame, at, x, y, text }) => {
  if (frame < at) return null;
  const s = ramp(frame, at, at + 8, { ...clamp, easing: Easing.out(Easing.back(2)) });
  return <InfoLabel x={x} y={y} text={text} s={s} anchor="start" />;
};

// Velocidades subindo ao lado do equador (até ≈ 1.675 km/h) e do polo (fica em ≈ 0)
const Numeros: React.FC<{ frame: number; at: number; polo: number }> = ({ frame, at, polo }) => {
  const g = GLOBO_DIAGRAMA;
  if (frame < at) return null;
  const k = ramp(frame, at, at + 45, { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = Math.round(1675 * k).toLocaleString("pt-BR");
  const s = ramp(frame, at, at + 8, { ...clamp, easing: Easing.out(Easing.back(2)) });
  return (
    <>
      <InfoLabel x={g.x + 60} y={g.y + 80} text={`${v} km/h`} s={s} />
      {frame >= polo ? <InfoLabel x={g.x - 170} y={g.y - g.r + 70} text="≈ 0 km/h" s={ramp(frame, polo, polo + 8, { ...clamp, easing: Easing.out(Easing.back(2)) })} /> : null}
    </>
  );
};

// Vento disparando da faixa do equador para os dois lados
const VentoEquador: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  if (frame < at) return null;
  const k = interpolate(frame, [at, at + 12], [0, 1], clamp);
  const lines = Array.from({ length: 24 }, (_, i) => {
    const dir = i % 2 ? 1 : -1;
    const y = g.y + ((i % 8) - 3.5) * 26;
    const speed = 18 + (i % 3) * 6;
    const d = ((frame - at) * speed + i * 97) % 650;
    const x = g.x + dir * (g.r * 0.2 + d);
    const l = 170 + (i % 2) * 90;
    return (
      <g key={i} opacity={k}>
        <path d={`M ${x} ${y} l ${dir * l} 0`} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.2} strokeLinecap="round" />
        <path d={`M ${x} ${y} l ${dir * l} 0`} fill="none" stroke={colors.creme} strokeWidth={ink * 1.0} strokeLinecap="round" />
      </g>
    );
  });
  return <g>{lines}</g>;
};

// Setas da água indo do equador para os polos
const MaresPolos: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const ink = useInk();
  const g = GLOBO_DIAGRAMA;
  if (frame < at) return null;
  const k = ramp(frame, at, at + 12);
  const t = ((frame - at) % 45) / 45; // as setas escorrem em ciclo
  const seta = (dir: number, dx: number) => {
    const y0 = g.y + dir * (g.r * 0.2 + t * g.r * 0.45);
    return (
      <g key={`${dir}${dx}`} opacity={k * (1 - t * 0.6)}>
        <path d={`M ${g.x + dx} ${y0} l 0 ${dir * 90} m -26 ${-dir * 30} l 26 ${dir * 30} l 26 ${-dir * 30}`} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.4} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${g.x + dx} ${y0} l 0 ${dir * 90} m -26 ${-dir * 30} l 26 ${dir * 30} l 26 ${-dir * 30}`} fill="none" stroke={colors.ceu} strokeWidth={ink * 1.1} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  return <g>{[-1, 1].flatMap((dir) => [seta(dir, -120), seta(dir, 120)])}</g>;
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

// "POLO" acima do globo, com um traço até o topo (o polo)
const RotuloPolo: React.FC<{ g: { x: number; y: number; r: number }; s: number }> = ({ g, s }) => {
  const ink = useInk();
  const top = g.y - g.r;
  const ly = top - 170;
  return (
    <g>
      <path d={`M ${g.x} ${ly + 40} L ${g.x} ${top - 6}`} stroke={colors.tinta} strokeWidth={ink * 1.6} strokeLinecap="round" opacity={s > 0.5 ? 1 : s * 2} />
      <path d={`M ${g.x} ${ly + 40} L ${g.x} ${top - 6}`} stroke={colors.creme} strokeWidth={ink * 0.6} strokeLinecap="round" opacity={s > 0.5 ? 1 : s * 2} />
      <InfoLabel x={g.x} y={ly} text="POLO" s={s} />
    </g>
  );
};

// Globo parado: metade dia (esquerda, com o Sol) e metade noite (direita), para sempre.
// `rotulos`: "dia" e "noite"; `rotuloPolo`: "POLO" apontando para o topo do globo.
export const GLOBO_DIA_NOITE = { x: 540, y: 880, r: 380 };
export const GloboDiaNoite: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const g = GLOBO_DIA_NOITE;
  const rotulos = n(params.rotulos);
  const polo = n(params.rotuloPolo);
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
        {frame >= polo ? <RotuloPolo g={g} s={s(polo)} /> : null}
      </Layer>
    </>
  );
};
