import React from "react";
import { interpolate, interpolateColors } from "remotion";
import { colors } from "../theme";
import { Cam } from "./Camera";
import { DiagramaOrbita } from "./backgrounds/DiagramaOrbita";
import { EspacoParaSala } from "./backgrounds/EspacoParaSala";
import { Patio } from "./backgrounds/Patio";

// Cenários disponíveis. Episódio novo pode reutilizar qualquer um pelo nome.
export const BACKGROUNDS = ["patio_dia", "patio_ceu_escurecendo", "diagrama_orbita", "espaco_escuro_para_sala_de_aula"];

export const Background: React.FC<{
  name: string;
  cam: Cam;
  frame: number;
  duration: number;
  // parâmetros do arquivo de direção, já convertidos para frames
  params: Record<string, number | number[]>;
  skyElements?: React.ReactNode;
}> = ({ name, cam, frame, duration, params, skyElements }) => {
  switch (name) {
    case "patio_dia":
      return <Patio cam={cam} frame={frame} skyColor={colors.ceu} darkness={0} stars={0} skyElements={skyElements} />;
    case "patio_ceu_escurecendo": {
      // O céu escurece em três tempos: céu -> intermediário -> noite -> noite escura
      const steps = (Array.isArray(params.passos) ? params.passos : [10, duration * 0.12, duration * 0.24]) as number[];
      const k = steps.reduce(
        (acc, at) => acc + interpolate(frame, [at, at + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        0,
      );
      const sky = interpolateColors(k, [0, 1, 2, 3], [colors.ceu, colors.ceuMeio, colors.noite, colors.noiteEscura]);
      return <Patio cam={cam} frame={frame} skyColor={sky} darkness={k / 3} stars={Math.max(0, k - 1.5) / 1.5} skyElements={skyElements} />;
    }
    case "diagrama_orbita":
      return <DiagramaOrbita cam={cam} frame={frame} />;
    case "espaco_escuro_para_sala_de_aula": {
      const cut = typeof params.corte === "number" ? params.corte : Math.round(duration * 0.45);
      return <EspacoParaSala cam={cam} frame={frame} cut={cut} />;
    }
    default:
      return <rect x={0} y={0} width={1080} height={1920} fill={colors.creme} />;
  }
};
