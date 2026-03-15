/**
 * Sequelize configuration and model initialization.
 * Creates database if missing, then syncs models to create tables.
 */

const { Sequelize } = require('sequelize');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'syriatel_api';

const sequelize = new Sequelize(MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, {
  host: MYSQL_HOST,
  port: MYSQL_PORT,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: false
  }
});

const Account = require('./Account')(sequelize);
const PendingOtp = require('./PendingOtp')(sequelize);

async function createDatabaseIfNotExists() {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD
  });
  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

const CORRUPTION_PATTERNS = [
  "doesn't exist in engine",
  'Tablespace for table',
  'DISCARD the tablespace',
  'ER_NO_SUCH_TABLE'
];

function isCorruptionError(err) {
  const msg = (err && err.message) || '';
  return CORRUPTION_PATTERNS.some(p => msg.includes(p));
}

async function dropAndRecreateDatabase() {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
  });
  try {
    await conn.query('DROP TABLE IF EXISTS `pending_otp`');
    await conn.query('DROP TABLE IF EXISTS `accounts`');
  } catch (e) {
    // ignore
  }
  await conn.changeUser({ database: undefined });
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\``);
  } catch (dropErr) {
    if (dropErr.message && dropErr.message.includes('Directory not empty')) {
      throw new Error(
        'Database directory has orphan files. Run: npm run db:fix\n' +
        'If that fails, manually delete <mysql-data-dir>/' + MYSQL_DATABASE + ' then run db:fix again.'
      );
    }
    throw dropErr;
  }
  await conn.query(`CREATE DATABASE \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await conn.end();
}

async function syncDatabase() {
  await createDatabaseIfNotExists();
  await sequelize.authenticate();

  try {
    await sequelize.sync({ alter: false });
    await runMigrations();
  } catch (err) {
    if (isCorruptionError(err)) {
      console.warn('Detected corrupted database/tables, dropping and recreating...');
      await sequelize.close();
      await dropAndRecreateDatabase();
      await sequelize.authenticate();
      await sequelize.sync({ alter: false });
      await runMigrations();
    } else {
      throw err;
    }
  }
}

async function runMigrations() {
  const isDuplicateColumn = (e) => e && e.message && /duplicate column|ER_DUP_FIELDNAME/i.test(e.message);
  try {
    await sequelize.query('ALTER TABLE `accounts` ADD COLUMN `password` VARCHAR(255) NULL');
  } catch (e) {
    if (!isDuplicateColumn(e)) throw e;
  }
  try {
    await sequelize.query('ALTER TABLE `pending_otp` ADD COLUMN `password` VARCHAR(255) NULL');
  } catch (e) {
    if (!isDuplicateColumn(e)) throw e;
  }
  try {
    await sequelize.query('ALTER TABLE `accounts` ADD COLUMN `name` VARCHAR(255) NULL');
  } catch (e) {
    if (!isDuplicateColumn(e)) throw e;
  }
  try {
    await sequelize.query('ALTER TABLE `accounts` ADD COLUMN `pin` VARCHAR(32) NULL');
  } catch (e) {
    if (!isDuplicateColumn(e)) throw e;
  }
}

module.exports = {
  sequelize,
  Account,
  PendingOtp,
  syncDatabase,
  createDatabaseIfNotExists
};
