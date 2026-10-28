#!/usr/bin/env bash
# Renderiza os quadros de verificação em out/stills/. Uso: bash scripts/stills.sh Ep01 [frames...]
# REMOTION_BROWSER (opcional) aponta para um Chrome já instalado.
set -euo pipefail
cd "$(dirname "$0")/.."
COMP=${1:-Ep01}
shift || true
FRAMES=${*:-"0 24 330 780 1260 1450 1700 1799"}
EXTRA=()
if [ -n "${REMOTION_BROWSER:-}" ]; then EXTRA=(--browser-executable="$REMOTION_BROWSER" --chrome-mode=chrome-for-testing); fi
mkdir -p out/stills
npx remotion bundle --out-dir=out/bundle >/dev/null
for f in $FRAMES; do
  npx remotion still out/bundle "$COMP" "out/stills/$(printf 'f%04d' "$f").png" --frame="$f" "${EXTRA[@]}" --log=error
done
ls out/stills
