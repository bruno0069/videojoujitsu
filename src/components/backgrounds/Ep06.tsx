import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { colors, fonts, loopPhase, night as nightColors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { InfoLabel } from "../elements/Props";
import { Sun } from "../elements/Sun";
import { useGlobalFrame, useLoopFrames } from "../GlobalFrame";
import { useInk } from "../Ink";
import { MilkyWay, SkyFill, Stars } from "../Sky";
import { SeloNico } from "./Ep04";

// Cenários do ep06 (episódio 5: E se a Lua fosse duas vezes maior?). Mesma paleta e traço dos
// episódios anteriores. A orla do Rio é genérica (morro de topo arredondado, calçadão de ondas,
// mar), sem reproduzir mapa nem foto. `frame` é o frame da cena; parâmetros vêm de `fundo`.

type Params = Record<string, number | number[]>;
const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;
const pop = (frame: number, at: number, bouncy = false) =>
  Number.isFinite(at) && frame >= at
    ? spring({ frame: frame - at, fps: 30, config: bouncy ? { damping: 7, mass: 0.6, stiffness: 190 } : { damping: 11, mass: 0.6, stiffness: 160 } })
    : 0;

// Disco da Lua (chapado, crateras de uma cor só)
const LuaDisco: React.FC<{ x: number; y: number; r: number; cor?: string }> = ({ x, y, r, cor = colors.creme }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={cor} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={-r * 0.32} cy={-r * 0.22} r={r * 0.2} fill={sombra(cor)} />
      <circle cx={r * 0.34} cy={r * 0.24} r={r * 0.15} fill={sombra(cor)} />
      <circle cx={-r * 0.06} cy={r * 0.46} r={r * 0.1} fill={sombra(cor)} />
    </g>
  );
};

// ---------------------------------------------------------------- orla_rio_fim_tarde / mare_orla
// Vista lateral da orla: céu de fim de tarde em faixas, Lua pequena, morro arredondado e prédios
// ao fundo (parallax), mar, areia e calçadão de ondas.
//   `onda`: uma ondinha sobe pela areia e recua (gancho)
//   `mare`/`mareAte`: o mar avança sobre a areia e o calçadão (mare_orla); `joelho`: a água chega
//   aos joelhos do Nico (a parte da frente da água fica em OrlaFrente, por cima dos personagens)
//   `barras`/`barraOito`: régua da FORÇA DA MARÉ, hoje 1× e Lua maior 8× (passa do topo)
export const ORLA = { horizonte: 1090, praia: 1290, calcadao: 1360, pes: 1560, joelho: 1420 };
export const LUA_ORLA = { x: 770, y: 360, r: 54 };

const frenteMar = (frame: number, params: Params) =>
  interpolate(frame, [n(params.mare), n(params.mareAte, n(params.mare) + 120)], [ORLA.praia, 1990], { ...clamp, easing: Easing.inOut(Easing.quad) });

