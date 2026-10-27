import React from 'react';
import type {ArmAngles, FaceParams, Gaze} from '../shared/types';
import {resolveExpression, type CaioExpression} from './expressions';
import {CAIO} from './geometry';
import {ArmLeft, ArmRight} from './parts/Arm';
import {Belt} from './parts/Belt';
import {becaColors, becaPants, TorsoBeca} from './parts/Beca';
import {Head} from './parts/Head';
import {Legs, legAngleFor} from './parts/Legs';
import {Neck, Torso} from './parts/Torso';
import {resolveArm, type ArmPoseName} from './poses';

type ArmInput = ArmPoseName | ArmAngles;

export type CaioProps = {
	/** Nome da expressão ou parâmetros de rosto (ex.: resultado de mixFace). */
	expression?: CaioExpression | FaceParams;
	/** 0 = olhos abertos, 1 = fechados. */
	blink?: number;
	/** Direção do olhar, −1…1 em x e y. */
	gaze?: Gaze;
	/** Inclinação da cabeça em graus (positivo = horário). */
	headTilt?: number;
	/** Deslocamento vertical da cabeça (aceno), em unidades do SVG. */
	headNod?: number;
	/** Inclinação do tronco a partir do quadril, em graus. */
	bodyLean?: number;
	/** Sobe/desce o tronco (respiração, agachar), em unidades do SVG. */
	bodyBob?: number;
	/** Base das pernas: 0 = em pé, 1 = base de luta. */
	stance?: number;
	/** Pose dos braços: uma pose para os dois, ou por braço. */
	arms?: ArmInput | {left: ArmInput; right: ArmInput};
	/** Balanço das pontas da faixa, em graus. */
	beltSway?: number;
	/** Posição dos pés na cena (px, relativo ao container pai). */
	x?: number;
	y?: number;
	/** Altura do personagem em px = 800 × scale. */
	scale?: number;
	/** Espelha o personagem horizontalmente. */
	flip?: boolean;
	/** Sombra no chão. */
	shadow?: boolean;
	/** Elementos extras sobre o tronco (coordenadas do SVG): medalha, patrocínios… */
	bodyOverlay?: React.ReactNode;
	/** Elementos extras presos à cabeça (coordenadas do SVG): capelo, lágrimas… */
	headOverlay?: React.ReactNode;
	/** Roupa: kimono (padrão) ou beca de formatura. */
	outfit?: 'kimono' | 'formatura';
	/** Objetos na mão esquerda / direita da tela (coordenadas da mão). */
	holdLeft?: React.ReactNode;
	holdRight?: React.ReactNode;
};

const {viewBox: VB} = CAIO;
// ponto do viewBox que fica sobre (x, y): centro entre os pés, no chão
const ANCHOR_X = (CAIO.centerX - VB.x) / VB.width;
const ANCHOR_Y = (CAIO.groundY - VB.y) / VB.height;

export const Caio: React.FC<CaioProps> = ({
	expression = 'confiante',
	blink = 0,
	gaze = {x: 0, y: 0},
	headTilt = 0,
	headNod = 0,
	bodyLean = 0,
	bodyBob = 0,
	stance = 0,
	arms = 'solto',
	beltSway = 0,
	x = 0,
	y = 0,
	scale = 1,
	flip = false,
	shadow = true,
	bodyOverlay,
	headOverlay,
	outfit = 'kimono',
	holdLeft,
	holdRight,
}) => {
	const beca = outfit === 'formatura';
	const face = resolveExpression(expression);
	const armPair =
		typeof arms === 'object' && 'left' in arms
			? {left: resolveArm(arms.left), right: resolveArm(arms.right)}
			: {left: resolveArm(arms), right: resolveArm(arms)};

	// pernas abertas encurtam a altura: desce o corpo para os pés continuarem no chão
	const legRad = (legAngleFor(stance) * Math.PI) / 180;
	const drop = CAIO.legLength * (1 - Math.cos(legRad));
	const {hip, neck} = CAIO;

	const width = VB.width * scale;
	const height = VB.height * scale;

	return (
		<svg
			viewBox={`${VB.x} ${VB.y} ${VB.width} ${VB.height}`}
			width={width}
			height={height}
			style={{
				position: 'absolute',
				left: x - width * ANCHOR_X,
				top: y - height * ANCHOR_Y,
				overflow: 'visible',
				scale: flip ? '-1 1' : undefined,
			}}
		>
			{shadow ? (
				<ellipse cx={CAIO.centerX} cy={CAIO.groundY} rx={110 + stance * 40} ry={16} fill="#000" opacity={0.18} />
			) : null}
			<g id="caio" transform={`translate(0 ${drop})`}>
				<Legs stance={stance} c={beca ? becaPants : undefined} />
				<g id="corpo-superior" transform={`translate(0 ${bodyBob}) rotate(${bodyLean} ${hip.x} ${hip.y})`}>
					<Neck />
					{beca ? <TorsoBeca /> : <Torso />}
					{beca ? null : <Belt sway={beltSway} />}
					{bodyOverlay}
					<g transform={`translate(0 ${headNod}) rotate(${headTilt} ${neck.x} ${neck.y})`}>
						<Head face={face} blink={blink} gaze={gaze} />
						{headOverlay}
					</g>
					<ArmLeft angles={armPair.left} hold={holdLeft} c={beca ? becaColors : undefined} sleeve={beca ? 'beca' : 'kimono'} />
					<ArmRight angles={armPair.right} hold={holdRight} c={beca ? becaColors : undefined} sleeve={beca ? 'beca' : 'kimono'} />
				</g>
			</g>
		</svg>
	);
};
