/**
 * MODULE INTERFACE CONTRACT SYSTEM
 * Kingdom Divine Architecture - Modular Excellence
 *
 * Defines the universal contract that ALL services must implement.
 * This enables:
 * - Automatic service discovery
 * - Health monitoring
 * - Dynamic loading/unloading
 * - Cross-service communication
 * - Self-healing capabilities
 */

export interface ModuleHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  uptime: number; // milliseconds
  lastCheck: Date;
  metrics: {
    requestsHandled: number;
    errorsEncountered: number;
    averageResponseTime: number;
    memoryUsageMB: number;
    cpuUsagePercent: number;
  };
  dependencies: Array<{
    name: string;
    status: 'available' | 'unavailable';
  }>;
  errorLog: Array<{
    timestamp: Date;
    error: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
}

export interface ModuleCapabilities {
  operations: string[]; // List of available operations
  inputTypes: string[]; // Types of input accepted
  outputTypes: string[]; // Types of output produced
  supportsConcurrency: boolean;
  maxConcurrentOperations?: number;
  requiresAuthentication: boolean;
  requiresExternalAPIs: string[]; // List of external dependencies
}

export interface ModuleMetadata {
  name: string;
  version: string;
  description: string;
  category: string; // e.g., 'security', 'banking', 'learning', 'storage'
  author: string;
  license: string;
  kingdomAligned: boolean; // Does it follow Kingdom principles?
  createdAt: Date;
  lastUpdated: Date;
}

export interface ModuleConfiguration {
  enabled: boolean;
  autoStart: boolean;
  restartOnFailure: boolean;
  maxRestarts: number;
  healthCheckInterval: number; // milliseconds
  timeout: number; // milliseconds for operations
  rateLimit?: {
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
  };
  customSettings: Record<string, any>;
}

export interface OperationContext {
  requestId: string;
  userId?: string;
  botId?: string;
  timestamp: Date;
  timeout?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface OperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    duration: number;
    memoryUsed?: number;
    retries?: number;
  };
}

/**
 * ModuleInterface - Universal contract for all services
 *
 * Every service in the GodBrain system must implement this interface.
 * This enables the ServiceRegistry to discover, monitor, and manage all modules.
 */
export interface ModuleInterface {
  // Module identity
  readonly metadata: ModuleMetadata;

  // Module configuration
  configuration: ModuleConfiguration;

  // Module capabilities
  readonly capabilities: ModuleCapabilities;

  /**
   * Initialize the module
   * Called when the module is first loaded
   */
  initialize(): Promise<void>;

  /**
   * Start the module
   * Begin accepting operations
   */
  start(): Promise<void>;

  /**
   * Stop the module
   * Gracefully shut down and cleanup resources
   */
  stop(): Promise<void>;

  /**
   * Restart the module
   * Stop and start in sequence
   */
  restart(): Promise<void>;

  /**
   * Get current health status
   */
  getHealth(): Promise<ModuleHealth>;

  /**
   * Execute an operation
   * The core functionality of the module
   */
  execute(
    operation: string,
    params: any,
    context: OperationContext
  ): Promise<OperationResult>;

  /**
   * Validate input before execution
   * Returns validation errors if any
   */
  validate(operation: string, params: any): Promise<string[]>;

  /**
   * Handle errors and attempt recovery
   */
  handleError(error: Error, context: OperationContext): Promise<void>;

  /**
   * Update configuration dynamically
   */
  updateConfiguration(config: Partial<ModuleConfiguration>): Promise<void>;

  /**
   * Get module statistics
   */
  getStatistics(): Promise<Record<string, any>>;
}

/**
 * BaseModule - Abstract base class implementing common functionality
 *
 * All services should extend this class to inherit standard behaviors.
 */
export abstract class BaseModule implements ModuleInterface {
  public readonly metadata: ModuleMetadata = {
      name: 'UnnamedModule',
      version: '0.0.0',
      description: '',
      category: '',
      author: '',
      license: '',
      kingdomAligned: false,
      createdAt: new Date(),
      lastUpdated: new Date()
  };
  abstract readonly capabilities: ModuleCapabilities;

  public configuration: ModuleConfiguration = {
    enabled: true,
    autoStart: true,
    restartOnFailure: true,
    maxRestarts: 3,
    healthCheckInterval: 30000, // 30 seconds
    timeout: 60000, // 60 seconds
    customSettings: {}
  };

  protected startTime: Date | null = null;
  protected requestCount: number = 0;
  protected errorCount: number = 0;
  protected responseTimes: number[] = [];
  protected errorLog: ModuleHealth['errorLog'] = [];
  protected restartCount: number = 0;

  async initialize(): Promise<void> {
    console.log(`[${this.metadata.name}] Initializing...`);
    await this.onInitialize();
  }

