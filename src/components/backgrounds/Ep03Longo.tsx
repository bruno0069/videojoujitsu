import React, { useId } from "react";
import { Easing, interpolate } from "remotion";
import { colors, fonts, sombra } from "../../theme";
import { Cam, Layer } from "../Camera";
import { Globe } from "../elements/Globe";
import { Sun } from "../elements/Sun";
import { useInk } from "../Ink";
import { PacoteBiscoito } from "./Ep03";

// Cenários do ep03 longo (E se o Nico tivesse que abandonar a Terra amanhã?): a cabine da nave
// (parte da cápsula do ep03, sem banco: aqui ele flutua) e o habitat em Marte. Mesma paleta,
// mesmo traço e as mesmas peças (globo, painel, calendário, pacote de biscoitos).

const n = (v: number | number[] | undefined, fb = Infinity) => (typeof v === "number" ? v : fb);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ramp = (frame: number, a: number, b: number, opts: Parameters<typeof interpolate>[3] = clamp) =>
  Number.isFinite(a) ? interpolate(frame, [a, Math.max(a + 1, b)], [0, 1], opts) : 0;

// ---------------------------------------------------------------- nave_interior
// `terra`: a Terra começa a encolher na escotilha; `calendario`/`calendarioAte`/`dias`: contador
// de dias (acelera); `migalhas`: o biscoito esfarela e as migalhas saem flutuando.
export const NAVE = { escotilha: { x: 760, y: 560, r: 190 }, biscoito: { x: 700, y: 800 }, calendario: { x: 200, y: 520 } };
export const NaveInterior: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const e = NAVE.escotilha;
  const terra = ramp(frame, n(params.terra), n(params.terra) + 150, { ...clamp, easing: Easing.out(Easing.cubic) });
  const terraR = 150 - 130 * terra;
  const de = n(params.calendario);
  const k = ramp(frame, de, n(params.calendarioAte, de + 240), { ...clamp, easing: Easing.in(Easing.cubic) });
  const dia = Math.max(1, Math.round(1 + (n(params.dias, 228) - 1) * k));
  const mig = n(params.migalhas);
  const b = NAVE.biscoito;
  const c = NAVE.calendario;
  return (
    <>
      <Layer cam={cam} depth={0.7}>
        <rect x={-1000} y={-1000} width={3080} height={3700} fill={sombra(colors.creme)} />
        {/* casco: nervuras curvas e painéis */}
        {[-240, 120, 480, 840, 1200].map((px) => (
          <rect key={px} x={px} y={200} width={330} height={1180} rx={60} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        ))}
        {/* alças de parede */}
        {[
          [40, 860],
          [400, 300],
          [1000, 940],
        ].map(([ax, ay]) => (
          <path key={`${ax}`} d={`M ${ax - 60} ${ay} L ${ax - 60} ${ay - 30} Q ${ax - 60} ${ay - 60} ${ax - 30} ${ay - 60} L ${ax + 30} ${ay - 60} Q ${ax + 60} ${ay - 60} ${ax + 60} ${ay - 30} L ${ax + 60} ${ay}`} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.2} strokeLinecap="round" />
        ))}
        {[
          [40, 860],
          [400, 300],
          [1000, 940],
        ].map(([ax, ay]) => (
          <path key={`c${ax}`} d={`M ${ax - 60} ${ay} L ${ax - 60} ${ay - 30} Q ${ax - 60} ${ay - 60} ${ax - 30} ${ay - 60} L ${ax + 30} ${ay - 60} Q ${ax + 60} ${ay - 60} ${ax + 60} ${ay - 30} L ${ax + 60} ${ay}`} fill="none" stroke={colors.amarelo} strokeWidth={ink * 1.0} strokeLinecap="round" />
        ))}
        {/* escotilha com a Terra ficando para trás */}
        <clipPath id={`esc-${id}`}>
          <circle cx={e.x} cy={e.y} r={e.r} />
        </clipPath>
        <g clipPath={`url(#esc-${id})`}>
          <rect x={e.x - e.r} y={e.y - e.r} width={e.r * 2} height={e.r * 2} fill={colors.noite} />
          {Array.from({ length: 12 }, (_, i) => (
            <circle key={i} cx={e.x - e.r + ((i * 97) % (e.r * 2))} cy={e.y - e.r + ((i * 61) % (e.r * 2))} r={3 + (i % 3) * 2} fill={colors.creme} opacity={0.5 + 0.5 * Math.sin(frame / 9 + i)} />
          ))}
          <Globe x={e.x + 40 * terra} y={e.y + 40 + 30 * terra} r={terraR} lon={-40 - frame * 0.6} grade={false} />
        </g>
        <circle cx={e.x} cy={e.y} r={e.r} fill="none" stroke={colors.tinta} strokeWidth={ink * 3} />
        <circle cx={e.x} cy={e.y} r={e.r} fill="none" stroke={colors.amarelo} strokeWidth={ink * 1.2} />
        {/* calendário de bordo */}
        <g transform={`translate(${c.x} ${c.y})`}>
          <rect x={-110} y={-120} width={220} height={240} rx={14} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
          <rect x={-110} y={-120} width={220} height={64} rx={14} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
          <text x={0} y={-76} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={36} fill={colors.creme}>DIA</text>
          <text x={0} y={66} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={dia > 99 ? 96 : 110} fill={colors.tinta}>{dia}</text>
        </g>
        {/* painel */}
        <g transform="translate(560 1120)">
          <rect x={-220} y={-80} width={440} height={160} rx={20} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={-150 + i * 100} cy={-20} r={18} fill={[colors.coral, colors.amarelo, colors.turquesa, colors.ceu][i]} stroke={colors.tinta} strokeWidth={ink * 0.5} opacity={i === Math.floor(frame / 10) % 4 ? 1 : 0.5} />
          ))}
          <rect x={-180} y={22} width={360} height={30} rx={10} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.5} />
        </g>
      </Layer>
      <Layer cam={cam} depth={1}>
        {/* pacote de biscoitos flutuando perto da boca do Nico, e as migalhas escapando */}
        <g transform={`translate(${b.x} ${b.y + Math.sin(frame / 15) * 16}) rotate(${frame * 0.7})`}>
          <PacoteBiscoito quantos={frame >= mig ? 2 : 3} />
        </g>
        {Number.isFinite(mig) && frame >= mig
          ? Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2 + 0.3;
              const t = frame - mig;
              const d = Math.min(420, t * (3 + (i % 4)));
              return <circle key={i} cx={b.x - 40 + Math.cos(a) * d} cy={b.y - 80 + Math.sin(a) * d + Math.sin(t / 10 + i) * 8} r={7 + (i % 3) * 3} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink * 0.4} />;
            })
          : null}
      </Layer>
    </>
  );
};

