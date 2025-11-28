/**
 * INFINITE WORKER ORCHESTRATOR (TypeScript)
 * Kingdom Divine Architecture - Unlimited Parallel Execution
 *
 * Manages unlimited concurrent task execution across:
 * - Node.js worker threads
 * - Child processes
 * - Python agent workers
 * - External API workers
 *
 * Divine Design Principles:
 * - Infinite capacity: Dynamically spawn workers based on load
 * - Intelligent distribution: Route tasks to optimal workers
 * - Self-healing: Auto-restart failed workers
 * - Cross-system coordination: TypeScript + Python workers unified
 * - Load balancing: Distribute work evenly
 */

import { Worker } from 'worker_threads';
import { fork, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import os from 'os';

export interface WorkerTask {
  id: string;
  type: 'compute' | 'io' | 'network' | 'ai' | 'blockchain' | 'database';
  priority: 'low' | 'medium' | 'high' | 'critical';
  operation: string;
  params: any;
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
}

export interface WorkerResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
  metrics: {
    duration: number;
    workerId: string;
    workerType: string;
    retryCount: number;
  };
}

export interface WorkerInfo {
  id: string;
  type: 'thread' | 'process' | 'python';
  status: 'idle' | 'busy' | 'dead';
  instance: Worker | ChildProcess | null;
  tasksCompleted: number;
  tasksInProgress: number;
  errorCount: number;
  averageExecutionTime: number;
  memoryUsageMB: number;
  createdAt: Date;
  lastTaskAt: Date | null;
}

export interface OrchestratorConfig {
  minWorkers: number;
  maxWorkers: number;
  workerIdleTimeout: number; // milliseconds
  taskTimeout: number; // milliseconds
  maxRetries: number;
  scaleUpThreshold: number; // queue size to trigger scaling
  scaleDownThreshold: number; // idle time to trigger scaling down
  enablePythonWorkers: boolean;
  pythonWorkerPort: number;
}

export interface OrchestratorMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  activeTasks: number;
  queuedTasks: number;
  totalWorkers: number;
  idleWorkers: number;
  busyWorkers: number;
  averageTaskDuration: number;
  tasksThroughput: number; // tasks per second
  systemLoad: number;
}

/**
 * InfiniteWorkerOrchestrator - Unlimited parallel task execution
 *
 * This orchestrator can spawn unlimited workers dynamically based on load.
 * It intelligently distributes tasks across worker threads, child processes,
 * and Python agents for optimal performance.
 */
export class InfiniteWorkerOrchestrator extends EventEmitter {
  private workers: Map<string, WorkerInfo> = new Map();
  private taskQueue: WorkerTask[] = [];
  private activeTasks: Map<string, { task: WorkerTask; workerId: string; startTime: Date }> = new Map();
  private completedTasks: number = 0;
  private failedTasks: number = 0;
  private taskDurations: number[] = [];

  private config: OrchestratorConfig = {
    minWorkers: Math.max(2, Math.floor(os.cpus().length / 2)),
    maxWorkers: Infinity, // Truly infinite
    workerIdleTimeout: 300000, // 5 minutes
    taskTimeout: 300000, // 5 minutes
    maxRetries: 3,
    scaleUpThreshold: 10,
    scaleDownThreshold: 60000, // 1 minute idle
    enablePythonWorkers: true,
    pythonWorkerPort: 8003
  };

  private scalingTimer: NodeJS.Timeout | null = null;
  private metricsTimer: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();

  constructor(config?: Partial<OrchestratorConfig>) {
    super();

    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('[InfiniteWorkerOrchestrator] Initializing with unlimited capacity...');
    console.log(`[InfiniteWorkerOrchestrator] CPU cores: ${os.cpus().length}`);
    console.log(`[InfiniteWorkerOrchestrator] Min workers: ${this.config.minWorkers}`);
    console.log(`[InfiniteWorkerOrchestrator] Max workers: UNLIMITED`);
  }

  /**
   * Start the orchestrator
   */
  async start(): Promise<void> {
    console.log('[InfiniteWorkerOrchestrator] Starting...');

    // Spawn initial workers
    for (let i = 0; i < this.config.minWorkers; i++) {
      await this.spawnWorker('thread');
    }

    // Start auto-scaling
    this.startAutoScaling();

    // Start metrics collection
    this.startMetricsCollection();

    console.log('[InfiniteWorkerOrchestrator] Started successfully');
  }

