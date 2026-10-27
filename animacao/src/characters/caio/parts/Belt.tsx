import React from 'react';
import {outlined} from '../../shared/style';
import {caioGi, type GiColors} from '../palette';

/** Faixa com nó e duas pontas. `sway` balança as pontas (graus). */
export const Belt: React.FC<{sway?: number; c?: GiColors}> = ({sway = 0, c = caioGi}) => (
	<g id="faixa">
		<rect x={130} y={440} width={140} height={27} rx={7} fill={c.belt} {...outlined} />
		<rect x={134} y={458} width={132} height={6} fill={c.beltShade} />
		<g transform={`rotate(${sway} 200 462)`}>
			<path d="M 194 460 L 178 516 L 196 520 L 207 464 Z" fill={c.belt} {...outlined} />
			<path d="M 206 460 L 222 518 L 240 512 L 216 460 Z" fill={c.belt} {...outlined} />
			{c.beltTip ? (
				<>
					<path d="M 183 498 L 179 512 L 196 516 L 199 502 Z" fill={c.beltTip} />
					<path d="M 217 500 L 221 514 L 238 508 L 233 496 Z" fill={c.beltTip} />
				</>
			) : null}
		</g>
		<rect x={186} y={434} width={28} height={38} rx={8} fill={c.belt} {...outlined} />
	</g>
);
