import React from "react";
import { useCurrentFrame } from "remotion";

/**
 * Corpo genérico flat/geométrico, sem contornos.
 * Coordenadas no viewBox "-60 10 320 340"; o chão fica em y = 338.
 * Ângulos de braço em graus: 0 = braço pendurado; no braço da DIREITA da tela,
 * valores negativos abrem para fora; no da ESQUERDA, positivos abrem para fora.
 */

export type Expressao = "neutra" | "incomodado" | "aliviado";

export type ArmPose = {
  upper: number;
  fore: number;
  hand?: "fist" | "point" | "thumb";
  glow?: boolean;
};

export type BodyStyle = {
  skin: string;
  uniform: string;
  uniformDark: string;
  stripe: string;
  helmet: string;
  helmetBand?: string;
  gloves: string;
  boots: string;
  hair: string;
  bun?: boolean;
  chestCross?: boolean;
  blinkOffset?: number;
};

export type BodyProps = {
  style: BodyStyle;
  left: ArmPose; // braço do lado esquerdo da tela
  right: ArmPose; // braço do lado direito da tela
  expressao: Expressao;
  sitting?: boolean;
  scba?: boolean;
  headShake?: boolean;
  coughing?: boolean;
};

const UPPER = 52;
const FORE = 46;

const Arm: React.FC<{ x: number; y: number; pose: ArmPose; color: string; gloves: string }> = ({ x, y, pose, color, gloves }) => {
  const frame = useCurrentFrame();
  const glowO = 0.45 + Math.sin(frame / 6) * 0.2;
  return (
    <g transform={`translate(${x} ${y}) rotate(${pose.upper})`}>
      <rect x={-9} y={-9} width={18} height={UPPER + 12} rx={9} fill={color} />
      <g transform={`translate(0 ${UPPER}) rotate(${pose.fore})`}>
        <rect x={-8} y={-6} width={16} height={FORE + 2} rx={8} fill={color} />
        {pose.glow ? (
          <>
            <circle cx={0} cy={FORE + 2} r={26} fill="url(#glowRed)" opacity={glowO} />
            <circle cx={0} cy={FORE + 2} r={17} fill="none" stroke="#FF3B30" strokeWidth={3} opacity={glowO + 0.2} />
          </>
        ) : null}
        {pose.hand === "point" ? <rect x={-3} y={FORE + 4} width={6} height={18} rx={3} fill={gloves} /> : null}
        {pose.hand === "thumb" ? <rect x={-3.5} y={FORE + 2} width={7} height={20} rx={3.5} fill={gloves} /> : null}
        <circle cx={0} cy={FORE + 2} r={11} fill={gloves} />
      </g>
    </g>
  );
};

const Face: React.FC<{ expressao: Expressao; blink: boolean; masked: boolean }> = ({ expressao, blink, masked }) => {
  const eyeY = masked ? 76 : 74;
  const happy = expressao === "aliviado";
  const eyes = happy ? (
    <>
      <path d={`M85 ${eyeY + 1} Q89 ${eyeY - 4} 93 ${eyeY + 1}`} stroke="#1D1D1D" strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <path d={`M107 ${eyeY + 1} Q111 ${eyeY - 4} 115 ${eyeY + 1}`} stroke="#1D1D1D" strokeWidth={2.6} fill="none" strokeLinecap="round" />
    </>
  ) : (
    <>
      <ellipse cx={89} cy={eyeY} rx={3.6} ry={blink ? 0.6 : 3.6} fill="#1D1D1D" />
      <ellipse cx={111} cy={eyeY} rx={3.6} ry={blink ? 0.6 : 3.6} fill="#1D1D1D" />
    </>
  );
  const mouth =
    expressao === "incomodado"
      ? "M92 97 Q100 91 108 97"
      : expressao === "aliviado"
        ? "M90 92 Q100 101 110 92"
        : "M93 93 Q100 98 107 93";
  return (
    <g>
      {eyes}
      {!masked ? <path d={mouth} stroke="#1D1D1D" strokeWidth={2.6} fill="none" strokeLinecap="round" /> : null}
      {!masked && expressao === "incomodado" ? <path d="M131 70 q4 7 0 10 q-4 -3 0 -10z" fill="#7EC8F2" /> : null}
    </g>
  );
};

