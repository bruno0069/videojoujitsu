#!/usr/bin/env bash
# Junta quadros de verificação numa folha de contato (6 por linha). Uso: bash scripts/folha.sh <pasta> <saída.png>
set -euo pipefail
DIR=$1; OUTP=$2
FILES=($(ls "$DIR"/f*.png | sort))
N=${#FILES[@]}
IN=(); F=""
for i in "${!FILES[@]}"; do
  IN+=(-i "${FILES[$i]}")
  n=$(basename "${FILES[$i]}" .png); n=${n#f}
  F+="[$i]scale=360:640,drawtext=text='$n':x=8:y=8:fontsize=28:fontcolor=red:box=1:boxcolor=white[s$i];"
done
ROWS=$(( (N + 5) / 6 ))
for r in $(seq 0 $((ROWS-1))); do
  cnt=0; seg=""
  for c in 0 1 2 3 4 5; do i=$((r*6+c)); [ $i -lt $N ] && { seg+="[s$i]"; cnt=$((cnt+1)); }; done
  if [ $cnt -lt 6 ]; then for c in $(seq $cnt 5); do F+="color=white:s=360x640:d=1[pad$r$c];"; seg+="[pad$r$c]"; done; fi
  F+="${seg}hstack=6[r$r];"
done
if [ $ROWS -gt 1 ]; then for r in $(seq 0 $((ROWS-1))); do F+="[r$r]"; done; F+="vstack=$ROWS[out]"; else F+="[r0]null[out]"; fi
ffmpeg -hide_banner -loglevel error -y "${IN[@]}" -filter_complex "$F" -map "[out]" -frames:v 1 "$OUTP"
