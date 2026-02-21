/**
 * Verify our hash.js produces the same hashes as syriatel_api_calls.js for the same payloads.
 * Run: node scripts/verify-hash.js
 *
 * Captured device (same for all): appVersion 5.6.0, samsung, SM-S931B, Android+v15,
 * deviceId ffffffff-ffac-e209-ffff-ffffef05ac4a, lang 1
 *
 * userKey for userId 4359406 (from SIGN_IN3 response): 0E6F9870-533A-715C-E063-8917FD0A0B44
 * userKey for userId 5885941: 3566080F-EF8B-5F49-E063-8917FD0AAA9E
 */

const { hashC2, hashH2, buildSalt, buildSaltCash } = require('../src/hash');

const DEVICE = {
  appVersion: '5.6.0',
  mobileManufaturer: 'samsung',
  mobileModel: 'SM-S931B',
  systemVersion: 'Android+v15',
  deviceId: 'ffffffff-ffac-e209-ffff-ffffef05ac4a',
  lang: '1'
};

const USER_KEY_4359406 = '0E6F9870-533A-715C-E063-8917FD0A0B44';
const USER_KEY_5885941 = '3566080F-EF8B-5F49-E063-8917FD0AAA9E';

function test(name, expected, computed) {
  const ok = expected.toLowerCase() === computed.toLowerCase();
  console.log(ok ? '  OK' : '  FAIL', name);
  if (!ok) {
    console.log('    expected:', expected);
    console.log('    got:     ', computed);
  }
  return ok;
}

let passed = 0;
let failed = 0;

console.log('\n--- Auth (new-fapi) ---\n');

// SIGN_IN3: APK m12583o5 uses h2 [privateKey, gsm, salt, password, "1"]
const signInHash = hashH2('0', ['0986121503', 'Jafar@773050', '1'], DEVICE);
if (test('SIGN_IN3 (h2: gsm, password, 1)', 'fac31b4cbe5acd3d5d1b3fe45c9e0b7d9c9bb141ad22bc830f959498a8f4a144', signInHash)) passed++; else failed++;

// LOGIN_RESEND_CODE: h2 [0, gsm, salt]
const resendHash = hashH2('0', ['0986121503'], DEVICE);
if (test('LOGIN_RESEND_CODE (h2: gsm)', 'f202fc49d21bfd84ff92d145e57a8bfe812f6ea2b5591a3a08d0c54c9ba3a462', resendHash)) passed++; else failed++;

// LOGIN_CODE_VERIFY: h2 [privateKey, code, salt, gsm]
const verifyHash1 = hashH2('0', ['148952', '0986121503'], DEVICE);
if (test('LOGIN_CODE_VERIFY code=148952 (h2: code, gsm)', '6cf995ac8364d4ef7181cd3250c7c368a88f27c1489c7797b160fdb5b62e276b', verifyHash1)) passed++; else failed++;

const verifyHash2 = hashH2('0', ['148942', '0986121503'], DEVICE);
if (test('LOGIN_CODE_VERIFY code=148942 (h2)', 'e406fa734d3c7d917f9b3e02dea4bcc7839f41ebf6fcc7d58ae355bd19d2e078', verifyHash2)) passed++; else failed++;

console.log('\n--- Cash API (userKey = 0E6F9870-533A-715C-E063-8917FD0A0B44) ---\n');

// refresh_balance / secretCode / getHistoryTypes: h2(userKey, [userId])
const refreshHash = hashH2(USER_KEY_4359406, ['4359406'], DEVICE);
if (test('refresh_balance (h2: userKey, userId, salt)', '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def', refreshHash)) passed++; else failed++;

// checkAccountRefreshBalance: h2(userKey, [userId, firstUse])
const checkAccHash = hashH2(USER_KEY_4359406, ['4359406', '1'], DEVICE);
if (test('checkAccountRefreshBalance userId=4359406 firstUse=1 (h2)', 'ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd', checkAccHash)) passed++; else failed++;

const checkAccHash2 = hashH2(USER_KEY_5885941, ['5885941', '1'], DEVICE);
if (test('checkAccountRefreshBalance userId=5885941 firstUse=1 (h2)', 'cb0a2e9ef44f04d5b2c7680da9bf9016d50697a9dc9662476f84fbe32bf59944', checkAccHash2)) passed++; else failed++;

// pinCode/check: c2(userKey, [userId, pinCode])
const pinHash = hashC2(USER_KEY_4359406, ['4359406', '0000'], DEVICE);
if (test('pinCode/check (c2: userKey, userId, pinCode, salt)', '5911873577e12abb7ec781ecc46a35b8ee2a449bf454d575456b47ba507565d2', pinHash)) passed++; else failed++;

// checkCustomer: c2(userKey, [userId, customerCodeOrGSM, transactAmount])
const checkCustHash = hashC2(USER_KEY_4359406, ['4359406', '0990210184', '100'], DEVICE);
if (test('checkCustomer (c2: userId, customerCodeOrGSM, transactAmount)', '87d05250ed5b8d03c200e4f73bbafa7c9b42ea9693c9ccb9c30c6df446e018e6', checkCustHash)) passed++; else failed++;

// transfer: c2(userKey, [userId, pinCode, secretCodeOrGSM, toGSM, fee, billcode, amount]) – 7 params, no feeOnMerchant (APK m12504e6)
const transferHash = hashC2(USER_KEY_4359406, ['4359406', '0000', '0990210184', '0990210184', '1.5', 'W9F', '100'], DEVICE);
if (test('transfer (c2: userId, pin, secretCodeOrGSM, toGSM, fee, billcode, amount)', '63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6', transferHash)) passed++; else failed++;

// customerHistory: c2(userKey, [userId, pageNumber, type, searchGsmOrSecret, status, channelName, sortType])
const historyHash1 = hashC2(USER_KEY_4359406, ['4359406', '1', '2', '', '2', '4', '1'], DEVICE);
if (test('customerHistory page=1 (c2)', '15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0', historyHash1)) passed++; else failed++;

const historyHash2 = hashC2(USER_KEY_4359406, ['4359406', '2', '2', '', '2', '4', '1'], DEVICE);
if (test('customerHistory page=2 (c2)', 'ce64fa82ffe1a93fcab5538a43e095355af5521653e97a9ddc871cda20be2553', historyHash2)) passed++; else failed++;

console.log('\n--- Summary ---');
console.log('Passed:', passed, ' Failed:', failed);
if (failed > 0) {
  console.log('\nSalt used (buildSalt):', buildSalt(DEVICE));
  process.exit(1);
}
console.log('\nAll hashes match syriatel_api_calls.js payloads.\n');
