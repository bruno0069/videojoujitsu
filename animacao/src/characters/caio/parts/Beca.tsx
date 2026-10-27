import React from 'react';
import {outlined} from '../../shared/style';
import {caioPalette as P, type GiColors} from '../palette';

// Roupa de formatura do Caio (beca + faixa amarela), mesmo traço do kimono.
export const becaColors: GiColors = {
	gi: '#22305E',
	giShade: '#18234A',
	undershirt: '#FFFFFF',
	patch: '#22305E',
	skin: P.skin,
	skinShade: P.skinShade,
	belt: '#22305E',
	beltShade: '#18234A',
};

export const becaPants = {pants: '#2E2E36', pantsShade: '#202027'};

export const TorsoBeca: React.FC = () => (
	<g id="tronco-beca">
		<path d="M 124 336 Q 126 312 162 306 L 238 306 Q 274 312 276 336 L 298 690 L 102 690 Z" fill={becaColors.gi} {...outlined} />
		{/* sombra lateral e pregas */}
		<path d="M 262 340 L 284 686 L 266 686 L 250 340 Z" fill={becaColors.giShade} />
		<path d="M 150 560 L 142 684 M 250 560 L 258 684" stroke={becaColors.giShade} strokeWidth={5} strokeLinecap="round" />
		{/* gola da camisa branca */}
		<path d="M 172 306 L 228 306 L 200 362 Z" fill="#FFFFFF" {...outlined} strokeWidth={4} />
		<path d="M 194 318 L 206 318 L 204 350 L 196 350 Z" fill="#D62828" />
		{/* faixa amarela (estola) */}
		<path d="M 158 306 L 180 306 L 184 610 L 156 616 Z" fill="#F7C21B" {...outlined} strokeWidth={4} />
		<path d="M 220 306 L 242 306 L 244 616 L 216 610 Z" fill="#F7C21B" {...outlined} strokeWidth={4} />
	</g>
);
