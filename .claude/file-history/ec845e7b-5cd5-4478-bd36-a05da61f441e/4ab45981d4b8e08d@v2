"""
AI Prompt Generator
Generates visual prompts for ComfyUI based on audio analysis
Supports multiple AI providers: Anthropic, OpenAI, Google Gemini
"""

import os
from typing import Dict, Any, Optional, List
from pathlib import Path
import json


class PromptGenerator:
    """Generate visual prompts using AI based on audio characteristics"""

    def __init__(self, provider: Optional[str] = None, model: Optional[str] = None):
        """
        Initialize prompt generator

        Args:
            provider: AI provider ('anthropic', 'openai', 'gemini', or 'heuristic')
                     If None, uses AUDIOBOT_AI_PROVIDER env var or defaults to 'heuristic'
            model: Model name (if None, uses provider defaults)
        """
        self.provider = provider or os.getenv("AUDIOBOT_AI_PROVIDER", "heuristic")
        self.model = model

        # Initialize provider-specific clients
        if self.provider == "anthropic":
            try:
                from anthropic import Anthropic
                self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
                self.model = model or os.getenv("AUDIOBOT_ANTHROPIC_MODEL", "claude-3-5-sonnet-latest")
            except ImportError:
                print("Warning: anthropic not installed. Falling back to heuristic.")
                self.provider = "heuristic"

        elif self.provider == "openai":
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                self.model = model or os.getenv("AUDIOBOT_OPENAI_MODEL", "gpt-4o-mini")
            except ImportError:
                print("Warning: openai not installed. Falling back to heuristic.")
                self.provider = "heuristic"

        elif self.provider == "gemini":
            try:
                import google.generativeai as genai
                genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
                self.model = model or os.getenv("AUDIOBOT_GEMINI_MODEL", "gemini-1.5-flash")
                self.client = genai.GenerativeModel(self.model)
            except ImportError:
                print("Warning: google-generativeai not installed. Falling back to heuristic.")
                self.provider = "heuristic"

    def generate(
        self,
        audio_analysis: Dict[str, Any],
        style: str = "music_video",
        genre: Optional[str] = None,
        artist: Optional[str] = None,
        title: Optional[str] = None,
        custom_context: Optional[str] = None
    ) -> Dict[str, str]:
        """
        Generate visual prompts for video generation

        Args:
            audio_analysis: Output from AudioAnalyzer
            style: Visual style ('music_video', 'visualizer', 'lyric_video', 'abstract')
            genre: Optional genre override
            artist: Artist name for context
            title: Song title for context
            custom_context: Additional context/instructions

        Returns:
            Dictionary with 'base_prompt' and 'animation_prompt'
        """
        if self.provider == "heuristic":
            return self._generate_heuristic(audio_analysis, style, genre)
        elif self.provider == "anthropic":
            return self._generate_anthropic(audio_analysis, style, genre, artist, title, custom_context)
        elif self.provider == "openai":
            return self._generate_openai(audio_analysis, style, genre, artist, title, custom_context)
        elif self.provider == "gemini":
            return self._generate_gemini(audio_analysis, style, genre, artist, title, custom_context)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    def _build_prompt_context(
        self,
        audio_analysis: Dict[str, Any],
        style: str,
        genre: Optional[str],
        artist: Optional[str],
        title: Optional[str],
        custom_context: Optional[str]
    ) -> str:
        """Build context for AI prompt generation"""
        chars = audio_analysis.get("characteristics", {})

        context = f"""Generate a detailed visual prompt for a {style} based on this audio analysis:

AUDIO CHARACTERISTICS:
- Tempo: {audio_analysis.get('tempo', 0):.1f} BPM
- Energy Level: {audio_analysis.get('energy', 0):.3f} (0-1 scale)
- Brightness: {audio_analysis.get('brightness', 0):.3f} (0-1 scale)
- Harmonic Content: {audio_analysis.get('harmonic_ratio', 0):.2f}
- Percussive Content: {audio_analysis.get('percussive_ratio', 0):.2f}
- Dominant Note: {audio_analysis.get('dominant_note_name', 'Unknown')}
- Duration: {audio_analysis.get('duration', 0):.1f} seconds

DERIVED CHARACTERISTICS:
- Tags: {', '.join(chars.get('tags', []))}
- Mood: {', '.join(chars.get('mood', []))}
- Suggested Colors: {', '.join(chars.get('colors', []))}
- Visual Style: {', '.join(chars.get('visual_style', []))}
- Movement: {', '.join(chars.get('movement', []))}
"""

        if genre:
            context += f"\n- Genre: {genre}"
        if artist:
            context += f"\n- Artist: {artist}"
        if title:
            context += f"\n- Title: {title}"
        if custom_context:
            context += f"\n\nADDITIONAL CONTEXT:\n{custom_context}"

        context += f"""

TASK:
Generate TWO prompts:

1. BASE_PROMPT: A detailed scene description for image generation (for Flux/Stable Diffusion)
   - Include: setting, atmosphere, colors, lighting, composition, mood
   - Be specific and vivid
   - Match the audio's energy and mood
   - 2-3 sentences

2. ANIMATION_PROMPT: Instructions for video animation (for WanVideo)
   - Describe camera movement, transitions, effects
   - Match the tempo and rhythm
   - Keep subtle for slower songs, dynamic for faster ones
   - 1-2 sentences

Respond in JSON format:
{{
  "base_prompt": "...",
  "animation_prompt": "..."
}}
"""
        return context

    def _generate_anthropic(
        self,
        audio_analysis: Dict[str, Any],
        style: str,
        genre: Optional[str],
        artist: Optional[str],
        title: Optional[str],
        custom_context: Optional[str]
    ) -> Dict[str, str]:
        """Generate using Anthropic Claude"""
        context = self._build_prompt_context(audio_analysis, style, genre, artist, title, custom_context)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": context}]
        )

        # Parse JSON response
        text = response.content[0].text
        # Extract JSON if wrapped in markdown code blocks
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result = json.loads(text)
        return result

    def _generate_openai(
        self,
        audio_analysis: Dict[str, Any],
        style: str,
        genre: Optional[str],
        artist: Optional[str],
        title: Optional[str],
        custom_context: Optional[str]
    ) -> Dict[str, str]:
        """Generate using OpenAI GPT"""
        context = self._build_prompt_context(audio_analysis, style, genre, artist, title, custom_context)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": context}],
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return result

    def _generate_gemini(
        self,
        audio_analysis: Dict[str, Any],
        style: str,
        genre: Optional[str],
        artist: Optional[str],
        title: Optional[str],
        custom_context: Optional[str]
    ) -> Dict[str, str]:
        """Generate using Google Gemini"""
        context = self._build_prompt_context(audio_analysis, style, genre, artist, title, custom_context)

        response = self.client.generate_content(context)
        text = response.text

        # Extract JSON
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        result = json.loads(text)
        return result

    def _generate_heuristic(
        self,
        audio_analysis: Dict[str, Any],
        style: str,
        genre: Optional[str]
    ) -> Dict[str, str]:
        """
        Generate prompts using rule-based heuristics (no AI required)
        Good fallback when AI providers unavailable
        """
        chars = audio_analysis.get("characteristics", {})
        tempo = audio_analysis.get("tempo", 120)
        energy = audio_analysis.get("energy", 0.2)
        brightness = audio_analysis.get("brightness", 0.5)

        # Scene templates based on characteristics
        scenes = {
            "dark_moody": "A dark, moody atmosphere with shadows and mist",
            "bright_energetic": "A vibrant, energetic scene with dynamic lighting",
            "calm_ambient": "A serene, peaceful landscape with soft natural light",
            "urban_night": "A neon-lit cityscape at night with glowing signs",
            "nature_day": "A sunlit natural environment with rich colors",
            "abstract": "An abstract visualization with flowing shapes and particles"
        }

        # Select scene based on audio
        if brightness < 0.3 and energy < 0.15:
            scene = scenes["dark_moody"]
            colors = "deep blues, purples, and blacks with occasional golden highlights"
        elif brightness > 0.6 and energy > 0.25:
            scene = scenes["bright_energetic"]
            colors = "vivid reds, oranges, and electric blues with high contrast"
        elif energy < 0.1:
            scene = scenes["calm_ambient"]
            colors = "soft pastels, gentle greens, and warm earth tones"
        elif tempo > 130:
            scene = scenes["urban_night"]
            colors = "neon pinks, electric blues, and deep purples"
        else:
            scene = scenes["nature_day"]
            colors = "natural greens, sky blues, and warm sunlight tones"

        # Build base prompt
        mood = ", ".join(chars.get("mood", ["atmospheric"]))
        visual_style = ", ".join(chars.get("visual_style", ["cinematic"]))

        base_prompt = f"{scene}, {colors}. {mood} mood with {visual_style} style. "
        base_prompt += f"High quality, detailed, cinematic composition. "

        if style == "abstract":
            base_prompt += "Abstract geometric patterns and fluid motion. "
        elif style == "visualizer":
            base_prompt += "Audio-reactive elements, particle effects, waveforms. "

        # Build animation prompt
        if tempo < 80:
            animation = "Slow, smooth camera drift and gentle transitions"
        elif tempo < 120:
            animation = "Steady camera movement with balanced pacing"
        elif tempo < 140:
            animation = "Dynamic camera motion with energetic transitions"
        else:
            animation = "Rapid camera movements and quick cuts, high energy"

        if energy > 0.25:
            animation += ", pulsing light effects"
        if chars.get("tags") and "dynamic" in chars["tags"]:
            animation += ", varying intensity throughout"

        animation_prompt = f"{animation}. Match the rhythm and energy of the music."

        return {
            "base_prompt": base_prompt,
            "animation_prompt": animation_prompt
        }

    def generate_medley_prompts(
        self,
        segments: List[Dict[str, Any]],
        medley_theme: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """
        Generate prompts for medley segments with narrative cohesion

        Args:
            segments: List of audio analysis results from AudioAnalyzer.analyze_segments
            medley_theme: Optional overarching theme (e.g., "journey", "transformation")

        Returns:
            List of prompt dictionaries, one per segment
        """
        prompts = []
        narrative_stages = self._build_narrative_stages(len(segments), medley_theme)

        for i, segment in enumerate(segments):
            context = f"This is segment {i+1} of {len(segments)} in a medley. "
            context += f"Narrative stage: {narrative_stages[i]}. "

            if i > 0:
                context += "Maintain visual continuity with previous segments. "

            prompt = self.generate(
                segment,
                style="music_video",
                custom_context=context
            )

            prompt["segment_index"] = i
            prompt["narrative_stage"] = narrative_stages[i]
            prompts.append(prompt)

        return prompts

    def _build_narrative_stages(self, num_segments: int, theme: Optional[str]) -> List[str]:
        """Build narrative arc for medley"""
        if theme == "journey":
            if num_segments == 6:
                return ["departure", "rising action", "challenge", "climax", "resolution", "return"]
            else:
                return [f"stage {i+1}" for i in range(num_segments)]
        elif theme == "transformation":
            stages = ["beginning", "awakening", "struggle", "breakthrough", "integration", "transcendence"]
            return stages[:num_segments]
        else:
            # Generic arc
            if num_segments <= 3:
                return ["intro", "development", "conclusion"][:num_segments]
            else:
                return ["intro"] + [f"development {i}" for i in range(1, num_segments-1)] + ["conclusion"]


def generate_prompt(audio_analysis: Dict[str, Any], **kwargs) -> Dict[str, str]:
    """Convenience function for quick prompt generation"""
    generator = PromptGenerator()
    return generator.generate(audio_analysis, **kwargs)


if __name__ == "__main__":
    # Test example
    import sys
    if len(sys.argv) > 1:
        from .audio_analyzer import analyze_audio
        analysis = analyze_audio(sys.argv[1])
        prompts = generate_prompt(analysis, style="music_video")
        print("=== GENERATED PROMPTS ===")
        print(f"\nBASE PROMPT:\n{prompts['base_prompt']}")
        print(f"\nANIMATION PROMPT:\n{prompts['animation_prompt']}")
    else:
        # Demo with synthetic data
        demo_analysis = {
            "tempo": 128,
            "energy": 0.75,
            "brightness": 0.6,
            "harmonic_ratio": 0.45,
            "percussive_ratio": 0.55,
            "characteristics": {
                "tags": ["upbeat", "energetic", "dynamic"],
                "mood": ["powerful", "uplifting"],
                "colors": ["electric blues", "bright oranges"],
                "visual_style": ["cinematic", "flowing"],
                "movement": ["dynamic camera movement"]
            }
        }
        prompts = generate_prompt(demo_analysis)
        print("=== DEMO PROMPTS (Heuristic Mode) ===")
        print(f"\nBASE PROMPT:\n{prompts['base_prompt']}")
        print(f"\nANIMATION PROMPT:\n{prompts['animation_prompt']}")
