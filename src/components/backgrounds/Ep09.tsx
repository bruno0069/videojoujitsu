import React from "react";
import { Easing, interpolate, interpolateColors } from "remotion";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { Cloud, SkyFill } from "../Sky";
import { Lata } from "./Ep08";
import { FundoPainel, PlacaLinhas } from "./Ep08v2";
import { clamp, estrela, janela, n, NicoEm, on, pop, ramp, T, Xis } from "./Ep07";

// Cenários do ep09 (episódio 8: E se a escola ficasse debaixo d'água?). Física da pressão da água:
// régua de profundidade na lateral direita (fio condutor), manômetro 1 -> 2 atm, coluna de blocos
// (cada bloco = 1 atm), tubo listrado genérico, corte simplificado do ouvido, dois pulmões 6 L -> 3 L
// e um cilindro cinza genérico com regulador. Tudo chapado: sem degradê, desfoque ou filtro SVG,
// sem marca, sem texto de fabricante. Texto obrigatório dentro da zona segura (y 230–1382, x 90–990).
// Números na tela só os permitidos: 10 m, 2 atm, 1 atm, +1 atm, 1 m, ≈ 1 m, 2 m, ≈ 2 m, 6 L → 3 L, 40 m.

type Params = Record<string, number | number[]>;
const lista = (v: number | number[] | undefined) => (Array.isArray(v) ? v : typeof v === "number" ? [v] : []);
const suave = { ...clamp, easing: Easing.inOut(Easing.cubic) };

// Cores (todas da paleta do tema; faixas lisas de azul, sem degradê)
const CINZA = interpolateColors(0.22, [0, 1], [colors.branco, colors.tinta]);
const CINZA_ESC = interpolateColors(0.45, [0, 1], [colors.branco, colors.tinta]);
const AGUA = [colors.ceu, sombra(colors.ceu), colors.ceuMeio, sombra(colors.ceuMeio), colors.noite, colors.noiteEscura];

// ---------------------------------------------------------------- profundidade (em metros) no tempo
// `prof0`: profundidade ao entrar na cena; `profEm` (cues) e `profPara` (metros): cada passo vai
// suavemente até o novo valor em `profDur` frames (padrão 16)
export const profundidade = (frame: number, params: Params) => {
  let d = n(params.prof0, 0);
  const em = lista(params.profEm);
  const para = lista(params.profPara);
  const dur = lista(params.profDur);
  em.forEach((at, i) => {
    const k = ramp(frame, at, at + (dur[i] ?? 16), suave);
    d += ((para[i] ?? d) - d) * k;
  });
  return d;
};

