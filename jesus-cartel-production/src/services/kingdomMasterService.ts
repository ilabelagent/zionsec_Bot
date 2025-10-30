/**
 * Kingdom Master Service
 * Professional audio mastering and preview workflow for Jesus Cartel
 * RIDE WITH CHRIST
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

interface MasteringResult {
  success: boolean;
  input: string;
  output: string;
  preset: string;
  metrics: {
    sample_rate?: number;
    duration?: number;
    rms_db?: number;
    peak_db?: number;
    dynamic_range_db?: number;
    lufs?: number;
    channels?: number;
    error?: string;
  };
  error?: string;
}

interface PreviewTrack {
  preview_id: string;
  status: 'uploading' | 'mastering' | 'preview_ready' | 'published' | 'scheduled' | 'failed';
  original_filename: string;
  original_path: string;
  mastered_path?: string;

  // Metadata
  title?: string;
  artist?: string;
  genre?: string;
  description?: string;

  // Mastering results
  mastering_results?: MasteringResult;

  // Publishing info
  publish_date?: Date;
  scheduled_date?: Date;

  // Timestamps
  uploaded_at: Date;
  mastered_at?: Date;
  published_at?: Date;

  // User actions
  approved_for_publish?: boolean;
}

class KingdomMasterService {
  private previews: Map<string, PreviewTrack> = new Map();
  private pythonPath: string = 'python3';
  private masterScript: string = path.join(__dirname, '../../audiobot/skills/kingdom_master.py');
  private uploadDir: string = '/tmp/jesus-cartel/uploads';
  private masterDir: string = '/tmp/jesus-cartel/mastered';
  private previewDir: string = '/tmp/jesus-cartel/previews';

  constructor() {
    this.ensureDirectories();
    console.log('Kingdom Master Service initialized - RIDE WITH CHRIST');
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.masterDir, { recursive: true });
    await fs.mkdir(this.previewDir, { recursive: true });
  }

  /**
   * Upload and master a WAV file
   */
  async uploadAndMaster(
    filePath: string,
    metadata: {
      title?: string;
      artist?: string;
      genre?: string;
      description?: string;
    }
  ): Promise<PreviewTrack> {
    const preview_id = this.generatePreviewId();
    const originalFilename = path.basename(filePath);

    // Create preview entry
    const preview: PreviewTrack = {
      preview_id,
      status: 'uploading',
      original_filename: originalFilename,
      original_path: filePath,
      uploaded_at: new Date(),
      ...metadata
    };

    this.previews.set(preview_id, preview);

    // Start mastering process
    this.masterAudio(preview_id).catch(err => {
      preview.status = 'failed';
      preview.mastering_results = {
        success: false,
        input: filePath,
        output: '',
        preset: 'Kingdom Master Standard',
        metrics: { error: err.message }
      };
    });

    return preview;
  }

  /**
   * Master audio using Kingdom Master Python script
   */
  private async masterAudio(preview_id: string): Promise<void> {
    const preview = this.previews.get(preview_id);
    if (!preview) {
      throw new Error('Preview not found');
    }

    preview.status = 'mastering';

    const outputPath = path.join(
      this.masterDir,
      `${preview_id}_mastered.wav`
    );

    return new Promise((resolve, reject) => {
      const process = spawn(this.pythonPath, [
        this.masterScript,
        preview.original_path,
        outputPath
      ]);

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
          preview.status = 'failed';
          reject(new Error(`Mastering failed: ${stderr}`));
          return;
        }

        try {
          const result: MasteringResult = JSON.parse(stdout);
          preview.mastering_results = result;
          preview.mastered_path = outputPath;
          preview.status = 'preview_ready';
          preview.mastered_at = new Date();
          resolve();
        } catch (err) {
          preview.status = 'failed';
          reject(new Error(`Failed to parse mastering results: ${err}`));
        }
      });
    });
  }

  /**
   * Get preview by ID
   */
  getPreview(preview_id: string): PreviewTrack | undefined {
    return this.previews.get(preview_id);
  }

  /**
   * Get all previews
   */
  getAllPreviews(): PreviewTrack[] {
    return Array.from(this.previews.values());
  }

  /**
   * Get previews ready for review
   */
  getPreviewsReady(): PreviewTrack[] {
    return Array.from(this.previews.values())
      .filter(p => p.status === 'preview_ready');
  }

  /**
   * Approve preview for publishing
   */
  async approveForPublish(preview_id: string): Promise<PreviewTrack> {
    const preview = this.previews.get(preview_id);
    if (!preview) {
      throw new Error('Preview not found');
    }

    if (preview.status !== 'preview_ready') {
      throw new Error(`Preview is not ready. Status: ${preview.status}`);
    }

    preview.approved_for_publish = true;
    return preview;
  }

  /**
   * Publish immediately
   */
  async publishNow(
    preview_id: string,
    publishOptions: {
      network: string;
      walletId: string;
      mintNFT?: boolean;
      createToken?: boolean;
      generateVideo?: boolean;
    }
  ): Promise<any> {
    const preview = this.previews.get(preview_id);
    if (!preview) {
      throw new Error('Preview not found');
    }

    if (!preview.approved_for_publish) {
      throw new Error('Preview not approved for publishing');
    }

    // Mark as publishing
    preview.status = 'published';
    preview.published_at = new Date();
    preview.publish_date = new Date();

    // Return data for publishing (to be integrated with jesusCartelService)
    return {
      preview_id,
      audio_path: preview.mastered_path,
      title: preview.title,
      artist: preview.artist,
      genre: preview.genre,
      description: preview.description,
      metrics: preview.mastering_results?.metrics,
      publish_options: publishOptions
    };
  }

  /**
   * Schedule for future publishing
   */
  async schedulePublish(
    preview_id: string,
    scheduledDate: Date,
    publishOptions: {
      network: string;
      walletId: string;
      mintNFT?: boolean;
      createToken?: boolean;
      generateVideo?: boolean;
    }
  ): Promise<PreviewTrack> {
    const preview = this.previews.get(preview_id);
    if (!preview) {
      throw new Error('Preview not found');
    }

    if (!preview.approved_for_publish) {
      throw new Error('Preview not approved for publishing');
    }

    preview.status = 'scheduled';
    preview.scheduled_date = scheduledDate;

    // In production, you would:
    // 1. Store this in a database
    // 2. Set up a job queue (e.g., Bull/BullMQ with Redis)
    // 3. Schedule the actual publishing

    return preview;
  }

  /**
   * Delete preview
   */
  async deletePreview(preview_id: string): Promise<boolean> {
    const preview = this.previews.get(preview_id);
    if (!preview) {
      return false;
    }

    // Clean up files
    try {
      await fs.unlink(preview.original_path);
      if (preview.mastered_path) {
        await fs.unlink(preview.mastered_path);
      }
    } catch (err) {
      console.error('Error deleting preview files:', err);
    }

    this.previews.delete(preview_id);
    return true;
  }

  /**
   * Get audio file path for streaming
   */
  getAudioPath(preview_id: string, type: 'original' | 'mastered' = 'mastered'): string | undefined {
    const preview = this.previews.get(preview_id);
    if (!preview) return undefined;

    return type === 'original' ? preview.original_path : preview.mastered_path;
  }

  /**
   * Generate unique preview ID
   */
  private generatePreviewId(): string {
    return `preview_${Date.now()}_${randomBytes(4).toString('hex')}`;
  }

  /**
   * Get statistics
   */
  getStats(): any {
    const previews = Array.from(this.previews.values());
    return {
      total: previews.length,
      by_status: {
        uploading: previews.filter(p => p.status === 'uploading').length,
        mastering: previews.filter(p => p.status === 'mastering').length,
        preview_ready: previews.filter(p => p.status === 'preview_ready').length,
        published: previews.filter(p => p.status === 'published').length,
        scheduled: previews.filter(p => p.status === 'scheduled').length,
        failed: previews.filter(p => p.status === 'failed').length
      },
      approved_count: previews.filter(p => p.approved_for_publish).length
    };
  }
}

// Singleton instance
export const kingdomMasterService = new KingdomMasterService();

// Export types
export type { MasteringResult, PreviewTrack };
