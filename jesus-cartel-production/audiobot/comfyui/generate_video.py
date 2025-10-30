#!/usr/bin/env python3
"""
Generate video using ComfyUI
CLI wrapper for easy integration with Node.js service
"""

import argparse
import json
import sys
from pathlib import Path
from .client import ComfyUIClient, WorkflowBuilder


def main():
    parser = argparse.ArgumentParser(description="Generate video using ComfyUI")
    parser.add_argument("--url", required=True, help="ComfyUI URL (e.g., http://192.168.1.100:8188)")
    parser.add_argument("--prompt", required=True, help="Base prompt for image generation")
    parser.add_argument("--animation", required=True, help="Animation prompt for video")
    parser.add_argument("--output", required=True, help="Output video path")
    parser.add_argument("--width", type=int, default=1024, help="Video width")
    parser.add_argument("--height", type=int, default=1024, help="Video height")
    parser.add_argument("--frames", type=int, default=120, help="Number of frames")
    parser.add_argument("--steps", type=int, default=30, help="Image sampling steps")
    parser.add_argument("--video-steps", type=int, default=6, help="Video sampling steps")
    parser.add_argument("--cfg", type=float, default=7.5, help="CFG scale")
    parser.add_argument("--seed", type=int, default=-1, help="Random seed (-1 for random)")

    args = parser.parse_args()

    try:
        # Initialize client
        print(f"Connecting to ComfyUI at {args.url}...")
        client = ComfyUIClient(args.url)

        if not client.health_check():
            print("Error: Cannot connect to ComfyUI. Make sure it's running.", file=sys.stderr)
            sys.exit(1)

        print("✓ Connected to ComfyUI")

        # Build workflow
        print("Building workflow...")
        builder = WorkflowBuilder()
        workflow = builder.build_text_to_video_workflow(
            prompt=args.prompt,
            width=args.width,
            height=args.height,
            steps=args.steps,
            cfg=args.cfg,
            video_frames=args.frames,
            video_steps=args.video_steps,
            seed=args.seed
        )

        print(f"Workflow built with {len(workflow)} nodes")

        # Generate video
        print("Queuing video generation...")
        result = client.generate_video(
            workflow,
            output_path=Path(args.output),
            poll_interval=2.0,
            max_wait=1800  # 30 minutes max
        )

        print(f"✓ Video generated successfully!")
        print(f"   Prompt ID: {result['prompt_id']}")
        print(f"   Output: {result['video_path']}")
        print(f"   Execution time: {result.get('execution_time', 0):.2f}s")

        # Return JSON result
        output_info = {
            "success": True,
            "video_path": str(result['video_path']),
            "prompt_id": result['prompt_id'],
            "execution_time": result.get('execution_time', 0)
        }
        print(json.dumps(output_info))

    except KeyboardInterrupt:
        print("\nInterrupted by user", file=sys.stderr)
        sys.exit(130)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
