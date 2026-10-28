# E se… (com o Nico)

Projeto Remotion (TypeScript) do canal de vídeos curtos verticais "E se…".
Cada episódio é um arquivo de dados; o mesmo componente monta todos.

```bash
npm install
npm run dev        # abre o Remotion Studio (composição Ep01)
npm run render     # gera out/ep01.mp4 (H.264, 1080×1920, 30 fps) com a mixagem por stems
npm run render:70s # versão longa (extendTo70s): out/ep01-70s.mp4
npm run stills     # quadros de verificação em out/stills/
                   # (PROPS='{"extendTo70s":true}' para a versão longa; OUT=<pasta> muda a saída)
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
  `entrada` (`"corte"` ou `"punch"`), `centralizar` (o foco vai para o centro da tela; com
  `foco: "terra"` a câmera acompanha a Terra), `personagens` (quem aparece, com pose/expressão
  e `x` opcional para reposicionar; `[]` = ninguém) e `cenario` (troca o cenário só naquele plano).
  No close, o queixo fica sempre em `shots.close.chinY` (acima da faixa da legenda) e o zoom
  cresce a partir dele.
- `elementos`: `sol` (com `some`/`encolhe`/`flash`), `lua` (`aparece`/`pisca`/`apaga`),
  `balao`, `etiqueta`, `prova`, `termometro`. Todos aceitam `de`/`ate`. A noite não é uma
  película escura: o cenário `patio_ceu_escurecendo` troca as cores pela paleta noturna
  desenhada (`night` em `theme.ts`) e os personagens ganham pele noturna, luz de recorte
  turquesa e bochechas azuladas.
- `personagens`: chaves de tempo por personagem (pose, expressão, objeto, ação, `olhar`).
  Ações: `comendo`, `revirar_olhos`, `frio` (tremor + bafo).
- `tremidas`: `{ de, frames, forca }`.
- `texto`: `de`/`ate`/`mostrar`/`estilo` (`"sticker"` = chamada grande a 60% da altura). Sem
  `mostrar`, o texto da tela some sozinho quando só repete a fala.
- `congelar`: frame a partir do qual a imagem da cena fica parada.
- `sfx`: frame de cada efeito (negativo = antes do começo da cena, para cair numa pausa da fala). `fundo`: parâmetros do cenário (`passos` do céu, `seco: 1` para
  trocar a cor sem transição, `rotulo`/`rotuloAte` do diagrama).
- `sincronia`: pontos de sincronização para a voz (palavra → frame → evento). Quando a
  narração real entrar, confira se cada palavra cai perto do frame indicado e ajuste os
  frames da direção, ou troque os números por cues de palavra.

No topo do arquivo, `hud` guarda elementos que atravessam cenas. O timer usa `de`/`ate`
(frames absolutos), `grandeDe`/`grandeAte` (janela em que fica grande, acima do Nico),
`seguraAte` (fica parado no valor inicial até aqui; só então conta), `zeroEm` (chega a 00:00
e pisca em coral) e `travaEm` (opcional: para de piscar).

### Versão longa (`extendTo70s`)

Entrada da composição, falsa por padrão. Com `--props='{"extendTo70s":true}'`, a composição
aplica os insertos listados em `extensao` na direção (`{ cena, em, frames, enquadramento }`):
abre `frames` de imagem nova no frame `em` da cena e empurra tudo o que vem depois (cenas,
cues numéricos, timer e palavras). A voz não é regenerada: `scripts/estender-narracao.py`
insere silêncio nos mesmos pontos e gera `public/audio/epNN-narracao-70s.mp3`. No ep01 são
dois insertos, o raio de luz Sol→Terra com o timer (+90) e o diagrama Sol→Lua→Terra da
"luz emprestada" (+75), num total de 1965 frames (65,5 s).

O loop fecha porque as animações ociosas (piscar, respirar, nuvens, giro do Sol) rodam em
ciclos inteiros por episódio (`idle` em `theme.ts`) e o último plano termina no mesmo
enquadramento do primeiro.

## Narração, legendas e mixagem

Fluxo usado no ep01 (voz "Renan Matheus", ElevenLabs `eleven_v4`, configurações padrão):

1. Uma fala por cena em `public/audio/voz/epNN-<cena>.mp3` (texto exato do roteiro).
2. `npm run narracao` (`scripts/montar-narracao.sh`) posiciona cada fala no frame da sua cena
   (`OFFSETS` no script) e gera `public/audio/epNN-narracao.mp3` com 60 s exatos. Reposicionar
   uma fala (para abrir uma pausa) é só mudar o offset; depois rode `npm run palavras` com o
   deslocamento da cena (`cena=ms`) para os tempos das palavras acompanharem.
3. A narração montada é transcrita por palavra (ElevenLabs Scribe) e salva em
   `src/audio/epNN-transcricao.json`.
4. `npm run palavras` (`scripts/alinhar-palavras.py`) alinha a transcrição ao texto do roteiro
   e grava `src/audio/epNN-words.json`: `{ text, startMs, endMs, scene }` por palavra.
5. `npm run render` (`scripts/render.sh`) renderiza o vídeo e dois stems de áudio (entrada
   `stem`: `"voz"` só a narração, `"fundo"` só música + efeitos) e `scripts/mixar.py` faz a
   mixagem final: voz com compressor 3:1 + limitador em -14 LUFS, fundo em -30 LUFS, mix em
   -14 LUFS com pico real ≤ -1,5 dBTP e LRA ≤ 8 LU. Os stems processados e as medidas ficam em
   `out/stems/` (`medidas.json`, incluindo a distância voz/fundo só nos trechos com fala).

**A legenda e os limites de cena derivam do arquivo de palavras.** O caminho é a entrada
`legendas` da composição (padrão `src/audio/epNN-words.json`; um caminho fora de `src/audio/`
é buscado em `public/`). Formatos aceitos: `{ text, startMs, endMs }`,
`{ word | text, start, end }` em segundos ou `{ words: [...] }`.

```bash
npx remotion render Ep01 out/ep01.mp4 --props='{"legendas":"src/audio/ep01-words.json"}'
```

- Limites de cena: o limite do JSON é mantido enquanto cada fala cabe na sua cena; se uma
  fala invadir a vizinha, o limite vai para o meio da pausa entre as duas falas.
- Cues por palavra na direção (`"levanta-2"`, `"zero.$"`) seguem a voz real.
- Sem arquivo de palavras, a legenda usa tempo estimado pelo roteiro
  (`node scripts/gerar-timestamps-estimados.mjs <episódio.json> <saída.json>` gera esse arquivo).
- Duck guiado pelas palavras: música e efeitos ficam baixos durante a fala e voltam ao nível
  base nas pausas maiores que 0,4 s, com rampas de 6 frames (`audio.duck*` em `theme.ts`).
  Sob a fala, o fundo fica 15–18 dB abaixo da voz. Se a cena seguinte não tem música, a faixa
  sai em fade de 1,5 s dentro dela (sem buraco mudo).
- As músicas entram com passa-altas em 120 Hz (`*_hp120.wav`, gerados por `npm run sons`).

Campos de topo da direção ligados a isso: `legendaDe` (a legenda só aparece a partir desse
frame; antes, o título da capa) e `sunReturnsAfterHook` (selo "agora" de 12 frames no início
da cena seguinte ao gancho).

## Identidade visual

Cores, fonte (Baloo 2 via `@remotion/google-fonts`), contorno, posição da legenda e
enquadramentos ficam em `src/theme.ts`.

- Legenda numa faixa fixa entre 68% e 76% da altura (y 1306–1459); nenhum rosto entra nela.
- Só dois estilos de tipografia além da legenda: caixa tinta (#1B1B2F, com filete creme) para
  títulos e informação (texto na tela, rótulos dos diagramas, termômetro, timer) e sticker
  coral (#FF6B57) para a chamada final e as etiquetas de nome. O balão "Ué." é fala do
  personagem, não texto de informação.
- Sombra chapada de um tom (a cor puxada 18% para a tinta) no rosto, moletom e calça; textura
  discreta de pontos no chão.
