/**
 * SERVICE REGISTRY
 * Kingdom Divine Architecture - Service Discovery & Management
 *
 * Central registry that:
 * - Discovers and registers all modules
 * - Monitors health across all services
 * - Routes requests to appropriate modules
 * - Enables auto-recovery and self-healing
 * - Provides unified API for service communication
 */

import {
  ModuleInterface,
  ModuleHealth,
  ModuleMetadata,
  OperationContext,
  OperationResult
} from './moduleInterface';

export interface ServiceRegistryConfig {
  autoStartModules: boolean;
  healthCheckInterval: number; // milliseconds
  enableAutoRecovery: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number; // milliseconds
}

export interface ServiceInfo {
  module: ModuleInterface;
  registeredAt: Date;
  lastHealthCheck: Date;
  health: ModuleHealth;
  requestQueue: number;
}

export interface ServiceMetrics {
  totalModules: number;
  healthyModules: number;
  degradedModules: number;
  unhealthyModules: number;
  totalRequests: number;
  totalErrors: number;
  averageResponseTime: number;
  systemUptime: number;
}

export interface RoutingRule {
  category?: string;
  operation?: string;
  priority?: number;
  condition?: (context: OperationContext) => boolean;
}

/**
 * ServiceRegistry - Central service management system
 *
 * Divine Design Principles:
 * - Automatic discovery: Modules self-register
 * - Health monitoring: Continuous health checks
 * - Auto-recovery: Failed services restart automatically
 * - Load balancing: Distribute load across healthy instances
 * - Graceful degradation: System continues even if services fail
 */
export class ServiceRegistry {
  private services: Map<string, ServiceInfo> = new Map();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private totalRequests: number = 0;
  private totalErrors: number = 0;
  private responseTimes: number[] = [];

  private config: ServiceRegistryConfig = {
    autoStartModules: true,
    healthCheckInterval: 30000, // 30 seconds
    enableAutoRecovery: true,
    maxConcurrentRequests: 100,
    requestTimeout: 60000 // 60 seconds
  };

  constructor(config?: Partial<ServiceRegistryConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    console.log('[ServiceRegistry] Initializing with Kingdom principles...');
    this.startHealthMonitoring();
  }

  /**
   * Register a module with the registry
   */
  async register(module: ModuleInterface): Promise<void> {
    const name = module.metadata.name;

    if (this.services.has(name)) {
      console.warn(`[ServiceRegistry] Module '${name}' already registered, replacing...`);
    }

    console.log(`[ServiceRegistry] Registering module: ${name}`);

    // Initialize the module
    await module.initialize();

    // Auto-start if configured
    if (this.config.autoStartModules && module.configuration.autoStart) {
      await module.start();
    }

    // Get initial health
    const health = await module.getHealth();

    // Register service
    this.services.set(name, {
      module,
      registeredAt: new Date(),
      lastHealthCheck: new Date(),
      health,
      requestQueue: 0
    });

    console.log(`[ServiceRegistry] Module '${name}' registered successfully`);
  }

  /**
   * Unregister a module
   */
  async unregister(moduleName: string): Promise<void> {
    const service = this.services.get(moduleName);
    if (!service) {
      console.warn(`[ServiceRegistry] Module '${moduleName}' not found`);
      return;
    }

    console.log(`[ServiceRegistry] Unregistering module: ${moduleName}`);

    // Stop the module gracefully
    await service.module.stop();

    // Remove from registry
    this.services.delete(moduleName);

    console.log(`[ServiceRegistry] Module '${moduleName}' unregistered`);
  }

  /**
   * Get a module by name
   */
  getModule(name: string): ModuleInterface | undefined {
    return this.services.get(name)?.module;
  }

  /**
   * Get all modules matching criteria
   */
  getModules(filter?: {
    category?: string;
    status?: ModuleHealth['status'];
    kingdomAligned?: boolean;
  }): ModuleInterface[] {
    const modules: ModuleInterface[] = [];

    for (const service of this.services.values()) {
      const module = service.module;

      // Apply filters
      if (filter?.category && module.metadata.category !== filter.category) continue;
      if (filter?.status && service.health.status !== filter.status) continue;
      if (filter?.kingdomAligned !== undefined && module.metadata.kingdomAligned !== filter.kingdomAligned) continue;

      modules.push(module);
    }

    return modules;
  }

  /**
   * Execute an operation on a specific module
   */
  async execute(
    moduleName: string,
    operation: string,
    params: any,
    context?: Partial<OperationContext>
  ): Promise<OperationResult> {
    const service = this.services.get(moduleName);
    if (!service) {
      return {
        success: false,
        error: {
          code: 'MODULE_NOT_FOUND',
          message: `Module '${moduleName}' not found in registry`
        },
        metadata: { duration: 0 }
      };
    }

    // Check service health
    if (service.health.status === 'unhealthy') {
      return {
        success: false,
        error: {
          code: 'MODULE_UNHEALTHY',
          message: `Module '${moduleName}' is unhealthy`
        },
        metadata: { duration: 0 }
      };
    }

    // Build full context
    const fullContext: OperationContext = {
      requestId: this.generateRequestId(),
      timestamp: new Date(),
      timeout: this.config.requestTimeout,
      ...context
    };

    // Track request
    this.totalRequests++;
    service.requestQueue++;

    const startTime = Date.now();

    try {
      const result = await service.module.execute(operation, params, fullContext);

      // Track metrics
      const duration = Date.now() - startTime;
      this.responseTimes.push(duration);
      if (this.responseTimes.length > 100) this.responseTimes.shift();

      if (!result.success) {
        this.totalErrors++;
      }

      return result;

    } catch (error) {
      this.totalErrors++;

      return {
        success: false,
        error: {
          code: 'EXECUTION_FAILED',
          message: (error as Error).message,
          details: error
        },
        metadata: { duration: Date.now() - startTime }
      };

    } finally {
      service.requestQueue--;
    }
  }

