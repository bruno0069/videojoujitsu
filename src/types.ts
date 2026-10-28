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

export type ElementSpec =
  | { type: "sol"; some?: Cue; flash?: boolean; x?: number; y?: number }
  | { type: "lua"; aparece: Cue; apaga: Cue }
  | { type: "balao"; texto: string; de: Cue; ate: Cue; personagem?: string }
  | { type: "inserto"; objeto: "pao_de_queijo"; de: Cue; ate: Cue }
  | { type: "relogio"; inicio: string; fim: string; de?: Cue; ate?: Cue }
  | { type: "termometro"; de: Cue; ate: Cue };

export type CharacterKey = {
  de: Cue;
  pose?: string;
  expressao?: string;
  segurando?: string | null;
  acao?: string | null;
  visivel?: boolean;
};

export type SceneDirection = {
  elementos?: ElementSpec[];
  personagens?: Record<string, CharacterKey[]>;
  sfx?: Record<string, Cue>;
  fundo?: Record<string, Cue | Cue[]>;
  cortes?: Cue[];
  camera?: { inicio?: "base" | "punch"; fim?: "base" };
  texto?: { de?: Cue; animar?: boolean };
};

export type Direction = {
  cenas: Record<string, SceneDirection>;
};
