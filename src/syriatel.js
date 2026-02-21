/**
 * Low-level Syriatel API client (new-fapi + cash-api).
 * Uses hash.js and device payload; no auth cookies, all in body/params.
 * Uses global fetch (Node 18+).
 */

const { hashC2WithMode, hashH2WithMode, hashE2 } = require('./hash');
const { getUserAgent } = require('./device');
const { CAPTURED_HASHES, CAPTURED_SETTOKEN_TOKEN } = require('./constants');
const { fetchWithFallback } = require('./fetchWithFallback');

const HASH_PROXY_URL = process.env.SYRIATEL_HASH_PROXY_URL;
const USE_DYNAMIC_DEVICES = process.env.USE_DYNAMIC_DEVICES === '1' ||
  process.env.USE_DYNAMIC_DEVICES === 'true' ||
  process.env.USE_DYNAMIC_DEVICES === 'yes';

/** Endpoints that always compute hash (no captured). Use _incoming/_outgoing and array hashes for retry. */
const USER_SPECIFIC_ENDPOINTS = new Set([
  'checkAccountRefreshBalance', 'getUsage', 'getHistoryTypes',
  'customerHistory', 'pinCodeCheck', 'secretCode'
]);

/** Cash/ePayment endpoints: always use computed hash (reversed libhashing.so formula), no captured hash retry. */
const CASH_ALWAYS_COMPUTE = new Set([
  'refresh_balance', 'checkAccountRefreshBalance', 'getUsage', 'getHistoryTypes',
  'customerHistory', 'customerHistory_incoming', 'customerHistory_outgoing',
  'pinCodeCheck', 'secretCode', 'checkCustomer', 'transfer'
]);

const HASH_RETRY_ATTEMPTS = 30;

/**
 * Compute request hash. When USE_DYNAMIC_DEVICES is false, uses captured hash from constants.js.
 * For endpoints with multiple hashes (array), pass attemptIndex to alternate: attemptIndex 0,1,2,... cycles through the list.
 */
async function getHash(style, privateKey, params, device, endpointKey, attemptIndex = 0) {
  if (HASH_PROXY_URL) {
    const res = await fetchWithRetry(HASH_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ style, privateKey, params, device })
    });
    const body = await res.json();
    if (body && body.hash) return body.hash;
    throw new Error('Hash proxy did not return hash');
  }
  const alwaysCompute = CASH_ALWAYS_COMPUTE.has(endpointKey);
  const useCaptured = !alwaysCompute && !USE_DYNAMIC_DEVICES && endpointKey && CAPTURED_HASHES[endpointKey] &&
    !USER_SPECIFIC_ENDPOINTS.has(endpointKey);
  if (useCaptured) {
    const val = CAPTURED_HASHES[endpointKey];
    if (Array.isArray(val)) return val[attemptIndex % val.length];
    return val;
  }
  if (style === 'c2') return hashC2WithMode(privateKey, params, device);
  if (style === 'e2') return hashE2(privateKey, params, device);
  return hashH2WithMode(privateKey, params, device);
}

/** True when we should retry with alternate hashes (captured hashes available for this endpoint). Cash endpoints use computed hash only, no retry. */
function useHashRetry(endpointKey) {
  if (CASH_ALWAYS_COMPUTE.has(endpointKey)) return false;
  return !USE_DYNAMIC_DEVICES && endpointKey && CAPTURED_HASHES[endpointKey] &&
    !USER_SPECIFIC_ENDPOINTS.has(endpointKey);
}

const BASE_FAPI = 'https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM';
const BASE_CASH = 'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM';

const MAX_RETRIES = 30;

/** Max attempts for checkCustomer and transfer (retry with proxy until success or this many attempts). From .env PAYMENT_RETRY_ATTEMPTS. */
const PAYMENT_RETRY_ATTEMPTS = Math.max(1, parseInt(process.env.PAYMENT_RETRY_ATTEMPTS, 10) || 5);

function formatFetchError(err, url) {
  const cause = err.cause ? (err.cause.message || String(err.cause)) : '';
  const code = err.cause && err.cause.code ? err.cause.code : '';
  return `fetch failed: ${err.message}${cause ? ' | cause: ' + cause : ''}${code ? ' [' + code + ']' : ''} | url: ${url}`;
}

/**
 * Fetch with retry: up to MAX_RETRIES on connection failure or server error (5xx).
 * Do not retry when a proper response is received (2xx, 4xx, or any response body).
 */
async function fetchWithRetry(url, options) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithFallback(url, options);
      if (res.status >= 500) {
        lastError = new Error(`Server error ${res.status}`);
        if (attempt < MAX_RETRIES) continue;
        return res;
      }
      return res;
    } catch (err) {
      lastError = err;
      console.error('[Syriatel fetch]', formatFetchError(err, url), '| attempt', attempt, 'of', MAX_RETRIES);
      if (attempt === MAX_RETRIES) {
        console.error('[Syriatel fetch] Common causes: no internet, DNS failure, firewall/VPN, or Syriatel API unreachable (e.g. geo-restricted).');
        throw lastError;
      }
    }
  }
  throw lastError;
}

