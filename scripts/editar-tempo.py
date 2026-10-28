#!/usr/bin/env python3
"""Edita o tempo de um episódio: abre frames de imagem nova ou remove um trecho, mantendo
tudo em sincronia (roteiro, direção, palavras, transcrição e narração). A voz não é
regenerada: a narração ganha silêncio (inserção) ou perde o trecho removido.

Cada edição é { "em": frame absoluto, "frames": n } com n > 0 para inserir (opcional
"enquadramento": plano de imagem aberto no lugar) ou n < 0 para remover os frames
[em, em + |n|) — o trecho tem de caber numa cena e não pode conter palavras.
As edições são aplicadas na ordem, cada uma na linha do tempo deixada pela anterior.

  python3 scripts/editar-tempo.py ep01 aplicar edicoes.json
      aplica às JSONs e à narração e acrescenta ao registro src/episodes/ep01.edicoes.json
  python3 scripts/editar-tempo.py ep01 audio
      refaz a narração final a partir da base (public/audio/ep01-narracao-base.mp3,
      montada por scripts/montar-narracao.sh) e do registro
"""
import json
import re
import subprocess
import sys

EP, CMD = sys.argv[1], sys.argv[2]
P_EP = f"src/episodes/{EP}.json"
P_DIR = f"src/episodes/{EP}.direcao.json"
P_WORDS = f"src/audio/{EP}-words.json"
P_TR = f"src/audio/{EP}-transcricao.json"
P_LOG = f"src/episodes/{EP}.edicoes.json"
BASE = f"public/audio/{EP}-narracao-base.mp3"
FINAL = f"public/audio/{EP}-narracao.mp3"

load = lambda p: json.load(open(p, encoding="utf-8"))


def save_episode(old_text, ep):
    """Grava o roteiro trocando só os números de tempo no texto original (preserva o formato)."""
    it = iter([v for s in ep["scenes"] for v in (s["startFrame"], s["durationInFrames"])])
    text = re.sub(r'("totalFrames":\s*)\d+', lambda mt: f"{mt.group(1)}{ep['totalFrames']}", old_text, count=1)
    text = re.sub(r'("(?:startFrame|durationInFrames)":\s*)\d+', lambda mt: f"{mt.group(1)}{next(it)}", text)
    open(P_EP, "w", encoding="utf-8").write(text)


def save(p, data):
    with open(p, "w", encoding="utf-8") as f:
        indent = {P_WORDS: 1, P_TR: None}.get(p, 2)
        json.dump(data, f, ensure_ascii=False if p != P_TR else True, indent=indent)
        f.write("\n")



def mapper(at, n):
    """Novo frame (absoluto, fracionário) de um frame antigo."""
    if n > 0:
        return lambda f: f + n if f >= at else f
    r = -n
    return lambda f: f - r if f >= at + r else (at if f >= at else f)


ELEMENT_CUES = ["de", "ate", "some", "aparece", "pisca", "apaga", "notaEm"]


def edit_scene_dir(d, start_old, start_new, m):
    """Converte os cues numéricos (frames locais da cena) pela edição."""
    num = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)
    loc = lambda v: round(m(start_old + v) - start_new) if num(v) else v
    for p in d.get("planos", []):
        p["de"] = loc(p["de"])
    for e in d.get("elementos", []):
        for k in ELEMENT_CUES:
            if k in e:
                e[k] = loc(e[k])
    for keys in d.get("personagens", {}).values():
        for k in keys:
            k["de"] = loc(k["de"])
    for k, v in d.get("sfx", {}).items():
        d["sfx"][k] = loc(v)
    for e in d.get("efeitos", []):
        e["de"] = loc(e["de"])
    for k, v in d.get("fundo", {}).items():
        d["fundo"][k] = [loc(x) for x in v] if isinstance(v, list) else loc(v)
    for t in d.get("tremidas", []):
        t["de"] = loc(t["de"])
    if "texto" in d:
        for k in ("de", "ate"):
            if k in d["texto"]:
                d["texto"][k] = loc(d["texto"][k])
    if "congelar" in d:
        d["congelar"] = loc(d["congelar"])
    for s in d.get("sincronia", []):
        s["frame"] = loc(s["frame"])


def insert_planos(planos, at, by, enquadramento):
    """Plano do inserto + retomada do plano que estava no ar (se o próximo não começar logo)."""
    num = [p for p in planos if isinstance(p["de"], (int, float))]
    active = next((p for p in reversed(num) if p["de"] < at), None)
    resume = at + by
    nxt = min([p["de"] for p in num if p["de"] >= resume] + [float("inf")])
    out = planos + [{"de": at, "enquadramento": enquadramento, "zoom": [1, 1.08], "entrada": "corte", "personagens": []}]
    if active and nxt - resume > 15:
        out.append({**active, "de": resume, "entrada": "corte"})
    return sorted(out, key=lambda p: p["de"] if isinstance(p["de"], (int, float)) else float("inf"))


