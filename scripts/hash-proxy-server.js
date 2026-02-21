/**
 * Hash proxy server: receives POST { style, privateKey, params, device } and returns { hash }.
 * Use this when SYRIATEL_HASH_PROXY_URL is set to delegate hash computation (e.g. to a service that uses the real libhashing.so).
 *
 * This stub uses our built-in hash.js. Replace with your own implementation that calls the native library.
 *
 * Run: node scripts/hash-proxy-server.js
 * Then set: SYRIATEL_HASH_PROXY_URL=http://localhost:9999/hash
 */

const http = require('http');
const { hashC2WithMode, hashH2WithMode } = require('../src/hash');

const PORT = process.env.HASH_PROXY_PORT || 9999;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/hash') {
    res.writeHead(404);
    res.end();
    return;
  }
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', () => {
    try {
      const { style, privateKey, params, device } = JSON.parse(body);
      const hash = style === 'c2'
        ? hashC2WithMode(privateKey, params || [], device || {})
        : hashH2WithMode(privateKey, params || [], device || {});
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ hash }));
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, () => {
  console.log('Hash proxy listening on http://localhost:' + PORT + '/hash');
  console.log('Set SYRIATEL_HASH_PROXY_URL=http://localhost:' + PORT + '/hash');
});
