import React from 'react';
import {AbsoluteFill} from 'remotion';

/**
 * Câmera 2D simples: aproxima (zoom) em torno de um ponto de foco, em px da composição.
 * Tudo que estiver dentro (cenário + personagens) é enquadrado junto.
 */
export const Camera: React.FC<{
	zoom: number;
	focusX: number;
	focusY: number;
	children: React.ReactNode;
}> = ({zoom, focusX, focusY, children}) => (
	<AbsoluteFill style={{overflow: 'hidden'}}>
		<AbsoluteFill style={{transformOrigin: `${focusX}px ${focusY}px`, scale: String(zoom)}}>
			{children}
		</AbsoluteFill>
	</AbsoluteFill>
);
