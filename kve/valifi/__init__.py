"""
valifi
======

The :mod:`kve.valifi` package provides a simple validation framework for
audio files.  It was designed as part of the Kingdom Vocal Engine to
help ensure that input and output audio adheres to a set of expected
properties such as sample rate, bit depth, loudness and channel count.

The package exposes two high-level functions:

``init_valifi(project_root: str) -> str``
    Create a ``.valifi`` folder in the given project directory and write
    a default configuration file.  This is intended to be run once when
    setting up a new project repository.  If the folder already exists,
    it is left untouched.

``validate_audio(path: str, config_path: Optional[str] = None) -> dict``
    Load an audio file from ``path`` and check it against the rules
    defined in the configuration.  A summary dictionary is returned
    containing the observed properties (sample rate, channels, duration,
    estimated loudness) and boolean flags indicating whether each
    property meets the configured requirements.

The module also exposes a command line interface when executed as a
module.  See ``python -m kve.valifi --help`` for details.

"""
from pathlib import Path
from typing import Optional, Dict, Any
import yaml
import json
import argparse

from .validator import analyse_audio

# Default configuration values for a new Valifi installation
DEFAULT_CONFIG = {
    "sample_rate": 44100,
    "channels": 2,
    "min_duration_seconds": 1.0,
    "target_lufs": -16.0,
    "lufs_tolerance": 2.0,
    "max_true_peak_dbfs": -1.0,
}

def init_valifi(project_root: str) -> str:
    """
    Initialise the valifi system in the given repository.

    Parameters
    ----------
    project_root:
        Path to the root of your repository.  A folder called
        ``.valifi`` will be created here containing a default
        ``config.yaml`` file.  If the folder already exists, no action
        is taken.

    Returns
    -------
    str
        The path to the created configuration file.
    """
    root = Path(project_root).resolve()
    valifi_dir = root / ".valifi"
    valifi_dir.mkdir(parents=True, exist_ok=True)
    config_file = valifi_dir / "config.yaml"
    if not config_file.exists():
        with open(config_file, "w", encoding="utf-8") as f:
            yaml.safe_dump(DEFAULT_CONFIG, f)
    return str(config_file)

def load_config(config_path: Optional[str] = None) -> dict:
    """
    Load configuration from YAML.  If ``config_path`` is None then a
    search up the directory tree is performed until a ``.valifi`` folder
    is found.  If no configuration is found the default configuration is
    returned.
    """
    if config_path is not None:
        config_file = Path(config_path)
        if config_file.is_file():
            with open(config_file, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        raise FileNotFoundError(f"Valifi configuration not found at {config_path}")
    # Find .valifi directory
    cwd = Path.cwd()
    for parent in [cwd] + list(cwd.parents):
        possible = parent / ".valifi" / "config.yaml"
        if possible.is_file():
            with open(possible, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
    return DEFAULT_CONFIG

def validate_audio(path: str, config_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate an audio file against the configured rules.

    Parameters
    ----------
    path:
        Path to a WAV/FLAC/AIFF file.
    config_path:
        Optional path to a configuration YAML file.  If omitted the
        default search strategy is used.

    Returns
    -------
    dict
        A dictionary containing measured properties and pass/fail flags.
    """
    cfg = load_config(config_path)
    analysis = analyse_audio(path)

    results = {
        "path": path,
        "sample_rate": analysis["sample_rate"],
        "channels": analysis["channels"],
        "duration_seconds": analysis["duration_seconds"],
        "lufs": analysis["lufs"],
        "true_peak_dbfs": analysis["true_peak_dbfs"],
        "passes": {},
    }

    # Sample rate check
    results["passes"]["sample_rate"] = analysis["sample_rate"] == cfg.get("sample_rate")
    # Channel count check
    results["passes"]["channels"] = analysis["channels"] == cfg.get("channels")
    # Minimum duration check
    results["passes"]["min_duration"] = analysis["duration_seconds"] >= cfg.get("min_duration_seconds", 0)
    # Loudness within tolerance
    target_lufs = cfg.get("target_lufs")
    tol = cfg.get("lufs_tolerance", 1.0)
    lufs = analysis["lufs"]
    if lufs is not None and target_lufs is not None:
        results["passes"]["lufs"] = abs(lufs - target_lufs) <= tol
    else:
        results["passes"]["lufs"] = False
    # True peak
    max_peak = cfg.get("max_true_peak_dbfs", -1.0)
    tp = analysis["true_peak_dbfs"]
    if tp is not None:
        results["passes"]["true_peak"] = tp <= max_peak
    else:
        results["passes"]["true_peak"] = False

    return results

def _cli():
    parser = argparse.ArgumentParser(description="Valifi audio validation utility")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # init subcommand
    p_init = subparsers.add_parser("init", help="Initialise valifi in the current repository")
    p_init.add_argument(
        "--path",
        type=str,
        default=".",
        help="Path to the root of your repository",
    )

    # validate subcommand
    p_validate = subparsers.add_parser("validate", help="Validate an audio file")
    p_validate.add_argument("file", type=str, help="Audio file to validate")
    p_validate.add_argument(
        "--config",
        type=str,
        default=None,
        help="Path to a custom valifi configuration YAML",
    )
    p_validate.add_argument(
        "--json",
        action="store_true",
        help="Output the validation results as JSON",
    )

    args = parser.parse_args()
    if args.command == "init":
        cfg_file = init_valifi(args.path)
        print(f"Valifi configuration initialised at {cfg_file}")
    elif args.command == "validate":
        res = validate_audio(args.file, config_path=args.config)
        if args.json:
            print(json.dumps(res, indent=2))
        else:
            # Pretty print for human consumption
            for key, value in res.items():
                if key != "passes":
                    print(f"{key:16}: {value}")
            print("Pass/fail flags:")
            for k, v in res["passes"].items():
                print(f"  {k:14}: {'PASS' if v else 'FAIL'}")

if __name__ == "__main__":
    _cli()