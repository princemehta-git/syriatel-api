/**
 * Admin API routes – mounted at /admin/api.
 */

const express = require('express');
const router = express.Router();
const { login, requireAdmin } = require('./adminAuth');
const store = require('./store');

// Public
router.post('/login', login);

// All routes below require JWT
router.use(requireAdmin);

router.get('/accounts', async (req, res) => {
  try {
    const list = await store.list();
    res.json({ success: true, accounts: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/accounts/:apiKey', async (req, res) => {
  try {
    const acc = await store.get(req.params.apiKey);
    if (!acc) return res.status(404).json({ success: false, error: 'Account not found' });
    res.json({ success: true, account: acc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/accounts/:apiKey', async (req, res) => {
  try {
    const acc = await store.get(req.params.apiKey);
    if (!acc) return res.status(404).json({ success: false, error: 'Account not found' });
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name === null ? null : String(req.body.name).slice(0, 255);
    if (req.body.pin !== undefined) updates.pin = req.body.pin === null ? null : String(req.body.pin).slice(0, 32);
    await store.set(req.params.apiKey, { ...acc, ...updates });
    res.json({ success: true, message: 'Account updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/accounts/:apiKey', async (req, res) => {
  try {
    const removed = await store.remove(req.params.apiKey);
    res.json({ success: true, removed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
