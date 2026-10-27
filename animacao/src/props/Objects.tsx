import React from 'react';
import {OUTLINE, outlined} from '../characters/shared/style';
import {Placed, type PlacedProps} from './Placed';
import {FONT} from '../fonts';

// Objetos de cena do EP01, no mesmo traço dos personagens.

const font = FONT;

/** Pão francês lutador. */
export const PaoFrances: React.FC<PlacedProps & {width?: number; mood?: 'bravo' | 'debochado'; blink?: number}> = ({
	width = 420,
	mood = 'bravo',
	blink = 0,
	...p
}) => (
	<Placed {...p} width={width} viewBox={[-40, -40, 480, 300]}>
		<ellipse cx={200} cy={236} rx={170} ry={18} fill="#000" opacity={0.18} />
		<path d="M 20 130 Q 20 30 200 24 Q 380 30 380 130 Q 380 220 200 226 Q 20 220 20 130 Z" fill="#E0A04E" {...outlined} strokeWidth={7} />
		<path d="M 60 120 Q 60 60 200 54 Q 340 60 340 120" fill="none" stroke="#F3C27A" strokeWidth={14} strokeLinecap="round" />
		{[110, 200, 290].map((x) => (
			<path key={x} d={`M ${x - 34} 70 Q ${x} 50 ${x + 30} 74`} fill="none" stroke="#B5742E" strokeWidth={10} strokeLinecap="round" />
		))}
		{/* rosto */}
		{[160, 240].map((x, i) => (
			<g key={x}>
				<g transform={`translate(${x} 128) scale(1 ${Math.max(0.1, 1 - blink)})`}>
					<ellipse rx={18} ry={21} fill="#fff" stroke={OUTLINE} strokeWidth={5} vectorEffect="non-scaling-stroke" />
					<circle cx={i === 0 ? 4 : -4} cy={3} r={9} fill={OUTLINE} />
				</g>
				<line
					x1={x - 22}
					x2={x + 22}
					y1={98}
					y2={98}
					transform={`rotate(${(mood === 'bravo' ? 20 : -6) * (i === 0 ? 1 : -1)} ${x} 98)`}
					stroke={OUTLINE}
					strokeWidth={10}
					strokeLinecap="round"
				/>
			</g>
		))}
		{mood === 'bravo' ? (
			<path d="M 170 182 Q 200 162 230 182" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
		) : (
			<path d="M 168 172 Q 200 192 236 166" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
		)}
		{/* luvas */}
		{[
			{x: 6, y: 150},
			{x: 394, y: 150},
		].map((g, i) => (
			<g key={i}>
				<ellipse cx={g.x} cy={g.y} rx={44} ry={40} fill="#D62828" {...outlined} strokeWidth={6} />
				<rect x={g.x - 26} y={g.y + 30} width={52} height={20} rx={6} fill="#F7F5EF" {...outlined} strokeWidth={5} />
			</g>
		))}
	</Placed>
);

/** Lata de energético patrocinadora (marca fictícia). */
export const Energetico: React.FC<PlacedProps & {width?: number}> = ({width = 220, ...p}) => (
	<Placed {...p} width={width} viewBox={[-20, -20, 200, 340]}>
		<rect x={0} y={20} width={160} height={270} rx={26} fill="#1D1D2B" {...outlined} strokeWidth={6} />
		<rect x={10} y={0} width={140} height={34} rx={14} fill="#B8BCC6" {...outlined} strokeWidth={6} />
		<path d="M 0 90 L 160 70 L 160 120 L 0 140 Z" fill="#33D17A" />
		<text x={80} y={124} textAnchor="middle" fontFamily={font} fontSize={40} fill="#fff" stroke={OUTLINE} strokeWidth={5} paintOrder="stroke" transform="rotate(-7 80 110)">
			TURBO
		</text>
		{/* óculos escuros + sorriso */}
		<path d="M 24 168 L 136 168 L 128 196 Q 110 206 92 194 L 84 180 L 76 180 L 68 194 Q 50 206 32 196 Z" fill={OUTLINE} />
		<path d="M 48 230 Q 80 256 116 226" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" />
	</Placed>
);

