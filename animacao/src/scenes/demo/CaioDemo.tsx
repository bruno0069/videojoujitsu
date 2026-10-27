import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {blinkAt} from '../../animation/blink';
import {blendKeyframes, type Keyframe} from '../../animation/keyframes';
import {Caio, armPoses, caioExpressions} from '../../characters/caio';
import {lerp, mixArm, mixFace} from '../../characters/shared/math';
import {OUTLINE} from '../../characters/shared/style';
import type {ArmAngles, FaceParams, Gaze} from '../../characters/shared/types';
import {Tatame} from '../backgrounds/Tatame';
import {Camera} from '../camera/Camera';

// Demonstração do boneco do Caio: 10 s, 1080×1920, 30 fps.
export const CAIO_DEMO_DURATION = 300;

const CAIO_X = 540;
const CAIO_Y = 1720;
const CAIO_SCALE = 1.6;

const clampOpts = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const smooth = Easing.bezier(0.45, 0, 0.25, 1);

const faceKeys: Keyframe<FaceParams>[] = [
	{frame: 0, value: caioExpressions.confiante},
	{frame: 120, value: caioExpressions.surpreso},
	{frame: 190, value: caioExpressions.preocupado},
	{frame: 250, value: caioExpressions.confiante},
];

const armKeys: Keyframe<ArmAngles>[] = [
	{frame: 0, value: armPoses.solto},
	{frame: 120, value: armPoses.susto},
	{frame: 190, value: armPoses.maosNaCintura},
	{frame: 250, value: armPoses.guarda},
];

const gazeKeys: Keyframe<Gaze>[] = [
	{frame: 0, value: {x: 0, y: 0}},
	{frame: 55, value: {x: 0.7, y: -0.1}},
	{frame: 90, value: {x: -0.7, y: 0}},
	{frame: 118, value: {x: 0, y: 0}},
	{frame: 195, value: {x: -0.6, y: 0.5}},
	{frame: 250, value: {x: 0, y: 0}},
];
const mixGaze = (a: Gaze, b: Gaze, t: number): Gaze => ({x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t)});

const captions: {from: number; text: string}[] = [
	{from: 0, text: 'Confiante · piscar · respiração'},
	{from: 40, text: 'Movimento de cabeça e olhar'},
	{from: 65, text: 'Inclinação do corpo'},
	{from: 120, text: 'Surpreso · câmera aproxima'},
	{from: 190, text: 'Preocupado'},
	{from: 250, text: 'Confiante · guarda e base'},
];

export const CaioDemo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const face = blendKeyframes(frame, faceKeys, 8, mixFace);
	const arm = blendKeyframes(frame, armKeys, 10, mixArm);
	const gaze = blendKeyframes(frame, gazeKeys, 10, mixGaze);
	const breath = Math.sin((frame / fps) * Math.PI * 2 * 0.45);

	const caption = [...captions].reverse().find((c) => frame >= c.from)!;

	return (
		<AbsoluteFill style={{backgroundColor: '#E7ECF0'}}>
			<Camera
				zoom={interpolate(frame, [0, 130, 168, 235, 265], [1, 1, 1.6, 1.6, 1.1], {...clampOpts, easing: smooth})}
				focusX={540}
				focusY={interpolate(frame, [235, 265], [850, 1700], {...clampOpts, easing: smooth})}
			>
				<Tatame />
				<Caio
					x={CAIO_X}
					y={CAIO_Y}
					scale={CAIO_SCALE}
					expression={face}
					arms={arm}
					gaze={gaze}
					blink={blinkAt(frame, fps, 'caio')}
					headTilt={interpolate(
						frame,
						[0, 40, 55, 75, 95, 115, 190, 205, 250, 262],
						[0, 0, -9, 7, -5, 0, 0, 8, 8, 0],
						{...clampOpts, easing: smooth},
					)}
					headNod={interpolate(frame, [0, 120, 126, 138, 190, 205, 250, 262], [0, 0, -12, -5, -5, 6, 6, 0], clampOpts)}
					bodyLean={interpolate(
						frame,
						[0, 65, 85, 105, 120, 190, 205, 250, 262],
						[0, 0, 5, -4, 0, 0, 3, 3, -2],
						{...clampOpts, easing: smooth},
					)}
					bodyBob={breath * 3 + interpolate(frame, [250, 262], [0, 8], clampOpts)}
					stance={interpolate(frame, [250, 262], [0, 1], {...clampOpts, easing: smooth})}
					beltSway={breath * 2 + interpolate(frame, [65, 85, 105, 120], [0, -4, 3, 0], clampOpts)}
				/>
			</Camera>

			{/* título */}
			<div
				style={{
					position: 'absolute',
					top: 80,
					width: '100%',
					textAlign: 'center',
					fontFamily: 'Arial Black, Arial, sans-serif',
					fontWeight: 900,
					fontSize: 64,
					color: '#fff',
					WebkitTextStroke: `10px ${OUTLINE}`,
					paintOrder: 'stroke fill',
				}}
			>
				Vida de Atleta… <span style={{color: '#F7C21B'}}>Ou Não</span>
			</div>

			{/* legenda do que está sendo demonstrado */}
			<div
				style={{
					position: 'absolute',
					bottom: 90,
					left: 60,
					right: 60,
					display: 'flex',
					justifyContent: 'center',
				}}
			>
				<div
					style={{
						background: OUTLINE,
						color: '#fff',
						fontFamily: 'Arial, sans-serif',
						fontWeight: 700,
						fontSize: 44,
						padding: '22px 40px',
						borderRadius: 999,
						opacity: interpolate(frame, [caption.from, caption.from + 6], [0, 1], clampOpts),
						translate: `0 ${interpolate(frame, [caption.from, caption.from + 6], [20, 0], clampOpts)}px`,
					}}
				>
					{caption.text}
				</div>
			</div>
		</AbsoluteFill>
	);
};
