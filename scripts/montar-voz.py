#!/usr/bin/env python3
"""Monta a narração de um episódio a partir de trechos das tomadas por cena e gera as
palavras com tempo (legenda e limites de cena). Nada é regenerado: só corta, acelera
(atempo, opcional) e posiciona trechos das tomadas.

Entradas:
  src/episodes/epNN.voz.json        trechos { cena, de, ate, em, tempo? } (segundos)
  src/audio/epNN-transcricao.json   { cenas: { <cena>: { words: [{text,start,end}] } } }
  public/audio/voz/epNN-<cena>.mp3  tomada escolhida de cada cena
Saídas:
  public/audio/epNN-narracao.mp3    duração exata do episódio
  src/audio/epNN-words.json         [{ text, startMs, endMs, scene }] com a grafia do roteiro

Uso: python3 scripts/montar-voz.py ep02
"""
import json
import subprocess
import sys

EP = sys.argv[1]
ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
plan = json.load(open(f"src/episodes/{EP}.voz.json", encoding="utf-8"))["trechos"]
tr = json.load(open(f"src/audio/{EP}-transcricao.json", encoding="utf-8"))["cenas"]
total = ep["totalFrames"] / ep["fps"]
PRE, POS = 0.03, 0.06  # margem de áudio antes/depois da fala em cada corte

inputs, filters, labels = [], [], []
words = []
for i, t in enumerate(plan):
    k = t.get("tempo", 1.0)
    a, b = max(0.0, t["de"] - PRE), t["ate"] + POS
    start = t["em"] - (t["de"] - a) / k
    inputs += ["-i", f"public/audio/voz/{EP}-{t['cena']}.mp3"]
    chain = f"[{i}:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d=0.01,afade=t=out:st={b - a - 0.02}:d=0.02"
    if k != 1.0:
        chain += f",atempo={k}"
    filters.append(f"{chain},aresample=44100,adelay={round(start * 1000)}:all=1[a{i}]")
    labels.append(f"[a{i}]")
    for w in tr[t["cena"]]["words"]:
        if t["de"] - 0.05 <= w["start"] < t["ate"]:
            s = t["em"] + (w["start"] - t["de"]) / k
            e = t["em"] + (min(w["end"], t["ate"]) - t["de"]) / k
            words.append({"text": w["text"], "startMs": round(s * 1000), "endMs": round(e * 1000), "scene": t["cena"]})

graph = ";".join(filters) + ";" + "".join(labels) + f"amix=inputs={len(plan)}:normalize=0:dropout_transition=0,apad=whole_dur={total},atrim=0:{total}"
out = f"public/audio/{EP}-narracao.mp3"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs, "-filter_complex", graph,
                "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", out], check=True)

# Grafia do roteiro (a transcrição tem as mesmas palavras, na mesma ordem)
script = [(w, s["id"]) for s in ep["scenes"] for w in s["narration"].split()]
if len(script) != len(words):
    sys.exit(f"{len(words)} palavras montadas, {len(script)} no roteiro")
for w, (txt, sc) in zip(words, script):
    w["text"], w["scene"] = txt, sc
json.dump(words, open(f"src/audio/{EP}-words.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(f"src/audio/{EP}-words.json", "a").write("\n")
gaps = [(words[i]["startMs"] - words[i - 1]["endMs"]) / 1000 for i in range(1, len(words))]
print(f"{out}: {total:.2f} s, {len(words)} palavras; maior pausa entre palavras {max(gaps):.2f} s;"
      f" fala de {words[0]['startMs'] / 1000:.2f} a {words[-1]['endMs'] / 1000:.2f} s")
