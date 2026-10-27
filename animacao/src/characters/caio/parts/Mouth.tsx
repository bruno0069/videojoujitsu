import React, {useId} from 'react';
import {OUTLINE} from '../../shared/style';
import {CAIO} from '../geometry';
import {caioPalette as P} from '../palette';

type MouthProps = {width: number; smile: number; open: number; smirk: number};

/**
 * Boca paramétrica: dois arcos (lábio de cima e de baixo) entre os cantos.
 * Como tudo é número, qualquer expressão pode virar outra suavemente.
 */
export const mouthPath = ({width, smile, open, smirk}: MouthProps) => {
	const {x: cx, y: cy} = CAIO.mouth;
	const lx = cx - width / 2;
	const rx = cx + width / 2;
	const ly = cy - smile * 10 + smirk * 3;
	const ry = cy - smile * 10 - smirk * 9;
	const upY = cy + smile * 4 - open * 10;
	const loY = cy + smile * 16 + open * 46 + 4;
	return `M ${lx} ${ly} Q ${cx} ${upY} ${rx} ${ry} Q ${cx} ${loY} ${lx} ${ly} Z`;
};

export const Mouth: React.FC<MouthProps> = (props) => {
	const clipId = useId();
	const d = mouthPath(props);
	const {x: cx, y: cy} = CAIO.mouth;
	return (
		<g id="boca">
			<clipPath id={clipId}>
				<path d={d} />
			</clipPath>
			<path d={d} fill={P.mouth} />
			{props.open > 0.3 ? (
				<g clipPath={`url(#${clipId})`}>
					<rect x={cx - 30} y={cy - 20} width={60} height={14 + props.open * 6} fill={P.teeth} />
					<ellipse cx={cx} cy={cy + props.open * 30} rx={18} ry={11} fill={P.tongue} />
				</g>
			) : null}
			<path d={d} fill="none" stroke={OUTLINE} strokeWidth={4.5} strokeLinejoin="round" />
		</g>
	);
};
