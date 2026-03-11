/**
 * GET-only API routes. All operations via query params.
 * Use apiKey from first call (signin response); attach apiKey to all subsequent calls.
 */

const syriatel = require('./syriatel');
const store = require('./store');
const { getDeviceForRequest } = require('./device');

// --- Transfer deduplication ---
// Prevents duplicate payments from concurrent requests or rapid-fire retries.

/** Transfers currently being processed. Key = "userId:toGSM:amount" */
const transfersInFlight = new Map();

/**
 * Recently completed transfers. Key = "userId:toGSM:amount", value = { result, ts }.
 * Blocks identical transfers within DEDUP_WINDOW_MS of a successful one.
 */
const recentTransfers = new Map();
const DEDUP_WINDOW_MS = parseInt(process.env.TRANSFER_DEDUP_WINDOW_MS, 10) || 30000;

setInterval(() => {
  const now = Date.now();
  const toDelete = [];
  for (const [key, entry] of recentTransfers) {
    if (now - entry.ts > DEDUP_WINDOW_MS) toDelete.push(key);
  }
  toDelete.forEach(k => recentTransfers.delete(k));
}, 10000);

/** Wrap async route so fetch/network errors are passed to Express error handler instead of crashing the process. */
function wrap(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}

/** Ensure accountData is always an array. Handles: array, JSON string from DB, or single object. */
function ensureAccountDataArray(accountData) {
  if (Array.isArray(accountData)) return accountData;
  if (typeof accountData === 'string') {
    try {
      const parsed = JSON.parse(accountData);
      return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : []);
    } catch {
      return [];
    }
  }
  if (accountData && typeof accountData === 'object' && !Array.isArray(accountData)) return [accountData];
  return [];
}

/**
 * Resolve userId/userKey for a given gsm. If gsm provided, find in accountData; else use account default.
 */
function resolveUser(acc, gsm) {
  if (!gsm) return { userId: acc.userId, userKey: acc.userKey };
  const accountData = ensureAccountDataArray(acc.accountData);
  const entry = accountData.find(a => (a.gsm || '').toString() === gsm.toString());
  if (!entry) return null;
  return {
    userId: entry.user_ID || entry.userId,
    userKey: entry.userKey || entry.user_KEY
  };
}

/**
 * Resolve userId/userKey from 'from' or 'for' param (userId, GSM, or secret code). If empty, use account default.
 */
function resolveUserFrom(acc, from) {
  const val = from != null ? String(from).trim() : '';
  if (val === '') return { userId: acc.userId, userKey: acc.userKey };
  const accountData = ensureAccountDataArray(acc.accountData);
  const byGsm = accountData.find(a => (a.gsm || '').toString() === val);
  if (byGsm) return { userId: byGsm.user_ID || byGsm.userId, userKey: byGsm.userKey || byGsm.user_KEY };
  const byUserId = accountData.find(a => String(a.user_ID || a.userId) === val);
  if (byUserId) return { userId: byUserId.user_ID || byUserId.userId, userKey: byUserId.userKey || byUserId.user_KEY };
  const bySecretCode = accountData.find(a => {
    const code = a.secretCode != null ? String(a.secretCode) : (a.secret_code != null ? String(a.secret_code) : '');
    return code === val;
  });
  if (bySecretCode) return { userId: bySecretCode.user_ID || bySecretCode.userId, userKey: bySecretCode.userKey || bySecretCode.user_KEY };
  return null;
}

/**
 * Fetch secretCode for each line in accountData and attach to each entry. Returns new array (does not mutate).
 */
async function fetchSecretCodesForAccountData(accountData, device) {
  const arr = ensureAccountDataArray(accountData);
  const out = [];
  for (const entry of arr) {
    const userId = entry.user_ID || entry.userId;
    const userKey = entry.userKey || entry.user_KEY;
    let secretCode = entry.secretCode != null ? entry.secretCode : entry.secret_code;
    try {
      const result = await syriatel.secretCode(userId, userKey, device);
      if (result.code === '1' && result.data) {
        const data = result.data;
        const code = (data.secretCode != null) ? data.secretCode : (data.data && (data.data.secretCode != null ? data.data.secretCode : data.data.secret_code));
        if (code != null) secretCode = code;
      }
    } catch (err) {
      console.warn('[secretCode] fetch failed for userId', userId, err.message);
    }
    out.push({ ...entry, secretCode });
  }
  return out;
}

