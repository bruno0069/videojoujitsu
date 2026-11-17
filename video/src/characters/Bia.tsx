import React from "react";
import { useCurrentFrame } from "remotion";
import { ArmPose, Body, BodyStyle, Expressao } from "./Body";
import { CharacterFrame } from "./Character";

export type BiaPose = "acenando" | "apontando" | "ajudando" | "com_respirador" | "polegar_ok";

const STYLE: BodyStyle = {
  skin: "#6B4226",
  uniform: "#1B8A3E",
  uniformDark: "#15702F",
  stripe: "#C9CED3",
  helmet: "#1B8A3E",
  helmetBand: "#FFFFFF",
  gloves: "#2E2E2E",
  boots: "#1A1A1A",
  hair: "#1A1210",
  bun: true,
  chestCross: true,
  blinkOffset: 47,
};

const usePose = (pose: BiaPose, aim: number): { left: ArmPose; right: ArmPose } => {
  const frame = useCurrentFrame();
  switch (pose) {
    case "acenando":
      return { left: { upper: 8, fore: -4 }, right: { upper: -150, fore: 20 + Math.sin(frame / 4) * 22 } };
    case "apontando":
      return { left: { upper: 8, fore: -4 }, right: { upper: -90 - aim, fore: 0, hand: "point" } };
    case "ajudando":
      return { left: { upper: 8, fore: -4 }, right: { upper: -62, fore: -28 } };
    case "com_respirador":
      return { left: { upper: 10, fore: -6 }, right: { upper: -62, fore: -28 } };
    case "polegar_ok":
      return { left: { upper: 8, fore: -4 }, right: { upper: -35, fore: -145, hand: "thumb" } };
  }
};

export const BiaBody: React.FC<{ pose?: BiaPose; expressao?: Expressao; headShake?: boolean; aim?: number }> = ({
  pose = "acenando",
  expressao = "neutra",
  headShake,
  aim = 2,
}) => {
  const p = usePose(pose, aim);
  return (
    <Body
      style={STYLE}
      left={p.left}
      right={p.right}
      expressao={expressao}
      scba={pose === "com_respirador"}
      headShake={headShake}
    />
  );
};

export const Bia: React.FC<
  { pose?: BiaPose; expressao?: Expressao; headShake?: boolean; aim?: number } & Omit<React.ComponentProps<typeof CharacterFrame>, "children">
> = ({ pose, expressao, headShake, aim, ...frame }) => (
  <CharacterFrame breathOffset={20} {...frame}>
    <BiaBody pose={pose} expressao={expressao} headShake={headShake} aim={aim} />
  </CharacterFrame>
);
