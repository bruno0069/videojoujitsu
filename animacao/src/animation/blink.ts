import {random} from 'remotion';

/**
 * Piscada automática e determinística (mesmo resultado em todo render).
 * Intervalos irregulares entre 2 s e 4,5 s; cada piscada dura ~0,2 s.
 * Retorna 0 (aberto) … 1 (fechado).
 */
export const blinkAt = (frame: number, fps: number, seed = 'blink'): number => {
	const duration = Math.max(4, Math.round(fps * 0.2));
	let start = Math.round(fps * 0.8);
	let i = 0;
	while (start <= frame) {
		if (frame < start + duration) {
			const p = (frame - start) / duration;
			// fecha rápido, abre um pouco mais devagar
			return p < 0.4 ? p / 0.4 : 1 - (p - 0.4) / 0.6;
		}
		start += Math.round(fps * (2 + random(`${seed}-${i}`) * 2.5));
		i++;
	}
	return 0;
};
