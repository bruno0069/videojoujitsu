import React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {OUTLINE} from '../../../characters/shared/style';
import {Marlene} from '../../../characters/supporting/characters';
import {FONT} from '../../../fonts';
import {Bill} from '../../../props/Boleto';
import {BracosMataLeao, Cinturao, Salario} from '../../../props/Objects';
import {Auditorio} from '../../../scenes/backgrounds/Sets';
import {Camera} from '../../../scenes/camera/Camera';
import {Burst, ComicText, Flash, Lighting} from '../../../scenes/fx/Fx';
import {blink, breath, feetFor, useT} from '../common';

/**
 * CENA 7 — Você decide! (74,60 – fim)
 * 74,82 "Agora é com você!"                      → Caio aponta para o público
 * 76,88 "A, Caio aposta no campeonato e corre atrás do sonho." → cartão A
 * 81,22 "B, aceita o emprego e ajuda a mãe."     → cartão B
 * 84,32 "E aí, campeão,"                         → close, sobrancelha levantada
 * 85,82 "você lutaria pelo sonho"                → cinturão brilhando
 * 87,62 "ou daria um mata-leão nos boletos?"     → mata-leão no boleto — desta vez ele bate!
 * 89,74 "Comenta A ou B!"                        → cartela final
 */

const Card: React.FC<{
	letter: 'A' | 'B';
	x: number;
	enter: number;
	active: number;
	color: string;
	lines: [string, string];
	children: React.ReactNode;
}> = ({letter, x, enter, active, color, lines, children}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: 760,
			width: 470,
			height: 640,
			translate: `-50% -50%`,
			scale: String((0.92 + active * 0.1) * Math.min(1, enter)),
			rotate: `${(letter === 'A' ? -4 : 4) * (1 - active * 0.5)}deg`,
			opacity: 0.55 + active * 0.45,
			background: color,
			border: `10px solid ${OUTLINE}`,
			borderRadius: 40,
			boxShadow: '0 18px 0 rgba(0,0,0,0.35)',
			overflow: 'hidden',
		}}
	>
		<div style={{position: 'absolute', left: 24, top: 6, fontFamily: FONT, fontSize: 170, color: '#fff', WebkitTextStroke: `14px ${OUTLINE}`, paintOrder: 'stroke fill', lineHeight: 1}}>
			{letter}
		</div>
		{children}
		<div style={{position: 'absolute', bottom: 22, width: '100%', textAlign: 'center', fontFamily: FONT, color: '#fff', WebkitTextStroke: `9px ${OUTLINE}`, paintOrder: 'stroke fill', lineHeight: 1.05}}>
			<div style={{fontSize: 52}}>{lines[0]}</div>
			<div style={{fontSize: 40}}>{lines[1]}</div>
		</div>
	</div>
);

