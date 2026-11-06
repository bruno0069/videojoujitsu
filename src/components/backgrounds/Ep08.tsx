import React from "react";
import { Easing, interpolate, spring } from "remotion";
import { colors, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { NameTag, SpeechBubble } from "../elements/Props";
import { useInk } from "../Ink";
import { SkyFill } from "../Sky";
import { PessoaDefs } from "./Ep04";
import { clamp, estrela, n, NicoEm, on, pop, ramp, T } from "./Ep07";

// Cenários do ep08 (episódio 7: E se você ficasse uma semana sem açúcar?). Mesmo traço e paleta
// do canal: chapado, contorno grosso, sem degradê, desfoque ou filtro. O Nico é desenhado aqui
// dentro (props na mão, olhos seguindo o docinho), como no ep07. Nada de marca ou logotipo.
// `frame` é o frame da cena; os parâmetros vêm de `fundo` na direção (cues já em frames).

type Params = Record<string, number | number[]>;
const mola = (frame: number, at: number) =>
  Number.isFinite(at) && frame >= at ? spring({ frame: frame - at, fps: 30, config: { damping: 12, mass: 0.6, stiffness: 150 } }) : 0;

// ---------------------------------------------------------------- props genéricos (sem marca)
export const Lata: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {/* lata genérica: azul-petróleo chapado, faixa reta mais escura e bolhinhas; sem onda, sem texto */}
      <rect x={-60} y={-200} width={120} height={200} rx={18} fill={colors.folhaSombra} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-60} y={-70} width={120} height={36} fill={sombra(colors.folhaSombra)} />
      {[[-22, -150, 12], [14, -126, 9], [-6, -104, 7]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.4} />
      ))}
      <rect x={-50} y={-216} width={100} height={22} rx={8} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
      <rect x={-60} y={-200} width={120} height={200} rx={18} fill="none" stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};
export const Garrafa: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M -50 0 L -50 -170 Q -50 -200 -24 -214 L -24 -250 L 24 -250 L 24 -214 Q 50 -200 50 -170 L 50 0 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
      <rect x={-50} y={-130} width={100} height={60} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <rect x={-30} y={-280} width={60} height={34} rx={8} fill={colors.turquesa} stroke={colors.tinta} strokeWidth={ink * 0.8} />
    </g>
  );
};
export const Caixinha: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-50} y={-160} width={100} height={160} rx={8} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={0} cy={-80} r={30} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink * 0.6} />
      <path d="M 20 -160 L 40 -210" stroke={colors.tinta} strokeWidth={ink * 0.9} strokeLinecap="round" />
    </g>
  );
};
// Lupa (cabo para baixo-direita da lente)
export const Lupa: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => {
  const ink = useInk();
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-14} y={60} width={28} height={110} rx={12} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink * 0.8} transform="rotate(-35)" />
      <circle r={70} fill={colors.ceu} opacity={0.35} />
      <circle r={70} fill="none" stroke={colors.tinta} strokeWidth={ink * 1.1} />
      <path d="M -34 -30 Q -20 -50 0 -54" fill="none" stroke={colors.creme} strokeWidth={ink * 0.7} strokeLinecap="round" />
    </g>
  );
};
// Etiqueta chapada "AÇÚCAR" com cordão; `k` 0..1 = apagada -> acesa
export const EtiquetaAcucar: React.FC<{ x: number; y: number; s: number; k: number; rot?: number }> = ({ x, y, s, k, rot = -6 }) => {
  if (s <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {k > 0.5
        ? [0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d="M 0 -96 L 0 -126" transform={`rotate(${i * 60 - 150 + 30})`} stroke={colors.amarelo} strokeWidth={10} strokeLinecap="round" opacity={k} />
          ))
        : null}
      <path d="M -120 -40 L 100 -40 L 130 0 L 100 40 L -120 40 Z" fill={k > 0.5 ? colors.amarelo : colors.creme} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
      <circle cx={100} cy={0} r={9} fill={colors.tinta} />
      <T x={-10} y={16} size={44} fill={colors.tinta}>AÇÚCAR</T>
    </g>
  );
};

