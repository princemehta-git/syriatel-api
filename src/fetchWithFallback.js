/**
 * fetchWithFallback: unified timeout + retry for all Syriatel API requests.
 *
 * Three scenarios based on env config:
 *   1. FORCE_PROXY_ENABLED: proxy only → retry FORCE_PROXY_RETRY_ATTEMPTS times
 *   2. PROXY_ENABLED (not forced): direct (DIRECT_RETRY_ATTEMPTS) → proxy (PROXY_RETRY_ATTEMPTS), repeated PROXY_FALLBACK_CYCLES times
 *   3. Direct only: retry DIRECT_ONLY_RETRY_ATTEMPTS times
 *
 * ALL requests (direct and proxy) are subject to REQUEST_TIMEOUT_MS.
 * Node 18+: direct uses native fetch; proxy uses node-fetch + socks-proxy-agent.
 *
 * For non-idempotent operations (transfer), pass { singleAttempt: true } to skip
 * internal retries (the caller handles its own retry loop with dedup safety).
 */

const REQUEST_TIMEOUT_MS = Math.max(1, parseInt(process.env.REQUEST_TIMEOUT_MS, 10) || 5000);

const PROXY_ENABLED = process.env.PROXY_ENABLED === 'true' ||
  process.env.PROXY_ENABLED === '1' ||
  process.env.PROXY_ENABLED === 'yes';
const FORCE_PROXY_ENABLED = process.env.FORCE_PROXY_ENABLED === 'true' ||
  process.env.FORCE_PROXY_ENABLED === '1' ||
  process.env.FORCE_PROXY_ENABLED === 'yes';
const PROXY_URL = process.env.PROXY_URL || '';

const FORCE_PROXY_RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.FORCE_PROXY_RETRY_ATTEMPTS, 10) || 3);
const DIRECT_RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.DIRECT_RETRY_ATTEMPTS, 10) || 2);
const PROXY_RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.PROXY_RETRY_ATTEMPTS, 10) || 2);
const PROXY_FALLBACK_CYCLES = Math.max(1, parseInt(process.env.PROXY_FALLBACK_CYCLES, 10) || 1);
const DIRECT_ONLY_RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.DIRECT_ONLY_RETRY_ATTEMPTS, 10) || 30);

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

function isRetryableError(err) {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  if (name === 'aborterror' || msg.includes('abort')) return true;
  if (msg.includes('timeout') || msg.includes('etimedout') || msg.includes('econnaborted')) return true;
  if (msg.includes('network') || msg.includes('econnrefused') || msg.includes('enotfound')) return true;
  if (msg.includes('fetch failed') || msg.includes('socket hang up')) return true;
  if (err.cause && isRetryableError(err.cause)) return true;
  return false;
}

