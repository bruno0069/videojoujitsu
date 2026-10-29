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
  | ({ type: "relogio"; inicio: string; fim: string } & Window)
  // Globo de mesa (na carteira de `personagem`): gira a `velocidade` graus por frame; `trava`
  // para com solavanco (e `flash`); `volta` volta a girar e chega no último frame do episódio
  // na mesma posição do frame 0 (fecha o loop).
  // `giro`: volta extra visível (`voltas`) entre `de` e `ate`, antes de travar
  | ({ type: "globo"; personagem?: string; velocidade?: number; trava?: Cue; volta?: Cue; flash?: boolean; giro?: { de: Cue; ate: Cue; voltas: number } } & Window)
  // Linhas de vento atravessando a tela (da esquerda para a direita); `papeis` = folhas voando
  | ({ type: "vento"; forca?: number; papeis?: boolean } & Window);

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
  enquadramento: "close" | "medio" | "aberto" | "inserto_pequeno" | "ceu" | "inserto_pao" | "raio_luz" | "diagrama_lua";
  foco?: string; // personagem em foco (close e zoom)
  personagens?: { id: string; pose?: string; expressao?: string; segurando?: string | null; acao?: string | null; x?: number; y?: number; escala?: number; soMesa?: boolean; espelhar?: boolean }[];
  zoom?: [number, number]; // empurrão do começo ao fim do plano (1 = 100%)
  entrada?: "corte" | "punch";
  centralizar?: boolean; // o foco vai para o centro da tela
  cenario?: string; // troca o cenário só neste plano
  // Desloca os personagens na horizontal entre `de` e `ate` (ex.: arrastado para fora do quadro)
  deslocar?: { x: number; de?: Cue; ate?: Cue };
};

export type SceneDirection = {
  planos?: Plano[];
  elementos?: ElementSpec[];
  personagens?: Record<string, CharacterKey[]>;
  // Frame de cada efeito do roteiro; com { de, ate } o efeito em loop para em `ate`
  sfx?: Record<string, Cue | { de: Cue; ate?: Cue }>;
  // Efeitos curtos extras (transições nas pausas da fala), além dos sfx do roteiro
  efeitos?: { id: string; de: Cue }[];
  fundo?: Record<string, Cue | Cue[]>;
  tremidas?: { de: Cue; frames: number; forca: number }[];
  // `topo`: altura da caixa (px), para não cobrir o cabelo num close
  texto?: { de?: Cue; ate?: Cue; animar?: boolean; mostrar?: boolean; estilo?: "faixa" | "sticker"; topo?: number };
  // Congela a imagem da cena a partir deste frame (até o fim da cena)
  congelar?: number;
  // Pontos de sincronização para quando a voz entrar: a palavra deve cair neste frame da cena.
  sincronia?: { frame: number; palavra: string; evento: string }[];
};

export type Direction = {
  cenas: Record<string, SceneDirection>;
  // Elementos que atravessam cenas (frames absolutos do episódio)
  hud?: {
    type: "relogio";
    inicio: string;
    fim: string;
    de: number;
    ate: number;
    grandeDe: number;
    grandeAte: number;
    seguraAte: number; // mostra o valor inicial parado até este frame; só então começa a contar
    zeroEm: number;
    travaEm?: number;
  }[];
  // Legenda sem ponto, vírgula e dois-pontos (a narração continua com a pontuação)
  legendaSemPontuacao?: boolean;
  // Mantém os limites de cena do roteiro mesmo quando uma fala passa um pouco do corte
  limitesFixos?: boolean;
  // Legenda só aparece a partir deste frame (antes disso, o título da capa ocupa a tela)
  legendaDe?: number;
  // O Sol "volta" depois do gancho: mostra um selo "agora" de 12 frames no início da cena seguinte
  sunReturnsAfterHook?: boolean;
};