// Comidinhas do balcão (pão, molho, suco, salgado), apoiadas em y=0
const Pao: React.FC = () => (
  <g>
    <path d="M -80 0 Q -90 -90 0 -96 Q 90 -90 80 0 Z" fill={colors.chao} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
    {[-36, 0, 36].map((x) => <path key={x} d={`M ${x - 10} -70 L ${x + 12} -40`} stroke={colors.chaoSombra} strokeWidth={9} strokeLinecap="round" />)}
  </g>
);
const Molho: React.FC = () => (
  <g>
    <path d="M -42 0 L -42 -130 Q -42 -160 -16 -170 L -16 -200 L 16 -200 L 16 -170 Q 42 -160 42 -130 L 42 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
    <rect x={-42} y={-100} width={84} height={50} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
    <rect x={-20} y={-224} width={40} height={28} rx={6} fill={colors.creme} stroke={colors.tinta} strokeWidth={7} />
  </g>
);
const Salgado: React.FC = () => (
  <g>
    <path d="M -60 0 Q -70 -40 -10 -120 Q 0 -130 10 -120 Q 70 -40 60 0 Z" fill={colors.muro} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
    <path d="M -30 -40 Q 0 -30 30 -40" fill="none" stroke={colors.muroSombra} strokeWidth={8} strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- cantina_dia
// Parede de azulejos com janela, relógio e calendário; balcão com atendente (silhueta chapada) e
// comidinhas; chão. Parâmetros:
//   `etiquetas` [a, b, c, d]: etiquetas AÇÚCAR acendem; `etiquetasDe`: aparecem apagadas
//   `dia1`: calendário com DIA 1 e 7 quadradinhos; `trim`: o relógio balança (intervalo)
//   `entrega`, `olhaLata`, `olhaAgua`, `devolve`, `pegaAgua`, `confuso`: a cena do refrigerante
//   `nome`/`nomeAte`: etiqueta NICO; `heroi`: pose decidida
//   `regra`: modo dos quadros CONTA / NÃO CONTA (ver QuadroContaNaoConta)
//   `vitrine`: vitrine de doces no balcão (cena 5; ver Vitrine)
//   `lupa`/`lupaAte`, `rotulo`, `olhaCima`: fechamento (lupa no pacote e o rosto para cima)
export const CANT = { chao: 1500, balcao: 1180, nicoX: 250, s: 0.62 };
export const ROSTO_CANT = { x: CANT.nicoX, y: CANT.chao - 790 * CANT.s - 20 };

export const Cantina: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const B = CANT.balcao;
  const vitrine = on(frame, n(params.vitrine, Infinity)) || params.vitrine === 0;
  const regra = Number.isFinite(n(params.regra));
  // relógio do intervalo
  const trim = n(params.trim);
  const balanco = on(frame, trim) && frame < trim + 30 ? Math.sin((frame - trim) * 1.6) * 12 * (1 - (frame - trim) / 30) : 0;
  // etiquetas AÇÚCAR do gancho
  const et = Array.isArray(params.etiquetas) ? (params.etiquetas as number[]) : [];
  const etDe = n(params.etiquetasDe);
  // calendário
  const dia1 = pop(frame, n(params.dia1), true);
  const sete = n(params.sete);
  // refrigerante x água
  const entrega = n(params.entrega);
  const devolve = n(params.devolve);
  const pegaAgua = n(params.pegaAgua);
  const lataX = !on(frame, entrega)
    ? 760
    : !on(frame, devolve)
      ? interpolate(frame, [entrega, entrega + 10], [760, 470], { ...clamp, easing: Easing.out(Easing.cubic) })
      : interpolate(frame, [devolve, devolve + 12], [470, 760], { ...clamp, easing: Easing.in(Easing.cubic) });
  const lataVis = Number.isFinite(entrega) && (!on(frame, devolve + 12));
  const aguaK = ramp(frame, pegaAgua, pegaAgua + 10, { ...clamp, easing: Easing.out(Easing.back(1.4)) });
  const heroi = on(frame, n(params.heroi));
  const confuso = pop(frame, n(params.confuso), true);
  // cena do suco (quadros)
  const suco = n(params.sucoPula);
  const sucoNaMao = regra && !on(frame, suco);
  // fechamento: lupa no pacote e depois o rosto para cima
  const lupa = on(frame, n(params.lupa)) && !on(frame, n(params.lupaAte));
  const olhaCima = on(frame, n(params.olhaCima));
  // pose e olhar do Nico
  const pose = olhaCima
    ? "olhando_para_cima"
    : lupa
      ? "apontando"
      : on(frame, pegaAgua)
        ? "heroi"
        : on(frame, devolve)
          ? "apontando"
          : heroi
            ? "heroi"
            : params.pose0 === 1
              ? "olhando_para_cima"
              : "parado";
  // cena da regra: o Nico segura o suco, segue o suco voando e depois encara o espectador
  const olharRegra: [number, number] | undefined = !regra ? undefined : !on(frame, suco) ? [0.6, 0.5] : frame < suco + 14 ? [0.8, -0.8] : [0, 0];
  const olhar: [number, number] | undefined = regra
    ? olharRegra
    : vitrine
    ? olharDoce(frame, params)
    : on(frame, n(params.olhaAgua)) && !on(frame, devolve)
    ? [0.9, 0.2]
    : on(frame, n(params.olhaLata)) && !on(frame, devolve)
      ? [0.7, 0.6]
      : lupa
        ? [0.9, 0.5]
        : undefined;
  const expression = regra
    ? on(frame, suco)
      ? frame < suco + 14
        ? "susto"
        : "confusao"
      : "malandro"
    : vitrine
    ? on(frame, n(params.desvia)) && frame < n(params.desvia) + 10
      ? "vergonha"
      : on(frame, n(params.doce))
        ? "curiosidade"
        : on(frame, n(params.dor))
          ? "preocupacao"
          : "atento"
    : olhaCima
    ? "surpresa"
    : lupa
      ? Math.floor(frame / 40) % 2 ? "cetica" : "curiosidade"
      : on(frame, pegaAgua)
        ? "atento"
        : Array.isArray(params.etiquetas) && on(frame, et[3] ?? Infinity)
          ? "susto"
          : params.expr0 === 1
            ? "surpresa"
            : "neutro";
  const handR = { x: CANT.nicoX + 250 * CANT.s, y: CANT.chao - 380 * CANT.s };
  const apontaR = { x: CANT.nicoX + 430 * CANT.s, y: CANT.chao - 660 * CANT.s };
  return (
    <>
      <PessoaDefs id="cant" />
      <Layer cam={cam} depth={0.25}>
        <SkyFill color={colors.creme} />
        {/* azulejos da metade de baixo da parede */}
        <rect x={-1500} y={700} width={4080} height={900} fill={colors.turquesa} />
        {Array.from({ length: 40 }, (_, i) => (
          <path key={`v${i}`} d={`M ${-1500 + i * 110} 700 L ${-1500 + i * 110} 1600`} stroke={sombra(colors.turquesa)} strokeWidth={6} />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <path key={`h${i}`} d={`M -1500 ${700 + i * 110} L 2580 ${700 + i * 110}`} stroke={sombra(colors.turquesa)} strokeWidth={6} />
        ))}
        <rect x={-1500} y={680} width={4080} height={24} fill={colors.tinta} />
        {/* janela */}
        <rect x={400} y={460} width={240} height={210} rx={10} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />
        <path d="M 520 460 L 520 670 M 400 565 L 640 565" stroke={colors.tinta} strokeWidth={ink * 0.7} />
        {/* relógio */}
        <g transform={`translate(870 560) rotate(${balanco})`}>
          <circle r={90} fill={colors.branco} stroke={colors.tinta} strokeWidth={ink} />
          <path d="M 0 0 L 0 -56 M 0 0 L 40 20" stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinecap="round" />
          {balanco !== 0 ? <path d="M -120 -60 q -20 30 0 60 M 120 -60 q 20 30 0 60" fill="none" stroke={colors.tinta} strokeWidth={ink * 0.6} strokeLinecap="round" /> : null}
        </g>
        {/* calendário: DIA 1 e 7 quadradinhos (um por dia), sem outros números */}
        {dia1 > 0 ? (
          <g transform={`translate(160 620) rotate(-4) scale(${dia1})`}>
            <rect x={-130} y={-150} width={260} height={300} rx={14} fill={colors.branco} stroke={colors.tinta} strokeWidth={ink} />
            <rect x={-130} y={-150} width={260} height={70} rx={14} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
            <T x={0} y={36} size={76} fill={colors.tinta}>DIA 1</T>
            {Array.from({ length: 7 }, (_, i) => {
              const aceso = i === 0 && on(frame, sete);
              return (
                <rect key={i} x={-112 + i * 32} y={84} width={24} height={24} rx={5} fill={aceso ? colors.amarelo : colors.creme} stroke={colors.tinta} strokeWidth={4} opacity={on(frame, sete) ? 1 : 0.35} />
              );
            })}
          </g>
        ) : null}
      </Layer>
      <Layer cam={cam} depth={0.7}>
        {/* prateleira de trás do balcão e o atendente */}
        <rect x={420} y={760} width={2000} height={30} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        {[480, 560, 640, 980, 1060].map((x, i) => (
          <g key={i} transform={`translate(${x} 760) scale(0.5)`}>
            {i % 2 ? <Garrafa x={0} y={0} s={1} /> : <Lata x={0} y={0} s={1} />}
          </g>
        ))}
        {!regra && params.semAtendente !== 1 ? (
          <g transform={`translate(780 ${B + 40}) scale(0.62)`}>
            <use href="#cant-p0" />
          </g>
        ) : null}
        {confuso > 0 ? (
          <g transform={`translate(780 ${B - 760}) scale(${confuso})`}>
            <T x={0} y={0} size={150} fill={colors.amarelo} stroke={colors.tinta} sw={14}>?</T>
          </g>
        ) : null}
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* chão e balcão */}
        <rect x={-2000} y={CANT.chao - 20} width={5080} height={1400} fill={colors.chao} />
        {Array.from({ length: 14 }, (_, i) => (
          <path key={i} d={`M ${-600 + i * 170} ${CANT.chao - 20} L ${-900 + i * 230} 2200`} stroke={colors.chaoSombra} strokeWidth={8} />
        ))}
        <rect x={380} y={B + 20} width={1400} height={CANT.chao - B - 40} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={430 + i * 260} y={B + 80} width={200} height={CANT.chao - B - 160} rx={14} fill={sombra(colors.noite)} />
        ))}
        <rect x={360} y={B - 10} width={1440} height={40} rx={10} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink} />
        {/* comidinhas do balcão (somem quando a vitrine ou os quadros ocupam o balcão) */}
        {!vitrine && !regra && params.semItens !== 1 ? (
          <g>
            {[
              [520, <Pao key="p" />],
              [670, <Molho key="m" />],
              [820, <Caixinha key="c" x={0} y={0} s={0.9} />],
              [960, <Salgado key="s" />],
            ].map(([x, el], i) => (
              <g key={i} transform={`translate(${x} ${B - 10})`}>
                {el as React.ReactNode}
              </g>
            ))}
          </g>
        ) : null}
        {Number.isFinite(etDe)
          ? [520, 670, 820, 960].map((x, i) => (
              <EtiquetaAcucar
                key={i}
                x={x}
                y={B - 290 - (i % 2) * 110}
                s={pop(frame, etDe + i * 2) * (0.8 + 0.14 * mola(frame, et[i] ?? Infinity))}
                k={ramp(frame, et[i] ?? Infinity, (et[i] ?? Infinity) + 3)}
                rot={i % 2 ? 6 : -6}
              />
            ))
          : null}
        {vitrine ? <Vitrine /> : null}
        {/* lata e água da cena 2 */}
        {lataVis ? <Lata x={lataX} y={B - 10} s={0.75} rot={on(frame, devolve) ? -8 : 0} /> : null}
        {Number.isFinite(pegaAgua) ? (
          aguaK > 0 ? (
            <Garrafa x={interpolate(aguaK, [0, 1], [620, handR.x + 10])} y={interpolate(aguaK, [0, 1], [B - 10, handR.y + 70])} s={0.62} rot={interpolate(aguaK, [0, 1], [0, -12])} />
          ) : Number.isFinite(entrega) && on(frame, entrega) ? (
            <Garrafa x={620} y={B - 10} s={0.62} />
          ) : null
        ) : null}
        {/* fechamento: pacote no balcão e a lupa */}
        {Number.isFinite(n(params.lupa)) && !olhaCima ? (
          <g transform={`translate(660 ${B - 10})`}>
            <path d="M -80 0 L -90 -200 Q 0 -230 90 -200 L 80 0 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
            <rect x={-50} y={-140} width={100} height={70} rx={10} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
            {[0, 1, 2].map((k) => <rect key={k} x={-36} y={-126 + k * 20} width={72 - k * 16} height={8} rx={4} fill={colors.tinta} />)}
          </g>
        ) : null}
        {/* Nico */}
        <NicoEm x={CANT.nicoX} y={CANT.chao} s={CANT.s} pose={pose} expression={expression} look={olhar} />
        {vitrine ? <DoceOrbita frame={frame} params={params} /> : null}
        {lupa ? <Lupa x={apontaR.x + 10} y={apontaR.y - 10} s={0.7} rot={-20 + Math.sin(frame / 9) * 6} /> : null}
        {sucoNaMao ? <Caixinha x={CANT.nicoX + 170 * CANT.s} y={CANT.chao - 230 * CANT.s} s={0.6} /> : null}
        {on(frame, pegaAgua) && frame < pegaAgua + 40
          ? [0, 1, 2].map((k) => {
              const c = (frame - pegaAgua) / 40;
              return <path key={k} d={estrela(26)} transform={`translate(${CANT.nicoX - 160 + k * 160} ${CANT.chao - 900 - c * 80}) scale(${1 - c})`} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={5} />;
            })
          : null}
      </Layer>
      {regra ? <QuadroContaNaoConta frame={frame} params={params} /> : null}
      <NameTag frame={frame} from={n(params.nome)} to={n(params.nomeAte)} text="Nico" x={CANT.nicoX + 40} y={CANT.chao - 1200 * CANT.s} />
      {Number.isFinite(n(params.ue)) ? (
        <SpeechBubble frame={frame} from={n(params.ue)} to={n(params.ueAte)} text="Ué." ax={ROSTO_CANT.x - 130} ay={ROSTO_CANT.y - 170} />
      ) : null}
      {vitrine ? <Sintomas frame={frame} params={params} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- quadro_conta_nao_conta
// Dois quadros chapados sobre a bandeja: CONTA (açúcar, mel, xarope, suco) e NÃO CONTA (maçã
// inteira, copo de leite). Cada item entra na palavra dele; o suco sai da mão do Nico e pula para
// o quadro CONTA com um estalo (`sucoPula`).
const Icone: React.FC<{ tipo: string }> = ({ tipo }) => {
  switch (tipo) {
    case "acucar":
      return (
        <g>
          <rect x={-46} y={-56} width={92} height={96} rx={10} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
          {[[-18, -20], [10, -26], [-4, 4], [20, 6], [-22, 18]].map(([x, y], i) => <rect key={i} x={x} y={y} width={16} height={16} rx={3} fill={colors.creme} stroke={colors.tinta} strokeWidth={4} />)}
        </g>
      );
    case "mel":
      return (
        <g>
          <path d="M -44 40 L -50 -30 Q 0 -50 50 -30 L 44 40 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
          <rect x={-40} y={-60} width={80} height={26} rx={8} fill={colors.muro} stroke={colors.tinta} strokeWidth={7} />
          <path d="M -50 -30 q 10 30 20 0 q 10 34 20 0" fill={colors.muro} stroke={colors.tinta} strokeWidth={5} />
        </g>
      );
    case "xarope":
      return (
        <g transform="translate(0 40) scale(0.55)">
          <Molho />
        </g>
      );
    case "suco":
      return <Caixinha x={0} y={44} s={0.55} />;
    case "maca":
      return (
        <g>
          <circle cx={0} cy={6} r={44} fill={colors.coral} stroke={colors.tinta} strokeWidth={8} />
          <path d="M 0 -36 L 6 -60" stroke={colors.tinta} strokeWidth={8} strokeLinecap="round" />
          <path d="M 8 -50 Q 30 -66 40 -44 Q 20 -38 8 -50 Z" fill={colors.folha} stroke={colors.tinta} strokeWidth={5} />
        </g>
      );
    case "leite":
      return (
        <g>
          <path d="M -36 -54 L 36 -54 L 28 48 L -28 48 Z" fill={colors.branco} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
          <path d="M -32 -20 L 32 -20 L 28 48 L -28 48 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={6} strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
};

export const QuadroContaNaoConta: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const q = pop(frame, n(params.regra));
  const conta: [string, number][] = [
    ["acucar", n(params.iAcucar)],
    ["mel", n(params.iMel)],
    ["xarope", n(params.iXarope)],
  ];
  const suco = n(params.sucoPula);
  const naoConta: [string, number][] = [
    ["maca", n(params.iFruta)],
    ["leite", n(params.iLeite)],
  ];
  // o suco voa da mão do Nico (tela) até a 4ª casa do quadro CONTA
  const voo = ramp(frame, suco, suco + 12, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const mao = { x: CANT.nicoX + 170 * CANT.s, y: CANT.chao - 230 * CANT.s - 50 };
  const casa = (i: number) => ({ x: 485 + (i % 2) * 150, y: 810 + Math.floor(i / 2) * 170 });
  const destino = casa(3);
  const sx = interpolate(voo, [0, 1], [mao.x, destino.x]);
  const sy = interpolate(voo, [0, 1], [mao.y, destino.y]) - Math.sin(Math.PI * voo) * 260;
  const flash = on(frame, suco + 12) && frame < suco + 20;
  return (
    <g transform={`translate(${0} ${(1 - q) * 80})`} opacity={Math.min(1, q * 1.5)}>
      {[
        [560, "CONTA", colors.coral],
        [890, "NÃO CONTA", colors.turquesa],
      ].map(([x, titulo, cor]) => (
        <g key={titulo as string} transform={`translate(${x} 880)`}>
          <rect x={-150} y={-300} width={300} height={560} rx={24} fill={colors.tinta} />
          <rect x={-150} y={-310} width={300} height={560} rx={24} fill={colors.creme} stroke={colors.tinta} strokeWidth={10} />
          <rect x={-150} y={-310} width={300} height={96} rx={24} fill={cor as string} stroke={colors.tinta} strokeWidth={10} />
          <T x={0} y={-244} size={(titulo as string).length > 6 ? 46 : 54} fill={colors.creme} stroke={colors.tinta} sw={10}>{titulo as string}</T>
        </g>
      ))}
      {conta.map(([tipo, at], i) => {
        const s = pop(frame, at, true);
        const c = casa(i);
        return s > 0 ? (
          <g key={tipo} transform={`translate(${c.x} ${c.y}) scale(${s * 1.3})`}>
            <Icone tipo={tipo} />
          </g>
        ) : null;
      })}
      {naoConta.map(([tipo, at], i) => {
        const s = pop(frame, at, true);
        return s > 0 ? (
          <g key={tipo} transform={`translate(890 ${820 + i * 230}) scale(${s * 1.6})`}>
            <Icone tipo={tipo} />
          </g>
        ) : null;
      })}
      {/* suco: na mão (desenhado pela cantina) -> voo -> casa 4 do CONTA */}
      {on(frame, suco) ? (
        <g transform={`translate(${sx} ${sy}) rotate(${voo * 360}) scale(${1.3 + 0.3 * Math.sin(Math.PI * voo)})`}>
          <Icone tipo="suco" />
        </g>
      ) : null}
      {flash ? (
        <g transform={`translate(${destino.x} ${destino.y})`}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d="M 0 -70 L 0 -110" transform={`rotate(${i * 45})`} stroke={colors.amarelo} strokeWidth={12} strokeLinecap="round" />
          ))}
        </g>
      ) : null}
    </g>
  );
};

