# KVE System Overview

This document provides a high‑level overview of the **Kingdom Vocal Engine** (KVE) and the associated
automation infrastructure.  KVE was designed to streamline the end‑to‑end process
of preparing vocal and instrumental recordings for release while upholding
quality and consistency.  It brings together best practices from audio
engineering【790487615422593†L143-L184】【595553936724763†L381-L427】, efficient processing pipelines, and cloud‑based
automation.

## 1 Goals and Philosophy

KVE exists to support musicians and creators in producing release‑ready
recordings with minimal friction.  The project emphasises:

* **Quality at every stage** – from gain staging to mastering, the tools
  incorporate proven guidelines.  For example, keeping track levels around
  −10 dBFS leaves headroom for processing【790487615422593†L143-L184】, and mastering
  targets of –14 LUFS and a −1 dBFS true peak reduce the risk of streaming
  normalisation【595553936724763†L345-L353】.
* **Automation** – repetitive tasks such as organising projects, extracting
  seeds, validating files and registering releases are automated to free
  creators’ time.
* **Transparency** – configuration files (YAML/JSON) expose all parameters so
  that pipelines can be inspected, tuned and version controlled.
* **Extensibility** – the system is built from modular components (FastAPI
  services, CLI tools, watch scripts) that can be combined or extended as
  needs evolve.

## 2 Architecture

The KVE repository is organised into packages and scripts, each with a
specific responsibility:

| Module | Purpose |
|-------|---------|
| `kve/valifi` | Validates audio files against a set of technical
  requirements (sample rate, channel count, duration, loudness and true
  peak).  Provides CLI commands to initialise a project (`init`) and
  validate files (`validate`). |
| `seed_extractor.py` | Extracts short “seed” segments from vocal recordings.
  These seeds can be used for noise reduction, inpainting or training
  models. |
| `release_queue/` | Implements a FastAPI service that registers mastered
  tracks, stores metadata and tracks approval status.  Acts as a staging
  area before distribution. |
| `watchdog` (external script) | Monitors project folders, detects new
  stems or FLP bundles, calls cloud endpoints for processing, and writes
  outputs to an outbox directory.  Works with both GCP Cloud Run and
  Lightning.ai deployments. |
| `kve_flp_organizer.py` (external script) | Scans drives for `.flp`
  projects, gathers audio assets, and produces self‑contained project
  folders with manifests for batch processing. |
| `docs/` | Contains the Hint Companion and this overview. |

### Data Flow

1. **Project discovery** – The FLP organiser scans local disks for FL Studio
   projects and gathers audio assets into a standard folder layout.
2. **Initial validation** – `valifi` is run to ensure files meet technical
   requirements (e.g., 44.1 kHz stereo, minimum duration, target loudness).  Files
   failing validation can be resampled, normalised or flagged for
   replacement.
3. **Seed extraction** – For vocal tracks requiring repair or voice model
   training, the seed extractor splits the cleanest portions into small
   segments.  These seeds form a corpus for inpainting or training.
4. **Batch processing** – The Watchdog monitors the prepared projects and
   submits stems to cloud‑based processing pipelines (Lightning.ai or
   GCP).  These pipelines apply the mixing chain (EQ, compression,
   saturation and limiting) using presets derived from best practice
   recommendations【240070670474647†L153-L158】【240070670474647†L160-L174】.
5. **Release registration** – Completed masters are registered via the
   release queue service.  Metadata such as title, artist and preset used
   are stored along with the audio file.  Releases remain pending until
   approved by a human or policy.
6. **Distribution** – When approved, releases can be pushed to
   distribution platforms via API or manual upload.  Loudness and peak
   levels are kept within recommended limits (–14 LUFS, –1 dBFS true
   peak)【595553936724763†L345-L353】 to ensure consistent playback across
   services.

## 3 Valifi System

Valifi is a lightweight audio validation framework included in KVE.  Its
purpose is to provide an early warning system before audio enters the
processing pipeline.  Key features:

* **Configuration** – Running `python -m kve.valifi init` creates a
  `.valifi/config.yaml` file with default targets for sample rate,
  channels, minimum duration, loudness (LUFS) and true peak.  Users can
  edit this file to match their preferred technical standards.
* **Analysis** – Valifi uses `soundfile` and `pyloudnorm` to read audio
  files, compute duration, integrated loudness and true peak.  For multi‑
  channel files, channels are averaged to compute loudness.
* **Validation** – The `validate` command reports measured properties and
  flags each property as pass or fail based on the configuration.  This
  helps identify files requiring resampling (e.g., 48 kHz → 44.1 kHz),
  level adjustments or channel conversions.
* **Extensibility** – Because Valifi is a simple Python package, it can
  be imported and used programmatically within other services (e.g., to
  automatically reject uploads that don’t meet requirements).

## 4 Automation & On‑the‑Fly Configuration

KVE embraces automation but also allows on‑the‑fly configuration.  Preset
files in JSON format define EQ, compression, de‑essing and effects
settings.  Users can create or edit presets to suit different
applications (e.g., testimonials, rap vocals, choir).  The presets are
loaded at runtime and applied consistently across batch jobs.  When
processing stems on cloud services, endpoints accept the name of the
preset to use, enabling real‑time switching of mixing chains.

The Watchdog script can be configured to operate in either manual or
auto‑pilot mode.  In manual mode the script pauses after each stage and
awaits human approval; in auto mode it proceeds through validation,
processing and registration automatically.  All actions are logged and
output files are clearly organised into `INBOX/`, `OUTBOX/`, `ARCHIVE/`
and `ERRORS/` directories for traceability.

## 5 Future Directions

The current KVE system lays a solid foundation for large‑scale audio
processing.  Possible extensions include:

* **Adaptive AI mixing** – Integrate machine learning models that adapt
  processing parameters based on song style or target loudness profiles.
* **Real‑time streaming** – Provide WebSocket endpoints for near‑real‑time
  monitoring of live recordings and apply the KVE chain on streaming
  buffers.
* **Dataset generation** – Expand the seed extraction tool to create
  datasets for training voice conversion or TTS models.
* **Distribution automation** – Build connectors to distribution
  platforms (e.g., DistroKid) that automatically create releases when
  masters are approved, reducing manual steps.

KVE is an evolving platform designed for flexibility and growth.  With
solid engineering practices and adherence to audio best practices【595553936724763†L381-L427】,
it empowers creators to produce high‑quality releases at scale while
maintaining control and transparency.