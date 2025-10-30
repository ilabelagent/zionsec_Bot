"""
Medley Composer
Orchestrates creation of multi-song medleys with automated visual generation
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional
import subprocess
import asyncio
from concurrent.futures import ThreadPoolExecutor

from ..ai.audio_analyzer import AudioAnalyzer
from ..ai.prompt_generator import PromptGenerator
from ..comfyui.client import ComfyUIClient


class MedleySegment:
    """Represents a segment in a medley"""
    def __init__(
        self,
        audio_path: Path,
        start: float,
        end: float,
        title: str,
        artist: str
    ):
        self.audio_path = audio_path
        self.start = start
        self.end = end
        self.title = title
        self.artist = artist
        self.duration = end - start
        self.analysis: Optional[Dict[str, Any]] = None
        self.prompts: Optional[Dict[str, str]] = None
        self.video_path: Optional[Path] = None


class MedleyComposer:
    """Compose medleys with automated visual generation"""

    def __init__(self, comfyui_url: str = "http://localhost:8188"):
        self.analyzer = AudioAnalyzer()
        self.prompt_gen = PromptGenerator()
        self.comfyui = ComfyUIClient(comfyui_url)
        self.executor = ThreadPoolExecutor(max_workers=4)

    def create_medley(
        self,
        segments: List[MedleySegment],
        output_path: Path,
        theme: Optional[str] = None,
        beat_duration: float = 180.0,  # 2.5-3 min per loop
        parallel_render: bool = False
    ) -> Dict[str, Any]:
        """
        Create complete medley with visuals

        Args:
            segments: List of MedleySegment objects
            output_path: Path for final output
            theme: Optional narrative theme ('journey', 'transformation', etc.)
            beat_duration: Duration of each loop in seconds
            parallel_render: Render videos in parallel (requires multiple GPUs)

        Returns:
            Dictionary with medley info and file paths
        """
        print(f"[Medley] Creating medley with {len(segments)} segments...")

        # Step 1: Extract and process audio segments
        processed_segments = []
        for i, segment in enumerate(segments):
            print(f"[Medley] Processing segment {i+1}/{len(segments)}: {segment.title}")

            # Extract audio segment
            extracted_path = self._extract_audio_segment(
                segment.audio_path,
                segment.start,
                segment.end,
                output_path.parent / f"segment_{i+1}_audio.wav"
            )

            # Analyze audio
            print(f"  → Analyzing audio...")
            segment.analysis = self.analyzer.analyze(extracted_path)

            processed_segments.append({
                "index": i,
                "segment": segment,
                "audio_path": extracted_path,
                "analysis": segment.analysis
            })

        # Step 2: Generate prompts for all segments
        print(f"[Medley] Generating visual prompts...")
        analyses = [ps["analysis"] for ps in processed_segments]
        prompts_list = self.prompt_gen.generate_medley_prompts(analyses, theme)

        for ps, prompts in zip(processed_segments, prompts_list):
            ps["prompts"] = prompts
            ps["segment"].prompts = prompts

        # Step 3: Generate videos
        if parallel_render:
            print(f"[Medley] Rendering videos in parallel...")
            video_paths = self._render_videos_parallel(processed_segments, output_path)
        else:
            print(f"[Medley] Rendering videos sequentially...")
            video_paths = self._render_videos_sequential(processed_segments, output_path)

        for ps, video_path in zip(processed_segments, video_paths):
            ps["video_path"] = video_path
            ps["segment"].video_path = video_path

        # Step 4: Combine everything
        print(f"[Medley] Combining audio and video...")
        final_audio = self._combine_audio([ps["audio_path"] for ps in processed_segments], output_path)
        final_video = self._combine_videos(video_paths, output_path)

        # Step 5: Merge audio and video
        print(f"[Medley] Merging final medley...")
        final_medley = self._merge_audio_video(final_audio, final_video, output_path)

        print(f"[Medley] ✓ Medley created successfully: {final_medley}")

        return {
            "success": True,
            "medley_path": str(final_medley),
            "segments": [
                {
                    "index": ps["index"],
                    "title": ps["segment"].title,
                    "artist": ps["segment"].artist,
                    "audio_path": str(ps["audio_path"]),
                    "video_path": str(ps["video_path"]),
                    "prompts": ps["prompts"]
                }
                for ps in processed_segments
            ],
            "total_duration": sum(s["segment"].duration for s in processed_segments),
            "theme": theme
        }

    def _extract_audio_segment(
        self,
        input_path: Path,
        start: float,
        end: float,
        output_path: Path
    ) -> Path:
        """Extract audio segment using FFmpeg"""
        output_path.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            "ffmpeg",
            "-i", str(input_path),
            "-ss", str(start),
            "-to", str(end),
            "-c", "copy",
            "-y",
            str(output_path)
        ]

        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg extraction failed: {result.stderr.decode()}")

        return output_path

    def _render_videos_sequential(
        self,
        processed_segments: List[Dict[str, Any]],
        output_path: Path
    ) -> List[Path]:
        """Render videos one at a time"""
        video_paths = []

        for ps in processed_segments:
            video_path = output_path.parent / f"segment_{ps['index']+1}_video.mp4"
            prompts = ps["prompts"]

            print(f"  → Rendering video {ps['index']+1}/{len(processed_segments)}...")

            # Build workflow and generate
            from ..comfyui.client import WorkflowBuilder
            builder = WorkflowBuilder()
            workflow = builder.build_text_to_video_workflow(
                prompt=prompts["base_prompt"],
                width=1024,
                height=1024,
                video_frames=120
            )

            result = self.comfyui.generate_video(
                workflow,
                output_path=video_path
            )

            video_paths.append(Path(result["video_path"]))

        return video_paths

    def _render_videos_parallel(
        self,
        processed_segments: List[Dict[str, Any]],
        output_path: Path
    ) -> List[Path]:
        """Render videos in parallel (requires multiple ComfyUI instances)"""
        # For parallel rendering, you would need multiple ComfyUI instances
        # This is a simplified version that still renders sequentially
        # In production, use a job queue like Celery
        return self._render_videos_sequential(processed_segments, output_path)

    def _combine_audio(self, audio_paths: List[Path], output_path: Path) -> Path:
        """Combine audio segments"""
        concat_file = output_path.parent / "concat_audio.txt"
        final_audio = output_path.parent / "medley_audio.wav"

        # Create concat file
        with open(concat_file, "w") as f:
            for path in audio_paths:
                f.write(f"file '{path.absolute()}'\n")

        # Concatenate
        cmd = [
            "ffmpeg",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            "-y",
            str(final_audio)
        ]

        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"Audio concatenation failed: {result.stderr.decode()}")

        return final_audio

    def _combine_videos(self, video_paths: List[Path], output_path: Path) -> Path:
        """Combine video segments"""
        concat_file = output_path.parent / "concat_video.txt"
        final_video = output_path.parent / "medley_video.mp4"

        # Create concat file
        with open(concat_file, "w") as f:
            for path in video_paths:
                f.write(f"file '{path.absolute()}'\n")

        # Concatenate
        cmd = [
            "ffmpeg",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c", "copy",
            "-y",
            str(final_video)
        ]

        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"Video concatenation failed: {result.stderr.decode()}")

        return final_video

    def _merge_audio_video(
        self,
        audio_path: Path,
        video_path: Path,
        output_path: Path
    ) -> Path:
        """Merge audio and video into final medley"""
        final_output = output_path.parent / f"{output_path.stem}_final.mp4"

        cmd = [
            "ffmpeg",
            "-i", str(video_path),
            "-i", str(audio_path),
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            "-y",
            str(final_output)
        ]

        result = subprocess.run(cmd, capture_output=True)
        if result.returncode != 0:
            raise RuntimeError(f"Audio/video merge failed: {result.stderr.decode()}")

        return final_output

    def save_manifest(self, medley_info: Dict[str, Any], manifest_path: Path):
        """Save medley manifest for future reference"""
        with open(manifest_path, "w") as f:
            json.dump(medley_info, f, indent=2)

        print(f"[Medley] Manifest saved to {manifest_path}")


def create_simple_medley(
    songs: List[Dict[str, Any]],
    output_path: str,
    comfyui_url: str = "http://localhost:8188",
    theme: Optional[str] = None
) -> Dict[str, Any]:
    """
    Convenience function for creating medleys

    Args:
        songs: List of dicts with 'path', 'title', 'artist', 'start', 'end'
        output_path: Output file path
        comfyui_url: ComfyUI URL
        theme: Optional narrative theme

    Returns:
        Medley info dict

    Example:
        songs = [
            {"path": "song1.wav", "title": "First", "artist": "Artist A", "start": 0, "end": 180},
            {"path": "song2.wav", "title": "Second", "artist": "Artist B", "start": 0, "end": 180},
        ]
        result = create_simple_medley(songs, "output/medley.mp4")
    """
    composer = MedleyComposer(comfyui_url)

    segments = [
        MedleySegment(
            audio_path=Path(s["path"]),
            start=s["start"],
            end=s["end"],
            title=s["title"],
            artist=s["artist"]
        )
        for s in songs
    ]

    return composer.create_medley(segments, Path(output_path), theme=theme)


if __name__ == "__main__":
    # CLI interface
    import argparse

    parser = argparse.ArgumentParser(description="Create medley with automated visuals")
    parser.add_argument("--config", required=True, help="JSON config file with segment info")
    parser.add_argument("--output", required=True, help="Output path")
    parser.add_argument("--comfyui", default="http://localhost:8188", help="ComfyUI URL")
    parser.add_argument("--theme", help="Narrative theme")

    args = parser.parse_args()

    # Load config
    with open(args.config) as f:
        config = json.load(f)

    # Create medley
    result = create_simple_medley(
        config["songs"],
        args.output,
        args.comfyui,
        args.theme
    )

    print(json.dumps(result, indent=2))
