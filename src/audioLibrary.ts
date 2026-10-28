import { audio } from "./theme";

// Sons gerados localmente (scripts/gerar-sons.sh). Nenhum arquivo de terceiros.
// file: null = marcador sem som (ex.: "silencio_1s").
export const SFX: Record<string, { file: string | null; loop: boolean; volume: number }> = {
  silencio_1s: { file: null, loop: false, volume: 0 },
  estalo: { file: "audio/sfx/estalo.wav", loop: false, volume: audio.sfxVolume * 1.4 },
  recreio: { file: "audio/sfx/recreio.wav", loop: true, volume: audio.sfxVolume * 0.45 },
  grilo: { file: "audio/sfx/grilo.wav", loop: true, volume: audio.sfxVolume * 0.5 },
  tique_taque: { file: "audio/sfx/tique_taque.wav", loop: true, volume: audio.sfxVolume * 0.55 },
  queda_graves: { file: "audio/sfx/queda_graves.wav", loop: false, volume: audio.sfxVolume * 1.2 },
  vento_frio: { file: "audio/sfx/vento_frio.wav", loop: true, volume: audio.sfxVolume * 0.55 },
};

export const MUSIC: Record<string, string> = {
  base_suave: "audio/music/base_suave.wav",
  suspensa_sem_batida: "audio/music/suspensa_sem_batida.wav",
};