// ---------------------------------------------------------------- vitrine e os relatos (cena 5)
const Docinho: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -46 10 L -34 50 L 34 50 L 46 10 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
    <circle cx={0} cy={-10} r={44} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={8} />
    {[[-16, -26], [14, -30], [0, -2], [-22, 0], [20, -6]].map(([x, y], i) => <rect key={i} x={x} y={y} width={10} height={6} rx={3} fill={i % 2 ? colors.amarelo : colors.creme} />)}
  </g>
);
export const Vitrine: React.FC = () => {
  const ink = useInk();
  const B = CANT.balcao;
  return (
    <g>
      <rect x={430} y={B - 420} width={640} height={420} rx={20} fill={colors.ceu} />
      <rect x={430} y={B - 420} width={640} height={420} rx={20} fill="none" stroke={colors.tinta} strokeWidth={ink} />
      <path d={`M 430 ${B - 210} L 1070 ${B - 210}`} stroke={colors.tinta} strokeWidth={ink * 0.7} />
      {[0, 1, 2, 3].map((i) => (
        <g key={`a${i}`} transform={`translate(${510 + i * 150} ${B - 270})`}>
          <Docinho s={0.9} />
        </g>
      ))}
      {[0, 1, 2].map((i) => (
        <g key={`b${i}`} transform={`translate(${560 + i * 180} ${B - 70})`}>
          <path d="M -60 0 L -60 -80 Q 0 -120 60 -80 L 60 0 Z" fill={i === 1 ? colors.coralClaro : colors.chao} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
          <path d="M -60 -60 Q -30 -40 0 -60 Q 30 -40 60 -60" fill="none" stroke={colors.creme} strokeWidth={10} strokeLinecap="round" />
        </g>
      ))}
      {/* brilho chapado no vidro */}
      <path d={`M 470 ${B - 380} L 530 ${B - 380} L 470 ${B - 300} Z`} fill={colors.branco} opacity={0.7} />
    </g>
  );
};

