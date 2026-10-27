import React from 'react';
import {AbsoluteFill} from 'remotion';
import {curve, easeIn, easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {Bill} from '../../../props/Boleto';
import {SuorShape} from '../../../props/Objects';
import {Tatame} from '../../../scenes/backgrounds/Tatame';
import {Camera} from '../../../scenes/camera/Camera';
import {Burst, ComicText, Flash, Lighting, SpeedLines, Stamp} from '../../../scenes/fx/Fx';
import {FONT} from '../../../fonts';
import {blink, breath, feetFor, useT} from '../common';

/**
 * CENA 1 — O verdadeiro adversário (0,00 – 8,60 s)
 * 0,08 "Esse é o Caio."            → apresentação, plaquinha com o nome
 * 1,14 "No jiu-jítsu, ele finaliza gigantes," → guarda, gigante cai (TAP TAP)
 * 3,94 "mas tem um adversário que nunca conseguiu vencer:" → push-in, rosto muda
 * 6,74 pausa                        → suspense
 * 7,58 "o boleto."                  → o vilão cai na tela
 */
export const Cena1: React.FC = () => {
	const t = useT(0);
	const fps = 30;

	// ---------- Plano B: guarda + gigante (1,12 – 3,94) ----------
	if (t >= 1.12 && t < 3.94) {
		const fall = curve(t, [2.85, 3.2], [0, 86], easeIn);
		const enterX = ramp(t, 1.15, 1.75, 900, 0, easeOut);
		const sh = shakes(t, [{at: 3.18, strength: 34}]);
		const celebrate = ramp(t, 3.3, 3.5);
		const arm = mixArm(mixArm(armPoses.solto, armPoses.guarda, ramp(t, 1.12, 1.35)), armPoses.comemorando, celebrate);
		const face = mixFace(caioExpressions.confiante, caioExpressions.feliz, celebrate);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 1.12, 3.9, 1.04, 1.12)} focusX={540} focusY={1100} offsetX={sh.x} offsetY={sh.y}>
					<Tatame />
					{/* gigante em silhueta */}
					<AbsoluteFill style={{translate: `${enterX}px 0px`, rotate: `${fall}deg`, transformOrigin: '800px 1760px', opacity: ramp(t, 3.4, 3.9, 1, 0)}}>
						<AbsoluteFill style={{filter: 'brightness(0.12) saturate(0)'}}>
							<Caio x={800} y={1760} scale={2.4} arms="guarda" stance={0.6} shadow={false} bodyLean={wave(t, 0.8, 2)} />
						</AbsoluteFill>
						{/* olhos brancos do gigante */}
						{[-1, 1].map((s) => (
							<div
								key={s}
								style={{
									position: 'absolute',
									left: 800 + s * 84 - 22,
									top: 1760 - 545 * 2.4 - 15,
									width: 44,
									height: fall > 30 ? 6 : 30,
									borderRadius: 20,
									background: '#fff',
									rotate: `${s * -14}deg`,
								}}
							/>
						))}
					</AbsoluteFill>
					<Caio
						x={330}
						y={1760}
						scale={1.3}
						expression={face}
						arms={arm}
						stance={ramp(t, 1.12, 1.4)}
						bodyLean={-3 + celebrate * 3}
						bodyBob={breath(t) + ramp(t, 1.12, 1.4, 0, 8)}
						headTilt={-4 + celebrate * 6}
						gaze={{x: 0.6, y: -0.4 * (1 - celebrate)}}
						blink={blink(t, 'caio')}
					/>
					<Lighting lightX="30%" lightY="30%" />
				</Camera>
				<ComicText text="FINALIZA!" x={560} y={520} size={130} color="#F7C21B" scale={pop(t, 3.2, fps)} rotate={-8} />
				<ComicText text={'TAP!\nTAP!'} x={860} y={1150} size={92} color="#FFFFFF" scale={pop(t, 3.32, fps)} rotate={10} />
				<Flash amount={flashAt(t, 3.18, 0.5, 0.14)} />
			</AbsoluteFill>
		);
	}

	// ---------- Plano E: o boleto (7,48 – 8,60) ----------
	if (t >= 7.48) {
		const drop = ramp(t, 7.48, 7.68, -900, 0, easeIn);
		const sh = shakes(t, [{at: 7.68, strength: 40, duration: 0.45}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 7.68, 8.6, 1, 1.08)} focusX={540} focusY={760} offsetX={sh.x} offsetY={sh.y}>
					<Burst c1="#B5171E" c2="#D62828" rotation={t * 12} cy={720} />
					<SpeedLines opacity={flashAt(t, 7.68, 0.9, 0.62)} cy={720} />
					<Bill x={540} y={700 + drop} width={560} icon="boleto" mood="bravo" rotate={wave(t, 1.4, 3)} look={-0.3} blink={blink(t, 'boleto')} />
					<Caio
						x={250}
						y={feetFor(1260, 1.15)}
						scale={1.15}
						expression="surpreso"
						arms="susto"
						headTilt={6}
						gaze={{x: 0.6, y: -0.9}}
						shadow={false}
						headOverlay={<SuorShape t={t} />}
					/>
				</Camera>
				<Stamp text="VENCIDO" x={760} y={1030} scale={ramp(t, 8.0, 8.1, 2.2, 1, easeIn) * (t >= 8.0 ? 1 : 0)} rotate={-12} />
				<Flash amount={flashAt(t, 7.68, 0.85, 0.17)} />
			</AbsoluteFill>
		);
	}

	// ---------- Planos A, C e D: Caio no tatame ----------
	const intro = t < 1.12;
	// C: a câmera vai fechando no rosto enquanto ele percebe o adversário
	const worried = ramp(t, 4.5, 5.2);
	const suspense = ramp(t, 6.74, 7.3);
	const face = intro
		? caioExpressions.confiante
		: mixFace(mixFace(caioExpressions.confiante, caioExpressions.preocupado, worried), caioExpressions.surpreso, suspense * 0.6);
	const zoom = intro ? ramp(t, 0, 0.55, 1.22, 1.0, easeOut) : curve(t, [3.94, 6.7, 7.4], [1.0, 1.75, 1.95]);
	const scale = 1.5;
	const feet = 1740;
	const faceY = feet - 545 * scale;
	const sh = shakes(t, [{at: 6.9, strength: 4, duration: 0.6}]);

	return (
		<AbsoluteFill>
			<Camera zoom={zoom} focusX={540} focusY={intro ? 1000 : faceY + 40} offsetX={sh.x} offsetY={sh.y}>
				<Tatame />
				<Caio
					x={540}
					y={feet}
					scale={scale}
					expression={face}
					arms={intro ? 'maosNaCintura' : 'solto'}
					headTilt={intro ? curve(t, [0, 0.4, 0.9], [-6, 4, 0]) : -worried * 5}
					headNod={intro ? 0 : suspense * -6}
					bodyBob={breath(t)}
					gaze={intro ? {x: 0, y: 0} : {x: -0.5 * worried, y: -0.9 * suspense}}
					blink={blink(t, 'caio')}
					headOverlay={!intro && t > 5.4 ? <SuorShape t={t - 5.4} /> : null}
				/>
				<Lighting
					lightX="40%"
					lightY="25%"
					vignette={intro ? 0.3 : 0.3 + worried * 0.35 + suspense * 0.2}
					tint="#2B2F5A"
					tintOpacity={intro ? 0 : worried * 0.35 + suspense * 0.25}
				/>
			</Camera>
			{/* plaquinha de apresentação */}
			{intro ? (
				<>
					<ComicText text="CAIO" x={540} y={470} size={170} color="#F7C21B" scale={pop(t, 0.4, fps)} rotate={-4} />
					<div
						style={{
							position: 'absolute',
							left: 540,
							top: 590,
							translate: '-50% 0',
							scale: String(pop(t, 0.6, fps)),
							background: '#24418F',
							color: '#fff',
							fontFamily: FONT,
							fontSize: 46,
							padding: '12px 30px',
							borderRadius: 16,
							border: '6px solid #1A1410',
						}}
					>
						18 ANOS · FAIXA AZUL
					</div>
				</>
			) : null}
			{/* título do episódio, discreto */}
			{t < 3.0 ? (
				<div
					style={{
						position: 'absolute',
						top: 120,
						width: '100%',
						textAlign: 'center',
						fontFamily: FONT,
						fontSize: 40,
						color: '#fff',
						WebkitTextStroke: '8px #1A1410',
						paintOrder: 'stroke fill',
						opacity: ramp(t, 0.1, 0.4) * ramp(t, 2.6, 3.0, 1, 0),
					}}
				>
					EP. 1 · O MATA-LEÃO E A CONTA DE LUZ
				</div>
			) : null}
		</AbsoluteFill>
	);
};
