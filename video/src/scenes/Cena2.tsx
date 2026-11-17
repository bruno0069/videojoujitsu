import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { FirstAidCross, Phone, Shield } from "../icons";
import { Bia } from "../characters/Bia";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena2");
const cue = (i: number) => cueFrame(scene, i);

const LEFT = 560;
const WIDTH = 1290;
const ROW_TOP = [175, 341, 507];
const ROW_H = 140;

const StepRow: React.FC<{
  n: number;
  title: string;
  text: string;
  icon: (active: boolean) => React.ReactNode;
  top: number;
  from: number;
  activeFrom: number;
}> = ({ n, title, text, icon, top, from, activeFrom }) => {
  const frame = useCurrentFrame();
  const active = frame >= activeFrom;
  const pop = interpolate(frame, [activeFrom, activeFrom + 8, activeFrom + 16], [1, 1.03, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Reveal from={from} dx={80} dy={0} style={{ position: "absolute", left: LEFT, top, width: WIDTH }}>
      <div
        style={{
          height: ROW_H,
          borderRadius: 24,
          background: active ? C.green : C.white,
          color: active ? C.white : C.ink,
          border: `6px solid ${C.green}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          gap: 30,
          padding: "0 36px",
          scale: `${pop}`,
          boxShadow: active ? "0 14px 30px rgba(27,138,62,0.35)" : "0 8px 20px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            flexShrink: 0,
            background: active ? C.white : C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon(active)}
        </div>
        <div style={{ width: 360, flexShrink: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 700, opacity: 0.8 }}>PASSO {n}</div>
          <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: 2, lineHeight: 1.05 }}>{title}</div>
        </div>
        <div style={{ fontSize: 36, fontWeight: 600 }}>{text}</div>
      </div>
    </Reveal>
  );
};

export const Cena2: React.FC = () => {
  const frame = useCurrentFrame();
  const s2 = cue(2);
  // Ângulo do braço da Bia: aponta a definição e depois cada passo, um por vez.
  const aim = interpolate(frame, [0, s2, s2 + 12, cue(3), cue(3) + 12, cue(4), cue(4) + 12, cue(5), cue(5) + 12], [10, 10, 36, 36, 36, 36, 13, 13, -15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.45, 0, 0.2, 1),
  });
  return (
    <SceneBg>
      <Header num="PARTE 1" title="Importância dos primeiros socorros" icon={<FirstAidCross size={76} bg={C.white} fg={C.green} />} />

      <Bia pose="apontando" aim={aim} x={270} y={835} height={520} enterAt={4} enterFrom="left" />

      {/* Fase A: definição */}
      <Reveal from={8} to={s2} style={{ position: "absolute", left: LEFT, top: 185, width: WIDTH }}>
        <div
          style={{
            background: C.white,
            borderLeft: `16px solid ${C.green}`,
            borderRadius: 20,
            padding: "36px 50px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 38, fontWeight: 800, color: C.green, letterSpacing: 2 }}>O QUE SÃO?</div>
          <div style={{ fontSize: 54, fontWeight: 700, marginTop: 12, lineHeight: 1.2 }}>
            Cuidados iniciais prestados à vítima <span style={{ color: C.green }}>antes</span> do atendimento especializado.
          </div>
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 36 }}>
          {["Preservar vidas", "Evitar que as lesões piorem", "Manter a vítima segura"].map((t, i) => (
            <Reveal key={t} from={cue(1) + i * 8} style={{ flex: 1 }}>
              <div
                style={{
                  background: C.greenLight,
                  border: `3px solid ${C.green}`,
                  borderRadius: 18,
                  padding: "20px 22px",
                  fontSize: 36,
                  fontWeight: 700,
                  textAlign: "center",
                  color: C.greenDark,
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxSizing: "border-box",
                }}
              >
                {t}
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* Fase B: Proteger, Avisar, Socorrer */}
      <StepRow n={1} title="PROTEGER" text="Garanta que a área está segura" top={ROW_TOP[0]} from={s2} activeFrom={cue(3)}
        icon={(a) => <Shield size={72} color={a ? C.green : C.white} check={a ? C.white : C.green} />} />
      <StepRow n={2} title="AVISAR" text="Brigada, equipe de emergência e SAMU" top={ROW_TOP[1]} from={s2 + 6} activeFrom={cue(4)}
        icon={(a) => <Phone size={60} color={a ? C.green : C.white} />} />
      <StepRow n={3} title="SOCORRER" text="Só então, preste o socorro" top={ROW_TOP[2]} from={s2 + 12} activeFrom={cue(5)}
        icon={(a) => (a ? <FirstAidCross size={70} /> : <FirstAidCross size={70} bg={C.white} fg={C.green} />)} />

      <Reveal from={cue(4)} style={{ position: "absolute", left: LEFT, width: WIDTH, top: 690, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: C.red,
            color: C.white,
            borderRadius: 60,
            padding: "14px 46px",
            fontSize: 50,
            fontWeight: 800,
            border: `6px solid ${C.white}`,
            boxShadow: "0 10px 26px rgba(198,40,40,0.35)",
          }}
        >
          <Phone size={54} />
          SAMU 192 · Bombeiros 193
        </div>
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
