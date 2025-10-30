"""
release_queue.queue
===================

Core data model for the release queue.  A release represents a mastered
audio file along with metadata such as title and artist.  Releases are
persisted to a JSON file on disk and optionally accompanied by a copy of
the audio file in a managed directory.
"""

from __future__ import annotations

import json
import shutil
import uuid
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class Release:
    id: str
    title: str
    artist: str
    file_path: str
    approved: bool = False

    def to_dict(self) -> Dict[str, str]:
        return asdict(self)


class ReleaseQueue:
    """A persistent queue of releases.

    Each release has a unique ID and is stored in a JSON file on disk.  When
    registering a new release, the audio file can optionally be copied into
    a managed directory.  Releases can be listed and approved.

    Parameters
    ----------
    root_dir: Path
        Root directory under which queue metadata and audio files are stored.
        Defaults to `./releases`.
    copy_files: bool, default=True
        Whether to copy the source audio file into the managed directory.  If
        False, the queue will reference the original file path.
    """

    def __init__(self, root_dir: Path, copy_files: bool = True):
        self.root_dir = root_dir
        self.copy_files = copy_files
        self.meta_path = self.root_dir / "releases.json"
        self.audio_dir = self.root_dir / "audio"
        self.root_dir.mkdir(parents=True, exist_ok=True)
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        # Load existing releases if any
        if self.meta_path.exists():
            with open(self.meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            self._releases: Dict[str, Release] = {
                r["id"]: Release(**r) for r in data
            }
        else:
            self._releases = {}

    def _save(self):
        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump([rel.to_dict() for rel in self._releases.values()], f, indent=2)

    def register_release(self, src_file: Path, title: str, artist: str) -> Release:
        """Register a new release candidate.

        Parameters
        ----------
        src_file: Path
            Path to the mastered audio file to be released.
        title: str
            Title of the track.
        artist: str
            Name of the primary artist.

        Returns
        -------
        Release
            The created Release object.
        """
        if not src_file.is_file():
            raise FileNotFoundError(f"No such file: {src_file}")
        rel_id = uuid.uuid4().hex[:12]
        if self.copy_files:
            dest_path = self.audio_dir / f"{rel_id}_{src_file.name}"
            shutil.copy2(src_file, dest_path)
        else:
            dest_path = src_file
        release = Release(id=rel_id, title=title, artist=artist, file_path=str(dest_path))
        self._releases[rel_id] = release
        self._save()
        return release

    def list_pending(self) -> List[Release]:
        return [r for r in self._releases.values() if not r.approved]

    def get(self, release_id: str) -> Optional[Release]:
        return self._releases.get(release_id)

    def approve(self, release_id: str) -> Release:
        """Mark a release as approved.

        Raises
        ------
        KeyError if the release is not found.
        """
        if release_id not in self._releases:
            raise KeyError(f"Release with id {release_id} not found")
        self._releases[release_id].approved = True
        self._save()
        return self._releases[release_id]