async function getAccountOrFail(req, res) {
  const apiKey = req.query.apiKey || req.query.api_key || req.query.uniqueId;
  if (!apiKey) {
    res.status(400).json({ error: 'missing apiKey. Attach apiKey from signin response to all subsequent calls.' });
    return null;
  }
  const acc = await store.get(apiKey);
  if (!acc) {
    res.status(404).json({ error: 'account not found or expired' });
    return null;
  }
  return acc;
}

/**
 * Parse isnew flag: true/1/yes => true, else false.
 */
function parseIsNew(val) {
  if (val === undefined || val === null || val === '') return false;
  const v = String(val).toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

/**
 * GET /signin?gsm=0986121503&password=xxx&isnew=0|1
 * Signs in; returns apiKey. Attach this apiKey to all later calls (balance, history, transfer, etc.).
 * If OTP required, returns needsOtp + apiKey; complete with GET /otp?apiKey=...&code=...
 *
 * isnew: 1/true = force new API key and re-register (default for new signin).
 *       0/false/omit = if GSM already exists in DB, reuse existing apiKey, update userids/userkeys/gsms from Syriatel, do NOT create new record.
 */
async function signin(req, res) {
  const gsm = req.query.gsm;
  const password = req.query.password;
  const isNew = parseIsNew(req.query.isnew);

  if (!gsm || !password) {
    return res.status(400).json({ error: 'missing gsm or password' });
  }

  let apiKey;
  let device;
  let existing = null;

  if (!isNew) {
    existing = await store.getByGsm(gsm);
    if (existing) {
      apiKey = existing.apiKey;
      device = existing.device || getDeviceForRequest(apiKey);
    }
  }

  if (!apiKey) {
    apiKey = store.generateApiKey();
    device = getDeviceForRequest(apiKey);
  }

  const result = await syriatel.signIn(gsm, password, device);
  const code = result.code;
  const data = result.data && result.data.data;

  if (code !== '1') {
    if (existing && existing.password === password) {
      let ad = existing.accountData;
      if (!Array.isArray(ad)) {
        try {
          ad = typeof ad === 'string' ? JSON.parse(ad || '[]') : [];
        } catch {
          ad = [];
        }
      }
      return res.status(200).json({
        success: true,
        apiKey: existing.apiKey,
        accountId: existing.accountId,
        userId: existing.userId,
        gsms: (ad || []).map(a => ({
          gsm: a.gsm,
          user_ID: a.user_ID || a.userId,
          userKey: a.userKey || a.user_KEY
        })),
        message: 'Using cached account (Syriatel temporarily unavailable)'
      });
    }
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message || 'Sign in failed'
    });
  }

  const newDevice = data && data.NEW_DEVICE === '1';
  const accountId = data && data.accountId;
  const accountData = data && data.accountData;

  if (!accountData || !accountData.length) {
    return res.status(200).json({
      success: false,
      message: 'No account data returned'
    });
  }

  if (newDevice) {
    await store.setPendingOtp(apiKey, { gsm, password, device });
    return res.status(200).json({
      success: true,
      needsOtp: true,
      apiKey,
      gsm,
      message: 'OTP required. Call GET /otp?apiKey=' + apiKey + '&code=YOUR_OTP'
    });
  }

  const first = accountData[0];
  const userKey = first.userKey || first.user_KEY;
  const userId = first.user_ID || first.userId;

  const accountDataWithSecretCodes = await fetchSecretCodesForAccountData(accountData, device);

  await store.set(apiKey, {
    gsm,
    password,
    accountId,
    userId,
    userKey,
    accountData: accountDataWithSecretCodes,
    device
  });

  syriatel.setToken(accountId, device, userKey).catch(() => {});

  const gsmsPayload = mapAccountDataToGsms(accountDataWithSecretCodes);

  return res.status(200).json({
    success: true,
    apiKey,
    accountId,
    userId,
    gsms: gsmsPayload
  });
}

/**
 * GET /otp?apiKey=xxx&code=123456
 * Submits OTP and completes login; links account. Use returned apiKey for balance, history, etc.
 */