  /**
   * Stop the orchestrator
   */
  async stop(): Promise<void> {
    console.log('[InfiniteWorkerOrchestrator] Stopping...');

    // Stop timers
    if (this.scalingTimer) clearInterval(this.scalingTimer);
    if (this.metricsTimer) clearInterval(this.metricsTimer);

    // Terminate all workers
    for (const [id, worker] of this.workers.entries()) {
      await this.terminateWorker(id);
    }

    console.log('[InfiniteWorkerOrchestrator] Stopped');
  }

  /**
   * Submit a task for execution
   */
  async submitTask(task: Omit<WorkerTask, 'id'>): Promise<string> {
    const fullTask: WorkerTask = {
      ...task,
      id: this.generateTaskId(),
      timeout: task.timeout || this.config.taskTimeout,
      retries: task.retries || 0
    };

    // Add to queue
    this.taskQueue.push(fullTask);

    // Sort queue by priority
    this.sortQueue();

    // Emit event
    this.emit('task:queued', fullTask);

    console.log(`[InfiniteWorkerOrchestrator] Task queued: ${fullTask.id} (priority: ${fullTask.priority})`);

    // Try to process immediately
    await this.processQueue();

    return fullTask.id;
  }

  /**
   * Submit multiple tasks in batch
   */
  async submitBatch(tasks: Array<Omit<WorkerTask, 'id'>>): Promise<string[]> {
    const taskIds: string[] = [];

    for (const task of tasks) {
      const id = await this.submitTask(task);
      taskIds.push(id);
    }

    return taskIds;
  }

