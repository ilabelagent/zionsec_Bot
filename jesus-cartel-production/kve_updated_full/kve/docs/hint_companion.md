# KVE Hint Companion

This companion provides quick reminders and guidelines for working with the **Kingdom Vocal Engine**.  It distills complex mixing and mastering principles into actionable steps and highlights automation features available in the project.  Use it as a checklist when preparing, processing and releasing audio.

## 1 Organize & Prepare

* **Scan projects** using the provided `kve_flp_organizer.py` script.  This tool searches your drives for `.flp` files, gathers associated audio, and produces self‑contained project folders with manifest files.
* **Label tracks** clearly and group related elements (e.g., drum bus, backing vocals) to simplify mixing.  Delete or mute unwanted noises and ensure each track peaks around −10 dBFS for headroom.

## 2 Static Mix & Gain Staging

* **Start with a static mix** – set faders and pan positions without plugins to achieve an initial balance【553811975005181†L141-L147】.
* **Group tracks** into buses for easy control and global processing (e.g., drums, vocals, keys)【254565853955247†L193-L214】.

## 3 EQ & Frequency Management

* **Consult the EQ cookbook**: remove rumble below ~100 Hz on vocals; watch for boxiness at 200–400 Hz and nasal tones at 800 Hz–1.5 kHz【254565853955247†L135-L146】.
* **Use subtractive EQ** to fix problems, then gentle boosts (<3 dB) to enhance desirable character【655426627768378†L315-L317】.

## 4 Dynamics & Effects

* **Apply light compression** with ratios between 1.5:1 and 3:1 and aim for 2–3 dB of gain reduction to keep dynamics natural【595553936724763†L381-L427】.
* **Reverb and delay**: use short plate reverbs for warmth; long halls for ambience; and tempo‑synced delays to add depth【553811975005181†L170-L174】.  Put effects on sends/returns to unify the mix.
* **Automation**: ride vocal levels, add delay throws, and automate filter sweeps to create interest【553811975005181†L180-L186】.

## 5 Mix Bus & Mastering

* **Bus compression**: Use gentle bus compression (ratios ≤2:1) to “glue” the mix【595553936724763†L381-L427】.  Attack times around 25 ms preserve transients; release around 50–100 ms avoids pumping【595553936724763†L441-L449】.
* **Limiters**: Set the ceiling at −1.0 dBFS and aim for an integrated loudness of around −14 LUFS to meet streaming targets【595553936724763†L345-L353】.

## 6 Automation & Batch Processing

* **Watchdog scripts** monitor your project folders, detect new stems, and submit jobs to cloud services (Lightning.ai or GCP) for processing and mastering.  Outputs are automatically written to an outbox folder.
* **Seed extraction** via `seed_extractor.py` splits vocal tracks into small segments (seeds) that can be used to patch missing syllables or train TTS/voice conversion models.
* **Release queue service** (`release_queue/app.py`) registers processed masters, stores metadata and approval status, and can be extended to push releases to distribution platforms.

## 7 Distribution & Release

* Prepare release metadata (title, artist, ISRC, cover art) alongside the mastered file.  The release queue API helps manage approvals and ensures nothing is published accidentally.
* Use distribution APIs or upload tools to deliver masters once approved.  Keep logs of all processing and releases for auditing.

## 8 Customization & On‑the‑Fly Controls

* **Presets**: Choose from predefined presets (e.g., Testimonial, GodMode Lead, Rap Supreme) or create your own by editing JSON parameter files.  These map to EQ, compression, reverb and limiter settings.
* **Tray app (optional)**: A companion tray application can expose controls for scanning, processing, approving and publishing projects.  It can also display live status of batch jobs and suggestions for presets.

Use this companion whenever you start a new project or run batch processing.  The goal is to streamline your workflow, maintain audio quality, and ensure every release meets the highest standard.