export const OrlaRio: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const g = useGlobalFrame();
  const loopFrames = useLoopFrames();
  const o = ORLA;
  // ondas do mar no relógio do episódio (o loop casa)
  const fase = loopPhase(g, 14, loopFrames) * 2 * Math.PI;
  // ondinha do gancho: a linha da água sobe pela areia e volta
  const onda = n(params.onda);
  const ondinha = Number.isFinite(onda) ? Math.sin(Math.PI * ramp(frame, onda, onda + 36)) : 0;
  const temMare = Number.isFinite(n(params.mare));
  const frente = temMare ? frenteMar(frame, params) : o.praia + ondinha * 95;
  const agua = sombra(colors.ceuMeio);
  return (
    <>
      <Layer cam={cam} depth={0.08}>
        <SkyFill color={colors.noite} />
        <rect x={-1500} y={240} width={4080} height={300} fill={colors.ceuMeio} />
        <rect x={-1500} y={540} width={4080} height={280} fill={colors.coralClaro} />
        <rect x={-1500} y={820} width={4080} height={1600} fill={colors.muro} />
        <Sun x={160} y={1010} r={70} />
      </Layer>
      <Layer cam={cam} depth={0.12}>
        <LuaDisco x={LUA_ORLA.x} y={LUA_ORLA.y} r={LUA_ORLA.r} />
      </Layer>
      <Layer cam={cam} depth={0.35}>
        {/* morro de topo arredondado e um morrinho ao lado (silhuetas genéricas) */}
        <path d="M -700 1110 L -520 700 Q -380 430 -180 470 Q 40 520 120 760 L 220 1110 Z" fill={nightColors.predio} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <path d="M 120 1110 Q 180 900 320 880 Q 450 880 500 1000 L 540 1110 Z" fill={sombra(nightColors.predio)} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      </Layer>
      <Layer cam={cam} depth={0.55}>
        {/* prédios da orla, em silhueta */}
        {[620, 760, 880, 1010, 1150, 1290, 1420, 1560, 1700].map((x, i) => {
          const h = [210, 300, 250, 340, 220, 290, 260, 320, 240][i];
          return <rect key={i} x={x} y={o.horizonte - h} width={120} height={h + 30} fill={sombra(colors.noite)} stroke={colors.tinta} strokeWidth={ink * 0.8} />;
        })}
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* mar até a linha da praia (ou até onde a maré chegou) */}
        <rect x={-3000} y={o.horizonte} width={7200} height={o.praia - o.horizonte + 10} fill={agua} />
        {[0, 1, 2, 3].map((i) => {
          const y = o.horizonte + 40 + i * 48;
          const dx = Math.sin(fase + i) * 40;
          return (
            <path key={i} d={`M ${-1200 + dx} ${y} ${Array.from({ length: 30 }, (_, k) => `q 50 -16 100 0`).join(" ")}`} transform={`translate(${(i % 2) * 50} 0)`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.5} opacity={0.7} />
          );
        })}
        {/* areia e calçadão de faixas onduladas */}
        <rect x={-3000} y={o.praia} width={7200} height={o.calcadao - o.praia} fill={colors.chao} />
        <rect x={-3000} y={o.calcadao} width={7200} height={2200} fill={colors.creme} />
        <rect x={-3000} y={o.calcadao} width={7200} height={16} fill={colors.tinta} />
        {Array.from({ length: 9 }, (_, i) => {
          const y = o.calcadao + 70 + i * 120;
          return <path key={i} d={`M -2000 ${y} ${Array.from({ length: 40 }, () => `q 60 -50 120 0`).join(" ")}`} fill="none" stroke={colors.noite} strokeWidth={ink * 1.6} />;
        })}
        {/* água avançando sobre a areia e o calçadão */}
        {frente > o.praia + 1 ? (
          <g>
            <path d={`M -3000 ${o.praia} L 4200 ${o.praia} L 4200 ${frente} ${Array.from({ length: 36 }, (_, k) => `L ${4200 - (k + 1) * 200} ${frente + (k % 2 ? 14 : -14) * Math.sin(fase + k)}`).join(" ")} L -3000 ${frente} Z`} fill={agua} stroke={colors.tinta} strokeWidth={ink * 0.6} />
            <path d={`M -3000 ${frente - 20} ${Array.from({ length: 36 }, (_, k) => `L ${-3000 + (k + 1) * 200} ${frente - 20 + 12 * Math.sin(fase * 2 + k)}`).join(" ")}`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.6} />
          </g>
        ) : null}
      </Layer>
      <ReguaMare frame={frame} de={n(params.barras)} oito={n(params.barraOito)} ate={n(params.barrasAte)} />
    </>
  );
};

