import React from 'react';
import {AbsoluteFill} from 'remotion';
import {OUTLINE} from '../../characters/shared/style';
import {FONT} from '../../fonts';

// Cenários do EP01 (1080×1920), no traço da série: contorno, cor chapada, poucos detalhes.
const W = 1080;
const H = 1920;
const sw = {stroke: OUTLINE, strokeWidth: 8, strokeLinejoin: 'round' as const};

const Frame: React.FC<{children: React.ReactNode; bg: string}> = ({children, bg}) => (
	<AbsoluteFill style={{backgroundColor: bg}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
			{children}
		</svg>
	</AbsoluteFill>
);

/** Casa da família: cozinha simples. `sky` controla a janela (0 = dia, 1 = noite). */
export const Cozinha: React.FC<{sky?: number; table?: boolean}> = ({sky = 0, table = true}) => {
	const skyColor = sky < 0.5 ? mix('#8FD3F4', '#F59E5B', sky * 2) : mix('#F59E5B', '#1D2A5C', (sky - 0.5) * 2);
	return (
		<Frame bg="#F2D7A8">
			<rect width={W} height={1300} fill="#F2D7A8" />
			<rect y={1240} width={W} height={60} fill="#D9B27C" />
			{/* azulejos */}
			{Array.from({length: 12}, (_, i) => (
				<line key={i} x1={i * 90} y1={900} x2={i * 90} y2={1240} stroke="#E4C28D" strokeWidth={4} />
			))}
			<rect y={900} width={W} height={340} fill="none" />
			{/* janela */}
			<g transform="translate(640 230)">
				<rect width={340} height={380} rx={14} fill={skyColor} {...sw} />
				{sky > 0.7 ? <circle cx={250} cy={90} r={34} fill="#FFF3C4" opacity={(sky - 0.7) / 0.3} /> : <circle cx={90} cy={100 + sky * 200} r={44} fill="#FFE066" opacity={1 - sky} />}
				<line x1={170} y1={0} x2={170} y2={380} {...sw} />
				<line x1={0} y1={190} x2={340} y2={190} {...sw} />
				<rect x={-24} y={370} width={388} height={28} rx={8} fill="#B07A4A" {...sw} />
			</g>
			{/* armário */}
			<g transform="translate(70 230)">
				<rect width={420} height={300} rx={12} fill="#C98C55" {...sw} />
				<line x1={210} y1={0} x2={210} y2={300} {...sw} />
				<circle cx={190} cy={150} r={10} fill={OUTLINE} />
				<circle cx={230} cy={150} r={10} fill={OUTLINE} />
			</g>
			{/* calendário */}
			<g transform="translate(120 640)">
				<rect width={200} height={220} rx={10} fill="#FBF6E9" {...sw} />
				<rect width={200} height={56} rx={10} fill="#D62828" {...sw} />
				{Array.from({length: 12}, (_, i) => (
					<rect key={i} x={20 + (i % 4) * 42} y={76 + Math.floor(i / 4) * 44} width={30} height={30} rx={4} fill={i === 9 ? '#F7C21B' : '#E6E0D0'} />
				))}
			</g>
			{/* chão */}
			<rect y={1300} width={W} height={H - 1300} fill="#B9835A" />
			{Array.from({length: 7}, (_, i) => (
				<line key={i} x1={0} y1={1300 + i * 100} x2={W} y2={1300 + i * 100} stroke="#A57049" strokeWidth={5} />
			))}
			{table ? (
				<g>
					<rect x={-20} y={1420} width={W + 40} height={70} fill="#8B5A2B" {...sw} />
					<rect x={-20} y={1490} width={W + 40} height={430} fill="#6E4520" />
				</g>
			) : null}
		</Frame>
	);
};

/** Palco do sonho: holofotes, pódio e público em silhueta. */
export const PalcoSonho: React.FC<{t: number}> = ({t}) => (
	<Frame bg="#2B1B4A">
		<defs>
			<linearGradient id="holofote" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#FFF4C2" stopOpacity={0.55} />
				<stop offset="1" stopColor="#FFF4C2" stopOpacity={0} />
			</linearGradient>
		</defs>
		{[-1, 1].map((s) => (
			<path
				key={s}
				d={`M ${540 + s * 520} -40 L ${540 + s * 420} -40 L ${540 + s * (40 + Math.sin(t * 1.3) * 60)} 1700 L ${540 + s * (300 + Math.sin(t * 1.3) * 60)} 1700 Z`}
				fill="url(#holofote)"
			/>
		))}
		<circle cx={540} cy={560} r={420} fill="#4B2C7F" opacity={0.6} />
		{/* pódio */}
		<g transform="translate(540 1520)">
			<rect x={-220} y={0} width={440} height={420} fill="#F7C21B" {...sw} />
			<text y={250} textAnchor="middle" fontFamily={FONT} fontSize={240} fill="#C9930A">1</text>
			<rect x={-520} y={140} width={300} height={280} fill="#C0C6CF" {...sw} />
			<rect x={220} y={200} width={300} height={220} fill="#C98C55" {...sw} />
		</g>
		{/* público */}
		{Array.from({length: 14}, (_, i) => (
			<circle key={i} cx={i * 82 + 10} cy={1880 + Math.sin(t * 6 + i) * 10} r={56} fill="#140C26" />
		))}
	</Frame>
);

/** Quarto à noite com luminária: clima de investigação. */
export const QuartoNoite: React.FC<{lamp?: number}> = ({lamp = 1}) => (
	<Frame bg="#1A2140">
		<rect width={W} height={1300} fill="#1F2850" />
		<g transform="translate(700 260)">
			<rect width={280} height={320} rx={12} fill="#0E1430" {...sw} />
			<circle cx={200} cy={90} r={30} fill="#FFF3C4" />
			<line x1={140} y1={0} x2={140} y2={320} {...sw} />
			<line x1={0} y1={160} x2={280} y2={160} {...sw} />
		</g>
		<rect y={1300} width={W} height={H - 1300} fill="#141A33" />
		{/* cone de luz */}
		<path d={`M 300 760 L 360 760 L 900 1480 L -200 1480 Z`} fill="#FFE8A3" opacity={0.22 * lamp} />
		{/* luminária */}
		<g transform="translate(330 700)">
			<path d="M -70 60 L 70 60 L 40 0 L -40 0 Z" fill="#2A8BD8" {...sw} />
			<line x1={0} y1={0} x2={-60} y2={-160} stroke={OUTLINE} strokeWidth={14} />
		</g>
		{/* mesa */}
		<rect x={-20} y={1400} width={W + 40} height={70} fill="#7A4D2A" {...sw} />
		<rect x={-20} y={1470} width={W + 40} height={450} fill="#5B3A1F" />
	</Frame>
);

/** Fachada da padaria do Seu Aldo. */
export const Padaria: React.FC = () => (
	<Frame bg="#F4E3C3">
		<rect width={W} height={H} fill="#F4E3C3" />
		<rect x={60} y={180} width={960} height={190} rx={18} fill="#D9822B" {...sw} />
		<text x={540} y={320} textAnchor="middle" fontFamily={FONT} fontSize={120} fill="#FBF6E9" stroke={OUTLINE} strokeWidth={10} paintOrder="stroke">
			PADARIA
		</text>
		{/* toldo listrado */}
		{Array.from({length: 8}, (_, i) => (
			<path key={i} d={`M ${i * 135} 380 L ${i * 135 + 135} 380 L ${i * 135 + 135} 500 Q ${i * 135 + 67} 540 ${i * 135} 500 Z`} fill={i % 2 ? '#FBF6E9' : '#D62828'} {...sw} strokeWidth={6} />
		))}
		{/* vitrine com pães */}
		<rect x={60} y={1080} width={960} height={420} rx={16} fill="#BFE3F2" {...sw} />
		{Array.from({length: 3}, (_, r) =>
			Array.from({length: 5}, (_, i) => (
				<ellipse key={`${r}-${i}`} cx={170 + i * 185} cy={1180 + r * 110} rx={70} ry={34} fill="#E0A04E" stroke={OUTLINE} strokeWidth={5} />
			)),
		)}
		<rect y={1500} width={W} height={H - 1500} fill="#C9A27A" />
	</Frame>
);

/** Agência bancária: colunas e balcão. */
export const Banco: React.FC = () => (
	<Frame bg="#DDE3EA">
		<path d="M 60 360 L 540 120 L 1020 360 Z" fill="#B8C2CE" {...sw} />
		<text x={540} y={320} textAnchor="middle" fontFamily={FONT} fontSize={110} fill="#2F3A4A">BANCO</text>
		{[140, 380, 700, 940].map((x) => (
			<rect key={x} x={x - 50} y={380} width={100} height={900} fill="#EEF2F6" {...sw} />
		))}
		<rect x={0} y={360} width={W} height={36} fill="#B8C2CE" {...sw} />
		<rect y={1280} width={W} height={H - 1280} fill="#A9B4C2" />
		{/* balcão */}
		<rect x={-20} y={1360} width={W + 40} height={80} fill="#6B7A8F" {...sw} />
		<rect x={-20} y={1440} width={W + 40} height={480} fill="#4E5B6E" />
	</Frame>
);

/** Estúdio de programa de auditório (Você decide). */
export const Auditorio: React.FC<{t: number}> = ({t}) => (
	<Frame bg="#16123A">
		{Array.from({length: 9}, (_, i) => (
			<circle key={i} cx={540} cy={820} r={1100 - i * 110} fill={i % 2 ? '#211A55' : '#16123A'} />
		))}
		{Array.from({length: 22}, (_, i) => {
			const a = (i / 22) * Math.PI * 2;
			const on = Math.floor(t * 6 + i) % 2 === 0;
			return <circle key={i} cx={540 + Math.cos(a) * 470} cy={820 + Math.sin(a) * 470} r={16} fill={on ? '#F7C21B' : '#5A4A20'} />;
		})}
		<rect y={1480} width={W} height={H - 1480} fill="#2A1F6B" />
		<rect y={1470} width={W} height={20} fill="#F7C21B" />
	</Frame>
);

function mix(a: string, b: string, t: number) {
	const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
	const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
	const k = Math.min(1, Math.max(0, t));
	return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(',')})`;
}

/** Formatura do ensino médio: palco da escola, faixa, bandeirinhas e colegas de beca. */
export const Escola: React.FC<{t: number}> = ({t}) => (
	<Frame bg="#F3E6C8">
		{/* parede e cortina do palco */}
		<rect width={W} height={1300} fill="#F3E6C8" />
		<path d="M 0 0 L 200 0 Q 180 600 120 1300 L 0 1300 Z" fill="#B5171E" {...sw} />
		<path d="M 1080 0 L 880 0 Q 900 600 960 1300 L 1080 1300 Z" fill="#B5171E" {...sw} />
		<path d="M 0 0 L 1080 0 L 1080 110 Q 540 200 0 110 Z" fill="#D62828" {...sw} />
		{/* faixa da formatura */}
		<g transform={`translate(540 330) rotate(${Math.sin(t * 1.2) * 1.2})`}>
			<rect x={-400} y={-90} width={800} height={180} rx={20} fill="#22305E" {...sw} />
			<text y={-4} textAnchor="middle" fontFamily={FONT} fontSize={92} fill="#F7C21B" stroke={OUTLINE} strokeWidth={8} paintOrder="stroke">
				FORMATURA
			</text>
			<text y={62} textAnchor="middle" fontFamily={FONT} fontSize={44} fill="#FFFFFF">
				ENSINO MÉDIO
			</text>
		</g>
		{/* bandeirinhas */}
		<path d="M 180 560 Q 540 660 900 560" fill="none" stroke={OUTLINE} strokeWidth={5} />
		{Array.from({length: 9}, (_, i) => {
			const x = 220 + i * 80;
			const y = 568 + Math.sin((i / 8) * Math.PI) * 48;
			const colors = ['#F7C21B', '#2A8BD8', '#D62828', '#2BA84A'];
			return <path key={i} d={`M ${x - 28} ${y} L ${x + 28} ${y} L ${x} ${y + 56} Z`} fill={colors[i % 4]} stroke={OUTLINE} strokeWidth={4} />;
		})}
		{/* palco */}
		<rect y={1300} width={W} height={H - 1300} fill="#8B5A2B" />
		<rect y={1300} width={W} height={24} fill="#6E4520" />
		{Array.from({length: 8}, (_, i) => (
			<line key={i} x1={i * 150} y1={1324} x2={i * 150 - 60} y2={H} stroke="#7A4D24" strokeWidth={5} />
		))}
		{/* colegas de beca ao fundo */}
		{[90, 250, 830, 990].map((x, i) => (
			<g key={x} transform={`translate(${x} ${1060 + Math.sin(t * 5 + i) * 6})`}>
				<path d="M -70 260 L -60 60 Q 0 30 60 60 L 70 260 Z" fill="#2B3A6E" {...sw} strokeWidth={6} />
				<circle cy={0} r={52} fill={['#8C5A3C', '#E2AE84', '#6B4430', '#C98F62'][i]} {...sw} strokeWidth={6} />
				<path d="M -70 -40 L 0 -66 L 70 -40 L 0 -16 Z" fill="#1E1E1E" {...sw} strokeWidth={5} />
			</g>
		))}
	</Frame>
);
