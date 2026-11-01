import React, { useId } from "react";
import { Easing, interpolate, spring } from "remotion";
import { colors, fonts, loopPhase, night as nightColors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { InfoLabel } from "../elements/Props";
import { useGlobalFrame, useLoopFrames } from "../GlobalFrame";
import { useInk } from "../Ink";
import { Cloud, MilkyWay, SkyFill, Stars } from "../Sky";

// Cenários do ep04 (E se todo mundo pulasse ao mesmo tempo?). Mesma paleta e mesmo traço dos
// episódios anteriores. A multidão é UMA silhueta repetida com <use> em poucas fileiras (e um
// <pattern> nas fileiras de longe / na vista de cima): a animação mexe a fileira, nunca a pessoa.
// `frame` é o frame da cena; os parâmetros vêm de `fundo` na direção, já em frames.

type Params = Record<string, number | number[]>;
const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
const arr = (v: number | number[] | undefined) => (Array.isArray(v) ? v : typeof v === "number" ? [v] : []);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;
const pop = (frame: number, at: number, bouncy = false) =>
  Number.isFinite(at) && frame >= at
    ? spring({ frame: frame - at, fps: 30, config: bouncy ? { damping: 7, mass: 0.6, stiffness: 190 } : { damping: 11, mass: 0.6, stiffness: 160 } })
    : 0;
// Pseudoaleatório determinístico
const rnd = (i: number) => {
  const a = Math.sin(i * 12.9898) * 43758.5453;
  return a - Math.floor(a);
};

// Pulo da multidão: arco (seno) entre `de` e `ate`, igual ao `pulo` dos personagens no plano
export const arcoPulo = (frame: number, de: number, ate: number, altura: number) =>
  Number.isFinite(de) ? -altura * Math.sin(Math.PI * interpolate(frame, [de, Math.max(de + 1, ate)], [0, 1], clamp)) : 0;

// Destaque circular para o Nico pequeno (inserto_pequeno: pés em 210, 1280, escala 0,4)
export const SELO = { x: 210, y: 1072, r: 226 };
const SeloNico: React.FC<{ frame: number; de: number; ate: number }> = ({ frame, de, ate }) => {
  if (!Number.isFinite(de) || frame < de || frame >= ate) return null;
  const s = pop(frame, de) * (1 - ramp(frame, ate - 6, ate));
  return (
    <g transform={`translate(${SELO.x} ${SELO.y}) scale(${s})`}>
      <circle r={SELO.r + 10} fill={colors.tinta} />
      <circle r={SELO.r} fill={colors.ceu} />
      <rect x={-SELO.r} y={150} width={SELO.r * 2} height={80} fill={colors.chao} />
      <circle r={SELO.r} fill="none" stroke={colors.tinta} strokeWidth={16} />
      <circle r={SELO.r - 14} fill="none" stroke={colors.creme} strokeWidth={5} />
    </g>
  );
};

// ---------------------------------------------------------------- silhuetas
// Adulto de frente (mais alto que o Nico): corpo num path só (sem linhas internas) + cabeça.
// `bracos`: versão com os braços para cima (pulo).
const CORPO = "M -165 -880 Q -165 -1010 -55 -1010 L 55 -1010 Q 165 -1010 165 -880 L 165 -470 L 118 -470 L 108 0 L 18 0 L 0 -380 L -18 0 L -108 0 L -118 -470 L -165 -470 Z";
const BRACOS = "M -150 -960 L -290 -1420 L -210 -1450 L -90 -1010 Z M 150 -960 L 290 -1420 L 210 -1450 L 90 -1010 Z";
const PessoaDefs: React.FC<{ id: string }> = ({ id }) => {
  const cores = [colors.noite, nightColors.predio, colors.roxo];
  return (
    <defs>
      {cores.map((c, i) => (
        <React.Fragment key={i}>
          <g id={`${id}-p${i}`}>
            <path d={CORPO} fill={c} stroke={colors.tinta} strokeWidth={22} strokeLinejoin="round" />
            <circle cy={-1120} r={115} fill={c} stroke={colors.tinta} strokeWidth={22} />
          </g>
          <g id={`${id}-b${i}`}>
            <path d={BRACOS} fill={c} stroke={colors.tinta} strokeWidth={22} strokeLinejoin="round" />
            <path d={CORPO} fill={c} stroke={colors.tinta} strokeWidth={22} strokeLinejoin="round" />
            <circle cy={-1120} r={115} fill={c} stroke={colors.tinta} strokeWidth={22} />
          </g>
        </React.Fragment>
      ))}
    </defs>
  );
};

// Fileira de silhuetas: pés na linha y, escala s, de x0 a x1 com passo `passo`; `vao` deixa um
// buraco (o Nico fica livre na frente da multidão). Uma <g> por fileira = a unidade que anima.
type Fileira = { y: number; s: number; x0: number; x1: number; passo: number; etapa: number; vao?: [number, number] };
const Fileira: React.FC<{ id: string; f: Fileira; k: number; bracos: boolean }> = ({ id, f, k, bracos }) => {
  const uses: React.ReactNode[] = [];
  let i = 0;
  for (let x = f.x0; x <= f.x1; x += f.passo, i++) {
    const jx = x + (rnd(i + k * 31) - 0.5) * f.passo * 0.5;
    if (f.vao && jx > f.vao[0] && jx < f.vao[1]) continue;
    const sv = f.s * (0.9 + rnd(i * 3 + k) * 0.18);
    const cor = Math.floor(rnd(i * 7 + k * 13) * 3);
    uses.push(<use key={i} href={`#${id}-${bracos ? "b" : "p"}${cor}`} transform={`translate(${jx} ${f.y + rnd(i + 5) * 14}) scale(${sv})`} />);
  }
  return <>{uses}</>;
};

// ---------------------------------------------------------------- quadra_dia
// Quadra de rua: céu, prédios ao fundo (parallax), alambrado, piso com as linhas da quadra e a
// tabela de basquete. Multidão (lado), em etapas:
//   `etapas` [poucos, centenas, milhares, milhões]: frames em que cada etapa entra (sobe do chão)
//   `cheia`: multidão inteira desde este frame (cenas do pulo)
//   `agacha`: todos dobram os joelhos; `pulo`/`puloAte`/`altura`: arco do pulo (braços para cima)
//   `conta`: [3, 2, 1, PULEM] frames dos números grandes; `impacto`: onda de choque no chão
const QUADRA_PISO = 1180;
const FILEIRAS: Fileira[] = [
  // longe (etapa 3 e 4 ficam atrás do alambrado, até o horizonte)
  { y: 1215, s: 0.3, x0: -2600, x1: 3700, passo: 70, etapa: 3 },
  { y: 1250, s: 0.4, x0: -2600, x1: 3700, passo: 95, etapa: 3 },
  { y: 1300, s: 0.52, x0: -2400, x1: 3500, passo: 120, etapa: 2 },
  { y: 1370, s: 0.64, x0: -2200, x1: 3300, passo: 150, etapa: 2 },
  { y: 1450, s: 0.76, x0: -1400, x1: 2500, passo: 175, etapa: 1 },
  // os primeiros vizinhos do Nico
  { y: 1540, s: 0.86, x0: 140, x1: 940, passo: 400, etapa: 0, vao: [400, 680] },
  { y: 1580, s: 0.88, x0: -1800, x1: 2900, passo: 200, etapa: 1, vao: [180, 900] },
  // perto (só aparecem com a câmera longe)
  { y: 1780, s: 0.95, x0: -2400, x1: 3500, passo: 220, etapa: 2, vao: [-40, 1120] },
  { y: 2050, s: 1.02, x0: -3000, x1: 4100, passo: 235, etapa: 3, vao: [-200, 1280] },
  { y: 2350, s: 1.08, x0: -3800, x1: 4900, passo: 250, etapa: 3, vao: [-120, 1200] },
  { y: 2700, s: 1.14, x0: -4800, x1: 5900, passo: 265, etapa: 3 },
  { y: 3100, s: 1.2, x0: -4800, x1: 5900, passo: 280, etapa: 3 },
];

export const QuadraDia: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const g = useGlobalFrame();
  const loopFrames = useLoopFrames();
  const id = useId().replace(/:/g, "");
  const loop = (base: number, speed: number) => {
    const w = 1700;
    return ((base + 300 + loopPhase(g, speed, loopFrames) * w) % w) - 300;
  };
  const etapas = arr(params.etapas);
  const cheia = n(params.cheia);
  const entra = (etapa: number) => {
    if (Number.isFinite(cheia)) return frame >= cheia ? 1 : 0;
    const at = etapas[etapa];
    return at === undefined ? 0 : spring({ frame: frame - at, fps: 30, config: { damping: 13, mass: 0.7, stiffness: 120 } }) * (frame >= at ? 1 : 0);
  };
  // milhões: faixa de cabeças até o horizonte (pattern), sobe junto com a etapa 3
  const horizonte = entra(3);
  const agacha = ramp(frame, n(params.agacha), n(params.agacha) + 8);
  const pulo = n(params.pulo);
  const puloAte = n(params.puloAte, pulo + 40);
  const altura = n(params.altura, 260);
  const noAr = Number.isFinite(pulo) && frame >= pulo - 2 && frame < puloAte;
  const conta = arr(params.conta);
  const impacto = n(params.impacto);
  return (
    <>
      <Layer cam={cam} depth={0.08}>
        <SkyFill color={colors.ceu} />
      </Layer>
      <Layer cam={cam} depth={0.15}>
        <Cloud x={loop(160, 1)} y={160} s={0.9} />
        <Cloud x={loop(980, 2)} y={90} s={0.65} />
        <Cloud x={loop(600, 1) - 1400} y={40} s={0.7} />
      </Layer>
      <Layer cam={cam} depth={0.4}>
        <Predios />
      </Layer>
      <Layer cam={cam} depth={1}>
        <PessoaDefs id={id} />
        {/* piso da quadra */}
        <rect x={-6000} y={QUADRA_PISO} width={14000} height={6000} fill={colors.chao} />
        <rect x={-6000} y={QUADRA_PISO} width={14000} height={30} fill={colors.chaoSombra} />
        <path d={`M -600 1320 L 1680 1320 M -900 1720 L 1980 1720 M 540 1320 L 540 1720`} stroke={colors.creme} strokeWidth={14} fill="none" />
        <ellipse cx={540} cy={1520} rx={260} ry={70} fill="none" stroke={colors.creme} strokeWidth={14} />
        <path d="M -300 1320 Q -200 1560 -620 1720 M 1380 1320 Q 1280 1560 1700 1720" stroke={colors.coral} strokeWidth={14} fill="none" />
        {/* alambrado (some quando chegam os milhões) */}
        <g opacity={1 - horizonte}>
          <rect x={-3000} y={1040} width={7000} height={150} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.5} />
          {Array.from({ length: 70 }, (_, i) => (
            <path key={i} d={`M ${-3000 + i * 100} 1040 L ${-3000 + i * 100} 1190`} stroke={colors.tinta} strokeWidth={ink * 0.4} />
          ))}
          <Tabela x={1180} />
        </g>
        {/* milhões até o horizonte */}
        {horizonte > 0 ? <HorizonteGente id={id} k={horizonte} /> : null}
        {/* fileiras: cada uma sobe do chão quando a etapa dela chega */}
        {FILEIRAS.map((f, k) => {
          const e = entra(f.etapa);
          if (e <= 0.001) return null;
          const dobra = 1 - 0.06 * agacha * (noAr ? 0 : 1);
          // fileiras mais perto pulam um pouco mais alto (perspectiva)
          const dy = arcoPulo(frame, pulo, puloAte, altura * f.s) + (1 - e) * 140 * f.s;
          return (
            <g key={k} opacity={Math.min(1, e * 1.4)}>
              {noAr ? <Sombras f={f} k={k} /> : null}
              <g transform={`translate(0 ${dy}) translate(0 ${f.y}) scale(1 ${dobra}) translate(0 ${-f.y})`}>
                <Fileira id={id} f={f} k={k} bracos={noAr} />
              </g>
            </g>
          );
        })}
        <Impacto frame={frame} at={impacto} />
      </Layer>
      {conta.length > 0 ? <Contagem frame={frame} conta={conta} /> : null}
    </>
  );
};

