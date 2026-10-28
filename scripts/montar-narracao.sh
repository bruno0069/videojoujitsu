#!/usr/bin/env bash
# Monta a narração do episódio a partir das falas por cena (public/audio/voz/epNN-<cena>.mp3).
# Cada fala começa no frame indicado em OFFSETS (frame absoluto da montagem original de 60 s, 30 fps):
# isso gera a narração base. Depois as edições de tempo registradas em src/episodes/ep01.edicoes.json
# (insertos de imagem e pausas encurtadas, scripts/editar-tempo.py) são reaplicadas sobre ela.
# Uso: bash scripts/montar-narracao.sh
set -euo pipefail
cd "$(dirname "$0")/.."
EP=ep01
FPS=30
TOTAL=60
# cena:frame onde o arquivo começa (o primeiro som de cada arquivo está no início dele)
OFFSETS="gancho:0 apresentacao:99 gatilho:303 escalada1:543 escalada2:901 virada:1263 fecho:1584"
inputs=(); filters=""; labels=""; i=0
for item in $OFFSETS; do
  scene=${item%%:*}; frame=${item#*:}
  ms=$(( frame * 1000 / FPS ))
  inputs+=(-i "public/audio/voz/${EP}-${scene}.mp3")
  filters+="[$i:a]aresample=44100,adelay=${ms}:all=1[a$i];"
  labels+="[a$i]"
  i=$((i+1))
done
ffmpeg -hide_banner -loglevel error -y "${inputs[@]}" \
  -filter_complex "${filters}${labels}amix=inputs=$i:normalize=0:dropout_transition=0,apad=whole_dur=${TOTAL},atrim=0:${TOTAL}" \
  -ac 1 -ar 44100 -c:a libmp3lame -b:a 192k "public/audio/${EP}-narracao-base.mp3"
python3 scripts/editar-tempo.py "$EP" audio
