import React from "react";
import { colors } from "../theme";
import { Character, CharacterProps, CharacterStyle } from "./Character";

// Professora (ep02): adulta, coque, blusa roxa e calça tinta. Mesmo rig dos alunos, com
// proporção de adulto (mais alta, cabeça menor).
const PROFESSORA: CharacterStyle = {
  hoodie: colors.roxo,
  hair: "coque",
  pocket: false,
  blinkSeed: 9,
  calca: colors.tinta,
  adulto: { lift: 110, arm: 215, leg: 200, headScale: 0.85 },
};

export const Professora: React.FC<Omit<CharacterProps, "style">> = (props) => <Character style={PROFESSORA} {...props} />;