// Parte da água que fica NA FRENTE dos personagens (cobre as pernas do Nico até o joelho)
export const OrlaFrente: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const g = useGlobalFrame();
  const loopFrames = useLoopFrames();
  if (!Number.isFinite(n(params.mare))) return null;
  const frente = frenteMar(frame, params);
  if (frente < ORLA.pes) return null;
  // quando a frente passa pelos pés, o nível sobe até o joelho
  const passa = n(params.mare) + ((ORLA.pes - ORLA.praia) / (1990 - ORLA.praia)) * (n(params.mareAte) - n(params.mare));
  const topo = interpolate(frame, [passa, n(params.joelho, passa + 40)], [ORLA.pes + 10, ORLA.joelho], { ...clamp, easing: Easing.out(Easing.quad) });
  const fase = loopPhase(g, 14, loopFrames) * 4 * Math.PI;
  const crista = Array.from({ length: 30 }, (_, k) => `L ${-1500 + (k + 1) * 140} ${topo + 16 * Math.sin(fase + k * 1.3)}`).join(" ");
  return (
    <Layer cam={cam} depth={1}>
      <path d={`M -1500 ${topo} ${crista} L 2700 2600 L -1500 2600 Z`} fill={sombra(colors.ceuMeio)} stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      <path d={`M -1500 ${topo + 40} ${Array.from({ length: 30 }, (_, k) => `L ${-1500 + (k + 1) * 140} ${topo + 40 + 10 * Math.sin(fase * 1.3 + k)}`).join(" ")}`} fill="none" stroke={colors.creme} strokeWidth={ink * 0.5} />
    </Layer>
  );
};

// Régua da força da maré (tela): barra "hoje" 1× e barra "Lua maior" 8×, que passa do topo
const ReguaMare: React.FC<{ frame: number; de: number; oito: number; ate: number }> = ({ frame, de, oito, ate }) => {
  const ink = useInk();
  if (!Number.isFinite(de) || frame < de || frame >= ate) return null;
  const s = pop(frame, de) * (1 - ramp(frame, ate - 6, ate));
  const base = 960;
  const unidade = 52;
  const topoRegua = base - 380; // a régua só vai até ~7×: o 8× passa do limite
  const h1 = unidade * pop(frame, de + 6);
  const k8 = Number.isFinite(oito) ? spring({ frame: frame - oito, fps: 30, config: { damping: 14, mass: 0.8, stiffness: 90 } }) * (frame >= oito ? 1 : 0) : 0;
  const h8 = unidade * 8 * k8;
  return (
    <g transform={`translate(860 ${base}) scale(${s}) translate(-860 ${-base})`}>
      <rect x={680} y={topoRegua - 40} width={360} height={base - topoRegua + 130} rx={24} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M 700 ${topoRegua} L 1020 ${topoRegua}`} stroke={colors.coral} strokeWidth={ink * 0.6} strokeDasharray={`${ink} ${ink * 0.7}`} />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M 700 ${base - i * unidade} L 724 ${base - i * unidade}`} stroke={colors.tinta} strokeWidth={ink * 0.4} />
      ))}
      <rect x={750} y={base - h1} width={90} height={h1} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.8} />
      {h8 > 1 ? <rect x={880} y={base - h8} width={110} height={h8} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.8} /> : null}
      {h8 > (base - topoRegua) ? (
        <path d={`M 935 ${base - h8 - 30} l -26 30 l 52 0 z`} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinejoin="round" />
      ) : null}
      <text x={795} y={base + 52} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={40} fill={colors.tinta}>hoje 1×</text>
      <text x={935} y={base + 52} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={34} fill={colors.tinta} opacity={k8 > 0.05 ? 1 : 0}>Lua maior 8×</text>
    </g>
  );
};