// Sombras chapadas no chão enquanto a fileira está no ar (mostra que os pés deixaram o chão)
const Sombras: React.FC<{ f: Fileira; k: number }> = ({ f, k }) => {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (let x = f.x0; x <= f.x1; x += f.passo, i++) {
    const jx = x + (rnd(i + k * 31) - 0.5) * f.passo * 0.5;
    if (f.vao && jx > f.vao[0] && jx < f.vao[1]) continue;
    out.push(<ellipse key={i} cx={jx} cy={f.y + 6} rx={130 * f.s} ry={26 * f.s} fill={colors.chaoSombra} />);
  }
  return <>{out}</>;
};

const HorizonteGente: React.FC<{ id: string; k: number }> = ({ id, k }) => (
  <g transform={`translate(0 ${(1 - k) * 60})`}>
    <defs>
      <pattern id={`${id}-cabecas`} x={0} y={1080} width={60} height={46} patternUnits="userSpaceOnUse">
        <rect width={60} height={46} fill={colors.roxo} />
        <circle cx={15} cy={14} r={11} fill={nightColors.predio} />
        <circle cx={45} cy={34} r={11} fill={colors.noite} />
        <circle cx={44} cy={10} r={8} fill={sombra(colors.roxo)} />
      </pattern>
    </defs>
    <rect x={-6000} y={1080} width={14000} height={150} fill={`url(#${id}-cabecas)`} />
    <rect x={-6000} y={1072} width={14000} height={16} fill={colors.tinta} />
  </g>
);

