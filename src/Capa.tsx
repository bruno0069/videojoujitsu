import React from "react";
import { AbsoluteFill } from "remotion";
import { PessoaDefs } from "./components/backgrounds/Ep04";
import { LuaDisco, OrlaRio } from "./components/backgrounds/Ep06";
import { TERRA7, TerraTunel } from "./components/backgrounds/Ep07";
import { Cantina } from "./components/backgrounds/Ep08";
import { CalendarioTopo, Exame } from "./components/backgrounds/Ep08v2";
import { BASE_CAM } from "./components/Camera";
import { Globe } from "./components/elements/Globe";
import { InfoLabel } from "./components/elements/Props";
import { InkScale } from "./components/Ink";
import { Nico } from "./components/Nico";
import { MilkyWay, SkyFill, Stars } from "./components/Sky";
import { colors, fonts, ink, onScreenText as t } from "./theme";

// Capa do ep02 (imagem parada 1080×1920): mesmo globo, mesmo Nico e a mesma caixa de título
// do vídeo, só maiores. O texto fica no terço de cima (a interface do Shorts cobre o rodapé).
export const Capa02: React.FC = () => {
  const g = { x: 610, y: 905, r: 340 };
  const nico = { x: 290, y: 2420, s: 1.25 };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.noite }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={0} />
        <InkScale scale={1}>
          <Globe x={g.x} y={g.y} r={g.r} lon={-62} equador />
          {/* seta de rotação do quadro da sala, travada por um "pare" */}
          <path d={`M ${g.x - g.r - 40} ${g.y + 120} Q ${g.x} ${g.y + g.r + 150} ${g.x + g.r + 40} ${g.y + 120}`} fill="none" stroke={colors.tinta} strokeWidth={ink.stroke * 2.6} strokeLinecap="round" />
          <path d={`M ${g.x - g.r - 40} ${g.y + 120} Q ${g.x} ${g.y + g.r + 150} ${g.x + g.r + 40} ${g.y + 120}`} fill="none" stroke={colors.amarelo} strokeWidth={ink.stroke * 1.3} strokeLinecap="round" />
          <InfoLabel x={g.x + g.r * 0.5} y={g.y - 80} text="≈ 1.700 km/h" fontSize={58} />
          <g transform={`translate(${nico.x} ${nico.y}) scale(${nico.s})`}>
            <Nico pose="olhando_para_cima" expression="surpresa" look={[0.8, -0.9]} />
          </g>
        </InkScale>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 60,
          right: 60,
          padding: "26px 40px",
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `inset 0 0 0 10px ${t.boxColor}, inset 0 0 0 15px ${t.innerLine}, 0 ${ink.stroke * 0.8}px 0 ${t.borderColor}`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: 112,
          lineHeight: 1.02,
          color: t.textColor,
        }}
      >
        E SE A TERRA
        <br />
        PARASSE DE <span style={{ color: t.highlightColor }}>GIRAR?</span>
      </div>
    </AbsoluteFill>
  );
};

