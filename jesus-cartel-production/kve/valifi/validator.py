"""
Internal audio analysis functions for the valifi module.

This module relies on soundfile and pyloudnorm to extract basic
statistics from an audio file, such as sample rate, channel count,
duration, integrated loudness (LUFS) and true peak.  Separating
analysis into a dedicated module makes it easy to reuse in other
contexts beyond simple validation.
"""
from __future__ import annotations

from typing import Dict, Any
import numpy as np
import soundfile as sf
import pyloudnorm as pyln

def analyse_audio(path: str) -> Dict[str, Any]:
    """
    Analyse an audio file and extract basic statistics.

    Parameters
    ----------
    path:
        Path to a WAV/FLAC/AIFF file.

    Returns
    -------
    dict
        A dictionary containing:

        ``sample_rate`` (int)
            The sample rate of the file.

        ``channels`` (int)
            Number of channels.

        ``duration_seconds`` (float)
            Duration of the file in seconds.

        ``lufs`` (float | None)
            Integrated loudness (LUFS), or ``None`` if measurement fails.

        ``true_peak_dbfs`` (float | None)
            True peak value in dBFS, or ``None`` if measurement fails.
    """
    # Read the audio file.  ``always_2d=True`` ensures a 2D array even
    # when the file is mono.  ``dtype='float32'`` normalises the data to
    # the range [−1, 1] and provides a consistent type for loudness
    # measurement.
    try:
        data, sr = sf.read(path, always_2d=True, dtype="float32")
    except Exception:
        # If reading fails (unsupported format, missing file etc.) then
        # return None for all properties.  The caller can handle this
        # appropriately.
        return {
            "sample_rate": None,
            "channels": None,
            "duration_seconds": None,
            "lufs": None,
            "true_peak_dbfs": None,
        }

    channels = data.shape[1]
    duration = len(data) / sr

    # For loudness measurement we convert to mono by averaging channels.
    mono = np.mean(data, axis=1)
    lufs = None
    true_peak = None
    try:
        meter = pyln.Meter(sr)
        lufs = float(meter.integrated_loudness(mono))
        # True peak measurement.  ``measure_true_peak`` returns the peak in
        # dBFS relative to full scale (0 dBFS).  Negative values are
        # expected for valid audio.  If measurement fails it will raise
        # or return an invalid number.
        true_peak = float(pyln.measure_true_peak(mono, sr))
    except Exception:
        # If loudness measurement fails (e.g., all zeros or NaNs), keep
        # lufs/true_peak as None.
        pass

    return {
        "sample_rate": sr,
        "channels": channels,
        "duration_seconds": duration,
        "lufs": lufs,
        "true_peak_dbfs": true_peak,
    }