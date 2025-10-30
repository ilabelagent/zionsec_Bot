"""
Audio Analyzer Module
Analyzes audio files to extract musical characteristics for visual prompt generation
"""

import librosa
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional
import json


class AudioAnalyzer:
    """Analyze audio files to extract musical and emotional characteristics"""

    def __init__(self, sr: int = 22050):
        """
        Initialize the analyzer

        Args:
            sr: Sample rate for audio loading (default 22050 for efficiency)
        """
        self.sr = sr

    def analyze(self, audio_path: Path, duration: Optional[float] = None) -> Dict[str, Any]:
        """
        Comprehensive audio analysis

        Args:
            audio_path: Path to audio file
            duration: Optional duration limit (None = full file)

        Returns:
            Dictionary with musical characteristics
        """
        # Load audio
        y, sr = librosa.load(audio_path, sr=self.sr, duration=duration)

        # Tempo and beat analysis
        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)

        # Energy and dynamics
        rms = librosa.feature.rms(y=y)[0]
        energy = float(np.mean(rms))
        energy_variance = float(np.std(rms))

        # Spectral characteristics
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        zcr = librosa.feature.zero_crossing_rate(y)[0]

        # Harmonic and percussive separation
        y_harmonic, y_percussive = librosa.effects.hpss(y)
        harmonic_ratio = float(np.mean(np.abs(y_harmonic)) / (np.mean(np.abs(y)) + 1e-6))
        percussive_ratio = float(np.mean(np.abs(y_percussive)) / (np.mean(np.abs(y)) + 1e-6))

        # Chroma (key/harmony)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        chroma_mean = chroma.mean(axis=1)
        dominant_note = int(np.argmax(chroma_mean))

        # MFCC for timbre
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)

        # Onset strength (rhythm)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onset_strength = float(np.mean(onset_env))

        # Duration
        total_duration = float(librosa.get_duration(y=y, sr=sr))

        return {
            # Tempo and rhythm
            "tempo": float(tempo),
            "tempo_confidence": float(np.std(beats) if len(beats) > 1 else 0),
            "beat_count": int(len(beats)),
            "onset_strength": onset_strength,

            # Energy and dynamics
            "energy": energy,
            "energy_variance": energy_variance,
            "dynamic_range": float(np.max(rms) - np.min(rms)),

            # Spectral characteristics
            "spectral_centroid_mean": float(np.mean(spectral_centroid)),
            "spectral_centroid_std": float(np.std(spectral_centroid)),
            "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
            "brightness": float(np.mean(spectral_centroid) / (sr / 2)),  # Normalized 0-1
            "zero_crossing_rate": float(np.mean(zcr)),

            # Harmonic content
            "harmonic_ratio": harmonic_ratio,
            "percussive_ratio": percussive_ratio,
            "dominant_note": dominant_note,
            "dominant_note_name": self._note_name(dominant_note),
            "chroma_mean": chroma_mean.tolist(),

            # Timbre
            "mfcc_mean": mfcc.mean(axis=1).tolist(),
            "mfcc_std": mfcc.std(axis=1).tolist(),

            # Duration
            "duration": total_duration,

            # Derived characteristics
            "characteristics": self._derive_characteristics(
                tempo=float(tempo),
                energy=energy,
                brightness=float(np.mean(spectral_centroid) / (sr / 2)),
                harmonic_ratio=harmonic_ratio,
                percussive_ratio=percussive_ratio,
                energy_variance=energy_variance
            )
        }

    def _note_name(self, note_index: int) -> str:
        """Convert chroma index to note name"""
        notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        return notes[note_index % 12]

    def _derive_characteristics(self, tempo: float, energy: float, brightness: float,
                                harmonic_ratio: float, percussive_ratio: float,
                                energy_variance: float) -> Dict[str, Any]:
        """
        Derive high-level musical characteristics from raw features

        Returns descriptive tags useful for prompt generation
        """
        characteristics = {
            "tags": [],
            "mood": [],
            "visual_style": [],
            "movement": [],
            "colors": []
        }

        # Tempo-based tags
        if tempo < 80:
            characteristics["tags"].extend(["slow", "contemplative"])
            characteristics["movement"].append("slow camera movements")
        elif tempo < 120:
            characteristics["tags"].extend(["moderate", "steady"])
            characteristics["movement"].append("steady camera pans")
        elif tempo < 140:
            characteristics["tags"].extend(["upbeat", "energetic"])
            characteristics["movement"].append("dynamic camera movement")
        else:
            characteristics["tags"].extend(["fast", "intense"])
            characteristics["movement"].append("rapid camera cuts")

        # Energy-based mood
        if energy < 0.05:
            characteristics["mood"].extend(["calm", "peaceful", "ambient"])
            characteristics["colors"].extend(["soft blues", "pastels", "gentle whites"])
        elif energy < 0.15:
            characteristics["mood"].extend(["relaxed", "mellow"])
            characteristics["colors"].extend(["warm tones", "earth colors"])
        elif energy < 0.25:
            characteristics["mood"].extend(["uplifting", "positive"])
            characteristics["colors"].extend(["bright colors", "yellows", "oranges"])
        else:
            characteristics["mood"].extend(["powerful", "intense", "dramatic"])
            characteristics["colors"].extend(["bold colors", "deep reds", "electric blues"])

        # Brightness-based visuals
        if brightness < 0.3:
            characteristics["visual_style"].extend(["dark", "moody", "shadowy"])
            characteristics["colors"].extend(["deep purples", "dark blues"])
        elif brightness < 0.6:
            characteristics["visual_style"].extend(["balanced", "natural"])
        else:
            characteristics["visual_style"].extend(["bright", "luminous", "glowing"])
            characteristics["colors"].extend(["bright whites", "golden light"])

        # Harmonic vs Percussive
        if harmonic_ratio > percussive_ratio * 1.5:
            characteristics["tags"].extend(["melodic", "harmonic"])
            characteristics["visual_style"].extend(["flowing", "organic shapes"])
        elif percussive_ratio > harmonic_ratio * 1.5:
            characteristics["tags"].extend(["rhythmic", "percussive"])
            characteristics["visual_style"].extend(["geometric", "sharp angles"])
        else:
            characteristics["tags"].append("balanced")

        # Energy variance (dynamics)
        if energy_variance > 0.05:
            characteristics["tags"].append("dynamic")
            characteristics["movement"].append("varying intensity")
        else:
            characteristics["tags"].append("consistent")
            characteristics["movement"].append("smooth transitions")

        return characteristics

    def analyze_segments(self, audio_path: Path, segment_duration: float = 30.0) -> list[Dict[str, Any]]:
        """
        Analyze audio in segments for medley/long-form content

        Args:
            audio_path: Path to audio file
            segment_duration: Duration of each segment in seconds

        Returns:
            List of analysis results for each segment
        """
        # Get total duration
        y, sr = librosa.load(audio_path, sr=self.sr, duration=1)  # Just to get sr
        total_duration = librosa.get_duration(path=audio_path)

        segments = []
        num_segments = int(np.ceil(total_duration / segment_duration))

        for i in range(num_segments):
            offset = i * segment_duration
            duration = min(segment_duration, total_duration - offset)

            # Load segment
            y_seg, sr = librosa.load(audio_path, sr=self.sr, offset=offset, duration=duration)

            # Create temporary file for analysis
            # (We could optimize this by passing y directly)
            analysis = self.analyze(audio_path, duration=duration)
            analysis["segment_index"] = i
            analysis["segment_start"] = offset
            analysis["segment_end"] = offset + duration

            segments.append(analysis)

        return segments

    def to_json(self, analysis: Dict[str, Any], indent: int = 2) -> str:
        """Convert analysis to JSON string"""
        return json.dumps(analysis, indent=indent)

    def suggest_genre(self, analysis: Dict[str, Any]) -> str:
        """
        Suggest genre based on analysis
        (Basic heuristic - can be improved with ML)
        """
        tempo = analysis["tempo"]
        energy = analysis["energy"]
        brightness = analysis["brightness"]
        percussive = analysis["percussive_ratio"]

        if tempo < 90 and energy < 0.1:
            return "ambient/drone"
        elif tempo < 100 and brightness < 0.4:
            return "lo-fi/chillhop"
        elif 120 <= tempo <= 135 and percussive > 0.6:
            return "house/techno"
        elif tempo > 140 and energy > 0.3:
            return "drum and bass/breakbeat"
        elif 80 <= tempo <= 110 and energy > 0.2:
            return "hip-hop/trap"
        elif tempo > 150 and percussive > 0.7:
            return "hardcore/metal"
        else:
            return "electronic/experimental"


# Convenience function
def analyze_audio(audio_path: str, **kwargs) -> Dict[str, Any]:
    """Quick analysis function"""
    analyzer = AudioAnalyzer()
    return analyzer.analyze(Path(audio_path), **kwargs)


if __name__ == "__main__":
    # Test example
    import sys
    if len(sys.argv) > 1:
        result = analyze_audio(sys.argv[1])
        print(json.dumps(result, indent=2))
        print("\nSuggested genre:", AudioAnalyzer().suggest_genre(result))
    else:
        print("Usage: python audio_analyzer.py <audio_file>")
