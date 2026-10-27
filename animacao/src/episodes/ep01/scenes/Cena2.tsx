import React from 'react';
import {AbsoluteFill} from 'remotion';
import {curve, easeIn, easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {CapeloShape, Energetico, MedalhaShape, Papel, PatchShape} from '../../../props/Objects';
import {PalcoSonho} from '../../../scenes/backgrounds/Sets';
import {Tatame} from '../../../scenes/backgrounds/Tatame';
import {Camera} from '../../../scenes/camera/Camera';
import {ComicText, Flash, Iris, Lighting} from '../../../scenes/fx/Fx';
import {FONT} from '../../../fonts';
import {blink, breath, useT} from '../common';

/**
 * CENA 2 — O sonho do garoto (8,60 – 23,05 s)
 *  8,78 "Recém-formado,"                         → capelo cai na cabeça
 * 10,08 "o garoto já se imaginava campeão,"     → íris para o sonho, pódio; medalha em "campeão" (11,48)
 * 12,28 "famoso"                                → flashes de câmera
 * 13,60 "e cheio de patrocinadores."            → patches brotando no kimono
 * 14,92 "Na cabeça dele, até o energético seria patrocinador." → lata de energético com contrato
 * 18,82 "O planejamento financeiro?"            → arranhão de disco, sonho perde a cor, prancheta empoeirada
 * 20,90 "Esse ficou pra próxima temporada."     → prancheta é chutada, cartela "PRÓXIMA TEMPORADA"
 */

const patches = [
	{x: 160, y: 380, text: 'BRABO', color: '#D62828', at: 13.6, rot: -10},
	{x: 245, y: 372, text: 'TATAMI', color: '#2BA84A', at: 13.78, rot: 8},
	{x: 150, y: 500, text: 'FOCO', color: '#7A3FA0', at: 13.95, rot: 6},
	{x: 252, y: 505, text: 'MEGA', color: '#F28C28', at: 14.1, rot: -8},
	{x: 200, y: 330, text: 'TOP', color: '#2A8BD8', at: 14.25, rot: 0},
];

export const Cena2: React.FC = () => {
	const t = useT(8.6);
	const fps = 30;

	// ---------- Plano A: recém-formado (8,60 – 10,05) ----------
	const formado = (
		<AbsoluteFill>
			<Camera zoom={ramp(t, 8.6, 10.0, 1.15, 1.3)} focusX={540} focusY={880}>
				<Tatame />
				<Caio
					x={540}
					y={1740}
					scale={1.5}
					expression={mixFace(caioExpressions.confiante, caioExpressions.feliz, ramp(t, 9.05, 9.3))}
					arms={mixArm(armPoses.solto, armPoses.comemorando, ramp(t, 9.1, 9.4))}
					bodyBob={breath(t)}
					headTilt={wave(t, 0.6, 3)}
					blink={blink(t, 'caio')}
					headOverlay={<CapeloShape transform={`translate(50 ${ramp(t, 8.62, 8.95, -420, 0, easeIn) + 18}) scale(1)`} />}
				/>
				<Lighting />
			</Camera>
			<ComicText text="FORMADO!" x={540} y={420} size={140} scale={pop(t, 9.05, fps)} rotate={-6} />
		</AbsoluteFill>
	);

	if (t < 10.0) return formado;

	// ---------- Planos B e C: o sonho (10,00 – 18,80) ----------
	const dream = t < 18.8;
	if (t < 20.9) {
		const desat = ramp(t, 18.78, 18.95);
		const medal = t >= 11.4;
		const flashes = [12.3, 12.55, 12.82].reduce((a, at) => Math.max(a, flashAt(t, at, 0.7, 0.12)), 0);
		const close = t >= 14.9 && dream;
		const zoom = close ? ramp(t, 14.9, 18.3, 1.55, 1.75) : t >= 18.8 ? ramp(t, 18.8, 19.0, 1.1, 1.0) : curve(t, [10, 10.6, 13.5, 14.3], [1.05, 1.0, 1.0, 1.25]);
		const focusY = close ? 860 : t >= 13.5 && dream ? 1080 : 1000;
		const arm = close
			? mixArm(armPoses.maosNaCintura, armPoses.comemorando, ramp(t, 17.6, 17.9))
			: t >= 18.8
				? mixArm(armPoses.comemorando, armPoses.solto, ramp(t, 18.8, 19.1))
				: t < 12.2
					? armPoses.comemorando
					: mixArm(armPoses.apontando, armPoses.maosNaCintura, ramp(t, 13.4, 13.7));
		const face = t >= 18.8 ? mixFace(caioExpressions.feliz, caioExpressions.surpreso, ramp(t, 18.85, 19.05)) : close ? mixFace(caioExpressions.confiante, caioExpressions.feliz, ramp(t, 17.6, 17.9)) : caioExpressions.feliz;
		const sh = shakes(t, [{at: 18.8, strength: 14, duration: 0.25}]);
		return (
			<AbsoluteFill>
				{/* plano A continua por baixo enquanto a íris abre o sonho */}
				{t < 10.45 ? formado : null}
				<Iris progress={ramp(t, 10.0, 10.45, 0, 1, easeIn)} x={540} y={760}>
					<AbsoluteFill style={{filter: `saturate(${1 - desat * 0.85}) brightness(${1 - desat * 0.2})`}}>
						<Camera zoom={zoom} focusX={540} focusY={focusY} offsetX={sh.x} offsetY={sh.y}>
							<PalcoSonho t={dream ? t : 18.8} />
							<Caio
								x={540}
								y={1530}
								scale={1.25}
								expression={face}
								arms={arm}
								headTilt={dream ? wave(t, 0.7, 4) : 0}
								bodyBob={breath(t)}
								blink={blink(t, 'caio')}
								gaze={close && t > 16.4 ? {x: 0.8, y: 0} : t >= 18.9 ? {x: 0.3, y: 0.6} : {x: 0, y: 0}}
								headOverlay={<CapeloShape transform="translate(50 18)" />}
								bodyOverlay={
									<>
										{medal ? <g transform={`translate(0 ${ramp(t, 11.4, 11.6, -300, 0, easeIn)})`}><MedalhaShape swing={wave(t, 1.2, 6)} /></g> : null}
										{patches.map((p) => (
											<PatchShape key={p.text} x={p.x} y={p.y} text={p.text} color={p.color} s={pop(t, p.at, fps)} rot={p.rot} />
										))}
									</>
								}
							/>
							{/* lata de energético patrocinadora */}
							<Energetico
								x={ramp(t, 16.4, 16.75, 1250, 840, easeOut)}
								y={760 + wave(t, 1.5, 12)}
								width={170}
								rotate={wave(t, 1, 8)}
								opacity={close ? 1 : t >= 18.8 ? 1 : 0}
							/>
							<Papel x={830} y={1010} width={150} title="CONTRATO" lines={3} clip={false} check={ramp(t, 17.7, 18.1)} scale={pop(t, 17.55, fps)} rotate={8} />
							<Lighting light="rgba(255,236,170,0.3)" vignette={0.45} />
						</Camera>
						{t >= 11.45 && t < 12.3 ? <ComicText text="CAMPEÃO!" x={540} y={330} size={140} scale={pop(t, 11.45, fps)} rotate={-5} /> : null}
						{t >= 12.25 && t < 13.55 ? <ComicText text="FAMOSO!" x={540} y={330} size={140} color="#FFFFFF" scale={pop(t, 12.28, fps)} rotate={5} /> : null}
						{t >= 13.55 && t < 14.9 ? <ComicText text="PATROCINADO!" x={540} y={330} size={104} color="#33D17A" scale={pop(t, 13.6, fps)} rotate={-4} /> : null}
						<Flash amount={flashes} />
					</AbsoluteFill>
				</Iris>
				{/* planejamento financeiro empoeirado */}
				{t >= 18.95 ? (
					<>
						<Papel
							x={540}
							y={ramp(t, 18.95, 19.25, -400, 700, easeOut)}
							width={460}
							title="PLANEJAMENTO"
							subtitle="FINANCEIRO"
							cobweb
							rotate={-6 + wave(t, 0.8, 3)}
							scale={ramp(t, 19.6, 20.1, 1, 1.15)}
						/>
						<ComicText text="?" x={810} y={480} size={150} color="#FFFFFF" scale={pop(t, 19.7, fps)} rotate={14} />
						<ComicText text="?" x={260} y={520} size={110} color="#FFFFFF" scale={pop(t, 19.85, fps)} rotate={-14} />
					</>
				) : null}
			</AbsoluteFill>
		);
	}

	// ---------- Plano E: "ficou pra próxima temporada" (20,90 – 23,05) ----------
	const kick = ramp(t, 20.9, 21.25, 0, 1, easeIn);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{filter: 'saturate(0.5)'}}>
				<Camera zoom={ramp(t, 20.9, 23, 1.0, 1.1)} focusX={540} focusY={900}>
					<PalcoSonho t={18.8} />
					<Caio
						x={540}
						y={1530}
						scale={1.25}
						expression={mixFace(caioExpressions.surpreso, caioExpressions.confiante, ramp(t, 21.0, 21.3))}
						arms={mixArm(armPoses.solto, armPoses.susto, ramp(t, 21.0, 21.3))}
						headTilt={ramp(t, 21.0, 21.4, 0, 8)}
						bodyBob={breath(t)}
						blink={blink(t, 'caio')}
						headOverlay={<CapeloShape transform="translate(50 18)" />}
					/>
					<Lighting vignette={0.5} />
				</Camera>
			</AbsoluteFill>
			<Papel x={540 + kick * 900} y={700 - kick * 500} width={460} title="PLANEJAMENTO" subtitle="FINANCEIRO" cobweb rotate={-6 + kick * 260} opacity={1 - kick} />
			{t >= 21.7 ? (
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 470,
						translate: '-50% -50%',
						scale: String(pop(t, 21.75, fps)),
						rotate: '-4deg',
						background: '#1A1410',
						padding: '26px 44px',
						borderRadius: 26,
						textAlign: 'center',
						border: '8px solid #F7C21B',
					}}
				>
					<div style={{fontFamily: FONT, fontSize: 44, color: '#F7C21B'}}>EM BREVE…</div>
					<div style={{fontFamily: FONT, fontSize: 76, color: '#FFFFFF', lineHeight: 1.05}}>PRÓXIMA{'\n'}</div>
					<div style={{fontFamily: FONT, fontSize: 76, color: '#FFFFFF', lineHeight: 1.05}}>TEMPORADA</div>
				</div>
			) : null}
		</AbsoluteFill>
	);
};
