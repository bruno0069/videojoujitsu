import React from 'react';
import {AbsoluteFill} from 'remotion';
import {curve, easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, caioExpressions} from '../../../characters/caio';
import {mixFace} from '../../../characters/shared/math';
import {Calculadora, LagrimasShape, Papel, Rabiscos, SuorShape} from '../../../props/Objects';
import {QuartoNoite} from '../../../scenes/backgrounds/Sets';
import {Camera} from '../../../scenes/camera/Camera';
import {ComicText, Flash, Lighting} from '../../../scenes/fx/Fx';
import {blink, feetFor, useT} from '../common';

/**
 * CENA 4 — O cálculo impossível (36,25 – 47,15 s)  · clima de investigação
 * 36,48 "Caio fez as contas."        → Caio na mesa, rabiscos de conta no ar
 * 38,52 "Fez de novo."               → corte mais fechado, suor
 * 39,78 "Conferiu na calculadora."   → close na calculadora, teclas
 * 41,68 "Resultado:"                 → aproximação lenta no visor (suspense)
 * 43,10 "saldo negativo"             → visor vermelho
 * 44,64 "e vontade de chorar em posição fetal." → Caio encolhido no chão, chorando
 */

const keys = '1,250+380−95=';

export const Cena4: React.FC = () => {
	const t = useT(36.25);
	const fps = 30;

	// ---------- F: posição fetal (44,60 – 47,15) ----------
	if (t >= 44.6) {
		const hipX = 560;
		const hipY = 1520;
		const scale = 1.25;
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 44.6, 47.1, 1.12, 1.25)} focusX={540} focusY={1420} rotate={-3}>
					<QuartoNoite lamp={0.6} />
					<AbsoluteFill style={{rotate: `${-90 + wave(t, 0.9, 3)}deg`, transformOrigin: `${hipX}px ${hipY}px`}}>
						<Caio
							x={hipX}
							y={hipY + (745 - 505) * scale}
							scale={scale}
							expression="chorando"
							arms="encolhido"
							bodyLean={32}
							headTilt={14}
							shadow={false}
							blink={0}
							headOverlay={<LagrimasShape t={t} />}
						/>
					</AbsoluteFill>
					<Lighting light="rgba(255,232,163,0.25)" lightX="45%" lightY="70%" vignette={0.55} tint="#1D2A5C" tintOpacity={0.25} />
				</Camera>
				<ComicText text="BUÁÁÁ" x={760} y={1060} size={90} color="#7CC6F2" scale={pop(t, 45.4, fps)} rotate={-10} opacity={ramp(t, 46.6, 47.1, 1, 0)} />
			</AbsoluteFill>
		);
	}

	// ---------- C, D, E: calculadora (39,72 – 44,60) ----------
	if (t >= 39.72) {
		const typing = t < 41.62;
		const n = Math.floor((t - 39.72) / 0.13);
		const display = typing
			? keys.slice(0, Math.min(keys.length, n + 1)).slice(-9)
			: t < 43.05
				? '.'.repeat(1 + (Math.floor(t * 3) % 3))
				: 'NEGATIVO';
		const negative = t >= 43.05;
		const pulse = negative ? Math.max(0, wave(t, 2.5, 1)) : 0;
		const sh = shakes(t, [{at: 43.08, strength: 26, duration: 0.4}]);
		const zoom = typing ? ramp(t, 39.72, 41.6, 1.0, 1.06) : curve(t, [41.62, 43.0, 43.08, 43.3], [1.1, 1.55, 1.55, 1.8], easeOut);
		const tension = typing ? 0 : ramp(t, 41.62, 43.0);
		return (
			<AbsoluteFill>
				<Camera
					zoom={zoom}
					focusX={540}
					focusY={typing ? 820 : 520}
					offsetX={sh.x + (tension > 0 && !negative ? wave(t, 18, 2.5 * tension) : 0)}
					offsetY={sh.y}
				>
					<QuartoNoite lamp={1} />
					<Calculadora
						x={540}
						y={820}
						width={640}
						display={display}
						displayColor={negative ? '#D62828' : '#1E2B1E'}
						pressed={typing ? [8, 9, 4, 14, 12, 1][n % 6] : -1}
						rotate={typing ? wave(t, 0.7, 1.5) : 0}
					/>
					<Lighting light="rgba(255,232,163,0.3)" lightX="30%" lightY="40%" vignette={0.45 + tension * 0.3} />
				</Camera>
				{negative ? <AbsoluteFill style={{backgroundColor: '#D62828', opacity: 0.18 + pulse * 0.18, mixBlendMode: 'multiply'}} /> : null}
				<Flash amount={flashAt(t, 43.06, 0.5, 0.14)} color="#FF4040" />
			</AbsoluteFill>
		);
	}

	// ---------- A e B: fazendo as contas (36,25 – 39,72) ----------
	const again = t >= 38.45;
	const scale = 1.4;
	const faceY = 760;
	return (
		<AbsoluteFill>
			<Camera
				zoom={again ? ramp(t, 38.45, 39.7, 1.45, 1.55) : ramp(t, 36.25, 38.4, 1.0, 1.1)}
				focusX={540}
				focusY={again ? faceY + 60 : 1000}
				offsetY={t < 36.5 ? ramp(t, 36.25, 36.5, 40, 0, easeOut) : 0}
			>
				<QuartoNoite lamp={ramp(t, 36.25, 36.6)} />
				<Caio
					x={540}
					y={feetFor(faceY, scale)}
					scale={scale}
					expression={mixFace(caioExpressions.pensativo, caioExpressions.preocupado, again ? ramp(t, 38.5, 39.0) : 0)}
					arms="encolhido"
					headTilt={again ? -6 : 4 + wave(t, 1.5, 3)}
					bodyBob={wave(t, again ? 4 : 2.2, 3)}
					gaze={{x: wave(t, again ? 1.6 : 0.8, 0.5), y: 0.7}}
					blink={blink(t, 'caio')}
					shadow={false}
					headOverlay={again ? <SuorShape t={(t - 38.45) * 1.4} /> : null}
				/>
				<Papel x={540} y={1395} width={420} title="CONTAS" lines={4} clip={false} rotate={-4} />
			</Camera>
			<Rabiscos t={(t - 36.25) * (again ? 2.4 : 1)} opacity={ramp(t, 36.55, 36.9)} seed={again ? 3 : 0} />
		</AbsoluteFill>
	);
};
