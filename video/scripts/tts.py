"""Gera a narração (um MP3 por cena) com edge-tts e mede as durações reais.

Uso: python3 scripts/tts.py [rate]   (rate ex.: "+0%", "+5%")
Saída: public/voz/<cena>.mp3 e src/timings.json
"""
import asyncio, json, os, subprocess, sys

import edge_tts

VOICE = "pt-BR-AntonioNeural"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATE = sys.argv[1] if len(sys.argv) > 1 else "+0%"
PROXY = os.environ.get("HTTPS_PROXY")


def probe(path: str) -> float:
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", path]).decode().strip()
    return float(out)


async def synth(text: str, path: str):
    comm = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=PROXY, boundary="SentenceBoundary")
    bounds = []
    with open(path, "wb") as f:
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "SentenceBoundary":
                bounds.append({
                    "start": chunk["offset"] / 1e7,
                    "end": (chunk["offset"] + chunk["duration"]) / 1e7,
                    "text": chunk["text"],
                })
    return bounds


async def main():
    script = json.load(open(os.path.join(ROOT, "scripts", "script.json")))
    os.makedirs(os.path.join(ROOT, "public", "voz"), exist_ok=True)
    result = {"rate": RATE, "scenes": []}
    for scene in script["scenes"]:
        mp3 = os.path.join(ROOT, "public", "voz", f"{scene['id']}.mp3")
        sents = scene["sentences"]
        bounds = await synth(" ".join(s["tts"] for s in sents), mp3)
        dur = probe(mp3)
        if len(bounds) != len(sents):
            print(f"!! {scene['id']}: {len(bounds)} limites vs {len(sents)} frases", file=sys.stderr)
            for b in bounds:
                print("   ", b, file=sys.stderr)
            sys.exit(1)
        caps = []
        for s, b in zip(sents, bounds):
            caps.append({"text": s["display"], "start": round(b["start"], 3), "end": round(b["end"], 3), "spoken": b["text"]})
        result["scenes"].append({"id": scene["id"], "audio": f"voz/{scene['id']}.mp3", "audioDuration": round(dur, 3), "captions": caps})
        print(f"{scene['id']}: {dur:.2f}s")
    total = sum(s["audioDuration"] + 0.4 for s in result["scenes"])
    result["total"] = round(total, 3)
    print(f"TOTAL (com respiros): {total:.2f}s")
    json.dump(result, open(os.path.join(ROOT, "src", "timings.json"), "w"), ensure_ascii=False, indent=1)


asyncio.run(main())
