import React from 'react';
import {AbsoluteFill} from 'remotion';
import {OUTLINE} from '../../characters/shared/style';
import {FONT} from '../../fonts';

// Academia do projeto social: parede clara, protetores azuis e tatame em perspectiva.
const W = 1080;
const H = 1920;
const FLOOR_Y = 1180;
const VANISH = {x: 540, y: 560};

const floorRows = [FLOOR_Y, 1250, 1345, 1475, 1650, 1890];

export const Tatame: React.FC = () => {
	const cols = [];
	for (let i = -7; i <= 7; i++) {
		const bottomX = VANISH.x + i * 330;
		const k = (FLOOR_Y - VANISH.y) / (H - VANISH.y);
		const topX = VANISH.x + i * 330 * k;
		cols.push(<line key={i} x1={topX} y1={FLOOR_Y} x2={bottomX} y2={H} stroke="#23519C" strokeWidth={6} />);
	}

	return (
		<AbsoluteFill>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				{/* parede */}
				<rect width={W} height={FLOOR_Y} fill="#E7ECF0" />
				<rect y={0} width={W} height={90} fill="#D5DDE4" />
				{/* placa */}
				<g transform="translate(540 440)">
					<rect x={-300} y={-95} width={600} height={190} rx={22} fill="#F7F5EF" stroke={OUTLINE} strokeWidth={8} />
					<text
						textAnchor="middle"
						y={-8}
						fontFamily={FONT}
						fontWeight={900}
						fontSize={66}
						fill="#24418F"
					>
						PROJETO
					</text>
					<text
						textAnchor="middle"
						y={62}
						fontFamily={FONT}
						fontWeight={900}
						fontSize={66}
						fill="#24418F"
					>
						SOCIAL
					</text>
				</g>
				{/* ganchos com faixas penduradas */}
				{[
					{x: 140, c: '#F7F5EF'},
					{x: 220, c: '#24418F'},
					{x: 860, c: '#7A3FA0'},
					{x: 940, c: '#1E1E1E'},
				].map(({x, c}) => (
					<g key={x}>
						<circle cx={x} cy={640} r={9} fill={OUTLINE} />
						<path d={`M ${x - 18} 760 L ${x} 640 L ${x + 18} 760`} fill="none" stroke={OUTLINE} strokeWidth={22} strokeLinejoin="round" />
						<path d={`M ${x - 18} 760 L ${x} 640 L ${x + 18} 760`} fill="none" stroke={c} strokeWidth={13} strokeLinejoin="round" />
					</g>
				))}
				{/* protetores azuis na parede */}
				<rect y={930} width={W} height={FLOOR_Y - 930} fill="#2C4E8A" />
				{Array.from({length: 7}, (_, i) => (
					<line key={i} x1={i * 180 + 90} y1={930} x2={i * 180 + 90} y2={FLOOR_Y} stroke="#203B6C" strokeWidth={6} />
				))}
				<rect y={922} width={W} height={10} fill={OUTLINE} />
				{/* tatame */}
				<rect y={FLOOR_Y} width={W} height={H - FLOOR_Y} fill="#2F63B5" />
				{cols}
				{floorRows.map((y) => (
					<line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#23519C" strokeWidth={6} />
				))}
				<rect y={FLOOR_Y - 5} width={W} height={10} fill={OUTLINE} />
				{/* vinheta leve */}
				<defs>
					<radialGradient id="vinheta" cx="50%" cy="55%" r="75%">
						<stop offset="60%" stopColor="#000" stopOpacity={0} />
						<stop offset="100%" stopColor="#000" stopOpacity={0.28} />
					</radialGradient>
				</defs>
				<rect width={W} height={H} fill="url(#vinheta)" />
			</svg>
		</AbsoluteFill>
	);
};
