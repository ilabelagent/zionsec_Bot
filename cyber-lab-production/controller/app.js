// controller/app.js
// Fastify controller for signed job manifests and job status
const fastify = require('fastify')({ logger: true });
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Queue = require('bee-queue');
const jobQueue = new Queue('holy-siege-queue', { redis: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });

const ADMIN_KEYS = (process.env.ADMIN_KEYS || '').split(',').filter(Boolean);

function verifyGpg(manifestPath, sigPath) {
  const res = spawnSync('gpg', ['--verify', sigPath, manifestPath], { encoding: 'utf8' });
  if (res.status !== 0) throw new Error('GPG verification failed: ' + res.stderr);
  return res.stdout + res.stderr;
}

fastify.register(require('fastify-multipart'));

fastify.post('/api/jobs', async function (req, reply) {
  const parts = await req.parts();
  const tmpDir = fs.mkdtempSync(path.join('/tmp', 'holy-'));
  let manifestFile, sigFile;
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
    reply.code(400).send({ error: 'manifest and signature required' });
    return;
  }
  try {
    verifyGpg(manifestFile, sigFile);
  } catch (err) {
    reply.code(403).send({ error: 'Signature verification failed', detail: err.message });
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (!ADMIN_KEYS.includes(manifest.submitter)) {
    reply.code(403).send({ error: 'submitter not authorized in this controller' });
    return;
  }
  if (manifest.expiry && Date.now() / 1000 > manifest.expiry) {
    reply.code(400).send({ error: 'manifest expired' });
    return;
  }
  const job = jobQueue.createJob({ manifest }).save();
  reply.send({ status: 'queued', jobId: job.id });
});

fastify.get('/api/jobs/:id', async (req, reply) => {
  const id = req.params.id;
  const job = await jobQueue.getJob(id);
  if (!job) reply.code(404).send({ error: 'Not found' });
  else reply.send({ id: job.id, state: job.status, data: job.data });
});

fastify.get('/health', async () => ({ ok: true }));

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    fastify.log.info('Controller listening');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