// Ícones dos relatos + doce orbitando + rodapé fixo (em tela)
const IconeCabeca: React.FC = () => (
  <g>
    <circle r={60} fill={colors.pele} stroke={colors.tinta} strokeWidth={9} />
    <path d="M -8 -110 L -30 -50 L 0 -50 L -16 4 L 34 -70 L 4 -70 L 20 -110 Z" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={7} strokeLinejoin="round" />
  </g>
);
const IconeBateria: React.FC<{ nivel: number }> = ({ nivel }) => (
  <g>
    <rect x={-70} y={-40} width={130} height={80} rx={12} fill={colors.creme} stroke={colors.tinta} strokeWidth={9} />
    <rect x={60} y={-16} width={16} height={32} rx={4} fill={colors.tinta} />
    <rect x={-58} y={-28} width={106 * nivel} height={56} rx={6} fill={nivel < 0.3 ? colors.coral : colors.turquesa} />
  </g>
);
const SLOTS = [380, 600, 820];
const SLOT_Y = 640;
export const Sintomas: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const icones: [number, React.ReactNode][] = [
    [n(params.dor), <IconeCabeca key="c" />],
    [n(params.cansaco), <IconeBateria key="b" nivel={0.15} />],
  ];
  const nemTodo = pop(frame, n(params.dor) + 6);
  return (
    <g>
      {SLOTS.map((x, i) => {
        const vem = [n(params.dor), n(params.cansaco), n(params.doce)][i];
        const s = pop(frame, n(params.estudo) + i * 6) * (1 - ramp(frame, vem - 2, vem + 4));
        return s > 0 ? (
          <g key={i} transform={`translate(${x} ${SLOT_Y}) scale(${s})`}>
            <circle r={95} fill={colors.creme} stroke={colors.tinta} strokeWidth={8} strokeDasharray="22 16" />
            <T x={0} y={34} size={96} fill={colors.chaoSombra}>?</T>
          </g>
        ) : null;
      })}
      {icones.map(([at, el], i) =>
        on(frame, at) ? (
          <g key={i} transform={`translate(${SLOTS[i]} ${SLOT_Y}) scale(${1.4 * pop(frame, at, true)})`}>
            {el}
          </g>
        ) : null,
      )}
      {nemTodo > 0 ? (
        <g transform={`translate(600 800) scale(${nemTodo})`}>
          <rect x={-300} y={-36} width={600} height={72} rx={36} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
          <T x={0} y={14} size={42} fill={colors.tinta}>nem todo mundo sente isso</T>
        </g>
      ) : null}
      <Rodape texto="INFORMAÇÃO, NÃO É CONSELHO MÉDICO" />
    </g>
  );
};

