import React from 'react';

/** Posiciona um desenho SVG pelo centro (px da composição). Base de todos os objetos de cena. */
export type PlacedProps = {
	x: number;
	y: number;
	scale?: number;
	rotate?: number;
	opacity?: number;
	flip?: boolean;
};

export const Placed: React.FC<
	PlacedProps & {viewBox: [number, number, number, number]; width: number; children: React.ReactNode}
> = ({x, y, scale = 1, rotate = 0, opacity = 1, flip = false, viewBox, width, children}) => {
	if (scale <= 0.001 || opacity <= 0.001) return null;
	const [, , w, h] = viewBox;
	return (
		<svg
			viewBox={viewBox.join(' ')}
			width={width}
			height={(width * h) / w}
			style={{
				position: 'absolute',
				left: x,
				top: y,
				translate: '-50% -50%',
				scale: flip ? `${-scale} ${scale}` : String(scale),
				rotate: `${rotate}deg`,
				opacity,
				overflow: 'visible',
			}}
		>
			{children}
		</svg>
	);
};