async function otp(req, res) {
  const apiKey = req.query.apiKey || req.query.api_key || req.query.uniqueId;
  const code = req.query.code;
  if (!apiKey || !code) {
    return res.status(400).json({ error: 'missing apiKey or code' });
  }
  const pending = await store.getPendingOtp(apiKey);
  if (!pending) {
    return res.status(404).json({ error: 'pending OTP not found. Call /signin first.' });
  }
  const { gsm, password, device } = pending;
  const result = await syriatel.submitOtp(gsm, code, device);
  await store.deletePendingOtp(apiKey);

  const resCode = result.code;
  const data = result.data && result.data.data;
  if (resCode !== '1' || !data) {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message || 'OTP verification failed'
    });
  }

  const accountId = data.accountId;
  const accountData = data.accountData || [];
  const first = accountData[0];
  if (!first) {
    return res.status(200).json({ success: false, message: 'No account data' });
  }
  const userKey = first.userKey || first.user_KEY;
  const userId = first.user_ID || first.userId;
  const accountDataWithSecretCodes = await fetchSecretCodesForAccountData(accountData, device);
  await store.set(apiKey, {
    gsm,
    password: password || undefined,
    accountId,
    userId,
    userKey,
    accountData: accountDataWithSecretCodes,
    device
  });
  syriatel.setToken(accountId, device, userKey).catch(() => {});
  return res.status(200).json({
    success: true,
    apiKey,
    accountId,
    userId,
    gsms: mapAccountDataToGsms(accountDataWithSecretCodes)
  });
}

/**
 * GET /resendOtp?apiKey=xxx
 * Resend OTP for a pending sign-in (when needsOtp was true).
 */
async function resendOtp(req, res) {
  const apiKey = req.query.apiKey || req.query.api_key || req.query.uniqueId;
  if (!apiKey) {
    return res.status(400).json({ error: 'missing apiKey' });
  }
  const pending = await store.getPendingOtp(apiKey);
  if (!pending) {
    return res.status(404).json({ error: 'pending OTP not found. Call /signin first.' });
  }
  const { gsm, device } = pending;
  const result = await syriatel.resendOtp(gsm, device);
  return res.status(200).json({
    success: result.code === '1',
    code: result.code,
    message: result.message || (result.code === '1' ? 'OTP resent' : 'Resend failed')
  });
}

/**
 * GET /balance?apiKey=xxx
 * Optional gsm= or for= to get balance for a specific line. for= accepts userId, GSM, or secret code; gsm= (legacy) accepts GSM only.
 */
async function balance(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const forParam = req.query.for;
  const gsm = req.query.gsm;
  const user = forParam != null && forParam !== ''
    ? resolveUserFrom(acc, forParam)
    : resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'for (userId, GSM, or secret code) not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  // Log everything we have before calling Syriatel (get balance)
  console.log('[Balance] GET /balance – request details:', {
    query: { apiKey: req.query.apiKey ? '(present)' : undefined, gsm: req.query.gsm, for: req.query.for },
    resolvedUser: { userId: user.userId, userKey: user.userKey ? '(present)' : '(missing)' },
    device: acc.device,
    payloadToSyriatel: {
      userId: user.userId,
      device: acc.device
    }
  });
  const result = await syriatel.refreshBalance(user.userId, user.userKey, acc.device);
  const data = result.data && result.data.data;
  const balanceInfo = Array.isArray(data) ? data[0] : data;
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  return res.status(200).json({
    success: true,
    customerBalance: balanceInfo && balanceInfo.CUSTOMER_BALANCE != null ? balanceInfo.CUSTOMER_BALANCE : balanceInfo && balanceInfo.customerBalance,
    merchantBalance: balanceInfo && (balanceInfo.MERCHANT_BALANCE != null || balanceInfo.merchantBalance != null) ? (balanceInfo.MERCHANT_BALANCE ?? balanceInfo.merchantBalance) : 0
  });
}

// direction -> API type: incoming = 2, outgoing = 1
function directionToType(direction) {
  const d = (direction || '').toLowerCase();
  if (d === 'outgoing') return '1';
  return '2'; // default incoming
}

/**
 * GET /history?apiKey=xxx&page=1&direction=incoming
 * direction=incoming (default) or outgoing. Optional for= (userId, GSM, or secret code), gsm= (legacy), status=, channelName=, sortType=, search=.
 */