  /**
   * Smart routing - Find best module for an operation
   */
  async route(
    operation: string,
    params: any,
    context?: Partial<OperationContext>,
    rules?: RoutingRule
  ): Promise<OperationResult> {
    // Find all modules that support this operation
    const candidates: Array<{ module: string; score: number }> = [];

    for (const [name, service] of this.services.entries()) {
      if (!service.module.capabilities.operations.includes(operation)) continue;

      // Calculate routing score
      let score = 100;

      // Prefer healthy services
      if (service.health.status === 'healthy') score += 50;
      else if (service.health.status === 'degraded') score += 20;
      else continue; // Skip unhealthy

      // Prefer less busy services
      score -= service.requestQueue * 5;

      // Prefer faster services
      score += Math.max(0, 50 - service.health.metrics.averageResponseTime / 100);

      // Apply category filter
      if (rules?.category && service.module.metadata.category === rules.category) {
        score += 30;
      }

      // Apply priority
      if (rules?.priority) {
        score += rules.priority * 10;
      }

      candidates.push({ module: name, score });
    }

    if (candidates.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_MODULE_FOUND',
          message: `No module found to handle operation '${operation}'`
        },
        metadata: { duration: 0 }
      };
    }

    // Sort by score and pick best
    candidates.sort((a, b) => b.score - a.score);
    const bestModule = candidates[0].module;

    console.log(`[ServiceRegistry] Routing '${operation}' to '${bestModule}' (score: ${candidates[0].score})`);

    return this.execute(bestModule, operation, params, context);
  }

  /**
   * Get comprehensive system metrics
   */
  async getMetrics(): Promise<ServiceMetrics> {
    const modules = Array.from(this.services.values());

    const healthy = modules.filter(s => s.health.status === 'healthy').length;
    const degraded = modules.filter(s => s.health.status === 'degraded').length;
    const unhealthy = modules.filter(s => s.health.status === 'unhealthy').length;

    const avgResponseTime =
      this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        : 0;

    return {
      totalModules: modules.length,
      healthyModules: healthy,
      degradedModules: degraded,
      unhealthyModules: unhealthy,
      totalRequests: this.totalRequests,
      totalErrors: this.totalErrors,
      averageResponseTime: avgResponseTime,
      systemUptime: Date.now() - this.startTime.getTime()
    };
  }

  /**
   * Get detailed health report for all services
   */
  async getHealthReport(): Promise<Record<string, ModuleHealth>> {
    const report: Record<string, ModuleHealth> = {};

    for (const [name, service] of this.services.entries()) {
      report[name] = await service.module.getHealth();
    }

    return report;
  }

  /**
   * Start all registered modules
   */
  async startAll(): Promise<void> {
    console.log('[ServiceRegistry] Starting all modules...');

    for (const [name, service] of this.services.entries()) {
      try {
        await service.module.start();
        console.log(`[ServiceRegistry] Started: ${name}`);
      } catch (error) {
        console.error(`[ServiceRegistry] Failed to start ${name}:`, error);
      }
    }
  }

  /**
   * Stop all registered modules
   */
  async stopAll(): Promise<void> {
    console.log('[ServiceRegistry] Stopping all modules...');

    for (const [name, service] of this.services.entries()) {
      try {
        await service.module.stop();
        console.log(`[ServiceRegistry] Stopped: ${name}`);
      } catch (error) {
        console.error(`[ServiceRegistry] Failed to stop ${name}:`, error);
      }
    }

    // Stop health monitoring
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Restart a specific module
   */
  async restartModule(moduleName: string): Promise<void> {
    const service = this.services.get(moduleName);
    if (!service) {
      throw new Error(`Module '${moduleName}' not found`);
    }

    console.log(`[ServiceRegistry] Restarting module: ${moduleName}`);
    await service.module.restart();

    // Update health immediately
    service.health = await service.module.getHealth();
    service.lastHealthCheck = new Date();
  }

  /**
   * List all registered modules
   */
  listModules(): ModuleMetadata[] {
    return Array.from(this.services.values()).map(s => s.module.metadata);
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Start continuous health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckTimer) return;

    this.healthCheckTimer = setInterval(async () => {
      await this.checkAllHealth();
    }, this.config.healthCheckInterval);

    console.log(`[ServiceRegistry] Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  /**
   * Check health of all modules
   */
  private async checkAllHealth(): Promise<void> {
    const checks: Promise<void>[] = [];

    for (const [name, service] of this.services.entries()) {
      checks.push(
        (async () => {
          try {
            const health = await service.module.getHealth();
            service.health = health;
            service.lastHealthCheck = new Date();

            // Auto-recovery for unhealthy services
            if (
              health.status === 'unhealthy' &&
              this.config.enableAutoRecovery &&
              service.module.configuration.restartOnFailure
            ) {
              console.log(`[ServiceRegistry] Attempting auto-recovery for ${name}...`);
              await this.restartModule(name);
            }
          } catch (error) {
            console.error(`[ServiceRegistry] Health check failed for ${name}:`, error);
          }
        })()
      );
    }

    await Promise.all(checks);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
export const serviceRegistry = new ServiceRegistry({
  autoStartModules: true,
  healthCheckInterval: 30000,
  enableAutoRecovery: true,
  maxConcurrentRequests: 100,
  requestTimeout: 60000
});
