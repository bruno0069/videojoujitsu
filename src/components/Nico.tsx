import React from "react";
import { colors } from "../theme";
import { Character, CharacterProps, CharacterStyle } from "./Character";

const NICO: CharacterStyle = { hoodie: colors.coral, hair: "topete", pocket: true, blinkSeed: 0 };

export const Nico: React.FC<Omit<CharacterProps, "style">> = (props) => <Character style={NICO} {...props} />;
