import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

// Frame absoluto do episódio dentro de uma cena (Sequence). As animações ociosas
// (piscar, respirar, nuvens, Sol) usam este relógio para o último quadro casar com o primeiro.
const OffsetContext = createContext(0);

export const SceneOffset: React.FC<{ offset: number; children: React.ReactNode }> = ({ offset, children }) => (
  <OffsetContext.Provider value={offset}>{children}</OffsetContext.Provider>
);

export const useGlobalFrame = () => useCurrentFrame() + useContext(OffsetContext);
