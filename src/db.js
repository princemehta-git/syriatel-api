/**
 * MySQL persistence for Syriatel API. Accounts and pending OTP keyed by apiKey.
 * On startup: create database/tables if missing, and add any missing columns to match expected structure.
 */

const mysql = require('mysql2/promise');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'syriatel_api';

let pool = null;

const ACCOUNTS_COLUMNS = [
  { name: 'api_key', type: 'VARCHAR(64)' },
  { name: 'gsm', type: 'VARCHAR(24)' },
  { name: 'account_id', type: 'VARCHAR(32)' },
  { name: 'user_id', type: 'VARCHAR(32)' },
  { name: 'user_key', type: 'VARCHAR(128)' },
  { name: 'account_data', type: 'JSON' },
  { name: 'device', type: 'JSON' },
  { name: 'linked_at', type: 'DATETIME' },
  { name: 'created_at', type: 'DATETIME' },
  { name: 'updated_at', type: 'DATETIME' }
];

const PENDING_OTP_COLUMNS = [
  { name: 'api_key', type: 'VARCHAR(64)' },
  { name: 'gsm', type: 'VARCHAR(24)' },
  { name: 'device', type: 'JSON' },
  { name: 'created_at', type: 'DATETIME' }
];

async function getPool(useDb = true) {
  const config = {
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
  if (useDb) config.database = MYSQL_DATABASE;
  return mysql.createPool(config);
}

async function initDatabase() {
  const tempPool = await getPool(false);
  await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await tempPool.end();
  pool = await getPool(true);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS accounts (
      api_key VARCHAR(64) NOT NULL PRIMARY KEY,
      gsm VARCHAR(24) NOT NULL,
      account_id VARCHAR(32) NOT NULL,
      user_id VARCHAR(32) NOT NULL,
      user_key VARCHAR(128) NOT NULL,
      account_data JSON NOT NULL,
      device JSON NOT NULL,
      linked_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS pending_otp (
      api_key VARCHAR(64) NOT NULL PRIMARY KEY,
      gsm VARCHAR(24) NOT NULL,
      device JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await ensureColumns(pool, 'accounts', ACCOUNTS_COLUMNS);
  await ensureColumns(pool, 'pending_otp', PENDING_OTP_COLUMNS);
}

async function ensureColumns(conn, table, expectedColumns) {
  const [rows] = await conn.query(`DESCRIBE \`${table}\``);
  const existing = new Set(rows.map(r => r.Field.toLowerCase()));
  for (const col of expectedColumns) {
    const key = col.name.toLowerCase();
    if (!existing.has(key)) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${col.name}\` ${col.type}`);
    }
  }
}

function getConnection() {
  if (!pool) throw new Error('Database not initialized. Call initDatabase() first.');
  return pool;
}

async function getAccount(apiKey) {
  const [rows] = await getConnection().execute(
    'SELECT api_key, gsm, account_id, user_id, user_key, account_data, device, linked_at FROM accounts WHERE api_key = ?',
    [apiKey]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    apiKey: r.api_key,
    gsm: r.gsm,
    accountId: r.account_id,
    userId: r.user_id,
    userKey: r.user_key,
    accountData: typeof r.account_data === 'string' ? JSON.parse(r.account_data) : r.account_data,
    device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device,
    linkedAt: r.linked_at
  };
}

async function setAccount(apiKey, data) {
  const linkedAt = data.linkedAt || new Date().toISOString().replace('T', ' ').slice(0, 19);
  const accountData = JSON.stringify(data.accountData || []);
  const device = JSON.stringify(data.device || {});
  await getConnection().execute(
    `INSERT INTO accounts (api_key, gsm, account_id, user_id, user_key, account_data, device, linked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       gsm = VALUES(gsm), account_id = VALUES(account_id), user_id = VALUES(user_id), user_key = VALUES(user_key),
       account_data = VALUES(account_data), device = VALUES(device), linked_at = VALUES(linked_at)`,
    [apiKey, data.gsm, data.accountId, data.userId, data.userKey, accountData, device, linkedAt]
  );
  return data;
}

async function removeAccount(apiKey) {
  const [result] = await getConnection().execute('DELETE FROM accounts WHERE api_key = ?', [apiKey]);
  return result.affectedRows > 0;
}

async function listAccounts() {
  const [rows] = await getConnection().query(
    'SELECT api_key, gsm, account_id, user_id, linked_at FROM accounts ORDER BY linked_at DESC'
  );
  return rows.map(r => ({
    apiKey: r.api_key,
    gsm: r.gsm,
    accountId: r.account_id,
    userId: r.user_id,
    linkedAt: r.linked_at
  }));
}

async function setPendingOtp(apiKey, data) {
  const device = JSON.stringify(data.device || {});
  await getConnection().execute(
    `INSERT INTO pending_otp (api_key, gsm, device) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE gsm = VALUES(gsm), device = VALUES(device)`,
    [apiKey, data.gsm, device]
  );
}

async function getPendingOtp(apiKey) {
  const [rows] = await getConnection().execute(
    'SELECT gsm, device FROM pending_otp WHERE api_key = ?',
    [apiKey]
  );
  if (!rows || rows.length === 0) return null;
  const r = rows[0];
  return {
    gsm: r.gsm,
    device: typeof r.device === 'string' ? JSON.parse(r.device) : r.device
  };
}

async function deletePendingOtp(apiKey) {
  const [result] = await getConnection().execute('DELETE FROM pending_otp WHERE api_key = ?', [apiKey]);
  return result.affectedRows > 0;
}

module.exports = {
  initDatabase,
  getAccount,
  setAccount,
  removeAccount,
  listAccounts,
  setPendingOtp,
  getPendingOtp,
  deletePendingOtp
};