function defaultHeaders(device) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'User-Agent': getUserAgent(device),
    'Accept-Encoding': 'gzip'
  };
}

function formHeaders(device) {
  return {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'User-Agent': getUserAgent(device),
    'Accept-Encoding': 'gzip'
  };
}

/**
 * POST JSON to new-fapi.
 */
async function postFapi(path, body, device) {
  const res = await fetchWithRetry(`${BASE_FAPI}${path}`, {
    method: 'POST',
    headers: defaultHeaders(device),
    body: JSON.stringify(body)
  });
  return res.json();
}

/**
 * POST form to new-fapi.
 */
async function postFapiForm(path, params, device) {
  const searchParams = new URLSearchParams(params).toString();
  const res = await fetchWithRetry(`${BASE_FAPI}${path}`, {
    method: 'POST',
    headers: formHeaders(device),
    body: searchParams
  });
  return res.json();
}

/**
 * POST JSON to cash-api.
 */
async function postCash(path, body, device) {
  const res = await fetchWithRetry(`${BASE_CASH}${path}`, {
    method: 'POST',
    headers: defaultHeaders(device),
    body: JSON.stringify(body)
  });
  return res.json();
}

/**
 * POST form to cash-api.
 */
async function postCashForm(path, params, device) {
  const searchParams = new URLSearchParams(params).toString();
  const res = await fetchWithRetry(`${BASE_CASH}${path}`, {
    method: 'POST',
    headers: formHeaders(device),
    body: searchParams
  });
  return res.json();
}

// --- Auth ---

/**
 * Check GSM (no hash). Returns code: 1 = register, -2 = sign in, -3 = verification.
 */
async function checkGSM(gsm, device) {
  const params = {
    appVersion: device.appVersion,
    mobileManufaturer: device.mobileManufaturer,
    mobileModel: device.mobileModel,
    lang: device.lang,
    systemVersion: device.systemVersion,
    deviceId: device.deviceId,
    gsm
  };
  return postFapiForm('/api2/CheckGSM', params, device);
}

/**
 * Sign in with GSM and password.
 * Returns { code, message, data } and data.data may contain accountId, NEW_DEVICE, accountData.
 * If NEW_DEVICE === '1' or code indicates OTP required, caller should use submitOtp.
 */
async function signIn(gsm, password, device) {
  const privateKey = '0';
  // APK m12583o5 uses h2: [privateKey, gsm, salt, password, "1"]
  const hash = await getHash('h2', privateKey, [gsm, password, '1'], device, 'SIGN_IN3');
  const body = {
    appVersion: device.appVersion,
    mobileManufaturer: device.mobileManufaturer,
    mobileModel: device.mobileModel,
    lang: device.lang,
    systemVersion: device.systemVersion,
    deviceId: device.deviceId,
    gsm,
    password,
    osType: '1',
    hash
  };
  return postFapi('/features/authentication/SIGN_IN3', body, device);
}

/**
 * Resend OTP for login.
 */
async function resendOtp(gsm, device) {
  const privateKey = '0';
  const hash = await getHash('h2', privateKey, [gsm], device, 'LOGIN_RESEND_CODE');
  const body = {
    ...device,
    gsm,
    hash
  };
  return postFapi('/features/authentication/LOGIN_RESEND_CODE', body, device);
}

/**
 * Submit OTP and complete login. Returns same shape as signIn (accountId, accountData with userKey per GSM).
 */
async function submitOtp(gsm, code, device) {
  const privateKey = '0';
  // APK verify flow: try h2 [code, gsm] to match auth pattern (VerificationActivity may use different endpoint)
  const hash = await getHash('h2', privateKey, [code, gsm], device, 'LOGIN_CODE_VERIFY');
  const body = {
    ...device,
    gsm,
    code,
    hash
  };
  return postFapi('/features/authentication/LOGIN_CODE_VERIFY', body, device);
}

/**
 * Get usage (bundles, balance, shortcuts) from new-fapi. Requires userId + userKey (post-login).
 * APK: h2 [userKey, userId, salt] (m12524h2).
 */
async function getUsage(userId, userKey, device) {
  const hash = await getHash('h2', userKey, [userId], device, 'getUsage');
  const params = {
    ...device,
    userId,
    hash
  };
  return postFapiForm('/api2/getUsage', params, device);
}

// --- Cash API (use userKey as privateKey for hash) ---

/**
 * Refresh balance (customer + merchant). Uses userId and userKey (from accountData for selected GSM).
 * APK: h2 [userKey, userId, salt] (m12524h2).
 */
