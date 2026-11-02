#!/usr/bin/env python3
"""Linha do tempo do ep06 (episódio 5) pela fala real: cada cena começa 0,2 s antes da primeira
palavra; entre uma fala e a seguinte há 0,6 s de respiro, mais um pouco onde a imagem precisa de
tempo (a água subindo, a Lua crescida). O que sobra até 70 s fica no fim (close final + CTA).
Gera src/episodes/ep06.voz.json e ajusta startFrame/durationInFrames em ep06.json."""
import json, re

FPS, TOTAL = 30, 2100
GAP, LEAD_IN, FIRST = 0.6, 0.2, 0.1
EXTRA = {"peso_da_lua": 0.5, "eclipse": 0.8, "centro_da_danca": 0.3}  # respiro extra ANTES da cena

ep = json.load(open("src/episodes/ep06.json", encoding="utf-8"))
tr = json.load(open("src/audio/ep06-transcricao.json", encoding="utf-8"))["cenas"]
t, trechos, starts = FIRST, [], []
for i, s in enumerate(ep["scenes"]):
    w = tr[s["id"]]["words"]
    if i:
        t += GAP + EXTRA.get(s["id"], 0)
    starts.append(0 if i == 0 else t - LEAD_IN)
    trechos.append({"cena": s["id"], "de": 0.0, "ate": round(w[-1]["end"] + 0.06, 3), "em": round(t, 3)})
    t += w[-1]["end"]
print(f"fala termina em {t:.2f} s; sobra no fim {TOTAL / FPS - t:.2f} s")
frames = [round(x * FPS) for x in starts] + [TOTAL]
txt = open("src/episodes/ep06.json", encoding="utf-8").read()
for i, s in enumerate(ep["scenes"]):
    a, d = frames[i], frames[i + 1] - frames[i]
    print(s["id"], a, d)
    txt = re.sub(r'("id": "%s",\s*"startFrame": )\d+(,\s*"durationInFrames": )\d+' % s["id"], r"\g<1>%d\g<2>%d" % (a, d), txt)
open("src/episodes/ep06.json", "w", encoding="utf-8").write(txt)
json.dump({"_sobre": "Montagem da narração do ep06 (episódio 5): uma tomada por cena, inteira, sem acelerar nem cortar (scripts/layout-ep06.py).", "trechos": trechos},
          open("src/episodes/ep06.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
# palavras com tempo (o mesmo cálculo de scripts/montar-voz.py, que refaz isto ao montar o mp3)
words = []
for tch in trechos:
    for w in tr[tch["cena"]]["words"]:
        words.append({"text": w["text"], "startMs": round((tch["em"] + w["start"]) * 1000), "endMs": round((tch["em"] + min(w["end"], tch["ate"])) * 1000), "scene": tch["cena"]})
json.dump(words, open("src/audio/ep06-words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
