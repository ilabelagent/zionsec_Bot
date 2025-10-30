import json, numpy as np, soundfile as sf, librosa, pyloudnorm as pyln
from pathlib import Path
def analyze_audio(path: str):
    p = Path(path)
    try:
        y, sr = librosa.load(path, sr=None, mono=True)
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        pc = chroma.mean(axis=1)
        import numpy as np
        major = np.array([1,0,0,0,1,0,0,1,0,0,0,0])
        minor = np.array([1,0,0,1,0,0,0,1,0,0,1,0])
        maj_scores = [np.roll(major, k) @ pc for k in range(12)]
        min_scores = [np.roll(minor, k) @ pc for k in range(12)]
        mk, mik = int(np.argmax(maj_scores)), int(np.argmax(min_scores))
        keys = ['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B']
        key_guess = f"{keys[mk]} major" if maj_scores[mk] >= min_scores[mik] else f"{keys[mik]} minor"
        meter = pyln.Meter(sr)
        lufs = float(meter.integrated_loudness(y))
        return {"path": str(p), "sr": sr, "tempo_bpm": float(tempo), "key": key_guess, "lufs": lufs}
    except Exception as e:
        return {"path": str(p), "error": str(e)}
if __name__ == "__main__":
    import sys
    out = [analyze_audio(x) for x in sys.argv[1:]]
    print(json.dumps(out, indent=2))
