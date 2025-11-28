
import { Agent } from './agent';
import { Module } from '../services/moduleInterface';
import { spawn } from 'child_process';
import fetch from 'node-fetch';
import net from 'net';

function runNmap(target: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = ['-sV', '-Pn', '-T4', target, '-oJ', '-'];
    const p = spawn('nmap', args);
    let out = '';
    let err = '';
    p.stdout.on('data', d => (out += d.toString()));
    p.stderr.on('data', d => (err += d.toString()));
    p.on('close', code => {
      if (code !== 0) return reject(new Error('nmap failed: ' + err));
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function httpHeaders(target: string): Promise<any> {
  try {
    let url = target;
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }
    const r = await fetch(url, { method: 'HEAD', timeout: 5000 });
    return { status: r.status, headers: Object.fromEntries(r.headers.entries()) };
  } catch (e: any) {
    return { error: e.message };
  }
}

function smtpBanner(host: string, port = 25): Promise<any> {
  return new Promise(resolve => {
    const socket = net.createConnection(port, host);
    let banner = '';
    socket.setTimeout(5000);
    socket.on('data', chunk => {
      banner += chunk.toString();
      socket.end();
    });
    socket.on('error', () => resolve({ error: 'connect failed' }));
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ error: 'timeout' });
    });
    socket.on('end', () => resolve({ banner: banner.trim() }));
  });
}


@Module({
  name: 'ReconAgent',
  version: '1.0.0',
  description: 'An agent for performing basic, non-destructive reconnaissance.',
  category: 'Reconnaissance',
  author: 'GodBrain',
})
export class ReconAgent extends Agent {
  // Define capabilities
  readonly capabilities = {
    operations: ['run-recon'],
    inputTypes: ['target:string'],
    outputTypes: ['json'],
    supportsConcurrency: true,
    maxConcurrentOperations: 10,
    requiresAuthentication: true,
    requiresExternalAPIs: [],
  };

  protected async onInitialize(): Promise<void> {
    console.log(`[${this.metadata.name}] Initialized.`);
  }

  protected async onStart(): Promise<void> {
    console.log(`[${this.metadata.name}] Started and ready for recon tasks.`);
  }

  protected async onStop(): Promise<void> {
    console.log(`[${this.metadata.name}] Stopped.`);
  }

  protected async checkDependencies(): Promise<any[]> {
    // In a real scenario, you might check for nmap being installed.
    return [{ name: 'nmap', status: 'available' }];
  }

  /**
   * The core execution logic for the ReconAgent.
   */
  protected async onAgentExecute(
    operation: string,
    params: { target?: string },
    context: any,
    recalledMemories: any[]
  ): Promise<any> {
    if (operation !== 'run-recon') {
      throw new Error(`Unsupported operation: ${operation}`);
    }
    if (!params.target) {
      throw new Error('Missing required parameter: target');
    }

    const { target } = params;
    console.log(`[${this.metadata.name}] Executing recon on target: ${target}`);

    if (recalledMemories.length > 0) {
        console.log(`[${this.metadata.name}] Recalled ${recalledMemories.length} memories related to this operation.`);
    }

    // Run all recon tasks in parallel
    const [nmap, http, smtp] = await Promise.all([
      runNmap(target).catch(e => ({ nmap_error: e.message })),
      httpHeaders(target).catch(e => ({ http_error: e.message })),
      smtpBanner(target).catch(e => ({ smtp_error: e.message })),
    ]);

    const result = {
        nmap,
        http,
        smtp
    };

    console.log(`[${this.metadata.name}] Recon complete for target: ${target}`);
    return result;
  }
}
