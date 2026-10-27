import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Captions} from './Captions';
import {Cena1} from './scenes/Cena1';
import {Cena2} from './scenes/Cena2';
import {Cena3} from './scenes/Cena3';
import {Cena4} from './scenes/Cena4';
import {Cena5} from './scenes/Cena5';
import {Cena6} from './scenes/Cena6';
import {Cena7} from './scenes/Cena7';
import {FPS, NARRATION_END, scenes, sec} from './timing';

// EP01 — "O Mata-Leão e a Conta de Luz". A narração aprovada é a referência de tempo:
// cada cena começa e termina nos silêncios entre as falas (ver timing.ts).

const components: Record<(typeof scenes)[number]['id'], React.FC> = {
	cena1: Cena1,
	cena2: Cena2,
	cena3: Cena3,
	cena4: Cena4,
	cena5: Cena5,
	cena6: Cena6,
	cena7: Cena7,
};

type Sfx = {at: number; file: string; volume: number};

// Efeitos pontuais, sempre baixos para não competir com a voz.
const sfx: Sfx[] = [
	{at: 0.42, file: 'pop', volume: 0.25},
	{at: 1.1, file: 'whoosh', volume: 0.22},
	{at: 3.16, file: 'impact', volume: 0.35},
	{at: 3.32, file: 'tap', volume: 0.3},
	{at: 7.64, file: 'impact', volume: 0.45},
	{at: 8.0, file: 'stamp', volume: 0.35},
	{at: 8.88, file: 'pop', volume: 0.22},
	{at: 10.0, file: 'whoosh', volume: 0.2},
	{at: 11.45, file: 'ding', volume: 0.18},
	{at: 12.3, file: 'flash', volume: 0.2},
	{at: 12.82, file: 'flash', volume: 0.2},
	{at: 13.6, file: 'pop', volume: 0.18},
	{at: 16.42, file: 'pop', volume: 0.2},
	{at: 18.74, file: 'scratch', volume: 0.35},
	{at: 20.9, file: 'whoosh', volume: 0.25},
	{at: 23.05, file: 'whoosh', volume: 0.22},
	{at: 29.95, file: 'stamp', volume: 0.32},
	{at: 30.93, file: 'stamp', volume: 0.32},
	{at: 31.63, file: 'stamp', volume: 0.32},
	{at: 32.7, file: 'impact', volume: 0.35},
	{at: 35.4, file: 'stamp', volume: 0.32},
	{at: 43.08, file: 'wahwah', volume: 0.28},
	{at: 47.45, file: 'ding', volume: 0.2},
	{at: 52.0, file: 'whoosh', volume: 0.22},
	{at: 53.9, file: 'ding', volume: 0.15},
	{at: 55.15, file: 'pop', volume: 0.2},
	{at: 59.98, file: 'impact', volume: 0.35},
	{at: 61.9, file: 'scratch', volume: 0.32},
	{at: 64.0, file: 'pop', volume: 0.18},
	{at: 71.35, file: 'whoosh', volume: 0.2},
	{at: 72.46, file: 'stamp', volume: 0.4},
	{at: 76.88, file: 'pop', volume: 0.3},
	{at: 81.22, file: 'pop', volume: 0.3},
	{at: 88.86, file: 'impact', volume: 0.35},
	{at: 88.95, file: 'tap', volume: 0.3},
	{at: 89.75, file: 'ding', volume: 0.25},
];

/** Posição da legenda: sai de cima do que importa em alguns planos. */
const captionY = (t: number): number | null => {
	if (t >= 89.7) return null; // a cartela final já diz "COMENTA A OU B"
	if (t >= 29.0 && t < 32.65) return 330; // contas na mesa
	if (t >= 44.6 && t < 47.15) return 330; // Caio no chão
	if (t >= 53.75 && t < 56.55) return 960; // tela dividida
	if (t >= 67.55 && t < 71.25) return 960; // tela dividida
	return 1450;
};

export const Episode01: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const y = captionY(t);
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{scenes.map((s) => {
				const C = components[s.id];
				return (
					<Sequence key={s.id} name={s.title} from={sec(s.start)} durationInFrames={sec(s.end) - sec(s.start)}>
						<C />
					</Sequence>
				);
			})}

			{y !== null && t <= NARRATION_END + 0.8 ? <Captions t={t} y={y} /> : null}

			<Audio src={staticFile('ep01/narracao.wav')} volume={1} />
			{sfx.map((s, i) => (
				<Sequence key={i} name={`sfx ${s.file}`} from={sec(s.at)} durationInFrames={sec(2.2)}>
					<Audio src={staticFile(`ep01/sfx/${s.file}.wav`)} volume={s.volume} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
