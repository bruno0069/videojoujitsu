// Tipos compartilhados por todos os personagens da série.
// Um personagem é um "boneco" SVG: ele não sabe nada de tempo/frames,
// apenas desenha o estado que recebe por props. Quem anima é a cena.

/** Parâmetros contínuos do rosto — podem ser interpolados entre expressões. */
export type FaceParams = {
	/** Abertura dos olhos (1 = normal, <1 semicerrado, >1 arregalado). */
	eyeOpen: number;
	/** Tamanho da pupila/íris (1 = normal). */
	pupil: number;
	/** Quanto as sobrancelhas sobem, em unidades do SVG. */
	browRaise: number;
	/** Inclinação das sobrancelhas em graus: + ponta interna sobe (preocupado), − desce (bravo/confiante). */
	browInner: number;
	/** Diferença de altura entre as sobrancelhas (charme / ironia). */
	browAsym: number;
	/** Largura da boca. */
	mouthWidth: number;
	/** −1 (tristeza) … 1 (sorriso). */
	mouthSmile: number;
	/** 0 (fechada) … 1 (bem aberta). */
	mouthOpen: number;
	/** −1 … 1: levanta um dos cantos da boca (sorriso de canto). */
	mouthSmirk: number;
};

/** Ângulos de um braço em graus. 0/0 = braço solto ao lado do corpo. */
export type ArmAngles = {
	/** Rotação no ombro. Positivo abre o braço para fora/para cima. */
	shoulder: number;
	/** Rotação no cotovelo, relativa ao braço. Negativo dobra o antebraço para dentro. */
	elbow: number;
};

export type Gaze = {x: number; y: number};