  /**
   * Wait for a task to complete
   */
  async waitForTask(taskId: string, timeout?: number): Promise<WorkerResult> {
    return new Promise((resolve, reject) => {
      const timeoutMs = timeout || this.config.taskTimeout;
      let timer: NodeJS.Timeout;

      const onComplete = (result: WorkerResult) => {
        if (result.taskId === taskId) {
          clearTimeout(timer);
          this.removeListener('task:completed', onComplete);
          this.removeListener('task:failed', onComplete);
          resolve(result);
        }
      };

      this.on('task:completed', onComplete);
      this.on('task:failed', onComplete);

      timer = setTimeout(() => {
        this.removeListener('task:completed', onComplete);
        this.removeListener('task:failed', onComplete);
        reject(new Error(`Task ${taskId} timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  /**
   * Get current orchestrator metrics
   */
  getMetrics(): OrchestratorMetrics {
    const idleWorkers = Array.from(this.workers.values()).filter(w => w.status === 'idle').length;
    const busyWorkers = Array.from(this.workers.values()).filter(w => w.status === 'busy').length;

    const avgDuration =
      this.taskDurations.length > 0
        ? this.taskDurations.reduce((a, b) => a + b, 0) / this.taskDurations.length
        : 0;

    const uptime = (Date.now() - this.startTime.getTime()) / 1000; // seconds
    const throughput = uptime > 0 ? this.completedTasks / uptime : 0;

    return {
      totalTasks: this.completedTasks + this.failedTasks + this.activeTasks.size + this.taskQueue.length,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      totalWorkers: this.workers.size,
      idleWorkers,
      busyWorkers,
      averageTaskDuration: avgDuration,
      tasksThroughput: throughput,
      systemLoad: os.loadavg()[0]
    };
  }

  /**
   * Get worker information
   */
  getWorkers(): WorkerInfo[] {
    return Array.from(this.workers.values());
  }

  /**
   * Get task queue status
   */
  getQueueStatus(): Array<{ task: WorkerTask; position: number }> {
    return this.taskQueue.map((task, index) => ({ task, position: index }));
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Spawn a new worker
   */
  private async spawnWorker(type: 'thread' | 'process' | 'python'): Promise<string> {
    const workerId = `worker-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    let instance: Worker | ChildProcess | null = null;

    if (type === 'thread') {
      // Create worker thread
      const workerPath = path.join(__dirname, '../workers/taskWorker.js');
      instance = new Worker(workerPath);

      instance.on('message', (result: WorkerResult) => {
        this.handleTaskComplete(workerId, result);
      });

      instance.on('error', (error) => {
        console.error(`[Worker ${workerId}] Error:`, error);
        this.handleWorkerError(workerId, error);
      });

      instance.on('exit', (code) => {
        if (code !== 0) {
          console.error(`[Worker ${workerId}] Exited with code ${code}`);
        }
        this.handleWorkerDeath(workerId);
      });

    } else if (type === 'process') {
      // Create child process
      const scriptPath = path.join(__dirname, '../workers/taskProcess.js');
      instance = fork(scriptPath);

      instance.on('message', (result: WorkerResult) => {
        this.handleTaskComplete(workerId, result);
      });

      instance.on('error', (error) => {
        console.error(`[Process ${workerId}] Error:`, error);
        this.handleWorkerError(workerId, error);
      });

      instance.on('exit', (code) => {
        if (code !== 0) {
          console.error(`[Process ${workerId}] Exited with code ${code}`);
        }
        this.handleWorkerDeath(workerId);
      });
    }
    // Python workers are managed separately via HTTP API

    const workerInfo: WorkerInfo = {
      id: workerId,
      type,
      status: 'idle',
      instance,
      tasksCompleted: 0,
      tasksInProgress: 0,
      errorCount: 0,
      averageExecutionTime: 0,
      memoryUsageMB: 0,
      createdAt: new Date(),
      lastTaskAt: null
    };

    this.workers.set(workerId, workerInfo);

    console.log(`[InfiniteWorkerOrchestrator] Spawned ${type} worker: ${workerId}`);
    this.emit('worker:spawned', workerInfo);

    return workerId;
  }

  /**
   * Terminate a worker
   */
  private async terminateWorker(workerId: string): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    console.log(`[InfiniteWorkerOrchestrator] Terminating worker: ${workerId}`);

    if (worker.instance) {
      if (worker.type === 'thread') {
        await (worker.instance as Worker).terminate();
      } else if (worker.type === 'process') {
        (worker.instance as ChildProcess).kill();
      }
    }

    this.workers.delete(workerId);
    this.emit('worker:terminated', worker);
  }

  /**
   * Process the task queue
   */
  private async processQueue(): Promise<void> {
    // Get available workers
    const idleWorkers = Array.from(this.workers.values()).filter(w => w.status === 'idle');

    if (idleWorkers.length === 0 && this.taskQueue.length > 0) {
      // No idle workers, check if we should scale up
      if (this.workers.size < this.config.maxWorkers && this.taskQueue.length >= this.config.scaleUpThreshold) {
        console.log('[InfiniteWorkerOrchestrator] Scaling up workers...');
        await this.spawnWorker('thread');
        // Try again after spawning
        await this.processQueue();
      }
      return;
    }

    // Assign tasks to idle workers
    for (const worker of idleWorkers) {
      if (this.taskQueue.length === 0) break;

      const task = this.taskQueue.shift()!;
      await this.assignTaskToWorker(task, worker);
    }
  }

  /**
   * Assign a task to a specific worker
   */
  private async assignTaskToWorker(task: WorkerTask, worker: WorkerInfo): Promise<void> {
    worker.status = 'busy';
    worker.tasksInProgress++;
    worker.lastTaskAt = new Date();

    this.activeTasks.set(task.id, {
      task,
      workerId: worker.id,
      startTime: new Date()
    });

    console.log(`[InfiniteWorkerOrchestrator] Assigning task ${task.id} to worker ${worker.id}`);

    // Send task to worker
    if (worker.type === 'thread' || worker.type === 'process') {
      (worker.instance as any).postMessage?.(task) || (worker.instance as any).send?.(task);
    } else if (worker.type === 'python') {
      // HTTP request to Python worker
      await this.sendTaskToPythonWorker(task, worker);
    }

    // Set timeout
    setTimeout(() => {
      if (this.activeTasks.has(task.id)) {
        this.handleTaskTimeout(task.id, worker.id);
      }
    }, task.timeout || this.config.taskTimeout);
  }

  /**
   * Handle task completion
   */
  private handleTaskComplete(workerId: string, result: WorkerResult): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    const activeTask = this.activeTasks.get(result.taskId);
    if (!activeTask) return;

    // Update metrics
    const duration = Date.now() - activeTask.startTime.getTime();
    this.taskDurations.push(duration);
    if (this.taskDurations.length > 100) this.taskDurations.shift();

    worker.status = 'idle';
    worker.tasksInProgress--;
    worker.tasksCompleted++;
    worker.averageExecutionTime =
      (worker.averageExecutionTime * (worker.tasksCompleted - 1) + duration) / worker.tasksCompleted;

    this.activeTasks.delete(result.taskId);

    if (result.success) {
      this.completedTasks++;
      this.emit('task:completed', result);
    } else {
      worker.errorCount++;

      // Retry if configured
      if (activeTask.task.retries! < this.config.maxRetries) {
        console.log(`[InfiniteWorkerOrchestrator] Retrying task ${result.taskId} (attempt ${activeTask.task.retries! + 1})`);
        activeTask.task.retries!++;
        this.taskQueue.unshift(activeTask.task); // Priority retry
      } else {
        this.failedTasks++;
        this.emit('task:failed', result);
      }
    }

    // Process next task
    this.processQueue();
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(workerId: string, error: Error): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    worker.errorCount++;

    // Find task assigned to this worker
    for (const [taskId, activeTask] of this.activeTasks.entries()) {
      if (activeTask.workerId === workerId) {
        const result: WorkerResult = {
          taskId,
          success: false,
          error: {
            code: 'WORKER_ERROR',
            message: error.message,
            stack: error.stack
          },
          metrics: {
            duration: Date.now() - activeTask.startTime.getTime(),
            workerId,
            workerType: worker.type,
            retryCount: activeTask.task.retries || 0
          }
        };

        this.handleTaskComplete(workerId, result);
      }
    }
  }

  /**
   * Handle worker death
   */
  private handleWorkerDeath(workerId: string): void {
    const worker = this.workers.get(workerId);
    if (!worker) return;

    worker.status = 'dead';

    console.log(`[InfiniteWorkerOrchestrator] Worker ${workerId} died, respawning...`);

    // Requeue tasks assigned to this worker
    for (const [taskId, activeTask] of this.activeTasks.entries()) {
      if (activeTask.workerId === workerId) {
        this.taskQueue.unshift(activeTask.task);
        this.activeTasks.delete(taskId);
      }
    }

    // Remove dead worker
    this.workers.delete(workerId);

    // Spawn replacement if below minimum
    if (this.workers.size < this.config.minWorkers) {
      this.spawnWorker(worker.type);
    }
  }

  /**
   * Handle task timeout
   */
  private handleTaskTimeout(taskId: string, workerId: string): void {
    const activeTask = this.activeTasks.get(taskId);
    if (!activeTask) return;

    console.log(`[InfiniteWorkerOrchestrator] Task ${taskId} timed out`);

    const result: WorkerResult = {
      taskId,
      success: false,
      error: {
        code: 'TIMEOUT',
        message: `Task exceeded timeout of ${activeTask.task.timeout}ms`
      },
      metrics: {
        duration: Date.now() - activeTask.startTime.getTime(),
        workerId,
        workerType: this.workers.get(workerId)?.type || 'unknown',
        retryCount: activeTask.task.retries || 0
      }
    };

    this.handleTaskComplete(workerId, result);

    // Consider restarting the worker as it may be hung
    this.terminateWorker(workerId);
    this.spawnWorker('thread');
  }

  /**
   * Sort queue by priority
   */
  private sortQueue(): void {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    this.taskQueue.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
  }

  /**
   * Auto-scaling logic
   */
  private startAutoScaling(): void {
    this.scalingTimer = setInterval(() => {
      const metrics = this.getMetrics();

      // Scale up if queue is growing
      if (
        metrics.queuedTasks >= this.config.scaleUpThreshold &&
        metrics.totalWorkers < this.config.maxWorkers
      ) {
        console.log(`[InfiniteWorkerOrchestrator] Auto-scaling up (queue: ${metrics.queuedTasks})`);
        this.spawnWorker('thread');
      }

      // Scale down if workers are idle for too long
      if (metrics.idleWorkers > this.config.minWorkers && metrics.queuedTasks === 0) {
        for (const worker of this.workers.values()) {
          if (
            worker.status === 'idle' &&
            worker.lastTaskAt &&
            Date.now() - worker.lastTaskAt.getTime() > this.config.scaleDownThreshold
          ) {
            console.log(`[InfiniteWorkerOrchestrator] Auto-scaling down (worker idle: ${worker.id})`);
            this.terminateWorker(worker.id);
            break; // Scale down one at a time
          }
        }
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(() => {
      const metrics = this.getMetrics();
      this.emit('metrics', metrics);
    }, 10000); // Emit metrics every 10 seconds
  }

  /**
   * Send task to Python worker via HTTP
   */
  private async sendTaskToPythonWorker(task: WorkerTask, worker: WorkerInfo): Promise<void> {
    try {
      const response = await fetch(`http://localhost:${this.config.pythonWorkerPort}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      });

      const result: WorkerResult = await response.json();
      this.handleTaskComplete(worker.id, result);

    } catch (error) {
      this.handleWorkerError(worker.id, error as Error);
    }
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

// Singleton instance
export const infiniteWorkerOrchestrator = new InfiniteWorkerOrchestrator();
