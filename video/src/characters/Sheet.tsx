import React from "react";
import { C, FONT } from "../theme";
import { Bia, BiaPose } from "./Bia";
import { Expressao } from "./Body";
import { Teo, TeoPose } from "./Teo";

const teo: { pose: TeoPose; expressao: Expressao; label: string }[] = [
  { pose: "parado", expressao: "neutra", label: "parado · neutra" },
  { pose: "parado", expressao: "incomodado", label: "parado · incomodado" },
  { pose: "parado", expressao: "aliviado", label: "parado · aliviado" },
  { pose: "mao_ferida", expressao: "incomodado", label: "mao_ferida" },
  { pose: "tossindo", expressao: "incomodado", label: "tossindo" },
  { pose: "sentado_repouso", expressao: "aliviado", label: "sentado_repouso" },
  { pose: "polegar_ok", expressao: "aliviado", label: "polegar_ok" },
];
const bia: { pose: BiaPose; label: string }[] = [
  { pose: "acenando", label: "acenando" },
  { pose: "apontando", label: "apontando" },
  { pose: "ajudando", label: "ajudando" },
  { pose: "com_respirador", label: "com_respirador" },
  { pose: "polegar_ok", label: "polegar_ok" },
];

const Label: React.FC<{ x: number; y: number; text: string }> = ({ x, y, text }) => (
  <div style={{ position: "absolute", left: x - 140, width: 280, top: y, textAlign: "center", fontSize: 24, fontWeight: 700, color: C.ink }}>
    {text}
  </div>
);

/** Folha de referência: todas as poses e expressões lado a lado. */
export const CharacterSheet: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, background: C.bg, fontFamily: FONT }}>
    <div style={{ position: "absolute", left: 40, top: 20, fontSize: 40, fontWeight: 800, color: "#E07B1A" }}>TÉO – operário</div>
    {teo.map((t, i) => {
      const x = 137 + i * 274;
      return (
        <React.Fragment key={t.label}>
          <Teo pose={t.pose} expressao={t.expressao} x={x} y={470} height={400} enterAt={-20} />
          <Label x={x} y={478} text={t.label} />
        </React.Fragment>
      );
    })}
    <div style={{ position: "absolute", left: 40, top: 540, fontSize: 40, fontWeight: 800, color: C.green }}>BIA – brigadista</div>
    {bia.map((b, i) => {
      const x = 220 + i * 370;
      return (
        <React.Fragment key={b.label}>
          <Bia pose={b.pose} x={x} y={1000} height={400} enterAt={-20} />
          <Label x={x} y={1008} text={b.label} />
        </React.Fragment>
      );
    })}
  </div>
);
