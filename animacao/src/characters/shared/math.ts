import type {ArmAngles, FaceParams} from './types';

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const mixFace = (a: FaceParams, b: FaceParams, t: number): FaceParams => {
	const out = {} as FaceParams;
	for (const key of Object.keys(a) as (keyof FaceParams)[]) {
		out[key] = lerp(a[key], b[key], t);
	}
	return out;
};

export const mixArm = (a: ArmAngles, b: ArmAngles, t: number): ArmAngles => ({
	shoulder: lerp(a.shoulder, b.shoulder, t),
	elbow: lerp(a.elbow, b.elbow, t),
});