// ---------------------------------------------------------------- ReguaProfundidade
// Faixa vertical na lateral direita (x 870–990), marcas SUPERFÍCIE / 1 m / 2 m / 10 m / 40 m (escala
// por trechos, não linear). O marcador (triângulo coral + linha amarela) fica na profundidade atual.
// Perto da superfície aparece o rótulo SUPERFÍCIE ao lado.
export const REGUA = { x0: 870, x1: 990, top: 456, bot: 1150, marcas: [0, 1, 2, 10, 40], ys: [500, 610, 720, 920, 1110] };
export const yRegua = (m: number) => interpolate(m, REGUA.marcas, REGUA.ys, clamp);
export const ReguaProfundidade: React.FC<{ prof: number; s?: number }> = ({ prof, s = 1 }) => {
  if (s <= 0) return null;
  const { x0, x1, top, bot, marcas, ys } = REGUA;
  const cx = (x0 + x1) / 2;
  const y = yRegua(prof);
  const sup = interpolate(prof, [0.15, 0.4], [1, 0], clamp);
  return (
    <g opacity={Math.min(1, s)}>
      <rect x={x0} y={top} width={x1 - x0} height={bot - top} rx={26} fill={colors.tinta} />
      <rect x={x0 + 8} y={top + 8} width={x1 - x0 - 16} height={bot - top - 16} rx={20} fill="none" stroke={colors.creme} strokeWidth={4} />
      {/* superfície: onda */}
      <path d={`M ${x0 + 14} ${ys[0]} q 15 -12 30 0 t 30 0 t 30 0`} fill="none" stroke={colors.ceu} strokeWidth={8} strokeLinecap="round" />
      {marcas.slice(1).map((m, i) => (
        <g key={m}>
          <path d={`M ${x0} ${ys[i + 1]} L ${x0 + 16} ${ys[i + 1]} M ${x1 - 16} ${ys[i + 1]} L ${x1} ${ys[i + 1]}`} stroke={colors.creme} strokeWidth={6} />
          <T x={cx} y={ys[i + 1] - 14} size={44} fill={colors.creme}>{`${m} m`}</T>
        </g>
      ))}
      {/* marcador */}
      <rect x={x0 + 4} y={y - 4} width={x1 - x0 - 8} height={8} rx={4} fill={colors.amarelo} />
      <path d={`M ${x0 - 34} ${y - 20} L ${x0 - 4} ${y} L ${x0 - 34} ${y + 20} Z`} fill={colors.coral} stroke={colors.tinta} strokeWidth={6} strokeLinejoin="round" />
      {sup > 0 ? (
        <g opacity={sup}>
          <rect x={548} y={ys[0] - 34} width={296} height={68} rx={20} fill={colors.tinta} />
          <T x={696} y={ys[0] + 16} size={44} fill={colors.creme}>SUPERFÍCIE</T>
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- Manometro
// Mostrador chapado; o ponteiro vai de 1 atm (−60°) a 2 atm (+60°). `leitura`: texto do visor.
export const Manometro: React.FC<{ x: number; y: number; r: number; atm: number; s: number; leitura?: string }> = ({ x, y, r, atm, s, leitura }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const ang = -60 + (atm - 1) * 120;
  const arco = (a0: number, a1: number, rr: number) => {
    const p = (a: number) => [Math.sin((a * Math.PI) / 180) * rr, -Math.cos((a * Math.PI) / 180) * rr];
    const [ax, ay] = p(a0);
    const [bx, by] = p(a1);
    return `M ${ax} ${ay} A ${rr} ${rr} 0 0 1 ${bx} ${by}`;
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r + 14} fill={CINZA_ESC} stroke={colors.tinta} strokeWidth={ink} />
      <circle r={r} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d={arco(-75, 75, r * 0.78)} fill="none" stroke={colors.chaoSombra} strokeWidth={r * 0.16} />
      <path d={arco(-60, Math.max(-59, ang), r * 0.78)} fill="none" stroke={colors.coral} strokeWidth={r * 0.16} />
      {[-60, -30, 0, 30, 60].map((a) => (
        <path key={a} d={`M 0 ${-r * 0.62} L 0 ${-r * (a % 60 === 0 ? 0.92 : 0.86)}`} transform={`rotate(${a})`} stroke={colors.tinta} strokeWidth={a % 60 === 0 ? 10 : 6} strokeLinecap="round" />
      ))}
      <path d={`M 0 ${r * 0.12} L 0 ${-r * 0.7}`} transform={`rotate(${ang})`} stroke={colors.tinta} strokeWidth={12} strokeLinecap="round" />
      <circle r={r * 0.12} fill={colors.coral} stroke={colors.tinta} strokeWidth={6} />
      {leitura ? (
        <g transform={`translate(0 ${r + 62})`}>
          <rect x={-104} y={-38} width={208} height={72} rx={20} fill={colors.tinta} />
          <T x={0} y={16} size={46} fill={colors.amarelo}>{leitura}</T>
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- BalaoPulmao
// Par de pulmões chapado; `k` = tamanho (1 cheio, 0,71 = metade da área)
export const BalaoPulmao: React.FC<{ x: number; y: number; s: number; k?: number; cor?: string }> = ({ x, y, s, k = 1, cor = colors.coralClaro }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const lobo = "M -18 -110 C -70 -140 -160 -60 -160 50 C -160 150 -110 172 -30 150 C -20 80 -18 0 -18 -110 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g transform={`scale(${k})`}>
        <path d={lobo} fill={cor} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <path d={lobo} transform="scale(-1 1)" fill={cor} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <path d="M -110 -20 Q -90 -60 -60 -70 M 110 -20 Q 90 -60 60 -70" fill="none" stroke={colors.branco} strokeWidth={10} strokeLinecap="round" opacity={0.7} />
      </g>
      <path d={`M 0 -200 L 0 ${-118 * k} M 0 ${-118 * k} L ${-26 * k} ${-92 * k} M 0 ${-118 * k} L ${26 * k} ${-92 * k}`} stroke={colors.tinta} strokeWidth={ink * 1.3} strokeLinecap="round" fill="none" />
      <path d={`M 0 -200 L 0 ${-118 * k}`} stroke={colors.creme} strokeWidth={ink * 0.5} strokeLinecap="round" />
    </g>
  );
};

// Setas de pressão (coral) apontando para (0,0) de `n` direções, a `r` do centro
const SetasPressao: React.FC<{ x: number; y: number; r: number; s: number; n?: number; tam?: number; giro?: number }> = ({ x, y, r, s, n: q = 4, tam = 1, giro = 45 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y})`} opacity={Math.min(1, s)}>
      {Array.from({ length: q }, (_, i) => (
        <g key={i} transform={`rotate(${giro + (i * 360) / q}) translate(0 ${-r - 70 * (1 - s)})`}>
          <g transform={`scale(${tam})`}>
            <path d="M -14 -64 L 14 -64 L 14 -26 L 32 -26 L 0 8 L -32 -26 L -14 -26 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={6} strokeLinejoin="round" />
          </g>
        </g>
      ))}
    </g>
  );

// ---------------------------------------------------------------- TuboSnorkelGenerico
// Tubo em J com listras neutras (creme e areia), sem marca. `d` = caminho; `fluxo` anima pontinhos
// de ar descendo; `para` (0..1) apaga o fluxo.
export const TuboSnorkelGenerico: React.FC<{ d: string; fluxo: number; para: number; topo: [number, number] }> = ({ d, fluxo, para, topo }) => {
  const ink = useInk();
  return (
    <g>
      <path d={d} fill="none" stroke={colors.tinta} strokeWidth={34 + ink} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={colors.creme} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={colors.chaoSombra} strokeWidth={34} strokeDasharray="22 22" strokeLinejoin="round" />
      {para < 1 ? (
        <path d={d} fill="none" stroke={colors.branco} strokeWidth={10} strokeDasharray="6 34" strokeDashoffset={-fluxo} strokeLinecap="round" opacity={1 - para} />
      ) : null}
      <circle cx={topo[0]} cy={topo[1]} r={22} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
    </g>
  );
};

// ---------------------------------------------------------------- CorteOuvido
// Corte lateral simplificado: orelha, canal (com água), tímpano (curva para dentro com `empurra`),
// ouvido médio com ar e a tuba fechada (tracejada). Seta de pressão no canal cresce com `seta`.
export const CorteOuvido: React.FC<{ s: number; seta: number; empurra: number; rotulo: number; dor: number }> = ({ s, seta, empurra, rotulo, dor }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const b = 46 * empurra;
  return (
    <g transform={`scale(${s})`}>
      {/* tecido da cabeça */}
      <rect x={-250} y={-230} width={560} height={460} rx={130} fill={colors.pele} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-250} y={-230} width={560} height={460} rx={130} fill={sombra(colors.pele)} opacity={0.25} />
      {/* orelha (fora) */}
      <path d="M -250 -170 C -360 -170 -380 -40 -330 40 C -300 90 -330 160 -250 170 Z" fill={colors.pele} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      {/* canal com água */}
      <path d="M -330 -44 L 40 -44 L 40 44 L -330 44 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <path d="M -300 -10 q 20 -10 40 0 t 40 0 t 40 0 M -170 18 q 20 -10 40 0 t 40 0" fill="none" stroke={colors.branco} strokeWidth={6} strokeLinecap="round" opacity={0.7} />
      {/* ouvido médio (ar) e tuba fechada */}
      <ellipse cx={150} cy={0} rx={100} ry={110} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      <path d="M 190 96 Q 230 170 290 210" fill="none" stroke={colors.tinta} strokeWidth={14} strokeDasharray="14 14" strokeLinecap="round" />
      {/* tímpano */}
      <path d={`M 40 -86 Q ${40 + b * 2} 0 40 86`} fill="none" stroke={colors.coral} strokeWidth={16} strokeLinecap="round" />
      {/* seta de pressão no canal */}
      {seta > 0 ? (
        <g transform={`translate(${-60 + 20 * seta} 0) scale(${0.6 + 0.4 * seta})`}>
          <path d="M -150 -16 L -40 -16 L -40 -38 L 0 0 L -40 38 L -40 16 L -150 16 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={7} strokeLinejoin="round" />
        </g>
      ) : null}
      {/* rótulo */}
      {rotulo > 0 ? (
        <g opacity={Math.min(1, rotulo)} transform={`translate(0 ${(1 - rotulo) * 20})`}>
          <path d="M 40 -90 L 40 -170" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
          <rect x={-90} y={-262} width={260} height={84} rx={22} fill={colors.tinta} />
          <T x={40} y={-206} size={50} fill={colors.creme}>tímpano</T>
        </g>
      ) : null}
      {/* "ai": raio simples */}
      {dor > 0 ? (
        <g transform={`translate(110 -110) scale(${dor})`}>
          <path d={estrela(62)} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -8 -30 L 12 -4 L -4 0 L 10 30" fill="none" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- CilindroRegulador
// Cilindro cinza genérico (sem texto, sem marca), válvula, mangueira até o regulador na boca.
export const CilindroRegulador: React.FC<{ x: number; y: number; s: number; boca: [number, number]; fluxo: number }> = ({ x, y, s, boca, fluxo }) => {
  const ink = useInk();
  if (s <= 0) return null;
  const [bx, by] = boca;
  const vx = x;
  const vy = y - 170 * s;
  const mang = `M ${vx} ${vy - 30} C ${vx} ${vy - 130} ${bx - 40} ${by - 110} ${bx - 6} ${by}`;
  return (
    <g>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        <rect x={-62} y={-150} width={124} height={330} rx={56} fill={CINZA} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={-40} y={-120} width={20} height={250} rx={10} fill={colors.branco} opacity={0.55} />
        <rect x={-66} y={20} width={132} height={26} rx={8} fill={CINZA_ESC} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        <rect x={-22} y={-190} width={44} height={46} rx={10} fill={CINZA_ESC} stroke={colors.tinta} strokeWidth={ink * 0.7} />
      </g>
      <path d={mang} fill="none" stroke={colors.tinta} strokeWidth={26} strokeLinecap="round" />
      <path d={mang} fill="none" stroke={CINZA_ESC} strokeWidth={14} strokeLinecap="round" />
      <path d={mang} fill="none" stroke={colors.branco} strokeWidth={6} strokeDasharray="4 30" strokeDashoffset={-fluxo} strokeLinecap="round" opacity={fluxo > 0 ? 0.9 : 0} />
      <circle cx={bx} cy={by} r={30} fill={CINZA} stroke={colors.tinta} strokeWidth={ink * 0.7} />
      <rect x={bx - 12} y={by + 18} width={24} height={26} rx={6} fill={CINZA_ESC} stroke={colors.tinta} strokeWidth={ink * 0.5} />
    </g>
  );
};

// ---------------------------------------------------------------- bolhas, peixes, algas
const Bolhas: React.FC<{ x: number; y: number; t: number; altura?: number; cresce?: number; qtd?: number; s?: number }> = ({ x, y, t, altura = 420, cresce = 0, qtd = 5, s = 1 }) => {
  const ink = useInk();
  if (s <= 0) return null;
  return (
    <g opacity={Math.min(1, s)}>
      {Array.from({ length: qtd }, (_, i) => {
        const fase = (t / 46 + i / qtd) % 1;
        const r = (8 + (i % 3) * 5) * (1 + cresce * fase * 1.6);
        return (
          <circle
            key={i}
            cx={x + Math.sin(fase * 9 + i * 2) * 16 + (i % 2 ? 12 : -12)}
            cy={y - fase * altura}
            r={r}
            fill={colors.branco}
            fillOpacity={0.35}
            stroke={colors.creme}
            strokeWidth={ink * 0.35}
            opacity={1 - Math.max(0, fase - 0.8) * 5}
          />
        );
      })}
    </g>
  );
};
const Peixe: React.FC<{ x: number; y: number; s: number; cor: string; vira?: boolean }> = ({ x, y, s, cor, vira }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) scale(${vira ? -s : s} ${s})`}>
      <path d="M 50 0 L 86 -30 L 86 30 Z" fill={cor} stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={62} ry={36} fill={cor} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <circle cx={-30} cy={-8} r={7} fill={colors.tinta} />
    </g>
  );
};
const Alga: React.FC<{ x: number; y: number; h: number; t: number }> = ({ x, y, h, t }) => {
  const ink = useInk();
  const w = Math.sin((2 * Math.PI * t * 15) / 2100 + x) * 18;
  return <path d={`M ${x} ${y} C ${x + w} ${y - h / 3} ${x - w} ${y - (2 * h) / 3} ${x + w} ${y - h}`} fill="none" stroke={colors.folha} strokeWidth={22 + ink * 0.2} strokeLinecap="round" />;
};

// Prédio simples da escola (sem placa, sem logotipo)
const Escola: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const ink = useInk();
  const cols = 4;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={x - 22} y={y - 40} width={w + 44} height={52} rx={12} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
      {[0, 1].map((r) =>
        Array.from({ length: cols }, (_, c) => (
          <rect key={`${r}-${c}`} x={x + 50 + c * ((w - 100) / cols) + 6} y={y + 60 + r * 140} width={(w - 100) / cols - 30} height={86} rx={10} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.8} />
        )),
      )}
      <rect x={x + w / 2 - 60} y={y + h - 170} width={120} height={170} rx={10} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink * 0.8} />
    </g>
  );
};

