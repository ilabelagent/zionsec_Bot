"""Release queue service for managing mastered tracks.

This package contains a small FastAPI application and helper classes to
register mastered audio files for release, list pending releases and mark
releases as approved.  It is designed to be integrated into a larger
automation pipeline but can also be run stand‑alone.
"""

from .queue import ReleaseQueue  # noqa: F401