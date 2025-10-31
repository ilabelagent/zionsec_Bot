// worker/main.js
// Non-destructive worker: nmap service discovery, HTTP headers, SMTP banner checks.
const Queue = require('bee-queue');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const jobQueue = new Queue('holy-siege-queue', { redis: process.env.REDIS_URL || 'redis://127.0.0.1:6379' });

function runNmap(target) {
  return new Promise((resolve, reject) => {
    const args = ['-sV', '-Pn', target, '-oJ', '-'];
    const p = spawn('nmap', args);
    let out = '', err = '';
    p.stdout.on('data', d => out += d.toString());
    p.stderr.on('data', d => err += d.toString());
    p.on('close', code => {
      if (code !== 0) return reject(new Error('nmap failed: ' + err));
      try { resolve(JSON.parse(out)); } catch (e) { reject(e); }
    });
  });
}

async function httpHeaders(target) {
  try {
    let url = target;
    if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
    const r = await (await import('node-fetch')).default(url, { method: 'HEAD' });
    return { status: r.status, headers: Object.fromEntries(r.headers.entries()) };
  } catch (e) { return { error: e.message }; }
}

function smtpBanner(host, port = 25) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = net.createConnection(port, host);
    let banner = '';
    socket.setTimeout(6000);
    socket.on('data', chunk => { banner += chunk.toString(); socket.end(); });
    socket.on('error', () => resolve({ error: 'connect failed' }));
    socket.on('timeout', () => { socket.destroy(); resolve({ error: 'timeout' }); });
    socket.on('end', () => resolve({ banner: banner.trim() }));
  });
}

jobQueue.process(async (job, cb) => {
  console.log('Worker: processing job', job.id);
  const manifest = job.data.manifest;
  const target = manifest.target;
  const out = { jobId: job.id, target, ts: new Date().toISOString(), results: {} };

  try { out.results.nmap = await runNmap(target); } catch (e) { out.results.nmap_error = e.message; }
  try { out.results.http = await httpHeaders(target); } catch (e) { out.results.http_error = e.message; }
  try { out.results.smtp = await smtpBanner(target, 25); } catch (e) { out.results.smtp_error = e.message; }

  const fname = path.join('/tmp', `report-${job.id}.json`);
  fs.writeFileSync(fname, JSON.stringify(out, null, 2));
  try {
    const { uploadToIpfs } = require('./valifi_ipfs');
    const cid = await uploadToIpfs(fname);
    out.ipfs = cid;
  } catch (e) {
    out.ipfs_error = e.message;
  }

  try {
    const { spawnSync } = require('child_process');
    const sig = spawnSync('gpg', ['--armor', '--detach-sign', fname]);
    if (sig.status !== 0) out.sign_error = sig.stderr.toString();
    else out.sign = 'signed';
  } catch (e) { out.sign_error = e.message; }

  fs.writeFileSync(fname, JSON.stringify(out, null, 2));
  console.log('Worker: done', job.id);
  cb(null, out);
});
