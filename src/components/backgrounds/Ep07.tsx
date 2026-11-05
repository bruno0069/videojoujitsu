import React from "react";
import { Easing, interpolate, interpolateColors, spring } from "remotion";
import { colors, fonts, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { InkScale, useInk } from "../Ink";
import { Nico } from "../Nico";
import { SkyFill } from "../Sky";

// Cenários do ep07 (episódio 6: E se você pudesse cair até o centro da Terra?). Mesma paleta e
// traço dos episódios anteriores: cores chapadas, contorno grosso, sem degradê, desfoque ou filtro
// (a velocidade aparece em linhas de velocidade, o calor em troca de cor chapada).
// O Nico é desenhado aqui dentro (cair, flutuar de cabeça para baixo, virar miojo), por isso as
// cenas do ep07 não têm personagens no roteiro. `frame` é o frame da cena; os parâmetros vêm de
// `fundo` na direção (cues já convertidos em frames).

type Params = Record<string, number | number[]>;
export const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;
export const pop = (frame: number, at: number, bouncy = false) =>
  Number.isFinite(at) && frame >= at
    ? spring({ frame: frame - at, fps: 30, config: bouncy ? { damping: 7, mass: 0.6, stiffness: 190 } : { damping: 11, mass: 0.6, stiffness: 160 } })
    : 0;
// entra com mola em `de` e sai encolhendo em `ate`
export const janela = (frame: number, de: number, ate = Infinity, bouncy = false) =>
  frame < de || frame >= ate ? 0 : pop(frame, de, bouncy) * (Number.isFinite(ate) ? 1 - ramp(frame, ate - 6, ate) : 1);
export const on = (frame: number, at: number) => Number.isFinite(at) && frame >= at;

// Texto chapado com contorno (ordem de pintura: contorno por baixo)
export const T: React.FC<{
  x: number;
  y: number;
  size: number;
  fill?: string;
  stroke?: string;
  sw?: number;
  anchor?: "start" | "middle" | "end";
  children: React.ReactNode;
}> = ({ x, y, size, fill = colors.creme, stroke, sw = 10, anchor = "middle", children }) => (
  <text
    x={x}
    y={y}
    textAnchor={anchor}
    fontFamily={fonts.main}
    fontWeight={fonts.weight}
    fontSize={size}
    fill={fill}
    stroke={stroke}
    strokeWidth={stroke ? sw : 0}
    strokeLinejoin="round"
    paintOrder="stroke"
  >
    {children}
  </text>
);

// Cartão de tinta com filete creme (mesmo desenho dos rótulos dos episódios anteriores)
export const Cartao: React.FC<{ x: number; y: number; w: number; h: number; s: number; rot?: number; cor?: string; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  s,
  rot = 0,
  cor = colors.tinta,
  children,
}) => {
  if (s <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2 + 10} width={w} height={h} rx={30} fill={colors.tinta} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={30} fill={cor} stroke={colors.tinta} strokeWidth={10} />
      <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={20} fill="none" stroke={colors.creme} strokeWidth={4} />
      {children}
    </g>
  );
};

