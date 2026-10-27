import React from 'react';
import {AbsoluteFill} from 'remotion';
import {curve, easeIn, easeOut, pop, ramp, shakes, wave, flashAt} from '../../../animation/anim';
import {Caio, armPoses, caioExpressions} from '../../../characters/caio';
import {mixArm, mixFace} from '../../../characters/shared/math';
import {OUTLINE} from '../../../characters/shared/style';
import {SeuAldo} from '../../../characters/supporting/characters';
import {FONT} from '../../../fonts';
import {Balanca, Cinturao, Ingresso, Moeda, Papel, Salario} from '../../../props/Objects';
import {Banco, Padaria, PalcoSonho} from '../../../scenes/backgrounds/Sets';
import {Camera} from '../../../scenes/camera/Camera';
import {Burst, ComicText, Flash, Lighting, Stamp} from '../../../scenes/fx/Fx';
import {blink, breath, feetFor, useT} from '../common';

/**
 * CENA 6 — O golpe final (61,80 – 74,60 s)
 * 62,08 "Mas tem um detalhe:"                → arranhão de disco; letras miúdas do panfleto
 * 63,90 "a inscrição custa quase o valor das contas da mãe." → balança quase equilibrada
 * 67,90 "O sonho cobra entrada,"             → sonho: dinheiro saindo (−R$)
 * 69,50 "a padaria paga salário"             → padaria: dinheiro entrando (+R$)
 * 71,38 "e o banco" / 72,46 "não aceita cinturão como pagamento." → carimbo RECUSADO
 */

const svgFont = {fontFamily: FONT};

const TicketMini = () => (
	<g transform="translate(-80 40)">
		<rect width={160} height={80} rx={10} fill="#F25C54" stroke={OUTLINE} strokeWidth={6} />
		<text x={80} y={52} textAnchor="middle" fontSize={24} fill="#fff" {...svgFont}>
			INSCRIÇÃO
		</text>
	</g>
);

const BillsMini = () => (
	<g>
		{['#F2B705', '#2A8BD8', '#7A3FA0'].map((c, i) => (
			<g key={c} transform={`translate(${-96 + i * 64} ${10 - (i % 2) * 14}) rotate(${(i - 1) * 8})`}>
				<rect width={60} height={100} rx={8} fill="#FBF6E9" stroke={OUTLINE} strokeWidth={5} />
				<rect width={60} height={22} rx={6} fill={c} stroke={OUTLINE} strokeWidth={5} />
			</g>
		))}
	</g>
);