async function refreshBalance(userId, userKey, device) {
  const endpointKey = 'refresh_balance';
  const path = '/features/ePayment/refresh_balance';
  const url = `${BASE_CASH}${path}`;
  const maxAttempts = useHashRetry(endpointKey) ? HASH_RETRY_ATTEMPTS : 1;
  let lastResult;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const hash = await getHash('h2', userKey, [userId], device, endpointKey, attempt);
    const body = { ...device, userId, hash };
    const headers = defaultHeaders(device);
    console.log('[Syriatel refresh_balance] Request to Syriatel API:', {
      url,
      method: 'POST',
      headers,
      payload: body,
      attempt: attempt + 1,
      hashInputs: { style: 'h2', params: [userId], endpointKey }
    });
    lastResult = await postCash(path, body, device);
    if (lastResult.code === '1') return lastResult;
    if (lastResult.code === '-15000') continue;
    return lastResult;
  }
  return lastResult;
}

/**
 * Check account + balance + features (firstUse optional).
 * APK: h2 [userKey, userId, firstUse, salt] (m12524h2).
 */
async function checkAccountRefreshBalance(userId, userKey, device, firstUse = '1') {
  const hash = await getHash('h2', userKey, [userId, firstUse], device, 'checkAccountRefreshBalance');
  const body = {
    ...device,
    userId,
    firstUse,
    hash
  };
  return postCash('/features/ePayment/checkAccountRefreshBalance', body, device);
}

/**
 * Validate PIN (required before transfer).
 * APK: c2 [userKey, userId, pinCode, salt] (m12484c2).
 */
async function pinCodeCheck(userId, userKey, pinCode, device) {
  const hash = await getHash('c2', userKey, [userId, pinCode], device, 'pinCodeCheck');
  const params = {
    appVersion: device.appVersion,
    mobileManufaturer: device.mobileManufaturer,
    mobileModel: device.mobileModel,
    pinCode,
    lang: device.lang,
    systemVersion: device.systemVersion,
    deviceId: device.deviceId,
    userId,
    hash
  };
  return postCashForm('/ePayment/pinCode/check', params, device);
}

/**
 * Check customer/recipient before transfer; returns fee and billcode.
 * APK: m12340I0 c2 [userKey, userId, customerCodeOrGSM, transactAmount, salt].
 * Retries up to PAYMENT_RETRY_ATTEMPTS (from .env); each attempt uses direct then proxy fallback.
 */
async function checkCustomer(userId, userKey, customerCodeOrGSM, transactAmount, device) {
  const endpointKey = 'checkCustomer';
  let lastResult;
  for (let attempt = 1; attempt <= PAYMENT_RETRY_ATTEMPTS; attempt++) {
    try {
      const hash = await getHash('c2', userKey, [userId, customerCodeOrGSM, transactAmount], device, endpointKey, 0);
      const params = {
        appVersion: device.appVersion,
        mobileManufaturer: device.mobileManufaturer,
        mobileModel: device.mobileModel,
        lang: device.lang,
        customerCodeOrGSM,
        systemVersion: device.systemVersion,
        deviceId: device.deviceId,
        userId,
        transactAmount,
        hash
      };
      lastResult = await postCashForm('/ePayment/checkCustomer', params, device);
      if (lastResult && lastResult.code === '1') return lastResult;
      console.log('[checkCustomer] attempt', attempt, 'of', PAYMENT_RETRY_ATTEMPTS, '– code', lastResult?.code, lastResult?.message || '');
    } catch (err) {
      lastResult = { code: '-1', message: err.message || String(err) };
      console.log('[checkCustomer] attempt', attempt, 'of', PAYMENT_RETRY_ATTEMPTS, '– error', err.message || err);
    }
  }
  return lastResult;
}

/**
 * Transfer to customer (GSM or secret code). Requires pinCode and billcode from checkCustomer.
 * APK: m12504e6 c2 [userKey, userId, pinCode, secretCodeOrGSM, toGSM, fee, billcode, amount] (7 params; no feeOnMerchant in hash).
 * Retries up to PAYMENT_RETRY_ATTEMPTS (from .env); each attempt uses direct then proxy fallback.
 */
