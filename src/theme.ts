import { loadFont } from "@remotion/google-fonts/Baloo2";

// Identidade visual v1 (aprovada). Tudo que é cor, fonte ou medida fica aqui.

const { fontFamily } = loadFont("normal", {
  weights: ["800"],
  subsets: ["latin", "latin-ext"],
});

export const colors = {
  tinta: "#1B1B2F",
  creme: "#FFF6E5",
  ceu: "#6EC3F4",
  pele: "#D9A074",
  coral: "#FF6B57",
  amarelo: "#FFD23F",
  noite: "#3B2F6B",
  turquesa: "#3FC1A5",
  // Derivados (mesma família, só para planos de profundidade e a noite final)
  noiteEscura: "#1E1838",
  ceuMeio: "#5479B0", // passo intermediário céu -> noite na virada
  chao: "#E8C99A",
  chaoSombra: "#D2B07E",
  muro: "#F2A65A",
  muroSombra: "#D98C45",
  folha: "#3FC1A5",
  folhaSombra: "#2E9C84",
  calca: "#3B2F6B",
  cabelo: "#1B1B2F",
  branco: "#FFFFFF",
} as const;

export const fonts = {
  main: `${fontFamily}, "DejaVu Sans", sans-serif`,
  weight: 800,
};

export const ink = {
  // Contorno de tinta em pixels de tela (composição de 1080 px de largura)
  stroke: 16,
  textStroke: 14,
};

export const layout = {
  width: 1080,
  height: 1920,
  sideMargin: 90,
};

// Legenda palavra por palavra
export const captions = {
  centerY: 1380, // centro do bloco; o bloco termina em ~1474, fora dos 18% inferiores (y > 1574)
  fontSize: 84,
  lineHeight: 1.12,
  maxLines: 2,
  wordsPerPage: 3,
  stroke: 20, // contorno da legenda (mais grosso que o do texto na tela)
  holdMs: 200, // quanto a página fica depois da última palavra
  textColor: colors.creme,
  activeColor: colors.amarelo,
  strokeColor: colors.tinta,
  // Folga no começo e no fim de cada cena quando o tempo é estimado
  leadFrames: 4,
  tailFrames: 8,
};

// Texto na tela (caixa)
export const onScreenText = {
  top: 240,
  maxFontSize: 84,
  minFontSize: 52,
  paddingX: 40,
  paddingY: 18,
  boxColor: colors.noite,
  textColor: colors.creme,
  borderColor: colors.tinta,
  highlightColor: colors.amarelo,
  radius: 28,
  maxWidth: 1080 - 2 * 90,
};

// Sticker da chamada final (CTA)
export const sticker = {
  centerY: 300, // acima da cabeça do Nico no close final, longe do rosto e da legenda
  fontSize: 82,
  maxWidth: 1000,
  paddingX: 34,
  paddingY: 22,
  radius: 34,
  rotate: -3,
  boxColor: colors.coral,
};

// Enquadramentos: posição dos pés do personagem principal e escala (px por unidade do rig)
export const shots = {
  close: { x: 420, y: 2225, scale: 1.55 },
  plano_medio: { x: 540, y: 1520, scale: 0.8 },
  aberto: { y: 1450, scale: 0.6, xs: [340, 740] },
  inserto_pequeno: { x: 210, y: 1280, scale: 0.4 },
} as const;

// Posição do Sol no céu (repetida no gancho e na janela da sala para fechar o loop)
export const sun = { x: 860, y: 630, r: 95 };

// Elementos fixos na tela
export const hud = {
  timer: { x: 220, y: 160, scale: 0.6 }, // canto superior esquerdo (dígitos de 84 px)
  timerBig: { x: 540, y: 400, scale: 1.25 }, // timer em close, bem acima do cabelo do Nico
};

// Animação ociosa em ciclos inteiros por episódio. O relógio fecha no último frame
// (duração - 1), então o último quadro sai idêntico ao frame 0.
export const idle = {
  blinkCycles: 24, // piscar a cada ~2,5 s
  breathCycles: 20, // respirar a cada ~3 s
  sunTurns: 2, // o Sol gira 2 x 36° (simetria dos raios) por episódio
};

// Fração do ciclo (0..1) de algo que se repete `cycles` vezes por episódio
export const loopPhase = (globalFrame: number, cycles: number, loopFrames: number) => {
  const x = (globalFrame / loopFrames) * cycles;
  return x - Math.floor(x);
};

export const audio = {
  narrationVolume: 0.7, // folga para a soma não clipar; a masterização leva o mix a -14 LUFS
  musicVolume: 0.22,
  sfxVolume: 0.5,
  // Duck de música e efeitos sob a voz: -10 dB, com ataque e soltura curtos
  duckGain: 0.316,
  duckAttackFrames: 4,
  duckReleaseFrames: 10,
  duckGapMs: 350, // pausas menores que isso contam como fala contínua
};
