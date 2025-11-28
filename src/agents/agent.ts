import {
  BaseModule,
  ModuleMetadata,
  OperationContext,
} from '../services/moduleInterface';
import { unifiedMemoryBridge, MemoryRecord } from '../services/unifiedMemoryBridge';

/**
 * Agent - Abstract base class for all autonomous agents.
 *
 * Extends the GodBrain BaseModule with integrated memory capabilities,
 * providing a foundation for agents that can learn and adapt.
 *
 * Core Features:
 * - Automatic memory recall before executing an operation.
 * - Automatic memory storage of the operation's result.
 * - Simplified interface for agent developers.
 */
export abstract class Agent extends BaseModule {
  
  /**
   * Implements the onExecute method from BaseModule.
   * This is the entry point for an agent's logic when called by the ServiceRegistry.
   * It wraps the core agent logic with memory operations.
   */
  protected async onExecute(
    operation: string,
    params: any,
    context: OperationContext
  ): Promise<any> {
    
    // 1. Recall relevant memories before acting
    const recalledMemories = await this.recall(operation, params, context);

    // 2. Execute the agent's specific logic
    const result = await this.onAgentExecute(operation, params, context, recalledMemories);
    
    // 3. Memorize the outcome
    // We create a dummy OperationResult for the memorize function
    const operationResult = { success: true, data: result, metadata: { duration: 0 }};
    await this.memorize(operation, params, context, operationResult);

    return result;
  }

  /**
   * Recall relevant memories from the UnifiedMemoryBridge.
   */
  protected async recall(
    operation: string,
    params: any,
    context: OperationContext
  ): Promise<MemoryRecord[]> {
    const semanticQuery = `Recalling memories for operation '${operation}' with parameters: ${JSON.stringify(params)}`;
    try {
      return await unifiedMemoryBridge.semanticSearch(semanticQuery, 10);
    } catch (error) {
      console.error(`[${this.metadata.name}] Failed to recall memories:`, error);
      return [];
    }
  }

  /**
   * Store the result of an operation in the UnifiedMemoryBridge.
   */
  protected async memorize(
    operation: string,
    params: any,
    context: OperationContext,
    result: any 
  ): Promise<string> {
    try {
      const memory: Omit<MemoryRecord, 'id'> = {
        layer: 'memory',
        type: 'operation_result',
        key: `${this.metadata.name}:${operation}`,
        value: {
          params,
          result,
        },
        metadata: {
          botId: this.metadata.name,
          userId: context.userId,
          timestamp: new Date(),
          importance: result.success ? 50 : 70, // Failures are more important to learn from
          source: 'agent_execution',
          confidence: 100,
        },
      };
      return await unifiedMemoryBridge.store(memory);
    } catch (error) {
      console.error(`[${this.metadata.name}] Failed to memorize result:`, error);
      return '';
    }
  }

  // ============================================================================
  // ABSTRACT METHODS - Must be implemented by Agent subclasses
  // ============================================================================

  /**
   * The core logic of the agent for a given operation.
   * It receives recalled memories as part of its context.
   */
  protected abstract onAgentExecute(
    operation: string,
    params: any,
    context: OperationContext,
    recalledMemories: MemoryRecord[]
  ): Promise<any>;

}