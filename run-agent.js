
// run-agent.js
// This script runs a standalone agent process that listens for jobs on a dedicated Redis queue.

const path = require('path');
const Queue = require('bee-queue');

async function main() {
  const args = process.argv.slice(2);
  const typeArg = args.find(arg => arg.startsWith('--type='));

  if (!typeArg) {
    console.error('Usage: node run-agent.js --type=<AgentClassName>');
    process.exit(1);
  }

  const agentClassName = typeArg.split('=')[1];
  const agentFileName = agentClassName.charAt(0).toLowerCase() + agentClassName.slice(1);
  const queueName = `queue-${agentClassName}`;

  console.log(`[AgentRunner] Starting standalone agent: ${agentClassName}`);
  console.log(`[AgentRunner] Listening on queue: ${queueName}`);

  try {
    // Dynamically import the agent from the compiled 'dist' directory
    const agentModule = await import(path.resolve(`./dist/src/agents/${agentFileName}.js`));
    const AgentClass = agentModule[agentClassName];

    if (!AgentClass) {
        throw new Error(`Could not find class ${agentClassName} in ${agentFileName}.js`);
    }

    const agent = new AgentClass();

    // Initialize and start the agent module
    await agent.initialize();
    await agent.start();

    // Connect to the specific job queue for this agent type
    const jobQueue = new Queue(queueName, {
        redis: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    });

    // Process jobs from the queue
    jobQueue.process(async (job) => {
        const { operation, params, context } = job.data;
        console.log(`[${agentClassName}] Processing job ${job.id}: ${operation}`);

        const result = await agent.execute(operation, params, context);

        return result;
    });

  } catch (error) {
    console.error(`[AgentRunner] Failed to start agent ${agentClassName}:`, error);
    process.exit(1);
  }
}

main();
