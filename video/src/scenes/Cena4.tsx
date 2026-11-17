import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { FirstAidCross, GasCloud, Warning, XIcon } from "../icons";
import { Bia } from "../characters/Bia";
import { Teo } from "../characters/Teo";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena4");
const cue = (i: number) => cueFrame(scene, i);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PANEL = { left: 1070, width: 770 };
const FLOOR = 815;
const CHAR_H = 440;

const GasLabel: React.FC<{ text: string; x: number; y: number; from: number }> = ({ text, x, y, from }) => {
  const f = useCurrentFrame();
  return (
    <Reveal from={from} dy={20} style={{ position: "absolute", left: x, top: y + Math.sin(f / 18 + x) * 6 }}>
      <div style={{ background: C.ink, color: C.yellow, fontSize: 46, fontWeight: 800, padding: "8px 24px", borderRadius: 40 }}>{text}</div>
    </Reveal>
  );
};

const Symptom: React.FC<{ text: string; from: number; severe?: boolean }> = ({ text, from, severe }) => (
  <Reveal from={from} dx={60} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        fontSize: 44,
        fontWeight: 700,
        background: severe ? C.redLight : C.white,
        border: `4px solid ${severe ? C.red : "#D7DED9"}`,
        borderRadius: 18,
        padding: "16px 26px",
      }}
    >
      <Warning size={52} />
      {text}
    </div>
  </Reveal>
);

const StepRow: React.FC<{ n: number; text: string; from: number }> = ({ n, text, from }) => (
  <Reveal from={from} dx={60} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        background: C.white,
        borderLeft: `12px solid ${C.green}`,
        borderRadius: 16,
        padding: "0 24px",
        height: 96,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: 31,
          background: C.green,
          color: C.white,
          fontSize: 36,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 42, fontWeight: 700 }}>{text}</div>
    </div>
  </Reveal>
);

export const Cena4: React.FC = () => {
  const frame = useCurrentFrame();
  const ease = Easing.bezier(0.45, 0, 0.2, 1);
  const moveStart = cue(4);
  const moveEnd = cue(4) + 75;
  const teoX = interpolate(frame, [moveStart, moveEnd], [300, 860], { ...clamp, easing: ease });
  const biaX = interpolate(frame, [moveStart, moveEnd], [140, 700], { ...clamp, easing: ease });
  const teoPose = frame < moveStart ? "tossindo" : frame < moveEnd ? "parado" : "sentado_repouso";
  const teoExpr = frame < moveEnd ? "incomodado" : "neutra";

  return (
    <SceneBg>
      <Header num="PARTE 3" title="Inalação de gases tóxicos" icon={<Warning size={76} />} />

      {/* Zona de ar fresco */}
      <div
        style={{
          position: "absolute",
          left: 660,
          top: 300,
          width: 370,
          height: FLOOR - 300 + 10,
          borderRadius: 26,
          background: C.greenLight,
          border: `6px solid ${C.green}`,
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
          paddingTop: 18,
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 800, color: C.green, letterSpacing: 2 }}>AR FRESCO</div>
      </div>

      {/* Nuvem de gás (atrás e na frente do Téo) */}
      <GasCloud size={680} style={{ position: "absolute", left: -20, top: 150 }} />
      <GasCloud size={640} style={{ position: "absolute", left: 0, top: 330 }} />
      <GasLabel text="Cloro" x={20} y={300} from={cue(0) + 70} />
      <GasLabel text="CO" x={455} y={370} from={cue(0) + 110} />
      <GasLabel text="H₂S" x={455} y={600} from={cue(0) + 160} />

      <Teo pose={teoPose} expressao={teoExpr} x={teoX} y={FLOOR} height={CHAR_H} />
      {frame >= cue(3) ? <Bia pose="com_respirador" x={biaX} y={FLOOR} height={CHAR_H} enterAt={cue(3) + 10} enterFrom="left" /> : null}

      <div style={{ position: "absolute", left: -20, top: 150, opacity: 0.28 }}>
        <GasCloud size={680} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 330, opacity: 0.28 }}>
        <GasCloud size={640} />
      </div>

      {/* Alerta vermelho */}
      <Reveal from={cue(3)} dy={-30} style={{ position: "absolute", left: 20, top: 140, width: 1010 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            background: C.red,
            color: C.white,
            borderRadius: 20,
            padding: "16px 26px",
            height: 140,
            boxSizing: "border-box",
          }}
        >
          <XIcon size={92} style={{ flexShrink: 0, borderRadius: 46, boxShadow: "0 0 0 5px white" }} />
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15 }}>NUNCA entre sem treinamento e equipamento adequado</div>
        </div>
      </Reveal>

      {/* Painel direito — fase A: sintomas */}
      <Reveal from={0} to={cue(2)} dy={0} style={{ position: "absolute", left: PANEL.left, top: 175, width: PANEL.width, display: "flex", flexDirection: "column", gap: 20 }}>
        <Reveal from={cue(1)} dy={20}>
          <div style={{ fontSize: 40, fontWeight: 800, color: C.gray, letterSpacing: 3 }}>SINAIS E SINTOMAS</div>
        </Reveal>
        <Symptom text="Tosse" from={cue(1) + 15} />
        <Symptom text="Irritação nos olhos" from={cue(1) + 35} />
        <Symptom text="Falta de ar" from={cue(1) + 70} />
        <Symptom text="Perda de consciência" from={cue(1) + 130} severe />
      </Reveal>

      {/* Painel direito — fase B: passos */}
      <div style={{ position: "absolute", left: PANEL.left, top: 160, width: PANEL.width, display: "flex", flexDirection: "column", gap: 16 }}>
        <StepRow n={1} text="Acionar emergência" from={cue(2)} />
        <StepRow n={2} text="Evacuar" from={cue(2) + 40} />
        <StepRow n={3} text="Ar fresco e repouso" from={cue(4)} />
        <StepRow n={4} text="Lavar os olhos" from={cue(5)} />
        <StepRow n={5} text="Informar o gás" from={cue(6)} />
      </div>

      <Reveal from={cue(7)} dy={40} style={{ position: "absolute", left: PANEL.left, top: 722, width: PANEL.width }}>
        <div
          style={{
            background: C.yellow,
            border: `6px solid ${C.ink}`,
            borderRadius: 18,
            height: 96,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontSize: 34,
            fontWeight: 800,
            color: C.ink,
          }}
        >
          <FirstAidCross size={46} />
          Mesmo melhorando: avaliação médica
        </div>
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
