#!/usr/bin/env python3
"""Linha do tempo do ep07 pela fala (a duração segue a voz; nada é acelerado nem cortado).
Em cada tomada: corta o silêncio do começo e do fim e encurta as pausas internas maiores que
0,42 s para 0,33 s. Toda cena termina numa piada: depois da última palavra ficam 0,6 s de
respiro (TAIL) e, na última cena, 2 s para o aviso final. Gera ep07.voz.json e ajusta os
frames e o totalFrames de ep07.json."""
import json, re, subprocess

EP, FPS = "ep07", 30
LEAD, TAIL, TAIL_FIM, PAUSA, MAXP = 0.15, 0.6, 2.0, 0.33, 0.42
CENAS = ["gancho", "queda", "calor", "nucleo", "centro", "final"]
ARQ = {c: f"ep07-narracao-0{i + 1}-{c}" for i, c in enumerate(CENAS)}

def silencios(path, d):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=n=-45dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    return st, list(zip(st, en))

ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
tr = json.load(open(f"src/audio/{EP}-transcricao.json", encoding="utf-8"))["cenas"]
t, trechos, starts = 0.1, [], [0.0]
for i, s in enumerate(ep["scenes"]):
    w = tr[s["id"]]["words"]
    arq = f"public/audio/{ARQ[s['id']]}.mp3"
    st, _ = silencios(arq, 0.08)
    fim_audio = (st or [w[-1]["end"]])[-1]
    a0, a1 = w[0]["start"], min(w[-1]["end"], fim_audio + 0.05)
    cortes = [(x, y) for x, y in silencios(arq, MAXP)[1] if x > a0 + 0.05 and y < a1 - 0.05]
    if i:
        starts.append(t - LEAD)
    de = palavras_de = a0
    for x, y in cortes + [(a1, None)]:
        fim = x if y is not None else a1 + 0.04
        trechos.append({"cena": s["id"], "de": round(de, 3), "palavrasDe": round(palavras_de, 3), "ate": round(fim, 3), "em": round(t, 3), "arquivo": arq})
        t += fim - de
        if y is not None:
            t += PAUSA
            prox = min([q["start"] for q in w if q["start"] >= x - 0.05] or [y])
            de = y - 0.02
            palavras_de = min(de, prox)
    t += (TAIL_FIM if i == len(ep["scenes"]) - 1 else TAIL) + LEAD
total = round((t - LEAD) * FPS)
frames = [round(x * FPS) for x in starts] + [total]
for i, s in enumerate(ep["scenes"]):
    s["startFrame"], s["durationInFrames"] = frames[i], frames[i + 1] - frames[i]
    print(s["id"], frames[i], frames[i + 1] - frames[i], f"{(frames[i + 1] - frames[i]) / FPS:.2f} s")
ep["totalFrames"] = total
open(f"src/episodes/{EP}.json", "w", encoding="utf-8").write(json.dumps(ep, ensure_ascii=False, indent=2) + "\n")
json.dump({"_sobre": __doc__.strip().splitlines()[0], "trechos": trechos}, open(f"src/episodes/{EP}.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"totalFrames {total} = {total / FPS:.2f} s; {len(trechos)} trechos")
