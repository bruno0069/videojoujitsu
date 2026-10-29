import { audio } from "./theme";

// Sons gerados localmente (scripts/gerar-sons.sh). Nenhum arquivo de terceiros.
// file: null = marcador sem som (ex.: "silencio_1s").
// maxFrames: corta o efeito (com fade de 10 frames) depois desse tempo.
export const SFX: Record<string, { file: string | null; loop: boolean; volume: number; maxFrames?: number }> = {
  silencio_1s: { file: null, loop: false, volume: 0 },
  estalo: { file: "audio/sfx/estalo.wav", loop: false, volume: audio.sfxVolume * 1.4 },
  recreio: { file: "audio/sfx/recreio.wav", loop: true, volume: audio.sfxVolume * 0.45 },
  grilo: { file: "audio/sfx/grilo.wav", loop: true, volume: audio.sfxVolume * 0.5 },
  tique_taque: { file: "audio/sfx/tique_taque.wav", loop: true, volume: audio.sfxVolume * 0.55 },
  // Impacto grave da virada: -11 dB sobre a rodada 4 (0,21 -> 0,059), cabe inteiro na pausa
  // de ~1 s antes de "Aí o céu escurece" (cue negativo na direção = antes da cena).
  queda_graves: { file: "audio/sfx/queda_graves.wav", loop: false, volume: audio.sfxVolume * 0.118, maxFrames: 26 },
  // Transição curta (0,6 s) nas pausas da fala
  whoosh: { file: "audio/sfx/whoosh.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  // ep02
  giro_globo: { file: "audio/sfx/giro_globo.wav", loop: true, volume: audio.sfxVolume * 1.2 },
  sala_de_aula: { file: "audio/sfx/sala_de_aula.wav", loop: true, volume: audio.sfxVolume * 0.45 },
  vento_comeca: { file: "audio/sfx/vento_comeca.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  vento_forte: { file: "audio/sfx/vento_forte.wav", loop: true, volume: audio.sfxVolume * 0.5 },
  agua_avancando: { file: "audio/sfx/agua_avancando.wav", loop: false, volume: audio.sfxVolume * 0.45 },
  sopro_vento: { file: "audio/sfx/sopro_vento.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  deslize: { file: "audio/sfx/deslize.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  vento_frio: { file: "audio/sfx/vento_frio.wav", loop: true, volume: audio.sfxVolume * 0.55 },
};

// Versões com passa-altas em 120 Hz (scripts/gerar-sons.sh), para o grave não embolar com a voz
export const MUSIC: Record<string, string> = {
  base_suave: "audio/music/base_suave_hp120.wav",
  suspensa_sem_batida: "audio/music/suspensa_sem_batida_hp120.wav",
};
