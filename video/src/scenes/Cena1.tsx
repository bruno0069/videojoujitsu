import React from "react";
import { C } from "../theme";
import { FirstAidCross } from "../icons";
import { cueFrame, getScene } from "../timeline";
import { Reveal, SceneBg, Subtitles, useIn } from "../ui";

const scene = getScene("cena1");

export const Cena1: React.FC = () => {
  const crossIn = useIn(0, 15);
  return (
    <SceneBg color={C.green}>
      {/* Faixas diagonais sutis de sinalização */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(135deg, rgba(255,255,255,0.05) 0 40px, transparent 40px 80px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: C.white,
        }}
      >
        <div style={{ scale: `${0.6 + crossIn * 0.4}`, opacity: crossIn }}>
          <FirstAidCross size={150} bg={C.white} fg={C.green} />
        </div>
        <Reveal from={6} style={{ marginTop: 28, fontSize: 34, fontWeight: 600, letterSpacing: 4, opacity: 0.9 }}>
          TÉCNICO EM SEGURANÇA DO TRABALHO
        </Reveal>
        <Reveal from={10}>
          <div style={{ marginTop: 14, fontSize: 84, fontWeight: 800, textAlign: "center", lineHeight: 1.1, maxWidth: 1600 }}>
            A importância dos primeiros socorros na indústria
          </div>
        </Reveal>
      </div>

      <Reveal
        from={cueFrame(scene, 1)}
        style={{
          position: "absolute",
          left: 360,
          width: 1200,
          top: 545,
        }}
      >
        <div
          style={{
            background: C.white,
            color: C.ink,
            borderRadius: 22,
            borderLeft: `18px solid ${C.yellow}`,
            padding: "26px 44px",
            boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            rowGap: 10,
            fontSize: 40,
          }}
        >
          <div style={{ fontWeight: 800, color: C.green }}>Nome:</div>
          <div style={{ fontWeight: 600 }}>Caio Raphael de Souza Figueiredo</div>
          <div style={{ fontWeight: 800, color: C.green }}>R.A.:</div>
          <div style={{ fontWeight: 600 }}>26966498-9</div>
          <div style={{ fontWeight: 800, color: C.green }}>Polo:</div>
          <div style={{ fontWeight: 600 }}>Realengo</div>
        </div>
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
