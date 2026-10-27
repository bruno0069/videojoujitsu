import React from 'react';
import {outlined} from '../../shared/style';
import {caioPalette as P} from '../palette';

/** Faixa azul com nó e duas pontas. `sway` balança as pontas (graus). */
export const Belt: React.FC<{sway?: number}> = ({sway = 0}) => (
	<g id="faixa">
		<rect x={130} y={440} width={140} height={27} rx={7} fill={P.belt} {...outlined} />
		<rect x={134} y={458} width={132} height={6} fill={P.beltShade} />
		<g transform={`rotate(${sway} 200 462)`}>
			<path d="M 194 460 L 178 516 L 196 520 L 207 464 Z" fill={P.belt} {...outlined} />
			<path d="M 206 460 L 222 518 L 240 512 L 216 460 Z" fill={P.belt} {...outlined} />
		</g>
		<rect x={186} y={434} width={28} height={38} rx={8} fill={P.belt} {...outlined} />
	</g>
);
