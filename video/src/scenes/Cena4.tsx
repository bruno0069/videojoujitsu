import React from "react";
import { useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Check, FirstAidCross, GasCloud, SCBA, Warning, XIcon } from "../icons";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena4");
const cue = (i: number) => cueFrame(scene, i);

const GasLabel: React.FC<{ text: string; x: number; y: number; from: number }> = ({ text, x, y, from }) => {
  const f = useCurrentFrame();
  return (
    <Reveal from={from} dy={20} style={{ position: "absolute", left: x, top: y + Math.sin(f / 18 + x) * 6 }}>
      <div
        style={{
          background: C.ink,
          color: C.yellow,
          fontSize: 54,
          fontWeight: 800,
          padding: "10px 28px",
          borderRadius: 40,
          border: `4px solid ${C.yellow}`,
        }}
      >
        {text}
      </div>
    </Reveal>
  );
};

const Symptom: React.FC<{ text: string; from: number; severe?: boolean }> = ({ text, from, severe }) => (
  <Reveal from={from} dx={60} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 22,
        fontSize: 46,
        fontWeight: 700,
        background: severe ? C.redLight : C.white,
        border: `4px solid ${severe ? C.red : "#D7DED9"}`,
        borderRadius: 18,
        padding: "18px 28px",
      }}
    >
      <Warning size={56} />
      {text}
    </div>
  </Reveal>
);

const StepRow: React.FC<{ n: number; text: string; from: number }> = ({ n, text, from }) => (
  <Reveal from={from} dx={-60} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        background: C.white,
        borderLeft: `12px solid ${C.green}`,
        borderRadius: 16,
        padding: "0 26px",
        height: 96,
        boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          background: C.green,
          color: C.white,
          fontSize: 38,
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div style={{ fontSize: 44, fontWeight: 700 }}>{text}</div>
    </div>
  </Reveal>
);

export const Cena4: React.FC = () => {
  return (
    <SceneBg>
      <Header num="PARTE 3" title="Inalação de gases tóxicos" icon={<Warning size={76} />} />

      {/* Fase A: gases e sintomas */}
      <Reveal from={0} to={cue(2)} dy={0} style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", left: 90, top: 200, width: 820, height: 620 }}>
          <GasCloud size={820} style={{ position: "absolute", left: 0, top: 0 }} />
          <GasLabel text="Cloro" x={110} y={170} from={cue(0) + 70} />
          <GasLabel text="CO" x={480} y={130} from={cue(0) + 110} />
          <GasLabel text="H₂S" x={320} y={380} from={cue(0) + 160} />
        </div>
        <div style={{ position: "absolute", left: 1000, top: 190, width: 830, display: "flex", flexDirection: "column", gap: 22 }}>
          <Reveal from={cue(1)} dy={20}>
            <div style={{ fontSize: 44, fontWeight: 800, color: C.gray, letterSpacing: 3 }}>SINAIS E SINTOMAS</div>
          </Reveal>
          <Symptom text="Tosse" from={cue(1) + 15} />
          <Symptom text="Irritação nos olhos" from={cue(1) + 35} />
          <Symptom text="Falta de ar" from={cue(1) + 70} />
          <Symptom text="Perda de consciência" from={cue(1) + 130} severe />
        </div>
      </Reveal>

      {/* Fase B: passos + alerta vermelho */}
      <div style={{ position: "absolute", left: 90, top: 165, width: 860, display: "flex", flexDirection: "column", gap: 16 }}>
        <StepRow n={1} text="Acionar emergência" from={cue(2)} />
        <StepRow n={2} text="Evacuar" from={cue(2) + 40} />
        <StepRow n={3} text="Ar fresco e repouso" from={cue(4)} />
        <StepRow n={4} text="Lavar os olhos" from={cue(5)} />
        <StepRow n={5} text="Informar o gás" from={cue(6)} />
      </div>

      <Reveal from={cue(3)} dx={80} dy={0} style={{ position: "absolute", left: 1000, top: 165, width: 830 }}>
        <div
          style={{
            background: C.red,
            color: C.white,
            borderRadius: 24,
            padding: "28px 36px",
            height: 544,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <XIcon size={100} style={{ flexShrink: 0, borderRadius: 50, boxShadow: "0 0 0 5px white" }} />
            <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.15 }}>
              NUNCA entre sem treinamento e equipamento adequado
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 26,
              background: C.white,
              color: C.ink,
              borderRadius: 18,
              padding: "16px 26px",
            }}
          >
            <SCBA size={230} />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 40, fontWeight: 800, color: C.green }}>
                <Check size={48} /> Respirador autônomo
              </div>
              <div style={{ fontSize: 32, fontWeight: 600, marginTop: 10, color: C.gray }}>
                Sem ele, você pode virar mais uma vítima.
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal from={cue(7)} dy={40} style={{ position: "absolute", left: 90, top: 728, width: 1740 }}>
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
            gap: 24,
            fontSize: 50,
            fontWeight: 800,
            color: C.ink,
          }}
        >
          <FirstAidCross size={58} />
          Mesmo melhorando: avaliação médica
        </div>
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
