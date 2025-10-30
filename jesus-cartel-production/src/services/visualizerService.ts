/**
 * Visualizer Service
 * Orchestrates audio analysis, prompt generation, and video creation via ComfyUI
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

interface AudioAnalysis {
  tempo: number;
  energy: number;
  brightness: number;
  characteristics: {
    tags: string[];
    mood: string[];
    colors: string[];
    visual_style: string[];
    movement: string[];
  };
  [key: string]: any;
}

interface VisualPrompts {
  base_prompt: string;
  animation_prompt: string;
}

interface VideoGenerationOptions {
  style?: 'music_video' | 'visualizer' | 'lyric_video' | 'abstract';
  genre?: string;
  artist?: string;
  title?: string;
  width?: number;
  height?: number;
  frames?: number;
  seed?: number;
  comfyui_url?: string;
}

interface VideoGenerationResult {
  job_id: string;
  status: 'queued' | 'analyzing' | 'generating_prompts' | 'rendering' | 'completed' | 'failed';
  video_path?: string;
  audio_analysis?: AudioAnalysis;
  prompts?: VisualPrompts;
  error?: string;
  started_at: Date;
  completed_at?: Date;
}

class VisualizerService {
  private jobs: Map<string, VideoGenerationResult> = new Map();
  private pythonPath: string = 'python3';
  private audiobot_path: string = path.join(__dirname, '../../audiobot');

  constructor() {
    // Initialize
    console.log('Visualizer Service initialized');
  }

  /**
   * Generate video for a song
   */
  async generateVideo(
    audioPath: string,
    options: VideoGenerationOptions = {}
  ): Promise<VideoGenerationResult> {
    const job_id = this.generateJobId();

    const job: VideoGenerationResult = {
      job_id,
      status: 'queued',
      started_at: new Date()
    };

    this.jobs.set(job_id, job);

    // Start async processing
    this.processVideoGeneration(job_id, audioPath, options).catch(err => {
      job.status = 'failed';
      job.error = err.message;
      job.completed_at = new Date();
    });

    return job;
  }

  /**
   * Process video generation (async)
   */
  private async processVideoGeneration(
    job_id: string,
    audioPath: string,
    options: VideoGenerationOptions
  ): Promise<void> {
    const job = this.jobs.get(job_id)!;

    try {
      // Step 1: Analyze audio
      job.status = 'analyzing';
      const analysis = await this.analyzeAudio(audioPath);
      job.audio_analysis = analysis;

      // Step 2: Generate prompts
      job.status = 'generating_prompts';
      const prompts = await this.generatePrompts(analysis, options);
      job.prompts = prompts;

      // Step 3: Generate video via ComfyUI
      job.status = 'rendering';
      const videoPath = await this.renderVideo(prompts, options);
      job.video_path = videoPath;

      // Complete
      job.status = 'completed';
      job.completed_at = new Date();

    } catch (error: any) {
      job.status = 'failed';
      job.error = error.message;
      job.completed_at = new Date();
      throw error;
    }
  }

  /**
   * Analyze audio using audiobot
   */
  private async analyzeAudio(audioPath: string): Promise<AudioAnalysis> {
    const scriptPath = path.join(this.audiobot_path, 'ai', 'audio_analyzer.py');

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [scriptPath, audioPath]);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Audio analysis failed: ${stderr}`));
          return;
        }

        try {
          const analysis = JSON.parse(stdout);
          resolve(analysis);
        } catch (err) {
          reject(new Error(`Failed to parse analysis: ${err}`));
        }
      });
    });
  }

  /**
   * Generate visual prompts using AI
   */
  private async generatePrompts(
    analysis: AudioAnalysis,
    options: VideoGenerationOptions
  ): Promise<VisualPrompts> {
    const scriptPath = path.join(this.audiobot_path, 'ai', 'generate_prompts_cli.py');

    // Create temp file with analysis
    const tempPath = `/tmp/analysis_${Date.now()}.json`;
    await fs.writeFile(tempPath, JSON.stringify(analysis));

    const args = ['-m', 'audiobot.ai.generate_prompts_cli', tempPath];
    if (options.style) args.push('--style', options.style);
    if (options.genre) args.push('--genre', options.genre);
    if (options.artist) args.push('--artist', options.artist);
    if (options.title) args.push('--title', options.title);

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', async (code) => {
        // Clean up temp file
        await fs.unlink(tempPath).catch(() => {});

        if (code !== 0) {
          reject(new Error(`Prompt generation failed: ${stderr}`));
          return;
        }

        try {
          const prompts = JSON.parse(stdout);
          resolve(prompts);
        } catch (err) {
          reject(new Error(`Failed to parse prompts: ${err}`));
        }
      });
    });
  }

  /**
   * Render video using ComfyUI
   */
  private async renderVideo(
    prompts: VisualPrompts,
    options: VideoGenerationOptions
  ): Promise<string> {
    const comfyui_url = options.comfyui_url || process.env.COMFYUI_URL || 'http://localhost:8188';
    const scriptPath = path.join(this.audiobot_path, 'comfyui', 'generate_video.py');

    const outputPath = `/tmp/video_${Date.now()}.mp4`;

    const args = [
      scriptPath,
      '--url', comfyui_url,
      '--prompt', prompts.base_prompt,
      '--animation', prompts.animation_prompt,
      '--output', outputPath
    ];

    if (options.width) args.push('--width', options.width.toString());
    if (options.height) args.push('--height', options.height.toString());
    if (options.frames) args.push('--frames', options.frames.toString());
    if (options.seed) args.push('--seed', options.seed.toString());

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, args);
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
        console.log(`[ComfyUI] ${data.toString().trim()}`);
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
        console.error(`[ComfyUI Error] ${data.toString().trim()}`);
      });

      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Video rendering failed: ${stderr}`));
          return;
        }

        resolve(outputPath);
      });
    });
  }

  /**
   * Get job status
   */
  getJobStatus(job_id: string): VideoGenerationResult | undefined {
    return this.jobs.get(job_id);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): VideoGenerationResult[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${randomBytes(4).toString('hex')}`;
  }

  /**
   * Clean up old completed jobs
   */
  cleanupOldJobs(maxAge: number = 24 * 60 * 60 * 1000): number {
    let cleaned = 0;
    const now = Date.now();

    for (const [job_id, job] of this.jobs.entries()) {
      if (job.completed_at) {
        const age = now - job.completed_at.getTime();
        if (age > maxAge) {
          this.jobs.delete(job_id);
          cleaned++;
        }
      }
    }

    return cleaned;
  }
}

// Singleton instance
export const visualizerService = new VisualizerService();

// Export types
export type {
  AudioAnalysis,
  VisualPrompts,
  VideoGenerationOptions,
  VideoGenerationResult
};