// Nico com os pés em (x, y) (ou o centro do corpo, com `centro`), escala s e rotação
type NicoProps = {
  x: number;
  y: number;
  s: number;
  rot?: number;
  centro?: boolean;
  pose: string;
  fromPose?: string;
  poseT?: number;
  expression: string;
  look?: [number, number];
  oculos?: boolean;
  suor?: boolean;
  espelhar?: boolean;
};
export const NicoEm: React.FC<NicoProps> = ({ x, y, s, rot = 0, centro, espelhar, ...p }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${espelhar ? -s : s} ${s})${centro ? " translate(0 560)" : ""}`}>
    <InkScale scale={s}>
      <Nico {...p} />
    </InkScale>
  </g>
);

// Estrela de 5 pontas (avaliação, conquista)
export const estrela = (r: number) =>
  Array.from({ length: 10 }, (_, k) => {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.45 : r;
    return `${k ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)}`;
  }).join(" ") + " Z";

// X vermelho (coral) de "não"
export const Xis: React.FC<{ x: number; y: number; r: number; s: number }> = ({ x, y, r, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
      <path d={`M ${-r * 0.42} ${-r * 0.42} L ${r * 0.42} ${r * 0.42} M ${r * 0.42} ${-r * 0.42} L ${-r * 0.42} ${r * 0.42}`} stroke={colors.creme} strokeWidth={r * 0.28} strokeLinecap="round" />
    </g>
  );

// ---------------------------------------------------------------- camadas da Terra
// Proporções reais dos raios: núcleo externo começa em 0,546 do raio (2.900 km de profundidade),
// núcleo interno em 0,19. A crosta (fina demais em escala) aparece com espessura mínima legível.
export const CAMADAS = { crosta: 0.955, externo: 0.546, interno: 0.19 };
const COR = {
  crosta: colors.chaoSombra,
  manto: colors.muro,
  externo: colors.amarelo,
  interno: colors.coralClaro,
};

// Corte da Terra (círculo com as camadas) e o túnel vertical, desenhado de cima até `cava` (0..1)
export const CorteTerra: React.FC<{ x: number; y: number; r: number; cava?: number; rotulos?: boolean; tunel?: boolean }> = ({ x, y, r, cava = 1, rotulos = false, tunel = true }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill={COR.crosta} stroke={colors.tinta} strokeWidth={ink} />
      <circle r={r * CAMADAS.crosta} fill={COR.manto} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <circle r={r * CAMADAS.externo} fill={COR.externo} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <circle r={r * CAMADAS.interno} fill={COR.interno} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      {tunel && cava > 0 ? (
        <rect x={-r * 0.045} y={-r} width={r * 0.09} height={2 * r * cava} fill={colors.tinta} />
      ) : null}
      {rotulos ? (
        <g>
          <T x={0} y={-r * 0.74} size={r * 0.13} fill={colors.tinta}>MANTO</T>
          <T x={0} y={-r * 0.3} size={r * 0.11} fill={colors.tinta}>NÚCLEO</T>
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- ep07_terra_tunel
// A Terra inteira em perspectiva (globo com os continentes) com uma fatia aberta mostrando as
// camadas e o túnel que atravessa o planeta passando pelo centro.
//   `cava`: o túnel é cavado de cima para baixo; `centro`: marca e rótulo do centro
export const TERRA7 = { x: 540, y: 850, r: 360 };
export const TerraTunel: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const t = TERRA7;
  const cava = Number.isFinite(n(params.cava)) ? interpolate(frame, [n(params.cava), n(params.cava) + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 1;
  const centro = pop(frame, n(params.centro));
  const fatia = t.r * 0.42;
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noiteEscura} />
        {Array.from({ length: 40 }, (_, i) => {
          const sx = (i * 397) % 1180 - 50;
          const sy = (i * 619) % 1900;
          return <circle key={i} cx={sx} cy={sy} r={i % 5 ? 4 : 7} fill={colors.creme} opacity={0.75} />;
        })}
      </Layer>
      <Layer cam={cam} depth={1}>
        <Globe x={t.x} y={t.y} r={t.r} lon={-50} tilt={0} grade={false} />
        <clipPath id="fatia7">
          <circle cx={t.x} cy={t.y} r={t.r - ink * 0.5} />
        </clipPath>
        {/* fatia aberta: só a faixa do meio mostra as camadas */}
        <g clipPath="url(#fatia7)">
          <clipPath id="faixa7">
            <rect x={t.x - fatia} y={t.y - t.r} width={fatia * 2} height={t.r * 2} />
          </clipPath>
          <g clipPath="url(#faixa7)">
            <CorteTerra x={t.x} y={t.y} r={t.r} cava={cava} />
          </g>
          <path d={`M ${t.x - fatia} ${t.y - t.r} L ${t.x - fatia} ${t.y + t.r} M ${t.x + fatia} ${t.y - t.r} L ${t.x + fatia} ${t.y + t.r}`} stroke={colors.tinta} strokeWidth={ink} />
        </g>
        <circle cx={t.x} cy={t.y} r={t.r} fill="none" stroke={colors.tinta} strokeWidth={ink} />
        {/* pino na boca do túnel */}
        <g transform={`translate(${t.x} ${t.y - t.r - 6})`}>
          <path d="M 0 0 C -60 -70 -60 -150 0 -150 C 60 -150 60 -70 0 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
          <circle cy={-100} r={22} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        </g>
        {centro > 0 ? (
          <g transform={`translate(${t.x} ${t.y}) scale(${centro})`}>
            <circle r={26} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.8} />
            <g transform="translate(250 0)">
              <rect x={-150} y={-46} width={300} height={92} rx={24} fill={colors.tinta} />
              <rect x={-140} y={-36} width={280} height={72} rx={16} fill="none" stroke={colors.creme} strokeWidth={4} />
              <T x={0} y={20} size={56}>CENTRO</T>
            </g>
            <path d="M 40 0 L 100 0" stroke={colors.creme} strokeWidth={10} strokeLinecap="round" />
          </g>
        ) : null}
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- ep07_superficie
// Praça genérica do Rio no fim da manhã: céu, morro de topo arredondado e prédios em silhueta,
// chão de calçada ondulada e o buraco com a terra cavada e a pá. O Nico fica na beira.
//   `pose`: 1 = herói (S1); `agacha`: prepara o pulo; `mapaCai`: o mapa de guardanapo cai
//   `radical`/`radicalAte`, `batata`: cartões da piada; `oculos`=0 tira os óculos
//   `celular`: S6, inserto do celular (`recusa`, `busca`, `apaga`, `busca2`, `resultado`)
//   `interditado`: fita e cone no buraco; `metro`: placa do metrô; `alivio`: expressão de alívio
export const SUP = { chao: 1150, nicoX: 400, s: 0.55, buraco: { x: 770, y: 1192, rx: 210, ry: 56 } };
export const ROSTO_SUP = { x: SUP.nicoX, y: SUP.chao - 790 * SUP.s - 15 };

const MapaGuardanapo: React.FC<{ x: number; y: number; rot: number; s?: number }> = ({ x, y, rot, s = 1 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -60 -48 L 58 -52 L 62 46 L -56 50 Z" fill={colors.branco} stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinejoin="round" />
      <path d="M -38 26 Q -10 -30 20 6 T 40 -24" fill="none" stroke={colors.coral} strokeWidth={ink * 0.55} strokeDasharray="10 9" strokeLinecap="round" />
      <path d="M 30 -34 L 48 -16 M 48 -34 L 30 -16" stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinecap="round" />
    </g>
  );
};

const Batata: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const ink = useInk();
  if (s <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -120 10 C -130 -70 -40 -100 30 -90 C 120 -80 140 -20 128 30 C 116 90 30 110 -40 96 C -100 84 -114 50 -120 10 Z" fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      {[[-70, 50], [70, 56], [92, -36], [-30, -64]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill={colors.chaoSombra} />
      ))}
      {/* óculos escuros da batata */}
      <path d="M -88 -22 L 92 -22" stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" />
      <path d="M -82 -24 L -14 -24 Q -14 12 -48 16 Q -82 12 -82 -24 Z M 14 -24 L 82 -24 Q 82 12 48 16 Q 14 12 14 -24 Z" fill={colors.tinta} />
      <path d="M -26 52 Q 0 66 26 52" fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinecap="round" />
    </g>
  );
};

// Placa genérica do metrô (sem logotipo real): faixa escura com trem de frente e a palavra METRÔ
const PlacaMetro: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => {
  const ink = useInk();
  if (s <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-14} y={0} width={28} height={420} fill={colors.tinta} />
      <rect x={-170} y={-150} width={340} height={170} rx={26} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-156} y={-136} width={312} height={142} rx={18} fill="none" stroke={colors.creme} strokeWidth={4} />
      <g transform="translate(-92 -66)">
        <rect x={-44} y={-50} width={88} height={96} rx={20} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        <rect x={-30} y={-36} width={60} height={34} rx={8} fill={colors.ceu} />
        <circle cx={-20} cy={22} r={8} fill={colors.amarelo} />
        <circle cx={20} cy={22} r={8} fill={colors.amarelo} />
      </g>
      <T x={52} y={-46} size={66}>METRÔ</T>
    </g>
  );
};

// Celular (inserto em tela): notificação, busca digitada, apagada e trocada, resultado
const BUSCA1 = "Como chegar ao centro da Terra";
const BUSCA2 = "Metrô mais próximo";
// quebra o texto em linhas de até `max` caracteres (por palavra)
const quebra = (s: string, max: number) => {
  const linhas: string[] = [];
  for (const p of s.split(" ")) {
    const ult = linhas[linhas.length - 1];
    if (ult !== undefined && (ult + " " + p).length <= max) linhas[linhas.length - 1] = ult + " " + p;
    else linhas.push(p);
  }
  return linhas.length ? linhas : [""];
};
const Celular7: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const de = n(params.celular);
  const ate = n(params.celularAte);
  const s = janela(frame, de, ate);
  if (s <= 0) return null;
  const busca = n(params.busca);
  const apaga = n(params.apaga);
  const busca2 = n(params.busca2);
  // digitação rápida (2,5 letras por frame) e apagar em ~0,4 s
  let texto = "";
  if (on(frame, busca2)) texto = BUSCA2.slice(0, Math.floor((frame - busca2) * 2.6));
  else if (on(frame, apaga)) texto = BUSCA1.slice(0, Math.max(0, BUSCA1.length - Math.floor((frame - apaga) * 2.6)));
  else if (on(frame, busca)) texto = BUSCA1.slice(0, Math.floor((frame - busca) * 2.5));
  const cursor = Math.floor(frame / 8) % 2 === 0;
  const recusa = janela(frame, n(params.recusa), n(params.recusaAte), true);
  const resultado = pop(frame, n(params.resultado), true);
  const linhas = quebra(texto, 13);
  const caixaH = 70 + 66 * Math.max(2, linhas.length);
  return (
    <g transform={`translate(770 850) scale(${s})`}>
      <rect x={-280} y={-450} width={560} height={900} rx={64} fill={colors.tinta} />
      <rect x={-252} y={-410} width={504} height={820} rx={38} fill={colors.creme} />
      <rect x={-60} y={-434} width={120} height={14} rx={7} fill={colors.creme} opacity={0.4} />
      {/* barra de busca */}
      <rect x={-232} y={-200} width={464} height={caixaH} rx={30} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
      <circle cx={-190} cy={-150} r={20} fill="none" stroke={colors.tinta} strokeWidth={8} />
      <path d="M -176 -136 L -160 -120" stroke={colors.tinta} strokeWidth={9} strokeLinecap="round" />
      {linhas.map((l, i) => (
        <T key={i} x={-148} y={-128 + i * 66} size={56} fill={colors.tinta} anchor="start">
          {l + (i === linhas.length - 1 && cursor && on(frame, busca) ? "|" : "")}
        </T>
      ))}
      {/* resultado: metrô perto */}
      {resultado > 0 ? (
        <g transform={`translate(0 210) scale(${resultado})`}>
          <rect x={-232} y={-100} width={464} height={200} rx={30} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={8} />
          <T x={-200} y={-14} size={60} fill={colors.tinta} anchor="start">METRÔ</T>
          <T x={-200} y={60} size={52} fill={colors.tinta} anchor="start">a 400 m</T>
          <g transform="translate(150 0)">
            <circle r={58} fill={colors.creme} stroke={colors.tinta} strokeWidth={8} />
            <path d="M -26 0 L -6 22 L 30 -22" fill="none" stroke={colors.tinta} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      ) : null}
      {/* notificação do seguro: tudo alinhado ao card, sem rotação */}
      {recusa > 0 ? (
        <g transform={`translate(0 ${-312 - (1 - recusa) * 180})`}>
          <rect x={-240} y={-92} width={480} height={200} rx={28} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
          <Xis x={-178} y={8} r={44} s={1} />
          <T x={-112} y={-38} size={36} fill={colors.tinta} anchor="start">SEGURO DE VIDA</T>
          <T x={-112} y={22} size={42} fill={colors.coral} anchor="start">Solicitação</T>
          <T x={-112} y={76} size={42} fill={colors.coral} anchor="start">recusada</T>
        </g>
      ) : null}
    </g>
  );
};

export const Superficie: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const b = SUP.buraco;
  // `heroiDe`/`mapaDe`: a pose de herói e o mapa voltam no close final (o último quadro repete o primeiro)
  const heroi = params.pose === 1 || on(frame, n(params.heroiDe));
  const agacha = ramp(frame, n(params.agacha), n(params.agacha) + 10);
  const celular = on(frame, n(params.celular)) && !on(frame, n(params.celularAte));
  const alivio = on(frame, n(params.alivio));
  const oculos = params.oculos !== 0 || on(frame, n(params.oculosVolta));
  // mapa de guardanapo: na mão até `mapaCai`, depois cai rodopiando no chão
  const mapaCai = n(params.mapaCai);
  const handX = SUP.nicoX - 250 * SUP.s;
  const handY = SUP.chao - 380 * SUP.s;
  const quedaK = ramp(frame, mapaCai, mapaCai + 26, { ...clamp, easing: Easing.in(Easing.quad) });
  const mapa = Number.isFinite(mapaCai) || on(frame, n(params.mapaDe));
  const radical = janela(frame, n(params.radical), n(params.radicalAte), true);
  const batata = pop(frame, n(params.batata), true);
  const interditado = on(frame, n(params.interditadoAte)) ? 0 : pop(frame, n(params.interditado));
  const metro = pop(frame, n(params.metro), true);
  const expression = alivio
    ? "malandro"
    : celular
      ? on(frame, n(params.busca2))
        ? "curiosidade"
        : on(frame, n(params.recusa))
          ? "susto"
          : "atento"
      : on(frame, n(params.agacha))
        ? "atento"
        : "malandro";
  return (
    <>
      <Layer cam={cam} depth={0.12}>
        <SkyFill color={colors.ceu} />
        <rect x={-1500} y={820} width={4080} height={600} fill={sombra(colors.ceu)} opacity={0.25} />
      </Layer>
      <Layer cam={cam} depth={0.35}>
        <path d="M -600 1100 L -420 700 Q -300 470 -110 500 Q 90 540 160 760 L 260 1100 Z" fill={colors.folhaSombra} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <path d="M 760 1100 Q 820 860 960 840 Q 1120 840 1190 980 L 1240 1100 Z" fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      </Layer>
      <Layer cam={cam} depth={0.6}>
        {[180, 300, 430, 560, 690].map((x, i) => {
          const h = [190, 280, 230, 320, 210][i];
          return (
            <g key={i}>
              <rect x={x} y={SUP.chao - 40 - h} width={110} height={h + 40} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.8} />
              {Array.from({ length: Math.floor(h / 70) }, (_, k) => (
                <rect key={k} x={x + 22} y={SUP.chao - h + k * 70} width={66} height={26} rx={6} fill={colors.ceu} />
              ))}
            </g>
          );
        })}
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* chão de calçada ondulada */}
        <rect x={-2000} y={SUP.chao} width={5080} height={1400} fill={colors.chao} />
        <rect x={-2000} y={SUP.chao} width={5080} height={14} fill={colors.tinta} />
        {Array.from({ length: 6 }, (_, i) => {
          const y = SUP.chao + 90 + i * 110;
          return <path key={i} d={`M -1600 ${y} ${Array.from({ length: 34 }, () => "q 60 -40 120 0").join(" ")}`} fill="none" stroke={colors.chaoSombra} strokeWidth={ink * 1.2} />;
        })}
        {/* buraco, terra cavada e pá */}
        <path d={`M ${b.x + 150} ${b.y - 20} Q ${b.x + 230} ${b.y - 150} ${b.x + 320} ${b.y - 30} Z`} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <g transform={`translate(${b.x + 250} ${b.y - 110}) rotate(24)`}>
          <rect x={-9} y={-210} width={18} height={200} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          <path d="M -40 -10 L 40 -10 L 30 70 Q 0 96 -30 70 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
        </g>
        <ellipse cx={b.x} cy={b.y} rx={b.rx + 18} ry={b.ry + 12} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} />
        <ellipse cx={b.x} cy={b.y + 6} rx={b.rx} ry={b.ry} fill={colors.tinta} />
        {interditado > 0 ? (
          <g transform={`translate(0 ${(1 - interditado) * -40})`} opacity={interditado}>
            <path d={`M ${b.x - 250} ${b.y - 90} L ${b.x + 250} ${b.y - 60}`} stroke={colors.amarelo} strokeWidth={34} />
            {Array.from({ length: 7 }, (_, k) => (
              <path key={k} d={`M ${b.x - 230 + k * 70} ${b.y - 104 + k * 1.8} l 26 32`} stroke={colors.tinta} strokeWidth={12} />
            ))}
            <path d={`M ${b.x - 250} ${b.y - 90} L ${b.x + 250} ${b.y - 60}`} stroke={colors.tinta} strokeWidth={ink * 0.6} fill="none" opacity={0.0} />
            <g transform={`translate(${b.x - 260} ${b.y - 10})`}>
              <path d="M -40 0 L 40 0 L 14 -120 L -14 -120 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
              <rect x={-26} y={-70} width={52} height={18} fill={colors.creme} />
              <rect x={-56} y={-6} width={112} height={18} rx={6} fill={colors.tinta} />
            </g>
          </g>
        ) : null}
        <PlacaMetro x={850} y={SUP.chao - 330} s={metro} />
        {/* Nico */}
        <NicoEm
          x={SUP.nicoX}
          y={SUP.chao}
          s={SUP.s}
          pose={heroi ? "preparando" : "parado"}
          fromPose={heroi ? "heroi" : "parado"}
          poseT={heroi ? agacha : 1}
          expression={expression}
          look={celular ? [0.9, 0.1] : undefined}
          oculos={oculos}
        />
        {mapa && quedaK < 1 && !on(frame, mapaCai + 26) ? (
          <MapaGuardanapo x={handX - 20 - quedaK * 60} y={handY - 30 + quedaK * (SUP.chao - handY + 10)} rot={-12 + quedaK * 220 + Math.sin(frame / 3) * quedaK * 20} s={0.9} />
        ) : null}
        {mapa && on(frame, mapaCai + 26) ? <MapaGuardanapo x={handX - 80} y={SUP.chao + 18} rot={-80} s={0.9} /> : null}
      </Layer>
      {/* cartões da piada (em tela) */}
      {radical > 0 ? (
        <g transform={`translate(790 620) rotate(-8) scale(${radical})`}>
          <path d={estrela(190)} transform="scale(1.25 0.95)" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
          <T x={0} y={22} size={70} fill={colors.coral} stroke={colors.tinta} sw={10}>RADICAL!</T>
        </g>
      ) : null}
      <Cartao x={790} y={720} w={420} h={520} s={batata} rot={3}>
        <T x={0} y={-178} size={40}>INSTINTO DE</T>
        <T x={0} y={-130} size={40}>SOBREVIVÊNCIA</T>
        <Batata x={0} y={20} s={1.15} />
        <T x={0} y={200} size={46} fill={colors.amarelo}>NÍVEL: BATATA</T>
      </Cartao>
      <Celular7 frame={frame} params={params} />
    </>
  );
};

// ---------------------------------------------------------------- túnel (queda, calor, núcleo)
// Poço vertical visto de frente: paredes de rocha em blocos (esquerda e direita) que passam para
// cima com a velocidade, interior escuro e linhas de velocidade. A cor das paredes passa da crosta
// para o manto; no núcleo as paredes somem e o fundo vira metal líquido.
const PAREDE = 190;
const BLOCO = 240;

// Deslocamento acumulado das paredes até `frame` (soma da velocidade quadro a quadro)
const rolagem = (frame: number, vel: (f: number) => number) => {
  let y = 0;
  for (let f = 0; f < frame; f++) y += vel(f);
  return y;
};

const Paredes: React.FC<{ off: number; cor: string; corFundo: string; vel: number; frame: number; brilho?: number; parallax?: boolean }> = ({ off, cor, corFundo, vel, frame, brilho = 0, parallax = false }) => {
  const ink = useInk();
  const linhas = Math.min(14, Math.round(vel / 4));
  return (
    <>
      <rect x={-400} y={-400} width={1880} height={2720} fill={corFundo} />
      {/* parallax: anéis do fundo do poço (mais devagar) e saliências laterais (meia velocidade) */}
      {parallax
        ? Array.from({ length: 9 }, (_, k) => {
            const y = ((k * 300 - off * 0.35) % 2700 + 2700) % 2700 - 400;
            return <rect key={`a${k}`} x={PAREDE} y={y} width={1080 - 2 * PAREDE} height={26} fill={colors.noite} opacity={0.55} />;
          })
        : null}
      {parallax
        ? Array.from({ length: 8 }, (_, k) => {
            const y = ((k * 340 - off * 0.6) % 2720 + 2720) % 2720 - 400;
            const lado = k % 2;
            const x = lado ? 1080 - PAREDE - 70 : PAREDE;
            return <path key={`s${k}`} d={lado ? `M ${x + 70} ${y} L ${x} ${y + 50} L ${x + 70} ${y + 120} Z` : `M ${x} ${y} L ${x + 70} ${y + 50} L ${x} ${y + 120} Z`} fill={sombra(colors.noite)} />;
          })
        : null}
      {/* linhas de velocidade no interior do poço */}
      {Array.from({ length: linhas }, (_, i) => {
        const x = PAREDE + 60 + ((i * 163) % (1080 - 2 * PAREDE - 120));
        const len = 120 + vel * 6;
        const y = ((i * 431 - off * 1.6) % 2400 + 2400) % 2400 - 300;
        return <rect key={i} x={x} y={y} width={10} height={len} rx={5} fill={colors.creme} opacity={0.55} />;
      })}
      {[0, 1].map((lado) => {
        const x0 = lado ? 1080 - PAREDE : -60;
        const w = PAREDE + 60;
        return (
          <g key={lado}>
            <rect x={x0} y={-400} width={w} height={2720} fill={cor} />
            {Array.from({ length: 12 }, (_, k) => {
              const y = ((k * BLOCO - off) % (BLOCO * 12) + BLOCO * 12) % (BLOCO * 12) - BLOCO;
              const recuo = (k * 37 + lado * 53) % 70;
              return (
                <g key={k}>
                  <path d={`M ${x0} ${y} L ${x0 + w} ${y}`} stroke={colors.tinta} strokeWidth={ink * 0.6} />
                  <rect x={lado ? x0 + 30 + recuo * 0.5 : x0 + w - 110 - recuo} y={y + 60} width={80 + (k % 3) * 20} height={46} rx={20} fill={sombra(cor)} />
                  {brilho > 0 && k % 3 === 0 ? <rect x={lado ? x0 + 70 : x0 + 60} y={y + 150} width={70} height={18} rx={9} fill={colors.amarelo} opacity={brilho} /> : null}
                </g>
              );
            })}
            <path d={`M ${lado ? x0 : x0 + w} -400 L ${lado ? x0 : x0 + w} 2320`} stroke={colors.tinta} strokeWidth={ink} />
          </g>
        );
      })}
      {/* cintilação de calor nas bordas: tracinhos subindo (só quando há brilho) */}
      {brilho > 0
        ? Array.from({ length: 8 }, (_, i) => {
            const x = i % 2 ? 1080 - PAREDE - 40 : PAREDE + 26;
            const y = 1700 - (((frame * 9 + i * 260) % 1900) + 0);
            return <path key={i} d={`M ${x} ${y} q 14 -30 0 -60 q -14 -30 0 -60`} fill="none" stroke={colors.amarelo} strokeWidth={8} strokeLinecap="round" opacity={brilho} />;
          })
        : null}
    </>
  );
};

// Pedrinhas soltas na frente do Nico (camada mais rápida do parallax)
const Detritos: React.FC<{ off: number; vel: number }> = ({ off, vel }) => {
  const ink = useInk();
  if (vel < 6) return null;
  return (
    <g>
      {Array.from({ length: 5 }, (_, k) => {
        const x = PAREDE + 60 + ((k * 197) % (1080 - 2 * PAREDE - 120));
        const y = ((k * 520 - off * 1.9) % 2600 + 2600) % 2600 - 300;
        const r = 18 + (k % 3) * 8;
        return <path key={k} d={`M ${x - r} ${y} L ${x - r * 0.2} ${y - r} L ${x + r} ${y - r * 0.3} L ${x + r * 0.5} ${y + r} Z`} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink * 0.5} strokeLinejoin="round" />;
      })}
    </g>
  );
};

// Placar da queda (embaixo, abaixo da faixa da legenda): profundidade e velocidade
const fmt = (v: number) => Math.round(v).toLocaleString("pt-BR");
const Placar: React.FC<{ y: number; prof: string; vel: string; s: number }> = ({ y, prof, vel, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(540 ${y}) scale(${s})`}>
      {[-1, 1].map((lado) => (
        <g key={lado} transform={`translate(${lado * 225} 0)`}>
          <rect x={-205} y={-74} width={410} height={148} rx={28} fill={colors.tinta} />
          <rect x={-195} y={-64} width={390} height={128} rx={20} fill="none" stroke={colors.creme} strokeWidth={4} />
          <T x={0} y={-18} size={30} fill={colors.creme}>{lado < 0 ? "PROFUNDIDADE" : "VELOCIDADE"}</T>
          <T x={0} y={44} size={56} fill={colors.amarelo}>{lado < 0 ? prof : vel}</T>
        </g>
      ))}
    </g>
  );

