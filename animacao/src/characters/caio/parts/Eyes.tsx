import React, {useId} from 'react';
import {OUTLINE} from '../../shared/style';
import type {Gaze} from '../../shared/types';
import {CAIO} from '../geometry';
import {caioPalette as P} from '../palette';

type EyeProps = {
	x: number;
	y: number;
	/** Abertura final (expressão × piscada). */
	open: number;
	pupil: number;
	gaze: Gaze;
};

const Eye: React.FC<EyeProps> = ({x, y, open, pupil, gaze}) => {
	const clipId = useId();
	const rx = 16;
	const ry = 21;

	if (open < 0.14) {
		// olho fechado: só a linha da pálpebra
		return (
			<path
				d={`M ${x - 18} ${y} Q ${x} ${y + 7} ${x + 18} ${y}`}
				fill="none"
				stroke={OUTLINE}
				strokeWidth={5.5}
				strokeLinecap="round"
			/>
		);
	}

	return (
		<g transform={`translate(${x} ${y}) scale(1 ${open})`}>
			<clipPath id={clipId}>
				<ellipse cx={0} cy={0} rx={rx} ry={ry} />
			</clipPath>
			<ellipse cx={0} cy={0} rx={rx} ry={ry} fill={P.eyeWhite} />
			<g clipPath={`url(#${clipId})`} transform={`translate(${gaze.x * 6} ${gaze.y * 6 + 2})`}>
				<circle r={11.5 * pupil} fill={P.iris} />
				<circle r={6 * pupil} fill={P.pupil} />
				<circle cx={-4} cy={-5} r={3.4} fill="#fff" />
			</g>
			<ellipse
				cx={0}
				cy={0}
				rx={rx}
				ry={ry}
				fill="none"
				stroke={OUTLINE}
				strokeWidth={4}
				vectorEffect="non-scaling-stroke"
			/>
			{/* pálpebra superior mais grossa (cílios) */}
			<path
				d={`M ${-rx - 2} -3 Q 0 ${-ry - 9} ${rx + 2} -3`}
				fill="none"
				stroke={OUTLINE}
				strokeWidth={6}
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</g>
	);
};

export const Eyes: React.FC<{open: number; pupil: number; blink: number; gaze: Gaze}> = ({
	open,
	pupil,
	blink,
	gaze,
}) => {
	const finalOpen = open * (1 - blink);
	return (
		<g id="olhos">
			<Eye x={CAIO.eyeLeft.x} y={CAIO.eyeLeft.y} open={finalOpen} pupil={pupil} gaze={gaze} />
			<Eye x={CAIO.eyeRight.x} y={CAIO.eyeRight.y} open={finalOpen} pupil={pupil} gaze={gaze} />
		</g>
	);
};
