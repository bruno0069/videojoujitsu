import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {MestreJorge, SeuAldo} from '../../../characters/supporting/characters';
import {Cinturao, Moeda, PaoFrances, Papel, Salario} from '../../../props/Objects';
import {Padaria} from '../../../scenes/backgrounds/Sets';
import {Tatame} from '../../../scenes/backgrounds/Tatame';
import {Camera} from '../../../scenes/camera/Camera';
import {Burst, ComicText, Flash, Lighting} from '../../../scenes/fx/Fx';
import {blink, breath, feetFor, useT} from '../common';

/**
 * CENA 5 — Dois convites, um problema (47,15 – 61,80 s)
 * 47,40 "Aí aparecem duas oportunidades."         → duas luzes surgem ao redor do Caio
 * 49,72 "O mestre oferece uma vaga no campeonato." → Mestre Jorge com o panfleto
 * 52,06 "O padeiro oferece um emprego."           → Seu Aldo com a placa "PRECISA-SE"
 * 53,82 "Um promete um cinturão," / 55,12 "o outro promete salário." → tela dividida
 * 56,64 "Pela primeira vez, Caio considera seriamente" → close, Caio pensativo
 * 59,98 "lutar contra um pão francês."            → Caio VS pão francês
 */

const Sparkle: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) =>
	s <= 0 ? null : (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: 380,
				height: 380,
				translate: '-50% -50%',
				scale: String(s * (1 + wave(t, 1.5, 0.04))),
				borderRadius: '50%',
				background: 'radial-gradient(circle, rgba(255,250,210,1) 0%, rgba(255,226,120,0.85) 45%, rgba(255,200,60,0) 70%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<ComicText text="?" x={190} y={190} size={170} color="#FFFFFF" />
		</div>
	);

