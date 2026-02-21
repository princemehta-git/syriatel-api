/**
 * Store for Syriatel accounts and pending OTP.
 * USE_MEMORY=true → in-memory (RAM); USE_MEMORY=false or unset → MySQL. apiKey from signin response.
 */

const crypto = require('crypto');

const USE_MEMORY = process.env.USE_MEMORY === 'true' ||
  process.env.USE_MEMORY === '1' ||
  process.env.USE_MEMORY === 'yes';

const accounts = new Map();
const pendingOtps = new Map();

function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

function getDb() {
  if (!getDb._db) getDb._db = require('./db');
  return getDb._db;
}

async function get(apiKey) {
  if (USE_MEMORY) {
    const row = accounts.get(apiKey);
    if (!row) return null;
    return { apiKey, ...row };
  }
  const row = await getDb().getAccount(apiKey);
  if (!row) return null;
  return {
    apiKey: row.apiKey,
    gsm: row.gsm,
    accountId: row.accountId,
    userId: row.userId,
    userKey: row.userKey,
    accountData: row.accountData,
    device: row.device,
    linkedAt: row.linkedAt
  };
}

async function set(apiKey, data) {
  const linkedAt = data.linkedAt || new Date().toISOString();
  if (USE_MEMORY) {
    accounts.set(apiKey, {
      gsm: data.gsm,
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
    pendingOtps.set(apiKey, { gsm: data.gsm, device: data.device || {} });
    return;
  }
  return getDb().setPendingOtp(apiKey, data);
}

async function getPendingOtp(apiKey) {
  if (USE_MEMORY) {
    const row = pendingOtps.get(apiKey);
    return row ? { gsm: row.gsm, device: row.device || {} } : null;
  }
  return getDb().getPendingOtp(apiKey);
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
  set,
  remove,
  list,
  setPendingOtp,
  getPendingOtp,
  deletePendingOtp
};