/** Capelo de formatura. */
export const Capelo: React.FC<PlacedProps & {width?: number}> = ({width = 300, ...p}) => (
	<Placed {...p} width={width} viewBox={[-10, -10, 320, 180]}>
		<CapeloShape />
	</Placed>
);

/** Capelo em coordenadas da cabeça do Caio (para headOverlay). */
export const CapeloShape: React.FC<{transform?: string}> = ({transform}) => (
	<g transform={transform}>
		<path d="M 80 70 L 80 120 Q 150 146 220 120 L 220 70 Z" fill="#1E1E1E" {...outlined} />
		<path d="M 0 60 L 150 10 L 300 60 L 150 110 Z" fill="#2A2A2A" {...outlined} />
		<circle cx={150} cy={60} r={9} fill="#F7C21B" {...outlined} strokeWidth={3} />
		<path d="M 150 60 Q 236 70 252 128" fill="none" stroke="#F7C21B" strokeWidth={7} strokeLinecap="round" />
		<rect x={240} y={124} width={22} height={34} rx={6} fill="#F7C21B" {...outlined} strokeWidth={3} />
	</g>
);

/** Medalha (coordenadas do tronco do Caio, para bodyOverlay). */
export const MedalhaShape: React.FC<{swing?: number}> = ({swing = 0}) => (
	<g transform={`rotate(${swing} 200 310)`}>
		<path d="M 168 306 L 192 400 M 232 306 L 208 400" stroke="#24418F" strokeWidth={14} strokeLinecap="round" />
		<circle cx={200} cy={414} r={30} fill="#F7C21B" {...outlined} />
		<circle cx={200} cy={414} r={17} fill="none" stroke="#C9930A" strokeWidth={5} />
		<text x={200} y={423} textAnchor="middle" fontFamily={font} fontSize={24} fill="#8A5A00">1</text>
	</g>
);

/** Cinturão de campeão. */
export const Cinturao: React.FC<PlacedProps & {width?: number; shine?: number}> = ({width = 520, shine = 0, ...p}) => (
	<Placed {...p} width={width} viewBox={[-20, -20, 560, 240]}>
		<rect x={0} y={60} width={520} height={90} rx={30} fill="#1E1E1E" {...outlined} strokeWidth={7} />
		{[60, 120, 400, 460].map((x) => (
			<circle key={x} cx={x} cy={105} r={18} fill="#E8B923" {...outlined} strokeWidth={4} />
		))}
		<ellipse cx={260} cy={105} rx={120} ry={96} fill="#F7C21B" {...outlined} strokeWidth={7} />
		<ellipse cx={260} cy={105} rx={88} ry={68} fill="#E3A812" {...outlined} strokeWidth={5} />
		<text x={260} y={102} textAnchor="middle" fontFamily={font} fontSize={30} fill="#7A4D00">CAMPEÃO</text>
		<text x={260} y={136} textAnchor="middle" fontFamily={font} fontSize={22} fill="#7A4D00">JIU-JÍTSU</text>
		{shine > 0 ? (
			<path
				d="M 0 -40 L 10 -10 L 40 0 L 10 10 L 0 40 L -10 10 L -40 0 L -10 -10 Z"
				transform={`translate(330 40) scale(${shine})`}
				fill="#fff"
				{...outlined}
				strokeWidth={3}
			/>
		) : null}
	</Placed>
);

