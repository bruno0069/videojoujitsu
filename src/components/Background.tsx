import React from "react";
import { interpolate } from "remotion";
import { colors } from "../theme";
import { Cam } from "./Camera";
import { DiagramaGlobo, GloboDiaNoite, MapaOnda } from "./backgrounds/DiagramasTerra";
import { DiagramaOrbita } from "./backgrounds/DiagramaOrbita";
import { EspacoEscuro, EspacoParaSala } from "./backgrounds/EspacoParaSala";
import { DiagramaLua, RaioLuz } from "./backgrounds/Insertos";
import { InsertoPao } from "./backgrounds/InsertoPao";
import { Patio } from "./backgrounds/Patio";
import { SalaAula } from "./backgrounds/SalaAula";

// Cenários disponíveis. Episódio novo pode reutilizar qualquer um pelo nome.
export const BACKGROUNDS = [
  "patio_dia",
  "patio_ceu_escurecendo",
  "diagrama_orbita",
  "espaco_escuro",
  "espaco_escuro_para_sala_de_aula",
  "inserto_pao",
  "raio_luz",
  "diagrama_lua",
  "sala_aula_dia",
  "diagrama_globo",
  "mapa_onda",
  "globo_metade_dia_metade_noite",
];

// Nível de noite do cenário (0..1). No céu escurecendo, sobe em três passos
// (céu -> intermediário -> noite -> noite cheia); com "seco", cada passo é um corte de cor.
export const nightLevel = (name: string, frame: number, params: Record<string, number | number[]>, duration: number) => {
  if (name !== "patio_ceu_escurecendo") return 0;
  const steps = (Array.isArray(params.passos) ? params.passos : [10, duration * 0.12, duration * 0.24]) as number[];
  const dry = params.seco === 1;
  const k = steps.reduce(
    (acc, at) => acc + (dry ? Number(frame >= at) : interpolate(frame, [at, at + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
    0,
  );
  return k / steps.length;
};

export const Background: React.FC<{
  name: string;
  cam: Cam;
  frame: number;
  globalFrame: number;
  duration: number;
  // parâmetros do arquivo de direção, já convertidos para frames
  params: Record<string, number | number[]>;
  skyElements?: React.ReactNode;
  // frame e duração do plano atual (para insertos que contam do próprio começo)
  shotFrame: number;
  shotLength: number;
}> = ({ name, cam, frame, globalFrame, duration, params, skyElements, shotFrame, shotLength }) => {
  switch (name) {
    case "patio_dia":
    case "patio_ceu_escurecendo":
      return <Patio cam={cam} frame={frame} globalFrame={globalFrame} night={nightLevel(name, frame, params, duration)} skyElements={skyElements} />;
    case "diagrama_orbita":
      return (
        <DiagramaOrbita
          cam={cam}
          frame={frame}
          labelAt={typeof params.rotulo === "number" ? params.rotulo : 20}
          labelUntil={typeof params.rotuloAte === "number" ? params.rotuloAte : Infinity}
        />
      );
    case "espaco_escuro":
      return <EspacoEscuro cam={cam} frame={shotFrame} exitAt={typeof params.saida === "number" ? params.saida : Math.round(shotLength * 0.85)} />;
    case "espaco_escuro_para_sala_de_aula": {
      const cut = typeof params.corte === "number" ? params.corte : Math.round(duration * 0.45);
      return <EspacoParaSala cam={cam} frame={frame} cut={cut} />;
    }
    case "inserto_pao":
      return <InsertoPao cam={cam} frame={frame} />;
    case "raio_luz":
      return <RaioLuz cam={cam} frame={shotFrame} length={shotLength} />;
    case "diagrama_lua":
      return <DiagramaLua cam={cam} frame={shotFrame} length={shotLength} />;
    case "sala_aula_dia":
      return <SalaAula cam={cam} frame={frame} globalFrame={globalFrame} params={params} />;
    case "diagrama_globo":
      return <DiagramaGlobo cam={cam} frame={frame} params={params} />;
    case "mapa_onda":
      return <MapaOnda cam={cam} frame={frame} params={params} />;
    case "globo_metade_dia_metade_noite":
      return <GloboDiaNoite cam={cam} frame={frame} params={params} />;
    default:
      return <rect x={0} y={0} width={1080} height={1920} fill={colors.creme} />;
  }
};
