#!/usr/bin/env node
/**
 * Fix corrupted MySQL database (e.g. "doesn't exist in engine", "Directory not empty").
 * Run: node scripts/db-fix.js
 * Then: npm start
 */

require('dotenv').config();

const mysql = require('mysql2/promise');

const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_PORT = parseInt(process.env.MYSQL_PORT || '3306', 10);
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'syriatel_api';

async function main() {
  console.log('Connecting to MySQL...');
  const conn = await mysql.createConnection({
    host: MYSQL_HOST,
    port: MYSQL_PORT,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD
  });

  try {
    console.log('Dropping tables (if any)...');
    await conn.query(`USE \`${MYSQL_DATABASE}\``).catch(() => {});
    await conn.query('DROP TABLE IF EXISTS `pending_otp`').catch(() => {});
    await conn.query('DROP TABLE IF EXISTS `accounts`').catch(() => {});

    console.log('Dropping database...');
    await conn.query(`DROP DATABASE IF EXISTS \`${MYSQL_DATABASE}\``);
    console.log('Creating database...');
    await conn.query(`CREATE DATABASE \`${MYSQL_DATABASE}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('Done! Run: npm start');
  } catch (err) {
    if (err.message && err.message.includes('Directory not empty')) {
      const fallbackDb = MYSQL_DATABASE + '_new';
      console.error('\nCould not drop database - orphan files remain.');
      console.error('\nQuick fix - use a fresh database:');
      console.error('  Add to .env: MYSQL_DATABASE=' + fallbackDb);
      console.error('  Then run: npm start');
      console.error('\nOr manual fix (to keep using ' + MYSQL_DATABASE + '):');
      console.error('  1. Stop MySQL');
      console.error('  2. Delete the folder: <mysql-data-dir>/' + MYSQL_DATABASE);
      console.error('     (e.g. C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Data\\' + MYSQL_DATABASE + ')');
      console.error('  3. Start MySQL');
      console.error('  4. Run: npm run db:fix');
      process.exit(1);
    }
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
