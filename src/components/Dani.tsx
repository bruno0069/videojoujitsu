import React from "react";
import { colors } from "../theme";
import { Character, CharacterProps, CharacterStyle } from "./Character";

const DANI: CharacterStyle = { hoodie: colors.turquesa, hair: "longo", pocket: false, blinkSeed: 5 };

export const Dani: React.FC<Omit<CharacterProps, "style">> = (props) => <Character style={DANI} {...props} />;
