import React from "react";
import { C } from "../theme";
import { FirstAidCross, Heart, Helmet, Training } from "../icons";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena5");
const cue = (i: number) => cueFrame(scene, i);

const Pillar: React.FC<{ icon: React.ReactNode; label: string; from: number }> = ({ icon, label, from }) => (
  <Reveal from={from} dy={60}>
    <div
      style={{
        width: 440,
        height: 330,
        background: C.white,
        borderRadius: 28,
        border: `6px solid ${C.green}`,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        boxShadow: "0 12px 28px rgba(0,0,0,0.10)",
      }}
    >
      {icon}
      <div style={{ fontSize: 48, fontWeight: 800, color: C.greenDark }}>{label}</div>
    </div>
  </Reveal>
);

export const Cena5: React.FC = () => {
  return (
    <SceneBg>
      <Header num="CONCLUSÃO" title="Para finalizar" icon={<FirstAidCross size={76} bg={C.white} fg={C.green} />} />

      <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", justifyContent: "center", gap: 70 }}>
        <Pillar icon={<Heart size={160} />} label="Vida" from={cue(0) + 10} />
        <Pillar icon={<Helmet size={160} />} label="EPI" from={cue(1) + 50} />
        <Pillar icon={<Training size={160} />} label="Treinamento" from={cue(1) + 110} />
      </div>

      <Reveal from={cue(2)} style={{ position: "absolute", left: 0, right: 0, top: 545, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            background: C.green,
            color: C.white,
            borderRadius: 22,
            padding: "26px 56px",
            fontSize: 60,
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          Prevenção e segurança são responsabilidade de todos.
        </div>
      </Reveal>

      <Reveal from={cue(3)} style={{ position: "absolute", left: 0, right: 0, top: 690, textAlign: "center", fontSize: 54, fontWeight: 800, color: C.green }}>
        Obrigado pela atenção!
      </Reveal>

      <Reveal
        from={cue(0)}
        dy={0}
        style={{ position: "absolute", left: 0, right: 0, top: 778, textAlign: "center", fontSize: 26, fontWeight: 500, color: C.gray }}
      >
        Fontes: Ministério da Saúde; Sociedade Brasileira de Queimaduras; Manual MSD
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
