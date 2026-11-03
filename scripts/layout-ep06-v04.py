#!/usr/bin/env python3
"""Linha do tempo da v04 do ep06 pela fala (a duração do vídeo segue a fala, não fecha 70 s).
Em cada tomada: corta o silêncio do começo e do fim e encurta as pausas internas maiores que
0,5 s para ~0,35 s (cortando a tomada em trechos). Cada cena = 0,15 s antes da fala + fala +
0,35 s depois; entre uma fala e a seguinte fica ~0,5 s. Gera ep06-v04.voz.json e ajusta os
frames e o totalFrames de ep06-v04.json."""
import json, re, subprocess

EP, FPS = "ep06-v04", 30
LEAD, TAIL, PAUSA, MAXP = 0.15, 0.35, 0.35, 0.5
ARQ = {"gancho": "ep06-v03-narracao-01-gancho", "apresentacao": "ep06-v04-narracao-02-apresentacao",
       "gatilho": "ep06-v03-narracao-03-gatilho", "escalada1": "ep06-v03-narracao-04-escalada1",
       "escalada2": "ep06-v03-narracao-05-escalada2", "eclipse": "ep06-v03-narracao-06-eclipse", "fecho": "ep06-v03-narracao-07-fecho"}

def pausas(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=n=-45dB:d={MAXP}", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    return list(zip(st, en))

ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
tr = json.load(open(f"src/audio/{EP}-transcricao.json", encoding="utf-8"))["cenas"]
t, trechos, starts = 0.1, [], [0.0]
for i, s in enumerate(ep["scenes"]):
    w = tr[s["id"]]["words"]
    arq = f"public/audio/{ARQ[s['id']]}.mp3"
    # fim da fala pelo áudio (a transcrição marca o fim da última palavra um pouco tarde)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", arq, "-af", "silencedetect=n=-45dB:d=0.08", "-f", "null", "-"], capture_output=True, text=True).stderr
    fim_audio = ([float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)] or [w[-1]["end"]])[-1]
    a0, a1 = w[0]["start"], min(w[-1]["end"], fim_audio + 0.05)
    # pausas internas (entre a primeira e a última palavra) maiores que MAXP
    cortes = [(x, y) for x, y in pausas(arq) if x > a0 + 0.05 and y < a1 - 0.05]
    if i:
        starts.append(t - LEAD)
    de = a0
    for x, y in cortes + [(a1, None)]:
        trechos.append({"cena": s["id"], "de": round(de, 3), "ate": round(x if y is not None else a1 + 0.04, 3), "em": round(t, 3), "arquivo": arq})
        t += (x - de) if y is not None else (a1 + 0.04 - de)
        if y is not None:
            t += PAUSA
            # a transcrição às vezes marca o começo da palavra um pouco antes do fim do silêncio:
            # o trecho começa no que vier primeiro, para nenhuma palavra cair fora
            prox = min([q["start"] for q in w if q["start"] >= x - 0.05] or [y])
            de = min(y - 0.02, prox)
    t += TAIL + LEAD  # fim da cena + começo da próxima
total = round((t - LEAD) * FPS)
frames = [round(x * FPS) for x in starts] + [total]
txt = open(f"src/episodes/{EP}.json", encoding="utf-8").read()
txt = re.sub(r'"totalFrames": \d+', f'"totalFrames": {total}', txt, count=1)
for i, s in enumerate(ep["scenes"]):
    a, d = frames[i], frames[i + 1] - frames[i]
    print(s["id"], a, d)
    txt = re.sub(r'("id": "%s",\s*"startFrame": )\d+(,\s*"durationInFrames": )\d+' % s["id"], r"\g<1>%d\g<2>%d" % (a, d), txt)
open(f"src/episodes/{EP}.json", "w", encoding="utf-8").write(txt)
json.dump({"_sobre": __doc__.strip().splitlines()[0], "trechos": trechos}, open(f"src/episodes/{EP}.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"totalFrames {total} = {total / FPS:.2f} s; {len(trechos)} trechos")
