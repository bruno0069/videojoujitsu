import React from "react";
import { Easing, interpolate } from "remotion";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { SkyFill } from "../Sky";
import { CANT, Cantina, Lata } from "./Ep08";
import { clamp, n, NicoEm, on, pop, ramp, T } from "./Ep07";

// Cenários da v2 do ep08 (episódio 7: E se você ficasse uma semana sem açúcar?). Reaproveita a
// cantina da v1 e acrescenta: o calendário de 7 quadradinhos no topo (recorrente), o exame do
// gancho, o prato da apresentação, o colega que passa pela vitrine e o painel liso das cenas de
// estudo (pictograma de 43 bolinhas, cartões de exame, colunas de dose e o pote das promessas).
// Tudo chapado, sem degradê, desfoque ou filtro; nenhuma marca. Textos obrigatórios dentro da zona
// segura (y entre 12% e 72%, margem lateral de 90 px), fonte de pelo menos 38 px.

type Params = Record<string, number | number[]>;

// ---------------------------------------------------------------- textos de apoio (zona segura)
// Linhas de rodapé (38–40 px) numa placa de tinta; `y` é o centro da primeira linha
export const PlacaLinhas: React.FC<{ linhas: string[]; y: number; s?: number; cor?: string; tinta?: string; size?: number }> = ({
  linhas,
  y,
  s = 1,
  cor = colors.tinta,
  tinta = colors.creme,
  size = 38,
}) => {
  if (s <= 0) return null;
  const h = size * 1.25;
  const w = Math.min(900, Math.max(...linhas.map((l) => l.length)) * size * 0.58 + 56);
  return (
    <g transform={`translate(540 ${y}) scale(${s}) translate(-540 ${-y})`}>
      <rect x={540 - w / 2} y={y - h / 2 - 8} width={w} height={h * linhas.length + 16} rx={18} fill={cor} />
      {linhas.map((l, i) => (
        <T key={i} x={540} y={y + i * h + size * 0.36} size={size} fill={tinta}>
          {l}
        </T>
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- calendário de 7 quadradinhos
// `calDe`/`calAte`: aparece e some; `calBase`: quantos já estão riscados ao entrar na cena;
// `risca`: o próximo é riscado (com a caneta, na cena 2); `calZera`: todos voltam a ficar limpos
export const CAL = { y: 505, lado: 66, gap: 18 };
export const CalendarioTopo: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const de = n(params.calDe);
  if (!on(frame, de) || on(frame, n(params.calAte))) return null;
  const s = pop(frame, de) * (1 - ramp(frame, n(params.calAte) - 6, n(params.calAte)));
  const base = n(params.calBase, 0);
  const risca = n(params.risca);
  const zera = on(frame, n(params.calZera));
  const largura = 7 * CAL.lado + 6 * CAL.gap;
  const x0 = 540 - largura / 2;
  const caneta = params.caneta === 1 && on(frame, risca - 10) && frame < risca + 16;
  return (
    <g transform={`translate(540 ${CAL.y}) scale(${s}) translate(-540 ${-CAL.y})`}>
      <rect x={x0 - 20} y={CAL.y - CAL.lado / 2 - 14} width={largura + 40} height={CAL.lado + 28} rx={18} fill={colors.tinta} />
      {Array.from({ length: 7 }, (_, i) => {
        const x = x0 + i * (CAL.lado + CAL.gap);
        const riscado = !zera && (i < base || (i === base && on(frame, risca)));
        const k = i === base ? ramp(frame, risca, risca + 8) : 1;
        return (
          <g key={i}>
            <rect x={x} y={CAL.y - CAL.lado / 2} width={CAL.lado} height={CAL.lado} rx={10} fill={riscado ? colors.amarelo : colors.creme} stroke={colors.creme} strokeWidth={3} />
            {riscado ? (
              <path
                d={`M ${x + 14} ${CAL.y - 18} L ${x + 14 + 38 * Math.min(1, k * 2)} ${CAL.y - 18 + 36 * Math.min(1, k * 2)} ${k > 0.5 ? `M ${x + 52} ${CAL.y - 18} L ${x + 52 - 38 * (k - 0.5) * 2} ${CAL.y - 18 + 36 * (k - 0.5) * 2}` : ""}`}
                stroke={colors.coral}
                strokeWidth={10}
                strokeLinecap="round"
                fill="none"
              />
            ) : null}
          </g>
        );
      })}
      {caneta ? (
        <g transform={`translate(${x0 + base * (CAL.lado + CAL.gap) + 60 - 30 * ramp(frame, risca, risca + 8)} ${CAL.y + 10}) rotate(35)`}>
          <rect x={-10} y={-90} width={20} height={90} rx={6} fill={colors.coral} stroke={colors.tinta} strokeWidth={5} />
          <path d="M -10 0 L 10 0 L 0 20 Z" fill={colors.tinta} />
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- props
const Prato: React.FC<{ s: number; fruta?: boolean }> = ({ s, fruta = true }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={-10} rx={110} ry={34} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
    <path d="M -70 -24 Q -40 -70 0 -46 Q 10 -36 0 -24 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
    <path d="M 0 -24 Q 20 -66 66 -40 Q 70 -30 60 -24 Z" fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={6} />
    {fruta ? (
      <g transform="translate(130 -30)">
        <circle r={30} fill={colors.coral} stroke={colors.tinta} strokeWidth={6} />
        <path d="M 0 -26 L 4 -42" stroke={colors.tinta} strokeWidth={6} strokeLinecap="round" />
      </g>
    ) : null}
  </g>
);
const Relogio: React.FC<{ voltas: number; s: number }> = ({ voltas, s }) => (
  <g transform={`scale(${s})`}>
    <circle r={60} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
    <path d={`M 0 0 L 0 -44`} transform={`rotate(${voltas * 360})`} stroke={colors.coral} strokeWidth={8} strokeLinecap="round" />
    <path d={`M 0 0 L 26 0`} transform={`rotate(${(voltas * 360) / 12})`} stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
    <rect x={-50} y={56} width={22} height={18} rx={6} fill={colors.tinta} />
    <rect x={28} y={56} width={22} height={18} rx={6} fill={colors.tinta} />
  </g>
);
// Exame: papel com 3 barras; em `baixa` elas descem um degrau
export const Exame: React.FC<{ frame: number; baixa: number }> = ({ frame, baixa }) => {
  const k = ramp(frame, baixa, baixa + 10, { ...clamp, easing: Easing.out(Easing.back(1.6)) });
  const cores = [colors.coral, colors.amarelo, colors.turquesa];
  return (
    <g>
      <rect x={-140} y={-330} width={280} height={330} rx={12} fill={colors.branco} stroke={colors.tinta} strokeWidth={9} />
      <rect x={-110} y={-300} width={120} height={18} rx={9} fill={colors.chaoSombra} />
      {cores.map((c, i) => {
        const cheio = 200;
        const w = cheio - 60 * k;
        return (
          <g key={i}>
            <rect x={-110} y={-250 + i * 80} width={220} height={44} rx={10} fill={colors.creme} stroke={colors.tinta} strokeWidth={5} />
            <rect x={-104} y={-244 + i * 80} width={w} height={32} rx={8} fill={c} />
          </g>
        );
      })}
    </g>
  );
};
// Colega: silhueta chapada (a mesma pessoa genérica da cantina, em escala de aluno), sem rosto
const Colega: React.FC<{ x: number; y: number; s: number; passo: number }> = ({ x, y, s, passo }) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(passo)) * 10}) scale(${s})`}>
    <use href="#cant-p2" />
  </g>
);

// ---------------------------------------------------------------- cantina da v2
// Parâmetros próprios (além dos da cantina da v1): `exame` (papel no balcão), `relogio`/`relogioAte`
// (9 voltas), `baixa` (as barras descem), `prato` (prato com "=" ao lado), `extra` (placa de apoio),
// `pratoNovo` (arroz com feijão e fruta na bandeja), `colega`/`colegaAte` (silhueta passa pela vitrine)
export const CantinaV2: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const B = CANT.balcao;
  const exame = pop(frame, n(params.exame));
  const voltas = 9 * ramp(frame, n(params.relogio), n(params.relogioAte), { ...clamp, easing: Easing.inOut(Easing.quad) });
  const relogio = pop(frame, n(params.relogio) - 4);
  const prato = pop(frame, n(params.prato), true);
  const igual = pop(frame, n(params.prato) + 8, true);
  const pratoNovo = pop(frame, n(params.pratoNovo), true);
  const colegaDe = n(params.colega);
  const colegaK = ramp(frame, colegaDe, n(params.colegaAte, colegaDe + 60));
  const extra = pop(frame, n(params.extra));
  return (
    <>
      <Cantina cam={cam} frame={frame} params={params} />
      <Layer cam={cam} depth={1}>
        {exame > 0 ? (
          <g transform={`translate(760 ${B - 10}) rotate(-4) scale(${exame})`}>
            <Exame frame={frame} baixa={n(params.baixa)} />
          </g>
        ) : null}
        {relogio > 0 ? (
          <g transform={`translate(540 ${B - 80})`}>
            <Relogio voltas={voltas} s={relogio} />
          </g>
        ) : null}
        {prato > 0 ? (
          <g transform={`translate(960 ${B - 10})`}>
            <Prato s={0.62 * prato} fruta={false} />
            <g transform={`translate(0 -150) scale(${igual})`}>
              <circle r={52} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={8} />
              <path d="M -24 -10 L 24 -10 M -24 12 L 24 12" stroke={colors.tinta} strokeWidth={10} strokeLinecap="round" />
            </g>
          </g>
        ) : null}
        {pratoNovo > 0 ? (
          <g transform={`translate(560 ${B - 6}) scale(${pratoNovo})`}>
            <Prato s={0.7} />
          </g>
        ) : null}
        {Number.isFinite(colegaDe) && on(frame, colegaDe) && colegaK < 1 ? (
          <Colega x={interpolate(colegaK, [0, 1], [1250, 560])} y={CANT.chao} s={0.42} passo={frame / 4} />
        ) : null}
      </Layer>
      <PlacaLinhas linhas={["9 DIAS · MESMAS CALORIAS", "PESO QUASE IGUAL"]} y={1205} s={extra} />
      <CalendarioTopo frame={frame} params={params} />
    </>
  );
};

// ---------------------------------------------------------------- painel_liso
const Fundo: React.FC<{ cam: Cam }> = ({ cam }) => (
  <Layer cam={cam} depth={0.3}>
    <SkyFill color={colors.creme} />
    {Array.from({ length: 24 }, (_, i) => (
      <path key={`v${i}`} d={`M ${-400 + i * 90} -400 L ${-400 + i * 90} 2400`} stroke={colors.chaoSombra} strokeWidth={3} opacity={0.35} />
    ))}
    {Array.from({ length: 32 }, (_, i) => (
      <path key={`h${i}`} d={`M -400 ${-400 + i * 90} L 1600 ${-400 + i * 90}`} stroke={colors.chaoSombra} strokeWidth={3} opacity={0.35} />
    ))}
  </Layer>
);
const NicoCanto: React.FC<{ x: number; y: number; s: number; expression: string; pose?: string; look?: [number, number] }> = ({ x, y, s, expression, pose = "parado", look }) => (
  <NicoEm x={x} y={y} s={s} pose={pose} expression={expression} look={look} />
);

// a) estudo: 43 bolinhas, bandeja que troca açúcar por amido, balança "=", régua de 9 dias
const Doce: React.FC = () => (
  <g>
    <path d="M -40 10 L -30 44 L 30 44 L 40 10 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={0} cy={-6} r={38} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={7} />
  </g>
);
const Arroz: React.FC = () => (
  <g>
    <path d="M -54 0 Q 0 64 54 0 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={7} />
    <path d="M -50 0 Q -30 -40 0 -36 Q 30 -40 50 0 Z" fill={colors.branco} stroke={colors.tinta} strokeWidth={6} />
  </g>
);
const Fatia: React.FC = () => (
  <g>
    <path d="M -46 44 L -46 -12 Q -68 -30 -52 -52 Q -34 -72 0 -60 Q 34 -72 52 -52 Q 68 -30 46 -12 L 46 44 Z" fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -32 32 L -32 -8 Q -48 -24 -36 -38 Q -22 -50 0 -42 Q 22 -50 36 -38 Q 48 -24 32 -8 L 32 32 Z" fill={colors.creme} />
  </g>
);
const Estudo: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const acende = n(params.bolinhas);
  const troca = n(params.troca);
  const k = ramp(frame, troca, troca + 18, { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const balanca = pop(frame, n(params.balanca), true);
  const regua = n(params.regua);
  const bandeja = pop(frame, n(params.bandeja));
  return (
    <g>
      {Array.from({ length: 43 }, (_, i) => {
        const col = i % 9;
        const lin = Math.floor(i / 9);
        const x = 232 + col * 77;
        const y = 600 + lin * 62;
        const aceso = on(frame, acende + i);
        const s = pop(frame, n(params.grade) + (i % 9));
        return s > 0 ? <circle key={i} cx={x} cy={y} r={24 * s} fill={aceso ? colors.turquesa : colors.chaoSombra} stroke={colors.tinta} strokeWidth={5} /> : null;
      })}
      {bandeja > 0 ? (
        <g transform={`translate(0 ${(1 - bandeja) * 60})`} opacity={Math.min(1, bandeja * 1.5)}>
          <rect x={250} y={1000} width={500} height={34} rx={17} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={8} />
          {/* saem pela esquerda: doce e lata genérica */}
          <g transform={`translate(${380 - k * 420} 990)`} opacity={1 - k}>
            <Doce />
          </g>
          <g transform={`translate(${500 - k * 420} 1000)`} opacity={1 - k}>
            <Lata x={0} y={0} s={0.55} />
          </g>
          {/* entram pela direita: arroz e pão */}
          <g transform={`translate(${380 + (1 - k) * 600} 990)`} opacity={k}>
            <Arroz />
          </g>
          <g transform={`translate(${560 + (1 - k) * 600} 966)`} opacity={k}>
            <Fatia />
          </g>
        </g>
      ) : null}
      {balanca > 0 ? (
        <g transform={`translate(880 960) scale(${balanca})`}>
          <path d="M 0 -70 L 0 60 M -40 60 L 40 60" stroke={colors.tinta} strokeWidth={10} strokeLinecap="round" />
          <path d="M -90 -60 L 90 -60" stroke={colors.tinta} strokeWidth={10} strokeLinecap="round" />
          {[-90, 90].map((x) => (
            <path key={x} d={`M ${x - 40} -20 Q ${x} 10 ${x + 40} -20 Z M ${x} -60 L ${x - 34} -20 M ${x} -60 L ${x + 34} -20`} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
          ))}
          <circle cx={0} cy={-120} r={40} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={7} />
          <path d="M -18 -128 L 18 -128 M -18 -112 L 18 -112" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
        </g>
      ) : null}
      {Number.isFinite(regua) && on(frame, regua - 10)
        ? Array.from({ length: 9 }, (_, i) => {
            const x = 330 + i * 52;
            const r = on(frame, regua + i * 3);
            return (
              <g key={i} transform={`translate(${x} 1110) scale(${pop(frame, regua - 10 + i)})`}>
                <rect x={-20} y={-20} width={40} height={40} rx={8} fill={r ? colors.amarelo : colors.creme} stroke={colors.tinta} strokeWidth={5} />
                {r ? <path d="M -10 -10 L 10 10 M 10 -10 L -10 10" stroke={colors.coral} strokeWidth={6} strokeLinecap="round" /> : null}
              </g>
            );
          })
        : null}
    </g>
  );
};

// b) resultado: três cartões com barra que desce e número contando de 0 ao valor
const Cartao: React.FC<{ y: number; s: number; rotulo: string; desce: number; frac: number; numero: (k: number) => string; frame: number; conta: number }> = ({
  y,
  s,
  rotulo,
  desce,
  frac,
  numero,
  frame,
  conta,
}) => {
  if (s <= 0) return null;
  const k = ramp(frame, desce, desce + 10, { ...clamp, easing: Easing.out(Easing.back(1.8)) });
  const c = ramp(frame, conta, conta + 16);
  const cheio = 740;
  return (
    <g transform={`translate(0 ${(1 - s) * 60})`} opacity={Math.min(1, s * 1.4)}>
      <rect x={90} y={y - 85} width={820} height={170} rx={26} fill={colors.tinta} />
      <rect x={104} y={y - 71} width={792} height={142} rx={18} fill="none" stroke={colors.creme} strokeWidth={4} />
      <T x={130} y={y - 14} size={44} fill={colors.creme} anchor="start">{rotulo}</T>
      <T x={880} y={y - 10} size={54} fill={colors.amarelo} anchor="end">{on(frame, conta) ? numero(c) : ""}</T>
      <rect x={130} y={y + 18} width={cheio} height={40} rx={12} fill={sombra(colors.tinta)} stroke={colors.creme} strokeWidth={3} />
      <rect x={134} y={y + 22} width={(cheio - 8) * (1 - (1 - frac) * k)} height={32} rx={9} fill={colors.coral} />
    </g>
  );
};
const Resultado: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => (
  <g>
    <Cartao y={610} s={pop(frame, n(params.c1))} rotulo="PRESSÃO DIASTÓLICA" desce={n(params.d1)} frac={0.9} conta={n(params.n1)} frame={frame} numero={(k) => `−${Math.round(5 * k)} mmHg`} />
    <Cartao y={800} s={pop(frame, n(params.c2))} rotulo="TRIGLICERÍDEOS" desce={n(params.d2)} frac={0.8} conta={n(params.n2)} frame={frame} numero={(k) => `−${Math.round(33 * k)} mg/dL`} />
    <Cartao y={990} s={pop(frame, n(params.c3))} rotulo="INSULINA" desce={n(params.d3)} frac={0.67} conta={n(params.n3)} frame={frame} numero={() => "≈ −1/3"} />
  </g>
);

// c) adultos: quatro colunas (adoçante, pouco, médio, muito açúcar na bebida); LDL e TG sobem nas
// colunas com açúcar e ficam paradas na do adoçante. Alturas só qualitativas (sem números).
const Sache: React.FC = () => (
  <g>
    <path d="M -34 0 L -40 -110 L 40 -110 L 34 0 Z" fill={colors.ceu} opacity={0.6} stroke={colors.tinta} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-6} y={-150} width={44} height={60} rx={6} fill={colors.branco} stroke={colors.tinta} strokeWidth={5} transform="rotate(18)" />
  </g>
);
const Adultos: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const ink = useInk();
  const BASE = 1000;
  const xs = [230, 420, 610, 800];
  const ldl = [0.02, 0.45, 0.55, 1];
  const tg = [0.02, 0.4, 0.6, 1];
  const col = pop(frame, n(params.colunas));
  const sobe = n(params.sobe);
  const nada = pop(frame, n(params.nada), true);
  const legenda = pop(frame, n(params.legenda));
  const dia = ramp(frame, n(params.dias), n(params.dias) + 90);
  return (
    <g>
      {legenda > 0 ? (
        <g transform={`translate(0 ${(1 - legenda) * 30})`} opacity={legenda}>
          <rect x={150} y={590} width={44} height={44} rx={10} fill={colors.coral} stroke={colors.tinta} strokeWidth={5} />
          <T x={210} y={626} size={40} fill={colors.tinta} anchor="start">LDL</T>
          <rect x={390} y={590} width={44} height={44} rx={10} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={5} />
          <T x={450} y={626} size={40} fill={colors.tinta} anchor="start">TRIGLICERÍDEOS</T>
        </g>
      ) : null}
      <path d={`M 120 ${BASE} L 900 ${BASE}`} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" opacity={col} />
      {xs.map((x, i) => {
        const k = i === 0 ? 1 : ramp(frame, sobe + i * 8, sobe + i * 8 + 14, { ...clamp, easing: Easing.out(Easing.back(1.4)) });
        const hL = 20 + 330 * ldl[i] * k;
        const hT = 20 + 330 * tg[i] * k;
        return col > 0 ? (
          <g key={i}>
            <rect x={x - 62} y={BASE - hL} width={56} height={hL} rx={8} fill={colors.coral} stroke={colors.tinta} strokeWidth={6} />
            <rect x={x + 6} y={BASE - hT} width={56} height={hT} rx={8} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={6} />
            {/* ícone da coluna: copo com sachê (adoçante) ou 1, 2, 3 latas genéricas */}
            <g transform={`translate(${x} ${BASE + 120}) scale(${col})`}>
              {i === 0 ? (
                <g transform="scale(0.8)">
                  <Sache />
                </g>
              ) : (
                Array.from({ length: i }, (_, j) => <Lata key={j} x={(j - (i - 1) / 2) * 44} y={0} s={0.42} />)
              )}
            </g>
          </g>
        ) : null;
      })}
      {nada > 0 ? (
        <g transform={`translate(${xs[0]} ${BASE - 90}) scale(${nada})`}>
          <circle r={46} fill={colors.creme} stroke={colors.tinta} strokeWidth={7} />
          <T x={0} y={18} size={52} fill={colors.tinta}>≈</T>
        </g>
      ) : null}
      {/* régua dia 1 … dia 14 */}
      {Number.isFinite(n(params.dias)) && on(frame, n(params.dias)) ? (
        <g>
          <path d="M 200 1152 L 820 1152" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
          {Array.from({ length: 14 }, (_, i) => (
            <rect key={i} x={200 + i * (620 / 13) - 4} y={1140} width={8} height={24} rx={3} fill={colors.tinta} />
          ))}
          <circle cx={200 + 620 * dia} cy={1152} r={18} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={6} />
          <T x={185} y={1166} size={38} fill={colors.tinta} anchor="end">dia 1</T>
          <T x={835} y={1166} size={38} fill={colors.tinta} anchor="start">dia 14</T>
        </g>
      ) : null}
    </g>
  );
};

// d) promessas: pote verde genérico com três rótulos e o carimbo NÃO MEDIDO em cada; no fim, duas
// bolinhas com setas de tamanhos diferentes (cada um muda de um jeito)
const Promessas: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const ink = useInk();
  const pote = pop(frame, n(params.pote));
  const rotulos: [string, number][] = [
    ["DETOX", n(params.r1)],
    ["BARRIGA SECA", n(params.r2)],
    ["PELE NOVA", n(params.r3)],
  ];
  const bolas = pop(frame, n(params.bolas), true);
  const recua = ramp(frame, n(params.bolas) - 6, n(params.bolas) + 10);
  return (
    <g>
      {pote > 0 ? (
        <g transform={`translate(540 ${860 - recua * 50}) scale(${pote * (1 - 0.2 * recua)})`}>
          <rect x={-280} y={-300} width={560} height={74} rx={22} fill={colors.folhaSombra} stroke={colors.tinta} strokeWidth={ink} />
          <rect x={-320} y={-240} width={640} height={500} rx={64} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
          <rect x={-290} y={-210} width={36} height={400} rx={18} fill={colors.branco} opacity={0.4} />
          {rotulos.map(([txt, at], i) => {
            const s = pop(frame, at, true);
            const carimbo = ramp(frame, at + 12, at + 18);
            return s > 0 ? (
              <g key={txt} transform={`translate(0 ${-140 + i * 150}) scale(${s})`}>
                <rect x={-280} y={-54} width={560} height={108} rx={18} fill={colors.creme} stroke={colors.tinta} strokeWidth={8} />
                <T x={-256} y={16} size={46} fill={colors.tinta} anchor="start">{txt}</T>
                {carimbo > 0 ? (
                  <g transform={`translate(188 2) rotate(-10) scale(${(2 - carimbo) * 0.6})`} opacity={carimbo}>
                    <rect x={-150} y={-38} width={300} height={76} rx={10} fill={colors.creme} stroke={colors.coral} strokeWidth={9} />
                    <T x={0} y={15} size={42} fill={colors.coral}>NÃO MEDIDO</T>
                  </g>
                ) : null}
              </g>
            ) : null;
          })}
        </g>
      ) : null}
      {bolas > 0
        ? [
            [360, colors.turquesa, 60],
            [720, colors.amarelo, 150],
          ].map(([x, cor, h], i) => (
            <g key={i} transform={`translate(${x} 1190) scale(${bolas})`}>
              <circle r={40} fill={cor as string} stroke={colors.tinta} strokeWidth={7} />
              <path d={`M 0 -50 L 0 ${-50 - (h as number) * ramp(frame, n(params.bolas) + 6, n(params.bolas) + 20)}`} stroke={colors.tinta} strokeWidth={12} strokeLinecap="round" />
              <path d={`M -22 ${-40 - (h as number) * ramp(frame, n(params.bolas) + 6, n(params.bolas) + 20)} L 0 ${-74 - (h as number) * ramp(frame, n(params.bolas) + 6, n(params.bolas) + 20)} L 22 ${-40 - (h as number) * ramp(frame, n(params.bolas) + 6, n(params.bolas) + 20)} Z`} fill={colors.tinta} />
            </g>
          ))
        : null}
    </g>
  );
};

// Painel liso: `painel` 1 estudo, 2 resultado, 3 adultos, 4 promessas; `rodape` em linhas (" | ")
export const PainelLiso: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const modo = n(params.painel, 1);
  const rodapes: Record<number, string[]> = {
    1: ["UCSF, 2015 · 43 CRIANÇAS COM OBESIDADE", "NÃO VALE PARA TODO MUNDO"],
    2: ["UCSF, 2015 · SEM GRUPO CONTROLE", "ESTUDO CURTO"],
    3: ["UC DAVIS, 2015 · 85 ADULTOS DE 18 A 40 ANOS", "14 DIAS · CONTROLE COM ADOÇANTE"],
  };
  const nico: Record<number, { x: number; y: number; s: number; expr: string }> = {
    1: { x: 105, y: 1140, s: 0.3, expr: on(frame, n(params.troca)) ? "surpresa" : "atento" },
    2: { x: 990, y: 1150, s: 0.3, expr: on(frame, n(params.n3)) ? "susto" : "surpresa" },
    3: { x: 990, y: 1010, s: 0.3, expr: on(frame, n(params.nada)) ? "curiosidade" : on(frame, n(params.sobe)) ? "preocupacao" : "atento" },
    4: { x: 985, y: 1270, s: 0.3, expr: "vergonha" },
  };
  const ni = nico[modo];
  const rod = rodapes[modo];
  return (
    <>
      <Fundo cam={cam} />
      <Layer cam={cam} depth={1}>
        {modo === 1 ? <Estudo frame={frame} params={params} /> : null}
        {modo === 2 ? <Resultado frame={frame} params={params} /> : null}
        {modo === 3 ? <Adultos frame={frame} params={params} /> : null}
        {modo === 4 ? <Promessas frame={frame} params={params} /> : null}
        <NicoCanto x={ni.x} y={ni.y} s={ni.s} expression={ni.expr} look={[-0.8, -0.4]} />
      </Layer>
      {rod ? <PlacaLinhas linhas={rod} y={modo === 3 ? 1245 : 1215} s={pop(frame, n(params.rodape, 0))} /> : null}
      <CalendarioTopo frame={frame} params={params} />
    </>
  );
};
