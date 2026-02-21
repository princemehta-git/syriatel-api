/**
 * Syriatel Cash API – GET-only server.
 * Sign in with GSM + password; attach apiKey from first call to all subsequent calls.
 * Persistence: USE_MEMORY=false (MySQL) or true (in-memory, no DB).
 */

require('dotenv').config();

const express = require('express');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const USE_MEMORY = process.env.USE_MEMORY === 'true' ||
  process.env.USE_MEMORY === '1' ||
  process.env.USE_MEMORY === 'yes';

app.use(express.json());
app.get('/signin', routes.signin);
app.get('/otp', routes.otp);
app.get('/resendOtp', routes.resendOtp);
app.get('/balance', routes.balance);
app.get('/history', routes.history);
app.get('/transaction', routes.transaction);
app.get('/transfer', routes.transfer);
app.get('/gsms', routes.gsms);
app.get('/accounts', routes.accounts);
app.get('/checkGsm', routes.checkGsm);
app.get('/accountInfo', routes.accountInfo);
app.get('/historyTypes', routes.historyTypes);
app.get('/usage', routes.usage);
app.get('/secretCode', routes.secretCode);

app.get('/', (req, res) => {
  res.json({
    name: 'Syriatel Cash API',
    version: '1.0.0',
    endpoints: [
      'GET /signin?gsm=...&password=...  → returns apiKey; attach to all later calls',
      'GET /otp?apiKey=...&code=...',
      'GET /resendOtp?apiKey=...',
      'GET /balance?apiKey=...  (optional &gsm= for specific line)',
      'GET /history?apiKey=...&page=1  (optional &gsm= for specific line)',
      'GET /transaction?apiKey=...&transactionId=...  (optional &gsm=)',
      'GET /transfer?apiKey=...&pin=...&to=...&amount=...  (optional &gsm=)',
      'GET /gsms?apiKey=...',
      'GET /accounts',
      'GET /checkGsm?gsm=...',
      'GET /accountInfo?apiKey=...  (optional &gsm=)',
      'GET /historyTypes?apiKey=...  (optional &gsm=)',
      'GET /usage?apiKey=...  (optional &gsm=)',
      'GET /secretCode?apiKey=...  (optional &gsm=)'
    ]
  });
});

app.use((err, req, res, next) => {
  const isNetwork = err && (err.message === 'fetch failed' || (err.cause && (err.cause.code === 'ECONNRESET' || err.cause.code === 'ETIMEDOUT' || err.cause.code === 'ENOTFOUND')));
  const status = isNetwork ? 502 : 500;
  const message = isNetwork ? 'Syriatel API unreachable (connection reset or timeout). Try again or check network/VPN.' : (err.message || 'Internal server error');
  if (!res.headersSent) {
    res.status(status).json({ success: false, error: message });
  }
});

async function start() {
  if (USE_MEMORY) {
    console.log('Using in-memory store (USE_MEMORY=true). No MySQL connection.');
  } else {
    try {
      const db = require('./src/db');
      await db.initDatabase();
      console.log('Database ready (syriatel_api).');
    } catch (err) {
      console.error('Database init failed:', err.message);
      process.exit(1);
    }
  }
  app.listen(PORT, () => {
    console.log('Syriatel Cash API listening on http://localhost:' + PORT);
  });
}

start();