// Selo pequeno de cenário hipotético (canto de cima, abaixo do texto)
export const Selo: React.FC<{ x: number; y: number; s: number; texto: string; cor?: string }> = ({ x, y, s, texto, cor = colors.turquesa }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-texto.length * 10.5 - 30} y={-34} width={texto.length * 21 + 60} height={68} rx={34} fill={cor} stroke={colors.tinta} strokeWidth={8} />
      <T x={0} y={13} size={36} fill={colors.tinta}>{texto}</T>
    </g>
  );

const Torradeira: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const sobe = Number.isFinite(at) ? interpolate(frame, [at + 4, at + 12, at + 22], [0, -80, -60], clamp) : 0;
  return (
    <g>
      <g transform={`translate(0 ${sobe})`}>
        <rect x={-70} y={-120} width={60} height={110} rx={14} fill={colors.chao} stroke={colors.tinta} strokeWidth={8} />
        <rect x={10} y={-120} width={60} height={110} rx={14} fill={colors.chao} stroke={colors.tinta} strokeWidth={8} />
      </g>
      <rect x={-130} y={-60} width={260} height={170} rx={50} fill={colors.creme} stroke={colors.tinta} strokeWidth={10} />
      <rect x={-84} y={-70} width={66} height={20} rx={8} fill={colors.tinta} />
      <rect x={18} y={-70} width={66} height={20} rx={8} fill={colors.tinta} />
      <rect x={130} y={0} width={30} height={46} rx={8} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
      {/* carinha vazia da torradeira */}
      <circle cx={-40} cy={20} r={10} fill={colors.tinta} />
      <circle cx={40} cy={20} r={10} fill={colors.tinta} />
      <path d="M -24 62 L 24 62" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
    </g>
  );
};

