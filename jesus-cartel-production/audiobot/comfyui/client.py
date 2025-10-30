"""
ComfyUI Client
Connects to remote ComfyUI instance for video generation
"""

import requests
import json
import time
import io
import base64
from pathlib import Path
from typing import Dict, Any, Optional, List
from urllib.parse import urljoin
import websocket
import uuid


class ComfyUIClient:
    """Client for ComfyUI API"""

    def __init__(self, url: str = "http://localhost:8188", timeout: int = 300):
        """
        Initialize ComfyUI client

        Args:
            url: Base URL of ComfyUI instance (e.g., http://192.168.1.100:8188)
            timeout: Request timeout in seconds
        """
        self.url = url.rstrip("/")
        self.timeout = timeout
        self.client_id = str(uuid.uuid4())

    def health_check(self) -> bool:
        """Check if ComfyUI is accessible"""
        try:
            response = requests.get(f"{self.url}/system_stats", timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"ComfyUI health check failed: {e}")
            return False

    def queue_prompt(self, workflow: Dict[str, Any]) -> str:
        """
        Queue a workflow for execution

        Args:
            workflow: ComfyUI workflow JSON

        Returns:
            Prompt ID for tracking
        """
        payload = {
            "prompt": workflow,
            "client_id": self.client_id
        }

        response = requests.post(
            f"{self.url}/prompt",
            json=payload,
            timeout=self.timeout
        )
        response.raise_for_status()

        result = response.json()
        return result["prompt_id"]

    def get_history(self, prompt_id: str) -> Dict[str, Any]:
        """Get execution history for a prompt"""
        response = requests.get(
            f"{self.url}/history/{prompt_id}",
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def get_queue(self) -> Dict[str, Any]:
        """Get current queue status"""
        response = requests.get(f"{self.url}/queue", timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def wait_for_completion(
        self,
        prompt_id: str,
        poll_interval: float = 2.0,
        max_wait: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Wait for prompt to complete

        Args:
            prompt_id: Prompt ID to wait for
            poll_interval: Time between status checks (seconds)
            max_wait: Maximum wait time (None = wait forever)

        Returns:
            History data when complete

        Raises:
            TimeoutError: If max_wait exceeded
            RuntimeError: If execution failed
        """
        start_time = time.time()

        while True:
            if max_wait and (time.time() - start_time) > max_wait:
                raise TimeoutError(f"Prompt {prompt_id} did not complete within {max_wait}s")

            history = self.get_history(prompt_id)

            if prompt_id in history:
                prompt_data = history[prompt_id]

                # Check for errors
                if "error" in prompt_data:
                    raise RuntimeError(f"ComfyUI execution failed: {prompt_data['error']}")

                # Check if completed
                if "outputs" in prompt_data:
                    return prompt_data

            time.sleep(poll_interval)

    def download_output(
        self,
        filename: str,
        subfolder: str = "",
        folder_type: str = "output"
    ) -> bytes:
        """
        Download output file

        Args:
            filename: Output filename
            subfolder: Optional subfolder
            folder_type: 'output', 'input', or 'temp'

        Returns:
            File content as bytes
        """
        params = {
            "filename": filename,
            "type": folder_type
        }
        if subfolder:
            params["subfolder"] = subfolder

        response = requests.get(
            f"{self.url}/view",
            params=params,
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.content

    def upload_image(self, image_path: Path, overwrite: bool = False) -> Dict[str, Any]:
        """
        Upload image to ComfyUI

        Args:
            image_path: Path to image file
            overwrite: Whether to overwrite existing file

        Returns:
            Upload response
        """
        with open(image_path, "rb") as f:
            files = {"image": (image_path.name, f, "image/png")}
            data = {"overwrite": str(overwrite).lower()}

            response = requests.post(
                f"{self.url}/upload/image",
                files=files,
                data=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            return response.json()

    def generate_video(
        self,
        workflow: Dict[str, Any],
        output_path: Optional[Path] = None,
        poll_interval: float = 2.0,
        max_wait: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Complete video generation workflow

        Args:
            workflow: ComfyUI workflow JSON
            output_path: Optional path to save video
            poll_interval: Status check interval
            max_wait: Maximum wait time

        Returns:
            Dictionary with video_path, prompt_id, and execution info
        """
        # Queue the prompt
        prompt_id = self.queue_prompt(workflow)
        print(f"Queued prompt: {prompt_id}")

        # Wait for completion
        result = self.wait_for_completion(prompt_id, poll_interval, max_wait)

        # Extract output files
        outputs = result.get("outputs", {})
        video_files = []

        for node_id, node_output in outputs.items():
            if "videos" in node_output:
                for video_info in node_output["videos"]:
                    video_files.append({
                        "filename": video_info["filename"],
                        "subfolder": video_info.get("subfolder", ""),
                        "type": video_info.get("type", "output")
                    })

        if not video_files:
            raise RuntimeError("No video output found in workflow result")

        # Download the first video
        video_info = video_files[0]
        video_data = self.download_output(
            video_info["filename"],
            video_info["subfolder"],
            video_info["type"]
        )

        # Save if output_path provided
        if output_path:
            output_path = Path(output_path)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(video_data)
            video_path = str(output_path)
        else:
            video_path = video_info["filename"]

        return {
            "prompt_id": prompt_id,
            "video_path": video_path,
            "video_data": video_data if not output_path else None,
            "all_outputs": video_files,
            "execution_time": result.get("status", {}).get("exec_time", 0)
        }


class WorkflowBuilder:
    """Helper to build ComfyUI workflows programmatically"""

    def __init__(self):
        self.workflow = {}
        self.node_counter = 1

    def add_node(
        self,
        class_type: str,
        inputs: Dict[str, Any],
        node_id: Optional[int] = None
    ) -> int:
        """
        Add a node to the workflow

        Args:
            class_type: Node type (e.g., 'CLIPTextEncode', 'KSampler')
            inputs: Node inputs
            node_id: Optional specific node ID

        Returns:
            Node ID
        """
        if node_id is None:
            node_id = self.node_counter
            self.node_counter += 1

        self.workflow[str(node_id)] = {
            "class_type": class_type,
            "inputs": inputs
        }

        return node_id

    def node_output(self, node_id: int, output_index: int = 0) -> List[Any]:
        """Create reference to another node's output"""
        return [str(node_id), output_index]

    def build_text_to_video_workflow(
        self,
        prompt: str,
        negative_prompt: str = "blurry, low quality, distorted",
        width: int = 1024,
        height: int = 1024,
        steps: int = 30,
        cfg: float = 7.5,
        video_frames: int = 120,
        video_steps: int = 6,
        seed: int = -1
    ) -> Dict[str, Any]:
        """
        Build a text-to-video workflow (Flux + WanVideo pipeline)

        Args:
            prompt: Text prompt for image generation
            negative_prompt: Negative prompt
            width: Image width
            height: Image height
            steps: Sampling steps for image
            cfg: CFG scale
            video_frames: Number of video frames
            video_steps: Video sampling steps
            seed: Random seed (-1 for random)

        Returns:
            Complete workflow dictionary
        """
        import random
        if seed == -1:
            seed = random.randint(0, 2**32 - 1)

        # Model loaders
        checkpoint_id = self.add_node("CheckpointLoaderSimple", {
            "ckpt_name": "flux1-dev.safetensors"  # User should configure
        })

        # Text encoding
        positive_id = self.add_node("CLIPTextEncode", {
            "text": prompt,
            "clip": self.node_output(checkpoint_id, 1)
        })

        negative_id = self.add_node("CLIPTextEncode", {
            "text": negative_prompt,
            "clip": self.node_output(checkpoint_id, 1)
        })

        # Empty latent
        latent_id = self.add_node("EmptyLatentImage", {
            "width": width,
            "height": height,
            "batch_size": 1
        })

        # KSampler
        sampler_id = self.add_node("KSampler", {
            "seed": seed,
            "steps": steps,
            "cfg": cfg,
            "sampler_name": "euler",
            "scheduler": "normal",
            "denoise": 1.0,
            "model": self.node_output(checkpoint_id, 0),
            "positive": self.node_output(positive_id, 0),
            "negative": self.node_output(negative_id, 0),
            "latent_image": self.node_output(latent_id, 0)
        })

        # VAE Decode
        vae_decode_id = self.add_node("VAEDecode", {
            "samples": self.node_output(sampler_id, 0),
            "vae": self.node_output(checkpoint_id, 2)
        })

        # WanVideo Model Loader
        wanvideo_loader_id = self.add_node("WanVideoModelLoader", {
            "model_name": "wan2.1_i2v_480p_14B_bf16_Comfy-Org.safetensors"
        })

        # WanVideo Image Encode
        wanvideo_encode_id = self.add_node("WanVideoImageClipEncode", {
            "image": self.node_output(vae_decode_id, 0),
            "model": self.node_output(wanvideo_loader_id, 0)
        })

        # WanVideo Text Encode
        wanvideo_text_id = self.add_node("WanVideoTextEncode", {
            "text": f"{prompt}, smooth camera movement, cinematic",
            "model": self.node_output(wanvideo_loader_id, 0)
        })

        # WanVideo Sampler
        wanvideo_sampler_id = self.add_node("WanVideoSampler", {
            "seed": seed,
            "steps": video_steps,
            "cfg": cfg,
            "frames": video_frames,
            "model": self.node_output(wanvideo_loader_id, 0),
            "conditioning": self.node_output(wanvideo_text_id, 0),
            "image_conditioning": self.node_output(wanvideo_encode_id, 0)
        })

        # WanVideo Decode
        wanvideo_decode_id = self.add_node("WanVideoDecode", {
            "samples": self.node_output(wanvideo_sampler_id, 0),
            "vae": self.node_output(wanvideo_loader_id, 1)
        })

        # Video Combine
        video_combine_id = self.add_node("VHS_VideoCombine", {
            "frame_rate": 24,
            "loop_count": 0,
            "filename_prefix": "visualizer",
            "format": "video/h264-mp4",
            "images": self.node_output(wanvideo_decode_id, 0)
        })

        return self.workflow

    def to_json(self, indent: int = 2) -> str:
        """Export workflow as JSON string"""
        return json.dumps(self.workflow, indent=indent)

    def save(self, path: Path):
        """Save workflow to file"""
        with open(path, "w") as f:
            f.write(self.to_json())


if __name__ == "__main__":
    # Test connection
    import sys
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8188"

    client = ComfyUIClient(url)
    print(f"Testing connection to {url}...")

    if client.health_check():
        print("✓ Connected successfully!")
        queue = client.get_queue()
        print(f"Queue status: {queue}")
    else:
        print("✗ Connection failed. Make sure ComfyUI is running.")