// Capa do ep04: a Terra com a humanidade pulando em volta (as mesmas silhuetas do vídeo) e o
// Nico pulando na frente, com a mesma pose `pulando`. Título no terço de cima.
export const Capa04: React.FC = () => {
  const g = { x: 640, y: 1000, r: 310 };
  const nico = { x: 270, y: 1660, s: 0.72 };
  const N = 30;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.noite }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <SkyFill color={colors.noite} />
        <MilkyWay bg={colors.noite} />
        <Stars frame={0} />
        <InkScale scale={1}>
          <PessoaDefs id="capa04" />
          {/* a humanidade em volta do planeta, todos no ar com os braços para cima */}
          {Array.from({ length: N }, (_, i) => {
            const a = (i / N) * 360;
            return (
              <g key={i} transform={`rotate(${a} ${g.x} ${g.y}) translate(${g.x} ${g.y - g.r - 22}) scale(0.085)`}>
                <use href={`#capa04-b${i % 3}`} />
              </g>
            );
          })}
          <Globe x={g.x} y={g.y} r={g.r} lon={-55} />
          {/* risquinhos de movimento sob o Nico */}
          {[-70, 0, 70].map((dx, i) => (
            <path key={i} d={`M ${nico.x + dx * 0.8} ${nico.y + 30} L ${nico.x + dx * 0.8} ${nico.y + 120}`} stroke={colors.amarelo} strokeWidth={ink.stroke * 1.4} strokeLinecap="round" />
          ))}
          <g transform={`translate(${nico.x} ${nico.y}) scale(${nico.s})`}>
            <Nico pose="pulando" expression="surpresa" look={[0.6, -0.8]} />
          </g>
          <InfoLabel x={g.x + 90} y={g.y + g.r + 170} text="8 bilhões de pessoas" fontSize={52} />
        </InkScale>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 60,
          right: 60,
          padding: "26px 40px",
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `inset 0 0 0 10px ${t.boxColor}, inset 0 0 0 15px ${t.innerLine}, 0 ${ink.stroke * 0.8}px 0 ${t.borderColor}`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: 104,
          lineHeight: 1.02,
          color: t.textColor,
        }}
      >
        E SE TODO MUNDO
        <br />
        <span style={{ color: t.highlightColor }}>PULASSE</span> JUNTO?
      </div>
    </AbsoluteFill>
  );
};

// Capa do ep06 v07 (episódio 5): a orla do fim de tarde do vídeo, a Lua com o dobro da largura
// (contorno tracejado da Lua de hoje por dentro) e o Nico olhando para cima, como na abertura.
export const Capa06: React.FC = () => {
  const lua = { x: 720, y: 660, r: 220 };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.noite }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <InkScale scale={1}>
          <OrlaRio cam={BASE_CAM} frame={0} params={{ semLua: 1 }} />
          <LuaDisco x={lua.x} y={lua.y} r={lua.r} />
          <circle cx={lua.x} cy={lua.y} r={lua.r / 2} fill="none" stroke={colors.tinta} strokeWidth={ink.stroke * 0.8} strokeDasharray={`${ink.stroke * 1.4} ${ink.stroke * 1.1}`} />
          <g transform="translate(300 1800) scale(0.98)">
            <Nico pose="olhando_para_cima" expression="surpresa" look={[0.8, -0.9]} />
          </g>
        </InkScale>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 60,
          right: 60,
          padding: "26px 40px",
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `inset 0 0 0 10px ${t.boxColor}, inset 0 0 0 15px ${t.innerLine}, 0 ${ink.stroke * 0.8}px 0 ${t.borderColor}`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: 108,
          lineHeight: 1.02,
          color: t.textColor,
        }}
      >
        E SE A LUA
        <br />
        FOSSE <span style={{ color: t.highlightColor }}>2×</span> MAIOR?
      </div>
    </AbsoluteFill>
  );
};

