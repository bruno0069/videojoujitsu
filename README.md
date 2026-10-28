# E se… (com o Nico)

Projeto Remotion (TypeScript) do canal de vídeos curtos verticais "E se…".
Cada episódio é um arquivo de dados; o mesmo componente monta todos.

```bash
npm install
npm run dev        # abre o Remotion Studio (composição Ep01)
npm run render     # gera out/ep01.mp4 (H.264, 1080×1920, 30 fps)
npm run stills     # quadros de verificação em out/stills/
npm run sons       # regera efeitos e músicas com ffmpeg (síntese local)
node scripts/check-episode.mjs src/episodes/ep01.json   # confere a soma dos frames
```

## Criar um episódio novo

1. Copie `src/episodes/ep01.json` para `src/episodes/ep02.json` e troque título, narração,
   textos e cenas. As cenas precisam ser contíguas (`startFrame` de uma = fim da anterior) e
   somar `totalFrames`; o Studio recusa o episódio se não somarem.
2. (Opcional) Crie `src/episodes/ep02.direcao.json` com os elementos de cena e os tempos
   (veja abaixo). Sem ele, o episódio já roda: cenário, personagens, câmera, texto e legenda.
3. Pronto: a composição `Ep02` aparece sozinha no Studio. Para renderizar:
   `npx remotion render Ep02 out/ep02.mp4 --codec=h264`.

Nenhum código novo é necessário, a não ser que o episódio peça um **cenário** novo
(`src/components/backgrounds/` + uma linha em `src/components/Background.tsx`).

### O que o JSON do episódio controla

- `visual.background`: `patio_dia`, `patio_ceu_escurecendo`, `diagrama_orbita`,
  `espaco_escuro_para_sala_de_aula`.
- `visual.characters`: `nico` ou `dani`, com `pose` (`parado`, `andando`, `caindo`, `apontando`,
  `de_costas`, `encolhido`, `olhando_para_cima`, `mao_levantada`, `bracos_cruzados`) e
  `expression` (`neutro`, `surpresa`, `medo`, `vergonha`, `cetica`). `"scale": "inserto_pequeno"`
  põe o personagem pequeno no canto.
- `visual.camera`: `close`, `plano_medio`, `plano_aberto`. A câmera muda o enquadramento
  sozinha a cada ~3 s, com mola (zoom e deslocamento, sem cortes).
- `sfx` e `music`: nomes de `src/audioLibrary.ts`. Músicas iguais em cenas seguidas
  viram uma faixa contínua.
- `onScreenText`: até 2 linhas; `" · "` força a quebra; números ficam em amarelo.

### Arquivo de direção (`epNN.direcao.json`)

Marca *quando* as coisas acontecem dentro de cada cena. Os tempos ("cues") podem ser
frames desde o início da cena ou **palavras da narração**, que se ajustam sozinhas
quando o áudio real entra:

| Cue | Significa |
| --- | --- |
| `45` | frame 45 da cena |
| `"quente"` | início da palavra "quente" |
| `"continua#2"` | segunda ocorrência |
| `"agora?$"` | fim da palavra |
| `"Nico-4"` | 4 frames antes de "Nico" |

Campos por cena: `elementos` (`sol`, `lua`, `balao`, `inserto`, `relogio`, `termometro`),
`personagens` (trocas de pose, expressão, objeto, visibilidade ao longo da cena),
`sfx` (quando tocar cada efeito), `fundo` (parâmetros do cenário, por exemplo
`passos` do céu escurecendo e `corte` para a sala), `texto` (quando o texto entra) e
`camera` (`inicio: "base"` e `fim: "base"` para o loop). Veja `ep01.direcao.json`.

## Narração e legendas

- Coloque a narração em `public/audio/epNN-narracao.mp3`. Ela é detectada sozinha.
- Sem áudio, a legenda usa tempo **estimado** (palavras distribuídas pelo número de
  caracteres de cada cena).
- Com áudio, gere `public/captions/epNN.json` no formato `Caption[]` de
  `@remotion/captions` (por exemplo, transcrevendo com `@remotion/install-whisper-cpp`).
  A legenda e todos os cues por palavra passam a seguir a fala real.
- Para casar a fala com as cenas sem mexer no JSON, gere um áudio por cena e posicione
  cada um no `startFrame` da cena ao montar o MP3 único (ffmpeg `adelay` + `amix`).

## Identidade visual

Cores, fonte (Baloo 2 via `@remotion/google-fonts`), contorno, posição da legenda e
enquadramentos ficam em `src/theme.ts`.
