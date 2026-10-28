import { loadFont } from "@remotion/google-fonts/Baloo2";
import { interpolateColors } from "remotion";

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
  // Fundo do inserto do pão (creme com raios em coral claro)
  coralClaro: "#FFB7A6",
} as const;

// Paleta noturna desenhada (substitui o escurecimento por película). Cada cor do pátio vai
// do dia para a sua versão noturna; a pele do Nico fica mais quente e escura, sem dessaturar.
// O frio aparece no bafo saindo da boca (ação "frio"), não em manchas no rosto.
export const night = {
  ceuAlto: "#1B1B2F",
  ceuBaixo: "#3B2F6B",
  predio: "#433A7A",
  predioTelhado: "#B8574F",
  janela: colors.amarelo, // luzes acesas
  muro: "#55478F",
  muroSombra: "#463A78",
  folha: "#2C6F6A",
  chao: "#4A4466",
  chaoSombra: "#3E3858",
  banco: "#C9584B",
  pele: "#B07A55",
  rimLight: colors.turquesa,
};

// Sombra chapada de um tom: a mesma cor puxada 18% para a tinta
export const sombra = (c: string) => interpolateColors(0.18, [0, 1], [c, colors.tinta]);

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
// Faixa fixa entre 68% e 76% da altura (y 1306–1459). Nenhum rosto atravessa essa faixa:
// nos closes o queixo fica acima dela (shots.close.chinY).
export const captions = {
  centerY: 1382,
  fontSize: 78,
  lineHeight: 0.98,
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
  boxColor: colors.tinta,
  textColor: colors.creme,
  borderColor: colors.tinta,
  innerLine: colors.creme, // filete interno: a caixa tinta continua legível sobre a noite
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

// Rótulo de informação (diagramas, termômetro): mesma caixa tinta do texto na tela
export const infoLabel = { fontSize: 64, paddingX: 30, paddingY: 12, radius: 22 };

// Enquadramentos: posição dos pés do personagem principal e escala (px por unidade do rig).
// Close: o queixo fica em chinY (acima da faixa da legenda) e o zoom cresce a partir dele.
// Médio e aberto: pés no terço inferior (y 1560), sem faixa de chão vazio maior que 20%.
export const shots = {
  close: { x: 420, chinY: 1285, scale: 1.55 },
  plano_medio: { x: 430, y: 1560, scale: 1.0, duo: { xs: [290, 800], scale: 0.92 } },
  aberto: { y: 1560, scale: 0.72, xs: [330, 760] },
  inserto_pequeno: { x: 210, y: 1280, scale: 0.4 },
} as const;

// Posição do Sol no céu (repetida no gancho e na janela da sala para fechar o loop)
export const sun = { x: 930, y: 590, r: 95 };

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
  // Duck de música e efeitos guiado pelas palavras: nível baixo durante a fala, nível base
  // nas pausas maiores que 0,4 s, rampas de 6 frames. A distância final voz/fundo é
  // acertada na mixagem dos stems (scripts/mixar.sh).
  duckGain: 0.6, // -4,4 dB sob a fala
  duckAttackFrames: 6,
  duckReleaseFrames: 6,
  duckGapMs: 400, // pausas menores que isso contam como fala contínua
};
