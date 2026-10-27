import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Caio, caioExpressions, type ArmPoseName, type CaioExpression} from '../../characters/caio';
import {OUTLINE} from '../../characters/shared/style';
import {FONT} from '../../fonts';

// Folha de referência estática: as três expressões lado a lado.
// Útil para revisar mudanças no desenho sem assistir à animação inteira.
const items: {expression: CaioExpression; arms: ArmPoseName; label: string}[] = [
	{expression: 'confiante', arms: 'maosNaCintura', label: 'Confiante'},
	{expression: 'surpreso', arms: 'susto', label: 'Surpreso'},
	{expression: 'preocupado', arms: 'solto', label: 'Preocupado'},
];

export const CaioModelSheet: React.FC = () => (
	<AbsoluteFill style={{backgroundColor: '#F4F1EA'}}>
		{items.map((it, i) => (
			<React.Fragment key={it.expression}>
				<Caio x={320 + i * 640} y={960} scale={1.1} expression={caioExpressions[it.expression]} arms={it.arms} />
				<div
					style={{
						position: 'absolute',
						left: i * 640,
						width: 640,
						top: 990,
						textAlign: 'center',
						fontFamily: FONT,
						fontSize: 44,
						color: OUTLINE,
					}}
				>
					{it.label}
				</div>
			</React.Fragment>
		))}
	</AbsoluteFill>
);
