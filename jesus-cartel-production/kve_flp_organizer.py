import os, json, shutil, argparse
from pathlib import Path
from tqdm import tqdm

AUDIO_EXT = {".wav",".mp3",".flac",".ogg",".aiff",".aif",".aac",".m4a",".wma"}

def find_flps(roots):
    flps = []
    for root in roots:
        root = Path(root)
        if not root.exists(): continue
        for p in root.rglob("*.flp"):
            flps.append(p)
    return flps

def guess_assets(flp_path: Path):
    assets = []
    candidates = [flp_path.parent]
    # add two levels up
    if flp_path.parent.parent.exists(): candidates.append(flp_path.parent.parent)
    if flp_path.parent.parent.parent.exists(): candidates.append(flp_path.parent.parent.parent)
    for base in candidates:
        for ext in AUDIO_EXT:
            for a in base.rglob(f"*{ext}"):
                try:
                    if a.stat().st_size > 0:
                        assets.append(a)
                except Exception:
                    pass
    uniq, seen = [], set()
    for a in assets:
        k = str(a.resolve()).lower()
        if k not in seen:
            seen.add(k); uniq.append(a)
    return uniq

def normalize_name(name: str):
    safe = "".join(c if c.isalnum() or c in (" ","-","_") else "_" for c in name).strip()
    return "_".join(safe.split())[:64] or "Project"

def build_manifest(project_dir: Path, flp_file: Path, assets):
    stems = {
        "vocals": [a for a in assets if any(k in a.name.lower() for k in ["vox","vocal","lead","acapella"])],
        "beat":   [a for a in assets if any(k in a.name.lower() for k in ["beat","inst","music","instrumental"])],
        "mix":    [a for a in assets if "mix" in a.name.lower()],
    }
    manifest = {
        "project_name": project_dir.name,
        "flp": str(flp_file),
        "assets": [str(a) for a in assets],
        "stems": {k:[str(x) for x in v] for k,v in stems.items()},
        "suggested": {
            "process_vocals": len(stems["vocals"])>0,
            "process_master": len(stems["mix"])>0 or len(stems["beat"])>0,
            "preset_vocals": "GodMode_Lead_Vocal",
            "preset_master": "Divine_Harmony_Stack"
        }
    }
    return manifest

def copy_into_kve(root_out: Path, flp: Path, assets, move=False):
    proj_name = normalize_name(flp.stem)
    proj_dir = root_out / proj_name
    proj_dir.mkdir(parents=True, exist_ok=True)
    dest_flp = proj_dir / flp.name
    if move: shutil.move(str(flp), dest_flp)
    else: shutil.copy2(flp, dest_flp)
    audio_dir = proj_dir / "Audio"; audio_dir.mkdir(exist_ok=True)
    for a in assets:
        dest = audio_dir / a.name
        try:
            if move: shutil.move(str(a), dest)
            else: shutil.copy2(a, dest)
        except Exception:
            pass
    return proj_dir, dest_flp

def main():
    ap = argparse.ArgumentParser(description="KVE FLP Organizer")
    ap.add_argument("--scan", nargs="+", required=True, help="Folders/Drives to scan")
    ap.add_argument("--out", required=True, help="OUT root (e.g., D:\\KingdomProjects\\INBOX)")
    ap.add_argument("--move", action="store_true", help="Move instead of copy")
    args = ap.parse_args()
    out_root = Path(args.out); out_root.mkdir(parents=True, exist_ok=True)
    flps = find_flps(args.scan)
    print(f"Found {len(flps)} FLP projects")
    report = []
    for flp in tqdm(flps, desc="Organizing"):
        try:
            assets = guess_assets(flp)
            proj_dir, dest_flp = copy_into_kve(out_root, flp, assets, move=args.move)
            manifest = build_manifest(proj_dir, dest_flp, list((proj_dir/"Audio").glob("*")))
            (proj_dir/"manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
            report.append({"project": proj_dir.name, "flp": str(dest_flp), "assets": len(manifest["assets"])})
        except Exception as e:
            report.append({"project": flp.stem, "error": str(e)})
    (out_root/"SCAN_REPORT.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Done → {out_root}")

if __name__ == "__main__":
    main()
