/**
 * fetchWithFallback: try direct request first; on timeout/network/abort and
 * PROXY_ENABLED=true, retry the same request via SOCKS5 proxy.
 * Uses AbortController for configurable direct timeout.
 * Node 18+: direct uses native fetch; proxy uses node-fetch + socks-proxy-agent.
 */

const DIRECT_TIMEOUT_MS = Math.max(0, parseInt(process.env.DIRECT_TIMEOUT_MS, 10) || 5000);
const PROXY_ENABLED = process.env.PROXY_ENABLED === 'true' ||
  process.env.PROXY_ENABLED === '1' ||
  process.env.PROXY_ENABLED === 'yes';
const PROXY_URL = process.env.PROXY_URL || '';

let proxyAgent = null;
let nodeFetch = null;

function getProxyAgent() {
  if (!PROXY_URL) return null;
  if (proxyAgent) return proxyAgent;
  try {
    const { SocksProxyAgent } = require('socks-proxy-agent');
    proxyAgent = new SocksProxyAgent(PROXY_URL);
    return proxyAgent;
  } catch (e) {
    return null;
  }
}

function getNodeFetch() {
  if (nodeFetch !== null) return nodeFetch;
  try {
    nodeFetch = require('node-fetch');
    return nodeFetch;
  } catch (e) {
    nodeFetch = false;
    return false;
  }
}

function isRetryableDirectError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  if (name === 'aborterror' || msg.includes('abort')) return true;
  if (msg.includes('timeout') || msg.includes('etimedout') || msg.includes('econnaborted')) return true;
  if (msg.includes('network') || msg.includes('econnrefused') || msg.includes('enotfound')) return true;
  if (msg.includes('fetch failed') || msg.includes('socket hang up')) return true;
  if (err.cause && isRetryableDirectError(err.cause)) return true;
  return false;
}

/**
 * Build options for proxy request: same as original but no signal, plus agent.
 * Native fetch does not accept agent; proxy path uses node-fetch which does.
 */
function proxyRequestOptions(originalOptions) {
  const opts = { ...originalOptions };
  delete opts.signal;
  opts.agent = getProxyAgent();
  return opts;
}

/**
 * Reusable helper: try direct fetch; on timeout/network/abort and PROXY_ENABLED,
 * retry same request via SOCKS5 proxy. Returns response. If proxy also fails, throws original error.
 *
 * @param {string} url - Request URL
 * @param {RequestInit & { agent?: unknown }} options - Same as fetch (method, headers, body, etc.)
 * @returns {Promise<Response>}
 */
async function fetchWithFallback(url, options = {}) {
  let directError;
  let timeoutId;

  console.log('Trying direct connection...');
  try {
    const controller = new AbortController();
    timeoutId = setTimeout(() => controller.abort(), DIRECT_TIMEOUT_MS);
    const res = await fetch(url, { ...options, signal: controller.signal });
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (err) {
    directError = err;
    if (timeoutId) clearTimeout(timeoutId);
  }

  const shouldRetryWithProxy = PROXY_ENABLED && PROXY_URL && isRetryableDirectError(directError);
  if (!shouldRetryWithProxy) {
    throw directError;
  }

  const agent = getProxyAgent();
  const fetchWithProxy = getNodeFetch();
  if (!agent || !fetchWithProxy) {
    throw directError;
  }

  console.log('Direct connection failed, switching to proxy...');
  console.log('Using proxy:', process.env.PROXY_URL);
  try {
    const proxyOpts = proxyRequestOptions(options);
    const res = await fetchWithProxy(url, proxyOpts);
    return res;
  } catch (proxyErr) {
    throw directError;
  }
}

module.exports = { fetchWithFallback };
