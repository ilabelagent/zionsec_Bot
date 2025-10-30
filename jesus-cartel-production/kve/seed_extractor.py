"""
seed_extractor.py
===================

Extract small "seed" segments from a longer audio file.  These seeds can be
used for tasks such as inpainting damaged regions, generating noise profiles
or simply cutting together alternate takes.  The script allows the number
of seeds and their duration to be configured.

Example:

```
python seed_extractor.py --input path/to/vocals.wav --output seeds/ --num-seeds 5 --seed-duration 0.5
```

This will produce five half‑second WAV files in the `seeds/` directory.
"""

import argparse
from pathlib import Path
from typing import List

import numpy as np
import librosa
import soundfile as sf


def extract_seeds(
    input_path: Path,
    output_dir: Path,
    num_seeds: int = 10,
    seed_duration: float = 0.5,
    random_offset: bool = False,
) -> List[Path]:
    """Extract multiple short segments from an audio file.

    Parameters
    ----------
    input_path: Path
        Path to the source audio file (any format supported by librosa).
    output_dir: Path
        Directory where the extracted seeds should be saved.  It will be
        created if it does not exist.
    num_seeds: int, default=10
        The number of seeds to extract from the recording.
    seed_duration: float, default=0.5
        Length of each seed in seconds.
    random_offset: bool, default=False
        If True, randomly jitter the start of each seed within its bin by up to
        half the seed length.  This can help avoid extracting identical
        segments when the input is very repetitive.

    Returns
    -------
    List[Path]
        Paths to the files that were written.
    """
    # Load the full audio file into memory
    y, sr = librosa.load(input_path, sr=None, mono=True)
    total_samples = len(y)
    seed_samples = int(seed_duration * sr)
    if seed_samples <= 0:
        raise ValueError("Seed duration must be positive and result in at least one sample.")
    if total_samples < seed_samples:
        raise ValueError(
            f"Input recording too short ({total_samples/sr:.2f}s) for a seed of {seed_duration}s"
        )

    output_dir.mkdir(parents=True, exist_ok=True)

    # Compute equally spaced start points across the file
    # We leave a margin of half a seed at either end to avoid clipping
    margin = seed_samples // 2
    usable_samples = total_samples - 2 * margin
    if usable_samples <= 0:
        raise ValueError("Input recording is too short after accounting for margins.")

    step = max(1, usable_samples // num_seeds)
    starts = [margin + i * step for i in range(num_seeds)]

    extracted_paths = []
    for idx, start in enumerate(starts):
        # Optionally randomise within ±half the seed length
        if random_offset:
            jitter = np.random.randint(-seed_samples // 4, seed_samples // 4)
            s = max(margin, min(start + jitter, total_samples - margin - seed_samples))
        else:
            s = start
        end = s + seed_samples
        segment = y[s:end]
        out_path = output_dir / f"seed_{idx+1:02d}.wav"
        sf.write(out_path, segment, sr)
        extracted_paths.append(out_path)
    return extracted_paths


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract seed segments from audio.")
    parser.add_argument(
        "--input", "-i", type=Path, required=True, help="Path to input audio file"
    )
    parser.add_argument(
        "--output", "-o", type=Path, required=True, help="Directory to save extracted seeds"
    )
    parser.add_argument(
        "--num-seeds", "-n", type=int, default=10, help="Number of seeds to extract"
    )
    parser.add_argument(
        "--seed-duration",
        "-d",
        type=float,
        default=0.5,
        help="Length of each seed in seconds",
    )
    parser.add_argument(
        "--random-offset",
        action="store_true",
        help="Randomly jitter seed start positions within each bin",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    seeds = extract_seeds(
        args.input,
        args.output,
        num_seeds=args.num_seeds,
        seed_duration=args.seed_duration,
        random_offset=args.random_offset,
    )
    print(f"Extracted {len(seeds)} seeds:")
    for p in seeds:
        print(" ", p)


if __name__ == "__main__":
    main()