// Capa do episódio 6 (composição Ep07): a Terra em corte com o túnel e o Nico de óculos caindo na
// boca do túnel. Título no terço de cima, dentro do recorte 4:5 do feed do Instagram (y 285–1635).
export const Capa07: React.FC = () => {
  const k = 1.18;
  const g = { x: 540, y: 1500 };
  const nico = { x: 545, y: 1010, s: 0.5 };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.noiteEscura }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <InkScale scale={1}>
          <g transform={`translate(${g.x} ${g.y}) scale(${k}) translate(${-TERRA7.x} ${-TERRA7.y})`}>
            <InkScale scale={k}>
              <TerraTunel cam={BASE_CAM} frame={0} params={{}} />
            </InkScale>
          </g>
          {/* disco chapado atrás do Nico: o cabelo escuro não some no céu */}
          <circle cx={nico.x} cy={nico.y - 130} r={290} fill={colors.noite} />
          {/* linhas de velocidade acima do Nico (ele está caindo) */}
          {[-330, -270, 260, 320].map((dx, i) => (
            <rect key={i} x={nico.x + dx - 6} y={nico.y - 300 - (i % 2) * 90} width={12} height={190 + (i % 3) * 50} rx={6} fill={colors.creme} opacity={0.6} />
          ))}
          {/* adesivo de calor */}
          <g transform="translate(860 1170) rotate(8)">
            <rect x={-170} y={-70} width={340} height={140} rx={22} fill={colors.amarelo} stroke={colors.tinta} strokeWidth={12} />
            <text x={0} y={26} textAnchor="middle" fontFamily={fonts.main} fontWeight={fonts.weight} fontSize={72} fill={colors.coral} stroke={colors.tinta} strokeWidth={12} paintOrder="stroke">5.000 °C</text>
          </g>
          <g transform={`translate(${nico.x} ${nico.y}) rotate(-14) scale(${nico.s}) translate(0 560)`}>
            <InkScale scale={nico.s}>
              <Nico pose="caindo" expression="susto" oculos suor look={[0, 0.6]} />
            </InkScale>
          </g>
        </InkScale>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 60,
          right: 60,
          padding: "26px 40px",
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `inset 0 0 0 10px ${t.boxColor}, inset 0 0 0 15px ${t.innerLine}, 0 ${ink.stroke * 0.8}px 0 ${t.borderColor}`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: 92,
          lineHeight: 1.02,
          color: t.textColor,
        }}
      >
        E SE VOCÊ PULASSE
        <br />
        ATÉ O <span style={{ color: t.highlightColor }}>CENTRO</span>
        <br />
        <span style={{ color: t.highlightColor }}>DA TERRA?</span>
      </div>
    </AbsoluteFill>
  );
};

// Capa do episódio 7 (açúcar, composição Ep08V02): a cantina do episódio com o Nico surpreso em
// primeiro plano, o calendário de 7 quadradinhos e o papel de exame com as barras descendo.
// Título no terço de cima, tudo importante dentro do recorte 4:5 do feed (y 285–1635).
export const Capa08: React.FC = () => {
  const cam = { zoom: 1.35, x: 360, y: 1000 };
  return (
    <AbsoluteFill style={{ backgroundColor: colors.creme }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <InkScale scale={1}>
          <Cantina cam={cam} frame={0} params={{ semItens: 1, pose0: 1, expr0: 1, semAtendente: 1 }} />
          <g transform="translate(0 115)">
            <CalendarioTopo frame={30} params={{ calDe: 0, calBase: 3 }} />
          </g>
          {/* papel de exame grande, com as barras já descidas e a seta para baixo */}
          <g transform="translate(830 1330) rotate(-6) scale(1.45)">
            <InkScale scale={1.45}>
              <Exame frame={30} baixa={0} />
            </InkScale>
          </g>
          <g transform="translate(905 905) rotate(-6)">
            <path d="M -26 -90 L 26 -90 L 26 10 L 60 10 L 0 90 L -60 10 L -26 10 Z" fill={colors.coral} stroke={colors.tinta} strokeWidth={ink.stroke} strokeLinejoin="round" />
          </g>
        </InkScale>
      </svg>
      <div
        style={{
          position: "absolute",
          top: 300,
          left: 60,
          right: 60,
          padding: "26px 40px",
          backgroundColor: t.boxColor,
          border: `${ink.stroke * 0.6}px solid ${t.borderColor}`,
          borderRadius: t.radius,
          boxShadow: `inset 0 0 0 10px ${t.boxColor}, inset 0 0 0 15px ${t.innerLine}, 0 ${ink.stroke * 0.8}px 0 ${t.borderColor}`,
          textAlign: "center",
          fontFamily: fonts.main,
          fontWeight: fonts.weight,
          fontSize: 92,
          lineHeight: 1.02,
          color: t.textColor,
        }}
      >
        E SE VOCÊ FICASSE
        <br />
        <span style={{ color: t.highlightColor }}>7 DIAS</span> SEM <span style={{ color: t.highlightColor }}>AÇÚCAR?</span>
      </div>
    </AbsoluteFill>
  );
};