  async start(): Promise<void> {
    console.log(`[${this.metadata.name}] Starting...`);
    this.startTime = new Date();
    this.restartCount = 0;
    await this.onStart();
  }

  async stop(): Promise<void> {
    console.log(`[${this.metadata.name}] Stopping...`);
    await this.onStop();
    this.startTime = null;
  }

  async restart(): Promise<void> {
    console.log(`[${this.metadata.name}] Restarting...`);
    this.restartCount++;

    if (this.restartCount > this.configuration.maxRestarts) {
      throw new Error(`Max restarts (${this.configuration.maxRestarts}) exceeded`);
    }

    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
    await this.start();
  }

  async getHealth(): Promise<ModuleHealth> {
    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;

    // Simple CPU usage estimation (not accurate, but good enough)
    const cpuUsagePercent = Math.min(100, (this.requestCount / (uptime / 1000)) * 10);

    return {
      status: this.determineHealthStatus(),
      uptime,
      lastCheck: new Date(),
      metrics: {
        requestsHandled: this.requestCount,
        errorsEncountered: this.errorCount,
        averageResponseTime: avgResponseTime,
        memoryUsageMB,
        cpuUsagePercent
      },
      dependencies: await this.checkDependencies(),
      errorLog: this.errorLog.slice(-10) // Last 10 errors
    };
  }

  async execute(
    operation: string,
    params: any,
    context: OperationContext
  ): Promise<OperationResult> {
    const startTime = Date.now();
    this.requestCount++;

    try {
      // Validate input
      const validationErrors = await this.validate(operation, params);
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Execute operation with timeout
      const timeoutMs = context.timeout || this.configuration.timeout;
      const result = await this.executeWithTimeout(
        () => this.onExecute(operation, params, context),
        timeoutMs
      );

      const duration = Date.now() - startTime;
      this.responseTimes.push(duration);

      // Keep only last 100 response times
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }

      return {
        success: true,
        data: result,
        metadata: { duration }
      };

    } catch (error) {
      this.errorCount++;
      await this.handleError(error as Error, context);

      const duration = Date.now() - startTime;

      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: (error as Error).message,
          details: error
        },
        metadata: { duration }
      };
    }
  }

  async validate(operation: string, params: any): Promise<string[]> {
    const errors: string[] = [];

    if (!this.capabilities.operations.includes(operation)) {
      errors.push(`Operation '${operation}' not supported`);
    }

    return errors;
  }

  async handleError(error: Error, context: OperationContext): Promise<void> {
    const severity = this.determineErrorSeverity(error);

    this.errorLog.push({
      timestamp: new Date(),
      error: error.message,
      severity
    });

    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    console.error(`[${this.metadata.name}] Error (${severity}):`, error);

    // Auto-restart on critical errors if configured
    if (
      severity === 'critical' &&
      this.configuration.restartOnFailure &&
      this.restartCount < this.configuration.maxRestarts
    ) {
      console.log(`[${this.metadata.name}] Attempting auto-recovery...`);
      await this.restart();
    }
  }

  async updateConfiguration(config: Partial<ModuleConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
    console.log(`[${this.metadata.name}] Configuration updated`);
  }

  async getStatistics(): Promise<Record<string, any>> {
    return {
      requestCount: this.requestCount,
      errorCount: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      restartCount: this.restartCount,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : 0
    };
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ============================================================================

  protected abstract onInitialize(): Promise<void>;
  protected abstract onStart(): Promise<void>;
  protected abstract onStop(): Promise<void>;
  protected abstract onExecute(
    operation: string,
    params: any,
    context: OperationContext
  ): Promise<any>;
  protected abstract checkDependencies(): Promise<ModuleHealth['dependencies']>;

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private determineHealthStatus(): ModuleHealth['status'] {
    if (this.startTime === null) return 'unhealthy';
    if (this.errorCount === 0) return 'healthy';

    const errorRate = this.errorCount / this.requestCount;
    if (errorRate > 0.5) return 'unhealthy';
    if (errorRate > 0.2) return 'degraded';
    return 'healthy';
  }

  private determineErrorSeverity(error: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) return 'critical';
    if (message.includes('database') || message.includes('connection')) return 'high';
    if (message.includes('validation') || message.includes('timeout')) return 'medium';
    return 'low';
  }

  protected async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      )
    ]);
  }
}

/**
 * Module decorator for automatic registration
 */
export function Module(metadata: Partial<ModuleMetadata>) {
  return function <T extends { new(...args: any[]): ModuleInterface }>(constructor: T) {
    const originalMetadata = Object.getOwnPropertyDescriptor(
      constructor.prototype,
      'metadata'
    );

    Object.defineProperty(constructor.prototype, 'metadata', {
      get() {
        return {
          ...metadata,
          createdAt: new Date(),
          lastUpdated: new Date()
        };
      }
    });

    return constructor;
  };
}