export const Queda: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const pula = n(params.pula, 0);
  const aumenta = n(params.aumenta);
  const vel = (f: number) => (f < pula ? 0 : Math.min(26, 3 + (f - pula) * 0.12) + (Number.isFinite(aumenta) && f > aumenta ? Math.min(34, (f - aumenta) * 0.35) : 0));
  const off = rolagem(frame, vel);
  const v = vel(frame);
  // Nico entra pelo alto no pulo e fica caindo no meio do poço
  const entra = pop(frame, pula);
  const nicoY = -300 + entra * 1220 + Math.sin(frame / 7) * 10;
  const heroi = on(frame, n(params.heroi));
  const perde = n(params.semPoderes);
  const torradeira = n(params.torradeira);
  const expression = on(frame, torradeira) ? "susto" : on(frame, n(params.inteligencia)) ? "medo" : on(frame, perde) ? "preocupacao" : "malandro";
  // profundidade nos números da fala, depois sobe sozinha; velocidade de queda livre sem ar
  // (v = raiz de 2·g·h, g constante perto da superfície)
  const marcas: [number, number][] = [
    [n(params.d10), 10],
    [n(params.d100), 100],
    [n(params.d1km), 1000],
  ];
  let prof = 0;
  for (const [at, m] of marcas) if (on(frame, at)) prof = m;
  if (on(frame, aumenta)) prof = 1000 + Math.pow(Math.max(0, frame - aumenta) / 30, 2) * 400;
  const velKmh = Math.sqrt(2 * 9.8 * prof) * 3.6;
  const profTxt = prof < 1000 ? `${fmt(prof)} m` : `${(prof / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;
  const placar = pop(frame, n(params.d10));
  const bate = (at: number) => 1 + 0.18 * Math.max(0, 1 - Math.abs(frame - at - 3) / 6);
  const batida = Math.max(...marcas.map(([at]) => (Number.isFinite(at) ? bate(at) : 1)));
  const oculosVoa = ramp(frame, torradeira, torradeira + 20);
  const kit = janela(frame, n(params.semPoderes), torradeira - 4);
  const torr = janela(frame, torradeira, Infinity, true);
  const selo = janela(frame, pula + 4, pula + 4 + 88);
  // pose muda a cada ~1,5 s (mola entre as poses); confiante -> herói -> desespero
  const ciclo = (lista: string[], base: number, passo = 45) => {
    const k = Math.max(0, Math.floor((frame - base) / passo));
    return {
      pose: lista[k % lista.length],
      fromPose: lista[(k + lista.length - 1) % lista.length],
      poseT: k === 0 ? 1 : spring({ frame: frame - base - k * passo, fps: 30, config: { damping: 12, mass: 0.6, stiffness: 150 } }),
    };
  };
  const poseNico = on(frame, perde)
    ? ciclo(["caindo", "flutuando", "encolhido", "caindo"], perde, 40)
    : heroi
      ? ciclo(["pulando", "caindo"], n(params.heroi), 45)
      : ciclo(["caindo", "flutuando"], pula, 45);
  const nicoX = 420 + (1 - entra) * 120;
  const balanco = 4 + v * 0.3;
  const rotNico = (heroi && !on(frame, perde) ? -10 : 0) + Math.sin(frame / 6) * balanco;
  return (
    <>
      <Layer cam={cam} depth={1}>
        <Paredes off={off} cor={colors.chaoSombra} corFundo={colors.noiteEscura} vel={v} frame={frame} parallax />
        {/* marcas de vento em volta do Nico: crescem com a velocidade (cabelo e capuz "batendo") */}
        {v > 2
          ? Array.from({ length: 6 }, (_, k) => {
              const c = ((frame * (0.06 + v * 0.004) + k / 6) % 1);
              const lado = k % 2 ? 1 : -1;
              const x = nicoX + lado * (150 + (k % 3) * 40);
              const y = nicoY - 260 - c * 260;
              return <path key={k} d={`M ${x} ${y} q ${lado * 18} -40 0 -${60 + v * 2}`} fill="none" stroke={colors.creme} strokeWidth={10} strokeLinecap="round" opacity={1 - c} />;
            })
          : null}
        <NicoEm
          x={nicoX}
          y={nicoY}
          s={0.55}
          centro
          rot={rotNico}
          pose={poseNico.pose}
          fromPose={poseNico.fromPose}
          poseT={poseNico.poseT}
          expression={expression}
          oculos={!on(frame, torradeira)}
          suor={on(frame, n(params.inteligencia))}
          espelhar={on(frame, perde) && Math.floor((frame - perde) / 80) % 2 === 1}
        />
        {/* os óculos voam para trás (para cima, saindo do quadro) com rastro */}
        {oculosVoa > 0 && oculosVoa < 1 ? (
          <g transform={`translate(${nicoX + oculosVoa * 160} ${nicoY - 250 - oculosVoa * 1000}) rotate(${oculosVoa * 720}) scale(0.6)`}>
            {[1, 2, 3].map((r) => (
              <path key={r} d={`M ${-120 + r * 60} 60 L ${-120 + r * 60} ${120 + r * 40}`} stroke={colors.creme} strokeWidth={14} strokeLinecap="round" opacity={0.7} />
            ))}
            <path d="M -180 0 L 180 0" stroke={colors.tinta} strokeWidth={16} />
            <path d="M -170 -6 L -30 -6 Q -30 60 -100 64 Q -170 60 -170 -6 Z M 30 -6 L 170 -6 Q 170 60 100 64 Q 30 60 30 -6 Z" fill={colors.tinta} />
          </g>
        ) : null}
        {heroi && !on(frame, perde)
          ? [0, 1, 2].map((k) => {
              const c = ((frame + k * 9) % 27) / 27;
              return <path key={k} d={estrela(30)} transform={`translate(${300 + k * 120} ${nicoY - 420 - c * 60}) scale(${1 - c})`} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={6} />;
            })
          : null}
        <Detritos off={off} vel={v} />
      </Layer>
      <Selo x={540} y={505} s={selo} texto="TÚNEL HIPOTÉTICO · SEM AR" />
      {/* kit do herói: poderes e plano riscados */}
      <Cartao x={850} y={790} w={400} h={330} s={kit * 0.92} rot={3}>
        <T x={0} y={-100} size={42} fill={colors.amarelo}>KIT DO HERÓI</T>
        <T x={-150} y={0} size={46} anchor="start">PODERES</T>
        <T x={-150} y={100} size={46} anchor="start">PLANO</T>
        <Xis x={140} y={-14} r={36} s={pop(frame, n(params.poderes), true)} />
        <Xis x={140} y={86} r={36} s={pop(frame, n(params.plano), true)} />
      </Cartao>
      <Cartao x={850} y={800} w={420} h={470} s={torr * 0.92} rot={-3}>
        <T x={0} y={-160} size={38}>INTELIGÊNCIA</T>
        <T x={0} y={-114} size={38}>EMOCIONAL:</T>
        <g transform="translate(0 120) scale(0.85)">
          <Torradeira frame={frame} at={torradeira} />
        </g>
      </Cartao>
      <g transform={`translate(0 0) scale(1)`}>
        <g transform={`translate(540 1570) scale(${batida}) translate(-540 -1570)`}>
          <Placar y={1570} prof={profTxt} vel={`${fmt(velKmh)} km/h`} s={placar} />
        </g>
      </g>
    </>
  );
};

// Mini corte da Terra no canto com o ponto de onde o Nico está (profundidade 0..1 do raio)
const MiniCorte: React.FC<{ x: number; y: number; r: number; prof: number; s: number }> = ({ x, y, r, prof, s }) => {
  if (s <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-r - 30} y={-r - 90} width={2 * r + 60} height={2 * r + 120} rx={30} fill={colors.tinta} />
      <T x={0} y={-r - 40} size={34}>VOCÊ ESTÁ AQUI</T>
      <CorteTerra x={0} y={0} r={r} />
      <circle cx={0} cy={-r + prof * r} r={16} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
    </g>
  );
};

// Barra vertical (temperatura, pressão) que enche de 0 a `k`
const Barra: React.FC<{ x: number; y: number; h: number; k: number; cor: string; rotulo: string; s: number }> = ({ x, y, h, k, cor, rotulo, s }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-38} y={-h} width={76} height={h} rx={38} fill={colors.creme} stroke={colors.tinta} strokeWidth={8} />
      <rect x={-26} y={-12 - (h - 24) * k} width={52} height={(h - 24) * k} rx={26} fill={cor} />
      <rect x={-38} y={-h} width={76} height={h} rx={38} fill="none" stroke={colors.tinta} strokeWidth={8} />
      <T x={0} y={50} size={30} fill={colors.creme} stroke={colors.tinta} sw={10}>{rotulo}</T>
    </g>
  );

// Placa de aviso de temperatura (amarela com faixas)
const PlacaCalor: React.FC<{ x: number; y: number; s: number; texto: string; rot?: number }> = ({ x, y, s, texto, rot = -4 }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-230} y={-90} width={460} height={180} rx={24} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={12} />
      {Array.from({ length: 10 }, (_, k) => (
        <path key={k} d={`M ${-220 + k * 46} -78 l 22 0 l -30 22 l -22 0 Z`} fill={colors.tinta} />
      ))}
      <T x={0} y={50} size={texto.length > 10 ? 64 : 84} fill={colors.coral} stroke={colors.tinta} sw={12}>{texto}</T>
    </g>
  );

// Carro genérico de app de corrida (sem marca)
const Carrinho: React.FC = () => (
  <g>
    <path d="M -110 10 L -80 -50 Q -70 -66 -50 -66 L 50 -66 Q 70 -66 80 -50 L 110 10 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-140} y={0} width={280} height={70} rx={26} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
    <circle cx={-80} cy={72} r={30} fill={colors.tinta} />
    <circle cx={80} cy={72} r={30} fill={colors.tinta} />
  </g>
);

export const Calor: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const vel = () => 46;
  const off = rolagem(frame, vel) + 9000;
  const manto = n(params.manto);
  const crosta = n(params.crosta);
  const k = ramp(frame, crosta, manto + 20);
  const quente = ramp(frame, manto, n(params.mil) + 10);
  const cor = interpolateColors(k, [0, 1], [colors.chaoSombra, colors.muro]);
  const corFundo = interpolateColors(quente, [0, 1], [colors.noiteEscura, sombra(sombra(colors.coral))]);
  // a fronteira crosta/manto passa de baixo para cima
  const fronteira = Number.isFinite(crosta) ? interpolate(frame, [crosta, crosta + 70], [1900, -300], clamp) : 2000;
  const suor = on(frame, n(params.suor));
  const expression = on(frame, n(params.uber)) ? "vergonha" : on(frame, n(params.medo)) ? "medo" : suor ? "preocupacao" : "surpresa";
  const mapa = janela(frame, n(params.mapa), n(params.painel) - 2, true);
  const painel = pop(frame, n(params.painel));
  const tempK = ramp(frame, n(params.temp), n(params.mil) + 20) * 0.85 + ramp(frame, n(params.mil), n(params.mil) + 12) * 0.1;
  const presK = ramp(frame, n(params.pressao), n(params.mil) + 40) * 0.9;
  const prof = 0.02 + ramp(frame, 0, n(params.manto)) * 0.12 + ramp(frame, n(params.manto), 600) * 0.1;
  const uber = pop(frame, n(params.uber), true);
  const estrelas = n(params.uber) + 8;
  return (
    <>
      <Layer cam={cam} depth={1}>
        <Paredes off={off} cor={cor} corFundo={corFundo} vel={46} frame={frame} brilho={quente} />
        {on(frame, crosta) && fronteira > -400 ? <rect x={-100} y={fronteira} width={1280} height={22} fill={colors.tinta} /> : null}
        <NicoEm x={420} y={900 + Math.sin(frame / 7) * 10} s={0.5} centro rot={Math.sin(frame / 11) * 6} pose="caindo" expression={expression} suor={suor} look={on(frame, n(params.uber)) ? [0.6, -0.9] : undefined} />
      </Layer>
      {/* rótulos da troca de camada: fixos abaixo do banner, longe do Nico e do medidor */}
      {(() => {
        const c1 = janela(frame, crosta, crosta + 80, true);
        const m1 = janela(frame, crosta + 20, n(params.mil) - 2, true);
        return (
          <g>
            {c1 > 0 ? (
              <g transform={`translate(190 560) scale(${c1})`}>
                <rect x={-150} y={-40} width={300} height={80} rx={22} fill={colors.tinta} />
                <T x={0} y={16} size={44}>↑ CROSTA</T>
              </g>
            ) : null}
            {m1 > 0 ? (
              <g transform={`translate(515 560) scale(${m1})`}>
                <rect x={-150} y={-40} width={300} height={80} rx={22} fill={colors.tinta} />
                <T x={0} y={16} size={44} fill={colors.amarelo}>MANTO ↓</T>
              </g>
            ) : null}
          </g>
        );
      })()}
      {/* mapa do celular: só a superfície, nada do que tem embaixo */}
      <Cartao x={800} y={760} w={400} h={460} s={mapa} rot={3} cor={colors.creme}>
        <rect x={-170} y={-200} width={340} height={210} rx={18} fill={colors.turquesa} />
        <path d="M -170 -60 Q -60 -120 40 -70 T 170 -110" fill="none" stroke={colors.creme} strokeWidth={18} />
        <g transform="translate(20 -100)">
          <path d="M 0 0 C -40 -46 -40 -100 0 -100 C 40 -100 40 -46 0 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
        </g>
        <rect x={-170} y={10} width={340} height={10} fill={colors.tinta} />
        <rect x={-170} y={20} width={340} height={190} rx={10} fill={colors.chaoSombra} />
        <T x={0} y={138} size={90} fill={colors.creme} stroke={colors.tinta} sw={10}>???</T>
      </Cartao>
      <MiniCorte x={880} y={700} r={130} prof={prof} s={painel * (1 - uber)} />
      <Barra x={790} y={1180} h={300} k={tempK} cor={colors.coral} rotulo="CALOR" s={painel * (1 - uber)} />
      <Barra x={960} y={1180} h={300} k={presK} cor={colors.noite} rotulo="PRESSÃO" s={painel * (1 - uber)} />
      <PlacaCalor x={430} y={520} s={janela(frame, n(params.mil), n(params.uber) - 2, true)} texto="1.000 °C+" />
      <SeloTunel frame={frame} params={params} />
      <Cartao x={560} y={370} w={760} h={380} s={uber} rot={-2}>
        <T x={0} y={-118} size={44} fill={colors.creme}>SUA CORRIDA</T>
        <g transform="translate(-220 0) scale(0.85)">
          <Carrinho />
        </g>
        <T x={-50} y={-10} size={40} fill={colors.amarelo} anchor="start">DESTINO:</T>
        <T x={-50} y={44} size={40} fill={colors.creme} anchor="start">CENTRO DA TERRA</T>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={estrela(40)}
            transform={`translate(${-200 + i * 100} 122) scale(${pop(frame, estrelas + i * 3)})`}
            fill={i === 0 ? colors.amarelo : colors.noite}
            stroke={colors.creme}
            strokeWidth={5}
            strokeLinejoin="round"
          />
        ))}
      </Cartao>
    </>
  );
};

// ---------------------------------------------------------------- núcleo externo
// Metal líquido (ferro e níquel): fundo amarelo com manchas laranja que escorrem para cima,
// bolhas e partículas. Panela de pressão com chifrinhos; o Nico vira miojo num puf de fumaça.
const Bolhas: React.FC<{ frame: number; n?: number }> = ({ frame, n: qtd = 18 }) => (
  <g>
    {Array.from({ length: qtd }, (_, i) => {
      const x = (i * 211) % 1080;
      const r = 14 + (i % 4) * 9;
      const y = 2000 - (((frame * (5 + (i % 3) * 2) + i * 300) % 2300) + 0);
      return <circle key={i} cx={x + Math.sin(frame / 9 + i) * 20} cy={y} r={r} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} opacity={0.9} />;
    })}
  </g>
);

const MetalLiquido: React.FC<{ frame: number }> = ({ frame }) => (
  <g>
    <rect x={-400} y={-400} width={1880} height={2720} fill={colors.amarelo} />
    {Array.from({ length: 9 }, (_, i) => {
      const x = (i * 263) % 1180 - 50;
      const y = 2100 - (((frame * 7 + i * 420) % 2700) + 0);
      const w = 220 + (i % 3) * 90;
      return <path key={i} d={`M ${x} ${y} q ${w / 2} -90 ${w} 0 q -${w / 4} 110 -${w / 2} 60 q -${w / 4} 60 -${w / 2} -60 Z`} fill={i % 2 ? colors.muro : colors.coral} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />;
    })}
    <Bolhas frame={frame} />
  </g>
);

const Panela: React.FC<{ frame: number; capeta: number }> = ({ frame, capeta }) => {
  const treme = Math.sin(frame * 1.7) * 6;
  const chifre = pop(frame, capeta, true);
  const vapor = ((frame % 20) / 20);
  return (
    <g transform={`translate(${treme} 0)`}>
      {/* vapor saindo da válvula */}
      {[0, 1].map((k) => {
        const c = (vapor + k * 0.5) % 1;
        return <circle key={k} cx={30 + c * 60} cy={-210 - c * 140} r={24 + c * 30} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} opacity={1 - c} />;
      })}
      <rect x={-170} y={-60} width={340} height={200} rx={40} fill={colors.noite} stroke={colors.tinta} strokeWidth={10} />
      <path d="M -190 -60 Q 0 -170 190 -60 Z" fill={sombra(colors.noite)} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
      <rect x={-280} y={-60} width={110} height={34} rx={17} fill={colors.tinta} />
      <g transform={`translate(0 -150) rotate(${frame * 24})`}>
        <rect x={-14} y={-40} width={28} height={50} rx={8} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
      </g>
      {/* chifrinhos */}
      {chifre > 0
        ? [-1, 1].map((l) => (
            <path key={l} d="M -26 0 Q -30 -70 20 -96 Q 0 -50 26 0 Z" transform={`translate(${l * 110} -96) scale(${l * chifre} ${chifre})`} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
          ))
        : null}
      <circle cx={-60} cy={40} r={12} fill={colors.amarelo} />
      <circle cx={60} cy={40} r={12} fill={colors.amarelo} />
      <path d="M -50 92 Q 0 120 50 92" fill="none" stroke={colors.amarelo} strokeWidth={10} strokeLinecap="round" />
    </g>
  );
};

// Copo de miojo com o topete do Nico e os olhos espiando por cima do macarrão
const Miojo: React.FC<{ frame: number; s: number }> = ({ frame, s }) => {
  if (s <= 0) return null;
  const pisca = frame % 70 < 4 ? 0.1 : 1;
  return (
    <g transform={`scale(${s})`}>
      <path d="M -190 -260 L 190 -260 L 150 120 Q 0 150 -150 120 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={14} strokeLinejoin="round" />
      <path d="M -180 -170 L 180 -170 L 172 -100 L -172 -100 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
      <path d={estrela(40)} transform="translate(0 10)" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={8} />
      {/* macarrão ondulado transbordando */}
      <path d={`M -200 -262 ${Array.from({ length: 8 }, () => "q 25 -50 50 0").join(" ")} L 200 -240 L -200 -240 Z`} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
      {/* olhos e topete do Nico */}
      {[-1, 1].map((l) => (
        <g key={l} transform={`translate(${l * 60} -300) scale(1 ${pisca})`}>
          <ellipse rx={40} ry={46} fill={colors.branco} stroke={colors.tinta} strokeWidth={10} />
          <circle cx={6} cy={8} r={18} fill={colors.tinta} />
        </g>
      ))}
      <path d="M -60 -340 C -50 -440 90 -470 175 -404 C 120 -408 92 -380 80 -340 Z" fill={colors.cabelo} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
      {/* vapor */}
      {[0, 1, 2].map((k) => {
        const c = ((frame + k * 12) % 36) / 36;
        return <path key={k} d={`M ${-120 + k * 120} ${-380 - c * 120} q 18 -26 0 -52 q -18 -26 0 -52`} fill="none" stroke={colors.creme} strokeWidth={12} strokeLinecap="round" opacity={1 - c} />;
      })}
    </g>
  );
};

// Puf de fumaça cartunesco (cobre a troca)
const Puf: React.FC<{ frame: number; at: number; x: number; y: number; escala?: number; dur?: number }> = ({ frame, at, x, y, escala = 1, dur = 26 }) => {
  if (!Number.isFinite(at) || frame < at || frame > at + dur) return null;
  const k = (frame - at) / dur;
  const s = escala * interpolate(k, [0, 0.3, 1], [0.3, 1.1, 1.3]);
  const o = interpolate(k, [0, 0.7, 1], [1, 1, 0]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      {[[0, 0, 170], [-150, 60, 120], [150, 50, 130], [-90, -120, 110], [100, -120, 120], [0, 150, 120]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={colors.creme} stroke={colors.tinta} strokeWidth={12} />
      ))}
    </g>
  );
};

export const Nucleo: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const nucleo = n(params.nucleo);
  const dentro = on(frame, nucleo);
  const off = rolagem(frame, () => 46) + 30000;
  const puf = n(params.puf);
  const virou = on(frame, puf + 8);
  const expression = on(frame, n(params.nico)) ? "susto" : on(frame, n(params.temp)) ? "medo" : "preocupacao";
  const placa = on(frame, n(params.t5)) ? "4.000–5.000 °C" : "4.000 °C";
  const rotulo = pop(frame, nucleo);
  const fe = pop(frame, n(params.ferro), true);
  const ni = pop(frame, n(params.niquel), true);
  const liq = pop(frame, n(params.liquidos), true);
  const elementosAte = n(params.panela) - 2;
  const panela = janela(frame, n(params.panela), n(params.nico) - 2, true);
  const miojo = pop(frame, n(params.miojo), true);
  const premium = pop(frame, n(params.premium), true);
  return (
    <>
      <Layer cam={cam} depth={1}>
        {dentro ? <MetalLiquido frame={frame} /> : <Paredes off={off} cor={colors.muro} corFundo={sombra(sombra(colors.coral))} vel={46} frame={frame} brilho={1} />}
        {/* clarão chapado na entrada do núcleo */}
        {dentro && frame < nucleo + 6 ? <rect x={-400} y={-400} width={1880} height={2720} fill={colors.creme} /> : null}
        {!virou ? (
          <NicoEm x={360} y={900 + Math.sin(frame / 5) * 14} s={0.5} centro rot={Math.sin(frame / 6) * 10} pose="caindo" expression={expression} suor />
        ) : (
          <g transform={`translate(360 ${960 + Math.sin(frame / 9) * 12}) rotate(${Math.sin(frame / 13) * 5})`}>
            <Miojo frame={frame} s={0.62 * miojo} />
          </g>
        )}
        <Puf frame={frame} at={puf} x={360} y={880} />
      </Layer>
      {/* rótulo da camada e elementos */}
      {rotulo > 0 && frame < elementosAte ? (
        <g>
          <Selo x={540} y={500} s={rotulo * (1 - pop(frame, n(params.t4)))} texto="NÚCLEO EXTERNO" cor={colors.creme} />
          {[
            ["Fe", "FERRO", fe, 600],
            ["Ni", "NÍQUEL", ni, 880],
          ].map(([sim, nome, s, y]) =>
            (s as number) > 0 ? (
              <g key={sim as string} transform={`translate(830 ${y}) scale(${s})`}>
                <circle r={86} fill={colors.noite} stroke={colors.tinta} strokeWidth={10} />
                <T x={0} y={26} size={74}>{sim}</T>
                <T x={0} y={140} size={40} fill={colors.creme} stroke={colors.tinta} sw={10}>{nome}</T>
              </g>
            ) : null,
          )}
          {liq > 0 ? (
            <g transform={`translate(830 1140) scale(${liq})`}>
              <rect x={-150} y={-42} width={300} height={84} rx={42} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
              <T x={0} y={16} size={44} fill={colors.creme}>LÍQUIDOS</T>
            </g>
          ) : null}
        </g>
      ) : null}
      <PlacaCalor x={560} y={520} s={janela(frame, n(params.t4), elementosAte, true) * 0.95} texto={placa} rot={-3} />
      <g transform={`translate(800 820) scale(${panela})`}>{panela > 0 ? <Panela frame={frame} capeta={n(params.capeta)} /> : null}</g>
      {panela > 0 ? (
        <g transform={`translate(800 1080) scale(${panela})`}>
          <rect x={-200} y={-40} width={400} height={80} rx={40} fill={colors.tinta} />
          <T x={0} y={16} size={40}>PANELA DE PRESSÃO</T>
        </g>
      ) : null}
      <SeloTunel frame={frame} params={params} />
      {premium > 0 ? (
        <g transform={`translate(760 640) rotate(-6) scale(${premium})`}>
          <path d={estrela(170)} transform="scale(1.3 0.9)" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={10} strokeLinejoin="round" />
          <T x={0} y={-6} size={56} fill={colors.coral} stroke={colors.tinta} sw={10}>MIOJO</T>
          <T x={0} y={52} size={56} fill={colors.coral} stroke={colors.tinta} sw={10}>PREMIUM</T>
        </g>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- centro: túnel protegido, gráfico e flutuação
// `volta`: o miojo volta a ser o Nico (puf); `impossivel`: carimbo; `protegido`: as paredes viram
// um tubo turquesa com rebites; `semAr`: selo. No modo gráfico (ep07_gravidade): corte grande da
// Terra com o Nico descendo pelo túnel e, alinhado à profundidade, o gráfico da gravidade:
// quase igual pelo manto (sobe ~9% até a borda do núcleo) e caindo só no núcleo, até zero.
// No modo flutuação (ep07_flutua): o Nico de cabeça para baixo no centro e objetos boiando.
const TuboProtegido: React.FC<{ off: number; k: number; frame: number }> = ({ off, k, frame }) => {
  const ink = useInk();
  if (k <= 0) return null;
  return (
    <g opacity={1}>
      {[0, 1].map((lado) => {
        const x = lado ? 1080 - PAREDE - 30 : PAREDE - 10;
        return (
          <g key={lado} transform={`translate(${lado ? (1 - k) * 200 : -(1 - k) * 200} 0)`}>
            <rect x={x} y={-400} width={40} height={2720} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink * 0.7} />
            {Array.from({ length: 10 }, (_, i) => {
              const y = ((i * 230 - off) % 2300 + 2300) % 2300 - 200;
              return <circle key={i} cx={x + 20} cy={y} r={8} fill={colors.creme} stroke={colors.tinta} strokeWidth={4} />;
            })}
          </g>
        );
      })}
      <rect x={PAREDE + 30} y={-400} width={1080 - 2 * PAREDE - 60} height={2720} fill={colors.ceu} opacity={0.12 * k + 0 * frame} />
    </g>
  );
};

const Carimbo: React.FC<{ x: number; y: number; s: number; texto: string; sub?: string }> = ({ x, y, s, texto, sub }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) rotate(-10) scale(${2.2 - 1.2 * s})`} opacity={Math.min(1, s * 1.4)}>
      <rect x={-texto.length * 21 - 30} y={-62} width={texto.length * 42 + 60} height={sub ? 190 : 124} rx={18} fill={colors.creme} stroke={colors.coral} strokeWidth={14} />
      <T x={0} y={22} size={64} fill={colors.coral}>{texto}</T>
      {sub ? <T x={0} y={96} size={44} fill={colors.tinta}>{sub}</T> : null}
    </g>
  );

