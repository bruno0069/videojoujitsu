// Paleta do Caio, baseada na folha de modelo do personagem.
export const caioPalette = {
	skin: '#B9693D',
	skinShade: '#9A532D',
	hair: '#181514',
	hairCurl: '#3A3330',
	gi: '#F7F5EF',
	giShade: '#DCD7CC',
	patch: '#232323',
	undershirt: '#1E1E1E',
	belt: '#24418F',
	beltShade: '#1A2F6B',
	shoes: '#161616',
	sole: '#E9E9E9',
	eyeWhite: '#FFFFFF',
	iris: '#3B2314',
	pupil: '#0E0A08',
	mouth: '#5B1D1D',
	tongue: '#C9524E',
	teeth: '#FFFFFF',
};

export type CaioPalette = typeof caioPalette;

/** Cores de um kimono completo. O Caio usa o padrão; outros personagens trocam as cores. */
export type GiColors = {
	gi: string;
	giShade: string;
	undershirt: string;
	patch: string;
	skin: string;
	skinShade: string;
	belt: string;
	beltShade: string;
	/** Barra na ponta da faixa (ex.: barra vermelha da faixa preta). */
	beltTip?: string;
};

export const caioGi: GiColors = {
	gi: caioPalette.gi,
	giShade: caioPalette.giShade,
	undershirt: caioPalette.undershirt,
	patch: caioPalette.patch,
	skin: caioPalette.skin,
	skinShade: caioPalette.skinShade,
	belt: caioPalette.belt,
	beltShade: caioPalette.beltShade,
};
