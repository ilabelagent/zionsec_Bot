# KVE Project

This repository contains tools and services for the Kingdom Vocal Engine (KVE).  It is a starting point for orchestrating and automating audio post‑production workflows, including batch processing of vocal stems and preparing releases for distribution.

## Components

### Seed Extractor

When working with noisy or damaged recordings it is often useful to extract a set of "seed" segments from the cleanest parts of the audio.  These seeds can then be used for noise reduction, audio inpainting or other restoration tasks.  The `seed_extractor.py` script provides a simple way to pull multiple short segments from a larger audio file.

The extractor loads an input `.wav` file, computes a rolling energy envelope and selects evenly spaced segments of a specified length.  You can tune the number and length of seeds using command‑line options.  The seeds are written to an output directory as individual `.wav` files for easy consumption by downstream tools.

Example usage:

```bash
python seed_extractor.py --input path/to/recording.wav --output seeds/ --num-seeds 10 --seed-duration 0.5
```

### Release Queue Service

Preparing mastered tracks for distribution involves a series of repetitive steps: verifying loudness and peak levels, attaching metadata, organising files and uploading them to a distributor.  The `release_queue` package provides a small FastAPI service to manage this workflow.

The service exposes a few endpoints:

- `POST /release` — Register a new release candidate.  The request should include a path to a mastered audio file and metadata such as title and artist.  The service will copy the file into a release directory and generate a JSON manifest.
- `GET /queue` — List all pending releases that still need approval.
- `POST /queue/approve` — Approve a queued release and mark it ready for distribution.

These endpoints are intentionally simple to keep the implementation light.  You can integrate them into your existing automation pipeline or extend them to talk to third‑party distribution APIs.

To run the service locally:

```bash
pip install -r requirements.txt
uvicorn release_queue.app:app --host 0.0.0.0 --port 8000
```

Once running, you can create releases by sending JSON payloads to `/release` with an HTTP client of your choice.

### Requirements

The project depends on a few common Python packages:

- `fastapi` and `uvicorn` for the release queue service.
- `pydantic` for request validation.
- `librosa`, `numpy` and `soundfile` for seed extraction.

All dependencies are listed in `requirements.txt`.

### Valifi (audio validation)

The repository also provides a minimal audio validation framework under the
`kve/valifi` package.  This framework helps ensure that audio files meet a
defined set of technical criteria before they are passed to more
computationally expensive processing stages.  When you first check out the
project you can initialise Valifi by running:

```bash
python -m kve.valifi init
```

This command creates a `.valifi/config.yaml` file in the current
directory containing sensible defaults (target sample rate, channel count,
minimum duration, target loudness and true peak limits).  You can edit
this configuration to suit your own requirements.

To validate a specific audio file against the configuration, use:

```bash
python -m kve.valifi validate path/to/my_audio.wav --json
```

The validator reports the measured properties (sample rate, number of
channels, duration, integrated loudness and true peak) along with
pass/fail flags for each property.  This allows you to quickly detect
files that need resampling, normalisation or trimming before they enter
the main KVE processing pipeline.

## Licence

This code is released under the MIT licence.  See the `LICENCE` file for more details.