// Docinho que orbita a cabeça do Nico (no mundo, acompanha a câmera). Antes de `orbita` ele fica
// no balão do terceiro ícone; a órbita tem raio maior que a cabeça (≈ 143 px) mais o doce.
export const DoceOrbita: React.FC<{ frame: number; params: Params }> = ({ frame, params }) => {
  const doce = n(params.doce);
  const orb = n(params.orbita);
  const s = pop(frame, doce, true);
  if (s <= 0) return null;
  const c = { x: ROSTO_CANT.x, y: ROSTO_CANT.y + 10 };
  const ang = on(frame, orb) ? (frame - orb) / 9 - Math.PI / 2 : -Math.PI / 2;
  const alvo = { x: c.x + 255 * Math.cos(ang), y: c.y + 235 * Math.sin(ang) };
  const k = ramp(frame, orb, orb + 14, { ...clamp, easing: Easing.inOut(Easing.quad) });
  const x = interpolate(k, [0, 1], [820, alvo.x]);
  const y = interpolate(k, [0, 1], [640, alvo.y]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {!on(frame, orb) ? <circle r={80} fill={colors.creme} stroke={colors.tinta} strokeWidth={8} /> : null}
      <g transform={`rotate(${Math.sin(frame / 6) * 10})`}>
        <Docinho s={0.9} />
      </g>
    </g>
  );
};

// Rodapé pequeno e fixo, acima da área dos botões das plataformas (y ≤ 1670)
// Rodapé pequeno e fixo, DENTRO da zona segura: logo acima da faixa da legenda (y 1306+), longe da
// interface das plataformas, com margem lateral de 90 px e fonte de 40 px
export const RODAPE_Y = 1245;
export const Rodape: React.FC<{ texto: string; y?: number }> = ({ texto, y = RODAPE_Y }) => (
  <g transform={`translate(540 ${y})`}>
    <rect x={-Math.min(450, texto.length * 11.6 + 26)} y={-34} width={Math.min(900, texto.length * 23.2 + 52)} height={68} rx={16} fill={colors.tinta} />
    <T x={0} y={14} size={40} fill={colors.creme}>{texto}</T>
  </g>
);

// Olhar do Nico seguindo o docinho (usado pela direção da cena 5 via a cantina)
export const olharDoce = (frame: number, params: Params): [number, number] | undefined => {
  const orb = n(params.orbita);
  if (!on(frame, orb)) return on(frame, n(params.doce)) ? [0.9, -0.6] : undefined;
  const ang = (frame - orb) / 9 - Math.PI / 2;
  // tenta desviar o olhar em `desvia`, mas os olhos voltam para o doce
  const desvia = n(params.desvia);
  if (on(frame, desvia) && frame < desvia + 10) return [-0.95, 0.1];
  return [Math.cos(ang), Math.max(-0.9, Math.min(0.9, Math.sin(ang) - 0.15))];
};

