import React from "react";
import { ArmPose, Body, BodyStyle, Expressao } from "./Body";
import { CharacterFrame } from "./Character";

export type TeoPose = "parado" | "mao_ferida" | "tossindo" | "sentado_repouso" | "polegar_ok";

const STYLE: BodyStyle = {
  skin: "#B47A55",
  uniform: "#F28C28",
  uniformDark: "#E07B1A",
  stripe: "#C9CED3",
  helmet: "#F4F5F6",
  gloves: "#222222",
  boots: "#1A1A1A",
  hair: "#2B1D16",
  blinkOffset: 30,
};

const POSES: Record<TeoPose, { left: ArmPose; right: ArmPose }> = {
  parado: { left: { upper: 8, fore: -4 }, right: { upper: -8, fore: 4 } },
  // Mão (lado direito da tela) erguida à frente, com brilho vermelho simples.
  mao_ferida: { left: { upper: -28, fore: -92 }, right: { upper: -24, fore: 128, glow: true } },
  tossindo: { left: { upper: -55, fore: -132 }, right: { upper: -8, fore: 4 } },
  sentado_repouso: { left: { upper: -4, fore: 6 }, right: { upper: 4, fore: -6 } },
  polegar_ok: { left: { upper: 8, fore: -4 }, right: { upper: -35, fore: -145, hand: "thumb" } },
};

export const TeoBody: React.FC<{ pose?: TeoPose; expressao?: Expressao }> = ({ pose = "parado", expressao = "neutra" }) => {
  const p = POSES[pose];
  return (
    <Body
      style={STYLE}
      left={p.left}
      right={p.right}
      expressao={expressao}
      sitting={pose === "sentado_repouso"}
      coughing={pose === "tossindo"}
    />
  );
};

export const Teo: React.FC<
  { pose?: TeoPose; expressao?: Expressao } & Omit<React.ComponentProps<typeof CharacterFrame>, "children">
> = ({ pose, expressao, ...frame }) => (
  <CharacterFrame breathOffset={0} {...frame}>
    <TeoBody pose={pose} expressao={expressao} />
  </CharacterFrame>
);