const Predios: React.FC = () => {
  const ink = useInk();
  const pr = [
    { x: -900, w: 300, h: 360, c: colors.muro },
    { x: -560, w: 240, h: 470, c: colors.creme },
    { x: -280, w: 330, h: 300, c: colors.coralClaro },
    { x: 90, w: 260, h: 520, c: colors.muro },
    { x: 400, w: 300, h: 380, c: colors.creme },
    { x: 740, w: 240, h: 560, c: colors.coralClaro },
    { x: 1020, w: 320, h: 330, c: colors.muro },
    { x: 1380, w: 260, h: 480, c: colors.creme },
    { x: 1680, w: 300, h: 400, c: colors.muro },
  ];
  const base = 1100;
  return (
    <g>
      {pr.map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={base - p.h} width={p.w} height={p.h + 400} fill={p.c} stroke={colors.tinta} strokeWidth={ink} />
          {Array.from({ length: Math.floor(p.h / 110) }, (_, r) =>
            [0, 1].map((c) => (
              <rect key={`${r}-${c}`} x={p.x + 40 + c * (p.w - 130)} y={base - p.h + 40 + r * 110} width={50} height={60} rx={8} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.6} />
            )),
          )}
        </g>
      ))}
      {[-700, 300, 1250].map((x, i) => (
        <circle key={i} cx={x} cy={base - 30} r={110} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
      ))}
    </g>
  );
};

