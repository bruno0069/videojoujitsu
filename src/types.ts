// Formato do arquivo de episódio (src/episodes/epNN.json)

export type SceneCharacter = {
  id: string;
  pose: string;
  expression: string;
  scale?: string;
};

export type Scene = {
  id: string;
  startFrame: number;
  durationInFrames: number;
  narration: string;
  onScreenText: string;
  visual: {
    background: string;
    characters: SceneCharacter[];
    camera: string;
    action: string;
  };
  sfx: string[];
  music: string | null;
};

export type EpisodeData = {
  episode: number;
  title: string;
  fps: number;
  width: number;
  height: number;
  totalFrames: number;
  scenes: Scene[];
};

// Formato do arquivo de direção (src/episodes/epNN.direcao.json), opcional.
// Um "Cue" é um momento dentro da cena: número de frames desde o início da cena
// ou uma palavra da narração ("quente", "continua#2", "agora?+4", "lanche$-6").
// "#n" escolhe a n-ésima ocorrência, "$" usa o fim da palavra, "+n"/"-n" desloca em frames.
export type Cue = number | string;

// Janela de visibilidade comum a todos os elementos (frames ou cues da cena)
type Window = { de?: Cue; ate?: Cue };

export type ElementSpec =
  | ({ type: "sol"; some?: Cue; encolhe?: number; flash?: boolean; x?: number; y?: number } & Window)
  | ({ type: "lua"; aparece: Cue; pisca?: Cue; apaga: Cue } & Window)
  | ({ type: "balao"; texto: string; personagem?: string } & Window)
  | ({ type: "etiqueta"; texto: string; personagem: string } & Window)
  | ({ type: "inserto"; objeto: "pao_de_queijo" } & Window)
  | ({ type: "prova"; nota: string; notaEm: Cue } & Window)
  | ({ type: "termometro"; grande?: boolean } & Window)
  | ({ type: "escurecer"; max?: number } & Window)
  | ({ type: "relogio"; inicio: string; fim: string } & Window);

export type CharacterKey = {
  de: Cue;
  pose?: string;
  expressao?: string;
  segurando?: string | null;
  acao?: string | null;
  visivel?: boolean;
  olhar?: [number, number];
};

// Um plano dentro da cena. Troca de plano = corte seco.
export type Plano = {
  de: Cue;
  enquadramento: "close" | "medio" | "aberto" | "inserto_pequeno" | "ceu" | "inserto_pao";
  foco?: string; // personagem em foco (close e zoom)
  personagens?: { id: string; pose?: string; expressao?: string; segurando?: string | null; acao?: string | null }[];
  zoom?: [number, number]; // empurrão do começo ao fim do plano (1 = 100%)
  entrada?: "corte" | "punch";
  centralizar?: boolean; // o foco vai para o centro da tela
  cenario?: string; // troca o cenário só neste plano
};

export type SceneDirection = {
  planos?: Plano[];
  elementos?: ElementSpec[];
  personagens?: Record<string, CharacterKey[]>;
  sfx?: Record<string, Cue>;
  fundo?: Record<string, Cue | Cue[]>;
  tremidas?: { de: Cue; frames: number; forca: number }[];
  texto?: { de?: Cue; ate?: Cue; animar?: boolean; mostrar?: boolean; estilo?: "faixa" | "sticker" };
  // Congela a imagem da cena a partir deste frame (até o fim da cena)
  congelar?: number;
  // Pontos de sincronização para quando a voz entrar: a palavra deve cair neste frame da cena.
  sincronia?: { frame: number; palavra: string; evento: string }[];
};

export type Direction = {
  cenas: Record<string, SceneDirection>;
  // Elementos que atravessam cenas (frames absolutos do episódio)
  hud?: { type: "relogio"; inicio: string; fim: string; de: number; ate: number; grandeAte: number; zeroEm: number; travaEm?: number }[];
};
