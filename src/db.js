/**
 * MySQL persistence for Syriatel API. Accounts and pending OTP keyed by apiKey.
 * Uses Sequelize to create database/tables on startup. Handles corrupted tables
 * ("doesn't exist in engine") by dropping and recreating.
 */

const { Op } = require('sequelize');
const { sequelize, Account, PendingOtp, syncDatabase } = require('./models');

let initialized = false;

async function initDatabase() {
  await syncDatabase();
  initialized = true;
}

function getConnection() {
  if (!initialized) throw new Error('Database not initialized. Call initDatabase() first.');
  return sequelize;
}

async function getAccount(apiKey) {
  const row = await Account.findByPk(apiKey);
  if (!row) return null;
  const r = row.get({ plain: true });
  return {
    apiKey: r.api_key,
    gsm: r.gsm,
    password: r.password,
    accountId: r.account_id,
    userId: r.user_id,
    userKey: r.user_key,
    accountData: typeof r.account_data === 'string' ? JSON.parse(r.account_data) : r.account_data,
    device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
    linkedAt: r.linked_at,
    name: r.name || null,
    pin: r.pin || null
  };
}

async function setAccount(apiKey, data) {
  const linkedAt = data.linkedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
  let accountData = data.accountData;
  if (typeof accountData === 'string') {
    try { accountData = JSON.parse(accountData); } catch { accountData = []; }
  }
  if (!Array.isArray(accountData)) accountData = accountData && typeof accountData === 'object' ? [accountData] : [];
  let device = data.device;
  if (typeof device === 'string') {
    try { device = JSON.parse(device); } catch { device = {}; }
  }
  if (!device || typeof device !== 'object') device = {};

  const upsertData = {
    api_key: apiKey,
    gsm: data.gsm,
    account_id: data.accountId,
    user_id: data.userId,
    user_key: data.userKey,
    account_data: accountData,
    device,
    linked_at: linkedAt,
    updated_at: new Date()
  };
  if (data.password != null && data.password !== '') {
    upsertData.password = data.password;
  }
  if (data.name !== undefined) {
    upsertData.name = data.name;
  }
  if (data.pin !== undefined) {
    upsertData.pin = data.pin;
  }

  await Account.upsert(upsertData);
  return data;
}

async function removeAccount(apiKey) {
  const deleted = await Account.destroy({ where: { api_key: apiKey } });
  return deleted > 0;
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

/**
 * Find account by GSM (primary gsm or any gsm in accountData).
 */
async function getAccountByGsm(gsm) {
  if (!gsm) return null;
  const variants = getGsmLookupVariants(gsm);
  if (variants.length === 0) return null;
  // First try primary gsm (exact + normalized variants), get latest
  let row = await Account.findOne({
    where: { gsm: { [Op.in]: variants } },
    order: [['linked_at', 'DESC']]
  });
  if (row) {
    const r = row.get({ plain: true });
    return {
      apiKey: r.api_key,
      gsm: r.gsm,
      password: r.password,
      accountId: r.account_id,
      userId: r.user_id,
      userKey: r.user_key,
      accountData: typeof r.account_data === 'string' ? JSON.parse(r.account_data) : r.account_data,
      device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
      linkedAt: r.linked_at,
      name: r.name || null,
      pin: r.pin || null
    };
  }
  // Fallback: search in accountData JSON (any gsm in linked lines)
  for (const v of variants) {
    const rows = await Account.findAll({
      where: sequelize.literal(
        `JSON_SEARCH(account_data, 'one', ${sequelize.escape(v)}, NULL, '$[*].gsm') IS NOT NULL`
      ),
      order: [['linked_at', 'DESC']],
      limit: 1
    });
    if (rows.length > 0) {
      const r = rows[0].get({ plain: true });
      return {
        apiKey: r.api_key,
        gsm: r.gsm,
        password: r.password,
        accountId: r.account_id,
        userId: r.user_id,
        userKey: r.user_key,
        accountData: typeof r.account_data === 'string' ? JSON.parse(r.account_data) : r.account_data,
        device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
        linkedAt: r.linked_at,
        name: r.name || null,
        pin: r.pin || null
      };
    }
  }
  // Last resort: fetch all and filter in JS (handles edge cases, different DB drivers), get latest
  const all = await Account.findAll({ order: [['linked_at', 'DESC']] });
  for (const row of all) {
    const r = row.get({ plain: true });
    const ad = typeof r.account_data === 'string' ? JSON.parse(r.account_data) : r.account_data || [];
    if (variants.includes(String(r.gsm || '').trim())) {
      return {
        apiKey: r.api_key,
        gsm: r.gsm,
        password: r.password,
        accountId: r.account_id,
        userId: r.user_id,
        userKey: r.user_key,
        accountData: ad,
        device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
        linkedAt: r.linked_at,
        name: r.name || null,
        pin: r.pin || null
      };
    }
    if (ad.some(a => variants.includes(String(a.gsm || '').trim()))) {
      return {
        apiKey: r.api_key,
        gsm: r.gsm,
        password: r.password,
        accountId: r.account_id,
        userId: r.user_id,
        userKey: r.user_key,
        accountData: ad,
        device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
        linkedAt: r.linked_at,
        name: r.name || null,
        pin: r.pin || null
      };
    }
  }
  return null;
}

async function listAccounts() {
  const rows = await Account.findAll({
    attributes: ['api_key', 'gsm', 'password', 'account_id', 'user_id', 'linked_at', 'name', 'pin'],
    order: [['linked_at', 'DESC']]
  });
  return rows.map(r => ({
    apiKey: r.api_key,
    gsm: r.gsm,
    password: r.password || null,
    accountId: r.account_id,
    userId: r.user_id,
    linkedAt: r.linked_at,
    name: r.name || null,
    pin: r.pin || null
  }));
}

async function setPendingOtp(apiKey, data) {
  const device = typeof data.device === 'string' ? data.device : JSON.stringify(data.device || {});
  const upsertData = {
    api_key: apiKey,
    gsm: data.gsm,
    device
  };
  if (data.password != null && data.password !== '') {
    upsertData.password = data.password;
  }
  await PendingOtp.upsert(upsertData);
}

async function getPendingOtp(apiKey) {
  const row = await PendingOtp.findByPk(apiKey);
  if (!row) return null;
  const r = row.get({ plain: true });
  return {
    gsm: r.gsm,
    password: r.password,
    device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device
  };
}

async function deletePendingOtp(apiKey) {
  const deleted = await PendingOtp.destroy({ where: { api_key: apiKey } });
  return deleted > 0;
}

module.exports = {
  initDatabase,
  getAccount,
  getAccountByGsm,
  setAccount,
  removeAccount,
  listAccounts,
  setPendingOtp,
  getPendingOtp,
  deletePendingOtp
};
