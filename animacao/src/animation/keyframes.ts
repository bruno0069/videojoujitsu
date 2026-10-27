import {Easing, interpolate} from 'remotion';

export type Keyframe<T> = {frame: number; value: T};

const ease = Easing.bezier(0.33, 0, 0.2, 1);

/**
 * Troca de estado com transição suave: em cada keyframe o valor passa do
 * estado anterior para o novo ao longo de `duration` frames.
 * Serve para expressões, poses de braço ou qualquer tipo com função de mistura.
 */
export const blendKeyframes = <T,>(
	frame: number,
	keys: Keyframe<T>[],
	duration: number,
	mix: (a: T, b: T, t: number) => T,
): T => {
	let current = keys[0].value;
	for (let i = 1; i < keys.length; i++) {
		const k = keys[i];
		if (frame < k.frame) break;
		const t = interpolate(frame, [k.frame, k.frame + duration], [0, 1], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
			easing: ease,
		});
		current = mix(current, k.value, t);
	}
	return current;
};