async function history(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const forParam = req.query.for;
  const gsm = req.query.gsm;
  const user = forParam != null && forParam !== ''
    ? resolveUserFrom(acc, forParam)
    : resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'for (userId, GSM, or secret code) not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const pageNumber = req.query.page || req.query.pageNumber || '1';
  const direction = req.query.direction || 'incoming';
  const type = directionToType(direction);
  const status = req.query.status || '2';
  const channelName = req.query.channelName || '4';
  const sortType = req.query.sortType || '1';
  const searchGsmOrSecret = req.query.search || req.query.searchGsmOrSecret || '';
  const result = await syriatel.customerHistory(user.userId, user.userKey, acc.device, {
    pageNumber,
    type,
    status,
    channelName,
    sortType,
    searchGsmOrSecret
  });
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  const list = (result.data && result.data.data) || [];
  return res.status(200).json({
    success: true,
    page: pageNumber,
    direction,
    transactions: list
  });
}

/**
 * GET /transaction?apiKey=xxx&transactionId=600402514192&direction=incoming
 * Optional direction=incoming (default) or outgoing to search in that history only; omit to search both.
 * Optional for= (userId, GSM, or secret code) or gsm= (legacy) for a specific line.
 */
async function transaction(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const forParam = req.query.for;
  const gsm = req.query.gsm;
  const user = forParam != null && forParam !== ''
    ? resolveUserFrom(acc, forParam)
    : resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'for (userId, GSM, or secret code) not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const transactionId = req.query.transactionId || req.query.transactionNo;
  if (!transactionId) {
    return res.status(400).json({ error: 'missing transactionId' });
  }
  const direction = req.query.direction;
  const typesToSearch = direction !== undefined && direction !== ''
    ? [directionToType(direction)]
    : ['1', '2'];
  const opts = { status: '2', channelName: '4', sortType: '1', searchGsmOrSecret: '' };
  for (const type of typesToSearch) {
    let page = 1;
    const maxPages = 10;
    for (let i = 0; i < maxPages; i++) {
      const result = await syriatel.customerHistory(user.userId, user.userKey, acc.device, {
        ...opts,
        pageNumber: String(page),
        type
      });
      if (result.code !== '1') {
        return res.status(200).json({ success: false, code: result.code, message: result.message });
      }
      const list = (result.data && result.data.data) || [];
      const found = list.find(t => (t.transactionNo || t.transaction_no) === transactionId);
      if (found) {
        return res.status(200).json({ success: true, transaction: found });
      }
      if (list.length === 0) break;
      page++;
    }
  }
  return res.status(200).json({ success: false, message: 'Transaction not found' });
}

/**
 * GET /transfer?apiKey=xxx&pin=0000&to=0990210184&amount=100
 * Optional from= (userId, GSM, or secret code) to transfer from a specific line; omit for main/default.
 * Optional gsm= (legacy) same as from=gsm. to = GSM or secret code.
 */
