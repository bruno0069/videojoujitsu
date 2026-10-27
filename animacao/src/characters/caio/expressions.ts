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
	// Adicionadas para o EP01 (as três acima são as aprovadas e não mudaram).
	feliz: {
		eyeOpen: 0.95,
		pupil: 1.05,
		browRaise: 8,
		browInner: -2,
		browAsym: 0,
		mouthWidth: 52,
		mouthSmile: 1,
		mouthOpen: 0.55,
		mouthSmirk: 0,
	},
	pensativo: {
		eyeOpen: 0.7,
		pupil: 1,
		browRaise: 4,
		browInner: -12,
		browAsym: 10,
		mouthWidth: 30,
		mouthSmile: -0.15,
		mouthOpen: 0.04,
		mouthSmirk: -0.6,
	},
	chorando: {
		eyeOpen: 0.42,
		pupil: 1,
		browRaise: 10,
		browInner: 26,
		browAsym: 0,
		mouthWidth: 46,
		mouthSmile: -1,
		mouthOpen: 0.6,
		mouthSmirk: 0,
	},
	esforco: {
		eyeOpen: 0.35,
		pupil: 1,
		browRaise: -2,
		browInner: -20,
		browAsym: 0,
		mouthWidth: 50,
		mouthSmile: -0.2,
		mouthOpen: 0.45,
		mouthSmirk: 0.3,
	},
} satisfies Record<string, FaceParams>;

export type CaioExpression = keyof typeof caioExpressions;

export const resolveExpression = (e: CaioExpression | FaceParams): FaceParams =>
	typeof e === 'string' ? caioExpressions[e] : e;
