import {useCurrentFrame, useVideoConfig} from 'remotion';
import {wave} from '../../animation/anim';
import {blinkAt} from '../../animation/blink';

/** Tempo absoluto da narração (s) dentro de uma cena que começa em `start`. */
export const useT = (start: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return start + frame / fps;
};

/** Distância (em unidades do SVG × escala) entre os pés e o centro do rosto do Caio. */
export const FACE_FROM_FEET = 545;

/** y dos pés para que o rosto fique em `faceY`. */
export const feetFor = (faceY: number, scale: number) => faceY + FACE_FROM_FEET * scale;

/** Respiração padrão. */
export const breath = (t: number) => wave(t, 0.45, 3);

/** Piscada por personagem (sementes diferentes = piscam em momentos diferentes). */
export const blink = (t: number, seed: string) => blinkAt(Math.round(t * 30), 30, seed);
