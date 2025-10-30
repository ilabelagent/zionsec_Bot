"""
release_queue.app
=================

FastAPI application exposing a simple API for managing a queue of mastered
tracks.  Use the API to register new releases, view pending releases and
approve releases.

Example usage:

```
uvicorn release_queue.app:app --reload
```

POST /release
-------------

Register a new release.  The request body must contain at least
`file_path`, `title` and `artist`.  On success the API returns the ID of
the queued release and the full metadata.

GET /queue
----------

Return a list of all queued releases that have not yet been approved.

POST /queue/approve
-------------------

Approve a release.  The request body should contain the `id` of the
release to approve.  On success the API returns the updated release
object.
"""

from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from .queue import ReleaseQueue, Release


class ReleaseCreate(BaseModel):
    file_path: str = Field(..., description="Path to the mastered audio file")
    title: str = Field(..., description="Title of the track")
    artist: str = Field(..., description="Primary artist name")


class ReleaseOut(BaseModel):
    id: str
    title: str
    artist: str
    file_path: str
    approved: bool


class ReleaseApprove(BaseModel):
    id: str = Field(..., description="ID of the release to approve")


app = FastAPI(title="KVE Release Queue")

# Create a global queue at module import time.  By default releases and
# metadata are stored in ./releases/ relative to the working directory.
queue = ReleaseQueue(root_dir=Path("./releases"), copy_files=True)


@app.post("/release", response_model=ReleaseOut)
def create_release(data: ReleaseCreate):
    try:
        rel = queue.register_release(Path(data.file_path), data.title, data.artist)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return ReleaseOut(**rel.to_dict())


@app.get("/queue", response_model=List[ReleaseOut])
def list_pending() -> List[ReleaseOut]:
    return [ReleaseOut(**r.to_dict()) for r in queue.list_pending()]


@app.post("/queue/approve", response_model=ReleaseOut)
def approve_release(data: ReleaseApprove) -> ReleaseOut:
    try:
        rel = queue.approve(data.id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return ReleaseOut(**rel.to_dict())