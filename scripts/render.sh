#!/usr/bin/env bash
# Renderiza o episódio e faz a mixagem final por stems (scripts/mixar.py).
# Uso: bash scripts/render.sh   -> out/ep01.mp4
# REMOTION_BROWSER (opcional) aponta para um Chrome já instalado.
set -euo pipefail
cd "$(dirname "$0")/.."
EXTRA=()
if [ -n "${REMOTION_BROWSER:-}" ]; then EXTRA=(--browser-executable="$REMOTION_BROWSER" --chrome-mode=chrome-for-testing); fi
OUTV=out/ep01.mp4
mkdir -p out/stems
npx remotion render Ep01 "$OUTV" --codec=h264 "${EXTRA[@]}" --props='{"stem":"mix"}' --log=error
npx remotion render Ep01 out/stems/voz.wav --codec=wav "${EXTRA[@]}" --props='{"stem":"voz"}' --log=error
npx remotion render Ep01 out/stems/fundo.wav --codec=wav "${EXTRA[@]}" --props='{"stem":"fundo"}' --log=error
python3 scripts/mixar.py "$OUTV" out/stems/voz.wav out/stems/fundo.wav
