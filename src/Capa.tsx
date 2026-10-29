import React from "react";
import { AbsoluteFill } from "remotion";
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
