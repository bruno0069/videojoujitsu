import React from 'react';
import {outlined, OUTLINE} from '../shared/style';
import {Person, type PersonLook, type PersonProps} from './Person';

// Personagens secundários do EP01, baseados na folha de modelo da série.

const torsoPath =
	'M 120 336 Q 122 310 160 304 L 240 304 Q 278 310 280 336 L 286 520 Q 290 700 300 800 L 100 800 Q 110 700 114 520 Z';

/* ---------------- Dona Marlene: mãe do Caio ---------------- */
const marlene: PersonLook = {
	skin: '#A85E35',
	skinShade: '#8C4A27',
	sleeve: '#F4F1EA',
	sleeveShade: '#D9D4C8',
	faceWidth: 0.96,
	hairBack: (
		<g>
			<circle cx={200} cy={78} r={40} fill="#181514" {...outlined} />
			<ellipse cx={200} cy={168} rx={102} ry={86} fill="#181514" {...outlined} />
		</g>
	),
	hairFront: (
		<g>
			<path d="M 116 176 Q 122 112 200 108 Q 278 112 284 176 Q 250 140 200 140 Q 150 140 116 176 Z" fill="#181514" {...outlined} strokeWidth={4} />
			{/* faixa branca */}
			<path d="M 112 150 Q 200 96 288 150" fill="none" stroke={OUTLINE} strokeWidth={22} strokeLinecap="round" />
			<path d="M 112 150 Q 200 96 288 150" fill="none" stroke="#F4F1EA" strokeWidth={13} strokeLinecap="round" />
		</g>
	),
	outfit: (
		<g>
			<path d={torsoPath} fill="#F4F1EA" {...outlined} />
			{/* avental cinza */}
			<path d="M 150 390 L 250 390 L 262 800 L 138 800 Z" fill="#4A4F57" {...outlined} />
			<path d="M 150 390 L 168 306 M 250 390 L 232 306" stroke="#4A4F57" strokeWidth={12} />
			<rect x={168} y={470} width={64} height={44} rx={6} fill="#5A606A" {...outlined} strokeWidth={4} />
		</g>
	),
	faceExtras: (
		<g>
			{/* cílios */}
			<path d="M 146 186 L 140 180 M 254 186 L 260 180" stroke={OUTLINE} strokeWidth={4} strokeLinecap="round" />
			{/* brincos */}
			<circle cx={116} cy={238} r={7} fill="#F7C21B" {...outlined} strokeWidth={3} />
			<circle cx={284} cy={238} r={7} fill="#F7C21B" {...outlined} strokeWidth={3} />
		</g>
	),
};

/* ---------------- Mestre Jorge: professor ---------------- */
const jorge: PersonLook = {
	skin: '#7A4A2E',
	skinShade: '#633A22',
	sleeve: '#1F1F22',
	sleeveShade: '#34343A',
	faceWidth: 1.06,
	hairBack: <ellipse cx={200} cy={170} rx={96} ry={66} fill="#1A1716" {...outlined} />,
	hairFront: (
		<path d="M 112 178 Q 116 116 200 112 Q 284 116 288 178 Q 270 142 200 138 Q 130 142 112 178 Z" fill="#2A2523" {...outlined} strokeWidth={4} />
	),
	outfit: (
		<g>
			<path d={torsoPath} fill="#1F1F22" {...outlined} />
			<path d="M 176 306 L 224 306 L 200 380 Z" fill="#F4F1EA" />
			<path d="M 160 304 L 180 304 L 236 800 L 210 800 Z" fill="#2C2C31" {...outlined} />
			<path d="M 240 304 L 220 304 L 170 560 L 192 560 Z" fill="#2C2C31" {...outlined} />
			{/* emblema da academia */}
			<circle cx={252} cy={420} r={22} fill="#C9930A" {...outlined} strokeWidth={4} />
			<circle cx={252} cy={420} r={10} fill="#D62828" />
			{/* faixa preta */}
			<rect x={108} y={600} width={190} height={30} rx={6} fill="#0E0E0E" {...outlined} />
		</g>
	),
	faceExtras: (
		<g>
			{/* barba grisalha */}
			<path
				d="M 118 220 Q 122 304 200 308 Q 278 304 282 220 Q 268 262 240 276 Q 236 290 200 292 Q 164 290 160 276 Q 132 262 118 220 Z"
				fill="#B9B4AE"
				{...outlined}
				strokeWidth={4}
			/>
			<path d="M 166 248 Q 200 232 234 248 Q 200 252 166 248 Z" fill="#B9B4AE" {...outlined} strokeWidth={3} />
		</g>
	),
};

/* ---------------- Seu Aldo: dono da padaria ---------------- */
const aldo: PersonLook = {
	skin: '#E2AE84',
	skinShade: '#C98F62',
	sleeve: '#F4F1EA',
	sleeveShade: '#D9D4C8',
	faceWidth: 1.08,
	hairBack: <ellipse cx={200} cy={186} rx={98} ry={56} fill="#3A2A20" {...outlined} />,
	hairFront: (
		<g>
			{/* chapéu de padeiro */}
			<path d="M 118 150 L 282 150 L 278 104 L 122 104 Z" fill="#FFFFFF" {...outlined} />
			<circle cx={150} cy={78} r={42} fill="#FFFFFF" {...outlined} />
			<circle cx={250} cy={78} r={42} fill="#FFFFFF" {...outlined} />
			<circle cx={200} cy={58} r={52} fill="#FFFFFF" {...outlined} />
			<path d="M 124 106 L 276 106" stroke="#FFFFFF" strokeWidth={14} />
		</g>
	),
	outfit: (
		<g>
			<path d={torsoPath} fill="#F4F1EA" {...outlined} />
			<path d="M 140 400 L 260 400 L 274 800 L 126 800 Z" fill="#2B2B2B" {...outlined} />
			<path d="M 140 400 L 166 306 M 260 400 L 234 306" stroke="#2B2B2B" strokeWidth={12} />
		</g>
	),
	faceExtras: (
		<g>
			{/* bigodão */}
			<path
				d="M 200 246 Q 176 230 150 246 Q 132 258 124 246 Q 134 274 168 262 Q 190 256 200 252 Q 210 256 232 262 Q 266 274 276 246 Q 268 258 250 246 Q 224 230 200 246 Z"
				fill="#1E1714"
				{...outlined}
				strokeWidth={4}
			/>
			<ellipse cx={150} cy={238} rx={14} ry={8} fill="#E88A7A" opacity={0.6} />
			<ellipse cx={250} cy={238} rx={14} ry={8} fill="#E88A7A" opacity={0.6} />
		</g>
	),
};

export const Marlene: React.FC<PersonProps> = (p) => <Person look={marlene} {...p} />;
export const MestreJorge: React.FC<PersonProps> = (p) => <Person look={jorge} {...p} />;
export const SeuAldo: React.FC<PersonProps> = (p) => <Person look={aldo} {...p} />;