/** Patch de patrocinador (marcas fictícias), em coordenadas do Caio. */
export const PatchShape: React.FC<{x: number; y: number; text: string; color: string; s: number; rot?: number}> = ({
	x,
	y,
	text,
	color,
	s,
	rot = 0,
}) =>
	s <= 0 ? null : (
		<g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
			<rect x={-34} y={-15} width={68} height={30} rx={7} fill={color} {...outlined} strokeWidth={3.5} />
			<text y={7} textAnchor="middle" fontFamily={font} fontSize={15} fill="#fff" stroke={OUTLINE} strokeWidth={2.5} paintOrder="stroke">
				{text}
			</text>
		</g>
	);

/** Papel / prancheta com título (planejamento, contrato, panfleto). */
export const Papel: React.FC<
	PlacedProps & {width?: number; title: string; lines?: number; color?: string; cobweb?: boolean; check?: number; clip?: boolean; subtitle?: string}
> = ({width = 360, title, lines = 5, color = '#24418F', cobweb = false, check = 0, clip = true, subtitle, ...p}) => (
	<Placed {...p} width={width} viewBox={[-20, -30, 340, 440]}>
		{clip ? <rect x={-6} y={-6} width={312} height={412} rx={18} fill="#8B5A2B" {...outlined} strokeWidth={6} /> : null}
		<rect x={10} y={10} width={280} height={380} rx={8} fill="#FBF6E9" {...outlined} strokeWidth={5} />
		{clip ? <rect x={100} y={-20} width={100} height={40} rx={10} fill="#B0B4BC" {...outlined} strokeWidth={5} /> : null}
		<text x={150} y={78} textAnchor="middle" fontFamily={font} fontSize={title.length > 10 ? 26 : 34} fill={color}>
			{title}
		</text>
		{subtitle ? (
			<text x={150} y={116} textAnchor="middle" fontFamily={font} fontSize={24} fill={OUTLINE}>
				{subtitle}
			</text>
		) : null}
		{Array.from({length: lines}, (_, i) => (
			<rect key={i} x={40} y={150 + i * 40} width={i % 2 ? 170 : 220} height={12} rx={6} fill="#C9C2B0" />
		))}
		{cobweb ? (
			<g stroke="#9A9A9A" strokeWidth={3} fill="none" opacity={0.9}>
				<path d="M 290 10 L 200 10 M 290 10 L 290 100 M 290 10 L 220 80" />
				<path d="M 260 10 Q 262 40 290 40 M 230 10 Q 236 66 290 70" />
			</g>
		) : null}
		{check > 0 ? (
			<path
				d="M 70 300 L 130 350 L 240 230"
				fill="none"
				stroke="#2BA84A"
				strokeWidth={22}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={420}
				strokeDashoffset={420 * (1 - check)}
			/>
		) : null}
	</Placed>
);

/** Calculadora com visor. */
export const Calculadora: React.FC<PlacedProps & {width?: number; display: string; displayColor?: string; pressed?: number}> = ({
	width = 520,
	display,
	displayColor = '#1E2B1E',
	pressed = -1,
	...p
}) => (
	<Placed {...p} width={width} viewBox={[-20, -20, 440, 600]}>
		<rect x={0} y={0} width={400} height={560} rx={40} fill="#3A3F4B" {...outlined} strokeWidth={8} />
		<rect x={34} y={40} width={332} height={120} rx={14} fill="#B9D7A8" {...outlined} strokeWidth={6} />
		<text
			x={350}
			y={124}
			textAnchor="end"
			fontFamily="'Courier New', monospace"
			fontWeight={700}
			fontSize={display.length > 9 ? 40 : 64}
			fill={displayColor}
		>
			{display}
		</text>
		{Array.from({length: 16}, (_, i) => {
			const cx = 40 + (i % 4) * 84;
			const cy = 196 + Math.floor(i / 4) * 86;
			const down = i === pressed;
			return (
				<g key={i} transform={`translate(0 ${down ? 6 : 0})`}>
					<rect x={cx} y={cy} width={70} height={70} rx={14} fill={i % 4 === 3 ? '#F28C28' : down ? '#9AA0AC' : '#E6E8EC'} {...outlined} strokeWidth={5} />
					<text x={cx + 35} y={cy + 47} textAnchor="middle" fontFamily={font} fontSize={30} fill={OUTLINE}>
						{['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'][i]}
					</text>
				</g>
			);
		})}
	</Placed>
);

