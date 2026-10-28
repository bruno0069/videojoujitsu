#!/usr/bin/env bash
# Renderiza o episódio e faz a mixagem final por stems (scripts/mixar.py).
# Uso: bash scripts/render.sh            -> out/ep01.mp4 (60 s)
#      bash scripts/render.sh --longa    -> out/ep01-70s.mp4 (versão longa, extendTo70s)
# REMOTION_BROWSER (opcional) aponta para um Chrome já instalado.
set -euo pipefail
cd "$(dirname "$0")/.."
LONGA=${1:-}
EXTRA=()
if [ -n "${REMOTION_BROWSER:-}" ]; then EXTRA=(--browser-executable="$REMOTION_BROWSER" --chrome-mode=chrome-for-testing); fi
if [ "$LONGA" = "--longa" ]; then OUTV=out/ep01-70s.mp4; P='"extendTo70s":true,'; else OUTV=out/ep01.mp4; P=''; fi
mkdir -p out/stems
npx remotion render Ep01 "$OUTV" --codec=h264 "${EXTRA[@]}" --props="{${P}\"stem\":\"mix\"}" --log=error
npx remotion render Ep01 out/stems/voz.wav --codec=wav "${EXTRA[@]}" --props="{${P}\"stem\":\"voz\"}" --log=error
npx remotion render Ep01 out/stems/fundo.wav --codec=wav "${EXTRA[@]}" --props="{${P}\"stem\":\"fundo\"}" --log=error
python3 scripts/mixar.py "$OUTV" out/stems/voz.wav out/stems/fundo.wav $LONGA
