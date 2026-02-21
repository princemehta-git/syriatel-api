/**
 * Syriatel request hash – reverse‑engineered from APK (ConnectionHash.Hashing2).
 * Input: [privateKey, param1, param2, ..., salt] or [privateKey, param0, salt, param1, ...] (h2 style).
 * Output: 64-char hex (SHA‑256). Server verifies; wrong hash => rejected.
 */

const crypto = require('crypto');

/**
 * Build salt string (same as APK m12553l).
 * Used for: new-fapi (auth, getUsage, etc.) and cash-api when using userKey.
 */
function buildSalt(device) {
  const {
    appVersion = '5.6.0',
    systemVersion = 'Android+v15',
    mobileManufaturer = 'samsung',
    mobileModel = 'SM-S931B',
    deviceId,
    lang = '1'
  } = device;
  const release = (systemVersion || '').replace('Android+v', '').trim() || '15';
  return `${appVersion}Android+v${release}${mobileManufaturer}${mobileModel}${deviceId || ''}${lang}`;
}

/**
 * Build salt for accountId-based hashes (APK m12561m – "Androidv" no plus).
 */
function buildSaltCash(device) {
  const {
    appVersion = '5.6.0',
    systemVersion = 'Android+v15',
    mobileManufaturer = 'samsung',
    mobileModel = 'SM-S931B',
    deviceId,
    lang = '1'
  } = device;
  const ver = (systemVersion || '').replace('Android+v', '').replace('Androidv', '').trim() || '15';
  return `${appVersion}Androidv${ver}${mobileManufaturer}${mobileModel}${deviceId || ''}${lang}`;
}

/**
 * Secret prefix/suffix from libhashing.so (reversed from INIT / Hashing2).
 * Input to SHA256 = PREFIX + concat(array) + SUFFIX.
 */
const HASH_PREFIX = '6KGdVEX9JpAc2meL';
const HASH_SUFFIX = 'SgNQu4qw7B8f3bhU';

/**
 * Hashing2: same as native lib – PREFIX + concat(array) + SUFFIX, then SHA‑256 hex.
 */
function hashing2(arr) {
  const str = HASH_PREFIX + arr.join('') + HASH_SUFFIX;
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

/**
 * HMAC-SHA256: key = privateKey, message = rest of array joined.
 */
function hmacHashing2(privateKey, restArr) {
  const message = (Array.isArray(restArr) ? restArr.join('') : restArr);
  return crypto.createHmac('sha256', privateKey).update(message, 'utf8').digest('hex');
}

/**
 * Hash for endpoints using m12484c2: [privateKey, p1, p2, ..., pn, salt].
 * Used for: transfer, customerHistory, pinCode/check, checkCustomer, etc.
 */
function hashC2(privateKey, params, device) {
  const salt = buildSalt(device);
  const arr = [privateKey, ...params, salt];
  return hashing2(arr);
}

/**
 * HMAC variant for c2: key = privateKey, message = params + salt.
 */
function hashC2Hmac(privateKey, params, device) {
  const salt = buildSalt(device);
  return hmacHashing2(privateKey, [...params, salt]);
}

/**
 * Hash for endpoints using m12524h2: [privateKey, param0, salt, param1, param2, ...].
 * Used for: SIGN_IN3, LOGIN_CODE_VERIFY, LOGIN_RESEND_CODE, refresh_balance (userId only), secretCode.
 */
function hashH2(privateKey, params, device) {
  if (params.length === 0) {
    const salt = buildSalt(device);
    return hashing2([privateKey, salt]);
  }
  const salt = buildSalt(device);
  const arr = [privateKey, params[0], salt, ...params.slice(1)];
  return hashing2(arr);
}

/**
 * HMAC variant for h2: key = privateKey, message = param0 + salt + rest.
 */
function hashH2Hmac(privateKey, params, device) {
  const salt = buildSalt(device);
  if (params.length === 0) {
    return hmacHashing2(privateKey, [salt]);
  }
  return hmacHashing2(privateKey, [params[0], salt, ...params.slice(1)]);
}

/**
 * Use buildSaltCash (Androidv) instead of buildSalt for c2/h2.
 */
function hashC2Cash(privateKey, params, device) {
  const salt = buildSaltCash(device);
  return hashing2([privateKey, ...params, salt]);
}
function hashH2Cash(privateKey, params, device) {
  const salt = buildSaltCash(device);
  if (params.length === 0) return hashing2([privateKey, salt]);
  return hashing2([privateKey, params[0], salt, ...params.slice(1)]);
}

/**
 * Hash for endpoints using m12500e2: [accountKey, p1, p2, ..., pn, salt] with salt = buildSaltCash (APK m12561m).
 * accountKey = userKey for that account (APK m16524j(accountId)). Used for: setToken, some cash endpoints.
 */
function hashE2(accountKey, params, device) {
  const salt = buildSaltCash(device);
  const arr = [accountKey, ...params, salt];
  return hashing2(arr);
}

const HASH_MODE = process.env.SYRIATEL_HASH_MODE || 'sha256'; // 'sha256' | 'hmac' | 'cash'

function hashC2WithMode(privateKey, params, device) {
  if (HASH_MODE === 'hmac') return hashC2Hmac(privateKey, params, device);
  if (HASH_MODE === 'cash') return hashC2Cash(privateKey, params, device);
  return hashC2(privateKey, params, device);
}
function hashH2WithMode(privateKey, params, device) {
  if (HASH_MODE === 'hmac') return hashH2Hmac(privateKey, params, device);
  if (HASH_MODE === 'cash') return hashH2Cash(privateKey, params, device);
  return hashH2(privateKey, params, device);
}

module.exports = {
  buildSalt,
  buildSaltCash,
  hashing2,
  hmacHashing2,
  hashC2,
  hashC2Hmac,
  hashC2Cash,
  hashE2,
  hashH2,
  hashH2Hmac,
  hashH2Cash,
  hashC2WithMode,
  hashH2WithMode
};
