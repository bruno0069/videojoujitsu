import React from "react";
import { colors, loopPhase } from "../../theme";
import { Cam, Layer } from "../Camera";
import { useInk } from "../Ink";
import { Cloud, SkyFill, Stars } from "../Sky";

// Pátio da escola em 3 planos: prédio e árvores (fundo), muro (meio), chão (frente).
export const Patio: React.FC<{
  cam: Cam;
  frame: number;
  globalFrame: number;
  skyColor: string;
  darkness: number;
  stars: number;
  skyElements?: React.ReactNode;
}> = ({ cam, frame, globalFrame, skyColor, darkness, stars, skyElements }) => {
  // Nuvens dão uma volta completa por episódio (relógio global), então o loop casa
  const loop = (base: number, speed: number) => {
    const w = 1700;
    const v = (base + 300 + loopPhase(globalFrame, speed) * w) % w;
    return v - 300;
  };
  const cloudOpacity = Math.max(0, 1 - darkness * 1.6);
  return (
    <>
      <Layer cam={cam} depth={0.08}>
        <SkyFill color={skyColor} />
        <Stars frame={frame} opacity={stars} maxY={950} />
      </Layer>
      <Layer cam={cam} depth={0.15}>
        <Cloud x={loop(160, 1)} y={470} s={0.9} opacity={cloudOpacity} />
        <Cloud x={loop(980, 2)} y={330} s={0.65} opacity={cloudOpacity} />
        {skyElements}
      </Layer>
      <Layer cam={cam} depth={0.4}>
        <SchoolBuilding />
        <Darken amount={darkness * 0.7} />
      </Layer>
      <Layer cam={cam} depth={0.7}>
        <Wall />
        <Darken amount={darkness * 0.65} />
      </Layer>
      <Layer cam={cam} depth={1}>
        <Floor />
        <Darken amount={darkness * 0.55} />
      </Layer>
    </>
  );
};

const Darken: React.FC<{ amount: number }> = ({ amount }) =>
  amount > 0 ? <rect x={-1000} y={700} width={3080} height={2400} fill={colors.noiteEscura} opacity={amount} /> : null;

const SchoolBuilding: React.FC = () => {
  const ink = useInk();
  const windows = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      windows.push(
        <rect key={`${r}-${c}`} x={-40 + c * 130} y={880 + r * 110} width={80} height={70} rx={10} fill={colors.ceu} stroke={colors.tinta} strokeWidth={ink} />,
      );
    }
  }
  return (
    <g>
      {/* Árvores */}
      <circle cx={820} cy={950} r={130} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={980} cy={900} r={150} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
      <circle cx={1180} cy={960} r={130} fill={colors.folha} stroke={colors.tinta} strokeWidth={ink} />
      {/* Prédio da escola */}
      <rect x={-120} y={800} width={760} height={420} fill={colors.creme} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={-140} y={770} width={800} height={50} rx={12} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
      {windows}
    </g>
  );
};

const Wall: React.FC = () => {
  const ink = useInk();
  const joints = [];
  for (let i = -3; i < 12; i++) {
    joints.push(<path key={i} d={`M ${i * 160} 1110 L ${i * 160} 1330`} stroke={colors.muroSombra} strokeWidth={ink * 0.8} />);
  }
  return (
    <g>
      <rect x={-600} y={1080} width={2280} height={260} fill={colors.muro} stroke={colors.tinta} strokeWidth={ink} />
      {joints}
      <rect x={-600} y={1060} width={2280} height={44} fill={colors.muroSombra} stroke={colors.tinta} strokeWidth={ink} />
    </g>
  );
};

const Floor: React.FC = () => {
  const ink = useInk();
  return (
    <g>
      <rect x={-1000} y={1320} width={3080} height={1400} fill={colors.chao} stroke={colors.tinta} strokeWidth={ink} />
      <path d="M -1000 1480 L 2080 1480" stroke={colors.chaoSombra} strokeWidth={ink} />
      <path d="M -1000 1700 L 2080 1700" stroke={colors.chaoSombra} strokeWidth={ink} />
      {/* Banco do pátio */}
      <rect x={760} y={1300} width={380} height={34} rx={10} fill={colors.coral} stroke={colors.tinta} strokeWidth={ink} />
      <rect x={790} y={1330} width={26} height={70} fill={colors.tinta} />
      <rect x={1080} y={1330} width={26} height={70} fill={colors.tinta} />
    </g>
  );
};