export const Cena6: React.FC = () => {
	const t = useT(61.8);
	const fps = 30;

	// ---------- D: o banco (71,25 – 74,60) ----------
	if (t >= 71.25) {
		const refused = t >= 72.46;
		const sh = shakes(t, [{at: 72.5, strength: 22, duration: 0.3}]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 71.25, 74.6, 1.0, 1.12)} focusX={540} focusY={1000} offsetX={sh.x} offsetY={sh.y}>
					<Banco />
					<div
						style={{
							position: 'absolute',
							left: 540,
							top: 470,
							translate: '-50% 0',
							background: '#2F3A4A',
							color: '#fff',
							fontFamily: FONT,
							fontSize: 44,
							padding: '10px 30px',
							borderRadius: 12,
							border: `6px solid ${OUTLINE}`,
						}}
					>
						CAIXA · PAGAMENTOS
					</div>
					<Caio
						x={300}
						y={feetFor(800, 1.45)}
						scale={1.45}
						expression={refused ? mixFace(caioExpressions.surpreso, caioExpressions.preocupado, ramp(t, 72.9, 73.4)) : 'confiante'}
						arms={refused ? mixArm(armPoses.apontando, armPoses.susto, ramp(t, 72.5, 72.7)) : mixArm(armPoses.solto, armPoses.apontando, ramp(t, 71.4, 71.7))}
						headTilt={refused ? -4 : 6}
						bodyBob={breath(t)}
						gaze={{x: 0.8, y: 0.5}}
						blink={blink(t, 'caio')}
						shadow={false}
					/>
					<Cinturao x={ramp(t, 71.35, 71.7, -300, 700, easeOut)} y={1310} width={440} shine={refused ? 0 : Math.max(0, wave(t, 1.5, 1))} rotate={-3} />
				</Camera>
				<Stamp text="RECUSADO" x={700} y={1180} scale={refused ? ramp(t, 72.46, 72.56, 2.2, 1, easeIn) : 0} rotate={-12} size={90} />
			</AbsoluteFill>
		);
	}

	// ---------- C: sonho cobra / padaria paga (67,55 – 71,25) ----------
	if (t >= 67.55) {
		const bottom = t >= 69.4;
		return (
			<AbsoluteFill style={{backgroundColor: OUTLINE}}>
				<AbsoluteFill style={{clipPath: 'inset(0 0 50.5% 0)', translate: `${ramp(t, 67.55, 67.8, -1080, 0, easeOut)}px 0`}}>
					<AbsoluteFill style={{translate: '0 -420px'}}>
						<PalcoSonho t={t} />
					</AbsoluteFill>
					<Caio x={290} y={feetFor(420, 0.95)} scale={0.95} expression={t > 68.3 ? 'preocupado' : 'feliz'} arms={t > 68.3 ? 'susto' : 'comemorando'} bodyBob={breath(t)} blink={blink(t, 'caio')} shadow={false} gaze={{x: 0.6, y: 0}} />
					<Ingresso x={760} y={420} width={360} text="SONHO" scale={pop(t, 67.95, fps)} rotate={-8} />
					{[0, 1, 2].map((i) =>
						t > 68.2 + i * 0.12 ? <Moeda key={i} x={700 + i * 70} y={ramp(t, 68.2 + i * 0.12, 68.9 + i * 0.12, 420, -100, easeIn)} width={70} rotate={t * 280} /> : null,
					)}
					<ComicText text="−R$" x={820} y={720} size={110} color="#FF5A4E" scale={pop(t, 68.3, fps)} rotate={-6} />
					<Lighting vignette={0.35} />
				</AbsoluteFill>
				{bottom ? (
					<AbsoluteFill style={{clipPath: 'inset(50.5% 0 0 0)', translate: `${ramp(t, 69.4, 69.65, 1080, 0, easeOut)}px 0`}}>
						<AbsoluteFill style={{translate: '0 300px'}}>
							<Padaria />
						</AbsoluteFill>
						<SeuAldo x={800} y={feetFor(1390, 1.0)} scale={1.0} expression={caioExpressions.feliz} armLeft={{shoulder: 70, elbow: -30}} gaze={{x: -0.6, y: 0}} blink={blink(t, 'aldo')} bodyBob={breath(t)} />
						<Salario x={300} y={1420} width={360} scale={pop(t, 69.6, fps)} rotate={6} />
						<ComicText text="+R$" x={300} y={1720} size={110} color="#5BD16B" scale={pop(t, 69.9, fps)} rotate={5} />
						<Lighting vignette={0.3} />
					</AbsoluteFill>
				) : null}
			</AbsoluteFill>
		);
	}

	// ---------- B: a balança (63,85 – 67,55) ----------
	if (t >= 63.85) {
		const tilt = curve(t, [63.9, 64.5, 65.1, 65.7, 66.4], [-22, 14, -8, 5, 3]);
		return (
			<AbsoluteFill>
				<Camera zoom={ramp(t, 63.85, 67.5, 1.0, 1.08)} focusX={540} focusY={800} offsetY={ramp(t, 63.85, 64.1, -80, 0, easeOut)}>
					<Burst c1="#2F3A6B" c2="#3A4A85" rotation={t * 6} cy={800} />
					<Balanca x={540} y={860} width={940} tilt={tilt} left={<TicketMini />} right={<BillsMini />} />
					<Lighting vignette={0.35} />
				</Camera>
				<ComicText text="INSCRIÇÃO" x={250} y={300} size={62} color="#F25C54" scale={pop(t, 64.05, fps)} rotate={-5} />
				<ComicText text={'CONTAS\nDA MÃE'} x={830} y={300} size={58} color="#F7C21B" scale={pop(t, 66.6, fps)} rotate={5} />
				<ComicText text="QUASE!" x={540} y={420} size={110} color="#FFFFFF" scale={pop(t, 65.35, fps)} rotate={-3} />
			</AbsoluteFill>
		);
	}

	// ---------- A: "Mas tem um detalhe" (61,80 – 63,85) ----------
	const circle = ramp(t, 62.65, 63.1);
	return (
		<AbsoluteFill>
			<Camera zoom={curve(t, [61.8, 62.1, 62.6, 63.8], [1.0, 1.0, 1.35, 1.5])} focusX={540} focusY={1030}>
				<AbsoluteFill style={{filter: 'saturate(0.15) brightness(0.8)'}}>
					<Burst c1="#D9822B" c2="#F2A541" rotation={0} cy={1000} />
				</AbsoluteFill>
				<Papel x={540} y={880} width={620} title="CAMPEONATO" subtitle="VAGA ABERTA" lines={4} clip={false} rotate={-2} />
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 1145,
						translate: '-50% -50%',
						fontFamily: FONT,
						fontSize: 34,
						color: '#D62828',
					}}
				>
					*INSCRIÇÃO: R$ $$$
				</div>
				<svg width={1080} height={1920} style={{position: 'absolute'}}>
					<ellipse
						cx={540}
						cy={1145}
						rx={230}
						ry={56}
						fill="none"
						stroke="#D62828"
						strokeWidth={10}
						strokeDasharray={1100}
						strokeDashoffset={1100 * (1 - circle)}
						transform="rotate(-3 540 1145)"
					/>
				</svg>
				<Lighting vignette={0.5} />
			</Camera>
			<ComicText text="PERA AÍ…" x={540} y={300} size={100} color="#FFFFFF" scale={pop(t, 62.05, fps)} rotate={-4} />
			<Flash amount={flashAt(t, 61.8, 0.5, 0.15)} />
		</AbsoluteFill>
	);
};
