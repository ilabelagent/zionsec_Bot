#!/usr/bin/env python3
"""
CLI wrapper for prompt generation
Used by Node.js visualizer service
"""

import argparse
import json
import sys
from pathlib import Path
from .prompt_generator import PromptGenerator


def main():
    parser = argparse.ArgumentParser(description="Generate visual prompts from audio analysis")
    parser.add_argument("analysis_file", help="Path to JSON file with audio analysis")
    parser.add_argument("--style", default="music_video",
                       choices=["music_video", "visualizer", "lyric_video", "abstract"],
                       help="Visual style")
    parser.add_argument("--genre", help="Music genre")
    parser.add_argument("--artist", help="Artist name")
    parser.add_argument("--title", help="Song title")
    parser.add_argument("--provider", help="AI provider (anthropic/openai/gemini/heuristic)")

    args = parser.parse_args()

    try:
        # Load analysis
        with open(args.analysis_file, "r") as f:
            analysis = json.load(f)

        # Generate prompts
        generator = PromptGenerator(provider=args.provider)
        prompts = generator.generate(
            analysis,
            style=args.style,
            genre=args.genre,
            artist=args.artist,
            title=args.title
        )

        # Output JSON
        print(json.dumps(prompts, indent=2))

    except FileNotFoundError:
        print(f"Error: Analysis file not found: {args.analysis_file}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in analysis file: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error generating prompts: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
