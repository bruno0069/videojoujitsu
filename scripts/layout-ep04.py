#!/usr/bin/env python3
"""Plano de montagem da voz do ep04 (gera src/episodes/ep04.voz.json e os limites de cena em ep04.json).

A fala crua das 7 tomadas soma 71,9 s, mais que os 70 s do episódio. Para caber sem cortar texto:
  1) pausas de respiração longas entre frases (não as dramáticas: "tempo...", "Sim...", a contagem,
     "detalhe:", "quanto?") encurtam para ~0,25 s, cortando o silêncio da tomada;
  2) toda a voz vai a 1,04x (4%; a fala crua tem 71,9 s);
  3) ~0,8 s de silêncio antes da contagem (multidão parada), como pede o roteiro.
Os limites de cena seguem a fala real: cada cena começa ~0,12 s antes da primeira palavra.
"""
import json

FPS, TOTAL, K = 30, 2100, 1.04
# Trechos de cada tomada (segundos da tomada), separados nas pausas que encurtam; `gap` = pausa nova depois
TAKES = {
    "gancho": [(0.0, 6.21)],
    "proposta": [(0.0, 1.65), (2.05, 5.373), (5.89, 9.01)],
    "dimensao": [(0.0, 6.40), (6.80, 9.67)],
    "escalada_cientifica": [(0.0, 6.08), (6.50, 9.185), (9.665, 11.35), (11.65, 16.78)],
    "grande_momento": [(0.0, 3.27), (3.70, 6.72), (7.25, 11.63)],
    "virada": [(0.0, 4.62), (5.16, 8.84), (9.33, 12.79)],
    "fechamento": [(0.0, 2.70), (3.10, 5.71)],
}
INNER_GAP = 0.25
LEAD = 0.12  # a cena começa este tanto antes da primeira palavra
GAP = {"proposta": 0.30, "dimensao": 0.30, "escalada_cientifica": 0.30, "grande_momento": 0.80, "virada": 0.30, "fechamento": 0.30}
FIRST = 0.10  # início da fala no episódio

ep = json.load(open("src/episodes/ep04.json", encoding="utf-8"))
t = FIRST
trechos, starts = [], []
for s in ep["scenes"]:
    sid = s["id"]
    if sid in GAP:
        t += GAP[sid]
    # grande_momento: a cena começa no silêncio antes da contagem (multidão parada)
    starts.append(t - (GAP[sid] - 0.15 if sid == "grande_momento" else LEAD) if sid != "gancho" else 0)
    for i, (a, b) in enumerate(TAKES[sid]):
        if i:
            t += INNER_GAP
        trechos.append({"cena": sid, "de": a, "ate": b, "em": round(t, 3), "tempo": K})
        t += (b - a) / K
fim_fala = t
print(f"fala termina em {fim_fala:.2f} s; folga até 70 s: {TOTAL / FPS - fim_fala:.2f} s")
assert fim_fala <= TOTAL / FPS - 0.3, "não cabe"
frames = [round(x * FPS) for x in starts] + [TOTAL]
for i, s in enumerate(ep["scenes"]):
    s["startFrame"] = frames[i]
    s["durationInFrames"] = frames[i + 1] - frames[i]
    print(s["id"], s["startFrame"], s["durationInFrames"])
json.dump({"_sobre": __doc__.strip().splitlines()[0], "trechos": trechos}, open("src/episodes/ep04.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
txt = open("src/episodes/ep04.json", encoding="utf-8").read()
import re
for s in ep["scenes"]:
    txt = re.sub(r'("id": "%s",\s*"startFrame": )\d+(,\s*"durationInFrames": )\d+' % s["id"], r"\g<1>%d\g<2>%d" % (s["startFrame"], s["durationInFrames"]), txt)
open("src/episodes/ep04.json", "w", encoding="utf-8").write(txt)
