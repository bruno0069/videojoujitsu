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
  // ep05
  sala_ambiente: { file: "audio/sfx/sala_de_aula.wav", loop: true, volume: audio.sfxVolume * 0.45 },
  zumbido_leve: { file: "audio/sfx/zumbido_leve.wav", loop: true, volume: audio.sfxVolume * 0.4 },
  agua_correndo: { file: "audio/sfx/agua_correndo.wav", loop: true, volume: audio.sfxVolume * 0.45 },
  // ep03
  ziper: { file: "audio/sfx/ziper.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  quarto_ambiente: { file: "audio/sfx/quarto_ambiente.wav", loop: true, volume: audio.sfxVolume * 0.35 },
  pulo: { file: "audio/sfx/pulo.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  // ep03 longo
  notificacao: { file: "audio/sfx/notificacao.wav", loop: false, volume: audio.sfxVolume * 0.9 },
  mala_abrindo: { file: "audio/sfx/mala_abrindo.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  foguete_distante: { file: "audio/sfx/foguete_distante.wav", loop: true, volume: audio.sfxVolume * 0.5 },
  porta_metalica: { file: "audio/sfx/porta_metalica.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  queda_leve: { file: "audio/sfx/queda_leve.wav", loop: false, volume: audio.sfxVolume * 0.9 },
  porta_pressurizada: { file: "audio/sfx/porta_pressurizada.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  maquinario: { file: "audio/sfx/maquinario.wav", loop: true, volume: audio.sfxVolume * 0.4 },
  envio_mensagem: { file: "audio/sfx/envio_mensagem.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  painel_alerta: { file: "audio/sfx/painel_alerta.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  // ep03 v4
  painel_bip: { file: "audio/sfx/painel_bip.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  controle_ligando: { file: "audio/sfx/controle_ligando.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  // ep04
  passos_multidao: { file: "audio/sfx/passos_multidao.wav", loop: true, volume: audio.sfxVolume * 0.4 },
  rangido_balanca: { file: "audio/sfx/rangido_balanca.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  contagem: { file: "audio/sfx/contagem.wav", loop: false, volume: audio.sfxVolume * 1.2 },
  pulo_massivo: { file: "audio/sfx/pulo_massivo.wav", loop: false, volume: audio.sfxVolume * 1.3 },
  pouso_massivo: { file: "audio/sfx/pouso_massivo.wav", loop: false, volume: audio.sfxVolume * 1.2 },
  impacto_grave: { file: "audio/sfx/impacto_grave.wav", loop: false, volume: audio.sfxVolume * 1.0 },
  rabisco_sismografo: { file: "audio/sfx/rabisco_sismografo.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  quica: { file: "audio/sfx/quica.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  micro_zoom: { file: "audio/sfx/micro_zoom.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  // ep06 (episódio 5)
  mar_calmo: { file: "audio/sfx/mar_calmo.wav", loop: true, volume: audio.sfxVolume * 0.35 },
  onda_pequena: { file: "audio/sfx/onda_pequena.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  crescer_lua: { file: "audio/sfx/crescer_lua.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  encaixe: { file: "audio/sfx/encaixe.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  // ep06 v03: nomes do roteiro novo para os mesmos sons
  orla_ambiente: { file: "audio/sfx/mar_calmo.wav", loop: true, volume: audio.sfxVolume * 0.35 },
  pop_contagem: { file: "audio/sfx/encaixe.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  mar_subindo: { file: "audio/sfx/agua_avancando.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  onda_suave: { file: "audio/sfx/onda_pequena.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  // ep06 v07
  clique_lego: { file: "audio/sfx/clique_lego.wav", loop: false, volume: audio.sfxVolume * 0.9 },
  whoosh_grande: { file: "audio/sfx/whoosh_grande.wav", loop: false, volume: audio.sfxVolume * 0.9 },
  agua_subindo: { file: "audio/sfx/agua_correndo.wav", loop: true, volume: audio.sfxVolume * 0.6 },
  // ep07 (episódio 6)
  vento_queda: { file: "audio/sfx/vento_queda.wav", loop: true, volume: audio.sfxVolume * 0.32 },
  calor_chiado: { file: "audio/sfx/calor_chiado.wav", loop: true, volume: audio.sfxVolume * 0.25 },
  lava_borbulha: { file: "audio/sfx/lava_borbulha.wav", loop: true, volume: audio.sfxVolume * 0.4 },
  apito_panela: { file: "audio/sfx/apito_panela.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  puf: { file: "audio/sfx/puf.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  falha: { file: "audio/sfx/falha.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  recusado: { file: "audio/sfx/recusado.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  digitar: { file: "audio/sfx/digitar.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  apagar: { file: "audio/sfx/apagar.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  metro_chegando: { file: "audio/sfx/metro_chegando.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  flutua: { file: "audio/sfx/flutua.wav", loop: false, volume: audio.sfxVolume * 0.6 },
  suspense_grave: { file: "audio/sfx/suspense_grave.wav", loop: true, volume: audio.sfxVolume * 0.35 },
  conquista: { file: "audio/sfx/conquista.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  torrada_pop: { file: "audio/sfx/torrada_pop.wav", loop: false, volume: audio.sfxVolume * 0.8 },
  brilho: { file: "audio/sfx/brilho.wav", loop: false, volume: audio.sfxVolume * 0.5 },
  // ep08 (episódio 7)
  cantina_ambiente: { file: "audio/sfx/cantina_ambiente.wav", loop: true, volume: audio.sfxVolume * 0.4 },
  batida_suspense: { file: "audio/sfx/batida_suspense.wav", loop: false, volume: audio.sfxVolume * 0.9 },
  tic_relogio: { file: "audio/sfx/tic_relogio.wav", loop: true, volume: audio.sfxVolume * 0.6 },
  // ep09 (episódio 8, água)
  bolhas: { file: "audio/sfx/bolhas.wav", loop: false, volume: audio.sfxVolume * 0.7 },
  agua_ambiente: { file: "audio/sfx/agua_ambiente.wav", loop: true, volume: audio.sfxVolume * 0.35 },
  // ep07 v4: cauda da trilha no rabo final (toca uma vez; "loop" só para durar até o fim da cena)
  energia_queda_cauda: { file: "audio/sfx/energia_queda_cauda.wav", loop: true, volume: audio.sfxVolume * 1.2 },
};

// Versões com passa-altas em 120 Hz (scripts/gerar-sons.sh), para o grave não embolar com a voz
export const MUSIC: Record<string, string> = {
  base_suave: "audio/music/base_suave_hp120.wav",
  suspensa_sem_batida: "audio/music/suspensa_sem_batida_hp120.wav",
  tensao_leve: "audio/music/tensao_leve_hp120.wav",
  alegre_curta: "audio/music/alegre_curta_hp120.wav",
  melancolica_suave: "audio/music/melancolica_suave_hp120.wav",
  curiosidade_suave: "audio/music/curiosidade_suave_hp120.wav",
  crescendo_leve: "audio/music/crescendo_leve_hp120.wav",
  leve_divertida: "audio/music/leve_divertida_hp120.wav",
  lofi_espacial: "audio/music/lofi_espacial_hp120.wav",
  energia_queda: "audio/music/energia_queda_hp120.wav",
};
