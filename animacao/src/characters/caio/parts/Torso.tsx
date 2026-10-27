import React from 'react';
import {outlined} from '../../shared/style';
import {caioGi, type GiColors} from '../palette';

// Pescoço + paletó do kimono (gi) com golas cruzadas e camiseta por baixo.
// As cores são parâmetros para o mesmo kimono servir a outros personagens.
export const Neck: React.FC<{c?: GiColors}> = ({c = caioGi}) => (
	<g id="pescoco">
		<rect x={181} y={272} width={38} height={52} fill={c.skin} {...outlined} />
		<rect x={183} y={276} width={34} height={14} fill={c.skinShade} />
	</g>
);

export const Torso: React.FC<{c?: GiColors}> = ({c = caioGi}) => (
	<g id="tronco-kimono">
		{/* paletó */}
		<path
			d="M 126 336 Q 128 312 162 306 L 238 306 Q 272 312 274 336 L 268 470 Q 270 520 262 528 L 138 528 Q 130 520 132 470 Z"
			fill={c.gi}
			{...outlined}
		/>
		{/* sombra lateral chapada */}
		<path d="M 262 340 L 268 470 Q 270 518 262 526 L 246 526 L 252 340 Z" fill={c.giShade} />
		{/* camiseta no decote */}
		<path d="M 176 307 L 224 307 L 200 372 Z" fill={c.undershirt} />
		{/* gola de baixo (lado direito da tela) */}
		<path d="M 222 304 L 240 306 L 196 448 L 176 448 Z" fill={c.gi} {...outlined} />
		{/* gola de cima (lado esquerdo da tela) */}
		<path d="M 160 306 L 178 304 L 226 448 L 204 448 Z" fill={c.gi} {...outlined} />
		{/* dobras do tecido */}
		<path d="M 150 380 Q 156 410 150 436" fill="none" stroke={c.giShade} strokeWidth={4} strokeLinecap="round" />
		<path d="M 244 470 Q 238 494 244 520" fill="none" stroke={c.giShade} strokeWidth={4} strokeLinecap="round" />
	</g>
);
