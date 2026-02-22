/**
 * Store for Syriatel accounts and pending OTP.
 * USE_MEMORY=true → in-memory (RAM); USE_MEMORY=false or unset → MySQL. apiKey from signin response.
 */

const crypto = require('crypto');
const { CAPTURED_DEVICE } = require('./device');

const USE_MEMORY = process.env.USE_MEMORY === 'true' ||
  process.env.USE_MEMORY === '1' ||
  process.env.USE_MEMORY === 'yes';

const accounts = new Map();
const pendingOtps = new Map();

function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

/** Ensure device is a plain object. DB may return JSON string; spreading a string corrupts API payloads. */
function ensureDeviceObject(device) {
  if (device && typeof device === 'object' && !Array.isArray(device)) return device;
  if (typeof device === 'string') {
    try { return JSON.parse(device); } catch { /* fall through */ }
  }
  return { ...CAPTURED_DEVICE };
}

function getDb() {
  if (!getDb._db) getDb._db = require('./db');
  return getDb._db;
}

async function get(apiKey) {
  if (USE_MEMORY) {
    const row = accounts.get(apiKey);
    if (!row) return null;
    return { apiKey, ...row, device: ensureDeviceObject(row.device) };
  }
  const row = await getDb().getAccount(apiKey);
  if (!row) return null;
  return {
    apiKey: row.apiKey,
    gsm: row.gsm,
    password: row.password,
    accountId: row.accountId,
    userId: row.userId,
    userKey: row.userKey,
    accountData: row.accountData,
    device: ensureDeviceObject(row.device),
    linkedAt: row.linkedAt
  };
}

/**
 * Normalize GSM for lookup (handles 0930622976 vs 930622976, etc).
 */
function getGsmLookupVariants(gsm) {
  const s = String(gsm || '').trim();
  if (!s) return [];
  const digits = s.replace(/\D/g, '');
  const variants = [s];
  if (digits.length === 9) variants.push('0' + digits);
  else if (digits.length === 10 && digits[0] === '0') variants.push(digits.slice(1));
  return [...new Set(variants)];
}

function gsmMatches(variants, stored) {
  const s = (stored || '').toString().trim();
  return variants.includes(s);
}

/**
 * Find account by GSM (primary or any in accountData).
 */
async function getByGsm(gsm) {
  if (!gsm) return null;
  const variants = getGsmLookupVariants(gsm);
  if (variants.length === 0) return null;
  if (USE_MEMORY) {
    const matches = [];
    for (const [apiKey, row] of accounts) {
      if (gsmMatches(variants, row.gsm) || (row.accountData || []).some(a => gsmMatches(variants, a.gsm))) {
        matches.push({ apiKey, ...row });
      }
    }
    if (matches.length === 0) return null;
    matches.sort((a, b) => new Date(b.linkedAt || 0) - new Date(a.linkedAt || 0));
    const latest = matches[0];
    return { apiKey: latest.apiKey, ...latest, device: ensureDeviceObject(latest.device) };
  }
  const row = await getDb().getAccountByGsm(gsm);
  if (!row) return null;
  return {
    apiKey: row.apiKey,
    gsm: row.gsm,
    password: row.password,
    accountId: row.accountId,
    userId: row.userId,
    userKey: row.userKey,
    accountData: row.accountData,
    device: ensureDeviceObject(row.device),
    linkedAt: row.linkedAt
  };
}

async function set(apiKey, data) {
  const linkedAt = data.linkedAt || new Date().toISOString();
  if (USE_MEMORY) {
    accounts.set(apiKey, {
      gsm: data.gsm,
      password: data.password,
      accountId: data.accountId,
      userId: data.userId,
      userKey: data.userKey,
      accountData: data.accountData,
      device: data.device,
      linkedAt
    });
    return data;
  }
  await getDb().setAccount(apiKey, {
    gsm: data.gsm,
    password: data.password,
    accountId: data.accountId,
    userId: data.userId,
    userKey: data.userKey,
    accountData: data.accountData,
    device: data.device,
    linkedAt
  });
  return data;
}

async function remove(apiKey) {
  if (USE_MEMORY) {
    return accounts.delete(apiKey);
  }
  return getDb().removeAccount(apiKey);
}

async function list() {
  if (USE_MEMORY) {
    return Array.from(accounts.entries()).map(([apiKey, row]) => ({
      apiKey,
      gsm: row.gsm,
      accountId: row.accountId,
      userId: row.userId,
      linkedAt: row.linkedAt
    }));
  }
  return getDb().listAccounts();
}

async function setPendingOtp(apiKey, data) {
  if (USE_MEMORY) {
    pendingOtps.set(apiKey, { gsm: data.gsm, password: data.password, device: data.device || {} });
    return;
  }
  return getDb().setPendingOtp(apiKey, data);
}

async function getPendingOtp(apiKey) {
  if (USE_MEMORY) {
    const row = pendingOtps.get(apiKey);
    return row ? { gsm: row.gsm, password: row.password, device: ensureDeviceObject(row.device) } : null;
  }
  const row = await getDb().getPendingOtp(apiKey);
  return row ? { ...row, device: ensureDeviceObject(row.device) } : null;
}

async function deletePendingOtp(apiKey) {
  if (USE_MEMORY) {
    return pendingOtps.delete(apiKey);
  }
  return getDb().deletePendingOtp(apiKey);
}

module.exports = {
  generateApiKey,
  get,
  getByGsm,
  set,
  remove,
  list,
  setPendingOtp,
  getPendingOtp,
  deletePendingOtp
};
