import React, { useEffect, useState } from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Series, continueRender, delayRender, staticFile } from "remotion";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import { Cena1 } from "./scenes/Cena1";
import { Cena2 } from "./scenes/Cena2";
import { Cena3 } from "./scenes/Cena3";
import { Cena4 } from "./scenes/Cena4";
import { Cena5 } from "./scenes/Cena5";
import { SCENES, sceneFrames } from "./timeline";

const COMPONENTS: Record<string, React.FC> = { cena1: Cena1, cena2: Cena2, cena3: Cena3, cena4: Cena4, cena5: Cena5 };

/** Garante que a fonte Inter está carregada antes de renderizar os frames. */
export const useFonts = () => {
  const [handle] = useState(() => delayRender("Carregando Inter"));
  useEffect(() => {
    Promise.all(["500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 40px Inter`)))
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

export const PrimeirosSocorros: React.FC = () => {
  useFonts();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Series>
        {SCENES.map((s) => {
          const Comp = COMPONENTS[s.id];
          return (
            <Series.Sequence key={s.id} name={s.id} durationInFrames={sceneFrames(s)}>
              <Comp />
              <Audio src={staticFile(s.audio)} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