export const Centro: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const off = rolagem(frame, (f) => Math.max(10, 40 - f * 0.08)) + 50000;
  const volta = n(params.volta, 0);
  const prot = ramp(frame, n(params.protegido), n(params.protegido) + 14);
  const imp = ramp(frame, n(params.impossivel), n(params.impossivel) + 8);
  return (
    <>
      <Layer cam={cam} depth={1}>
        <Paredes off={off} cor={colors.noite} corFundo={colors.noiteEscura} vel={24} frame={frame} />
        <TuboProtegido off={off} k={prot} frame={frame} />
        {frame < volta + 4 ? (
          <g transform="translate(540 960)">
            <Miojo frame={frame} s={0.62} />
          </g>
        ) : (
          <NicoEm x={540} y={900 + Math.sin(frame / 8) * 10} s={0.5} centro rot={Math.sin(frame / 12) * 5} pose="caindo" expression={on(frame, n(params.impossivel)) ? "confusao" : "surpresa"} />
        )}
        <Puf frame={frame} at={volta} x={540} y={900} escala={0.55} dur={14} />
      </Layer>
      <SeloTunel frame={frame} params={params} />
      <Carimbo x={540} y={600} s={imp * (1 - ramp(frame, n(params.impossivel) + 82, n(params.impossivel) + 90))} texto="CENÁRIO IMPOSSÍVEL" sub="TÚNEL PROTEGIDO · SEM AR" />
    </>
  );
};

