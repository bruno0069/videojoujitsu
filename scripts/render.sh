#!/usr/bin/env bash
# Renderiza um episódio e faz a mixagem final por stems (scripts/mixar.py).
# Uso: bash scripts/render.sh [ep01|ep02|...]   -> out/epNN.mp4 (padrão ep01)
# REMOTION_BROWSER (opcional) aponta para um Chrome já instalado.
set -euo pipefail
cd "$(dirname "$0")/.."
EP=${1:-ep01}
COMP="E${EP:1}" # ep02 -> Ep02
EXTRA=()
if [ -n "${REMOTION_BROWSER:-}" ]; then EXTRA=(--browser-executable="$REMOTION_BROWSER" --chrome-mode=chrome-for-testing); fi
OUTV="out/$EP.mp4"
mkdir -p "out/stems/$EP"
npx remotion render "$COMP" "$OUTV" --codec=h264 "${EXTRA[@]}" --props='{"stem":"mix"}' --log=error
npx remotion render "$COMP" "out/stems/$EP/voz.wav" --codec=wav "${EXTRA[@]}" --props='{"stem":"voz"}' --log=error
npx remotion render "$COMP" "out/stems/$EP/fundo.wav" --codec=wav "${EXTRA[@]}" --props='{"stem":"fundo"}' --log=error
python3 scripts/mixar.py "$OUTV" "out/stems/$EP/voz.wav" "out/stems/$EP/fundo.wav"