// ---------------------------------------------------------------- ceu_lua_grande
// O céu do fim de tarde visto de baixo. A Lua dobra de largura NO MESMO LUGAR (o centro não sai
// do lugar e a linha da distância não muda): o contorno tracejado da Lua antiga fica dentro.
//   `cresce`: mola de r para 2r; `lugar`: mira no centro + "mesmo lugar"; `distancia`: linha
//   tracejada até o horizonte + "mesma distância"; `angulo`: as duas linhas do olho do Nico até as
//   bordas da Lua (abrem junto com o crescimento)
export const LUA_CEU = { x: 770, y: 560, r: 105 };
export const OLHO_NICO = { x: 372, y: 1010 };
export const CeuLuaGrande: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const L = LUA_CEU;
  const k = Number.isFinite(n(params.cresce)) && frame >= n(params.cresce) ? spring({ frame: frame - n(params.cresce), fps: 30, config: { damping: 9, mass: 0.9, stiffness: 90 } }) : 0;
  const r = L.r * (1 + k);
  const lugar = pop(frame, n(params.lugar)) * (1 - ramp(frame, n(params.lugarAte) - 6, n(params.lugarAte)));
  const dist = pop(frame, n(params.distancia));
  const ang = ramp(frame, n(params.angulo), n(params.angulo) + 12);
  // tangentes do olho até o disco atual
  const tang = (rr: number) => {
    const dx = L.x - OLHO_NICO.x;
    const dy = L.y - OLHO_NICO.y;
    const d = Math.hypot(dx, dy);
    const a0 = Math.atan2(dy, dx);
    const da = Math.asin(Math.min(0.99, rr / d));
    return [a0 - da, a0 + da].map((a) => ({ x: OLHO_NICO.x + Math.cos(a) * d * 1.05, y: OLHO_NICO.y + Math.sin(a) * d * 1.05 }));
  };
  const t = tang(r);
  return (
    <>
      <Layer cam={cam} depth={0.08}>
        <SkyFill color={colors.noite} />
        <rect x={-1500} y={520} width={4080} height={360} fill={colors.ceuMeio} />
        <rect x={-1500} y={880} width={4080} height={300} fill={colors.coralClaro} />
        <rect x={-1500} y={1180} width={4080} height={1400} fill={colors.muro} />
        <Stars frame={frame} maxY={500} opacity={0.6} />
      </Layer>
      <Layer cam={cam} depth={0.5}>
        {[-300, -120, 60, 240, 420, 600, 780, 960, 1140, 1320].map((x, i) => {
          const h = [180, 260, 210, 300, 190, 280, 230, 310, 200, 260][i];
          return <rect key={i} x={x} y={1260 - h} width={150} height={h + 400} fill={sombra(colors.noite)} stroke={colors.tinta} strokeWidth={ink * 0.8} />;
        })}
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-2000} y={1250} width={5000} height={2000} fill={colors.creme} />
        <rect x={-2000} y={1250} width={5000} height={16} fill={colors.tinta} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M -1500 ${1330 + i * 110} ${Array.from({ length: 36 }, () => `q 60 -46 120 0`).join(" ")}`} fill="none" stroke={colors.noite} strokeWidth={ink * 1.6} />
        ))}
        {/* linhas do ângulo: do olho do Nico até as bordas da Lua */}
        {ang > 0 ? (
          <g opacity={ang} stroke={colors.amarelo} strokeWidth={ink * 0.7} strokeLinecap="round">
            <path d={`M ${OLHO_NICO.x} ${OLHO_NICO.y} L ${t[0].x} ${t[0].y}`} />
            <path d={`M ${OLHO_NICO.x} ${OLHO_NICO.y} L ${t[1].x} ${t[1].y}`} />
          </g>
        ) : null}
        {/* mesma distância: linha tracejada que não muda */}
        {dist > 0.01 ? (
          <g opacity={Math.min(1, dist)}>
            <path d={`M ${L.x} ${L.y} L ${L.x} 1240`} stroke={colors.creme} strokeWidth={ink * 0.7} strokeDasharray={`${ink * 1.6} ${ink * 1.2}`} />
            <InfoLabel x={L.x + 40} y={1080} text="mesma distância" fontSize={50} s={dist} />
          </g>
        ) : null}
        <LuaDisco x={L.x} y={L.y} r={r} />
        {k > 0.02 ? <circle cx={L.x} cy={L.y} r={L.r} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} strokeDasharray={`${ink * 1.4} ${ink * 1.1}`} /> : null}
        {lugar > 0.01 ? (
          <g transform={`translate(${L.x} ${L.y}) scale(${lugar})`} stroke={colors.coral} strokeWidth={ink * 0.6} strokeLinecap="round">
            <path d="M -40 0 L -14 0 M 14 0 L 40 0 M 0 -40 L 0 -14 M 0 14 L 0 40" />
          </g>
        ) : null}
        {lugar > 0.01 ? <InfoLabel x={Math.max(170, L.x - r - 150)} y={L.y + r + 50} text="mesmo lugar" fontSize={50} s={lugar} /> : null}
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- comparacao_esferas
// Lua de hoje e a Lua com o dobro da largura (réguas de largura: 1 trecho e 2 trechos iguais).
// `abre`: a Lua grande vira um contorno; `oito`: as oito luas pequenas entram uma a uma numa
// pilha 2×2×2 (camada de trás e camada da frente = volume); `pesa`: a Lua grande afunda um pouco.
// Simplificação visual: oito esferas de metade da largura NÃO cabem de verdade numa esfera do
// dobro (o volume é o mesmo, o encaixe não); aqui elas aparecem um pouco menores, por dentro.
export const ESFERAS = { pequena: { x: 210, y: 640, r: 105 }, grande: { x: 690, y: 740, r: 210 } };
export const ComparacaoEsferas: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const { pequena: P, grande: G } = ESFERAS;
  const abre = ramp(frame, n(params.abre), n(params.abre) + 14);
  const oito = n(params.oito);
  const passo = n(params.passo, 7);
  const peso = pop(frame, n(params.pesa), true);
  const afunda = Number.isFinite(n(params.pesa)) && frame >= n(params.pesa) ? 26 * Math.min(1, peso) : 0;
  const larg = pop(frame, n(params.largura));
  // pilha 2×2×2: camada de trás deslocada para cima e para a direita
  const rr = 70;
  const off = 70;
  const sh = 30;
  const pos = [
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, j]) => ({ x: i * off + sh, y: j * off - sh, tras: true })),
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([i, j]) => ({ x: i * off - sh * 0.4, y: j * off + sh * 0.4, tras: false })),
  ];
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <LuaDisco x={P.x} y={P.y} r={P.r} />
        <InfoLabel x={P.x} y={P.y - P.r - 70} text="hoje" fontSize={52} />
        <g transform={`translate(0 ${afunda})`}>
          {/* a Lua grande: disco que se abre em contorno */}
          <g opacity={1 - abre}>
            <LuaDisco x={G.x} y={G.y} r={G.r} />
          </g>
          {abre > 0 ? <circle cx={G.x} cy={G.y} r={G.r} fill={sombra(colors.noite)} stroke={colors.creme} strokeWidth={ink * 0.8} strokeDasharray={`${ink * 1.6} ${ink * 1.1}`} opacity={abre} /> : null}
          {Number.isFinite(oito)
            ? pos.map((p, i) => {
                const at = oito + i * passo;
                if (frame < at) return null;
                const k = spring({ frame: frame - at, fps: 30, config: { damping: 10, mass: 0.5, stiffness: 180 } });
                return (
                  <g key={i} transform={`translate(0 ${(1 - k) * -260})`} opacity={Math.min(1, k * 2)}>
                    <LuaDisco x={G.x + p.x} y={G.y + p.y} r={rr} cor={p.tras ? sombra(colors.creme) : colors.creme} />
                  </g>
                );
              })
            : null}
        </g>
        {/* réguas de largura: 1 trecho e 2 trechos do mesmo tamanho */}
        {larg > 0.01 ? (
          <g opacity={Math.min(1, larg)} stroke={colors.amarelo} strokeWidth={ink * 0.8} strokeLinecap="round">
            <path d={`M ${P.x - P.r} ${P.y + P.r + 60} L ${P.x + P.r} ${P.y + P.r + 60} M ${P.x - P.r} ${P.y + P.r + 40} L ${P.x - P.r} ${P.y + P.r + 80} M ${P.x + P.r} ${P.y + P.r + 40} L ${P.x + P.r} ${P.y + P.r + 80}`} />
            <path d={`M ${G.x - G.r} ${G.y + G.r + 60 + afunda} L ${G.x + G.r} ${G.y + G.r + 60 + afunda} M ${G.x - G.r} ${G.y + G.r + 40 + afunda} L ${G.x - G.r} ${G.y + G.r + 80 + afunda} M ${G.x} ${G.y + G.r + 40 + afunda} L ${G.x} ${G.y + G.r + 80 + afunda} M ${G.x + G.r} ${G.y + G.r + 40 + afunda} L ${G.x + G.r} ${G.y + G.r + 80 + afunda}`} />
          </g>
        ) : null}
      </Layer>
      <SeloNico frame={frame} de={n(params.selo)} ate={n(params.seloAte)} />
    </>
  );
};

// ---------------------------------------------------------------- ceu_eclipse
// Eclipse chapado. "HOJE": a Lua menor que o disco do Sol passa na frente e sobra o anel de fogo.
// `troca` (whoosh): "LUA 2×": a Lua maior cobre o Sol inteiro; em volta, a coroa (pétalas
// chapadas), sem anel. `anel`: quadrinho com o anel de hoje riscado.
export const SOL_ECLIPSE = { x: 540, y: 800, r: 190 };
export const CeuEclipse: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const S = SOL_ECLIPSE;
  const troca = n(params.troca);
  const dois = Number.isFinite(troca) && frame >= troca;
  const passa = ramp(frame, n(params.passa, 0), n(params.passa, 0) + 50, { ...clamp, easing: Easing.out(Easing.cubic) });
  const entra2 = ramp(frame, troca, troca + 16, { ...clamp, easing: Easing.out(Easing.cubic) });
  const coroa = pop(frame, troca + 12);
  const luaR = dois ? 232 : 165;
  const luaX = dois ? interpolate(entra2, [0, 1], [1300, S.x]) : interpolate(passa, [0, 1], [1260, S.x]);
  const escuro = dois ? 1 : passa;
  const anel = pop(frame, n(params.anel));
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={escuro > 0.6 ? colors.noiteEscura : colors.noite} />
        <Stars frame={frame} opacity={escuro} />
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* coroa: pétalas chapadas em volta da Lua grande */}
        {dois && coroa > 0.01
          ? Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * 360;
              const len = (i % 2 ? 90 : 140) * coroa;
              return (
                <path key={i} transform={`translate(${S.x} ${S.y}) rotate(${a})`} d={`M -26 ${-luaR + 8} Q 0 ${-luaR - len * 1.2} 26 ${-luaR + 8} Z`} fill={i % 2 ? colors.creme : colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinejoin="round" />
              );
            })
          : null}
        {!dois ? <circle cx={S.x} cy={S.y} r={S.r} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} /> : null}
        {!dois ? <circle cx={S.x} cy={S.y} r={S.r + 22} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.6} opacity={0.5} /> : null}
        <circle cx={luaX} cy={S.y} r={luaR} fill={colors.tinta} stroke={colors.tinta} strokeWidth={ink} />
        <circle cx={luaX - luaR * 0.3} cy={S.y - luaR * 0.25} r={luaR * 0.16} fill={nightColors.ceuBaixo} />
        <InfoLabel x={S.x} y={S.y - 380} text={dois ? "LUA 2×" : "HOJE"} />
        {!dois && passa > 0.95 ? <InfoLabel x={S.x} y={S.y + S.r + 110} text="anel de fogo" fontSize={52} s={pop(frame, n(params.passa, 0) + 50)} /> : null}
        {dois && coroa > 0.5 ? <InfoLabel x={S.x} y={S.y + 340} text="coroa" fontSize={52} s={coroa} /> : null}
      </Layer>
      {/* quadrinho: o anel de hoje, riscado */}
      {anel > 0.01 ? (
        <g transform={`translate(850 400) scale(${anel})`}>
          <rect x={-150} y={-150} width={300} height={300} rx={28} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
          <circle r={80} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          <circle r={68} fill={colors.tinta} />
          <path d="M -110 -110 L 110 110 M 110 -110 L -110 110" stroke={colors.coral} strokeWidth={ink * 1.6} strokeLinecap="round" />
        </g>
      ) : null}
      <SeloNico frame={frame} de={n(params.selo)} ate={n(params.seloAte)} />
    </>
  );
};

// ---------------------------------------------------------------- diagrama_baricentro
// Terra e Lua girando em volta do centro de massa (ponto amarelo que pisca). Sem escala numérica.
// "HOJE": o ponto fica DENTRO da Terra (a Terra só balança um pouco). "LUA 2×": a Lua maior puxa
// o ponto para FORA da Terra, e a Terra faz uma pequena órbita em volta dele.
// `dois`: troca para LUA 2×; `lado`: os dois quadros empilhados (HOJE em cima, LUA 2× embaixo).
// Mesmas peças do diagrama_espaco (céu noite, Via Láctea, estrelas, globo).
type Quadro = { hoje: boolean; cx: number; cy: number; s: number };
const TERRA_R = 150;
const LUA_DIST = 400;
const QuadroBaricentro: React.FC<{ q: Quadro; frame: number }> = ({ q, frame }) => {
  const ink = useInk();
  // distância do centro da Terra ao ponto: dentro (0,7 do raio) hoje; fora (1,4 do raio) com a Lua 2×
  const dTerra = q.hoje ? TERRA_R * 0.7 : TERRA_R * 1.4;
  const luaR = q.hoje ? 42 : 84;
  const a = -frame * 0.03 + 0.6;
  const terra = { x: q.cx - Math.cos(a) * dTerra, y: q.cy - Math.sin(a) * dTerra };
  const lua = { x: q.cx + Math.cos(a) * LUA_DIST, y: q.cy + Math.sin(a) * LUA_DIST };
  const pisca = 0.55 + 0.45 * Math.abs(Math.sin(frame / 9));
  return (
    <g transform={`translate(${q.cx} ${q.cy}) scale(${q.s}) translate(${-q.cx} ${-q.cy})`}>
      <circle cx={q.cx} cy={q.cy} r={LUA_DIST} fill="none" stroke={colors.creme} strokeWidth={ink * 0.5} strokeDasharray={`${ink * 1.6} ${ink * 1.6}`} opacity={0.6} />
      <circle cx={q.cx} cy={q.cy} r={dTerra} fill="none" stroke={colors.ceu} strokeWidth={ink * 0.5} strokeDasharray={`${ink * 1.2} ${ink * 1.2}`} opacity={0.8} />
      <Globe x={terra.x} y={terra.y} r={TERRA_R} lon={-40 - frame * 0.8} />
      <LuaDisco x={lua.x} y={lua.y} r={luaR} />
      {/* o ponto (centro de massa) */}
      <circle cx={q.cx} cy={q.cy} r={26 * pisca} fill="none" stroke={colors.amarelo} strokeWidth={ink * 0.6} />
      <circle cx={q.cx} cy={q.cy} r={11} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.4} />
      <InfoLabel x={q.cx} y={q.cy - LUA_DIST - 70} text={q.hoje ? "HOJE" : "LUA 2×"} />
    </g>
  );
};
export const DiagramaBaricentro: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const dois = n(params.dois);
  const lado = n(params.lado);
  const emLado = Number.isFinite(lado) && frame >= lado;
  const t = ramp(frame, lado, lado + 14, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        {emLado ? (
          <>
            <QuadroBaricentro q={{ hoje: true, cx: 600, cy: interpolate(t, [0, 1], [-400, 560]), s: 0.5 }} frame={frame} />
            <QuadroBaricentro q={{ hoje: false, cx: 600, cy: interpolate(t, [0, 1], [760, 1060]), s: interpolate(t, [0, 1], [0.8, 0.5]) }} frame={frame} />
          </>
        ) : (
          <QuadroBaricentro q={{ hoje: !(Number.isFinite(dois) && frame >= dois), cx: 620, cy: 760, s: 0.8 }} frame={frame} />
        )}
      </Layer>
      <SeloNico frame={frame} de={n(params.selo)} ate={n(params.seloAte)} />
    </>
  );
};
