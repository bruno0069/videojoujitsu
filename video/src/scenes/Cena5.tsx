import React from "react";
import { C } from "../theme";
import { FirstAidCross, Heart, Helmet, Training } from "../icons";
import { Bia } from "../characters/Bia";
import { Teo } from "../characters/Teo";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena5");
const cue = (i: number) => cueFrame(scene, i);

const AREA = { left: 660, width: 1200 };

const Pillar: React.FC<{ icon: React.ReactNode; label: string; from: number }> = ({ icon, label, from }) => (
  <Reveal from={from} dy={60}>
    <div
      style={{
        width: 370,
        height: 290,
        background: C.white,
        borderRadius: 28,
        border: `6px solid ${C.green}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
      }}
    >
      {icon}
      <div style={{ fontSize: 46, fontWeight: 800, color: C.greenDark }}>{label}</div>
    </div>
  </Reveal>
);

export const Cena5: React.FC = () => {
  return (
    <SceneBg>
      <Header num="CONCLUSÃO" title="Para finalizar" icon={<FirstAidCross size={76} bg={C.white} fg={C.green} />} />

      <Teo pose="polegar_ok" expressao="aliviado" x={200} y={830} height={500} enterAt={6} enterFrom="left" />
      <Bia pose="polegar_ok" x={450} y={830} height={500} enterAt={14} enterFrom="left" />

      <div style={{ position: "absolute", left: AREA.left, width: AREA.width, top: 160, display: "flex", justifyContent: "space-between" }}>
        <Pillar icon={<Heart size={140} />} label="Vida" from={cue(0) + 10} />
        <Pillar icon={<Helmet size={140} />} label="EPI" from={cue(1) + 50} />
        <Pillar icon={<Training size={140} />} label="Treinamento" from={cue(1) + 110} />
      </div>

      <Reveal from={cue(2)} style={{ position: "absolute", left: AREA.left, width: AREA.width, top: 482 }}>
        <div
          style={{
            background: C.green,
            color: C.white,
            borderRadius: 22,
            padding: "22px 44px",
            fontSize: 54,
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          Prevenção e segurança são responsabilidade de todos.
        </div>
      </Reveal>

      <Reveal from={cue(3)} style={{ position: "absolute", left: AREA.left, width: AREA.width, top: 684, textAlign: "center", fontSize: 52, fontWeight: 800, color: C.green }}>
        Obrigado pela atenção!
      </Reveal>

      <Reveal
        from={cue(0)}
        dy={0}
        style={{ position: "absolute", left: AREA.left, width: AREA.width, top: 772, textAlign: "center", fontSize: 26, fontWeight: 500, color: C.gray }}
      >
        Fontes: Ministério da Saúde; Sociedade Brasileira de Queimaduras; Manual MSD
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
