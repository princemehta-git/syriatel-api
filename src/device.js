/**
 * Generate a realistic dummy device payload for Syriatel API (per account).
 * Same shape as the app: appVersion, mobileManufaturer, mobileModel, systemVersion, deviceId, lang.
 *
 * When USE_DYNAMIC_DEVICES is false (default), all requests use the fixed capture device
 * (same as syriatel_api_calls.js). When true, returns a deterministic device from seed (apiKey/gsm).
 */

const USE_DYNAMIC_DEVICES = process.env.USE_DYNAMIC_DEVICES === '1' ||
  process.env.USE_DYNAMIC_DEVICES === 'true' ||
  process.env.USE_DYNAMIC_DEVICES === 'yes';

/**
 * Default device from syriatel_api_calls.js – used when USE_DYNAMIC_DEVICES is false.
 */
const CAPTURE_DEVICE = Object.freeze({
  appVersion: '5.6.0',
  mobileManufaturer: 'samsung',
  mobileModel: 'SM-S931B',
  systemVersion: 'Android+v15',
  deviceId: 'ffffffff-ffac-e209-ffff-ffffef05ac4a',
  lang: '1'
});

/**
 * Return device for a request. If USE_DYNAMIC_DEVICES is true, returns a deterministic device
 * from seed (apiKey or gsm). Otherwise returns the fixed capture device.
 */
function getDeviceForRequest(seed) {
  if (USE_DYNAMIC_DEVICES) {
    return generateDevice(seed);
  }
  return { ...CAPTURE_DEVICE };
}

const MODELS = [
  'SM-S931B', 'SM-G998B', 'SM-A536B', 'SM-N986B', 'Pixel 8 Pro', 'Pixel 7',
  'Redmi Note 12', 'M2101K6G', 'CPH2305', 'V2134', '2201116SG'
];
const MANUFACTURERS = ['samsung', 'Google', 'Xiaomi', 'OPPO', 'vivo', 'HUAWEI', 'OnePlus'];
const ANDROID_VERSIONS = ['14', '15', '13'];

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex(len) {
  let s = '';
  const hex = '0123456789abcdef';
  for (let i = 0; i < len; i++) s += hex[Math.floor(Math.random() * 16)];
  return s;
}

/**
 * Generate a UUID-like device ID (same format as captured: ffffffff-ffac-e209-ffff-ffffef05ac4a).
 */
function generateDeviceId() {
  return [
    randomHex(8),
    randomHex(4),
    randomHex(4),
    randomHex(4),
    randomHex(12)
  ].join('-');
}

function deterministicHex(seed, length) {
  const crypto = require('crypto');
  let h = crypto.createHash('sha256').update(seed, 'utf8').digest('hex');
  let out = '';
  for (let i = 0; out.length < length; i++) {
    h = crypto.createHash('sha256').update(h + i, 'utf8').digest('hex');
    out += h.slice(0, length - out.length);
  }
  return out.slice(0, length);
}

/**
 * Create one deterministic device from a seed (e.g. uniqueId) so the same account always gets the same device.
 */
function generateDevice(seed) {
  const s = typeof seed === 'string' ? seed : String(seed);
  const n = s.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rng = (i) => (n * (i + 1) * 2654435761) >>> 0;
  const pick = (arr) => arr[rng(arr.length) % arr.length];
  const deviceId = [
    deterministicHex(s + 'a', 8),
    deterministicHex(s + 'b', 4),
    deterministicHex(s + 'c', 4),
    deterministicHex(s + 'd', 4),
    deterministicHex(s + 'e', 12)
  ].join('-');

  return {
    appVersion: '5.6.0',
    mobileManufaturer: pick(MANUFACTURERS),
    mobileModel: pick(MODELS),
    systemVersion: `Android+v${pick(ANDROID_VERSIONS)}`,
    deviceId,
    lang: '1'
  };
}

/**
 * User-Agent string matching the app.
 */
function getUserAgent(device) {
  const model = device.mobileModel || 'SM-S931B';
  const release = (device.systemVersion || 'Android+v15').replace('Android+v', '');
  return `Dalvik/2.1.0 (Linux; U; Android ${release}; ${model} Build/AP3A.240905.015.A2)`;
}

module.exports = {
  CAPTURE_DEVICE,
  getDeviceForRequest,
  generateDeviceId,
  generateDevice,
  getUserAgent
};
