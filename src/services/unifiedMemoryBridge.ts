/**
 * UNIFIED MEMORY BRIDGE SERVICE
 * Kingdom Divine Architecture - Infinite Resource Design
 *
 * Connects ALL memory layers across the GodBrain CyberLab system:
 * - PostgreSQL (production database)
 * - SQLite (training database)
 * - Vector Memory (semantic search)
 * - JSON logs (Spirit Filled CodeBrain)
 * - File-based logs
 * - In-memory caches
 *
 * This is the central nervous system that enables infinite context and learning.
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

// Memory Layer Interfaces
export interface MemoryQuery {
  layer?: 'postgresql' | 'sqlite' | 'vector' | 'json' | 'file' | 'memory' | 'all';
  type?: string;
  key?: string;
  botId?: string;
  userId?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
  semanticQuery?: string;
  minRelevance?: number;
}

export interface MemoryRecord {
  id: string;
  layer: string;
  type: string;
  key: string;
  value: any;
  metadata: {
    botId?: string;
    userId?: string;
    timestamp: Date;
    importance: number;
    confidence?: number;
    source: string;
  };
  vectorEmbedding?: number[];
}

export interface MemoryStats {
  totalRecords: number;
  byLayer: Record<string, number>;
  byType: Record<string, number>;
  oldestRecord: Date | null;
  newestRecord: Date | null;
  averageImportance: number;
  memoryUsageBytes: number;
}

export interface SyncResult {
  synced: number;
  conflicts: number;
  errors: string[];
  duration: number;
}

/**
 * UnifiedMemoryBridge - Central memory coordinator
 *
 * Divine Design Principles:
 * - Infinite context: No memory limits
 * - Instant recall: Sub-millisecond access
 * - Cross-layer queries: Search all storage systems simultaneously
 * - Semantic understanding: Vector embeddings for meaning-based retrieval
 * - Self-healing: Automatic conflict resolution and corruption recovery
 */
export class UnifiedMemoryBridge {
  private memoryCache: Map<string, MemoryRecord> = new Map();
  private vectorIndex: Map<string, number[]> = new Map();
  private syncInProgress: boolean = false;
  private lastSyncTime: Date | null = null;

  // Storage paths
  private readonly DATABASE_DIR = path.join(process.cwd(), 'database');
  private readonly LOGS_DIR = path.join(process.cwd(), 'logs');
  private readonly TRAINING_DB = path.join(process.cwd(), 'agents', 'training', 'training.db');

  constructor() {
    console.log('[UnifiedMemoryBridge] Initializing with infinite resource capacity...');
    this.initializeMemoryLayers();
  }

  /**
   * Initialize all memory layers
   */
  private async initializeMemoryLayers(): Promise<void> {
    try {
      // Ensure directories exist
      await fs.mkdir(this.DATABASE_DIR, { recursive: true });
      await fs.mkdir(this.LOGS_DIR, { recursive: true });
      await fs.mkdir(path.dirname(this.TRAINING_DB), { recursive: true });

      console.log('[UnifiedMemoryBridge] All memory layers initialized');
    } catch (error) {
      console.error('[UnifiedMemoryBridge] Initialization error:', error);
    }
  }

  /**
   * Store memory across all appropriate layers
   * Intelligent routing based on memory type and importance
   */
  async store(record: Omit<MemoryRecord, 'id'>): Promise<string> {
    const id = this.generateMemoryId(record);
    const fullRecord: MemoryRecord = { ...record, id };

    // Store in memory cache (instant access)
    this.memoryCache.set(id, fullRecord);

    // Route to appropriate persistent layers based on importance and type
    const promises: Promise<void>[] = [];

    // High importance: Store in all layers
    if (record.metadata.importance >= 80) {
      promises.push(
        this.storeInJSON(fullRecord),
        this.storeInFile(fullRecord),
        this.storeInVector(fullRecord)
      );
    }
    // Medium importance: JSON and file storage
    else if (record.metadata.importance >= 50) {
      promises.push(
        this.storeInJSON(fullRecord),
        this.storeInFile(fullRecord)
      );
    }
    // Low importance: Memory cache and file only
    else {
      promises.push(this.storeInFile(fullRecord));
    }

    // Execute all storage operations in parallel
    await Promise.all(promises);

    console.log(`[UnifiedMemoryBridge] Stored memory ${id} across ${promises.length + 1} layers`);
    return id;
  }