async function transfer(userId, userKey, pinCode, secretCodeOrGSM, toGSM, amount, fee, billcode, device) {
  const endpointKey = 'transfer';
  let lastResult;
  for (let attempt = 1; attempt <= PAYMENT_RETRY_ATTEMPTS; attempt++) {
    try {
      const hash = await getHash('c2', userKey, [userId, pinCode, secretCodeOrGSM, toGSM, String(fee), billcode, String(amount)], device, endpointKey, 0);
      const params = {
        appVersion: device.appVersion,
        amount: String(amount),
        fee: String(fee),
        systemVersion: device.systemVersion,
        deviceId: device.deviceId,
        userId,
        toGSM,
        mobileManufaturer: device.mobileManufaturer,
        mobileModel: device.mobileModel,
        pinCode,
        billcode,
        lang: device.lang,
        secretCodeOrGSM,
        hash
      };
      lastResult = await postCashForm('/ePayment/transfer', params, device);
      if (lastResult && lastResult.code === '1') return lastResult;
      console.log('[transfer] attempt', attempt, 'of', PAYMENT_RETRY_ATTEMPTS, '– code', lastResult?.code, lastResult?.message || '');
    } catch (err) {
      lastResult = { code: '-1', message: err.message || String(err) };
      console.log('[transfer] attempt', attempt, 'of', PAYMENT_RETRY_ATTEMPTS, '– error', err.message || err);
    }
  }
  return lastResult;
}

/**
 * Customer transaction history (incoming/outgoing). type '1' = outgoing, '2' = incoming/all.
 * APK: m12539j1 c2 [userKey, userId, pageNumber, type, searchGsmOrSecret, status, channelName, sortType].
 */
async function customerHistory(userId, userKey, device, opts = {}) {
  const {
    pageNumber = '1',
    type = '2',
    searchGsmOrSecret = '',
    status = '2',
    channelName = '4',
    sortType = '1'
  } = opts;
  const endpointKey = type === '1' ? 'customerHistory_outgoing' : 'customerHistory_incoming';
  const maxAttempts = useHashRetry(endpointKey) ? HASH_RETRY_ATTEMPTS : 1;
  const hashParams = [userId, pageNumber, type, searchGsmOrSecret, status, channelName, sortType];
  let lastResult;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const hash = await getHash('c2', userKey, hashParams, device, endpointKey, attempt);
    const params = {
      appVersion: device.appVersion,
      pageNumber,
      searchGsmOrSecret,
      type,
      systemVersion: device.systemVersion,
      deviceId: device.deviceId,
      userId,
      sortType,
      mobileManufaturer: device.mobileManufaturer,
      mobileModel: device.mobileModel,
      channelName,
      lang: device.lang,
      hash,
      status
    };
    lastResult = await postCashForm('/ePayment/customerHistory', params, device);
    if (lastResult.code === '1') return lastResult;
    if (lastResult.code === '-15000') continue;
    return lastResult;
  }
  return lastResult;
}

/**
 * Get secret code for this account (receiving by code).
 * APK: h2 [userKey, userId, salt].
 */
async function secretCode(userId, userKey, device) {
  const hash = await getHash('h2', userKey, [userId], device, 'secretCode');
  const params = {
    ...device,
    userId,
    hash
  };
  const keys = ['appVersion', 'mobileManufaturer', 'mobileModel', 'lang', 'systemVersion', 'deviceId', 'userId', 'hash'];
  const obj = {};
  keys.forEach(k => { obj[k] = params[k]; });
  return postCashForm('/ePayment/secretCode', obj, device);
}

/**
 * Get ePayment history types (Incoming Transfer, Outgoing Transfer, etc.).
 * APK: h2 [userKey, userId, salt].
 */
async function getHistoryTypes(userId, userKey, device) {
  const hash = await getHash('h2', userKey, [userId], device, 'getHistoryTypes');
  const body = {
    ...device,
    userId,
    hash
  };
  return postCash('/features/ePayment/getHistoryTypes', body, device);
}

/**
 * Register FCM/push token for the account (notification/setToken). APK m12575n5 uses e2 [userKey, accountId, token, "2", salt].
 * userKey = first/current GSM's userKey from login. When userKey is missing, falls back to captured hash (same device).
 */
async function setToken(accountId, device, userKey, token = CAPTURED_SETTOKEN_TOKEN) {
  const hash = userKey
    ? await getHash('e2', userKey, [String(accountId), token, '2'], device, 'setToken')
    : await getHash('h2', '0', [String(accountId)], device, 'setToken');
  const systemVersionSetToken = (device.systemVersion || 'Android+v15').replace('Android+', 'Android');
  const params = {
    accountId: String(accountId),
    appVersion: device.appVersion || '5.6.0',
    mobileManufaturer: device.mobileManufaturer || 'samsung',
    mobileModel: device.mobileModel || 'SM-S931B',
    osType: '2',
    lang: device.lang || '1',
    systemVersion: systemVersionSetToken,
    deviceId: device.deviceId,
    hash,
    token
  };
  return postFapiForm('/notification/setToken', params, device);
}

module.exports = {
  checkGSM,
  signIn,
  resendOtp,
  submitOtp,
  setToken,
  getUsage,
  refreshBalance,
  checkAccountRefreshBalance,
  pinCodeCheck,
  checkCustomer,
  transfer,
  customerHistory,
  getHistoryTypes,
  secretCode
};
