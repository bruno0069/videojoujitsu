// Pontos de articulação do Caio, em unidades do viewBox do SVG.
// Mudar estes valores move as peças sem quebrar as animações.
export const CAIO = {
	viewBox: {x: -60, y: -20, width: 520, height: 800},
	/** Linha do chão (sola do tênis com pernas retas). */
	groundY: 745,
	centerX: 200,
	/** Pescoço: pivô da cabeça. */
	neck: {x: 200, y: 300},
	/** Quadril: pivô da inclinação do tronco. */
	hip: {x: 200, y: 505},
	/** Ombros: pivôs dos braços (o direito é o espelho do esquerdo). */
	shoulderLeft: {x: 140, y: 332},
	/** Articulação da perna (topo da calça). */
	legPivotLeft: {x: 172, y: 500},
	legLength: 215,
	upperArmLength: 102,
	face: {cx: 200, cy: 200},
	eyeLeft: {x: 165, y: 202},
	eyeRight: {x: 235, y: 202},
	browY: 166,
	mouth: {x: 200, y: 258},
};
