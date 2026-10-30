#!/usr/bin/env python3
"""Mixagem final por stems. Recebe o vídeo renderizado e os dois stems de áudio renderizados
pelo Remotion (entrada `stem`: "voz" e "fundo") e grava o vídeo com o áudio final.

  voz   -> compressor 3:1 + ganho + limitador, até -14 LUFS e pico real <= -1,5 dBTP
  fundo -> ganho até -30 LUFS (música com passa-altas + efeitos, já com duck pela fala)
  mix   -> voz + fundo, limitador, ajuste fino até -14 LUFS, pico real <= -1,5 dBTP, LRA <= 8

Também mede o fundo e a voz só nos trechos com fala (distância voz/fundo sob a fala).
Os stems processados e as medidas ficam em out/stems/<episódio>/.

Uso: python3 scripts/mixar.py out/ep01.mp4 out/stems/voz.wav out/stems/fundo.wav
No fim, normalização em duas passadas de loudnorm (-14 LUFS) antes de juntar ao vídeo.
"""
import json
import re
import subprocess
import sys

video, voz_in, fundo_in = sys.argv[1:4]
EP = __import__("os").path.basename(video).split(".")[0].split("-")[0]  # out/ep02.mp4 -> ep02
OUT = f"out/stems/{EP}"
VOZ_ALVO, FUNDO_ALVO, MIX_ALVO, PICO_MAX = -14.0, -30.0, -14.0, -1.5
COMP = "acompressor=threshold=-26dB:ratio=3:attack=5:release=150"
LIM = lambda limit: f"alimiter=limit={limit:.3f}:attack=1:release=60:level=disabled"
PICO_MIX = -1.8  # margem para a codificação AAC não passar de -1,5 dBTP no mp4


def ff(*args):
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], check=True)


def medir(path, af=None):
    chain = (af + "," if af else "") + "ebur128=peak=true"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", chain, "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    resumo = r[r.rindex("Summary:"):]
    i = float(re.search(r"I:\s+(-?[\d.]+) LUFS", resumo).group(1))
    lra = float(re.search(r"LRA:\s+(-?[\d.]+) LU", resumo).group(1))
    tp = float(re.search(r"Peak:\s+(-?[\d.inf]+) dBFS", resumo).group(1))
    return i, lra, tp


def ajustar(nome, entrada, saida, cadeia, alvo, pico=True):
    """Procura o ganho que leva `entrada` ao alvo e grava `saida`. Se o volume já está no alvo
    mas o pico real passa do limite, baixa o teto do limitador em 1 dB e tenta de novo."""
    limit = 0.75
    i0, _, _ = medir(entrada, cadeia("0", limit))
    ganho = alvo - i0
    for _ in range(10):
        ff("-i", entrada, "-af", cadeia(f"{ganho:.2f}", limit), "-ar", "48000", "-c:a", "pcm_s24le", saida)
        i, lra, tp = medir(saida)
        if abs(i - alvo) <= 0.3 and (not pico or tp <= PICO_MAX):
            break
        if abs(i - alvo) <= 0.3:
            limit *= 0.89
        ganho += alvo - i
    print(f"{nome}: ganho {ganho:+.2f} dB -> I={i:.1f} LUFS, LRA={lra:.1f} LU, pico real={tp:.1f} dBTP")
    return i, lra, tp


# Trechos com fala (mesma regra do duck: pausas < 0,4 s contam como fala contínua)
ep = json.load(open(f"src/episodes/{EP}.json", encoding="utf-8"))
# Sem arquivo de palavras = episódio ainda sem narração gravada: mixa só o fundo (e avisa)
sem_voz = not __import__("os").path.exists(f"src/audio/{EP}-words.json")
words = [] if sem_voz else json.load(open(f"src/audio/{EP}-words.json", encoding="utf-8"))
if sem_voz:
    print("ATENÇÃO: sem narração (src/audio/%s-words.json não existe) — o mix é só música e efeitos" % EP)
spans = []
for w in sorted(words, key=lambda w: w["startMs"]):
    if spans and w["startMs"] - spans[-1][1] <= 400:
        spans[-1][1] = max(spans[-1][1], w["endMs"])
    else:
        spans.append([w["startMs"], w["endMs"]])
so_fala = "aselect='" + "+".join(f"between(t,{a / 1000:.3f},{b / 1000:.3f})" for a, b in spans) + "',asetpts=N/SR/TB"

