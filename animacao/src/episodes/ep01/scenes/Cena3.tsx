import React from 'react';
import {AbsoluteFill} from 'remotion';
import {curve, easeIn, easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {Marlene} from '../../../characters/supporting/characters';
import {Bill, type BillIcon} from '../../../props/Boleto';
import {BracosMataLeao, Relogio, VassouraShape} from '../../../props/Objects';
import {Cozinha} from '../../../scenes/backgrounds/Sets';
import {Camera} from '../../../scenes/camera/Camera';
import {Burst, ComicText, Flash, Lighting, Stamp} from '../../../scenes/fx/Fx';
import {blink, breath, feetFor, useT} from '../common';

/**
 * CENA 3 — A realidade bate à porta (23,05 – 36,25 s)
 * 23,36 "Só que Dona Marlene trabalha o dia inteiro pra sustentar a casa"
 *        → Marlene varrendo a casa; relógio gira e o céu vai do dia à noite
 * 27,10 "e agora precisa de ajuda."  → ela senta cansada; Caio entra preocupado
 * 29,02 "Na mesa: luz, água e internet." → as três contas batem na mesa (29,92 / 30,90 / 31,60)
 * 32,70 "Três adversários."           → tela de luta: Caio VS as três contas
 * 34,28 "Nenhum aceita um mata-leão." → Caio tenta o mata-leão, a conta nem liga
 */

const bills: {icon: BillIcon; x: number; at: number; rot: number}[] = [
	{icon: 'luz', x: 230, at: 29.84, rot: -7},
	{icon: 'agua', x: 540, at: 30.82, rot: 4},
	{icon: 'internet', x: 850, at: 31.5, rot: 8},
];

export const Cena3: React.FC = () => {
	const t = useT(23.05);
	const fps = 30;

	// ---------- D: VS (32,65 – 34,25) ----------
	if (t >= 32.65 && t < 34.25) {
		const sh = shakes(t, [{at: 32.72, strength: 30}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 32.65, 34.25, 1.0, 1.08)} focusX={540} focusY={960} offsetX={sh.x} offsetY={sh.y}>
					<Burst c1="#1F4FA0" c2="#2F63B5" rotation={-t * 10} cx={250} cy={1100} />
					<AbsoluteFill style={{clipPath: 'polygon(62% 0, 100% 0, 100% 100%, 38% 100%)'}}>
						<Burst c1="#B5171E" c2="#D62828" rotation={t * 10} cx={830} cy={800} />
					</AbsoluteFill>
					<AbsoluteFill style={{background: 'linear-gradient(115deg, transparent 49.3%, #1A1410 49.4%, #1A1410 50.6%, transparent 50.7%)'}} />
					<Caio x={ramp(t, 32.65, 32.9, -200, 290, easeOut)} y={1830} scale={1.3} arms="guarda" stance={1} expression="confiante" bodyBob={breath(t) + 8} blink={blink(t, 'caio')} />
					{bills.map((b, i) => (
						<Bill
							key={b.icon}
							icon={b.icon}
							mood="bravo"
							x={ramp(t, 32.7 + i * 0.08, 32.95 + i * 0.08, 1300, 800 + (i - 1) * 40, easeOut)}
							y={480 + i * 330}
							width={250}
							rotate={b.rot + wave(t, 1.2, 3, i)}
							blink={blink(t, b.icon)}
							look={-0.6}
						/>
					))}
				</Camera>
				<ComicText text="VS" x={540} y={960} size={260} color="#F7C21B" scale={pop(t, 32.72, fps, 9)} rotate={-8} />
				<ComicText text="3 ADVERSÁRIOS" x={540} y={250} size={84} color="#FFFFFF" scale={pop(t, 32.9, fps)} rotate={-3} />
				<Flash amount={flashAt(t, 32.7, 0.6, 0.15)} />
			</AbsoluteFill>
		);
	}

	// ---------- E: o mata-leão que ninguém aceita (34,25 – 36,25) ----------
	if (t >= 34.25) {
		const squeeze = Math.max(0, wave(t, 3, 1));
		const sh = shakes(t, [{at: 35.45, strength: 12, duration: 0.3}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 34.25, 36.2, 1.0, 1.12)} focusX={540} focusY={900} offsetX={sh.x + squeeze * 3} offsetY={sh.y}>
					<Cozinha sky={1} table />
					{/* Caio por trás da conta: só cabeça aparece acima dela */}
					<Caio x={540} y={feetFor(520, 1.25)} scale={1.25} expression="esforco" arms="solto" headTilt={-8 + squeeze * 3} shadow={false} blink={0} />
					<Bill icon="luz" mood="entediado" x={540} y={1000 + squeeze * 4} width={520} blink={blink(t, 'luz-tedio')} look={0.5} rotate={-2} />
					<BracosMataLeao squeeze={squeeze} />
					<Lighting vignette={0.45} tint="#3A2A5A" tintOpacity={0.2} />
				</Camera>
				<Stamp text={'NÃO\nACEITA'} x={780} y={1180} scale={t >= 35.4 ? ramp(t, 35.4, 35.5, 2, 1, easeIn) : 0} rotate={-12} size={84} />
			</AbsoluteFill>
		);
	}

	// ---------- A, B, C: cozinha ----------
	const working = t < 27.0;
	const sitting = ramp(t, 27.1, 27.6);
	const caioIn = ramp(t, 27.4, 28.1, 0, 1, easeOut);
	const tableShot = t >= 29.0;
	const hours = curve(t, [23.3, 26.8], [7, 22.5]);
	const sky = ramp(t, 23.6, 26.6);
	const sh = shakes(
		t,
		bills.map((b) => ({at: b.at + 0.14, strength: 22, duration: 0.25})),
	);
	const marleneFace = working
		? mixFace(caioExpressions.confiante, caioExpressions.preocupado, ramp(t, 24.5, 26.5))
		: caioExpressions.preocupado;
	// varrendo: braço da vassoura balança, a outra mão na cintura
	const sweepArm = {shoulder: 20 + wave(t, 1.4, 12), elbow: -26 + wave(t, 1.4, 16, 0.2)};
	const hipArm = {shoulder: 38, elbow: -98};
	const restArm = {shoulder: 16, elbow: -14};

	return (
		<AbsoluteFill>
			<Camera
				zoom={tableShot ? ramp(t, 29.0, 29.4, 1.0, 1.18, easeOut) : curve(t, [23.05, 26.9, 27.1, 28.9], [1.0, 1.12, 1.05, 1.0])}
				focusX={540}
				focusY={tableShot ? 1200 : 900}
				offsetX={sh.x}
				offsetY={sh.y + (t < 23.35 ? ramp(t, 23.05, 23.35, -60, 0, easeOut) : 0)}
			>
				<Cozinha sky={sky} table={!working} />
				<Relogio x={900} y={800} width={160} hours={hours} />
				<Marlene
					x={ramp(t, 27.4, 28.1, 540, 730, easeOut)}
					y={feetFor(800 + sitting * 60, 1.45)}
					scale={1.45}
					expression={marleneFace}
					armLeft={working ? hipArm : mixArm(hipArm, {shoulder: 18, elbow: -110}, sitting)}
					armRight={working ? sweepArm : mixArm(sweepArm, restArm, sitting)}
					holdRight={<VassouraShape angle={working ? 10 + wave(t, 1.4, 8, 0.1) : 4} />}
					headTilt={working ? wave(t, 0.8, 4) : 6 + sitting * 4}
					bodyLean={working ? wave(t, 1.6, 3) : 2}
					bodyBob={breath(t)}
					gaze={tableShot ? {x: 0, y: 0.8} : caioIn > 0.5 ? {x: -0.6, y: 0} : {x: 0, y: 0.3}}
					blink={blink(t, 'marlene')}
				/>
				{caioIn > 0 ? (
					<Caio
						x={-260 + caioIn * 560}
						y={feetFor(810, 1.35)}
						scale={1.35}
						expression={tableShot ? mixFace(caioExpressions.preocupado, caioExpressions.surpreso, ramp(t, 31.55, 31.8)) : 'preocupado'}
						arms={mixArm(armPoses.solto, armPoses.maosNaCintura, ramp(t, 28.2, 28.6))}
						headTilt={-5}
						bodyBob={breath(t)}
						gaze={tableShot ? {x: 0.4, y: 0.8} : {x: 0.7, y: 0.2}}
						blink={blink(t, 'caio')}
						shadow={false}
					/>
				) : null}
				{bills.map((b) =>
					t >= b.at - 0.2 ? (
						<Bill
							key={b.icon}
							icon={b.icon}
							mood={t > b.at + 0.4 ? 'bravo' : 'debochado'}
							x={b.x}
							y={ramp(t, b.at - 0.2, b.at + 0.14, -500, 1250, easeIn)}
							width={260}
							rotate={b.rot + ramp(t, b.at - 0.2, b.at + 0.14, 40, 0)}
							blink={blink(t, b.icon)}
							look={0}
						/>
					) : null,
				)}
				<Lighting light="rgba(255,226,170,0.32)" lightX="70%" lightY="20%" vignette={0.3 + sky * 0.15} tint="#3A2A5A" tintOpacity={sky * 0.18} />
			</Camera>
			{bills.map((b) => (
				<ComicText key={b.icon} text={b.icon === 'luz' ? 'PÁ!' : b.icon === 'agua' ? 'PLAFT!' : 'POF!'} x={b.x} y={1000} size={74} color="#FFFFFF" scale={t > b.at + 0.12 && t < b.at + 0.7 ? pop(t, b.at + 0.12, fps) : 0} rotate={-8} />
			))}
			<Flash amount={t < 23.25 ? flashAt(t, 23.05, 0.8, 0.2) : 0} />
		</AbsoluteFill>
	);
};
