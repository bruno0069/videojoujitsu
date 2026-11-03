#!/usr/bin/env python3
"""Linha do tempo da v03 do ep06 pela fala real. A fala soma ~53 s e o episódio tem 70 s: entre as
falas há 0,6 s de respiro e, no fim de algumas cenas, um tempo só de imagem (a Lua crescendo, os
cubinhos contando, a água subindo, a coroa aparecendo). O resto fica no close final.
Gera src/episodes/ep06-v03.voz.json, src/audio/ep06-v03-words.json e ajusta os frames do JSON."""
import json, re

EP, FPS, TOTAL = "ep06-v03", 30, 2100
GAP, LEAD_IN, FIRST = 0.6, 0.2, 0.1
# tempo só de imagem no FIM da cena anterior (segundos), indexado pela cena seguinte
EXTRA = {"apresentacao": 0.8, "gatilho": 0.8, "escalada1": 1.8, "escalada2": 2.7, "eclipse": 2.7, "fecho": 1.8}
ARQ = {"gancho": "01-gancho", "apresentacao": "02-apresentacao", "gatilho": "03-gatilho", "escalada1": "04-escalada1",
       "escalada2": "05-escalada2", "eclipse": "06-eclipse", "fecho": "07-fecho"}

ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
tr = json.load(open(f"src/audio/{EP}-transcricao.json", encoding="utf-8"))["cenas"]
t, trechos, starts = FIRST, [], []
for i, s in enumerate(ep["scenes"]):
    w = tr[s["id"]]["words"]
    if i:
        t += GAP + EXTRA.get(s["id"], 0)
    starts.append(0 if i == 0 else t - LEAD_IN)
    trechos.append({"cena": s["id"], "de": 0.0, "ate": round(w[-1]["end"] + 0.06, 3), "em": round(t, 3),
                    "arquivo": f"public/audio/{EP}-narracao-{ARQ[s['id']]}.mp3"})
    t += w[-1]["end"]
print(f"fala termina em {t:.2f} s; sobra no fim {TOTAL / FPS - t:.2f} s")
frames = [round(x * FPS) for x in starts] + [TOTAL]
txt = open(f"src/episodes/{EP}.json", encoding="utf-8").read()
for i, s in enumerate(ep["scenes"]):
    a, d = frames[i], frames[i + 1] - frames[i]
    print(s["id"], a, d)
    txt = re.sub(r'("id": "%s",\s*"startFrame": )\d+(,\s*"durationInFrames": )\d+' % s["id"], r"\g<1>%d\g<2>%d" % (a, d), txt)
open(f"src/episodes/{EP}.json", "w", encoding="utf-8").write(txt)
json.dump({"_sobre": __doc__.strip().splitlines()[0], "trechos": trechos}, open(f"src/episodes/{EP}.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
