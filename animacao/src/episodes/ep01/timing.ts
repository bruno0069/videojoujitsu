import palavras from './palavras.json';

// Linha do tempo do EP01, tirada da narração aprovada (narracao_completa.wav, 91,21 s)
// e da transcrição palavra a palavra (ElevenLabs Scribe). Tudo em SEGUNDOS da narração.

export const FPS = 30;
export const NARRATION_END = 91.21;
/** Cartela final segura um pouco depois da última palavra. */
export const EPISODE_END = 92.6;
export const DURATION_IN_FRAMES = Math.round(EPISODE_END * FPS);

export const sec = (s: number) => Math.round(s * FPS);

export type Word = {text: string; start: number; end: number};

// Correções de grafia da transcrição (a fala não muda, só a legenda).
const fixes: Record<string, string> = {
	'jiu-jitsu,': 'jiu-jítsu,',
	dona: 'Dona',
};

export const words: Word[] = (palavras as {text: string; start: number; end: number}[]).map((w) => ({
	text: fixes[w.text] ?? w.text,
	start: w.start,
	end: w.end,
}));

/**
 * Cenas: cortes posicionados nos silêncios entre as falas
 * (ver 02_DOCUMENTACAO/relatorio_de_duracao.txt).
 */
export const scenes = [
	{id: 'cena1', start: 0, end: 8.6, title: 'O verdadeiro adversário'},
	{id: 'cena2', start: 8.6, end: 23.05, title: 'O sonho do garoto'},
	{id: 'cena3', start: 23.05, end: 36.25, title: 'A realidade bate à porta'},
	{id: 'cena4', start: 36.25, end: 47.15, title: 'O cálculo impossível'},
	{id: 'cena5', start: 47.15, end: 61.8, title: 'Dois convites, um problema'},
	{id: 'cena6', start: 61.8, end: 74.6, title: 'O golpe final'},
	{id: 'cena7', start: 74.6, end: EPISODE_END, title: 'Você decide!'},
] as const;

/** Palavras com destaque permanente na legenda. */
export const keywords = new Set(
	[
		'boleto.',
		'boletos?',
		'campeão,',
		'patrocinadores.',
		'energético',
		'temporada.',
		'luz,',
		'água',
		'internet.',
		'mata-leão.',
		'mata-leão',
		'negativo',
		'fetal.',
		'cinturão,',
		'cinturão',
		'salário.',
		'salário',
		'pão',
		'francês.',
		'banco',
		'A,',
		'B,',
		'A',
		'B',
	].map((w) => w.toLowerCase()),
);

/** Agrupa as palavras em blocos curtos de legenda (até 3 palavras, quebra em pontuação e pausas). */
export const captionGroups = (() => {
	const groups: Word[][] = [];
	let cur: Word[] = [];
	words.forEach((w, i) => {
		cur.push(w);
		const next = words[i + 1];
		const punct = /[.,:?!]$/.test(w.text);
		const gap = next ? next.start - w.end : 99;
		if (cur.length >= 3 || punct || gap > 0.3) {
			groups.push(cur);
			cur = [];
		}
	});
	if (cur.length) groups.push(cur);
	return groups;
})();
