import React from 'react';
import {OUTLINE} from '../../shared/style';
import {CAIO} from '../geometry';

const Brow: React.FC<{x: number; y: number; angle: number}> = ({x, y, angle}) => (
	<path
		transform={`translate(${x} ${y}) rotate(${angle})`}
		d="M -22 3 Q 0 -6 22 0"
		fill="none"
		stroke={OUTLINE}
		strokeWidth={11}
		strokeLinecap="round"
	/>
);

/**
 * raise: sobe as duas sobrancelhas.
 * inner: + levanta as pontas internas (preocupação), − abaixa (determinação).
 * asym: levanta só a sobrancelha esquerda da tela.
 */
export const Eyebrows: React.FC<{raise: number; inner: number; asym: number}> = ({
	raise,
	inner,
	asym,
}) => {
	const y = CAIO.browY - raise;
	return (
		<g id="sobrancelhas">
			<Brow x={CAIO.eyeLeft.x} y={y - asym} angle={-inner} />
			<Brow x={CAIO.eyeRight.x} y={y} angle={inner} />
		</g>
	);
};
