import React from 'react';
import {outlined, OUTLINE} from '../../shared/style';
import type {FaceParams, Gaze} from '../../shared/types';
import {caioPalette as P} from '../palette';
import {Eyebrows} from './Eyebrows';
import {Eyes} from './Eyes';
import {HairBack, HairFront} from './Hair';
import {Mouth} from './Mouth';

const FACE =
	'M 114 188 C 112 128 288 128 286 188 C 286 252 250 298 200 298 C 150 298 114 252 114 188 Z';

const Ear: React.FC<{x: number; flip?: boolean}> = ({x, flip}) => (
	<g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
		<ellipse cx={x} cy={210} rx={15} ry={22} fill={P.skin} {...outlined} />
		<path d={`M ${x + 3} 200 Q ${x - 6} 210 ${x + 3} 222`} fill="none" stroke={P.skinShade} strokeWidth={4} strokeLinecap="round" />
	</g>
);

export const Head: React.FC<{face: FaceParams; blink: number; gaze: Gaze}> = ({face, blink, gaze}) => (
	<g id="cabeca">
		<HairBack />
		<Ear x={114} />
		<Ear x={286} flip />
		<path d={FACE} fill={P.skin} {...outlined} />
		{/* sombra do queixo para dar volume sem degradê */}
		<path d="M 150 282 Q 200 306 250 282 Q 228 296 200 297 Q 172 296 150 282 Z" fill={P.skinShade} />
		<HairFront />
		<Eyebrows raise={face.browRaise} inner={face.browInner} asym={face.browAsym} />
		<Eyes open={face.eyeOpen} pupil={face.pupil} blink={blink} gaze={gaze} />
		{/* nariz */}
		<path d="M 196 222 Q 192 238 202 240 Q 210 240 211 234" fill="none" stroke={OUTLINE} strokeWidth={4} strokeLinecap="round" />
		<Mouth width={face.mouthWidth} smile={face.mouthSmile} open={face.mouthOpen} smirk={face.mouthSmirk} />
	</g>
);
