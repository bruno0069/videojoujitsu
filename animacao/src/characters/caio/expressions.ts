import type {FaceParams} from '../shared/types';

// Expressões são apenas conjuntos de parâmetros: para criar uma nova,
// basta adicionar uma entrada aqui. Transições suaves usam mixFace().
export const caioExpressions = {
	confiante: {
		eyeOpen: 0.82,
		pupil: 1,
		browRaise: 0,
		browInner: -9,
		browAsym: 7,
		mouthWidth: 48,
		mouthSmile: 0.6,
		mouthOpen: 0.06,
		mouthSmirk: 0.55,
	},
	surpreso: {
		eyeOpen: 1.28,
		pupil: 0.72,
		browRaise: 17,
		browInner: 4,
		browAsym: 0,
		mouthWidth: 26,
		mouthSmile: 0,
		mouthOpen: 1,
		mouthSmirk: 0,
	},
	preocupado: {
		eyeOpen: 1.02,
		pupil: 1,
		browRaise: 7,
		browInner: 19,
		browAsym: 0,
		mouthWidth: 38,
		mouthSmile: -0.6,
		mouthOpen: 0.14,
		mouthSmirk: -0.25,
	},
} satisfies Record<string, FaceParams>;

export type CaioExpression = keyof typeof caioExpressions;

export const resolveExpression = (e: CaioExpression | FaceParams): FaceParams =>
	typeof e === 'string' ? caioExpressions[e] : e;
