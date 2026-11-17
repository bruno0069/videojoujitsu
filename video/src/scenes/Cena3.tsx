import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Drop, Flame, Phone, Timer, Warning, Watch, XIcon } from "../icons";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena3");
const cue = (i: number) => cueFrame(scene, i);

const Step: React.FC<{ n: number; title: string; detail: string; icon: React.ReactNode; from: number }> = ({
  n,
  title,
  detail,
  icon,
  from,
}) => (
  <Reveal from={from} dx={-80} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 36,
        background: C.white,
        borderRadius: 24,
        padding: "20px 36px",
        height: 176,
        boxSizing: "border-box",
        boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
        borderLeft: `14px solid ${C.green}`,
      }}
    >
      <div
        style={{
          width: 108,
          height: 108,
          borderRadius: 54,
          background: C.green,
          color: C.white,
          fontSize: 64,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 54, fontWeight: 800 }}>{title}</div>
        <div style={{ fontSize: 34, fontWeight: 500, color: C.gray, marginTop: 6 }}>{detail}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{icon}</div>
    </div>
  </Reveal>
);

const Forbidden: React.FC<{ text: string; from: number }> = ({ text, from }) => (
  <Reveal from={from} dx={60} dy={0}>
    <div style={{ display: "flex", alignItems: "center", gap: 26, height: 92 }}>
      <XIcon size={70} />
      <div style={{ fontSize: 50, fontWeight: 700, color: C.ink }}>{text}</div>
    </div>
  </Reveal>
);

const Alert: React.FC<{ title: string; text: string; icon: React.ReactNode; from: number }> = ({ title, text, icon, from }) => (
  <Reveal from={from} dy={50}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 40,
        background: C.yellow,
        border: `8px solid ${C.ink}`,
        borderRadius: 24,
        padding: "28px 44px",
        height: 250,
        boxSizing: "border-box",
      }}
    >
      <Warning size={150} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 58, fontWeight: 800, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 44, fontWeight: 600, color: C.ink, marginTop: 8 }}>{text}</div>
      </div>
      {icon}
    </div>
  </Reveal>
);

export const Cena3: React.FC = () => {
  const frame = useCurrentFrame();
  const timerP = interpolate(frame, [cue(1), cue(2)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneBg>
      <Header num="PARTE 2" title="Queimaduras" icon={<Flame size={76} />} />

      {/* Fase A: 3 passos */}
      <Reveal from={0} to={cue(3)} dy={0} style={{ position: "absolute", left: 140, top: 170, width: 1640, display: "flex", flexDirection: "column", gap: 26 }}>
        <Step n={1} title="Afastar da fonte de calor" detail="Desde que não ofereça risco a quem socorre" icon={<Flame size={130} />} from={cue(0)} />
        <Step
          n={2}
          title="Água corrente: 10 a 20 min"
          detail="Limpa, fria ou em temperatura ambiente"
          icon={
            <>
              <Drop size={110} />
              <Timer size={140} progress={timerP} label={`${Math.round(10 + timerP * 10)} min`} />
            </>
          }
          from={cue(1)}
        />
        <Step n={3} title="Retirar anéis e relógios" detail="Antes que ocorra o inchaço" icon={<Watch size={130} />} from={cue(2)} />
      </Reveal>

      {/* Fase B: proibições */}
      <Reveal from={cue(3)} to={cue(5)} dy={0} style={{ position: "absolute", left: 140, top: 170, width: 1640, height: 640 }}>
        <div
          style={{
            display: "flex",
            background: C.white,
            borderRadius: 24,
            border: `8px solid ${C.red}`,
            height: 640,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 520,
              background: C.red,
              color: C.white,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 24,
            }}
          >
            <XIcon size={210} style={{ filter: "drop-shadow(0 0 0 white)" }} />
            <div style={{ fontSize: 70, fontWeight: 800, letterSpacing: 2 }}>NÃO FAÇA</div>
          </div>
          <div style={{ flex: 1, padding: "40px 60px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 }}>
            <Forbidden text="Puxar roupa grudada" from={cue(3)} />
            <Forbidden text="Gelo" from={cue(4)} />
            <Forbidden text="Pasta de dente" from={cue(4) + 20} />
            <Forbidden text="Manteiga ou receitas caseiras" from={cue(4) + 40} />
            <Forbidden text="Estourar bolhas" from={cue(4) + 75} />
          </div>
        </div>
      </Reveal>

      {/* Fase C: alertas amarelos */}
      <div style={{ position: "absolute", left: 140, top: 190, width: 1640, display: "flex", flexDirection: "column", gap: 50 }}>
        <Alert title="Queimadura química" text="Água em abundância + informar o produto" icon={<Drop size={130} />} from={cue(5)} />
        <Alert
          title="Grave ou extensa"
          text="Ligar 192 + cobrir com pano limpo"
          icon={
            <div style={{ width: 140, height: 140, borderRadius: 70, background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Phone size={84} />
            </div>
          }
          from={cue(6)}
        />
      </div>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
