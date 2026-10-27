import React from 'react';
import {OUTLINE, outlined} from '../characters/shared/style';
import {FONT} from '../fonts';

// O vilão da série: o boleto (e as contas de luz, água e internet).
// Mesmo traço do Caio: contorno grosso, cores chapadas, olhos grandes.

export type BillMood = 'bravo' | 'entediado' | 'derrotado' | 'debochado';
export type BillIcon = 'boleto' | 'luz' | 'agua' | 'internet';

const accents: Record<BillIcon, string> = {
	boleto: '#D62828',
	luz: '#F2B705',
	agua: '#2A8BD8',
	internet: '#7A3FA0',
};

const labels: Record<BillIcon, string> = {
	boleto: 'BOLETO',
	luz: 'LUZ',
	agua: 'ÁGUA',
	internet: 'INTERNET',
};

const Icon: React.FC<{icon: BillIcon}> = ({icon}) => {
	if (icon === 'luz')
		return (
			<g transform="translate(150 108)">
				<circle r={26} fill="#FFE066" {...outlined} strokeWidth={4} />
				<rect x={-11} y={22} width={22} height={14} rx={3} fill="#9A9A9A" {...outlined} strokeWidth={4} />
				<path d="M -8 -4 L 0 8 L 8 -4" fill="none" stroke={OUTLINE} strokeWidth={4} />
			</g>
		);
	if (icon === 'agua')
		return (
			<path
				transform="translate(150 104)"
				d="M 0 -32 Q 26 4 22 16 Q 16 36 0 36 Q -16 36 -22 16 Q -26 4 0 -32 Z"
				fill="#7CC6F2"
				{...outlined}
				strokeWidth={4}
			/>
		);
	if (icon === 'internet')
		return (
			<g transform="translate(150 122)" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round">
				<path d="M -40 -22 Q 0 -54 40 -22" />
				<path d="M -26 -8 Q 0 -30 26 -8" />
				<circle r={7} cy={8} fill={OUTLINE} />
			</g>
		);
	return (
		<text x={150} y={124} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={OUTLINE}>
			R$
		</text>
	);
};

const Face: React.FC<{mood: BillMood; blink: number; look: number}> = ({mood, blink, look}) => {
	const eyes = [110, 190];
	if (mood === 'derrotado') {
		return (
			<g>
				{eyes.map((x) => (
					<g key={x} stroke={OUTLINE} strokeWidth={8} strokeLinecap="round">
						<line x1={x - 16} y1={186} x2={x + 16} y2={214} />
						<line x1={x + 16} y1={186} x2={x - 16} y2={214} />
					</g>
				))}
				<path d="M 112 262 Q 150 236 188 262" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
				<path d="M 150 252 Q 168 286 156 292 Q 142 294 146 254 Z" fill="#E36B6B" stroke={OUTLINE} strokeWidth={4} />
			</g>
		);
	}
	const lid = mood === 'entediado' ? 0.45 : mood === 'debochado' ? 0.6 : 1;
	const open = Math.max(0.08, lid * (1 - blink));
	const browAngle = mood === 'bravo' ? 22 : mood === 'debochado' ? -8 : 4;
	return (
		<g>
			{eyes.map((x, i) => (
				<g key={x}>
					<g transform={`translate(${x} 200) scale(1 ${open})`}>
						<ellipse rx={24} ry={28} fill="#fff" stroke={OUTLINE} strokeWidth={5} vectorEffect="non-scaling-stroke" />
						<circle cx={look * 8} cy={4} r={12} fill={OUTLINE} />
						<circle cx={look * 8 - 4} cy={-1} r={4} fill="#fff" />
					</g>
					<line
						x1={x - 26}
						y1={160}
						x2={x + 26}
						y2={160}
						transform={`rotate(${i === 0 ? browAngle : -browAngle} ${x} 160) translate(0 ${mood === 'debochado' && i === 0 ? -8 : 0})`}
						stroke={OUTLINE}
						strokeWidth={11}
						strokeLinecap="round"
					/>
				</g>
			))}
			{mood === 'bravo' ? (
				<path d="M 108 270 Q 150 240 192 270 Q 150 258 108 270 Z" fill={OUTLINE} stroke={OUTLINE} strokeWidth={6} strokeLinejoin="round" />
			) : mood === 'debochado' ? (
				<path d="M 110 258 Q 150 276 196 246" fill="none" stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
			) : (
				<line x1={122} y1={262} x2={178} y2={262} stroke={OUTLINE} strokeWidth={7} strokeLinecap="round" />
			)}
		</g>
	);
};

export const Bill: React.FC<{
	icon?: BillIcon;
	mood?: BillMood;
	x: number;
	y: number;
	width?: number;
	scale?: number;
	rotate?: number;
	blink?: number;
	look?: number;
	opacity?: number;
	label?: string;
}> = ({icon = 'boleto', mood = 'bravo', x, y, width = 300, scale = 1, rotate = 0, blink = 0, look = 0, opacity = 1, label}) => {
	if (scale <= 0 || opacity <= 0) return null;
	const accent = accents[icon];
	return (
		<svg
			viewBox="-10 -10 320 420"
			width={width * (320 / 300)}
			height={width * (420 / 300)}
			style={{
				position: 'absolute',
				left: x,
				top: y,
				translate: '-50% -50%',
				scale: String(scale),
				rotate: `${rotate}deg`,
				opacity,
				overflow: 'visible',
			}}
		>
			<rect x={8} y={14} width={292} height={392} rx={18} fill="#000" opacity={0.18} />
			<rect x={0} y={0} width={290} height={390} rx={18} fill="#FBF6E9" {...outlined} strokeWidth={7} />
			<rect x={0} y={0} width={290} height={64} rx={16} fill={accent} {...outlined} strokeWidth={7} />
			<text x={145} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={(label ?? labels[icon]).length > 6 ? 30 : 38} fill="#fff" stroke={OUTLINE} strokeWidth={6} paintOrder="stroke">
				{label ?? labels[icon]}
			</text>
			{/* ícone da conta nos dois cantos do cabeçalho */}
			<g transform="translate(-24 -12) scale(0.4)"><Icon icon={icon} /></g>
			<g transform="translate(194 -12) scale(0.4)"><Icon icon={icon} /></g>
			<Face mood={mood} blink={blink} look={look} />
			{/* código de barras */}
			{Array.from({length: 24}, (_, i) => (
				<rect key={i} x={36 + i * 9.4} y={318} width={i % 3 === 0 ? 6 : 3} height={48} fill={OUTLINE} />
			))}
		</svg>
	);
};
