import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { FirstAidCross, Phone, Shield } from "../icons";
import { cueFrame, getScene } from "../timeline";
import { Header, Reveal, SceneBg, Subtitles } from "../ui";

const scene = getScene("cena2");

const Card: React.FC<{
  n: number;
  title: string;
  text: string;
  icon: React.ReactNode;
  from: number;
  activeFrom: number;
}> = ({ n, title, text, icon, from, activeFrom }) => {
  const frame = useCurrentFrame();
  const active = interpolate(frame, [activeFrom, activeFrom + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <Reveal from={from} dy={60}>
      <div
        style={{
          width: 500,
          height: 400,
          borderRadius: 26,
          background: active > 0.5 ? C.green : C.white,
          color: active > 0.5 ? C.white : C.ink,
          border: `6px solid ${C.green}`,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          scale: `${1 + active * 0.05}`,
          boxShadow: `0 ${10 + active * 16}px ${24 + active * 20}px rgba(0,0,0,${0.12 + active * 0.12})`,
        }}
      >
        <div
          style={{
            width: 130,
            height: 130,
            borderRadius: 65,
            background: active > 0.5 ? C.white : C.green,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.8 }}>PASSO {n}</div>
        <div style={{ fontSize: 60, fontWeight: 800, letterSpacing: 2 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 500, textAlign: "center", padding: "0 30px" }}>{text}</div>
      </div>
    </Reveal>
  );
};

export const Cena2: React.FC = () => {
  const frame = useCurrentFrame();
  const s2 = cueFrame(scene, 2);
  const s4 = cueFrame(scene, 4);
  const iconColor = (from: number) => (frame >= from + 6 ? C.green : C.white);
  return (
    <SceneBg>
      <Header num="PARTE 1" title="Importância dos primeiros socorros" icon={<FirstAidCross size={76} bg={C.white} fg={C.green} />} />

      {/* Fase A: definição */}
      <Reveal from={8} to={s2} style={{ position: "absolute", left: 160, top: 200, width: 1600 }}>
        <div
          style={{
            background: C.white,
            borderLeft: `16px solid ${C.green}`,
            borderRadius: 20,
            padding: "40px 56px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.10)",
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 800, color: C.green, letterSpacing: 2 }}>O QUE SÃO?</div>
          <div style={{ fontSize: 58, fontWeight: 700, marginTop: 14, lineHeight: 1.2 }}>
            Cuidados iniciais prestados à vítima <span style={{ color: C.green }}>antes</span> do atendimento especializado.
          </div>
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 44 }}>
          {["Preservar vidas", "Evitar que as lesões piorem", "Manter a vítima segura"].map((t, i) => (
            <Reveal key={t} from={cueFrame(scene, 1) + i * 8} style={{ flex: 1 }}>
              <div
                style={{
                  background: C.greenLight,
                  border: `3px solid ${C.green}`,
                  borderRadius: 18,
                  padding: "26px 24px",
                  fontSize: 38,
                  fontWeight: 700,
                  textAlign: "center",
                  color: C.greenDark,
                  height: 140,
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
      <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center", gap: 60 }}>
        <Card n={1} title="PROTEGER" text="Garanta que a área está segura" from={s2} activeFrom={cueFrame(scene, 3)}
          icon={<Shield size={90} color={iconColor(cueFrame(scene, 3))} check={iconColor(cueFrame(scene, 3)) === C.green ? C.white : C.green} />} />
        <Card n={2} title="AVISAR" text="Brigada, equipe de emergência e SAMU" from={s2 + 6} activeFrom={s4}
          icon={<Phone size={80} color={iconColor(s4)} />} />
        <Card n={3} title="SOCORRER" text="Só então, preste o socorro" from={s2 + 12} activeFrom={cueFrame(scene, 5)}
          icon={frame >= cueFrame(scene, 5) + 6 ? <FirstAidCross size={90} /> : <FirstAidCross size={90} bg={C.white} fg={C.green} />} />
      </div>

      <Reveal from={s4} style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            background: C.red,
            color: C.white,
            borderRadius: 60,
            padding: "16px 48px",
            fontSize: 52,
            fontWeight: 800,
            border: `6px solid ${C.white}`,
            boxShadow: "0 10px 26px rgba(198,40,40,0.35)",
          }}
        >
          <Phone size={56} />
          SAMU 192 · Bombeiros 193
        </div>
      </Reveal>
      <Subtitles scene={scene} />
    </SceneBg>
  );
};