async function transfer(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const from = req.query.from;
  const gsm = req.query.gsm;
  const user = from != null && from !== ''
    ? resolveUserFrom(acc, from)
    : resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'from (userId, GSM, or secret code) not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const pin = req.query.pin || req.query.pinCode;
  const to = req.query.to;
  const amount = req.query.amount;
  if (!pin || !to || !amount) {
    return res.status(400).json({ error: 'missing pin, to (GSM or code), or amount' });
  }
  const amountNum = parseFloat(amount);
  if (isNaN(amountNum) || amountNum <= 0) {
    return res.status(400).json({ error: 'invalid amount' });
  }

  const dedupeKey = `${user.userId}:${to}:${amountNum}`;

  const recent = recentTransfers.get(dedupeKey);
  if (recent && Date.now() - recent.ts < DEDUP_WINDOW_MS) {
    console.log('[Transfer] blocked duplicate – identical transfer completed', Date.now() - recent.ts, 'ms ago');
    return res.status(200).json({
      success: true,
      duplicate: true,
      message: recent.result.message || 'Transfer already completed (duplicate request blocked)'
    });
  }

  if (transfersInFlight.has(dedupeKey)) {
    console.log('[Transfer] blocked duplicate – identical transfer already in flight');
    return res.status(409).json({
      success: false,
      message: 'An identical transfer is already in progress. Please wait for it to complete.'
    });
  }

  transfersInFlight.set(dedupeKey, Date.now());

  try {
    const apiKeyShort = req.query.apiKey ? req.query.apiKey.slice(-8) : '?';
    console.log('[Transfer] request', { to, amount: amountNum, userId: user.userId, from: from || gsm || 'default', apiKey: '...' + apiKeyShort });

    const check = await syriatel.checkCustomer(user.userId, user.userKey, to, String(amountNum), acc.device);
    console.log('[Transfer] checkCustomer response', { code: check.code, message: check.message, data: check.data });
    if (check.code !== '1' || !check.data || !check.data.data) {
      console.log('[Transfer] checkCustomer failed – not calling transfer');
      return res.status(200).json({
        success: false,
        code: check.code,
        message: check.message || 'Check customer failed'
      });
    }
    const fee = parseFloat(check.data.data.feeAmount || check.data.data.fee || 0) || 0;
    const billcode = check.data.data.billcode || check.data.data.billCode || '';
    // Use checkCustomer response's resolved recipient (customerCodeOrGSM or customerGSM) as toGSM for transfer
    const toGSM = check.data.data.customerCodeOrGSM || check.data.data.customerGSM || to;
    console.log('[Transfer] checkCustomer ok', { fee, billcode, customerCodeOrGSM: check.data.data.customerCodeOrGSM, customerGSM: check.data.data.customerGSM, toGSM });

    const result = await syriatel.transfer(
      user.userId,
      user.userKey,
      pin,
      toGSM,
      toGSM,
      amountNum,
      fee,
      billcode,
      acc.device
    );
    console.log('[Transfer] transfer API response', { code: result.code, message: result.message, data: result.data });
    const transferSuccess = result && (result.code === '1' || result.code === 1);
    if (transferSuccess) {
      recentTransfers.set(dedupeKey, { result, ts: Date.now() });
      return res.status(200).json({
        success: true,
        message: result.message || 'Transfer done'
      });
    }

    if (result && result.uncertain) {
      recentTransfers.set(dedupeKey, { result, ts: Date.now() });
      return res.status(200).json({
        success: false,
        uncertain: true,
        code: result.code,
        message: result.message
      });
    }

    console.log('[Transfer] transfer failed');
    return res.status(200).json({
      success: false,
      code: result?.code,
      message: result?.message
    });
  } finally {
    transfersInFlight.delete(dedupeKey);
  }
}

function mapAccountDataToGsms(accountData) {
  return ensureAccountDataArray(accountData).map(a => ({
    gsm: a.gsm,
    user_ID: a.user_ID || a.userId,
    userKey: a.userKey || a.user_KEY,
    account_ID: a.account_ID,
    post_OR_PRE: a.post_OR_PRE,
    gsm_TARIFF_PROFILE: a.gsm_TARIFF_PROFILE,
    secretCode: a.secretCode != null ? a.secretCode : a.secret_code
  }));
}

/**
 * GET /gsms?apiKey=xxx
 * List of GSMs (phone numbers) attached to this account.
 * First tries to refresh from Syriatel via signin (using stored gsm+password); on failure, returns stored data.
 */
async function gsms(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;

  const gsm = acc.gsm;
  const password = acc.password;
  const device = acc.device;

  if (gsm && password && device) {
    try {
      const result = await syriatel.signIn(gsm, password, device);
      const code = result.code;
      const data = result.data && result.data.data;

      if (code === '1' && data && data.accountData && data.accountData.length && data.NEW_DEVICE !== '1') {
        const accountData = data.accountData;
        const first = accountData[0];
        const userKey = first.userKey || first.user_KEY;
        const userId = first.user_ID || first.userId;

        const accountDataWithSecretCodes = await fetchSecretCodesForAccountData(accountData, device);

        await store.set(acc.apiKey, {
          gsm: acc.gsm,
          password,
          accountId: data.accountId,
          userId,
          userKey,
          accountData: accountDataWithSecretCodes,
          device
        });
        syriatel.setToken(data.accountId, device, userKey).catch(() => {});

        return res.status(200).json({
          success: true,
          gsms: mapAccountDataToGsms(accountDataWithSecretCodes)
        });
      }
    } catch (err) {
      console.warn('[gsms] Signin refresh failed, using stored data:', err.message);
    }
  }

  const list = mapAccountDataToGsms(acc.accountData);
  return res.status(200).json({
    success: true,
    gsms: list
  });
}