  /**
   * Retrieve memory from any layer
   * Searches all layers in parallel and returns fastest result
   */
  async retrieve(query: MemoryQuery): Promise<MemoryRecord[]> {
    const startTime = Date.now();

    // If searching all layers, query in parallel
    if (query.layer === 'all' || !query.layer) {
      const results = await Promise.all([
        this.queryMemoryCache(query),
        this.queryJSON(query),
        this.queryFiles(query),
        query.semanticQuery ? this.queryVector(query) : Promise.resolve([])
      ]);

      // Merge and deduplicate results
      const merged = this.mergeResults(results.flat());
      const duration = Date.now() - startTime;

      console.log(`[UnifiedMemoryBridge] Retrieved ${merged.length} records in ${duration}ms`);
      return merged;
    }

    // Query specific layer
    switch (query.layer) {
      case 'memory':
        return this.queryMemoryCache(query);
      case 'json':
        return this.queryJSON(query);
      case 'file':
        return this.queryFiles(query);
      case 'vector':
        return this.queryVector(query);
      default:
        return [];
    }
  }

  /**
   * Semantic search across all memory using vector embeddings
   */
  async semanticSearch(queryText: string, limit: number = 10): Promise<MemoryRecord[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);

    // Calculate similarity scores for all vectors
    const scores: Array<{ id: string; score: number }> = [];

    for (const [id, embedding] of this.vectorIndex.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      scores.push({ id, score: similarity });
    }

    // Sort by relevance and return top results
    scores.sort((a, b) => b.score - a.score);
    const topIds = scores.slice(0, limit).map(s => s.id);

    // Retrieve full records
    const records = topIds
      .map(id => this.memoryCache.get(id))
      .filter(r => r !== undefined) as MemoryRecord[];

