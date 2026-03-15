/**
 * Admin panel authentication – JWT login and middleware.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SECRET = process.env.ADMIN_JWT_SECRET || crypto.randomBytes(32).toString('hex');
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

if (!process.env.ADMIN_JWT_SECRET) {
  console.warn('[Admin] No ADMIN_JWT_SECRET in .env – using random secret (tokens will not survive restarts).');
}

function login(req, res) {
  if (!ADMIN_PASS) {
    return res.status(500).json({ success: false, error: 'Admin not configured. Set ADMIN_PASSWORD in .env.' });
  }
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || username !== ADMIN_USER || password !== ADMIN_PASS) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
  const token = jwt.sign({ role: 'admin' }, SECRET, { expiresIn: '2h' });
  res.json({ success: true, token });
}

function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing token' });
  }
  try {
    jwt.verify(auth.slice(7), SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { login, requireAdmin };
