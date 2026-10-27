import React from 'react';
import {outlined, OUTLINE} from '../../shared/style';
import type {ArmAngles} from '../../shared/types';
import {CAIO} from '../geometry';
import {caioPalette as P} from '../palette';

/**
 * Braço em duas peças (braço + antebraço) com pivôs no ombro e no cotovelo.
 * É sempre desenhado como braço ESQUERDO da tela; o direito é o espelho.
 */
const ArmShape: React.FC<{angles: ArmAngles}> = ({angles}) => {
	const {x, y} = CAIO.shoulderLeft;
	return (
		<g transform={`translate(${x} ${y}) rotate(${angles.shoulder})`}>
			{/* antebraço fica por baixo da manga do braço */}
			<g transform={`translate(0 ${CAIO.upperArmLength}) rotate(${angles.elbow})`}>
				<rect x={-11} y={52} width={22} height={26} fill={P.skin} {...outlined} />
				<path d="M -22 -8 L 22 -8 L 19 60 L -19 60 Z" fill={P.gi} {...outlined} />
				<path d="M -18 50 L 18 50" stroke={P.giShade} strokeWidth={4} strokeLinecap="round" />
				{/* mão fechada */}
				<circle cx={0} cy={90} r={19} fill={P.skin} {...outlined} />
				<path d="M -10 80 Q -4 86 -10 92 M 0 78 Q 6 85 0 92 M 10 80 Q 15 86 10 92" fill="none" stroke={OUTLINE} strokeWidth={3} strokeLinecap="round" />
			</g>
			{/* manga do braço */}
			<path d="M -25 0 A 25 25 0 0 1 25 0 L 23 100 A 23 23 0 0 1 -23 100 Z" fill={P.gi} {...outlined} />
			{/* patch preto do ombro */}
			<rect x={-21} y={6} width={18} height={30} rx={5} fill={P.patch} />
		</g>
	);
};

export const ArmLeft: React.FC<{angles: ArmAngles}> = ({angles}) => (
	<g id="braco-esquerdo">
		<ArmShape angles={angles} />
	</g>
);

export const ArmRight: React.FC<{angles: ArmAngles}> = ({angles}) => (
	<g id="braco-direito" transform={`translate(${CAIO.centerX * 2} 0) scale(-1 1)`}>
		<ArmShape angles={angles} />
	</g>
);
