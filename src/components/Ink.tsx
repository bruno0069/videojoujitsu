import React, { createContext, useContext } from "react";
import { ink } from "../theme";

// Espessura do contorno no sistema de coordenadas atual.
// Cada transformação de escala (câmera, personagem) divide o valor,
// para que a linha fique sempre com ~16 px na tela.
const InkContext = createContext<number>(ink.stroke);

export const useInk = () => useContext(InkContext);

export const InkScale: React.FC<{ scale: number; children: React.ReactNode }> = ({
  scale,
  children,
}) => {
  const parent = useInk();
  return <InkContext.Provider value={parent / scale}>{children}</InkContext.Provider>;
};
