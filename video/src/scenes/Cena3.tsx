import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Drop, Faucet, Flame, Phone, Timer, Warning, Watch, XIcon } from "../icons";
import { Bia } from "../characters/Bia";
import { Teo } from "../characters/Teo";
import { cueFrame, getScene, sceneFrames } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena3");
const cue = (i: number) => cueFrame(scene, i);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PANEL = { left: 90, width: 1110 };
const FLOOR = 830;
const CHAR_H = 470;

const Step: React.FC<{ n: number; title: string; detail: string; icon: React.ReactNode; from: number }> = ({ n, title, detail, icon, from }) => (
  <Reveal from={from} dx={-80} dy={0}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        background: C.white,
        borderRadius: 24,
        padding: "18px 30px",
        height: 176,
        boxSizing: "border-box",
        boxShadow: "0 10px 26px rgba(0,0,0,0.10)",
        borderLeft: `14px solid ${C.green}`,
      }}
    >
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          background: C.green,
          color: C.white,
          fontSize: 60,
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
        <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.1 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 500, color: C.gray, marginTop: 6 }}>{detail}</div>
      </div>
      {icon}
    </div>
  </Reveal>
);

const Forbidden: React.FC<{ text: string; from: number }> = ({ text, from }) => (
  <Reveal from={from} dx={60} dy={0}>
    <div style={{ display: "flex", alignItems: "center", gap: 22, height: 88 }}>
      <XIcon size={64} />
      <div style={{ fontSize: 42, fontWeight: 700, color: C.ink }}>{text}</div>
    </div>
  </Reveal>
);

const Alert: React.FC<{ title: string; text: string; from: number; icon?: React.ReactNode }> = ({ title, text, from, icon }) => (
  <Reveal from={from} dy={50}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 34,
        background: C.yellow,
        border: `8px solid ${C.ink}`,
        borderRadius: 24,
        padding: "24px 36px",
        height: 250,
        boxSizing: "border-box",
      }}
    >
      <Warning size={130} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 54, fontWeight: 800, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 40, fontWeight: 600, color: C.ink, marginTop: 8, lineHeight: 1.2 }}>{text}</div>
      </div>
      {icon}
    </div>
  </Reveal>
);

export const Cena3: React.FC = () => {
  const frame = useCurrentFrame();
  const end = sceneFrames(scene);
  const ease = Easing.bezier(0.45, 0, 0.2, 1);

  // Timer de resfriamento: anda durante a frase sobre a água corrente.
  const timerP = interpolate(frame, [cue(1), cue(2)], [0, 1], clamp);
  const flow = interpolate(frame, [cue(1) + 20, cue(1) + 30, cue(3) - 10, cue(3)], [0, 1, 1, 0], clamp);

  // Bia conduz o Téo até a torneira.
  const teoX = interpolate(frame, [cue(1) - 5, cue(1) + 35], [1440, 1600], { ...clamp, easing: ease });
  const biaX = interpolate(frame, [cue(1) - 5, cue(1) + 35], [1250, 1390], { ...clamp, easing: ease });

  // Bia balança a cabeça a cada item proibido que aparece.
  const shakeWindows = [cue(3), cue(4), cue(4) + 20, cue(4) + 40, cue(4) + 75];
  const headShake = shakeWindows.some((s) => frame >= s && frame < s + 26);

  const relieved = frame >= Math.round(cue(6) + (end - cue(6)) * 0.55);

  return (
    <SceneBg>
      <Header num="PARTE 2" title="Queimaduras" icon={<Flame size={76} />} />

      {/* Encenação (lado direito) */}
      {/* Parede azulejada e pia */}
      <div
        style={{
          position: "absolute",
          left: 1700,
          top: 270,
          width: 220,
          height: 420,
          background: "repeating-linear-gradient(0deg, #DCEBF2 0 58px, #C9DEE8 58px 62px), #DCEBF2",
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        }}
      />
      <div style={{ position: "absolute", left: 1712, top: 600, width: 208, height: 56, background: "#B0BEC5", borderBottomLeftRadius: 28, borderBottomRightRadius: 6 }} />
      <div style={{ position: "absolute", left: 1712, top: 592, width: 208, height: 14, background: "#90A4AE", borderRadius: 7 }} />
      <Faucet flow={flow} streamLength={168} style={{ position: "absolute", left: 1700, top: 300 }} />
      <Reveal from={cue(1)} to={cue(3)} style={{ position: "absolute", left: 1400, top: 140, display: "flex", alignItems: "center", gap: 10 }}>
        <Timer size={150} progress={timerP} label={`${Math.round(10 + timerP * 10)} min`} />
        <div style={{ fontSize: 30, fontWeight: 800, color: "#1565C0", lineHeight: 1.1 }}>
          10 a 20
          <br />
          min
        </div>
      </Reveal>
      {relieved ? (
        <Teo pose="parado" expressao="aliviado" x={teoX} y={FLOOR} height={CHAR_H} />
      ) : (
        <Teo pose="mao_ferida" expressao="incomodado" x={teoX} y={FLOOR} height={CHAR_H} enterAt={0} enterFrom="right" />
      )}
      <Bia pose="ajudando" headShake={headShake} x={biaX} y={FLOOR} height={CHAR_H} enterAt={cue(0) + 25} />

      {/* Fase A: 3 passos */}
      <Reveal from={0} to={cue(3)} dy={0} style={{ position: "absolute", left: PANEL.left, top: 170, width: PANEL.width, display: "flex", flexDirection: "column", gap: 26 }}>
        <Step n={1} title="Afastar da fonte de calor" detail="Sem oferecer risco a quem socorre" icon={<Flame size={110} />} from={cue(0)} />
        <Step n={2} title="Água corrente: 10 a 20 min" detail="Limpa, fria ou em temperatura ambiente" icon={<Drop size={100} />} from={cue(1)} />
        <Step n={3} title="Retirar anéis e relógios" detail="Antes que ocorra o inchaço" icon={<Watch size={110} />} from={cue(2)} />
      </Reveal>

      {/* Fase B: proibições */}
      <Reveal from={cue(3)} to={cue(5)} dy={0} style={{ position: "absolute", left: PANEL.left, top: 170, width: PANEL.width, height: 630 }}>
        <div
          style={{
            display: "flex",
            background: C.white,
            borderRadius: 24,
            border: `8px solid ${C.red}`,
            height: 630,
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 290,
              background: C.red,
              color: C.white,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 22,
            }}
          >
            <XIcon size={170} />
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 2 }}>NÃO FAÇA</div>
          </div>
          <div style={{ flex: 1, padding: "30px 36px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            <Forbidden text="Puxar roupa grudada" from={cue(3)} />
            <Forbidden text="Gelo" from={cue(4)} />
            <Forbidden text="Pasta de dente" from={cue(4) + 20} />
            <Forbidden text="Manteiga ou receitas caseiras" from={cue(4) + 40} />
            <Forbidden text="Estourar bolhas" from={cue(4) + 75} />
          </div>
        </div>
      </Reveal>

      {/* Fase C: alertas amarelos */}
      <div style={{ position: "absolute", left: PANEL.left, top: 190, width: PANEL.width, display: "flex", flexDirection: "column", gap: 50 }}>
        <Alert title="Queimadura química" text="Água em abundância + informar o produto" from={cue(5)} />
        <Alert
          title="Grave ou extensa"
          text="Ligar 192 + cobrir com pano limpo"
          from={cue(6)}
          icon={
            <div style={{ width: 120, height: 120, borderRadius: 60, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Phone size={72} />
            </div>
          }
        />
      </div>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