/** Relógio de parede. */
export const Relogio: React.FC<PlacedProps & {width?: number; hours: number}> = ({width = 220, hours, ...p}) => (
	<Placed {...p} width={width} viewBox={[-110, -110, 220, 220]}>
		<circle r={96} fill="#FBF6E9" {...outlined} strokeWidth={8} />
		{Array.from({length: 12}, (_, i) => (
			<line key={i} x1={0} y1={-78} x2={0} y2={-66} transform={`rotate(${i * 30})`} stroke={OUTLINE} strokeWidth={6} strokeLinecap="round" />
		))}
		<line x1={0} y1={0} x2={0} y2={-46} transform={`rotate(${hours * 30})`} stroke={OUTLINE} strokeWidth={10} strokeLinecap="round" />
		<line x1={0} y1={0} x2={0} y2={-68} transform={`rotate(${hours * 360})`} stroke="#D62828" strokeWidth={6} strokeLinecap="round" />
		<circle r={8} fill={OUTLINE} />
	</Placed>
);

/** Nota de dinheiro / envelope de salário. */
export const Salario: React.FC<PlacedProps & {width?: number}> = ({width = 360, ...p}) => (
	<Placed {...p} width={width} viewBox={[-20, -20, 400, 280]}>
		<rect x={0} y={20} width={360} height={220} rx={16} fill="#E9D8A6" {...outlined} strokeWidth={7} />
		<path d="M 0 36 L 180 150 L 360 36" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinejoin="round" />
		<rect x={40} y={-10} width={280} height={110} rx={10} fill="#6BBF59" {...outlined} strokeWidth={6} />
		<text x={180} y={66} textAnchor="middle" fontFamily={font} fontSize={56} fill="#fff" stroke={OUTLINE} strokeWidth={6} paintOrder="stroke">R$</text>
		<text x={180} y={214} textAnchor="middle" fontFamily={font} fontSize={46} fill={OUTLINE}>SALÁRIO</text>
	</Placed>
);

/** Moeda. */
export const Moeda: React.FC<PlacedProps & {width?: number}> = ({width = 90, ...p}) => (
	<Placed {...p} width={width} viewBox={[-50, -50, 100, 100]}>
		<circle r={42} fill="#F7C21B" {...outlined} strokeWidth={6} />
		<text y={14} textAnchor="middle" fontFamily={font} fontSize={38} fill="#8A5A00">$</text>
	</Placed>
);

/** Balança de pratos. tilt em graus (+ desce o prato direito). */
export const Balanca: React.FC<PlacedProps & {width?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode}> = ({
	width = 900,
	tilt,
	left,
	right,
	...p
}) => {
	const a = (tilt * Math.PI) / 180;
	const arm = 300;
	const lx = -Math.cos(a) * arm;
	const ly = -Math.sin(a) * arm;
	const rx = Math.cos(a) * arm;
	const ry = Math.sin(a) * arm;
	const pan = (x: number, y: number, content: React.ReactNode) => (
		<g transform={`translate(${x} ${y})`}>
			<path d="M 0 0 L -90 150 M 0 0 L 90 150" stroke={OUTLINE} strokeWidth={6} />
			<g transform="translate(0 40)">{content}</g>
			<path d="M -120 150 L 120 150 Q 100 196 0 196 Q -100 196 -120 150 Z" fill="#E8B923" {...outlined} strokeWidth={7} />
		</g>
	);
	return (
		<Placed {...p} width={width} viewBox={[-450, -120, 900, 760]}>
			<rect x={-26} y={0} width={52} height={560} fill="#C9930A" {...outlined} strokeWidth={7} />
			<path d="M -160 600 L 160 600 L 120 540 L -120 540 Z" fill="#E8B923" {...outlined} strokeWidth={7} />
			<line x1={lx} y1={ly} x2={rx} y2={ry} stroke={OUTLINE} strokeWidth={30} strokeLinecap="round" />
			<line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#E8B923" strokeWidth={18} strokeLinecap="round" />
			<circle r={30} fill="#F7C21B" {...outlined} strokeWidth={7} />
			{pan(lx, ly, left)}
			{pan(rx, ry, right)}
		</Placed>
	);
};

