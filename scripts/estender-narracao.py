#!/usr/bin/env python3
"""Gera a narração da versão longa (extendTo70s) a partir da narração de 60 s, inserindo
silêncio nos pontos dos insertos de imagem (campo `extensao` da direção). Não regenera voz.

Uso: python3 scripts/estender-narracao.py ep01
"""
import json
import subprocess
import sys

ep_id = sys.argv[1] if len(sys.argv) > 1 else "ep01"
ep = json.load(open(f"src/episodes/{ep_id}.json", encoding="utf-8"))
direc = json.load(open(f"src/episodes/{ep_id}.direcao.json", encoding="utf-8"))
fps = ep["fps"]
starts = {s["id"]: s["startFrame"] for s in ep["scenes"]}
cuts = sorted((starts[i["cena"]] + i["em"], i["frames"]) for i in direc.get("extensao", []))
src = f"public/audio/{ep_id}-narracao.mp3"
dst = f"public/audio/{ep_id}-narracao-70s.mp3"

parts, prev = [], 0.0
filters, labels, n = [], [], 0
for at, frames in cuts:
    t = at / fps
    filters.append(f"[0:a]atrim={prev}:{t},asetpts=PTS-STARTPTS[p{n}]")
    filters.append(f"anullsrc=r=44100:cl=mono,atrim=0:{frames / fps}[s{n}]")
    labels += [f"[p{n}]", f"[s{n}]"]
    prev, n = t, n + 1
filters.append(f"[0:a]atrim={prev}:{ep['totalFrames'] / fps},asetpts=PTS-STARTPTS[p{n}]")
labels.append(f"[p{n}]")
graph = ";".join(filters) + ";" + "".join(labels) + f"concat=n={len(labels)}:v=0:a=1[out]"
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-filter_complex", graph, "-map", "[out]",
                "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", dst], check=True)
total = ep["totalFrames"] + sum(f for _, f in cuts)
print(f"{dst}: {total} frames ({total / fps:.2f} s); silêncio inserido em {[c[0] for c in cuts]}")
