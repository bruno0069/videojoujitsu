import React from 'react';
import {outlined} from '../../shared/style';
import {caioPalette as P} from '../palette';

// Cabelo cacheado montado com círculos ("cachos"). Fica em duas camadas:
// HairBack (volume atrás do rosto) e HairFront (franja sobre a testa).

type Curl = {x: number; y: number; r: number};

// Cachos ao redor do topo da cabeça — posições fixas para manter a silhueta estável.
const backCurls: Curl[] = (() => {
	const out: Curl[] = [];
	const n = 13;
	for (let i = 0; i < n; i++) {
		const a = Math.PI + (i / (n - 1)) * Math.PI; // 180° → 360°
		const r = i % 2 === 0 ? 31 : 27;
		out.push({x: 200 + Math.cos(a) * 100, y: 162 + Math.sin(a) * 76, r});
	}
	out.push({x: 104, y: 178, r: 26}, {x: 296, y: 178, r: 26});
	return out;
})();

const frontCurls: Curl[] = [
	{x: 128, y: 140, r: 21},
	{x: 152, y: 124, r: 22},
	{x: 178, y: 118, r: 22},
	{x: 204, y: 116, r: 23},
	{x: 230, y: 119, r: 22},
	{x: 254, y: 126, r: 21},
	{x: 274, y: 142, r: 20},
];

const curlMark = (c: Curl, i: number) => (
	<path
		key={`m${i}`}
		d={`M ${c.x - c.r * 0.45} ${c.y + c.r * 0.1} a ${c.r * 0.45} ${c.r * 0.4} 0 1 1 ${c.r * 0.7} ${c.r * 0.25}`}
		fill="none"
		stroke={P.hairCurl}
		strokeWidth={3.5}
		strokeLinecap="round"
	/>
);

export const HairBack: React.FC = () => (
	<g id="cabelo-tras">
		{/* contorno: círculos maiores em tom de contorno por baixo */}
		{backCurls.map((c, i) => (
			<circle key={`o${i}`} cx={c.x} cy={c.y} r={c.r + 2.5} fill={outlined.stroke} />
		))}
		<ellipse cx={200} cy={154} rx={96} ry={68} fill={P.hair} />
		{backCurls.map((c, i) => (
			<circle key={`c${i}`} cx={c.x} cy={c.y} r={c.r} fill={P.hair} />
		))}
		{backCurls.filter((_, i) => i % 2 === 1).map(curlMark)}
	</g>
);

export const HairFront: React.FC = () => (
	<g id="cabelo-frente">
		{frontCurls.map((c, i) => (
			<circle key={`c${i}`} cx={c.x} cy={c.y} r={c.r} fill={P.hair} {...outlined} strokeWidth={4} />
		))}
		{/* preenche as junções para não aparecer contorno entre os cachos */}
		<path d="M 128 132 Q 200 96 274 134 L 270 112 Q 200 70 132 110 Z" fill={P.hair} />
		{frontCurls.filter((_, i) => i % 2 === 0).map(curlMark)}
	</g>
);