// Faixas de água a partir da superfície (`sy` na tela); cada faixa um tom do tema
const FaixasAgua: React.FC<{ sy: number; faixa?: number; t: number; ceu?: string }> = ({ sy, faixa = 460, t, ceu = colors.creme }) => {
  const ink = useInk();
  return (
    <g>
      <SkyFill color={ceu} />
      {AGUA.map((c, i) => (
        <rect key={i} x={-200} y={sy + i * faixa} width={1480} height={i === AGUA.length - 1 ? 4000 : faixa + 2} fill={c} />
      ))}
      {/* reflexos chapados (linhas onduladas que correm devagar) */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const yy = sy + 120 + i * 230;
        // velocidade com volta inteira em 2.100 frames: o último quadro casa com o primeiro
        const dx = (((t * 2600) / 2100 + i * 170) % 1300) - 200;
        return <path key={i} d={`M ${dx} ${yy} q 30 -14 60 0 t 60 0`} fill="none" stroke={colors.branco} strokeWidth={6} strokeLinecap="round" opacity={0.35} />;
      })}
      <path d={`M -200 ${sy} ${Array.from({ length: 26 }, (_, i) => `q 30 ${i % 2 ? 10 : -10} 60 0`).join(" ")}`} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} />
    </g>
  );
};