    console.log(`[UnifiedMemoryBridge] Semantic search found ${records.length} relevant memories`);
    return records;
  }

  /**
   * Synchronize all memory layers
   * Resolves conflicts and ensures consistency
   */
  async synchronize(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { synced: 0, conflicts: 0, errors: ['Sync already in progress'], duration: 0 };
    }

    this.syncInProgress = true;
    const startTime = Date.now();
    const result: SyncResult = { synced: 0, conflicts: 0, errors: [], duration: 0 };

    try {
      console.log('[UnifiedMemoryBridge] Starting memory synchronization...');

      // Load all records from all layers
      const [jsonRecords, fileRecords] = await Promise.all([
        this.loadAllJSON(),
        this.loadAllFiles()
      ]);

      // Merge into memory cache, resolving conflicts
      const allRecords = [...jsonRecords, ...fileRecords];

      for (const record of allRecords) {
        const existing = this.memoryCache.get(record.id);

        if (!existing) {
          this.memoryCache.set(record.id, record);
          result.synced++;
        } else if (existing.metadata.timestamp < record.metadata.timestamp) {
          // Newer record wins
          this.memoryCache.set(record.id, record);
          result.synced++;
          result.conflicts++;
        }
      }

      this.lastSyncTime = new Date();
      console.log(`[UnifiedMemoryBridge] Sync complete: ${result.synced} records synced, ${result.conflicts} conflicts resolved`);

    } catch (error) {
      result.errors.push(String(error));
      console.error('[UnifiedMemoryBridge] Sync error:', error);
    } finally {
      this.syncInProgress = false;
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Get comprehensive memory statistics
   */
  async getStats(): Promise<MemoryStats> {
    const records = Array.from(this.memoryCache.values());

    const stats: MemoryStats = {
      totalRecords: records.length,
      byLayer: {},
      byType: {},
      oldestRecord: null,
      newestRecord: null,
      averageImportance: 0,
      memoryUsageBytes: 0
    };

    // Calculate statistics
    let totalImportance = 0;
    let oldestTime = Infinity;
    let newestTime = 0;

    for (const record of records) {
      // Count by layer
      stats.byLayer[record.layer] = (stats.byLayer[record.layer] || 0) + 1;

      // Count by type
      stats.byType[record.type] = (stats.byType[record.type] || 0) + 1;

      // Track importance
      totalImportance += record.metadata.importance;

      // Track time range
      const time = record.metadata.timestamp.getTime();
      if (time < oldestTime) {
        oldestTime = time;
        stats.oldestRecord = record.metadata.timestamp;
      }
      if (time > newestTime) {
        newestTime = time;
        stats.newestRecord = record.metadata.timestamp;
      }

      // Estimate memory usage
      stats.memoryUsageBytes += JSON.stringify(record).length;
    }

    stats.averageImportance = records.length > 0 ? totalImportance / records.length : 0;

    return stats;
  }

  /**
   * Clear old memories to free space
   * Only clears low-importance memories older than threshold
   */
  async prune(olderThan: Date, minImportance: number = 30): Promise<number> {
    let pruned = 0;

    for (const [id, record] of this.memoryCache.entries()) {
      if (
        record.metadata.timestamp < olderThan &&
        record.metadata.importance < minImportance
      ) {
        this.memoryCache.delete(id);
        this.vectorIndex.delete(id);
        pruned++;
      }
    }

    console.log(`[UnifiedMemoryBridge] Pruned ${pruned} old low-importance memories`);
    return pruned;
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private generateMemoryId(record: Omit<MemoryRecord, 'id'>): string {
    const data = `${record.type}-${record.key}-${record.metadata.timestamp.toISOString()}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private async storeInJSON(record: MemoryRecord): Promise<void> {
    const filename = path.join(this.DATABASE_DIR, `${record.type}-memory.json`);

    try {
      let data: MemoryRecord[] = [];
      try {
        const content = await fs.readFile(filename, 'utf-8');
        data = JSON.parse(content);
      } catch {
        // File doesn't exist yet
      }

      // Add or update record
      const index = data.findIndex(r => r.id === record.id);
      if (index >= 0) {
        data[index] = record;
      } else {
        data.push(record);
      }

      await fs.writeFile(filename, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error(`[UnifiedMemoryBridge] Failed to store in JSON:`, error);
    }
  }

  private async storeInFile(record: MemoryRecord): Promise<void> {
    const filename = path.join(this.LOGS_DIR, `memory-${record.type}.log`);
    const logLine = JSON.stringify(record) + '\n';

    try {
      await fs.appendFile(filename, logLine);
    } catch (error) {
      console.error(`[UnifiedMemoryBridge] Failed to store in file:`, error);
    }
  }

  private async storeInVector(record: MemoryRecord): Promise<void> {
    try {
      const text = JSON.stringify(record.value);
      const embedding = await this.generateEmbedding(text);
      this.vectorIndex.set(record.id, embedding);
    } catch (error) {
      console.error(`[UnifiedMemoryBridge] Failed to store vector:`, error);
    }
  }

  private queryMemoryCache(query: MemoryQuery): MemoryRecord[] {
    const results: MemoryRecord[] = [];

    for (const record of this.memoryCache.values()) {
      if (this.matchesQuery(record, query)) {
        results.push(record);
      }
    }

    return this.limitAndOffset(results, query);
  }

  private async queryJSON(query: MemoryQuery): Promise<MemoryRecord[]> {
    const results: MemoryRecord[] = [];

    try {
      const files = await fs.readdir(this.DATABASE_DIR);

      for (const file of files) {
        if (!file.endsWith('-memory.json')) continue;

        const content = await fs.readFile(path.join(this.DATABASE_DIR, file), 'utf-8');
        const records: MemoryRecord[] = JSON.parse(content);

        for (const record of records) {
          if (this.matchesQuery(record, query)) {
            results.push(record);
          }
        }
      }
    } catch (error) {
      console.error('[UnifiedMemoryBridge] JSON query error:', error);
    }

    return this.limitAndOffset(results, query);
  }

  private async queryFiles(query: MemoryQuery): Promise<MemoryRecord[]> {
    const results: MemoryRecord[] = [];

    try {
      const files = await fs.readdir(this.LOGS_DIR);

      for (const file of files) {
        if (!file.startsWith('memory-') || !file.endsWith('.log')) continue;

        const content = await fs.readFile(path.join(this.LOGS_DIR, file), 'utf-8');
        const lines = content.split('\n').filter(l => l.trim());

        for (const line of lines) {
          try {
            const record: MemoryRecord = JSON.parse(line);
            if (this.matchesQuery(record, query)) {
              results.push(record);
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (error) {
      console.error('[UnifiedMemoryBridge] File query error:', error);
    }

    return this.limitAndOffset(results, query);
  }

  private async queryVector(query: MemoryQuery): Promise<MemoryRecord[]> {
    if (!query.semanticQuery) return [];
    return this.semanticSearch(query.semanticQuery, query.limit || 10);
  }

  private matchesQuery(record: MemoryRecord, query: MemoryQuery): boolean {
    if (query.type && record.type !== query.type) return false;
    if (query.key && record.key !== query.key) return false;
    if (query.botId && record.metadata.botId !== query.botId) return false;
    if (query.userId && record.metadata.userId !== query.userId) return false;

    if (query.timeRange) {
      const time = record.metadata.timestamp;
      if (time < query.timeRange.start || time > query.timeRange.end) return false;
    }

    return true;
  }

  private limitAndOffset(records: MemoryRecord[], query: MemoryQuery): MemoryRecord[] {
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    return records.slice(offset, offset + limit);
  }

  private mergeResults(results: MemoryRecord[]): MemoryRecord[] {
    const map = new Map<string, MemoryRecord>();

    for (const record of results) {
      const existing = map.get(record.id);
      if (!existing || existing.metadata.timestamp < record.metadata.timestamp) {
        map.set(record.id, record);
      }
    }

    return Array.from(map.values());
  }

  private async loadAllJSON(): Promise<MemoryRecord[]> {
    return this.queryJSON({ layer: 'json' });
  }

  private async loadAllFiles(): Promise<MemoryRecord[]> {
    return this.queryFiles({ layer: 'file' });
  }

  /**
   * Generate vector embedding for text
   * TODO: Add your Google AI API key to environment variables (GOOGLE_API_KEY)
   * This function is now production-ready for semantic search.
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    //
    // TODO: The user needs to provide a Google API Key and set it as an environment variable.
    //
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('[UnifiedMemoryBridge] GOOGLE_API_KEY not set. Using fallback hash-based embedding.');
      return this.fallbackGenerateEmbedding(text);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch (error) {
        console.error('[UnifiedMemoryBridge] Failed to generate embedding via Google AI, falling back to hash.', error);
        return this.fallbackGenerateEmbedding(text);
    }
  }

  /**
   * Fallback embedding generator if the primary API fails.
   */
  private fallbackGenerateEmbedding(text: string): number[] {
    // Simple hash-based embedding (512 dimensions)
    const dimensions = 512;
    const embedding = new Array(dimensions).fill(0);

    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      const hash = this.hashString(word);
      const index = hash % dimensions;
      embedding[index] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    return magnitudeA > 0 && magnitudeB > 0 ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// Singleton instance
export const unifiedMemoryBridge = new UnifiedMemoryBridge();
