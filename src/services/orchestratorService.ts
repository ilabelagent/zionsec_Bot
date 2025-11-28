
import {
  BaseModule,
  Module,
  OperationContext,
  OperationResult,
} from './moduleInterface';
import { serviceRegistry } from './serviceRegistry';
import { unifiedMemoryBridge } from './unifiedMemoryBridge';

interface TaskManifest {
  // A high-level description of the goal, e.g., "compromise-network"
  goal: string;
  // A specific operation for a specific module, e.g., "run-recon"
  operation?: string;
  // The preferred module or agent to handle the task
  targetModule?: string;
  // Parameters for the operation
  params: Record<string, any>;
  // Context for the user/client submitting the task
  submitter: string;
}

@Module({
  name: 'OrchestratorService',
  version: '1.0.0',
  description: 'The master mind of the GodBrain system. Plans and dispatches tasks.',
  category: 'System',
  author: 'GodBrain',
})
export class OrchestratorService extends BaseModule {
  readonly capabilities = {
    operations: ['handleTask'],
    inputTypes: ['TaskManifest'],
    outputTypes: ['json'],
    supportsConcurrency: true,
    maxConcurrentOperations: 50,
    requiresAuthentication: true,
    requiresExternalAPIs: [],
  };

  protected async onInitialize(): Promise<void> {
    console.log(`[${this.metadata.name}] Initialized.`);
  }

  protected async onStart(): Promise<void> {
    console.log(`[${this.metadata.name}] Started and ready to orchestrate.`);
  }

  protected async onStop(): Promise<void> {
    console.log(`[${this.metadata.name}] Stopped.`);
  }

  protected async checkDependencies(): Promise<any[]> {
    // The orchestrator depends on the service registry itself.
    return [{ name: 'ServiceRegistry', status: 'available' }];
  }

  /**
   * The core execution logic for the Orchestrator.
   * It receives a task manifest and decides how to handle it.
   */
  protected async onExecute(
    operation: string,
    manifest: TaskManifest,
    context: OperationContext
  ): Promise<any> {
    if (operation !== 'handleTask') {
      throw new Error(`Unsupported operation: ${operation}`);
    }

    console.log(`[${this.metadata.name}] Received task with goal: ${manifest.goal}`);
    await this.memorizePlan(manifest, context);

    // --- Simple, Direct Routing ---
    // If a specific module and operation are requested, execute it directly.
    if (manifest.targetModule && manifest.operation) {
      console.log(`[${this.metadata.name}] Performing direct execution on ${manifest.targetModule}`);
      return serviceRegistry.execute(
        manifest.targetModule,
        manifest.operation,
        manifest.params,
        context
      );
    }

    // --- Smart Routing ---
    // If a generic operation is requested, find the best agent for it.
    if (manifest.operation) {
        console.log(`[${this.metadata.name}] Performing smart routing for operation: ${manifest.operation}`);
        return serviceRegistry.route(
            manifest.operation,
            manifest.params,
            context
        );
    }

    // --- Complex Goal-Oriented Planning ---
    // If only a high-level goal is provided, the orchestrator plans and executes.
    console.log(`[${this.metadata.name}] Decomposing high-level goal: ${manifest.goal}`);
    const plan = await this.developPlan(manifest, context);

    // Execute the plan
    const executionResults = [];
    for (const step of plan) {
      console.log(`[${this.metadata.name}] Executing step ${step.step}: ${step.operation}`);
      const stepResult = await serviceRegistry.route(
        step.operation,
        step.params,
        context,
        { category: step.agent } // Route to the specified agent type
      );

      executionResults.push({ step: step.step, operation: step.operation, result: stepResult });

      if (!stepResult.success) {
        console.error(`[${this.metadata.name}] Step ${step.step} failed. Aborting plan.`);
        await this.memorizePlanResult(context, 'failed', executionResults);
        return {
          message: 'Plan execution failed.',
          failedStep: step.step,
          results: executionResults,
        };
      }
    }
    
    console.log(`[${this.metadata.name}] Plan execution complete for goal: ${manifest.goal}`);
    await this.memorizePlanResult(context, 'success', executionResults);

    return {
        message: 'Plan execution successful.',
        results: executionResults,
    };
  }

  private async developPlan(manifest: TaskManifest, context: OperationContext): Promise<any[]> {
    // 1. Observe: Query memory for existing knowledge
    const memories = await unifiedMemoryBridge.semanticSearch(
      `Planning for goal: ${manifest.goal}. Target info: ${JSON.stringify(manifest.params)}`,
      20
    );
    console.log(`[${this.metadata.name}] Recalled ${memories.length} memories for planning.`);

    // 2. Plan: Decompose the goal into steps.
    // This is a placeholder for a real planning AI.
    const plan = [];
    plan.push({ step: 1, operation: 'run-recon', params: manifest.params, agent: 'ReconAgent' });

    if (manifest.goal.includes('exploit') || manifest.goal.includes('compromise')) {
        plan.push({ step: 2, operation: 'find-vulnerability', params: {}, agent: 'VulnerabilityScannerAgent' });
        plan.push({ step: 3, operation: 'launch-exploit', params: { vulnerability: 'CVE-20XX-XXXX' }, agent: 'AutoExploitAgent' });
    }

    if (manifest.goal.includes('phish') || manifest.goal.includes('credential')) {
        plan.push({ step: 2, operation: 'dispatch-phishing-page', params: manifest.params, agent: 'CredentialHarvesterAgent' });
    }

    await this.memorizePlan(manifest, context, plan);
    return plan;
  }

  private async memorizePlanResult(context: OperationContext, status: 'success' | 'failed', results: any[]): Promise<void> {
    try {
        await unifiedMemoryBridge.store({
            layer: 'memory',
            type: 'orchestrator_result',
            key: `result:${context.requestId}`,
            value: {
                status,
                results
            },
            metadata: {
                botId: this.metadata.name,
                userId: context.userId,
                timestamp: new Date(),
                importance: status === 'success' ? 60 : 90, // Failures are very important
                source: 'orchestrator_execution'
            }
        });
    } catch(e) {
        console.error(`[${this.metadata.name}] Failed to memorize plan result`, e);
    }
  }

  private async memorizePlan(manifest: TaskManifest, context: OperationContext, plan?: any[]): Promise<void> {
    try {
        await unifiedMemoryBridge.store({
            layer: 'memory',
            type: 'orchestrator_decision',
            key: `plan:${context.requestId}`,
            value: {
                manifest,
                plan
            },
            metadata: {
                botId: this.metadata.name,
                userId: context.userId,
                timestamp: new Date(),
                importance: 80,
                source: 'orchestrator_planning'
            }
        });
    } catch(e) {
        console.error(`[${this.metadata.name}] Failed to memorize plan`, e);
    }
  }
}
