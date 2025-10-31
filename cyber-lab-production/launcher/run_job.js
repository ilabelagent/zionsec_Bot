#!/usr/bin/env node
// run_job.js - lightweight manifest poster (requires local GPG key)
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const [,, jobName, target] = process.argv;
if (!jobName || !target) {
  console.error('Usage: run_job <job-name> <target>');
  process.exit(2);
}

const manifest = {
  job: jobName,
  target,
  submitter: process.env.SUBMITTER || 'admin@example.com',
  ts: Math.floor(Date.now()/1000),
  expiry: Math.floor(Date.now()/1000) + 60*60
};

const mf = path.join('/tmp', `manifest-${Date.now()}.json`);
fs.writeFileSync(mf, JSON.stringify(manifest, null, 2));
console.log('Manifest written to', mf);

const sigRes = spawnSync('gpg', ['--armor', '--detach-sign', mf], { encoding: 'utf8' });
if (sigRes.status !== 0) {
  console.error('GPG sign failed', sigRes.stderr);
  process.exit(3);
}
const sigf = mf + '.asc';

const fetch = (await import('node-fetch')).default;
(async () => {
  const controller = process.env.CONTROLLER_URL || 'http://127.0.0.1:3000/api/jobs';
  const FormData = (await import('form-data')).default;
  const form = new FormData();
  form.append('manifest', fs.createReadStream(mf));
  form.append('signature', fs.createReadStream(sigf));
  const res = await fetch(controller, { method: 'POST', body: form, headers: { 'Authorization': 'Bearer ' + (process.env.CONTROLLER_TOKEN || '') } });
  const body = await res.json();
  console.log('Controller response:', body);
})();
