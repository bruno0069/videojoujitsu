#!/usr/bin/env python3
"""Linha do tempo do ep08 (episódio 7, açúcar) com as janelas de cena APROVADAS fixas.
Cada fala começa LEAD s depois do início da sua cena. Só quando a fala não cabe na janela
(fala + LEAD + MARGEM) as pausas internas mais longas são encurtadas (para PAUSA s), da maior
para a menor, até caber. Nada é acelerado nem cortado. Gera ep08.voz.json; não mexe em
startFrame, durationInFrames nem totalFrames."""
import json, re, subprocess

EP, FPS = "ep08", 30
LEAD, MARGEM, PAUSA, MINP = 0.12, 0.08, 0.2, 0.12
ARQ = {"gancho": "01-gancho", "apresentacao": "02-apresentacao", "gatilho": "03-gatilho", "escalada1": "04-escalada1",
       "escalada2": "05-escalada2", "cerebro": "06-cerebro", "virada": "07-virada", "fecho": "08-fecho"}

def silencios(path, d):
    r = subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-i", path, "-af", f"silencedetect=n=-45dB:d={d}", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", r)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", r)]
    return list(zip(st, en))

ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
tr = json.load(open(f"src/audio/{EP}-transcricao.json", encoding="utf-8"))["cenas"]
trechos = []
for s in ep["scenes"]:
    w = tr[s["id"]]["words"]
    arq = f"public/audio/{EP}-narracao-{ARQ[s['id']]}.mp3"
    sil = silencios(arq, MINP)
    a0 = w[0]["start"]
    # fim acústico da fala: começo do último silêncio que vai até o fim do arquivo (ou o fim da última palavra)
    a1 = min(w[-1]["end"], sil[-1][0] + 0.04) if sil and sil[-1][0] > w[-1]["start"] else w[-1]["end"]
    internas = [(x, y) for x, y in sil if x > a0 + 0.05 and y < a1 - 0.05]
    janela = s["durationInFrames"] / FPS
    fala = a1 - a0
    cortes = []
    for x, y in sorted(internas, key=lambda p: p[0] - p[1]):  # maiores primeiro
        if fala + LEAD + MARGEM <= janela:
            break
        if y - x > PAUSA:
            cortes.append((x, y))
            fala -= (y - x) - PAUSA
    if fala + LEAD + MARGEM > janela:
        raise SystemExit(f"{s['id']}: a fala ({fala:.2f} s) não cabe na janela de {janela:.2f} s")
    cortes.sort()
    t = s["startFrame"] / FPS + LEAD
    de = palavras_de = a0
    for x, y in cortes + [(a1, None)]:
        fim = x if y is not None else a1
        trechos.append({"cena": s["id"], "de": round(de, 3), "palavrasDe": round(palavras_de, 3), "ate": round(fim, 3), "em": round(t, 3), "arquivo": arq})
        t += fim - de
        if y is not None:
            # a emenda começa 0,02 s antes do fim do silêncio: a pausa resultante fica em PAUSA
            t += PAUSA - 0.02
            prox = min([q["start"] for q in w if q["start"] >= x - 0.05] or [y])
            de = y - 0.02
            palavras_de = min(de, prox)
    print(f"{s['id']:13s} janela {janela:5.2f} s | fala {fala:5.2f} s | sobra {janela - fala - LEAD:5.2f} s | pausas encurtadas: {len(cortes)}")
json.dump({"_sobre": __doc__.strip().splitlines()[0], "trechos": trechos}, open(f"src/episodes/{EP}.voz.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