export const Cena7: React.FC = () => {
	const t = useT(74.6);
	const fps = 30;

	// ---------- F: cartela final (89,70 – fim) ----------
	if (t >= 89.7) {
		const which = Math.floor((t - 89.7) * 2.5) % 2;
		return (
			<AbsoluteFill>
				<Auditorio t={t} />
				<Lighting vignette={0.35} />
				<div
					style={{
						position: 'absolute',
						top: 170,
						width: '100%',
						textAlign: 'center',
						fontFamily: FONT,
						fontSize: 78,
						color: '#fff',
						WebkitTextStroke: `12px ${OUTLINE}`,
						paintOrder: 'stroke fill',
						scale: String(pop(t, 89.75, fps)),
					}}
				>
					Vida de Atleta… <span style={{color: '#F7C21B'}}>Ou Não</span>
				</div>
				<ComicText text={'COMENTA\nA OU B!'} x={540} y={520} size={130} color="#FFFFFF" scale={pop(t, 89.8, fps)} rotate={-3} />
				{(['A', 'B'] as const).map((l, i) => (
					<div
						key={l}
						style={{
							position: 'absolute',
							left: 330 + i * 420,
							top: 870,
							width: 250,
							height: 250,
							translate: '-50% -50%',
							scale: String(pop(t, 90.0 + i * 0.15, fps) * (which === i ? 1.12 : 0.95)),
							borderRadius: '50%',
							background: i === 0 ? '#2F63B5' : '#F2A541',
							border: `12px solid ${OUTLINE}`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							fontFamily: FONT,
							fontSize: 150,
							color: '#fff',
							WebkitTextStroke: `12px ${OUTLINE}`,
							paintOrder: 'stroke fill',
							boxShadow: which === i ? '0 0 60px 20px rgba(247,194,27,0.6)' : '0 12px 0 rgba(0,0,0,0.4)',
						}}
					>
						{l}
					</div>
				))}
				<Caio x={540} y={feetFor(1230, 0.95)} scale={0.95} expression="feliz" arms={{left: 'comemorando', right: 'apontando'}} headTilt={wave(t, 1, 5)} bodyBob={breath(t)} blink={blink(t, 'caio')} shadow={false} />
			</AbsoluteFill>
		);
	}

	// ---------- E: mata-leão nos boletos — agora funciona (87,55 – 89,70) ----------
	if (t >= 87.55) {
		const tapped = t >= 88.85;
		const squeeze = tapped ? 0 : Math.max(0, wave(t, 3.5, 1));
		const sh = shakes(t, [{at: 88.88, strength: 30}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 87.55, 89.7, 1.0, 1.1)} focusX={540} focusY={900} offsetX={sh.x + squeeze * 4} offsetY={sh.y}>
					<Burst c1="#B5171E" c2="#D62828" rotation={t * 14} cy={900} />
					<Caio x={540} y={feetFor(520, 1.25)} scale={1.25} expression={tapped ? 'feliz' : 'esforco'} arms="solto" headTilt={-8 + squeeze * 3} shadow={false} blink={0} />
					<Bill icon="boleto" mood={tapped ? 'derrotado' : 'bravo'} x={540} y={1000 + squeeze * 5} width={520} rotate={tapped ? 8 : -2} look={0.4} blink={blink(t, 'boleto')} />
					<BracosMataLeao squeeze={squeeze} />
				</Camera>
				<ComicText text={'TAP!\nTAP!'} x={850} y={1150} size={110} color="#FFFFFF" scale={tapped ? pop(t, 88.88, fps) : 0} rotate={10} />
				<ComicText text="FINALIZOU!" x={540} y={190} size={110} color="#F7C21B" scale={tapped ? pop(t, 89.0, fps) : 0} rotate={-5} />
				<Flash amount={flashAt(t, 88.86, 0.6, 0.14)} />
			</AbsoluteFill>
		);
	}

	// ---------- C e D: "E aí, campeão, você lutaria pelo sonho" (84,25 – 87,55) ----------
	if (t >= 84.25) {
		const dream = t >= 85.75;
		return (
			<AbsoluteFill>
				<Camera zoom={dream ? ramp(t, 85.75, 87.5, 1.0, 1.08) : ramp(t, 84.25, 84.45, 1.25, 1.4, easeOut)} focusX={540} focusY={dream ? 900 : 820}>
					<Auditorio t={t} />
					{dream ? (
						<>
							<AbsoluteFill style={{background: 'radial-gradient(circle at 50% 30%, rgba(255,236,150,0.75), rgba(255,236,150,0) 45%)'}} />
							<Cinturao x={540} y={560} width={620} scale={pop(t, 85.8, fps)} shine={Math.max(0, wave(t, 1.4, 1))} rotate={wave(t, 0.6, 3)} />
							<Caio x={540} y={feetFor(1180, 1.15)} scale={1.15} expression="feliz" arms="comemorando" gaze={{x: 0, y: -0.9}} bodyBob={breath(t)} blink={blink(t, 'caio')} shadow={false} />
						</>
					) : (
						<Caio
							x={540}
							y={feetFor(820, 1.8)}
							scale={1.8}
							expression={{...caioExpressions.confiante, browAsym: 16, mouthSmirk: 0.8}}
							arms={{left: 'maosNaCintura', right: 'apontando'}}
							headTilt={ramp(t, 84.3, 84.7, 0, 9)}
							bodyBob={breath(t)}
							blink={blink(t, 'caio')}
							shadow={false}
						/>
					)}
					<Lighting vignette={0.4} />
				</Camera>
				{dream ? <ComicText text="SONHO" x={540} y={250} size={110} color="#F7C21B" scale={pop(t, 86.84, fps)} rotate={-4} /> : null}
			</AbsoluteFill>
		);
	}

	// ---------- A e B: "Agora é com você" + cartões (74,60 – 84,25) ----------
	const cards = t >= 76.8;
	const aIn = pop(t, 76.88, fps, 13);
	const bIn = pop(t, 81.22, fps, 13);
	const aActive = t < 81.2 ? 1 : ramp(t, 81.2, 81.5, 1, 0);
	const bActive = t >= 81.2 ? 1 : 0;
	const caioScale = cards ? 0.95 : 1.5;
	const caioFace = cards ? 1240 : 860;
	const punch = ramp(t, 75.5, 75.65, 0, 1, easeOut) * ramp(t, 76.4, 76.8, 1, 0);

	return (
		<AbsoluteFill>
			<Camera zoom={1 + punch * 0.22} focusX={540} focusY={860} offsetY={t < 74.85 ? ramp(t, 74.6, 74.85, -60, 0, easeOut) : 0}>
				<Auditorio t={t} />
				<Caio
					x={540}
					y={feetFor(caioFace, caioScale)}
					scale={caioScale}
					expression={cards ? (bActive ? caioExpressions.preocupado : caioExpressions.feliz) : mixFace(caioExpressions.confiante, caioExpressions.feliz, punch)}
					arms={cards ? {left: 'solto', right: 'solto'} : {left: 'maosNaCintura', right: mixArm(armPoses.solto, armPoses.apontando, ramp(t, 74.8, 75.1))}}
					headTilt={wave(t, 0.7, 4)}
					gaze={cards ? {x: bActive ? 0.8 : -0.8, y: -0.6} : {x: 0, y: 0}}
					bodyBob={breath(t)}
					blink={blink(t, 'caio')}
					shadow={false}
				/>
				<Lighting vignette={0.3} />
			</Camera>
			{!cards ? <ComicText text="VOCÊ DECIDE!" x={540} y={300} size={120} color="#F7C21B" scale={pop(t, 74.85, fps)} rotate={-5} /> : null}
			{cards ? (
				<>
					<Card letter="A" x={ramp(t, 76.88, 77.1, -300, 280, easeOut)} enter={aIn} active={aActive} color="#2F63B5" lines={['CAMPEONATO', 'CORRE ATRÁS DO SONHO']}>
						<Cinturao x={235} y={330} width={330} shine={Math.max(0, wave(t, 1.3, 1))} />
					</Card>
					{t >= 81.1 ? (
						<Card letter="B" x={ramp(t, 81.22, 81.44, 1380, 800, easeOut)} enter={bIn} active={bActive} color="#F2A541" lines={['EMPREGO', 'AJUDA A MÃE']}>
							<Marlene x={300} y={feetFor(280, 0.55)} scale={0.55} expression={caioExpressions.feliz} blink={blink(t, 'marlene')} />
							<Salario x={140} y={400} width={190} rotate={-8} />
						</Card>
					) : null}
				</>
			) : null}
		</AbsoluteFill>
	);
};