// ---------------------------------------------------------------- habitat_interior
// Base pequena: janela grande para o deserto (com a Terra como um pontinho azul), equipamentos,
// cama estreita, painel. `retorno`: o painel mostra "RETORNO: NÃO PROGRAMADO"; `alerta`: luz do
// painel piscando; `biscoito`: o pacote quase vazio na prateleira ganha destaque.
export const HABITAT = { janela: { x: 70, y: 330, w: 640, h: 620 }, painel: { x: 900, y: 560 }, biscoito: { x: 900, y: 930 } };
export const HabitatInterior: React.FC<{ cam: Cam; frame: number; params: Record<string, number | number[]> }> = ({ cam, frame, params }) => {
  const ink = useInk();
  const id = useId().replace(/:/g, "");
  const j = HABITAT.janela;
  const p = HABITAT.painel;
  const b = HABITAT.biscoito;
  const retorno = n(params.retorno);
  const mostra = frame >= retorno;
  const pisca = mostra && Math.floor((frame - retorno) / 8) % 2 === 0;
  const destaque = ramp(frame, n(params.biscoito), n(params.biscoito) + 8);
  return (
    <>
      <Layer cam={cam} depth={0.6}>
        <rect x={-1000} y={-1000} width={3080} height={3700} fill={sombra(colors.creme)} />
        {[-300, 760, 1100].map((px) => (
          <rect key={px} x={px} y={240} width={300} height={1080} rx={40} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        ))}
        {/* janela grande para o deserto */}
        <clipPath id={`jan-${id}`}>
          <rect x={j.x} y={j.y} width={j.w} height={j.h} rx={60} />
        </clipPath>
        <g clipPath={`url(#jan-${id})`}>
          <rect x={j.x} y={j.y} width={j.w} height={j.h} fill={colors.coralClaro} />
          <rect x={j.x} y={j.y + j.h * 0.45} width={j.w} height={j.h * 0.2} fill={colors.muro} opacity={0.45} />
          <Sun x={j.x + 120} y={j.y + 130} r={34} />
          <circle cx={j.x + j.w - 140} cy={j.y + 110} r={12} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.5} />
          <circle cx={j.x + j.w - 140} cy={j.y + 110} r={22 + 6 * Math.sin(frame / 12)} fill="none" stroke={colors.ceu} strokeWidth={ink * 0.4} opacity={0.6} />
          <path d={`M ${j.x - 20} ${j.y + j.h * 0.62} C ${j.x + 120} ${j.y + j.h * 0.5} ${j.x + 260} ${j.y + j.h * 0.55} ${j.x + 360} ${j.y + j.h * 0.6} C ${j.x + 460} ${j.y + j.h * 0.5} ${j.x + 560} ${j.y + j.h * 0.52} ${j.x + j.w + 20} ${j.y + j.h * 0.6} L ${j.x + j.w + 20} ${j.y + j.h} L ${j.x - 20} ${j.y + j.h} Z`} fill={sombra(colors.muro)} stroke={colors.tinta} strokeWidth={ink * 0.8} />
          <rect x={j.x} y={j.y + j.h * 0.72} width={j.w} height={j.h * 0.3} fill={colors.muroSombra} />
          {[0.2, 0.55, 0.85].map((fx, i) => (
            <ellipse key={i} cx={j.x + j.w * fx} cy={j.y + j.h * (0.82 + (i % 2) * 0.08)} rx={30 + i * 10} ry={14 + i * 4} fill={sombra(colors.muroSombra)} stroke={colors.tinta} strokeWidth={ink * 0.5} />
          ))}
        </g>
        <rect x={j.x} y={j.y} width={j.w} height={j.h} rx={60} fill="none" stroke={colors.tinta} strokeWidth={ink * 2.6} />
        <rect x={j.x} y={j.y} width={j.w} height={j.h} rx={60} fill="none" stroke={colors.creme} strokeWidth={ink * 1.1} />
        {/* painel / documento da missão */}
        <g transform={`translate(${p.x} ${p.y})`}>
          <rect x={-160} y={-170} width={320} height={300} rx={18} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
          <rect x={-136} y={-146} width={272} height={200} rx={10} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink * 0.6} />
          {mostra ? (
            <>
              <text x={0} y={-82} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={40} fill={colors.tinta}>RETORNO:</text>
              <text x={0} y={-30} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={34} fill={colors.coral} stroke={colors.tinta} strokeWidth={1.2} paintOrder="stroke">NÃO</text>
              <text x={0} y={14} textAnchor="middle" fontFamily={fonts.main} fontWeight={800} fontSize={34} fill={colors.coral} stroke={colors.tinta} strokeWidth={1.2} paintOrder="stroke">PROGRAMADO</text>
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <rect key={i} x={-110} y={-120 + i * 40} width={i % 2 ? 160 : 220} height={16} rx={8} fill={colors.creme} opacity={0.8} />)
          )}
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-80 + i * 80} cy={92} r={16} fill={i === 0 && pisca ? colors.coral : [colors.coral, colors.amarelo, colors.turquesa][i]} stroke={colors.tinta} strokeWidth={ink * 0.5} opacity={i === 0 ? (pisca ? 1 : 0.4) : 0.6} />
          ))}
        </g>
        {/* prateleira com o pacote de biscoitos quase vazio */}
        <rect x={760} y={1000} width={300} height={22} rx={8} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink * 0.6} />
        <g transform={`translate(${b.x} ${b.y}) rotate(-14) scale(${0.62 + 0.12 * destaque})`}>
          <PacoteBiscoito quantos={0} />
        </g>
      </Layer>
      <Layer cam={cam} depth={1}>
        <rect x={-1000} y={1300} width={3080} height={1400} fill={colors.chaoSombra} stroke={colors.tinta} strokeWidth={ink} />
        {/* cama estreita */}
        <rect x={720} y={1150} width={420} height={120} rx={20} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={980} y={1110} width={150} height={60} rx={20} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
        <rect x={720} y={1260} width={420} height={60} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} />
        {/* rack de equipamentos */}
        <g transform="translate(-40 1000)">
          <rect x={-60} y={-260} width={160} height={560} rx={14} fill={colors.noite} stroke={colors.tinta} strokeWidth={ink} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={60} cy={-220 + i * 60} r={10} fill={i % 2 ? colors.turquesa : colors.amarelo} opacity={(Math.floor(frame / 9) + i) % 3 === 0 ? 1 : 0.4} />
          ))}
        </g>
      </Layer>
    </>
  );
};
