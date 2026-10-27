import {Easing, interpolate, spring} from 'remotion';

// Helpers de animação baseados em TEMPO ABSOLUTO DA NARRAÇÃO (segundos).
// Assim cada ação é escrita com o mesmo número que aparece na transcrição.

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.45, 0, 0.25, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.4);

/** Interpola v de `from` para `to` entre os instantes a e b (s), com clamp. */
export const ramp = (
	t: number,
	a: number,
	b: number,
	from = 0,
	to = 1,
	easing: (x: number) => number = easeInOut,
) => interpolate(t, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Curva por vários pontos (tempos em s). */
export const curve = (t: number, times: number[], values: number[], easing: (x: number) => number = easeInOut) =>
	interpolate(t, times, values, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Entrada elástica (0 → 1 com overshoot) a partir do instante `at`. */
export const pop = (t: number, at: number, fps: number, damping = 11) =>
	t < at ? 0 : spring({frame: (t - at) * fps, fps, config: {damping, stiffness: 180, mass: 0.6}});

/** Tremida de câmera que decai depois de um impacto. */
export const shake = (t: number, at: number, strength = 26, duration = 0.35) => {
	if (t < at || t > at + duration) return {x: 0, y: 0};
	const k = 1 - (t - at) / duration;
	return {
		x: Math.sin((t - at) * 95) * strength * k,
		y: Math.cos((t - at) * 77) * strength * 0.7 * k,
	};
};

/** Soma várias tremidas. */
export const shakes = (t: number, list: {at: number; strength?: number; duration?: number}[]) =>
	list.reduce(
		(acc, s) => {
			const v = shake(t, s.at, s.strength, s.duration);
			return {x: acc.x + v.x, y: acc.y + v.y};
		},
		{x: 0, y: 0},
	);

export const between = (t: number, a: number, b: number) => t >= a && t < b;

/** Oscilação contínua (respiração, balanço). */
export const wave = (t: number, hz: number, amp = 1, phase = 0) => Math.sin((t * hz + phase) * Math.PI * 2) * amp;

/** Clarão que só acontece a partir de `at` (pico → 0 em `duration`). Antes de `at` vale 0. */
export const flashAt = (t: number, at: number, peak = 0.6, duration = 0.15) =>
	t < at ? 0 : ramp(t, at, at + duration, peak, 0);