/** Ingresso. */
export const Ingresso: React.FC<PlacedProps & {width?: number; text?: string}> = ({width = 380, text = 'ENTRADA', ...p}) => (
	<Placed {...p} width={width} viewBox={[-20, -20, 420, 220]}>
		<path
			d="M 0 0 L 380 0 L 380 60 Q 350 90 380 120 L 380 180 L 0 180 L 0 120 Q 30 90 0 60 Z"
			fill="#F25C54"
			{...outlined}
			strokeWidth={7}
		/>
		<line x1={290} y1={10} x2={290} y2={170} stroke="#fff" strokeWidth={5} strokeDasharray="12 10" />
		<text x={145} y={86} textAnchor="middle" fontFamily={font} fontSize={44} fill="#fff" stroke={OUTLINE} strokeWidth={6} paintOrder="stroke">
			{text}
		</text>
		<text x={145} y={140} textAnchor="middle" fontFamily={font} fontSize={30} fill={OUTLINE}>R$ $$$</text>
	</Placed>
);

/**
 * Braços de kimono em mata-leão em volta de um objeto (boleto de ~520 px centrado em x=540).
 * Desenhado em coordenadas da tela (1080×1920): os braços saem dos ombros do Caio,
 * contornam as laterais do objeto e se fecham na frente.
 */
export const BracosMataLeao: React.FC<{squeeze?: number; dx?: number; dy?: number}> = ({squeeze = 0, dx = 0, dy = 0}) => {
	const sq = squeeze * 12;
	const armB = `M 612 688 C 770 680 850 760 800 ${822 + sq} C 760 ${858 + sq} 650 ${846 + sq} 575 ${838 + sq}`;
	const armA = `M 468 688 C 310 680 230 760 282 ${822 + sq} C 330 ${866 + sq} 540 ${852 + sq} 705 ${818 + sq}`;
	const sleeve = (d: string) => (
		<>
			<path d={d} fill="none" stroke={OUTLINE} strokeWidth={70} strokeLinecap="round" />
			<path d={d} fill="none" stroke="#F7F5EF" strokeWidth={58} strokeLinecap="round" />
		</>
	);
	const fist = (x: number, y: number) => (
		<g transform={`translate(${x} ${y})`}>
			<circle r={32} fill="#B9693D" {...outlined} />
			<path d="M -12 -10 q 8 8 0 16 M 4 -12 q 8 9 0 18" fill="none" stroke={OUTLINE} strokeWidth={3.5} strokeLinecap="round" />
		</g>
	);
	return (
		<svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: dx, top: dy, overflow: 'visible'}}>
			{sleeve(armB)}
			{fist(560, 838 + sq)}
			{sleeve(armA)}
			{fist(724, 814 + sq)}
			<rect x={444} y={672} width={24} height={36} rx={6} fill="#232323" transform="rotate(-70 456 690)" />
			<rect x={612} y={672} width={24} height={36} rx={6} fill="#232323" transform="rotate(70 624 690)" />
		</svg>
	);
};

