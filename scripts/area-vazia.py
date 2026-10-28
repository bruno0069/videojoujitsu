#!/usr/bin/env python3
"""Mede a área vazia de quadros PNG. A tela é dividida em 6 x 10 células (108 x 192 px);
uma célula é vazia quando 98% ou mais dos pixels dela têm a cor de fundo chapada mais comum
do quadro (nenhum desenho, estrela, texto ou personagem). Resultado: % de células vazias.
Uso: python3 scripts/area-vazia.py out/verif/*.png
"""
import sys
from collections import Counter

from PIL import Image

COLS, ROWS = 6, 10
for path in sys.argv[1:]:
    im = Image.open(path).convert("RGB").resize((540, 960), Image.NEAREST)
    w, h = im.size
    px = im.load()  # noqa: acesso direto (getdata está obsoleto)
    q = lambda c: (c[0] // 6, c[1] // 6, c[2] // 6)
    bg = Counter(q(px[x, y]) for x in range(0, w, 3) for y in range(0, h, 3)).most_common(1)[0][0]
    cw, ch = w // COLS, h // ROWS
    empty = 0
    for r in range(ROWS):
        for c in range(COLS):
            tot = same = 0
            for y in range(r * ch, (r + 1) * ch, 2):
                for x in range(c * cw, (c + 1) * cw, 2):
                    tot += 1
                    same += q(px[x, y]) == bg
            empty += same / tot >= 0.98
    print(f"{path}: {100 * empty / (COLS * ROWS):.0f}% de células vazias")