// ---------------------------------------------------------------- prateleira_mercado
// Corredor de mercado genérico: prateleiras do fundo (parallax) e a prateleira da frente.
// Modo ketchup (`colher`, `quatro`) e modo pacotes (`pacotes`, `etiquetas` [a, b, c], `suspeito`).
const Pacote: React.FC<{ tipo: string }> = ({ tipo }) => {
  switch (tipo) {
    case "pao":
      return (
        <g>
          <rect x={-80} y={-200} width={160} height={200} rx={20} fill={colors.branco} stroke={colors.tinta} strokeWidth={9} />
          <g transform="translate(0 -70) scale(0.8)">
            <Pao />
          </g>
        </g>
      );
    case "molho":
      return (
        <g transform="scale(1.05)">
          <Molho />
        </g>
      );
    case "cereal":
      return (
        <g>
          <rect x={-75} y={-250} width={150} height={250} rx={8} fill={colors.ceu} stroke={colors.tinta} strokeWidth={9} />
          <circle cx={0} cy={-120} r={46} fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
          {[[-14, -130], [12, -116], [-2, -100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={11} fill={colors.muro} />)}
        </g>
      );
    case "iogurte":
      return (
        <g>
          <path d="M -60 0 L -70 -150 L 70 -150 L 60 0 Z" fill={colors.coralClaro} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
          <rect x={-76} y={-172} width={152} height={26} rx={8} fill={colors.creme} stroke={colors.tinta} strokeWidth={7} />
        </g>
      );
    default:
      return null;
  }
};
export const MERC = { chao: 1500, prateleira: 1230, nicoX: 210, s: 0.5 };
export const Mercado: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const P = MERC.prateleira;
  const pacotes = on(frame, n(params.pacotes));
  const colher = pop(frame, n(params.colher), true);
  const quatro = pop(frame, n(params.quatro), true);
  const et = Array.isArray(params.etiquetas) ? (params.etiquetas as number[]) : [];
  const suspeito = on(frame, n(params.suspeito));
  const nicoX = pacotes ? 150 : MERC.nicoX;
  const aponta = { x: nicoX + 430 * MERC.s, y: MERC.chao - 660 * MERC.s };
  const xs = [380, 560, 740, 920];
  const tipos = ["pao", "molho", "cereal", "iogurte"];
  // lupa: no ketchup; no modo pacotes, varre os pacotes e para no pão (suspeito)
  const lupaAlvo = suspeito ? { x: xs[0], y: P - 130 } : pacotes ? { x: xs[0] + 200 * Math.sin(frame / 14) ** 2, y: P - 140 } : { x: 640, y: P - 150 };
  const k = mola(frame, pacotes ? n(params.pacotes) : n(params.lupa, 0));
  const lupaX = interpolate(k, [0, 1], [aponta.x, lupaAlvo.x]);
  const lupaY = interpolate(k, [0, 1], [aponta.y, lupaAlvo.y]);
  const expression = suspeito ? "cetica" : pacotes && on(frame, et[0] ?? Infinity) ? "preocupacao" : on(frame, n(params.quatro)) ? "surpresa" : "atento";
  return (
    <>
      <Layer cam={cam} depth={0.3}>
        <SkyFill color={colors.creme} />
        {[0, 1].map((lado) => (
          <g key={lado}>
            {[480, 720, 960].map((y) => (
              <g key={y}>
                <rect x={lado ? 700 : -300} y={y} width={680} height={22} fill={colors.chaoSombra} />
                {Array.from({ length: 6 }, (_, i) => (
                  <rect key={i} x={(lado ? 720 : -280) + i * 110} y={y - 140 + (i % 2) * 20} width={80} height={140 - (i % 2) * 20} rx={6} fill={[colors.coralClaro, colors.ceu, colors.amarelo, colors.folha][(i + lado + y) % 4]} opacity={0.55} />
                ))}
              </g>
            ))}
          </g>
        ))}
        <rect x={-1500} y={1150} width={4080} height={900} fill={colors.chao} />
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* prateleira da frente */}
        <rect x={-300} y={P} width={1680} height={40} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={-300} y={P + 40} width={1680} height={MERC.chao - P - 40} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={-2000} y={MERC.chao} width={5080} height={1400} fill={colors.chao} />
        {!pacotes ? (
          <g>
            {/* frasco genérico de ketchup, com rótulo sem marca */}
            <g transform={`translate(640 ${P})`}>
              <path d="M -70 0 L -70 -230 Q -70 -280 -30 -300 L -30 -350 L 30 -350 L 30 -300 Q 70 -280 70 -230 L 70 0 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
              <rect x={-70} y={-190} width={140} height={110} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.7} />
              <path d="M -40 -150 Q 0 -175 40 -150 Q 0 -115 -40 -150 Z" fill={colors.coral} />
              <rect x={-34} y={-388} width={68} height={42} rx={10} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink * 0.8} />
            </g>
            {colher > 0 ? (
              <g transform={`translate(850 ${P - 60}) rotate(-12) scale(${colher})`}>
                <rect x={-150} y={-12} width={170} height={24} rx={12} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
                <ellipse cx={60} cy={0} rx={70} ry={44} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
                <ellipse cx={60} cy={-8} rx={54} ry={30} fill={colors.coral} stroke={colors.tinta} strokeWidth={6} />
              </g>
            ) : null}
            {quatro > 0 ? (
              <g transform={`translate(820 ${P - 250}) scale(${quatro})`}>
                <path d={estrela(110)} transform="scale(1.3 0.9)" fill={colors.amarelo} stroke={colors.tinta} strokeWidth={9} strokeLinejoin="round" />
                <T x={0} y={24} size={74} fill={colors.tinta}>≈ 4 g</T>
              </g>
            ) : null}
          </g>
        ) : (
          <g>
            {xs.map((x, i) => (
              <g key={i} transform={`translate(${x} ${P}) rotate(${suspeito && i === 0 ? Math.sin(frame / 3) * 3 : 0})`}>
                <Pacote tipo={tipos[i]} />
                {suspeito && i === 0 ? (
                  <g>
                    <path d="M 70 -200 Q 92 -170 70 -150 Q 48 -170 70 -200 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={5} />
                  </g>
                ) : null}
              </g>
            ))}
            {[1, 2, 3].map((i, k) => (
              <EtiquetaAcucar key={i} x={xs[i]} y={P - 330} s={pop(frame, et[k] ?? Infinity, true) * 0.62} k={ramp(frame, et[k] ?? Infinity, (et[k] ?? Infinity) + 3)} rot={k % 2 ? 6 : -6} />
            ))}
          </g>
        )}
        <NicoEm x={nicoX} y={MERC.chao} s={MERC.s} pose="apontando" expression={expression} look={[0.9, 0.3]} />
        {/* holofote chapado da lupa no suspeito */}
        {suspeito ? <path d={`M ${lupaX} ${lupaY} L ${xs[0] - 90} ${P} L ${xs[0] + 90} ${P} Z`} fill={colors.amarelo} opacity={0.3} /> : null}
        <Lupa x={lupaX} y={lupaY} s={pacotes ? 0.75 : 0.85} rot={-30} />
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- bateria_cerebro e diagrama_corpo
export const BateriaCerebro: React.FC<{ x: number; y: number; s: number; nivel: number }> = ({ x, y, s, nivel }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-90} y={-50} width={170} height={100} rx={16} fill={colors.creme} stroke={colors.tinta} strokeWidth={10} />
      <rect x={80} y={-20} width={20} height={40} rx={5} fill={colors.tinta} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-76 + i * 38} y={-36} width={30} height={72} rx={6} fill={i < Math.round(nivel * 4) ? colors.turquesa : colors.creme} />
      ))}
    </g>
  );