/** Lágrimas (coordenadas da cabeça do Caio). */
export const LagrimasShape: React.FC<{t: number}> = ({t}) => (
	<g>
		{[165, 235].map((x, i) =>
			[0, 0.33, 0.66].map((o) => {
				const k = (t * 1.6 + o + i * 0.17) % 1;
				return (
					<path
						key={`${x}-${o}`}
						transform={`translate(${x + (i === 0 ? -14 : 14) * k} ${214 + k * 110}) scale(${1 - k * 0.3})`}
						d="M 0 -14 Q 10 0 8 8 Q 4 16 0 16 Q -4 16 -8 8 Q -10 0 0 -14 Z"
						fill="#7CC6F2"
						stroke={OUTLINE}
						strokeWidth={3}
						opacity={1 - k * 0.5}
					/>
				);
			}),
		)}
	</g>
);

/** Gota de suor (coordenadas da cabeça do Caio). */
export const SuorShape: React.FC<{t: number}> = ({t}) => {
	const k = t % 1;
	return (
		<path
			transform={`translate(288 ${150 + k * 60})`}
			d="M 0 -18 Q 13 0 10 10 Q 5 20 0 20 Q -5 20 -10 10 Q -13 0 0 -18 Z"
			fill="#BFE6FF"
			stroke={OUTLINE}
			strokeWidth={4}
			opacity={1 - k * 0.6}
		/>
	);
};

/** Fileira de números/rabiscos de conta flutuando. */
export const Rabiscos: React.FC<{t: number; opacity: number; seed?: number}> = ({t, opacity, seed = 0}) => {
	if (opacity <= 0) return null;
	const items = ['+', '−', '×', '=', '?', '%', 'R$', '÷', '?!'];
	return (
		<>
			{items.map((s, i) => {
				const ang = ((i + seed) / items.length) * Math.PI * 2 + t * 0.6;
				const r = 330 + (i % 3) * 50;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 540 + Math.cos(ang) * r,
							top: 760 + Math.sin(ang) * r * 0.75,
							translate: '-50% -50%',
							fontFamily: font,
							fontSize: 70 + (i % 3) * 14,
							color: '#FBF6E9',
							WebkitTextStroke: `9px ${OUTLINE}`,
							paintOrder: 'stroke fill',
							opacity,
							rotate: `${Math.sin(t * 2 + i) * 14}deg`,
						}}
					>
						{s}
					</div>
				);
			})}
		</>
	);
};

/** Vassoura, em coordenadas da mão (cabo passa pela mão, cerdas para baixo). */
export const VassouraShape: React.FC<{angle?: number}> = ({angle = 0}) => (
	<g transform={`rotate(${angle})`}>
		<rect x={-8} y={-150} width={16} height={430} rx={8} fill="#B07A4A" {...outlined} strokeWidth={4} />
		<path d="M -14 276 L 14 276 L 60 300 L -60 300 Z" fill="#D62828" {...outlined} strokeWidth={4} />
		<path d="M -60 300 L 60 300 L 78 392 L -78 392 Z" fill="#E8C35A" {...outlined} strokeWidth={5} />
		{[-50, -25, 0, 25, 50].map((x) => (
			<line key={x} x1={x * 0.9} y1={308} x2={x * 1.2} y2={386} stroke="#B8902E" strokeWidth={4} strokeLinecap="round" />
		))}
	</g>
);

/** Diploma enrolado com fita, em coordenadas da mão. */
export const DiplomaShape: React.FC = () => (
	<g transform="rotate(-20)">
		<rect x={-74} y={-18} width={148} height={36} rx={18} fill="#FBF6E9" {...outlined} strokeWidth={4} />
		<ellipse cx={-74} cy={0} rx={10} ry={18} fill="#EDE3C8" {...outlined} strokeWidth={4} />
		<rect x={-12} y={-20} width={24} height={40} fill="#D62828" stroke={OUTLINE} strokeWidth={3} />
		<path d="M 0 20 L -14 48 M 0 20 L 14 48" stroke="#D62828" strokeWidth={8} strokeLinecap="round" />
	</g>
);