const Tabela: React.FC<{ x: number }> = ({ x }) => {
  const ink = useInk();
  return (
    <g stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round">
      <rect x={x - 14} y={560} width={28} height={640} fill={colors.creme} />
      <rect x={x - 150} y={520} width={210} height={150} rx={10} fill={colors.creme} />
      <rect x={x - 100} y={580} width={100} height={70} fill="none" stroke={colors.coral} strokeWidth={ink * 0.8} />
      <ellipse cx={x - 50} cy={690} rx={70} ry={16} fill="none" stroke={colors.coral} />
    </g>
  );
};

// Onda de impacto chapada (anéis no chão), saindo do centro
const Impacto: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const ink = useInk();
  if (!Number.isFinite(at) || frame < at || frame > at + 30) return null;
  const t = (frame - at) / 30;
  return (
    <g>
      {[0, 0.25].map((d, i) => {
        const k = Math.max(0, t - d) / (1 - d);
        if (k <= 0 || k >= 1) return null;
        return <ellipse key={i} cx={540} cy={1600} rx={200 + k * 2600} ry={40 + k * 520} fill="none" stroke={colors.amarelo} strokeWidth={ink * 2.2 * (1 - k)} />;
      })}
    </g>
  );
};

// Contagem 3, 2, 1, PULEM em tela (números grandes com mola)
const Contagem: React.FC<{ frame: number; conta: number[] }> = ({ frame, conta }) => {
  const itens = ["3", "2", "1", "PULEM!"];
  let idx = -1;
  conta.forEach((c, i) => {
    if (frame >= c) idx = i;
  });
  if (idx < 0) return null;
  const at = conta[idx];
  const fim = idx === 3 ? at + 34 : conta[idx + 1] ?? at + 30;
  if (frame >= fim) return null;
  const s = pop(frame, at, true) * (1 - ramp(frame, fim - 5, fim));
  const ultimo = idx === 3;
  const size = ultimo ? 230 : 420;
  return (
    <g transform={`translate(540 ${ultimo ? 330 : 330}) scale(${s}) rotate(${ultimo ? -4 : 0})`}>
      <text
        x={0}
        y={size * 0.35}
        textAnchor="middle"
        fontFamily={fonts.main}
        fontWeight={fonts.weight}
        fontSize={size}
        fill={ultimo ? colors.coral : colors.creme}
        stroke={colors.tinta}
        strokeWidth={30}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {itens[idx]}
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- multidao_vista_de_cima
// Vista aérea de uma cidade genérica (quadras, ruas, árvores). Cabeças vistas de cima num
// <pattern>; a multidão chega pelos quatro lados (`chega` -> `chegaAte`) e cobre a área
// AREA. `contorno`: tracejado + rótulo "≈ LOS ANGELES" em volta da área;
// `contador`/`contadorAte`: número gigante subindo até 287.000.000 TONELADAS.
// `selo`/`seloAte`: destaque circular do Nico pequeno.
export const AREA = { x: -700, y: -500, w: 2480, h: 2900 };
export const MultidaoCima: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const chega = n(params.chega);
  const k = Number.isFinite(chega) ? ramp(frame, chega, n(params.chegaAte, chega + 60), { ...clamp, easing: Easing.out(Easing.cubic) }) : n(params.cheia) <= frame ? 1 : 0;
  const contorno = n(params.contorno);
  const ck = ramp(frame, contorno, contorno + 20);
  const a = AREA;
  // a multidão entra pelos 4 lados: 4 retângulos que crescem para o centro
  const half = { w: a.w / 2, h: a.h / 2 };
  return (
    <>
      <Layer cam={cam} depth={1}>
        <defs>
          <pattern id={`${id}-gente`} x={0} y={0} width={96} height={88} patternUnits="userSpaceOnUse">
            <rect width={96} height={88} fill={colors.roxo} />
            {[
              [22, 20, colors.noite],
              [70, 30, nightColors.predio],
              [44, 66, colors.noite],
            ].map(([x, y, c], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <ellipse rx={20} ry={12} fill={c as string} />
                <circle r={10} fill={colors.tinta} />
              </g>
            ))}
          </pattern>
        </defs>
        <Cidade />
        {k > 0 ? (
          <g fill={`url(#${id}-gente)`}>
            <rect x={a.x} y={a.y} width={a.w} height={half.h * k} />
            <rect x={a.x} y={a.y + a.h - half.h * k} width={a.w} height={half.h * k} />
            <rect x={a.x} y={a.y} width={half.w * k} height={a.h} />
            <rect x={a.x + a.w - half.w * k} y={a.y} width={half.w * k} height={a.h} />
          </g>
        ) : null}
        {ck > 0 ? (
          <g opacity={ck}>
            <rect x={a.x - 40} y={a.y - 40} width={a.w + 80} height={a.h + 80} rx={60} fill="none" stroke={colors.amarelo} strokeWidth={ink * 2.4} strokeDasharray={`${ink * 5} ${ink * 3}`} />
            <InfoLabel x={a.x + a.w / 2} y={a.y - 40} text="≈ LOS ANGELES" fontSize={64 / Math.max(0.3, cam.zoom)} />
          </g>
        ) : null}
      </Layer>
      <Contador frame={frame} de={n(params.contador)} ate={n(params.contadorAte)} some={n(params.contadorSome)} />
      <SeloNico frame={frame} de={n(params.selo)} ate={n(params.seloAte)} />
    </>
  );
};

const Cidade: React.FC = () => {
  const ink = useInk();
  const blocos: React.ReactNode[] = [];
  const Q = 420; // quadra + rua
  for (let r = -8; r < 13; r++) {
    for (let c = -7; c < 10; c++) {
      const i = (r + 20) * 40 + c;
      const x = c * Q + 40;
      const y = r * Q + 40;
      const tipo = rnd(i);
      if (tipo < 0.12) {
        blocos.push(<rect key={i} x={x} y={y} width={Q - 80} height={Q - 80} rx={30} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink * 0.7} />);
        blocos.push(<circle key={`${i}a`} cx={x + 100} cy={y + 110} r={60} fill={colors.folhaSombra} />);
        blocos.push(<circle key={`${i}b`} cx={x + 230} cy={y + 220} r={70} fill={colors.folhaSombra} />);
        continue;
      }
      const cor = [colors.creme, colors.muro, colors.coralClaro, colors.amarelo][Math.floor(rnd(i * 5) * 4)];
      blocos.push(<rect key={i} x={x} y={y} width={Q - 80} height={Q - 80} rx={14} fill={sombra(cor)} stroke={colors.tinta} strokeWidth={ink * 0.7} />);
      blocos.push(<rect key={`${i}t`} x={x + 30} y={y + 30} width={Q - 170} height={Q - 170} rx={10} fill={cor} />);
    }
  }
  return (
    <g>
      <rect x={-5000} y={-5000} width={12000} height={12000} fill={colors.chaoSombra} />
      {blocos}
    </g>
  );
};

