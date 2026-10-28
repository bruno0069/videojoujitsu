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
  centerY: 1380, // centro do bloco de legenda (terço central-inferior)
  fontSize: 78,
  lineHeight: 1.12,
  maxLines: 2,
  textColor: colors.creme,
  activeColor: colors.amarelo,
  strokeColor: colors.tinta,
  // Agrupamento das palavras em "páginas"
  combineWithinMs: 1100,
  // Folga no começo e no fim de cada cena quando o tempo é estimado
  leadFrames: 4,
  tailFrames: 8,
};

// Texto na tela (caixa)
export const onScreenText = {
  top: 210,
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

// Enquadramentos: posição dos pés do personagem principal e escala (px por unidade do rig)
export const shots = {
  close: { x: 420, y: 2225, scale: 1.55 },
  plano_medio: { x: 540, y: 1520, scale: 0.8 },
  plano_aberto: { x: 175, y: 1190, scale: 0.3 },
} as const;

// Posição do Sol no céu (repetida no gancho e na janela da sala para fechar o loop)
export const sun = { x: 860, y: 630, r: 95 };

export const audio = {
  narrationVolume: 1,
  musicVolume: 0.12,
  sfxVolume: 0.5,
};
