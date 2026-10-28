#!/usr/bin/env python3
"""Alinha a transcrição por palavra (tempos reais da voz) ao texto exato do roteiro.

Uso: python3 scripts/alinhar-palavras.py src/episodes/ep01.json src/audio/ep01-transcricao.json src/audio/ep01-words.json

Entrada da transcrição: lista ou {"words": [...]} com {text|word, start, end} em segundos.
Saída: [{ "text", "startMs", "endMs", "scene" }] com as palavras do roteiro (grafia e
pontuação do roteiro) e os tempos da voz. Palavras sem par na transcrição recebem tempo
interpolado entre as vizinhas e são listadas no terminal.
"""
import difflib
import json
import sys
import unicodedata


def norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return "".join(c for c in s if c.isalnum())


ep_path, tr_path, out_path = sys.argv[1:4]
ep = json.load(open(ep_path, encoding="utf-8"))
raw = json.load(open(tr_path, encoding="utf-8"))
raw = raw["words"] if isinstance(raw, dict) else raw
heard = [w for w in raw if w.get("type", "word") == "word"]

script = []
for sc in ep["scenes"]:
    for w in sc["narration"].split():
        script.append({"text": w, "scene": sc["id"]})

a = [norm(w["text"]) for w in script]
b = [norm(w.get("text") or w.get("word", "")) for w in heard]
times = [None] * len(script)
for blk in difflib.SequenceMatcher(a=a, b=b, autojunk=False).get_matching_blocks():
    for k in range(blk.size):
        h = heard[blk.b + k]
        times[blk.a + k] = (round(h["start"] * 1000), round(h["end"] * 1000))

missing = [i for i, t in enumerate(times) if t is None]
for i in missing:  # interpola entre as vizinhas com tempo
    prev = next((times[j] for j in range(i - 1, -1, -1) if times[j]), (0, 0))
    nxt = next((times[j] for j in range(i + 1, len(times)) if times[j]), (prev[1] + 300, prev[1] + 600))
    times[i] = (prev[1], max(prev[1] + 1, nxt[0]))

out = [{"text": w["text"], "startMs": t[0], "endMs": t[1], "scene": w["scene"]} for w, t in zip(script, times)]
json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(out_path, "a").write("\n")
print(f"{len(out)} palavras do roteiro, {len(heard)} ouvidas, {len(missing)} sem par:", [script[i]["text"] for i in missing])
