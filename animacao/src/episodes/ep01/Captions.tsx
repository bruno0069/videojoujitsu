import React from 'react';
import {spring} from 'remotion';
import {OUTLINE} from '../../characters/shared/style';
import {FONT} from '../../fonts';
import {captionGroups, FPS, keywords} from './timing';

/**
 * Legenda dinâmica palavra a palavra, sincronizada com a transcrição.
 * Fica na faixa inferior (acima da interface do TikTok/Reels) para não cobrir rostos.
 */
export const Captions: React.FC<{t: number; y?: number}> = ({t, y = 1450}) => {
	const idx = captionGroups.findIndex((g, i) => {
		const next = captionGroups[i + 1];
		const end = next ? Math.min(next[0].start, g[g.length - 1].end + 0.6) : g[g.length - 1].end + 0.8;
		return t >= g[0].start - 0.05 && t < end;
	});
	if (idx < 0) return null;
	const group = captionGroups[idx];
	const enter = spring({frame: (t - group[0].start + 0.05) * FPS, fps: FPS, config: {damping: 14, stiffness: 220}});

	return (
		<div
			style={{
				position: 'absolute',
				left: 50,
				right: 50,
				top: y,
				translate: '0 -50%',
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				gap: '4px 40px',
				scale: String(0.85 + enter * 0.15),
				opacity: Math.min(1, enter * 1.5),
			}}
		>
			{group.map((w) => {
				const active = t >= w.start - 0.03 && t < w.end + 0.08;
				const said = t >= w.start - 0.03;
				const key = keywords.has(w.text.toLowerCase());
				const color = active ? '#F7C21B' : key && said ? '#FF6B5B' : '#FFFFFF';
				return (
					<span
						key={`${w.start}`}
						style={{
							fontFamily: FONT,
							fontSize: 82,
							lineHeight: 1.12,
							color,
							WebkitTextStroke: `13px ${OUTLINE}`,
							paintOrder: 'stroke fill',
							textTransform: 'uppercase',
							display: 'inline-block',
							scale: active ? '1.1' : '1',
							translate: active ? '0 -6px' : '0 0',
							textShadow: '0 8px 0 rgba(0,0,0,0.35)',
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};