def apply_json(edit):
    at, n = edit["em"], edit["frames"]
    ep, dr, words, tr = load(P_EP), load(P_DIR), load(P_WORDS), load(P_TR)
    ep_text = open(P_EP, encoding="utf-8").read()
    fps = ep["fps"]
    scene = next(s for s in ep["scenes"] if s["startFrame"] <= at < s["startFrame"] + s["durationInFrames"])
    if n < 0 and at - n > scene["startFrame"] + scene["durationInFrames"]:
        sys.exit(f"remoção em {at} ({n}) atravessa o fim da cena {scene['id']}")
    for w in words:
        a, b = w["startMs"] * fps / 1000, w["endMs"] * fps / 1000
        if n < 0 and b > at and a < at - n:
            sys.exit(f"remoção em {at} ({n}) cortaria a palavra '{w['text']}' ({a:.1f}–{b:.1f})")
    m = mapper(at, n)
    old_starts = {s["id"]: s["startFrame"] for s in ep["scenes"]}
    for s in ep["scenes"]:
        if s is scene:
            s["durationInFrames"] += n
        elif s["startFrame"] > scene["startFrame"]:
            s["startFrame"] += n
    ep["totalFrames"] += n
    new_starts = {s["id"]: s["startFrame"] for s in ep["scenes"]}
    for sid, d in dr["cenas"].items():
        edit_scene_dir(d, old_starts[sid], new_starts[sid], m)
    if n > 0 and edit.get("enquadramento"):
        d = dr["cenas"].setdefault(scene["id"], {})
        d["planos"] = insert_planos(d.get("planos", []), at - new_starts[scene["id"]], n, edit["enquadramento"])
    for h in dr.get("hud", []):
        for k in ("de", "ate", "grandeDe", "grandeAte", "seguraAte", "zeroEm", "travaEm"):
            if k in h:
                h[k] = round(m(h[k]))
    if "legendaDe" in dr:
        dr["legendaDe"] = round(m(dr["legendaDe"]))
    ms = lambda v: round(m(v * fps / 1000) * 1000 / fps)
    for w in words:
        w["startMs"], w["endMs"] = ms(w["startMs"]), ms(w["endMs"])
    lst = tr["words"] if isinstance(tr, dict) else tr
    for w in lst:
        for k in ("start", "end"):
            if k in w:
                w[k] = round(m(w[k] * fps) / fps, 3)
    save_episode(ep_text, ep)
    for p, data in ((P_DIR, dr), (P_WORDS, words), (P_TR, tr)):
        save(p, data)
    print(f"{'+' if n > 0 else ''}{n} frames em {at} (cena {scene['id']}): total {ep['totalFrames']} frames ({ep['totalFrames'] / fps:.2f} s)")


def edit_audio(src, dst, edits, fps):
    """Aplica as edições (na ordem) a um arquivo de narração."""
    tmp = [src]
    for i, e in enumerate(edits):
        at, n = e["em"] / fps, e["frames"] / fps
        out = f"{dst}.tmp{i}.wav"
        if n > 0:
            graph = (f"[0:a]atrim=0:{at},asetpts=PTS-STARTPTS[a];anullsrc=r=44100:cl=mono,atrim=0:{n}[s];"
                     f"[0:a]atrim=start={at},asetpts=PTS-STARTPTS[b];[a][s][b]concat=n=3:v=0:a=1[o]")
        else:
            graph = (f"[0:a]atrim=0:{at},asetpts=PTS-STARTPTS[a];"
                     f"[0:a]atrim=start={at - n},asetpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=0:a=1[o]")
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tmp[-1], "-filter_complex", graph,
                        "-map", "[o]", "-ac", "1", "-ar", "44100", out], check=True)
        tmp.append(out)
    total = load(P_EP)["totalFrames"] / fps
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", tmp[-1], "-af", f"apad=whole_dur={total},atrim=0:{total}",
                    "-ac", "1", "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", dst], check=True)
    subprocess.run(["rm", "-f", *tmp[1:]], check=True)
    print(f"{dst}: {total:.2f} s")


fps = load(P_EP)["fps"]
if CMD == "aplicar":
    edits = load(sys.argv[3])
    log = load(P_LOG) if __import__("os").path.exists(P_LOG) else []
    cur = FINAL if log else BASE
    for e in edits:
        apply_json(e)
    edit_audio(cur, FINAL + ".novo.mp3", edits, fps)
    subprocess.run(["mv", FINAL + ".novo.mp3", FINAL], check=True)
    save(P_LOG, log + edits)
elif CMD == "audio":
    edit_audio(BASE, FINAL, load(P_LOG), fps)
else:
    sys.exit(__doc__)
