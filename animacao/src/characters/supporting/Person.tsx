import React from 'react';
import {CAIO} from '../caio/geometry';
import type {GiColors} from '../caio/palette';
import {ArmShape} from '../caio/parts/Arm';
import {Belt} from '../caio/parts/Belt';
import {Torso} from '../caio/parts/Torso';
import {Eyebrows} from '../caio/parts/Eyebrows';
import {Eyes} from '../caio/parts/Eyes';
import {Mouth} from '../caio/parts/Mouth';
import {outlined, OUTLINE} from '../shared/style';
import type {ArmAngles, FaceParams, Gaze} from '../shared/types';

// Base para os personagens secundários (plano médio: cabeça, tronco e braços).
// Usa o MESMO sistema de coordenadas e as MESMAS peças de rosto do Caio
// (olhos, sobrancelhas, boca), garantindo a mesma linguagem visual da série.

export type PersonLook = {
	skin: string;
	skinShade: string;
	sleeve: string;
	sleeveShade: string;
	hairBack?: React.ReactNode;
	hairFront?: React.ReactNode;
	/** Roupa do tronco (do pescoço para baixo, até y≈800). Ignorada quando `gi` é usado. */
	outfit?: React.ReactNode;
	/** Kimono: usa exatamente as mesmas peças do kimono do Caio, com estas cores. */
	gi?: GiColors;
	/** Por cima do rosto: barba, bigode, chapéu… */
	faceExtras?: React.ReactNode;
	/** Rosto um pouco mais largo/estreito. */
	faceWidth?: number;
};

export type PersonProps = {
	expression: FaceParams;
	blink?: number;
	gaze?: Gaze;
	headTilt?: number;
	bodyLean?: number;
	bodyBob?: number;
	armLeft?: ArmAngles;
	armRight?: ArmAngles;
	x: number;
	y: number;
	scale?: number;
	flip?: boolean;
	/** Algo que a mão direita / esquerda da tela segura (coordenadas da mão). */
	holdRight?: React.ReactNode;
	holdLeft?: React.ReactNode;
};

const VB = CAIO.viewBox;
const ANCHOR_X = (CAIO.centerX - VB.x) / VB.width;
const ANCHOR_Y = (CAIO.groundY - VB.y) / VB.height;

const Arm: React.FC<{angles: ArmAngles; look: PersonLook; hold?: React.ReactNode}> = ({angles, look, hold}) => (
	<g transform={`translate(138 334) rotate(${angles.shoulder})`}>
		<g transform={`translate(0 100) rotate(${angles.elbow})`}>
			{hold ? <g transform="translate(0 88)">{hold}</g> : null}
			<path d="M -22 -8 L 22 -8 L 20 58 L -20 58 Z" fill={look.sleeve} {...outlined} />
			<rect x={-11} y={54} width={22} height={22} fill={look.skin} {...outlined} />
			<circle cx={0} cy={88} r={19} fill={look.skin} {...outlined} />
		</g>
		<path d="M -25 0 A 25 25 0 0 1 25 0 L 23 100 A 23 23 0 0 1 -23 100 Z" fill={look.sleeve} {...outlined} />
		<path d="M 10 10 L 12 90" stroke={look.sleeveShade} strokeWidth={5} strokeLinecap="round" />
	</g>
);

export const Person: React.FC<PersonProps & {look: PersonLook}> = ({
	look,
	expression,
	blink = 0,
	gaze = {x: 0, y: 0},
	headTilt = 0,
	bodyLean = 0,
	bodyBob = 0,
	armLeft = {shoulder: 7, elbow: -6},
	armRight = {shoulder: 7, elbow: -6},
	x,
	y,
	scale = 1,
	flip = false,
	holdRight,
	holdLeft,
}) => {
	const gi = look.gi;
	const giOutfit = gi ? (
		<g>
			{/* calça do kimono (plano médio: só o começo das pernas) */}
			<path d="M 144 500 L 202 500 L 198 800 L 148 800 Z" fill={gi.gi} {...outlined} />
			<path d="M 256 500 L 198 500 L 202 800 L 252 800 Z" fill={gi.gi} {...outlined} />
			<Torso c={gi} />
			<Belt c={gi} />
		</g>
	) : null;
	const width = VB.width * scale;
	const height = VB.height * scale;
	const fw = look.faceWidth ?? 1;
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
			<g transform={`translate(0 ${bodyBob}) rotate(${bodyLean} 200 600)`}>
				<rect x={181} y={272} width={38} height={52} fill={look.skin} {...outlined} />
				{gi ? giOutfit : look.outfit}
				<g transform={`rotate(${headTilt} 200 300)`}>
					{look.hairBack}
					<ellipse cx={200 - 88 * fw} cy={210} rx={15} ry={22} fill={look.skin} {...outlined} />
					<ellipse cx={200 + 88 * fw} cy={210} rx={15} ry={22} fill={look.skin} {...outlined} />
					<path
						d={`M ${200 - 86 * fw} 188 C ${200 - 88 * fw} 128 ${200 + 88 * fw} 128 ${200 + 86 * fw} 188 C ${200 + 86 * fw} 252 ${200 + 50 * fw} 298 200 298 C ${200 - 50 * fw} 298 ${200 - 86 * fw} 252 ${200 - 86 * fw} 188 Z`}
						fill={look.skin}
						{...outlined}
					/>
					<path d="M 150 282 Q 200 306 250 282 Q 228 296 200 297 Q 172 296 150 282 Z" fill={look.skinShade} />
					{look.hairFront}
					<Eyebrows raise={expression.browRaise} inner={expression.browInner} asym={expression.browAsym} />
					<Eyes open={expression.eyeOpen} pupil={expression.pupil} blink={blink} gaze={gaze} />
					<path d="M 196 222 Q 192 238 202 240 Q 210 240 211 234" fill="none" stroke={OUTLINE} strokeWidth={4} strokeLinecap="round" />
					<Mouth
						width={expression.mouthWidth}
						smile={expression.mouthSmile}
						open={expression.mouthOpen}
						smirk={expression.mouthSmirk}
					/>
					{look.faceExtras}
				</g>
				{gi ? (
					<>
						<ArmShape angles={armLeft} c={gi} hold={holdLeft} />
						<g transform="translate(400 0) scale(-1 1)">
							<ArmShape angles={armRight} c={gi} hold={holdRight ? <g transform="scale(-1 1)">{holdRight}</g> : undefined} />
						</g>
					</>
				) : (
					<>
						<Arm angles={armLeft} look={look} hold={holdLeft} />
						<g transform="translate(400 0) scale(-1 1)">
							<Arm angles={armRight} look={look} hold={holdRight ? <g transform="scale(-1 1)">{holdRight}</g> : undefined} />
						</g>
					</>
				)}
			</g>
		</svg>
	);
};
