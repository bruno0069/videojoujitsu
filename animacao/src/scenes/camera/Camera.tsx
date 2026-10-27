import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Câmera 2D simples: aproxima (zoom) em torno de um ponto de foco, em px da composição.
 * Tudo que estiver dentro (cenário + personagens) é enquadrado junto.
 * offsetX/offsetY deslocam o quadro (pan / tremida) e rotate inclina a câmera.
 */
export const Camera: React.FC<{
	zoom: number;
	focusX: number;
	focusY: number;
	offsetX?: number;
	offsetY?: number;
	rotate?: number;
	children: React.ReactNode;
}> = ({zoom, focusX, focusY, offsetX = 0, offsetY = 0, rotate = 0, children}) => (
	<AbsoluteFill style={{overflow: 'hidden'}}>
		<AbsoluteFill
			style={{
				transformOrigin: `${focusX}px ${focusY}px`,
				scale: String(zoom),
				translate: `${offsetX}px ${offsetY}px`,
				rotate: `${rotate}deg`,
			}}
		>
			{children}
		</AbsoluteFill>
	</AbsoluteFill>
);

/** Camada com parallax: move menos (depth < 1) ou mais (depth > 1) que a câmera. */
export const Layer: React.FC<{
	panX?: number;
	panY?: number;
	depth?: number;
	children: React.ReactNode;
}> = ({panX = 0, panY = 0, depth = 1, children}) => (
	<AbsoluteFill style={{translate: `${panX * depth}px ${panY * depth}px`}}>{children}</AbsoluteFill>
);