/**
 * GET /accounts
 * List all linked accounts (apiKey, gsm, accountId) from DB.
 */
async function accounts(req, res) {
  const list = await store.list();
  return res.status(200).json({
    success: true,
    accounts: list
  });
}

/**
 * GET /checkGsm?gsm=09xxxxxxxx
 * Check if GSM is registered (no login). Returns code: 1=register, -2=sign in, -3=verification.
 */
async function checkGsm(req, res) {
  const gsm = req.query.gsm;
  if (!gsm) {
    return res.status(400).json({ error: 'missing gsm' });
  }
  const device = getDeviceForRequest(gsm);
  const result = await syriatel.checkGSM(gsm, device);
  return res.status(200).json({
    success: result.code === '1',
    code: result.code,
    message: result.message,
    data: result.data && result.data.data
  });
}

/**
 * GET /accountInfo?apiKey=xxx
 * Optional gsm= for a specific line. Full account status: balance, PIN, features.
 */
async function accountInfo(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const gsm = req.query.gsm;
  const user = resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'gsm not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const firstUse = req.query.firstUse || '1';
  const result = await syriatel.checkAccountRefreshBalance(user.userId, user.userKey, acc.device, firstUse);
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  const data = result.data && result.data.data;
  const list = Array.isArray(data) ? data : (data && data.data ? data.data : []);
  const single = list.length === 1 ? list[0] : list;
  return res.status(200).json({
    success: true,
    accountInfo: single
  });
}

/**
 * GET /historyTypes?apiKey=xxx
 * Optional gsm= for a specific line.
 */
async function historyTypes(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const gsm = req.query.gsm;
  const user = resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'gsm not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const result = await syriatel.getHistoryTypes(user.userId, user.userKey, acc.device);
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  const list = (result.data && result.data.data) || [];
  return res.status(200).json({
    success: true,
    historyTypes: list
  });
}

/**
 * GET /usage?apiKey=xxx
 * Optional gsm= for a specific line. Usage summary from new-fapi.
 */
async function usage(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const gsm = req.query.gsm;
  const user = resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'gsm not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const result = await syriatel.getUsage(user.userId, user.userKey, acc.device);
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  return res.status(200).json({
    success: true,
    data: result.data && result.data.data
  });
}

/**
 * GET /secretCode?apiKey=xxx
 * Optional for= (gsm or userId) or gsm= (legacy) to get secret code for that line. Returns Syriatel Cash secret code (for receiving by code).
 */
async function secretCodeRoute(req, res) {
  const acc = await getAccountOrFail(req, res);
  if (!acc) return;
  const forParam = req.query.for;
  const gsm = req.query.gsm;
  const user = forParam != null && forParam !== ''
    ? resolveUserFrom(acc, forParam)
    : resolveUser(acc, gsm);
  if (!user) {
    return res.status(400).json({ error: 'for (userId, GSM, or secret code) not found in this account. Use GET /gsms?apiKey=... to list GSMs.' });
  }
  const result = await syriatel.secretCode(user.userId, user.userKey, acc.device);
  if (result.code !== '1') {
    return res.status(200).json({
      success: false,
      code: result.code,
      message: result.message
    });
  }
  const data = result.data;
  const code = (data && data.secretCode != null) ? data.secretCode : (data && data.data && (data.data.secretCode != null ? data.data.secretCode : data.data.secret_code));
  return res.status(200).json({
    success: true,
    secretCode: code
  });
}

module.exports = {
  signin: wrap(signin),
  otp: wrap(otp),
  resendOtp: wrap(resendOtp),
  balance: wrap(balance),
  history: wrap(history),
  transaction: wrap(transaction),
  transfer: wrap(transfer),
  gsms: wrap(gsms),
  accounts: wrap(accounts),
  checkGsm: wrap(checkGsm),
  accountInfo: wrap(accountInfo),
  historyTypes: wrap(historyTypes),
  usage: wrap(usage),
  secretCode: wrap(secretCodeRoute)
};
