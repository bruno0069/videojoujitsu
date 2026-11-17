"""Gera out/legendas.srt a partir de src/timings.json.

Usa a mesma regra de duração das cenas de src/timeline.ts:
frames = ceil((audioDuration + 0.4) * 30).
"""
import json, math, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS, BREATH = 30, 0.4


def ts(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


d = json.load(open(os.path.join(ROOT, "src", "timings.json")))
offset_frames = 0
lines, n = [], 0
for sc in d["scenes"]:
    off = offset_frames / FPS
    caps = sc["captions"]
    for i, c in enumerate(caps):
        n += 1
        # Mesma regra do componente <Subtitles>: começa no início da fala
        # e termina no fim da fala (sem invadir a próxima frase).
        end = min(c["end"], caps[i + 1]["start"]) if i + 1 < len(caps) else c["end"]
        lines += [str(n), f"{ts(off + c['start'])} --> {ts(off + end)}", c["text"], ""]
    offset_frames += math.ceil((sc["audioDuration"] + BREATH) * FPS)

os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
open(os.path.join(ROOT, "out", "legendas.srt"), "w", encoding="utf-8").write("\n".join(lines))
print(f"{n} legendas; fim do vídeo em {offset_frames / FPS:.2f}s ({offset_frames} frames)")
