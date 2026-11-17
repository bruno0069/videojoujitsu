import React from "react";
import { Composition, Folder, Still } from "remotion";
import { CharacterSheet } from "./characters/Sheet";
import { PrimeirosSocorros } from "./Video";
import { Cena1 } from "./scenes/Cena1";
import { Cena2 } from "./scenes/Cena2";
import { Cena3 } from "./scenes/Cena3";
import { Cena4 } from "./scenes/Cena4";
import { Cena5 } from "./scenes/Cena5";
import { FPS } from "./theme";
import { TOTAL_FRAMES, getScene, sceneFrames } from "./timeline";

const scenes = [
  ["Cena1", Cena1, "cena1"],
  ["Cena2", Cena2, "cena2"],
  ["Cena3", Cena3, "cena3"],
  ["Cena4", Cena4, "cena4"],
  ["Cena5", Cena5, "cena5"],
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Folder name="Cenas">
      {scenes.map(([id, comp, key]) => (
        <Composition key={id} id={id} component={comp} width={1920} height={1080} fps={FPS} durationInFrames={sceneFrames(getScene(key))} />
      ))}
    </Folder>
    <Still id="Personagens" component={CharacterSheet} width={1920} height={1080} />
    <Composition
      id="PrimeirosSocorros"
      component={PrimeirosSocorros}
      width={1920}
      height={1080}
      fps={FPS}
      durationInFrames={TOTAL_FRAMES}
    />
  </>
);
