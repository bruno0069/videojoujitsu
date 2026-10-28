#!/usr/bin/env bash
# Renderiza os quadros de verificação em out/stills/. Uso: bash scripts/stills.sh Ep01 [frames...]
# REMOTION_BROWSER (opcional) aponta para um Chrome já instalado.
# PROPS (opcional): entradas da composição, ex.: PROPS='{"extendTo70s":true}' para a versão longa.
# OUT (opcional): pasta de saída (padrão out/stills).
set -euo pipefail
cd "$(dirname "$0")/.."
COMP=${1:-Ep01}
shift || true
FRAMES=${*:-"0 24 330 780 1260 1450 1700 1799"}
EXTRA=()
if [ -n "${REMOTION_BROWSER:-}" ]; then EXTRA=(--browser-executable="$REMOTION_BROWSER" --chrome-mode=chrome-for-testing); fi
OUTDIR=${OUT:-out/stills}
if [ -n "${PROPS:-}" ]; then EXTRA+=(--props="$PROPS"); fi
mkdir -p "$OUTDIR"
npx remotion bundle --out-dir=out/bundle >/dev/null
for f in $FRAMES; do
  npx remotion still out/bundle "$COMP" "$OUTDIR/$(printf 'f%04d' "$f").png" --frame="$f" "${EXTRA[@]}" --log=error
done
ls "$OUTDIR"
