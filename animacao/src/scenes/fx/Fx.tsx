import React from 'react';
import {AbsoluteFill} from 'remotion';
import {OUTLINE} from '../../characters/shared/style';
import {FONT} from '../../fonts';

// Efeitos visuais reutilizáveis (linguagem de desenho animado).

/** Raios de fundo ("sunburst") — fundo de impacto/destaque. */
export const Burst: React.FC<{c1: string; c2: string; rotation?: number; cx?: number; cy?: number; rays?: number}> = ({
	c1,
	c2,
	rotation = 0,
	cx = 540,
	cy = 860,
	rays = 18,
}) => {
	const R = 2600;
	const step = 360 / rays;
	return (
		<AbsoluteFill style={{backgroundColor: c1}}>
			<svg width={1080} height={1920}>
				<g transform={`translate(${cx} ${cy}) rotate(${rotation})`}>
					{Array.from({length: rays}, (_, i) => {
						const a0 = ((i * step) * Math.PI) / 180;
						const a1 = ((i * step + step / 2) * Math.PI) / 180;
						return (
							<path
								key={i}
								d={`M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`}
								fill={c2}
							/>
						);
					})}
				</g>
			</svg>
		</AbsoluteFill>
	);
};

/** Texto de quadrinho (onomatopeia / rótulo) com contorno grosso. */
export const ComicText: React.FC<{
	text: string;
	x: number;
	y: number;
	size?: number;
	color?: string;
	scale?: number;
	rotate?: number;
	opacity?: number;
	stroke?: string;
	strokeWidth?: number;
	font?: string;
}> = ({
	text,
	x,
	y,
	size = 120,
	color = '#F7C21B',
	scale = 1,
	rotate = 0,
	opacity = 1,
	stroke = OUTLINE,
	strokeWidth,
	font = FONT,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			translate: '-50% -50%',
			scale: String(scale),
			rotate: `${rotate}deg`,
			opacity,
			fontFamily: font,
			fontWeight: 900,
			fontSize: size,
			lineHeight: 1,
			color,
			whiteSpace: 'pre',
			textAlign: 'center',
			WebkitTextStroke: `${strokeWidth ?? size * 0.14}px ${stroke}`,
			paintOrder: 'stroke fill',
			letterSpacing: size * 0.01,
		}}
	>
		{text}
	</div>
);

/** Clarão branco (flash de câmera, impacto). */
export const Flash: React.FC<{amount: number; color?: string}> = ({amount, color = '#fff'}) =>
	amount <= 0 ? null : <AbsoluteFill style={{backgroundColor: color, opacity: amount}} />;

/** Linhas de velocidade radiais — reforçam um zoom/susto. */
export const SpeedLines: React.FC<{opacity: number; cx?: number; cy?: number; color?: string; seed?: number}> = ({
	opacity,
	cx = 540,
	cy = 860,
	color = '#ffffff',
	seed = 0,
}) => {
	if (opacity <= 0) return null;
	const n = 44;
	return (
		<AbsoluteFill style={{opacity}}>
			<svg width={1080} height={1920}>
				{Array.from({length: n}, (_, i) => {
					const a = (i / n) * Math.PI * 2 + seed;
					const r0 = 520 + ((i * 97) % 5) * 70;
					const w = 8 + ((i * 31) % 4) * 6;
					const x0 = cx + Math.cos(a) * r0;
					const y0 = cy + Math.sin(a) * r0 * 1.4;
					const x1 = cx + Math.cos(a) * 2200;
					const y1 = cy + Math.sin(a) * 2200 * 1.4;
					return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={color} strokeWidth={w} strokeLinecap="round" />;
				})}
			</svg>
		</AbsoluteFill>
	);
};

/** Iluminação de cena: luz principal suave + vinheta. Dá volume sem mudar o traço. */
export const Lighting: React.FC<{
	light?: string;
	lightX?: string;
	lightY?: string;
	vignette?: number;
	tint?: string;
	tintOpacity?: number;
}> = ({light = 'rgba(255,240,210,0.28)', lightX = '35%', lightY = '22%', vignette = 0.35, tint, tintOpacity = 0}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		<AbsoluteFill
			style={{background: `radial-gradient(ellipse at ${lightX} ${lightY}, ${light} 0%, rgba(0,0,0,0) 55%)`}}
		/>
		{tint && tintOpacity > 0 ? <AbsoluteFill style={{backgroundColor: tint, opacity: tintOpacity, mixBlendMode: 'multiply'}} /> : null}
		<AbsoluteFill
			style={{background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`}}
		/>
	</AbsoluteFill>
);

/** Transição em círculo (íris): revela o conteúdo a partir de um ponto. progress 0 → 1. */
export const Iris: React.FC<{progress: number; x?: number; y?: number; children: React.ReactNode}> = ({
	progress,
	x = 540,
	y = 860,
	children,
}) => (
	<AbsoluteFill style={{clipPath: `circle(${progress * 2300}px at ${x}px ${y}px)`}}>{children}</AbsoluteFill>
);

/** Carimbo inclinado (VENCIDO, RECUSADO…). */
export const Stamp: React.FC<{text: string; x: number; y: number; scale: number; rotate?: number; color?: string; size?: number}> = ({
	text,
	x,
	y,
	scale,
	rotate = -14,
	color = '#D62828',
	size = 96,
}) =>
	scale <= 0 ? null : (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				translate: '-50% -50%',
				scale: String(scale),
				rotate: `${rotate}deg`,
				border: `${size * 0.12}px solid ${color}`,
				borderRadius: size * 0.18,
				padding: `${size * 0.12}px ${size * 0.3}px`,
				color,
				fontFamily: FONT,
				fontWeight: 900,
				fontSize: size,
				lineHeight: 1,
				background: 'rgba(255,255,255,0.85)',
				whiteSpace: 'pre',
				textAlign: 'center',
			}}
		>
			{text}
		</div>
	);
