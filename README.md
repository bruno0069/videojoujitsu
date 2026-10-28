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
- `visual.camera`: `close`, `plano_medio`, `plano_aberto`. É o plano padrão da cena (com um
  push-in leve); para cortes e enquadramentos dentro da cena, use `planos` na direção.
- `sfx` e `music`: nomes de `src/audioLibrary.ts`. Músicas iguais em cenas seguidas
  viram uma faixa contínua.
- `onScreenText`: até 2 linhas; `" · "` força a quebra; números ficam em amarelo.

### Arquivo de direção (`epNN.direcao.json`)

Marca *o que* acontece e *quando*, dentro de cada cena. Tempos ("cues") são frames desde o
início da cena ou **palavras da narração** (`"quente"`, `"continua#2"`, `"agora?$"` = fim da
palavra, `"Nico-4"` = 4 frames antes).

Campos por cena:

- `planos`: cortes secos dentro da cena. Cada plano tem `de`, `enquadramento`
  (`close`, `medio`, `aberto`, `inserto_pequeno`, `ceu`, `inserto_pao`), `foco` (personagem,
  `"orbita"` ou `"ceu"`), `zoom` `[de, até]` (ex.: `[1, 1.12]` = push-in de 100% a 112%),
  `entrada` (`"corte"` ou `"punch"`), `personagens` (quem aparece, com pose/expressão) e
  `cenario` (troca o cenário só naquele plano).
- `elementos`: `sol` (com `some`/`encolhe`/`flash`), `lua` (`aparece`/`pisca`/`apaga`),
  `balao`, `etiqueta`, `prova`, `termometro`, `vinheta`. Todos aceitam `de`/`ate`.
- `personagens`: chaves de tempo por personagem (pose, expressão, objeto, ação, `olhar`).
  Ações: `comendo`, `revirar_olhos`, `frio` (tremor + bafo).
- `tremidas`: `{ de, frames, forca }`.
- `texto`: `de`/`ate`/`mostrar`. Sem `mostrar`, o texto da tela some sozinho quando só repete a fala.
- `sfx`: frame de cada efeito. `fundo`: parâmetros do cenário (`passos` do céu, `rotulo`).
- `sincronia`: pontos de sincronização para a voz (palavra → frame → evento). Quando a
  narração real entrar, confira se cada palavra cai perto do frame indicado e ajuste os
  frames da direção, ou troque os números por cues de palavra.

No topo do arquivo, `hud` guarda elementos que atravessam cenas (ex.: o timer de 540 a 1260).

O loop fecha porque as animações ociosas (piscar, respirar, nuvens, giro do Sol) rodam em
ciclos inteiros por episódio (`idle` em `theme.ts`) e o último plano termina no mesmo
enquadramento do primeiro.

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