// Nico pequeno no canto (cenas de painel), com um leve balanço para nunca ficar parado
const NicoInserto: React.FC<{ frame: number; expr: string; x?: number; y?: number; look?: [number, number] }> = ({ frame, expr, x = 150, y = 1150, look }) => (
  <NicoEm x={x} y={y + Math.sin(frame / 7) * 4} s={0.3} rot={Math.sin(frame / 11) * 3} pose="parado" expression={expr} look={look ?? [0.7, -0.3]} />
);

const nicoBalanco = (g: number) => Math.sin((2 * Math.PI * g * 14) / 2100) * 9;

// ================================================================ patio_submerso (gancho e fecho)
// O Nico fica no MESMO ponto da tela; o mundo rola. `desce` (0..1): 0 = boiando na superfície
// (quadro do loop), 1 = 10 m abaixo, com a escola ao fundo.
// Gancho: `mergulho` (cue), `mano`/`dobra` (manômetro), `peito`/`encolhe` (pulmão no balão).
// Fecho: `sobe`/`sobeAte` (subida lenta), `expande` (pulmão volta a encher), `superficie` (expressão final).
const SUB = { nico: { x: 600, y: 1160, s: 0.55 }, sup: 880, mundo: 1500 };
export const PatioSubmerso: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Params }> = ({ cam, frame, globalFrame: g, params }) => {
  const modo = n(params.modo, 1);
  const desce =
    modo === 1
      ? ramp(frame, n(params.mergulho), n(params.mergulho) + 26, suave)
      : 1 - ramp(frame, n(params.sobe), n(params.sobeAte), { ...clamp, easing: Easing.inOut(Easing.sin) });
  const off = desce * SUB.mundo;
  const sy = SUB.sup - off;
  const prof = desce * 10;
  // Nico
  const { x: nx, y: ny, s: ns } = SUB.nico;
  const bob = nicoBalanco(g);
  const expr =
    modo === 1
      ? on(frame, n(params.encolhe))
        ? "preocupacao"
        : on(frame, n(params.mergulho))
          ? "atento"
          : "surpresa"
      : on(frame, n(params.superficie))
        ? "surpresa"
        : on(frame, n(params.sobe))
          ? "atento"
          : "curiosidade";
  // balão do pulmão
  const pulmaoS = modo === 1 ? pop(frame, n(params.peito)) : on(frame, n(params.superficie) - 8) ? 1 - ramp(frame, n(params.superficie) - 8, n(params.superficie)) : pop(frame, n(params.pulmao));
  const pulmaoK =
    modo === 1 ? 1 - 0.29 * ramp(frame, n(params.encolhe), n(params.encolhe) + 24, suave) : 0.71 + 0.29 * ramp(frame, n(params.expande), n(params.expande) + 30, suave);
  const manoS = modo === 1 ? pop(frame, n(params.mano)) : 0;
  const atm = 1 + ramp(frame, n(params.dobra), n(params.dobra) + 14, { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const peixes = modo === 2 ? 1 - ramp(frame, n(params.sobe) + 40, n(params.sobe) + 70) : 0;
  const bolhasS = modo === 2 ? (on(frame, n(params.superficie)) ? 1 - ramp(frame, n(params.superficie), n(params.superficie) + 12) : 1) : desce > 0.05 ? 1 : 0;
  return (
    <>
      <Layer cam={cam} depth={1}>
        <FaixasAgua sy={sy} t={g} />
        <Cloud x={200} y={420 - off * 0.2} s={0.8} />
        <Cloud x={760} y={330 - off * 0.2} s={0.6} />
        {/* escola submersa, algas e peixes genéricos */}
        <g transform={`translate(0 ${2440 - off})`}>
          <rect x={-200} y={760} width={1480} height={600} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={14} />
          <Escola x={110} y={60} w={640} h={700} />
          {[60, 820, 900, 40, 740].map((x, i) => (
            <Alga key={i} x={x} y={770} h={160 + (i % 3) * 70} t={g} />
          ))}
          <rect x={-200} y={-200} width={1480} height={1600} fill={colors.ceuMeio} opacity={0.35} />
        </g>
        {peixes > 0 ? (
          <g opacity={peixes} transform={`translate(0 ${2440 - off})`}>
            <Peixe x={((g * 2.2) % 1500) - 200} y={-180} s={0.9} cor={colors.amarelo} vira />
            <Peixe x={1300 - ((g * 1.6 + 500) % 1500)} y={-20} s={0.7} cor={colors.coral} />
            <Peixe x={((g * 1.9 + 900) % 1500) - 200} y={260} s={0.6} cor={colors.turquesa} vira />
          </g>
        ) : null}
        <NicoEm x={nx} y={ny + bob} s={ns} pose="flutuando" expression={expr} />
        {/* água na frente do corpo, abaixo da linha d'água */}
        <rect x={-200} y={Math.max(sy, -400)} width={1480} height={3000} fill={colors.ceu} opacity={0.42} />
        <Bolhas x={nx + 150} y={ny - 640 * ns + bob} t={g} altura={520} cresce={modo === 2 ? 1 : 0} qtd={6} s={bolhasS} />
        {/* manômetro e pulmão (gancho) */}
        <Manometro x={250} y={560} r={118} atm={atm} s={manoS} leitura={on(frame, n(params.dobra)) ? "2 atm" : "1 atm"} />
        {pulmaoS > 0 ? (
          <g transform={`translate(250 960) scale(${pulmaoS})`}>
            <path d="M 100 -40 L 230 30 L 110 50 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
            <circle r={150} fill={colors.creme} stroke={colors.tinta} strokeWidth={12} />
            <BalaoPulmao x={0} y={20} s={0.6} k={pulmaoK} />
            {modo === 1 ? <SetasPressao x={0} y={20} r={106} s={ramp(frame, n(params.encolhe) - 4, n(params.encolhe) + 8)} tam={0.8} /> : null}
          </g>
        ) : null}
      </Layer>
      {modo === 2 ? <PlacaLinhas linhas={["INFORMAÇÃO, NÃO É CONSELHO MÉDICO"]} y={1225} s={janela(frame, n(params.aviso, 0), n(params.avisoAte))} size={40} /> : null}
      <ReguaProfundidade prof={prof} />
    </>
  );
};

// ================================================================ patio_escola (apresentação)
// Pátio seco; a água sobe em degraus: `um` (1 m), `dois` (2 m), `dez` (10 m, cobre tudo). Em `nada`
// o Nico nada para cima e o pátio rola para baixo. `lata`: a lata genérica boia na superfície.
const PE = { chao: 1180, nico: { x: 470, s: 0.55 }, niveis: [1180, 900, 560, -260] };
export const PatioEscola: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Params }> = ({ cam, frame, globalFrame: g, params }) => {
  const passos = [n(params.um), n(params.dois), n(params.dez)];
  let sy = PE.niveis[0];
  passos.forEach((at, i) => {
    sy += (PE.niveis[i + 1] - sy) * ramp(frame, at, at + 18, suave);
  });
  const nada = ramp(frame, n(params.nada), n(params.nada) + 40, suave);
  const rola = nada * 300;
  const boia = ramp(frame, n(params.dois), n(params.dois) + 20, suave);
  const ny = PE.chao - boia * 60 - nada * 110 + (on(frame, n(params.dois)) ? nicoBalanco(g) : 0);
  const pose = on(frame, n(params.dois)) ? "flutuando" : "apontando";
  const expr = on(frame, n(params.nada)) ? "atento" : on(frame, n(params.dois)) ? "preocupacao" : on(frame, n(params.agua)) ? "surpresa" : "neutro";
  const prof = interpolate(sy, [...PE.niveis].reverse(), [10, 2, 1, 0], clamp);
  const setaSup = pop(frame, n(params.seta));
  const lata = on(frame, n(params.um)) && sy > -60;
  return (
    <>
      <Layer cam={cam} depth={1}>
        <SkyFill color={colors.ceu} />
        <Cloud x={180} y={420 + rola * 0.4} s={0.7} />
        <Cloud x={720} y={520 + rola * 0.4} s={0.55} />
        <g transform={`translate(0 ${rola})`}>
          {[760, 830].map((x, i) => (
            <circle key={x} cx={x} cy={830 + i * 50} r={110 - i * 20} fill={colors.folha} stroke={colors.tinta} strokeWidth={14} />
          ))}
          <Escola x={110} y={640} w={600} h={540} />
          <rect x={-200} y={PE.chao} width={1480} height={1400} fill={colors.chao} stroke={colors.tinta} strokeWidth={14} />
          <path d={`M -200 ${PE.chao + 160} L 1280 ${PE.chao + 160}`} stroke={colors.chaoSombra} strokeWidth={12} />
        </g>
        <NicoEm x={PE.nico.x} y={ny} s={PE.nico.s} pose={pose} expression={expr} rot={nada * -6} look={on(frame, n(params.agua)) && !on(frame, n(params.nada)) ? [0.2, 0.7] : nada > 0 ? [0.2, -0.9] : undefined} />
        {/* água (translúcida, na frente de tudo abaixo da superfície) */}
        {sy < PE.chao ? (
          <g>
            <rect x={-200} y={sy} width={1480} height={3000} fill={colors.ceuMeio} opacity={0.55} />
            <path d={`M -200 ${sy} ${Array.from({ length: 26 }, (_, i) => `q 30 ${i % 2 ? 10 : -10} 60 0`).join(" ")}`} fill="none" stroke={colors.tinta} strokeWidth={10} />
          </g>
        ) : null}
        {lata ? <Lata x={210} y={sy + 40 + Math.sin(g / 9) * 6} s={0.42} rot={78 + Math.sin(g / 13) * 6} /> : null}
        <Bolhas x={PE.nico.x + 130} y={ny - 400} t={g} altura={380} qtd={5} s={on(frame, n(params.dois) + 10) ? 1 : 0} />
        {setaSup > 0 ? (
          <g transform={`translate(680 ${430 - 14 * Math.sin(frame / 5)}) scale(${setaSup})`}>
            <path d="M -26 60 L -26 0 L -60 0 L 0 -64 L 60 0 L 26 0 L 26 60 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
          </g>
        ) : null}
      </Layer>
      {setaSup > 0 ? (
        <g opacity={Math.min(1, setaSup)}>
          <rect x={532} y={276} width={296} height={68} rx={20} fill={colors.tinta} />
          <T x={680} y={326} size={44} fill={colors.creme}>SUPERFÍCIE</T>
        </g>
      ) : null}
      <ReguaProfundidade prof={prof} />
    </>
  );
};

// ================================================================ agua_azul (tubo e cilindro)
// modo 1 (tubo): Nico logo abaixo da superfície, tubo listrado até o ar; em `passa` desce para
// além de 1 m, em `peito` as setas apertam e em `nao` o fluxo de ar para (X no tubo).
// modo 2 (cilindro): Nico flutuando com cilindro; `cilindro`, `regulador`, `entrega` (ar na
// mangueira), `pressao` (setas iguais por fora e por dentro), `fundo`/`fundoAte` (desce até 40 m).
export const AguaAzul: React.FC<{ cam: Cam; frame: number; globalFrame: number; params: Params }> = ({ cam, frame, globalFrame: g, params }) => {
  const modo = n(params.modo, 1);
  const prof = profundidade(frame, params);
  if (modo === 1) {
    const desce = ramp(frame, n(params.passa), n(params.passa) + 30, suave);
    const SY = 520;
    const s = 0.45;
    const fx = 470;
    const fy = 1020 + desce * 120 + Math.sin(g / 10) * 5;
    const bx = fx + 55 * s;
    const by = fy - 675 * s;
    const topoX = bx + 120;
    const tubo = `M ${bx + 8} ${by} L ${bx + 60} ${by} Q ${topoX} ${by} ${topoX} ${by - 60} L ${topoX} ${SY - 90}`;
    const peito = ramp(frame, n(params.peito), n(params.peito) + 12);
    const para = ramp(frame, n(params.nao), n(params.nao) + 10);
    const expr = on(frame, n(params.peito)) ? "preocupacao" : on(frame, n(params.passa)) ? "atento" : "curiosidade";
    return (
      <>
        <Layer cam={cam} depth={1}>
          <FaixasAgua sy={SY} t={g} faixa={520} />
          <Cloud x={220} y={380} s={0.7} />
          <rect x={-200} y={1500} width={1480} height={600} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={14} />
          <NicoEm x={fx} y={fy} s={s} pose="parado" expression={expr} suor={on(frame, n(params.nao))} look={[0.5, -0.6]} />
          <TuboSnorkelGenerico d={tubo} fluxo={(frame * 3) % 400} para={para} topo={[topoX, SY - 90]} />
          <rect x={-200} y={SY} width={1480} height={3000} fill={colors.ceu} opacity={0.3} />
          <SetasPressao x={fx} y={fy - 400 * s} r={130} s={peito} n={2} giro={90} tam={0.9} />
          <Xis x={topoX} y={SY + 120} r={42} s={pop(frame, n(params.nao), true)} />
          <Bolhas x={bx + 10} y={by - 20} t={g} altura={200} qtd={3} s={on(frame, n(params.ar)) ? 1 : 0} />
        </Layer>
        <PlacaLinhas linhas={["NÃO É PARA TESTAR"]} y={1210} s={1} cor={colors.coral} tinta={colors.creme} size={40} />
        <ReguaProfundidade prof={prof} />
      </>
    );
  }
  // modo 2: cilindro
  const fundo = ramp(frame, n(params.fundo), n(params.fundoAte), suave);
  const SY = -300 - fundo * 1400;
  const s = 0.5;
  const cx = 500;
  const cy = 780 + Math.sin(g / 12) * 8;
  const rot = -8 + Math.sin(g / 17) * 2;
  const feetX = cx - Math.sin((rot * Math.PI) / 180) * 280;
  const feetY = cy + 280;
  const boca: [number, number] = [cx + 30, cy - 120];
  const cil = pop(frame, n(params.cilindro));
  const fluxo = on(frame, n(params.entrega)) ? (frame * 4) % 400 : 0;
  const pressao = ramp(frame, n(params.pressao), n(params.pressao) + 12);
  const expr = on(frame, n(params.fundo)) ? "surpresa" : "curiosidade";
  return (
    <>
      <Layer cam={cam} depth={1}>
        <FaixasAgua sy={SY} t={g} faixa={420} />
        <CilindroRegulador x={cx - 150} y={cy + 20} s={cil} boca={boca} fluxo={fluxo} />
        <NicoEm x={feetX} y={feetY} s={s} rot={rot} pose="flutuando" expression={expr} />
        {cil > 0 ? (
          <g>
            <circle cx={boca[0]} cy={boca[1]} r={30 * cil} fill={CINZA} stroke={colors.tinta} strokeWidth={10} />
            <rect x={boca[0] - 12} y={boca[1] + 18} width={24} height={26 * cil} rx={6} fill={CINZA_ESC} stroke={colors.tinta} strokeWidth={6} />
          </g>
        ) : null}
        <Bolhas x={boca[0] + 110} y={boca[1] - 30} t={g} altura={460} qtd={6} s={on(frame, n(params.regulador)) ? 1 : 0} />
        <SetasPressao x={cx} y={cy} r={250} s={pressao} n={4} giro={90} tam={0.8} />
        {pressao > 0 ? (
          <g transform={`translate(${cx} ${cy}) scale(${pressao})`}>
            {[0, 90, 180, 270].map((a) => (
              <g key={a} transform={`rotate(${a + 90}) translate(0 -60)`}>
                <path d="M -10 30 L 10 30 L 10 0 L 24 0 L 0 -28 L -24 0 L -10 0 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={5} strokeLinejoin="round" />
              </g>
            ))}
          </g>
        ) : null}
      </Layer>
      <PlacaLinhas linhas={["EXIGE CURSO E EQUIPAMENTO"]} y={1210} s={1} size={40} />
      <ReguaProfundidade prof={prof} />
    </>
  );
};

// ================================================================ painel_agua (regra, ouvido, pulmão)
// Reaproveita a grade do painel liso (ep08 v2). `painel` 1 regra, 2 ouvido, 3 pulmão.
const Regra: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const ink = useInk();
  const tubo = pop(frame, n(params.coluna));
  const X = 230;
  const W = 240;
  const Y0 = 420;
  const H = 190;
  const ar = pop(frame, n(params.ar));
  const agua = ramp(frame, n(params.agua), n(params.agua) + 14, { ...clamp, easing: Easing.out(Easing.back(1.3)) });
  const mais = pop(frame, n(params.mais), true);
  const brilho = on(frame, n(params.na)) && !on(frame, n(params.aos)) ? 1 : 0;
  const mergulha = ramp(frame, n(params.aos), n(params.aos) + 20, suave);
  const mano = pop(frame, n(params.mano));
  const atm = 1 + ramp(frame, n(params.duas), n(params.duas) + 14, { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  if (tubo <= 0) return null;
  return (
    <g>
      <g transform={`translate(${X + W / 2} ${Y0 + H}) scale(${tubo}) translate(${-(X + W / 2)} ${-(Y0 + H)})`}>
        <rect x={X - 16} y={Y0 - 16} width={W + 32} height={2 * H + 32} rx={26} fill={colors.branco} stroke={colors.tinta} strokeWidth={ink} />
        {/* bloco de ar (1 atm) */}
        {ar > 0 ? (
          <g transform={`translate(0 ${(1 - ar) * -40})`} opacity={Math.min(1, ar)}>
            <rect x={X} y={Y0} width={W} height={H} rx={14} fill={brilho ? colors.amarelo : colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
            <Cloud x={X + W / 2} y={Y0 + 64} s={0.42} />
            <T x={X + W / 2} y={Y0 + 160} size={48} fill={colors.tinta}>1 atm</T>
          </g>
        ) : null}
        {/* bloco de água (+1 atm a cada 10 m) */}
        {agua > 0 ? (
          <g transform={`translate(0 ${(1 - agua) * -260})`}>
            <rect x={X} y={Y0 + H} width={W} height={H} rx={14} fill={colors.ceuMeio} stroke={colors.tinta} strokeWidth={ink * 0.7} />
            <path d={`M ${X + 30} ${Y0 + H + 40} q 25 -12 50 0 t 50 0 t 50 0`} fill="none" stroke={colors.branco} strokeWidth={6} opacity={0.6} strokeLinecap="round" />
            {mais > 0 ? (
              <g transform={`translate(${X + W / 2} ${Y0 + H + 120}) scale(${mais})`}>
                <T x={0} y={0} size={52} fill={colors.creme}>+1 atm</T>
              </g>
            ) : null}
          </g>
        ) : null}
      </g>
      {/* chave "10 m" ao lado do bloco de água */}
      {agua > 0.5 ? (
        <g opacity={Math.min(1, (agua - 0.5) * 2)}>
          <path d={`M ${X - 40} ${Y0 + H + 6} L ${X - 56} ${Y0 + H + 6} L ${X - 56} ${Y0 + 2 * H - 6} L ${X - 40} ${Y0 + 2 * H - 6}`} fill="none" stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
        </g>
      ) : null}
      {agua > 0.5 ? (
        <g opacity={Math.min(1, (agua - 0.5) * 2)}>
          <rect x={X + 20} y={Y0 + 2 * H + 40} width={W - 40} height={72} rx={20} fill={colors.tinta} />
          <T x={X + W / 2} y={Y0 + 2 * H + 92} size={46} fill={colors.creme}>10 m</T>
        </g>
      ) : null}
      {/* bolinha do Nico descendo a coluna */}
      {on(frame, n(params.na)) ? (
        <g transform={`translate(${X + W + 70} ${Y0 + 30 + mergulha * (2 * H - 10)})`}>
          <circle r={26} fill={colors.pele} stroke={colors.tinta} strokeWidth={7} />
          <path d="M -26 -6 Q -24 -30 0 -30 Q 24 -30 26 -6 Q 10 -18 -26 -6 Z" fill={colors.cabelo} />
          <path d="M -46 0 L -34 -8 L -34 8 Z" fill={colors.tinta} />
        </g>
      ) : null}
      <Manometro x={690} y={640} r={130} atm={atm} s={mano} leitura={on(frame, n(params.duas)) ? "2 atm" : "1 atm"} />
    </g>
  );
};

const Ouvido: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const s = pop(frame, n(params.corte));
  const seta = ramp(frame, n(params.seta), n(params.seta) + 10) * (0.5 + 0.5 * ramp(frame, n(params.dois), n(params.dois) + 20));
  const empurra = ramp(frame, n(params.empurra), n(params.empurra) + 14, { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const rotulo = ramp(frame, n(params.rotulo), n(params.rotulo) + 10);
  const dor = on(frame, n(params.dor)) ? pop(frame, n(params.dor), true) * (1 + 0.06 * Math.sin(frame / 2)) : 0;
  return (
    <g transform="translate(535 700)">
      <CorteOuvido s={s * 0.85} seta={seta} empurra={empurra} rotulo={rotulo} dor={dor} />
    </g>
  );
};

// Contador do pulmão: "6 L" rola para "3 L" (só os dois valores aparecem, sem números intermediários)
const ContadorLitros: React.FC<{ x: number; y: number; k: number; s: number }> = ({ x, y, k, s }) => {
  if (s <= 0) return null;
  const id = `clip-litros-${Math.round(x)}`;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-96} y={-46} width={192} height={88} rx={22} fill={colors.tinta} />
      <clipPath id={id}>
        <rect x={-90} y={-40} width={180} height={76} rx={16} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        <g transform={`translate(0 ${-k * 80})`}>
          <T x={0} y={18} size={54} fill={colors.amarelo}>6 L</T>
          <T x={0} y={98} size={54} fill={colors.amarelo}>3 L</T>
        </g>
      </g>
    </g>
  );
};
const Pulmao: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const a = pop(frame, n(params.p1));
  const b = pop(frame, n(params.p2));
  const conta = ramp(frame, n(params.vira), n(params.tres), { ...clamp, easing: Easing.inOut(Easing.quad) });
  const kB = 1 - 0.29 * conta - 0.05 * ramp(frame, n(params.menos), n(params.menos) + 10) + 0.05 * ramp(frame, n(params.menos) + 30, n(params.menos) + 50);
  const setas = ramp(frame, n(params.setas), n(params.setas) + 12);
  const pulsa = setas > 0 ? 1 + 0.08 * Math.sin(frame / 3) : 1;
  const lA = pop(frame, n(params.p1) + 6);
  const lB = pop(frame, n(params.p2) + 6);
  return (
    <g>
      {lA > 0 ? (
        <g opacity={Math.min(1, lA)}>
          <rect x={212} y={430} width={296} height={68} rx={20} fill={colors.tinta} />
          <T x={360} y={480} size={44} fill={colors.creme}>SUPERFÍCIE</T>
        </g>
      ) : null}
      {lB > 0 ? (
        <g opacity={Math.min(1, lB)}>
          <rect x={585} y={430} width={170} height={68} rx={20} fill={colors.tinta} />
          <T x={670} y={480} size={44} fill={colors.creme}>10 m</T>
        </g>
      ) : null}
      <BalaoPulmao x={360} y={760} s={a * 0.8} />
      <BalaoPulmao x={670} y={760} s={b * 0.8} k={kB} />
      <SetasPressao x={670} y={770} r={110 * pulsa} s={setas} n={4} tam={0.75} />
      <ContadorLitros x={360} y={980} k={0} s={a} />
      <ContadorLitros x={670} y={980} k={conta} s={b} />
    </g>
  );
};

export const PainelAgua: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const modo = n(params.painel, 1);
  const prof = profundidade(frame, params);
  const expr: Record<number, string> = {
    1: on(frame, n(params.duas)) ? "surpresa" : on(frame, n(params.na)) ? "curiosidade" : "atento",
    2: on(frame, n(params.dor)) ? "medo" : on(frame, n(params.dois)) ? "preocupacao" : "atento",
    3: on(frame, n(params.setas)) ? "preocupacao" : on(frame, n(params.tres)) ? "surpresa" : "atento",
  };
  const rodape: Record<number, { linhas: string[]; de: number } | undefined> = {
    1: { linhas: ["FONTE: NOAA (PMEL)"], de: n(params.rodape, 0) },
    2: undefined,
    3: { linhas: ["PULMÃO CHEIO, SEGURANDO O AR"], de: n(params.rodape, 0) },
  };
  const rod = rodape[modo];
  return (
    <>
      <FundoPainel cam={cam} />
      <Layer cam={cam} depth={1}>
        {modo === 1 ? <Regra frame={frame} params={params} /> : null}
        {modo === 2 ? <Ouvido frame={frame} params={params} /> : null}
        {modo === 3 ? <Pulmao frame={frame} params={params} /> : null}
        <NicoInserto frame={frame} expr={expr[modo]} />
      </Layer>
      {rod ? <PlacaLinhas linhas={rod.linhas} y={1210} s={pop(frame, rod.de)} size={40} /> : null}
      <ReguaProfundidade prof={prof} />
    </>
  );
};