// fatia de pão (formato inconfundível: quadrada com o topo em dois gomos), apoiada no centro
const FatiaPao: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -56 52 L -56 -14 Q -82 -34 -62 -62 Q -40 -86 0 -72 Q 40 -86 62 -62 Q 82 -34 56 -14 L 56 52 Z" fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -40 40 L -40 -10 Q -58 -28 -44 -46 Q -28 -62 0 -52 Q 28 -62 44 -46 Q 58 -28 40 -10 L 40 40 Z" fill={colors.creme} />
  </g>
);
// ponto ao longo de uma polilinha (k 0..1)
const aoLongo = (pts: { x: number; y: number }[], k: number) => {
  const seg = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y));
  const total = seg.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, k)) * total;
  for (let i = 0; i < seg.length; i++) {
    if (d <= seg[i]) {
      const u = seg[i] ? d / seg[i] : 0;
      return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * u, y: pts[i].y + (pts[i + 1].y - pts[i].y) * u };
    }
    d -= seg[i];
  }
  return pts[pts.length - 1];
};
// seta chapada (polilinha com ponta)
const Seta: React.FC<{ pts: { x: number; y: number }[]; s: number; cor?: string }> = ({ pts, s, cor = colors.tinta }) => {
  if (s <= 0) return null;
  const a = pts[pts.length - 2];
  const b = pts[pts.length - 1];
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (
    <g opacity={Math.min(1, s * 1.5)}>
      <path d={`M ${pts.map((p) => `${p.x} ${p.y}`).join(" L ")}`} fill="none" stroke={cor} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 0 0 L -34 -20 L -34 20 Z" transform={`translate(${b.x} ${b.y}) rotate(${ang})`} fill={cor} />
    </g>
  );
};
const Rotulo: React.FC<{ x: number; y: number; s: number; texto: string; cor?: string; tinta?: string }> = ({ x, y, s, texto, cor = colors.tinta, tinta = colors.creme }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-texto.length * 14 - 24} y={-34} width={texto.length * 28 + 48} height={68} rx={20} fill={cor} stroke={colors.tinta} strokeWidth={6} />
      <T x={0} y={16} size={46} fill={tinta}>{texto}</T>
    </g>
  );

