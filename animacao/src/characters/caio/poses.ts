import type {ArmAngles} from '../shared/types';

// Poses de braço prontas. Os ângulos valem para os dois braços
// (o braço direito é espelhado), então "shoulder > 0" sempre abre para fora.
export const armPoses = {
	solto: {shoulder: 7, elbow: -6},
	guarda: {shoulder: 24, elbow: -142},
	comemorando: {shoulder: 150, elbow: -22},
	maosNaCintura: {shoulder: 38, elbow: -98},
	susto: {shoulder: 32, elbow: 78},
	// adicionadas no EP01
	apontando: {shoulder: 88, elbow: -4},
	encolhido: {shoulder: 12, elbow: -150},
} satisfies Record<string, ArmAngles>;

export type ArmPoseName = keyof typeof armPoses;

export const resolveArm = (a: ArmPoseName | ArmAngles): ArmAngles =>
	typeof a === 'string' ? armPoses[a] : a;
