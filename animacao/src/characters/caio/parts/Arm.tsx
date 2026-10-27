import React from 'react';
import {outlined, OUTLINE} from '../../shared/style';
import type {ArmAngles} from '../../shared/types';
import {CAIO} from '../geometry';
import {caioGi, type GiColors} from '../palette';

export type SleeveStyle = 'kimono' | 'beca';

/**
 * Braço em duas peças (braço + antebraço) com pivôs no ombro e no cotovelo.
 * É sempre desenhado como braço ESQUERDO da tela; o direito é o espelho.
 * `hold` é desenhado preso à mão (coordenadas da mão).
 */
export const ArmShape: React.FC<{angles: ArmAngles; c?: GiColors; sleeve?: SleeveStyle; hold?: React.ReactNode; shoulderX?: number}> = ({
	angles,
	c = caioGi,
	sleeve = 'kimono',
	hold,
	shoulderX = CAIO.shoulderLeft.x,
}) => {
	const y = CAIO.shoulderLeft.y;
	const beca = sleeve === 'beca';
	return (
		<g transform={`translate(${shoulderX} ${y}) rotate(${angles.shoulder})`}>
			{/* antebraço fica por baixo da manga do braço */}
			<g transform={`translate(0 ${CAIO.upperArmLength}) rotate(${angles.elbow})`}>
				{/* objeto segurado fica por baixo da mão */}
				{hold ? <g transform="translate(0 90)">{hold}</g> : null}
				<rect x={-11} y={52} width={22} height={26} fill={c.skin} {...outlined} />
				{beca ? (
					<path d="M -24 -8 L 24 -8 L 30 62 L -30 62 Z" fill={c.gi} {...outlined} />
				) : (
					<>
						<path d="M -22 -8 L 22 -8 L 19 60 L -19 60 Z" fill={c.gi} {...outlined} />
						<path d="M -18 50 L 18 50" stroke={c.giShade} strokeWidth={4} strokeLinecap="round" />
					</>
				)}
				{/* mão fechada */}
				<circle cx={0} cy={90} r={19} fill={c.skin} {...outlined} />
				<path d="M -10 80 Q -4 86 -10 92 M 0 78 Q 6 85 0 92 M 10 80 Q 15 86 10 92" fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
			</g>
			{/* manga do braço */}
			<path d="M -25 0 A 25 25 0 0 1 25 0 L 23 100 A 23 23 0 0 1 -23 100 Z" fill={c.gi} {...outlined} />
			{/* patch do ombro (só no kimono) */}
			{beca ? null : <rect x={-21} y={6} width={18} height={30} rx={5} fill={c.patch} />}
		</g>
	);
};

type ArmProps = {angles: ArmAngles; c?: GiColors; sleeve?: SleeveStyle; hold?: React.ReactNode};

export const ArmLeft: React.FC<ArmProps> = (p) => (
	<g id="braco-esquerdo">
		<ArmShape {...p} />
	</g>
);

export const ArmRight: React.FC<ArmProps> = ({hold, ...p}) => (
	<g id="braco-direito" transform={`translate(${CAIO.centerX * 2} 0) scale(-1 1)`}>
		<ArmShape {...p} hold={hold ? <g transform="scale(-1 1)">{hold}</g> : undefined} />
	</g>
);
