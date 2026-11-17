"""Transcreve public/voz/*.mp3 com Whisper local para conferir a narração."""
import subprocess

import numpy as np
from faster_whisper import WhisperModel


def load(path):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"])
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768.0


m = WhisperModel("small", device="cpu", compute_type="int8")
for i in range(1, 6):
    segs, _ = m.transcribe(load(f"public/voz/cena{i}.mp3"), language="pt", beam_size=5)
    print(f"== cena{i}: " + " ".join(s.text.strip() for s in segs), flush=True)