export const Body: React.FC<BodyProps> = ({ style: s, left, right, expressao, sitting, scba, headShake, coughing }) => {
  const frame = useCurrentFrame();
  // Piscar a cada ~3 s (90 frames), durante 4 frames.
  const blink = (frame + (s.blinkOffset ?? 0)) % 90 < 4;
  const dy = sitting ? 62 : 0;
  const headRot = headShake ? Math.sin(frame / 3) * 9 : 0;
  const coughPhase = (frame % 36) / 36;
  const coughShake = coughing ? (coughPhase < 0.25 ? Math.sin(coughPhase * Math.PI * 8) * 2.5 : 0) : 0;

  return (
    <g>
      <defs>
        <radialGradient id="glowRed">
          <stop offset="0%" stopColor="#FF3B30" stopOpacity={0.9} />
          <stop offset="100%" stopColor="#FF3B30" stopOpacity={0} />
        </radialGradient>
      </defs>

      {sitting ? (
        <g>
          <rect x={46} y={268} width={108} height={70} rx={6} fill="#8D6E63" />
          <rect x={46} y={268} width={108} height={10} rx={4} fill="#A1887F" />
          <rect x={58} y={290} width={84} height={6} fill="#795548" />
          <rect x={58} y={312} width={84} height={6} fill="#795548" />
        </g>
      ) : null}

      {/* Pernas */}
      {sitting ? (
        <g>
          <rect x={70} y={258} width={28} height={30} rx={10} fill={s.uniformDark} />
          <rect x={102} y={258} width={28} height={30} rx={10} fill={s.uniformDark} />
          <rect x={72} y={282} width={24} height={44} rx={8} fill={s.uniformDark} />
          <rect x={104} y={282} width={24} height={44} rx={8} fill={s.uniformDark} />
          <rect x={72} y={300} width={24} height={7} fill={s.stripe} />
          <rect x={104} y={300} width={24} height={7} fill={s.stripe} />
        </g>
      ) : (
        <g>
          <rect x={72} y={200} width={24} height={124} rx={8} fill={s.uniformDark} />
          <rect x={104} y={200} width={24} height={124} rx={8} fill={s.uniformDark} />
          <rect x={72} y={282} width={24} height={8} fill={s.stripe} />
          <rect x={104} y={282} width={24} height={8} fill={s.stripe} />
        </g>
      )}
      <rect x={64} y={316} width={34} height={22} rx={9} fill={s.boots} />
      <rect x={102} y={316} width={34} height={22} rx={9} fill={s.boots} />

      <g transform={`translate(${coughShake} ${dy})`}>
        {/* Cilindro do respirador (atrás do corpo) */}
        {scba ? (
          <g>
            <rect x={126} y={96} width={28} height={100} rx={13} fill="#F5B800" />
            <rect x={134} y={86} width={12} height={12} rx={3} fill="#90A4AE" />
            <rect x={126} y={140} width={28} height={8} fill="#5D4037" opacity={0.6} />
          </g>
        ) : null}

        {/* Tronco */}
        <rect x={66} y={108} width={68} height={106} rx={16} fill={s.uniform} />
        <rect x={66} y={170} width={68} height={10} fill={s.stripe} />
        {s.chestCross ? <path d="M95 124h10v8h8v10h-8v8H95v-8h-8v-10h8z" fill="#FFFFFF" /> : null}
        {scba ? (
          <g fill="#37474F">
            <rect x={76} y={108} width={8} height={88} rx={3} />
            <rect x={116} y={108} width={8} height={88} rx={3} />
          </g>
        ) : null}

        {/* Cabeça */}
        <g transform={`rotate(${headRot} 100 104)`}>
                    <rect x={92} y={98} width={16} height={14} fill={s.skin} />
          <circle cx={100} cy={76} r={32} fill={s.skin} />
          <rect x={67} y={60} width={8} height={s.bun ? 26 : 16} rx={3} fill={s.hair} />
          <rect x={125} y={60} width={8} height={s.bun ? 26 : 16} rx={3} fill={s.hair} />

          {scba ? (
            <g>
              <ellipse cx={100} cy={82} rx={28} ry={29} fill="#3A4750" />
              <ellipse cx={100} cy={76} rx={21} ry={15} fill="#BFE3F5" />
              <Face expressao={expressao} blink={blink} masked />
              <circle cx={100} cy={102} r={8} fill="#90A4AE" />
              <path d="M100 110 C 104 150, 150 140, 142 112" stroke="#263238" strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              {/* Óculos de proteção (olhos desenhados por cima, visíveis pela lente) */}
              <rect x={66} y={70} width={10} height={5} fill="#37474F" />
              <rect x={124} y={70} width={10} height={5} fill="#37474F" />
              <rect x={73} y={63} width={54} height={21} rx={10.5} fill="#7FB3CC" />
              <rect x={76} y={66} width={48} height={15} rx={7.5} fill="#DDF1FA" />
              <rect x={98.5} y={66} width={3} height={15} fill="#7FB3CC" />
              <Face expressao={expressao} blink={blink} masked={false} />
            </g>
          )}

          {/* Capacete */}
          <path d="M66 62 A34 34 0 0 1 134 62 Z" fill={s.helmet} />
          {s.helmetBand ? <rect x={70} y={46} width={60} height={7} fill={s.helmetBand} /> : null}
          <rect x={95} y={29} width={10} height={33} rx={4} fill="rgba(0,0,0,0.12)" />
          <rect x={60} y={57} width={80} height={9} rx={4.5} fill={s.helmet} />
        </g>

        {/* Tosse: nuvenzinhas saindo da boca */}
        {coughing && coughPhase < 0.6 ? (
          <g opacity={1 - coughPhase / 0.6} fill="#9E9E9E">
            <circle cx={130 + coughPhase * 40} cy={92} r={4 + coughPhase * 6} />
            <circle cx={136 + coughPhase * 50} cy={82} r={3 + coughPhase * 5} />
          </g>
        ) : null}

        {/* Braços (na frente) */}
        <Arm x={72} y={124} pose={left} color={s.uniformDark} gloves={s.gloves} />
        <Arm x={128} y={124} pose={right} color={s.uniformDark} gloves={s.gloves} />
      </g>
    </g>
  );
};