// gravidade relativa à da superfície em função da profundidade (0 superfície, 1 centro)
const NUCLEO_PROF = 1 - CAMADAS.externo;
const gravidade = (p: number) => (p <= NUCLEO_PROF ? 1 + 0.09 * (p / NUCLEO_PROF) : 1.09 * (1 - (p - NUCLEO_PROF) / (1 - NUCLEO_PROF)));

// Layout vertical (P1): corte da Terra em cima à esquerda, o Nico grande em cima à direita e o
// gráfico embaixo em quase toda a largura. Eixo da profundidade vertical à esquerda (rótulos
// SUPERFÍCIE / NÚCLEO / CENTRO fixos à esquerda dele) e gravidade na horizontal.
export const GRAV = { x: 290, y: 560, r: 225, ax: 310, top: 1040, bot: 1272, gmax: 1.15, right: 990 };
export const SeloTunel: React.FC<{ frame: number; params: Params }> = ({ frame, params }) =>
  on(frame, n(params.seloTunel)) ? <Selo x={540} y={1560} s={0.9} texto="TÚNEL PROTEGIDO · SEM AR" /> : null;

export const Gravidade: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const G = GRAV;
  const desce = n(params.desce, 0);
  const manto = n(params.mantoFim);
  const zero = n(params.zero);
  // profundidade do Nico: desce pelo manto até a borda do núcleo em `mantoFim`, depois até o centro em `zero`
  const p = frame < manto ? NUCLEO_PROF * ramp(frame, desce, manto) : NUCLEO_PROF + (1 - NUCLEO_PROF) * ramp(frame, manto, zero, { ...clamp, easing: Easing.out(Easing.quad) });
  const g = gravidade(p);
  const yT = (q: number) => G.y - G.r + q * G.r; // no corte da Terra
  const yG = (q: number) => G.top + q * (G.bot - G.top); // no gráfico
  const xG = (gg: number) => G.ax + gg * ((G.right - G.ax) / G.gmax);
  const pts = Array.from({ length: 41 }, (_, i) => (i / 40) * p).map((q) => `${xG(gravidade(q)).toFixed(1)} ${yG(q).toFixed(1)}`);
  const seta = pop(frame, n(params.puxando));
  const quase = pop(frame, n(params.quase), true);
  const diminui = pop(frame, n(params.diminuir), true);
  const zeroK = pop(frame, zero, true);
  const valor = g < 0.05 ? "≈ 0" : `${g.toFixed(1).replace(".", ",")}×`;
  // o Nico (personagem inteiro) reage a cada estágio
  const expression = on(frame, zero) ? "neutro" : on(frame, n(params.diminuir)) ? "surpresa" : on(frame, n(params.quase)) ? "curiosidade" : "malandro";
  const flutuando = on(frame, zero);
  const chipX = xG(g) + 34;
  const chipY = yG(p);
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noiteEscura} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <CorteTerra x={G.x} y={G.y} r={G.r} />
        <circle cx={G.x} cy={G.y} r={12} fill={colors.tinta} />
        {/* ícone do Nico descendo pelo túnel, com a seta da gravidade proporcional */}
        <g transform={`translate(${G.x} ${yT(p)})`}>
          {seta > 0 && g > 0.04 ? (
            <g transform={`scale(${seta})`}>
              <path d={`M 0 30 L 0 ${30 + 110 * g}`} stroke={colors.creme} strokeWidth={20} strokeLinecap="round" />
              <path d={`M -32 ${10 + 110 * g} L 0 ${52 + 110 * g} L 32 ${10 + 110 * g} Z`} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} strokeLinejoin="round" />
            </g>
          ) : null}
          <circle r={36} fill={colors.pele} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          <path d="M -36 -4 C -38 -36 -18 -42 0 -42 C 22 -42 40 -32 36 -4 C 27 -24 0 -30 -36 -4 Z" fill={colors.cabelo} />
          <circle cx={-12} cy={6} r={6} fill={colors.tinta} />
          <circle cx={12} cy={6} r={6} fill={colors.tinta} />
        </g>
        {/* o Nico grande, ao lado do corte */}
        <NicoEm
          x={800}
          y={610}
          s={0.6}
          centro
          pose={flutuando ? "parado" : on(frame, n(params.diminuir)) ? "mao_levantada" : "parado"}
          fromPose={flutuando ? "mao_levantada" : on(frame, n(params.diminuir)) ? "parado" : "parado"}
          poseT={spring({ frame: frame - (flutuando ? zero : n(params.diminuir, 0)), fps: 30, config: { damping: 12, mass: 0.6, stiffness: 150 } })}
          expression={expression}
          look={[-0.9, 0.5]}
        />
        {/* gráfico */}
        <T x={G.ax} y={G.top - 44} size={44} fill={colors.creme} anchor="start">GRAVIDADE →</T>
        <path d={`M ${G.ax} ${G.top - 10} L ${G.ax} ${G.bot + 10}`} stroke={colors.creme} strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${xG(1)} ${G.top} L ${xG(1)} ${G.bot}`} stroke={colors.creme} strokeWidth={4} strokeDasharray="12 12" opacity={0.6} />
        <T x={xG(1)} y={G.top - 44} size={40} fill={colors.creme}>1×</T>
        {[
          [0, "SUPERFÍCIE", colors.creme],
          [NUCLEO_PROF, "NÚCLEO", colors.amarelo],
          [1, "CENTRO", colors.creme],
        ].map(([q, nome, cor]) => (
          <g key={nome as string}>
            <path d={`M ${G.ax} ${yG(q as number)} L ${G.right} ${yG(q as number)}`} stroke={cor as string} strokeWidth={4} strokeDasharray="10 12" opacity={0.6} />
            <T x={G.ax - 20} y={yG(q as number) + 14} size={40} fill={cor as string} anchor="end">{nome as string}</T>
          </g>
        ))}
        {p > 0.005 ? <path d={`M ${pts.join(" L ")}`} fill="none" stroke={colors.amarelo} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" /> : null}
        <circle cx={xG(g)} cy={yG(p)} r={18} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={6} />
        {/* chip do valor à direita do ponto (nunca cobre os rótulos, que ficam à esquerda do eixo) */}
        <g transform={`translate(${chipX + 170 > G.right + 60 ? xG(g) - 34 - 170 : chipX} ${chipY})`}>
          <rect x={0} y={-36} width={170} height={72} rx={22} fill={colors.tinta} stroke={colors.amarelo} strokeWidth={4} />
          <T x={85} y={16} size={44} fill={colors.amarelo}>{valor}</T>
        </g>
      </Layer>
      {/* rótulo do trecho, no alto (sem texto de tela neste plano) */}
      <Selo x={540} y={226} s={quase * (1 - diminui)} texto="NO MANTO: QUASE IGUAL" cor={colors.creme} />
      <Selo x={540} y={226} s={diminui * (1 - zeroK)} texto="NO NÚCLEO: DIMINUI" cor={colors.amarelo} />
      <Selo x={540} y={226} s={zeroK} texto="NO CENTRO: ≈ ZERO" cor={colors.turquesa} />
      <SeloTunel frame={frame} params={params} />
    </>
  );
};

// Objetos boiando (óculos, mapa de guardanapo, torrada) e o Nico de cabeça para baixo
export const Flutua: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const calmo = on(frame, n(params.calmo));
  const conquista = pop(frame, n(params.conquista), true);
  // o Nico gira devagar até ficar de cabeça para baixo e fica boiando
  const f0 = n(params.flutua, 0);
  // entra de pé, descendo e desacelerando; cruza a linha do CENTRO (y 960) e então gira devagar
  const desceY = interpolate(frame, [f0, f0 + 18], [700, 1000], { ...clamp, easing: Easing.out(Easing.quad) });
  const giro = interpolate(frame, [f0 + 12, f0 + 42], [0, 180], { ...clamp, easing: Easing.inOut(Easing.sin) });
  const solto = ramp(frame, f0 + 42, f0 + 60);
  const bob = (k: number, a: number) => Math.sin(frame / (18 + k * 3) + k) * a;
  return (
    <>
      <Layer cam={cam} depth={0.4}>
        <SkyFill color={colors.noiteEscura} />
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* câmara do centro: tubo protegido e a marca do centro da Terra */}
        {[0, 1].map((lado) => {
          const x = lado ? 1080 - PAREDE - 30 : PAREDE - 10;
          return <rect key={lado} x={x} y={-400} width={40} height={2720} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink * 0.7} />;
        })}
        <path d={`M ${PAREDE - 40} 960 L ${1080 - PAREDE + 40} 960`} stroke={colors.creme} strokeWidth={8} strokeDasharray="22 16" />
        <g transform="translate(860 920)">
          <rect x={-120} y={-34} width={240} height={68} rx={20} fill={colors.tinta} />
          <T x={0} y={14} size={36}>CENTRO</T>
        </g>
        {/* objetos boiando */}
        <g transform={`translate(${300 + bob(1, 20)} ${700 + bob(2, 30)}) rotate(${frame * 0.8})`}>
          <path d="M -90 0 L 90 0" stroke={colors.tinta} strokeWidth={10} />
          <path d="M -86 -4 L -16 -4 Q -16 30 -51 32 Q -86 30 -86 -4 Z M 16 -4 L 86 -4 Q 86 30 51 32 Q 16 30 16 -4 Z" fill={colors.tinta} />
        </g>
        <MapaGuardanapo x={790 + bob(3, 24)} y={1120 + bob(4, 26)} rot={-frame * 0.6} s={1.1} />
        <g transform={`translate(${770 + bob(5, 22)} ${640 + bob(6, 30)}) rotate(${frame * 0.5 + 20})`}>
          <rect x={-56} y={-60} width={112} height={120} rx={24} fill={colors.chao} stroke={colors.tinta} strokeWidth={8} />
          <rect x={-40} y={-44} width={80} height={88} rx={16} fill={colors.muro} />
        </g>
        <NicoEm x={500} y={desceY + bob(7, 26) * solto} s={0.48} centro rot={giro + bob(8, 6) * solto} pose={giro > 0 ? "flutuando" : "caindo"} expression={calmo ? "neutro" : "surpresa"} look={calmo ? [0, 0.2] : [0.3, -0.4]} />
      </Layer>
      <SeloTunel frame={frame} params={params} />
      {conquista > 0 ? (
        <Cartao x={540} y={560} w={760} h={190} s={conquista} rot={-2}>
          <path d={estrela(52)} transform="translate(-300 0)" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={8} />
          <T x={40} y={-18} size={34} fill={colors.amarelo}>CONQUISTA DESBLOQUEADA</T>
          <T x={40} y={42} size={48}>PARADO NA VIDA</T>
        </Cartao>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- ep07_globo (final)
// A Terra inteira com o túnel reto de um lado ao outro. O ponto do Nico atravessa em movimento
// harmônico (devagar nas pontas, mais rápido no centro); cronômetro até ~42 min (modelo de
// densidade uniforme; com a densidade real, ~38 min). Bilhete de R$ 0,00.
export const GloboFinal: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const t = TERRA7;
  const ida = n(params.ida);
  const chega = n(params.chega);
  const k = ramp(frame, ida, chega);
  const y = t.y - t.r * Math.cos(Math.PI * k);
  const vel = Math.sin(Math.PI * k);
  const minutos = 42 * k;
  const relogio = pop(frame, n(params.relogio));
  const nota = pop(frame, n(params.nota));
  const veloz = janela(frame, n(params.ida) + 10, Infinity);
  const bilhete = pop(frame, n(params.bilhete), true);
  const gratis = pop(frame, n(params.gratis), true);
  const chegou = pop(frame, chega, true);
  const mm = Math.floor(minutos);
  const ss = Math.floor((minutos - mm) * 60);
  return (
    <>
      <TerraTunel cam={cam} frame={frame} params={{ centro: Infinity }} />
      <Layer cam={cam} depth={1}>
        {/* rastro e Nico atravessando */}
        {k > 0 ? <rect x={t.x - 9} y={t.y - t.r} width={18} height={y - (t.y - t.r)} fill={colors.amarelo} /> : null}
        <g transform={`translate(${t.x} ${y})`}>
          {vel > 0.2 ? <path d={`M 0 -50 L 0 ${-50 - vel * 160}`} stroke={colors.creme} strokeWidth={14} strokeLinecap="round" opacity={0.8} /> : null}
          <circle r={38} fill={colors.pele} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          <path d="M -38 -4 C -40 -38 -18 -44 0 -44 C 22 -44 42 -34 38 -4 C 28 -24 0 -32 -38 -4 Z" fill={colors.cabelo} />
          <circle cx={-13} cy={6} r={6} fill={colors.tinta} />
          <circle cx={13} cy={6} r={6} fill={colors.tinta} />
        </g>
        {chegou > 0 ? (
          <g transform={`translate(${t.x + 200} ${t.y + t.r - 20}) scale(${chegou})`}>
            <rect x={-150} y={-44} width={300} height={88} rx={24} fill={colors.tinta} />
            <T x={0} y={18} size={44} fill={colors.amarelo}>OUTRO LADO</T>
          </g>
        ) : null}
      </Layer>
      {veloz > 0 && k > 0.3 ? (
        <g transform={`translate(255 ${t.y}) scale(${veloz})`}>
          <rect x={-170} y={-70} width={340} height={140} rx={26} fill={colors.tinta} />
          <T x={0} y={-16} size={28}>NO CENTRO</T>
          <T x={0} y={40} size={44} fill={colors.amarelo}>~28.000 km/h</T>
        </g>
      ) : null}
      <Cartao x={850} y={560} w={330} h={200} s={relogio} rot={2}>
        <T x={0} y={-30} size={30}>CRONÔMETRO</T>
        <T x={0} y={50} size={80} fill={colors.amarelo}>{`${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`}</T>
      </Cartao>
      {nota > 0 ? (
        <g transform={`translate(850 700) scale(${nota})`}>
          <rect x={-165} y={-30} width={330} height={60} rx={20} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
          <T x={0} y={11} size={24} fill={colors.tinta}>densidade real: ~38 min</T>
        </g>
      ) : null}
      <Cartao x={830} y={1000} w={400} h={210} s={bilhete} rot={-4} cor={colors.creme}>
        <T x={0} y={-36} size={34} fill={colors.tinta}>PASSAGEM</T>
        <T x={0} y={44} size={74} fill={colors.tinta}>R$ 0,00</T>
        {gratis > 0 ? (
          <g transform={`translate(70 -128) rotate(-10) scale(${(2 - gratis) * 0.8})`} opacity={gratis}>
            <rect x={-120} y={-44} width={240} height={88} rx={14} fill={colors.creme} stroke={colors.coral} strokeWidth={10} />
            <T x={0} y={18} size={52} fill={colors.coral}>GRÁTIS</T>
          </g>
        ) : null}
      </Cartao>
    </>
  );
};