// Número gigante (tela) contando até 287.000.000 + "TONELADAS"
const Contador: React.FC<{ frame: number; de: number; ate: number; some: number }> = ({ frame, de, ate, some }) => {
  if (!Number.isFinite(de) || frame < de || frame >= some) return null;
  const t = ramp(frame, de, ate, { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = Math.round(287_000_000 * t);
  const txt = v.toLocaleString("pt-BR").replace(/,/g, ".");
  const s = pop(frame, de) * (1 - ramp(frame, some - 6, some));
  return (
    <g transform={`translate(540 600) scale(${s})`}>
      <rect x={-500} y={-190} width={1000} height={380} rx={40} fill={colors.tinta} />
      <rect x={-484} y={-174} width={968} height={348} rx={30} fill="none" stroke={colors.creme} strokeWidth={5} />
      <text x={0} y={30} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={150} fill={colors.amarelo} style={{ fontVariantNumeric: "tabular-nums" }}>
        {txt}
      </text>
      <text x={0} y={130} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={84} fill={colors.creme}>
        TONELADAS
      </text>
    </g>
  );
};

// ---------------------------------------------------------------- balanca_terra
// Balança gigante no espaço. Prato esquerdo: a humanidade (pilha de silhuetas); prato direito:
// vazio até a Terra cair nele (`terra`). `pesa`: a pilha faz o braço descer um pouco à esquerda
// (parece pesada); com a Terra, o braço gira com mola até o prato direito bater no chão e a
// pilha disparar para o alto, encolhendo até virar pontos (`pontos`).
export const BALANCA = { x: 540, y: 820, braco: 380, corda: 360, chao: 1560 };
export const BalancaTerra: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const b = BALANCA;
  const terra = n(params.terra);
  const pesa = ramp(frame, n(params.pesa), n(params.pesa) + 20, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const queda = Number.isFinite(terra) && frame >= terra ? spring({ frame: frame - terra, fps: 30, config: { damping: 8, mass: 0.8, stiffness: 120 } }) : 0;
  const maxAng = (Math.asin((b.chao - 140 - b.y - b.corda) / b.braco) * 180) / Math.PI;
  const ang = -7 * pesa * (1 - Math.min(1, queda)) + maxAng * queda; // + = prato direito desce
  const rad = (ang * Math.PI) / 180;
  const ptE = { x: b.x - b.braco * Math.cos(rad), y: b.y - b.braco * Math.sin(rad) };
  const ptD = { x: b.x + b.braco * Math.cos(rad), y: b.y + b.braco * Math.sin(rad) };
  const pratoE = { x: ptE.x, y: ptE.y + b.corda };
  const pratoD = { x: ptD.x, y: ptD.y + b.corda };
  // a Terra cai de cima até o prato
  const terraY = Number.isFinite(terra) ? interpolate(frame, [terra - 14, terra], [-700, pratoD.y - 250], { ...clamp, easing: Easing.in(Easing.quad) }) : -2000;
  const pontos = ramp(frame, n(params.pontos), n(params.pontos) + 30, { ...clamp, easing: Easing.inOut(Easing.quad) });
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <PessoaDefs id={id} />
        {/* base */}
        <rect x={-2000} y={b.chao} width={5000} height={2000} fill={sombra(colors.noite)} />
        <rect x={-2000} y={b.chao} width={5000} height={22} fill={colors.tinta} />
        <path d={`M ${b.x - 150} ${b.chao} L ${b.x} ${b.y + 40} L ${b.x + 150} ${b.chao} Z`} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        {/* braço */}
        <g transform={`rotate(${ang} ${b.x} ${b.y})`}>
          <rect x={b.x - b.braco - 20} y={b.y - 22} width={b.braco * 2 + 40} height={44} rx={22} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} />
        </g>
        <circle cx={b.x} cy={b.y} r={44} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
        {[
          [ptE, pratoE],
          [ptD, pratoD],
        ].map(([p, q], i) => (
          <g key={i}>
            <path d={`M ${p.x} ${p.y} L ${q.x - 170} ${q.y} M ${p.x} ${p.y} L ${q.x + 170} ${q.y}`} stroke={colors.tinta} strokeWidth={ink * 0.6} />
            <path d={`M ${q.x - 200} ${q.y} L ${q.x + 200} ${q.y} Q ${q.x + 170} ${q.y + 70} ${q.x} ${q.y + 70} Q ${q.x - 170} ${q.y + 70} ${q.x - 200} ${q.y} Z`} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
          </g>
        ))}
        {/* a humanidade: pilha de silhuetas que vira um punhado de pontos */}
        <g transform={`translate(${pratoE.x} ${pratoE.y}) scale(${1 - 0.86 * pontos})`}>
          {[
            [-120, 0, 0.16],
            [0, 0, 0.17],
            [120, 0, 0.16],
            [-60, -150, 0.15],
            [60, -150, 0.15],
            [0, -290, 0.14],
          ].map(([x, y, s], i) => (
            <use key={i} href={`#${id}-p${i % 3}`} transform={`translate(${x} ${y}) scale(${s})`} />
          ))}
        </g>
        {pontos > 0.5 ? <InfoLabel x={pratoE.x} y={pratoE.y - 170} text="humanidade" fontSize={52} s={ramp(frame, n(params.pontos) + 15, n(params.pontos) + 25)} /> : null}
        {/* a Terra */}
        <Globe x={pratoD.x} y={terraY} r={250} lon={-40 - frame * 0.5} />
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- espaco_terra
// A Terra no espaço (mesmas peças do diagrama_espaco: céu noite, Via Láctea, estrelas e o globo).
// A Terra NUNCA sai do lugar: o "recuo" é só uma seta minúscula com marcação de referência.
//   `gente`: silhuetas surgem em volta do planeta; `pulam`: elas sobem um pouco (o pulo)
//   `recua`: linha de referência + seta mínima para baixo + rótulo; `volta`: a seta some e o
//   rótulo vira "posição original"; `ponto`: frame em que o ponto de deslocamento ganha anel
export const TERRA = { x: 540, y: 760, r: 300 };
export const EspacoTerra: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const t = TERRA;
  const gente = pop(frame, n(params.gente));
  const pulam = arcoPulo(frame, n(params.pulam), n(params.pulamAte, n(params.pulam) + 60), 60);
  const recua = n(params.recua);
  const volta = n(params.volta);
  const rk = pop(frame, recua) * (1 - ramp(frame, volta, volta + 10));
  const vk = pop(frame, volta);
  // anel de silhuetas em volta do planeta (gira junto, devagar)
  const N = 28;
  const giro = frame * 0.12;
  return (
    <>
      <Layer cam={cam} depth={0.1}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={frame} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <PessoaDefs id={id} />
        {gente > 0.01 ? (
          <g transform={`rotate(${giro} ${t.x} ${t.y})`}>
            {Array.from({ length: N }, (_, i) => {
              const a = (i / N) * 360;
              const s = 0.075 * gente * (0.85 + rnd(i) * 0.3);
              return (
                <g key={i} transform={`rotate(${a} ${t.x} ${t.y}) translate(${t.x} ${t.y - t.r + 6 + pulam}) scale(${s})`}>
                  <use href={`#${id}-${Number.isFinite(n(params.pulam)) && frame >= n(params.pulam) ? "b" : "p"}${i % 3}`} />
                </g>
              );
            })}
          </g>
        ) : null}
        <Globe x={t.x} y={t.y} r={t.r} lon={-60 - frame * 0.35} />
        {/* referência: linha tracejada na posição original e seta mínima */}
        {rk > 0.01 || vk > 0.01 ? (
          <g>
            <path d={`M ${t.x - t.r - 120} ${t.y + t.r} L ${t.x + t.r + 120} ${t.y + t.r}`} stroke={colors.amarelo} strokeWidth={ink * 0.8} strokeDasharray={`${ink * 2} ${ink * 1.4}`} opacity={Math.max(rk, vk)} />
            {rk > 0.01 ? (
              <g transform={`translate(${t.x + t.r + 60} ${t.y + t.r}) scale(${rk})`}>
                <path d="M 0 4 L 0 14" stroke={colors.coral} strokeWidth={6} strokeLinecap="round" />
                <path d="M -7 12 L 0 20 L 7 12" fill="none" stroke={colors.coral} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                <circle r={46} cy={12} fill="none" stroke={colors.creme} strokeWidth={6} />
              </g>
            ) : null}
            {rk > 0.01 ? <InfoLabel x={t.x + t.r - 120} y={t.y + t.r + 110} text="recuo (quase nada)" fontSize={50} s={rk} /> : null}
            {vk > 0.01 ? <InfoLabel x={t.x} y={t.y + t.r + 110} text="posição original" fontSize={56} s={vk} /> : null}
          </g>
        ) : null}
      </Layer>
      <SeloNico frame={frame} de={n(params.selo)} ate={n(params.seloAte)} />
    </>
  );
};
// Ponto da seta (para a câmera aproximar)
export const PONTO_RECUO = { x: TERRA.x + TERRA.r + 60, y: TERRA.y + TERRA.r + 12 };

// ---------------------------------------------------------------- escala_comparacao
// Zoom microscópico, em ordem decrescente de tamanho: fio de cabelo -> espessura do fio (rede de
// átomos) -> um átomo, com a seta do recuo da Terra ao lado, bem menor que ele.
// `de`: começo (fio inteiro); `fio`: o fio ganha rótulo; `mergulho`: zoom para dentro do fio;
// `atomo`: o átomo aparece grande; `seta`: a seta mínima e o rótulo.
export const EscalaComparacao: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const mergulho = n(params.mergulho);
  const atomo = n(params.atomo);
  // zoom exponencial contínuo (sem câmera: o desenho é que cresce)
  const z1 = ramp(frame, mergulho, atomo, { ...clamp, easing: Easing.in(Easing.cubic) });
  const zoomFio = Math.exp(z1 * Math.log(60)) * (1 + 0.12 * ramp(frame, n(params.de), mergulho));
  const ak = pop(frame, atomo);
  const fioK = pop(frame, n(params.fio));
  const setaK = pop(frame, n(params.seta), true);
  const showFio = !(Number.isFinite(atomo) && frame >= atomo);
  return (
    <>
      <rect x={-200} y={-200} width={1480} height={2320} fill={colors.creme} />
      {/* grade de "microscópio" */}
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M ${i * 100} 0 L ${i * 100} 1920 M 0 ${i * 180} L 1080 ${i * 180}`} stroke={colors.chao} strokeWidth={4} />
      ))}
      {showFio ? (
        <g transform={`translate(540 860) scale(${zoomFio}) translate(-540 -860)`}>
          {/* o fio: faixa diagonal com escamas chapadas */}
          <g transform="rotate(-24 540 860)">
            <rect x={-900} y={800} width={2900} height={120} fill={colors.tinta} />
            <rect x={-900} y={812} width={2900} height={26} fill={sombra(colors.noite)} />
            {Array.from({ length: 50 }, (_, i) => (
              <path key={i} d={`M ${-900 + i * 60} 800 Q ${-870 + i * 60} 860 ${-900 + i * 60} 920`} stroke={colors.noite} strokeWidth={6} fill="none" />
            ))}
            {/* rede de átomos dentro da espessura (só aparece com o zoom) */}
            {z1 > 0.35
              ? Array.from({ length: 7 }, (_, r) =>
                  Array.from({ length: 9 }, (_, c) => <circle key={`${r}-${c}`} cx={510 + c * 8} cy={836 + r * 8} r={2.6} fill={colors.turquesa} />),
                )
              : null}
          </g>
        </g>
      ) : null}
      {showFio && fioK > 0 && z1 < 0.3 ? <InfoLabel x={540} y={1130} text="fio de cabelo" s={fioK * (1 - z1 / 0.3)} /> : null}
      {!showFio ? (
        <g transform={`translate(540 800) scale(${ak})`}>
          <ellipse rx={330} ry={110} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} transform="rotate(30)" />
          <ellipse rx={330} ry={110} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} transform="rotate(-30)" />
          <ellipse rx={330} ry={110} fill="none" stroke={colors.tinta} strokeWidth={ink * 0.7} transform="rotate(90)" />
          <circle r={70} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
          {[30, 150, 270].map((a, i) => {
            const ang = ((a + frame * 4) * Math.PI) / 180;
            const rot = [30, -30, 90][i];
            const x = 330 * Math.cos(ang);
            const y = 110 * Math.sin(ang);
            const rr = (rot * Math.PI) / 180;
            return <circle key={i} cx={x * Math.cos(rr) - y * Math.sin(rr)} cy={x * Math.sin(rr) + y * Math.cos(rr)} r={26} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink * 0.6} />;
          })}
        </g>
      ) : null}
      {!showFio && ak > 0.5 ? <InfoLabel x={540} y={330} text="1 átomo" s={ak} /> : null}
      {setaK > 0.01 ? (
        <g>
          {/* seta do recuo: 1/100 da largura do átomo (660 px -> ~6 px), com anel de destaque */}
          <g transform="translate(930 1180)">
            <path d="M 0 -3 L 0 3" stroke={colors.coral} strokeWidth={6} strokeLinecap="round" />
            <circle r={40 * setaK} fill="none" stroke={colors.coral} strokeWidth={6} />
            <path d={`M -40 -40 L -150 -150`} stroke={colors.tinta} strokeWidth={6} opacity={setaK} />
          </g>
          <InfoLabel x={700} y={1250} text="recuo da Terra" fontSize={50} s={setaK} />
        </g>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- sismografo
// Inserto: tambor de papel rolando, agulha traçando. `tremor`: frame do pouso (rabisco pequeno
// que volta à linha reta em ~20 frames).
export const Sismografo: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ frame, params }) => {
  const ink = useInk();
  const tremor = n(params.tremor);
  const agulhaX = 760;
  const yBase = 900;
  const amp = (f: number) => {
    if (!Number.isFinite(tremor) || f < tremor) return 0;
    const t = f - tremor;
    return 70 * Math.exp(-t / 6) * Math.sin(t * 2.4);
  };
  // traço: cada frame passado vira um ponto à esquerda da agulha (12 px por frame)
  const pts: string[] = [];
  for (let k = 0; k <= 70; k++) {
    const f = frame - k;
    pts.push(`${agulhaX - k * 12} ${yBase - amp(f) + Math.sin(f * 1.7) * 2}`);
  }
  const y = yBase - amp(frame);
  return (
    <>
      <rect x={-200} y={-200} width={1480} height={2320} fill={colors.muro} />
      <rect x={60} y={560} width={960} height={680} rx={40} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M 60 ${620 + i * 70} L 1020 ${620 + i * 70}`} stroke={colors.chao} strokeWidth={4} />
      ))}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 60 + ((i * 80 - frame * 12) % 960 + 960) % 960;
        return <path key={i} d={`M ${x} 560 L ${x} 1240`} stroke={colors.chao} strokeWidth={4} />;
      })}
      <path d={`M ${pts.join(" L ")}`} fill="none" stroke={colors.coral} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" />
      {/* braço da agulha */}
      <path d={`M ${agulhaX} ${y} L 1000 ${y - 300}`} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" />
      <circle cx={agulhaX} cy={y} r={14} fill={colors.tinta} />
      <circle cx={1000} cy={y - 300} r={30} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <InfoLabel x={540} y={470} text="SISMÓGRAFO" />
    </>
  );
};
