"""Monta os WAVs finais do EP01: apara silêncio, aplica um ganho único e concatena."""
import json, subprocess, sys
import numpy as np

SR = 44100
ROOT = sys.argv[1]  # .../VIDA_DE_ATLETA_EP01/01_NARRACAO
TAKES = {1: "A", 2: "A", 3: "A", 4: "B", 5: "B", 6: "A", 7: "A"}
PAD = 0.12          # respiro mantido antes/depois da fala (s)
GAP = 0.30          # silêncio entre cenas na versão contínua (s)
TARGET_LUFS = -16.0
THRESH_DB = -45.0


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1",
                          "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def speech_bounds(x):
    win = int(0.01 * SR)
    n = len(x) // win
    rms = np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    idx = np.where(db > THRESH_DB)[0]
    return idx[0] * win, (idx[-1] + 1) * win


def write_wav(path, x):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1",
                    "-i", "-", "-c:a", "pcm_s24le", path], input=x.astype(np.float32).tobytes(),
                   check=True)


def measure(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af",
                          "loudnorm=print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return json.loads(out[out.rindex("{"): out.rindex("}") + 1])


scenes, info = [], []
for n, t in TAKES.items():
    x = load(f"{ROOT}/takes_originais_mp3/cena_{n:02d}_{t}.mp3")
    s, e = speech_bounds(x)
    p = int(PAD * SR)
    y = x[max(0, s - p): min(len(x), e + p)]
    scenes.append(y)
    info.append({"cena": n, "take": t, "original_s": round(len(x) / SR, 2),
                 "lead_trim_s": round(max(0, s - p) / SR, 2),
                 "tail_trim_s": round((len(x) - min(len(x), e + p)) / SR, 2)})

gap = np.zeros(int(GAP * SR), dtype=np.float32)
full = np.concatenate([np.concatenate([sc, gap]) if i < 6 else sc for i, sc in enumerate(scenes)])
tmp = f"{ROOT}/_tmp_full.wav"
write_wav(tmp, full)
m = measure(tmp)
gain_db = TARGET_LUFS - float(m["input_i"])
# não deixa o pico passar de -1.0 dBTP
gain_db = min(gain_db, -1.0 - float(m["input_tp"]))
g = 10 ** (gain_db / 20)

t0 = 0.0
for i, y in enumerate(scenes):
    write_wav(f"{ROOT}/cena_{i + 1:02d}.wav", y * g)
    d = len(y) / SR
    info[i].update({"final_s": round(d, 2), "inicio_na_narracao_s": round(t0, 2),
                    "fim_na_narracao_s": round(t0 + d, 2)})
    t0 += d + GAP
write_wav(f"{ROOT}/narracao_completa.wav", full * g)
subprocess.run(["rm", tmp])
mf = measure(f"{ROOT}/narracao_completa.wav")
print(json.dumps({"gain_db": round(gain_db, 2), "full_s": round(len(full) / SR, 2),
                  "full_lufs": mf["input_i"], "full_tp": mf["input_tp"], "cenas": info},
                 indent=1, ensure_ascii=False))
