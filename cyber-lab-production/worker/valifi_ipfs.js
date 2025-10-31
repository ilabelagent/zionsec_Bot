// worker/valifi_ipfs.js
// Simple IPFS uploader wrapper. Configure IPFS_API env var to your node/pinning service.
const fs = require('fs');
const fetch = require('node-fetch');

async function uploadToIpfs(filePath) {
  const ipfsApi = process.env.IPFS_API || 'https://ipfs.io/api/v0/add';
  const body = fs.createReadStream(filePath);
  const res = await fetch(ipfsApi, { method: 'POST', body });
  if (!res.ok) throw new Error('IPFS upload failed: ' + res.statusText);
  const txt = await res.text();
  try {
    const json = JSON.parse(txt);
    return json.Hash || json.cid || json.Hash;
  } catch (e) {
    const m = txt.match(/"Hash":"([^"]+)"/);
    if (m) return m[1];
    throw e;
  }
}

module.exports = { uploadToIpfs };
