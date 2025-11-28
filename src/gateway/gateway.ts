
import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { serviceRegistry } from '../services/serviceRegistry';

const server = fastify({ logger: true });

const ADMIN_KEYS = (process.env.ADMIN_KEYS || '').split(',').filter(Boolean);

function verifyGpg(manifestPath: string, sigPath: string): string {
  const res = spawnSync('gpg', ['--verify', sigPath, manifestPath], { encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error('GPG verification failed: ' + res.stderr);
  }
  return res.stdout + res.stderr;
}

server.register(require('fastify-multipart'));

server.post('/api/tasks', async function (req: FastifyRequest, reply: FastifyReply) {
  const parts = (req as any).parts();
  const tmpDir = fs.mkdtempSync(path.join('/tmp', 'holy-'));
  let manifestFile: string | undefined, sigFile: string | undefined;

  for await (const part of parts) {
    if (part.fieldname === 'manifest') {
      manifestFile = path.join(tmpDir, 'manifest.json');
      await part.toFile(manifestFile);
    } else if (part.fieldname === 'signature') {
      sigFile = path.join(tmpDir, 'manifest.sig');
      await part.toFile(sigFile);
    }
  }

  if (!manifestFile || !sigFile) {
    return reply.code(400).send({ error: 'manifest and signature required' });
  }

  try {
    verifyGpg(manifestFile, sigFile);
  } catch (err: any) {
    return reply.code(403).send({ error: 'Signature verification failed', detail: err.message });
  }

  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));

  if (!ADMIN_KEYS.includes(manifest.submitter)) {
    return reply.code(403).send({ error: 'submitter not authorized in this controller' });
  }

  if (manifest.expiry && Date.now() / 1000 > manifest.expiry) {
    return reply.code(400).send({ error: 'manifest expired' });
  }

  // Route the task to the orchestrator
  const result = await serviceRegistry.route('handleTask', manifest, { userId: manifest.submitter });

  if (!result.success) {
      return reply.code(500).send({ error: 'Task handling failed', detail: result.error });
  }

  reply.send({ status: 'task_submitted', data: result.data });
});

server.get('/health', async () => ({ ok: true, timestamp: new Date().toISOString() }));

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3000', 10);
    await server.listen({ port: port, host: '0.0.0.0' });
    server.log.info(`Gateway listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