// Diagrama do corpo (cena 6): arroz, pão e fruta -> GLICOSE -> cérebro (com a bateria cheia ligada
// por um fio); o fígado manda gotas extras. Rótulos CÉREBRO e FÍGADO grandes; nenhum número.
export const DiagramaCorpo: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const cerebro = pop(frame, n(params.cerebro), true);
  const gotas = n(params.gotas);
  const fontes: [string, number, number][] = [
    ["arroz", n(params.arroz), 830],
    ["pao", n(params.pao), 1010],
    ["fruta", n(params.fruta), 1190],
  ];
  const figado = n(params.figado);
  const fabrica = n(params.fabrica);
  const H = { x: 620, y: 690 };
  const G = { x: 370, y: 1010 }; // nó GLICOSE
  const fig = { x: 700, y: 1010 };
  const paraCerebro = [{ x: G.x + 110, y: G.y }, { x: G.x + 150, y: 860 }, { x: H.x - 100, y: H.y + 100 }];
  const doFigado = [{ x: fig.x - 30, y: fig.y - 50 }, { x: H.x + 10, y: 880 }, { x: H.x + 10, y: H.y + 150 }];
  const deFonte = (y: number) => [{ x: 205, y }, { x: G.x - 115, y: G.y + (y - G.y) * 0.25 }];
  const glicose = pop(frame, gotas);
  const pulso = on(frame, figado) ? 1 + 0.08 * Math.max(0, Math.sin((frame - figado) / 3)) : 1;
  const nicoExpr = on(frame, n(params.normal)) ? "confusao" : on(frame, n(params.cerebro)) ? "preocupacao" : "atento";
  return (
    <>
      <Layer cam={cam} depth={0.2}>
        <SkyFill color={colors.ceu} />
        {Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={(i * 263) % 1080} cy={300 + ((i * 397) % 1300)} r={10 + (i % 3) * 6} fill={colors.branco} opacity={0.5} />
        ))}
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* silhueta genérica do corpo (chapada) */}
        <path d={`M ${H.x - 120} 1300 L ${H.x - 140} 960 Q ${H.x - 140} 870 ${H.x - 50} 860 L ${H.x - 40} 830 L ${H.x + 40} 830 L ${H.x + 50} 860 Q ${H.x + 140} 870 ${H.x + 140} 960 L ${H.x + 120} 1300 Z`} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} strokeLinejoin="round" />
        <circle cx={H.x} cy={H.y} r={160} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        {/* cérebro */}
        <g transform={`translate(${H.x} ${H.y - 10}) scale(${0.4 + 0.6 * cerebro})`}>
          <path d="M -110 20 Q -130 -60 -60 -90 Q -20 -120 20 -96 Q 80 -120 112 -60 Q 140 0 100 50 Q 60 80 0 70 Q -80 80 -110 20 Z" fill={colors.coralClaro} stroke={colors.tinta} strokeWidth={ink * 0.8} strokeLinejoin="round" />
          <path d="M -60 -40 q 20 20 0 40 M 0 -70 q 20 30 0 70 M 60 -40 q -20 20 0 50" fill="none" stroke={colors.coral} strokeWidth={ink * 0.6} strokeLinecap="round" />
        </g>
        {/* fio do cérebro até a bateria (cheia o tempo todo) */}
        {cerebro > 0 ? <path d={`M ${H.x + 110} ${H.y - 20} Q ${H.x + 170} ${H.y - 90} ${H.x + 190} ${H.y - 130}`} fill="none" stroke={colors.tinta} strokeWidth={10} strokeLinecap="round" opacity={Math.min(1, cerebro)} /> : null}
        <BateriaCerebro x={H.x + 290} y={H.y - 140} s={cerebro} nivel={1} />
        {/* fígado */}
        <g transform={`translate(${fig.x} ${fig.y}) scale(${pulso})`}>
          <path d="M -70 -10 Q -60 -50 20 -46 Q 80 -40 70 0 Q 50 40 -20 36 Q -70 30 -70 -10 Z" fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink * 0.7} strokeLinejoin="round" />
        </g>
        {/* setas: fontes -> GLICOSE -> cérebro; fígado -> cérebro */}
        {fontes.map(([tipo, at, y]) => <Seta key={tipo} pts={deFonte(y)} s={pop(frame, at + 4)} />)}
        <Seta pts={paraCerebro} s={glicose} />
        <Seta pts={doFigado} s={pop(frame, fabrica)} cor={colors.muroSombra} />
        {/* fontes de glicose (sem números) */}
        {fontes.map(([tipo, at, y]) => {
          const s = pop(frame, at, true);
          if (s <= 0) return null;
          return (
            <g key={tipo} transform={`translate(130 ${y}) scale(${s})`}>
              <circle r={76} fill={colors.branco} stroke={colors.tinta} strokeWidth={8} />
              {tipo === "arroz" ? (
                <g>
                  <path d="M -50 0 Q 0 64 50 0 Z" fill={colors.ceu} stroke={colors.tinta} strokeWidth={7} />
                  <path d="M -46 0 Q -28 -38 0 -34 Q 28 -38 46 0 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={6} />
                </g>
              ) : tipo === "pao" ? (
                <FatiaPao s={0.78} />
              ) : (
                <g>
                  <circle cx={0} cy={6} r={36} fill={colors.coral} stroke={colors.tinta} strokeWidth={7} />
                  <path d="M 0 -28 L 6 -48" stroke={colors.tinta} strokeWidth={7} strokeLinecap="round" />
                  <path d="M 8 -40 Q 28 -54 36 -34 Q 18 -28 8 -40 Z" fill={colors.folha} stroke={colors.tinta} strokeWidth={5} />
                </g>
              )}
            </g>
          );
        })}
        {/* gotinhas viajando pelas setas */}
        {Number.isFinite(gotas)
          ? Array.from({ length: 9 }, (_, i) => {
              if (frame < gotas + i * 6) return null;
              const k = (((frame - gotas - i * 6) / 50) % 1 + 1) % 1;
              const liver = Number.isFinite(fabrica) && frame > fabrica && i % 3 === 2;
              const fonte = fontes[i % 3][2];
              const caminho = liver ? doFigado : [...deFonte(fonte), { x: G.x, y: G.y }, ...paraCerebro];
              const p = aoLongo(caminho, k);
              return <path key={i} d="M 0 -18 Q 14 0 0 12 Q -14 0 0 -18 Z" transform={`translate(${p.x} ${p.y}) scale(1.3)`} fill={liver ? colors.muro : colors.amarelo} stroke={colors.tinta} strokeWidth={4} />;
            })
          : null}
        {/* nó GLICOSE */}
        <Rotulo x={G.x} y={G.y} s={glicose} texto="GLICOSE" cor={colors.amarelo} tinta={colors.tinta} />
        {/* rótulos (no mundo, acompanham a câmera) */}
        <Rotulo x={300} y={630} s={cerebro} texto="CÉREBRO" />
        {cerebro > 0 ? <Seta pts={[{ x: 425, y: 640 }, { x: 480, y: 660 }]} s={cerebro} /> : null}
        <Rotulo x={870} y={890} s={pop(frame, figado, true)} texto="FÍGADO" cor={colors.muroSombra} />
        {on(frame, figado) ? <Seta pts={[{ x: 800, y: 925 }, { x: 760, y: 975 }]} s={pop(frame, figado)} /> : null}
        {/* Nico pequeno no canto, esperando uma pane que não vem */}
        <NicoEm x={950} y={1300} s={0.32} pose={on(frame, n(params.normal)) ? "bracos_cruzados" : "parado"} expression={nicoExpr} look={[-0.9, -0.7]} />
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- lata_refrigerante + contador_colheres
const Colher: React.FC<{ s: number }> = ({ s }) => (
  <g transform={`scale(${s})`}>
    <rect x={-120} y={-8} width={130} height={16} rx={8} fill={colors.branco} stroke={colors.tinta} strokeWidth={7} />
    <ellipse cx={40} cy={0} rx={46} ry={28} fill={colors.branco} stroke={colors.tinta} strokeWidth={7} />
    <path d="M 4 -6 Q 40 -40 76 -6 Z" fill={colors.creme} stroke={colors.tinta} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
export const ContadorColheres: React.FC<{ x: number; y: number; s: number; valor: number; bate: number }> = ({ x, y, s, valor, bate }) =>
  s <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.15 * bate)})`}>
      <rect x={-150} y={-80} width={300} height={160} rx={30} fill={colors.tinta} />
      <rect x={-140} y={-70} width={280} height={140} rx={22} fill="none" stroke={colors.creme} strokeWidth={4} />
      <g transform="translate(-60 0) rotate(-20)">
        <Colher s={0.75} />
      </g>
      <T x={70} y={30} size={88} fill={colors.amarelo}>{String(valor)}</T>
    </g>
  );
export const LataGigante: React.FC<{ cam: Cam; frame: number; params: Params }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const entra = mola(frame, n(params.entra, 0));
  const cresce = mola(frame, n(params.cresce));
  const colheres = Array.isArray(params.colheres) ? (params.colheres as number[]) : [];
  const valor = colheres.filter((c) => on(frame, c)).length;
  const ultima = colheres[colheres.length - 1] ?? Infinity;
  const bate = colheres.reduce((acc, c) => Math.max(acc, on(frame, c) ? Math.max(0, 1 - (frame - c) / 8) : 0), 0);
  const nicoExpr = on(frame, ultima + 8) ? "cetica" : valor >= 6 ? "susto" : valor >= 1 ? "surpresa" : "atento";
  const tremor = bate * 4;
  // composição: texto de tela (240–430), letreiro da OMS logo abaixo, contador alto no centro,
  // lata à esquerda, Nico inteiro à direita, colheres na mesa e toalha xadrez enchendo o rodapé
  const MESA = 1180;
  const pos = (i: number) => ({ x: 120 + (i % 5) * 150, y: MESA + 34 + Math.floor(i / 5) * 72 });
  return (
    <>
      <Layer cam={cam} depth={0.3}>
        <SkyFill color={colors.coralClaro} />
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} x={-200 + i * 180} y={0} width={70} height={1400} fill={colors.creme} opacity={0.35} />
        ))}
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* mesa com toalha xadrez */}
        <rect x={-300} y={MESA} width={1680} height={170} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={-300} y={MESA + 170} width={1680} height={700} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        {Array.from({ length: 13 }, (_, c) =>
          Array.from({ length: 6 }, (_, r) =>
            (c + r) % 2 ? <rect key={`${c}-${r}`} x={-300 + c * 110} y={MESA + 170 + r * 110} width={110} height={110} fill={colors.coral} /> : null,
          ),
        )}
        <path d={`M -300 ${MESA + 170} L 1380 ${MESA + 170}`} stroke={colors.tinta} strokeWidth={ink} />
        {/* lata gigante, genérica e sem marca */}
        <g transform={`translate(${290 + tremor * Math.sin(frame * 3)} ${MESA + 10 - (1 - entra) * 900}) scale(${(0.86 + 0.18 * cresce) * 2.45})`}>
          <Lata x={0} y={0} s={1} />
          <path d="M -40 -170 L -40 -86" stroke={colors.branco} strokeWidth={10} strokeLinecap="round" opacity={0.5} />
        </g>
        {/* colheres de chá cheias de açúcar, uma a uma */}
        {colheres.map((c, i) => {
          const s = pop(frame, c, true);
          if (s <= 0) return null;
          const p = pos(i);
          return (
            <g key={i} transform={`translate(${p.x} ${p.y - (1 - Math.min(1, s)) * 60}) rotate(-8)`}>
              <Colher s={s * 0.9} />
            </g>
          );
        })}
        <NicoEm x={NICO7.x} y={MESA + 12} s={NICO7.s} pose={valor >= 6 ? "mao_levantada" : "parado"} expression={nicoExpr} look={on(frame, ultima + 8) ? [0, 0] : [-0.9, 0.3]} />
      </Layer>
      <Rodape texto="OMS: AÇÚCAR LIVRE < 10% DAS CALORIAS" y={530} />
      <ContadorColheres x={625} y={690} s={0.95 * pop(frame, colheres[0] ?? Infinity)} valor={valor} bate={bate} />
    </>
  );
};
export const NICO7 = { x: 900, s: 0.48 };
