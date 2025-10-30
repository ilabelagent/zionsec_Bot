"""
Kingdom Master - Professional audio mastering for Jesus Cartel
RIDE WITH CHRIST
"""

import json
import subprocess
from pathlib import Path
from typing import Dict, Any, Optional
import librosa
import soundfile as sf
import numpy as np

try:
    import pyloudnorm as pyln
except ImportError:
    pyln = None


class KingdomMaster:
    """Professional mastering engine for Kingdom standard releases"""

    def __init__(self, preset_path: Optional[Path] = None):
        """
        Initialize Kingdom Master

        Args:
            preset_path: Path to preset JSON, defaults to kingdom_master.json
        """
        if preset_path is None:
            preset_path = Path(__file__).parent.parent / "presets" / "kingdom_master.json"

        self.preset_path = preset_path
        self.preset = self._load_preset()

    def _load_preset(self) -> Dict[str, Any]:
        """Load mastering preset"""
        with open(self.preset_path, 'r') as f:
            return json.load(f)

    def master(self, input_path: Path, output_path: Path) -> Dict[str, Any]:
        """
        Master audio to Kingdom standards

        Args:
            input_path: Input WAV file
            output_path: Output mastered WAV file

        Returns:
            Dict with results and metrics
        """
        input_path = Path(input_path)
        output_path = Path(output_path)

        results = {
            "success": False,
            "input": str(input_path),
            "output": str(output_path),
            "preset": self.preset["name"],
            "metrics": {}
        }

        # Step 1: Build FFmpeg filter chain
        filter_chain = self._build_filter_chain()

        # Step 2: Apply FFmpeg processing
        temp_path = output_path.with_suffix('.temp.wav')
        ffmpeg_success = self._apply_ffmpeg(input_path, temp_path, filter_chain)

        if not ffmpeg_success:
            results["error"] = "FFmpeg processing failed"
            return results

        # Step 3: Loudness normalization (if pyloudnorm available)
        if pyln:
            self._normalize_loudness(temp_path, output_path)
            temp_path.unlink()
        else:
            temp_path.rename(output_path)

        # Step 4: Analyze final output
        results["metrics"] = self._analyze_output(output_path)
        results["success"] = True

        return results

    def _build_filter_chain(self) -> str:
        """Build FFmpeg audio filter chain from preset"""
        filters = []
        preset_filters = self.preset["filters"]

        # Highpass filter
        if "highpass" in preset_filters:
            filters.append(f"highpass=f={preset_filters['highpass']}")

        # Lowpass filter
        if "lowpass" in preset_filters:
            filters.append(f"lowpass=f={preset_filters['lowpass']}")

        # Denoise (using afftdn)
        if "denoise" in preset_filters and preset_filters["denoise"] > 0:
            filters.append(f"afftdn=nf={preset_filters['denoise']}")

        # De-esser
        if preset_filters.get("deess", {}).get("enabled"):
            deess = preset_filters["deess"]
            filters.append(f"deesser=i={deess['threshold']}:m=0:f={deess['frequency']}")

        # EQ - Low shelf
        if "eq" in preset_filters and "low_shelf" in preset_filters["eq"]:
            eq = preset_filters["eq"]["low_shelf"]
            filters.append(f"equalizer=f={eq['frequency']}:t=s:w=1:g={eq['gain']}")

        # EQ - Presence boost
        if "eq" in preset_filters and "presence" in preset_filters["eq"]:
            eq = preset_filters["eq"]["presence"]
            filters.append(f"equalizer=f={eq['frequency']}:t=h:w={eq['q']}:g={eq['gain']}")

        # EQ - Air/brightness
        if "eq" in preset_filters and "air" in preset_filters["eq"]:
            eq = preset_filters["eq"]["air"]
            filters.append(f"equalizer=f={eq['frequency']}:t=h:w={eq['q']}:g={eq['gain']}")

        # Compression
        if "compression" in preset_filters:
            comp = preset_filters["compression"]
            filters.append(
                f"acompressor=threshold={comp['threshold']}dB:"
                f"ratio={comp['ratio']}:attack={comp['attack']}:"
                f"release={comp['release']}:makeup={comp['makeup']}"
            )

        # Limiter
        if "limiter" in preset_filters:
            lim = preset_filters["limiter"]
            filters.append(f"alimiter=limit={lim['ceiling']}dB:level=false")

        return ",".join(filters)

    def _apply_ffmpeg(self, input_path: Path, output_path: Path, filter_chain: str) -> bool:
        """Apply FFmpeg processing"""
        target_format = self.preset["format"]

        cmd = [
            "ffmpeg", "-y",
            "-i", str(input_path),
            "-af", filter_chain,
            "-ar", str(target_format["sample_rate"]),
            "-sample_fmt", f"s{target_format['bit_depth']}",
            "-c:a", "pcm_s24le",
            str(output_path)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"FFmpeg error: {e.stderr}")
            return False

    def _normalize_loudness(self, input_path: Path, output_path: Path):
        """Normalize loudness to target LUFS using pyloudnorm"""
        target_lufs = self.preset["target_levels"]["lufs"]

        # Load audio
        data, rate = sf.read(input_path)

        # Measure loudness
        meter = pyln.Meter(rate)
        loudness = meter.integrated_loudness(data)

        # Normalize
        normalized_audio = pyln.normalize.loudness(data, loudness, target_lufs)

        # Apply peak limiting
        peak_target = self.preset["target_levels"]["peak"]
        peak = np.max(np.abs(normalized_audio))
        if peak > 10 ** (peak_target / 20):
            normalized_audio = normalized_audio * (10 ** (peak_target / 20) / peak)

        # Save
        sf.write(output_path, normalized_audio, rate, subtype='PCM_24')

    def _analyze_output(self, audio_path: Path) -> Dict[str, Any]:
        """Analyze mastered output"""
        try:
            y, sr = librosa.load(audio_path, sr=None, mono=False)

            # Convert to mono for analysis
            if len(y.shape) > 1:
                y_mono = librosa.to_mono(y)
            else:
                y_mono = y

            # RMS level
            rms = librosa.feature.rms(y=y_mono)[0]
            rms_db = 20 * np.log10(np.mean(rms) + 1e-10)

            # Peak level
            peak = np.max(np.abs(y))
            peak_db = 20 * np.log10(peak + 1e-10)

            # Dynamic range
            dynamic_range = peak_db - rms_db

            # LUFS (if pyloudnorm available)
            lufs = None
            if pyln:
                data, rate = sf.read(audio_path)
                meter = pyln.Meter(rate)
                lufs = meter.integrated_loudness(data)

            return {
                "sample_rate": int(sr),
                "duration": float(librosa.get_duration(y=y_mono, sr=sr)),
                "rms_db": float(rms_db),
                "peak_db": float(peak_db),
                "dynamic_range_db": float(dynamic_range),
                "lufs": float(lufs) if lufs is not None else None,
                "channels": y.shape[0] if len(y.shape) > 1 else 1
            }

        except Exception as e:
            return {"error": str(e)}


def master_audio(input_path: str, output_path: str, preset: Optional[str] = None) -> Dict[str, Any]:
    """
    Master audio file to Kingdom standards

    Args:
        input_path: Input audio file
        output_path: Output mastered file
        preset: Optional preset path

    Returns:
        Mastering results
    """
    master = KingdomMaster(Path(preset) if preset else None)
    return master.master(Path(input_path), Path(output_path))


if __name__ == "__main__":
    import sys
    import argparse

    parser = argparse.ArgumentParser(description="Kingdom Master - Professional Audio Mastering")
    parser.add_argument("input", help="Input audio file")
    parser.add_argument("output", help="Output mastered file")
    parser.add_argument("--preset", help="Preset JSON file", default=None)

    args = parser.parse_args()

    result = master_audio(args.input, args.output, args.preset)
    print(json.dumps(result, indent=2))