/** Direct fetch with AbortController timeout. */
async function directFetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/** Proxy fetch (node-fetch + socks-proxy-agent) with AbortController timeout. */
async function proxyFetchWithTimeout(url, options, timeoutMs) {
  const agent = getProxyAgent();
  const fetchFn = getNodeFetch();
  if (!agent || !fetchFn) {
    throw new Error('Proxy not available (missing node-fetch or socks-proxy-agent, or PROXY_URL empty)');
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const proxyOpts = { ...options };
  delete proxyOpts.signal;
  proxyOpts.agent = agent;
  proxyOpts.signal = controller.signal;
  try {
    const res = await fetchFn(url, proxyOpts);
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

/**
 * Fetch with fallback + retry.
 *
 * @param {string} url
 * @param {RequestInit} options
 * @param {{ singleAttempt?: boolean, timeoutMs?: number }} [overrides]
 *   singleAttempt: true → 1 attempt per phase (for non-idempotent ops like transfer)
 *   timeoutMs: override REQUEST_TIMEOUT_MS for this call
 */
async function fetchWithFallback(url, options = {}, overrides = {}) {
  const timeoutMs = overrides.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const singleAttempt = !!overrides.singleAttempt;

  // --- Scenario 1: Force proxy ---
  if (FORCE_PROXY_ENABLED && PROXY_URL) {
    const max = singleAttempt ? 1 : FORCE_PROXY_RETRY_ATTEMPTS;
    let lastError;
    for (let i = 1; i <= max; i++) {
      try {
        console.log(`[fetch] proxy attempt ${i}/${max} (force-proxy) timeout=${timeoutMs}ms`);
        return await proxyFetchWithTimeout(url, options, timeoutMs);
      } catch (err) {
        lastError = err;
        console.error(`[fetch] proxy attempt ${i}/${max} failed:`, err.message);
        if (!isRetryableError(err)) break;
      }
    }
    throw lastError;
  }

  // --- Scenario 2: Direct first, then proxy fallback (repeated for PROXY_FALLBACK_CYCLES) ---
  if (PROXY_ENABLED && PROXY_URL) {
    const cycles = singleAttempt ? 1 : PROXY_FALLBACK_CYCLES;
    const directMax = singleAttempt ? 1 : DIRECT_RETRY_ATTEMPTS;
    const proxyMax = singleAttempt ? 1 : PROXY_RETRY_ATTEMPTS;
    let lastError;

    for (let cycle = 1; cycle <= cycles; cycle++) {
      if (cycles > 1) {
        console.log(`[fetch] cycle ${cycle}/${cycles} (proxy-fallback)`);
      }

      for (let i = 1; i <= directMax; i++) {
        try {
          console.log(`[fetch] direct attempt ${i}/${directMax} (cycle ${cycle}/${cycles}) timeout=${timeoutMs}ms`);
          return await directFetchWithTimeout(url, options, timeoutMs);
        } catch (err) {
          lastError = err;
          console.error(`[fetch] direct attempt ${i}/${directMax} (cycle ${cycle}/${cycles}) failed:`, err.message);
          if (!isRetryableError(err)) break;
        }
      }

      if (!isRetryableError(lastError)) break;

      console.log('[fetch] all direct attempts failed, switching to proxy...');
      for (let i = 1; i <= proxyMax; i++) {
        try {
          console.log(`[fetch] proxy attempt ${i}/${proxyMax} (cycle ${cycle}/${cycles}) timeout=${timeoutMs}ms`);
          return await proxyFetchWithTimeout(url, options, timeoutMs);
        } catch (err) {
          lastError = err;
          console.error(`[fetch] proxy attempt ${i}/${proxyMax} (cycle ${cycle}/${cycles}) failed:`, err.message);
          if (!isRetryableError(err)) break;
        }
      }

      if (!isRetryableError(lastError)) break;
    }

    throw lastError;
  }

  // --- Scenario 3: Direct only ---
  const max = singleAttempt ? 1 : DIRECT_ONLY_RETRY_ATTEMPTS;
  let lastError;
  for (let i = 1; i <= max; i++) {
    try {
      if (i === 1 || i % 5 === 0 || i === max) {
        console.log(`[fetch] direct attempt ${i}/${max} (direct-only) timeout=${timeoutMs}ms`);
      }
      return await directFetchWithTimeout(url, options, timeoutMs);
    } catch (err) {
      lastError = err;
      if (i === 1 || i % 5 === 0 || i === max) {
        console.error(`[fetch] direct attempt ${i}/${max} failed:`, err.message);
      }
      if (!isRetryableError(err)) break;
    }
  }
  throw lastError;
}

const activeScenario = FORCE_PROXY_ENABLED ? 'force-proxy' : PROXY_ENABLED ? 'proxy-fallback' : 'direct-only';
console.log(`[fetchWithFallback] config: scenario=${activeScenario} timeout=${REQUEST_TIMEOUT_MS}ms` +
  (activeScenario === 'force-proxy' ? ` retries=${FORCE_PROXY_RETRY_ATTEMPTS}` : '') +
  (activeScenario === 'proxy-fallback' ? ` directRetries=${DIRECT_RETRY_ATTEMPTS} proxyRetries=${PROXY_RETRY_ATTEMPTS} cycles=${PROXY_FALLBACK_CYCLES}` : '') +
  (activeScenario === 'direct-only' ? ` retries=${DIRECT_ONLY_RETRY_ATTEMPTS}` : '') +
  (PROXY_URL ? ` proxyUrl=${PROXY_URL}` : ''));

module.exports = { fetchWithFallback };
