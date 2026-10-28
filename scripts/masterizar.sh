#!/usr/bin/env bash
# Masteriza o áudio do vídeo renderizado: loudness integrado -14 LUFS e pico real <= -1,5 dBTP.
# Ganho + limitador (alimiter), refinando o ganho em até 3 passadas. Vídeo copiado sem recompressão.
# A mixagem original fica em out/raw-<nome>.mp4.
# Uso: bash scripts/masterizar.sh out/ep01.mp4
set -euo pipefail
IN=${1:-out/ep01.mp4}
RAW="$(dirname "$IN")/raw-$(basename "$IN")"
TARGET=-14
cp "$IN" "$RAW"
measure() { ffmpeg -hide_banner -i "$1" -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/ I:/{i=$2} /True peak/{t=1} t&&/Peak:/{p=$2} END{print i, p}'; }
read I TP < <(measure "$RAW")
GAIN=$(python3 -c "print(round($TARGET - ($I), 2))")
for pass in 1 2 3; do
  ffmpeg -hide_banner -loglevel error -y -i "$RAW" -c:v copy \
    -af "volume=${GAIN}dB,alimiter=limit=0.7:attack=1:release=60:level=disabled,aresample=48000" \
    -c:a aac -b:a 192k -ar 48000 "$IN"
  read I TP < <(measure "$IN")
  echo "passada $pass: ganho ${GAIN} dB -> I=${I} LUFS, pico real=${TP} dBTP"
  OK=$(python3 -c "print(abs($I - ($TARGET)) <= 0.3 and $TP <= -1.5)")
  [ "$OK" = "True" ] && break
  GAIN=$(python3 -c "print(round($GAIN + ($TARGET) - ($I), 2))")
done