voz = f"{OUT}/voz-final.wav"
fundo = f"{OUT}/fundo-final.wav"
mix = f"{OUT}/mix-final.wav"
rv = (0, 0, 0) if sem_voz else ajustar("voz", voz_in, voz, lambda g, lim: f"{COMP},volume={g}dB,{LIM(lim)}", VOZ_ALVO)
rf = ajustar("fundo", fundo_in, fundo, lambda g, lim: f"volume={g}dB", FUNDO_ALVO, pico=False)
if sem_voz:
    voz = fundo  # amix de fundo + silêncio não muda nada; abaixo o fundo vira o mix

# Mix: soma sem normalizar, limitador e ajuste fino de ganho
ganho, limit = 0.0, 0.75
for _ in range(10):
    ff("-i", voz, "-i", fundo, "-filter_complex",
       (f"[1:a]volume={ganho:.2f}dB,{LIM(limit)}[m]" if sem_voz else
        f"[0:a][1:a]amix=inputs=2:normalize=0:duration=longest,volume={ganho:.2f}dB,{LIM(limit)}[m]"),
       "-map", "[m]", "-ar", "48000", "-c:a", "pcm_s24le", mix)
    rm = medir(mix)
    if abs(rm[0] - MIX_ALVO) <= 0.1 and rm[2] <= PICO_MIX:
        break
    if abs(rm[0] - MIX_ALVO) <= 0.1:
        limit *= 0.89
    ganho += MIX_ALVO - rm[0]
print(f"mix: ajuste {ganho:+.2f} dB -> I={rm[0]:.1f} LUFS, LRA={rm[1]:.1f} LU, pico real={rm[2]:.1f} dBTP")

vf = ff_ = float("nan")
if not sem_voz:
    vf = medir(voz, so_fala)[0]
    ff_ = medir(fundo, so_fala)[0]
    print(f"sob a fala: voz {vf:.1f} LUFS, fundo {ff_:.1f} LUFS -> fundo {vf - ff_:.1f} dB abaixo da voz")

# Normalização final em duas passadas de loudnorm (mede, depois aplica com os valores medidos,
# em modo linear): o arquivo final fica em -14 LUFS integrados em qualquer episódio
def loudnorm2(src, dst, alvo=MIX_ALVO, tp=PICO_MIX):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", f"loudnorm=I={alvo}:TP={tp}:LRA=11:print_format=json",
                        "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    ff("-i", src, "-af",
       f"loudnorm=I={alvo}:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
       f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",
       "-ar", "48000", "-c:a", "pcm_s24le", dst)
    return float(m["input_i"])


antes = loudnorm2(mix, f"{OUT}/mix-norm.wav")
subprocess.run(["mv", f"{OUT}/mix-norm.wav", mix], check=True)
rm = medir(mix)
print(f"loudnorm (2 passadas): {antes:.1f} -> I={rm[0]:.1f} LUFS, pico real={rm[2]:.1f} dBTP")

# A codificação AAC pode passar o pico real do limite: se passar, baixa o teto e codifica de novo
teto = None
for _ in range(5):
    af = ["-af", LIM(teto)] if teto else []
    ff("-i", video, "-i", mix, "-map", "0:v", "-map", "1:a", *af, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
       "-ar", "48000", "-shortest", video + ".tmp.mp4")
    rmp4 = medir(video + ".tmp.mp4")
    if rmp4[2] <= PICO_MAX:
        break
    teto = (teto or 0.75) * 0.93
subprocess.run(["mv", video + ".tmp.mp4", video], check=True)
print(f"{video}: I={rmp4[0]:.1f} LUFS, LRA={rmp4[1]:.1f} LU, pico real={rmp4[2]:.1f} dBTP")

with open(f"{OUT}/medidas.json", "w", encoding="utf-8") as f:
    json.dump({
        "voz": dict(zip(["I", "LRA", "TP"], rv)),
        "fundo": dict(zip(["I", "LRA", "TP"], rf)),
        "mix": dict(zip(["I", "LRA", "TP"], rm)),
        "mp4": dict(zip(["I", "LRA", "TP"], rmp4)),
        "sobFala": {"voz": vf, "fundo": ff_, "distancia": vf - ff_},
    }, f, indent=2)