export const Cena5: React.FC = () => {
	const t = useT(47.15);
	const fps = 30;

	// ---------- F: Caio VS pão francês (59,95 – 61,80) ----------
	if (t >= 59.95) {
		const sh = shakes(t, [{at: 60.0, strength: 30}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 59.95, 61.8, 1.0, 1.1)} focusX={540} focusY={1000} offsetX={sh.x} offsetY={sh.y}>
					<Burst c1="#D9822B" c2="#F2A541" rotation={t * 14} cy={1000} />
					<Caio x={ramp(t, 59.95, 60.15, -150, 300, easeOut)} y={1830} scale={1.3} arms="guarda" stance={1} expression="confiante" bodyBob={breath(t) + 8} bodyLean={-4} gaze={{x: 0.7, y: 0.3}} blink={blink(t, 'caio')} />
					<PaoFrances
						x={ramp(t, 59.95, 60.15, 1300, 780, easeOut)}
						y={1230 + Math.abs(wave(t, 2.2, 28))}
						width={540}
						rotate={wave(t, 2.2, 5)}
						mood="bravo"
						blink={blink(t, 'pao')}
					/>
				</Camera>
				<ComicText text="VS" x={540} y={760} size={240} color="#F7C21B" scale={pop(t, 60.0, fps, 9)} rotate={-8} />
				<ComicText text="PÃO FRANCÊS" x={780} y={960} size={64} color="#FFFFFF" scale={pop(t, 60.8, fps)} rotate={4} />
				<Flash amount={flashAt(t, 60.0, 0.6, 0.15)} />
			</AbsoluteFill>
		);
	}

	// ---------- E: Caio pensa seriamente (56,55 – 59,95) ----------
	if (t >= 56.55) {
		const serious = ramp(t, 58.9, 59.3);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 56.55, 59.9, 1.0, 1.28)} focusX={540} focusY={800}>
					<AbsoluteFill style={{filter: 'brightness(0.75) saturate(0.8)'}}>
						<Tatame />
					</AbsoluteFill>
					<Caio
						x={540}
						y={feetFor(820, 1.9)}
						scale={1.9}
						expression={mixFace(caioExpressions.pensativo, {...caioExpressions.pensativo, eyeOpen: 0.45, browAsym: 16, browInner: -18}, serious)}
						arms={{left: 'solto', right: {shoulder: 20, elbow: -160}}}
						headTilt={-6 + wave(t, 0.4, 2)}
						gaze={{x: 0.7, y: -0.3}}
						blink={blink(t, 'caio')}
						shadow={false}
					/>
					<Lighting light="rgba(170,140,255,0.35)" lightX="80%" lightY="30%" vignette={0.6} />
				</Camera>
				<ComicText text="HUMM…" x={800} y={560} size={84} color="#FFFFFF" scale={pop(t, 57.1, fps)} rotate={8} />
			</AbsoluteFill>
		);
	}

	// ---------- D: tela dividida — cinturão x salário (53,75 – 56,55) ----------
	if (t >= 53.75) {
		const slide = ramp(t, 53.75, 54.0, 1, 0, easeOut);
		return (
			<AbsoluteFill style={{backgroundColor: '#1A1410'}}>
				<AbsoluteFill style={{clipPath: 'inset(0 0 50.5% 0)', translate: `${-slide * 1080}px 0`}}>
					<AbsoluteFill style={{translate: '0 -380px'}}>
						<Tatame />
					</AbsoluteFill>
					<MestreJorge x={290} y={feetFor(430, 1.0)} scale={1.0} expression={caioExpressions.confiante} armRight={{shoulder: 70, elbow: -30}} gaze={{x: 0.6, y: 0}} blink={blink(t, 'jorge')} bodyBob={breath(t)} />
					<Cinturao x={760} y={500} width={460} scale={pop(t, 53.9, fps)} shine={Math.max(0, wave(t, 1.2, 1))} rotate={wave(t, 0.6, 4)} />
					<Lighting vignette={0.3} />
				</AbsoluteFill>
				<AbsoluteFill style={{clipPath: 'inset(50.5% 0 0 0)', translate: `${slide * 1080}px 0`}}>
					<AbsoluteFill style={{translate: '0 300px'}}>
						<Padaria />
					</AbsoluteFill>
					<SeuAldo x={790} y={feetFor(1390, 1.0)} scale={1.0} expression={caioExpressions.feliz} armLeft={{shoulder: 70, elbow: -30}} gaze={{x: -0.6, y: 0}} blink={blink(t, 'aldo')} bodyBob={breath(t)} />
					<Salario x={300} y={1450} width={380} scale={pop(t, 55.15, fps)} rotate={-6} />
					{[0, 1, 2, 3].map((i) =>
						t > 55.3 + i * 0.12 ? (
							<Moeda key={i} x={160 + i * 110} y={ramp(t, 55.3 + i * 0.12, 55.8 + i * 0.12, 1000, 1700, easeOut)} width={80} rotate={t * 300 + i * 40} />
						) : null,
					)}
					<Lighting vignette={0.3} />
				</AbsoluteFill>
			</AbsoluteFill>
		);
	}

	// ---------- C: o padeiro (52,00 – 53,75) ----------
	if (t >= 52.0) {
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 52.0, 53.75, 1.0, 1.08)} focusX={540} focusY={850} offsetX={ramp(t, 52.0, 52.18, -420, 0, easeOut)}>
					<Padaria />
					<SeuAldo
						x={650}
						y={feetFor(760, 1.5)}
						scale={1.5}
						expression={caioExpressions.feliz}
						armLeft={mixArm(armPoses.solto, {shoulder: 75, elbow: -35}, ramp(t, 52.2, 52.5))}
						gaze={{x: -0.5, y: 0}}
						headTilt={wave(t, 0.8, 4)}
						bodyBob={breath(t)}
						blink={blink(t, 'aldo')}
					/>
					<Papel x={250} y={820} width={330} title="PRECISA-SE" subtitle="AJUDANTE" lines={3} clip={false} scale={pop(t, 52.3, fps)} rotate={-6} />
					<Lighting light="rgba(255,236,190,0.3)" vignette={0.3} />
				</Camera>
			</AbsoluteFill>
		);
	}

	// ---------- B: o mestre (49,65 – 52,00) ----------
	if (t >= 49.65) {
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 49.65, 52.0, 1.0, 1.08)} focusX={540} focusY={850} offsetX={ramp(t, 49.65, 49.83, 420, 0, easeOut)}>
					<Tatame />
					<MestreJorge
						x={430}
						y={feetFor(760, 1.5)}
						scale={1.5}
						expression={caioExpressions.confiante}
						armRight={mixArm(armPoses.solto, {shoulder: 75, elbow: -35}, ramp(t, 49.8, 50.1))}
						gaze={{x: 0.5, y: 0}}
						headTilt={wave(t, 0.6, 3)}
						bodyBob={breath(t)}
						blink={blink(t, 'jorge')}
					/>
					<Papel x={830} y={820} width={330} title="CAMPEONATO" subtitle="VAGA ABERTA" lines={3} clip={false} scale={pop(t, 50.0, fps)} rotate={6} />
					<Lighting vignette={0.3} />
				</Camera>
			</AbsoluteFill>
		);
	}

	// ---------- A: duas oportunidades (47,15 – 49,65) ----------
	const hope = ramp(t, 47.6, 48.0);
	return (
		<AbsoluteFill>
			<Camera zoom={ramp(t, 47.15, 49.6, 1.08, 1.0, easeOut)} focusX={540} focusY={900}>
				<Burst c1="#F2C14E" c2="#F7D57A" rotation={t * 8} cy={1000} />
				<Caio
					x={540}
					y={feetFor(1000, 1.3)}
					scale={1.3}
					expression={mixFace(caioExpressions.chorando, caioExpressions.surpreso, hope)}
					arms={mixArm(armPoses.encolhido, armPoses.susto, hope)}
					headNod={-hope * 6}
					gaze={{x: wave(t, 0.8, 0.8), y: -0.7}}
					bodyBob={breath(t)}
					blink={blink(t, 'caio')}
				/>
				<Sparkle x={250} y={520} s={pop(t, 48.2, fps)} t={t} />
				<Sparkle x={830} y={520} s={pop(t, 48.4, fps)} t={t} />
				<Lighting light="rgba(255,255,230,0.4)" vignette={0.25} />
			</Camera>
			<ComicText text="2 OPORTUNIDADES!" x={540} y={260} size={86} color="#FFFFFF" scale={pop(t, 48.25, fps)} rotate={-4} />
		</AbsoluteFill>
	);
};
