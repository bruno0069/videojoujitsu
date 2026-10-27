import React from 'react';
import {outlined} from '../../shared/style';
import {CAIO} from '../geometry';
import {caioPalette as P} from '../palette';

/** Ângulo de abertura da perna para uma base (0 = em pé, 1 = base de luta). */
export const legAngleFor = (stance: number) => 3 + stance * 15;

const LegShape: React.FC<{angle: number}> = ({angle}) => {
	const {x, y} = CAIO.legPivotLeft;
	const L = CAIO.legLength;
	return (
		<g transform={`translate(${x} ${y}) rotate(${angle})`}>
			<path d={`M -28 0 L 28 0 L 23 ${L} L -22 ${L} Z`} fill={P.gi} {...outlined} />
			<path d={`M 6 ${L * 0.45} Q 12 ${L * 0.52} 6 ${L * 0.6}`} fill="none" stroke={P.giShade} strokeWidth={4} strokeLinecap="round" />
			{/* tênis: contra-rotaciona para ficar apoiado no chão */}
			<g transform={`translate(0 ${L}) rotate(${-angle})`}>
				<path d="M 22 -6 Q 26 20 10 24 L -34 24 Q -46 22 -42 6 Q -30 -8 22 -6 Z" fill={P.shoes} {...outlined} />
				<path d="M -38 17 L 18 17" stroke={P.sole} strokeWidth={4} strokeLinecap="round" />
			</g>
		</g>
	);
};

export const Legs: React.FC<{stance: number}> = ({stance}) => {
	const angle = legAngleFor(stance);
	return (
		<g id="pernas">
			<LegShape angle={angle} />
			<g transform={`translate(${CAIO.centerX * 2} 0) scale(-1 1)`}>
				<LegShape angle={angle} />
			</g>
		</g>
	);
};
