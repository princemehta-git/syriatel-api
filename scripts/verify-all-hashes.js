/**
 * Verify all default/captured hashes: compute hash with APK-matching params and compare to constants.js.
 * Run: node scripts/verify-all-hashes.js
 *
 * APK reference: C2937m.java – c2 = m12484c2([...]), h2 = m12524h2([...]); both use same Hashing2 (PREFIX+concat+SUFFIX).
 */

const { hashC2, hashH2, hashE2 } = require('../src/hash');
const { CAPTURED_HASHES, CAPTURED_SETTOKEN_TOKEN } = require('../src/constants');

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
  const ok = expected && computed && expected.toLowerCase() === computed.toLowerCase();
  console.log(ok ? '  OK ' : '  FAIL', name);
  if (!ok && expected) {
    console.log('    expected:', expected);
    console.log('    got:     ', computed || '(undefined)');
  }
  return ok;
}

let passed = 0;
let failed = 0;

// --- Auth (new-fapi) – APK uses h2 for sign-in and resend; verify uses h2 [code, gsm] ---
console.log('\n--- Auth (new-fapi) ---\n');
// SIGN_IN3: APK m12583o5 uses h2 [privateKey, gsm, salt, password, "1"]
const signInHash = hashH2('0', ['0986121503', 'Jafar@773050', '1'], DEVICE);
if (test('SIGN_IN3 (h2: gsm, password, 1)', CAPTURED_HASHES.SIGN_IN3, signInHash)) passed++; else failed++;

// LOGIN_RESEND_CODE: APK h2 [0, gsm, salt]
const resendHash = hashH2('0', ['0986121503'], DEVICE);
if (test('LOGIN_RESEND_CODE (h2: gsm)', CAPTURED_HASHES.LOGIN_RESEND_CODE, resendHash)) passed++; else failed++;

// LOGIN_CODE_VERIFY: try h2 [code, gsm] -> [0, code, salt, gsm] (auth pattern)
const verifyHashH2 = hashH2('0', ['148952', '0986121503'], DEVICE);
const verifyHashC2 = hashC2('0', ['148952', '0986121503'], DEVICE);
if (test('LOGIN_CODE_VERIFY (h2: code, gsm)', CAPTURED_HASHES.LOGIN_CODE_VERIFY, verifyHashH2)) {
  passed++;
} else if (test('LOGIN_CODE_VERIFY (c2: code, gsm)', CAPTURED_HASHES.LOGIN_CODE_VERIFY, verifyHashC2)) {
  passed++;
} else {
  failed++;
  console.log('    expected:', CAPTURED_HASHES.LOGIN_CODE_VERIFY);
  console.log('    h2 got:  ', verifyHashH2);
  console.log('    c2 got:  ', verifyHashC2);
}

// --- setToken: APK m12575n5 uses e2 [userKey, accountId, token, "2", salt] ---
console.log('\n--- setToken ---\n');
const setTokenHash = hashE2(USER_KEY_4359406, ['4359406', CAPTURED_SETTOKEN_TOKEN, '2'], DEVICE);
if (test('setToken (e2: userKey, accountId, token, 2)', CAPTURED_HASHES.setToken, setTokenHash)) passed++; else failed++;

// --- Cash: refresh_balance – APK h2 [userKey, userId, salt] ---
console.log('\n--- Cash: refresh_balance (h2 [userId]) ---\n');
const refreshHash = hashH2(USER_KEY_4359406, ['4359406'], DEVICE);
const refreshExpected = Array.isArray(CAPTURED_HASHES.refresh_balance) ? CAPTURED_HASHES.refresh_balance[1] : CAPTURED_HASHES.refresh_balance;
if (test('refresh_balance', refreshExpected, refreshHash)) passed++; else failed++;

// --- checkAccountRefreshBalance – APK h2 [userKey, userId, firstUse, salt] ---
console.log('\n--- checkAccountRefreshBalance (h2 [userId, firstUse]) ---\n');
const checkAccHash = hashH2(USER_KEY_4359406, ['4359406', '1'], DEVICE);
if (test('checkAccountRefreshBalance 4359406', CAPTURED_HASHES.checkAccountRefreshBalance, checkAccHash)) passed++; else failed++;
const checkAccHash2 = hashH2(USER_KEY_5885941, ['5885941', '1'], DEVICE);
if (test('checkAccountRefreshBalance 5885941', 'cb0a2e9ef44f04d5b2c7680da9bf9016d50697a9dc9662476f84fbe32bf59944', checkAccHash2)) passed++; else failed++;

// --- getUsage – APK h2 [userKey, userId, salt] ---
console.log('\n--- getUsage (h2 [userId]) ---\n');
const getUsageHash = hashH2(USER_KEY_4359406, ['4359406'], DEVICE);
if (test('getUsage', CAPTURED_HASHES.getUsage, getUsageHash)) passed++; else failed++;

// --- getHistoryTypes – APK h2 [userKey, userId, salt] ---
console.log('\n--- getHistoryTypes (h2 [userId]) ---\n');
const getHistoryTypesHash = hashH2(USER_KEY_4359406, ['4359406'], DEVICE);
if (test('getHistoryTypes', CAPTURED_HASHES.getHistoryTypes, getHistoryTypesHash)) passed++; else failed++;

// --- customerHistory – APK m12539j1 c2 [userId, pageNumber, type, searchGsmOrSecret, status, channelName, sortType] ---
console.log('\n--- customerHistory (c2 [userId, pageNumber, type, searchGsmOrSecret, status, channelName, sortType]) ---\n');
const historyHash1 = hashC2(USER_KEY_4359406, ['4359406', '1', '2', '', '2', '4', '1'], DEVICE);
if (test('customerHistory page=1 type=2', CAPTURED_HASHES.customerHistory, historyHash1)) passed++; else failed++;
const historyHash2 = hashC2(USER_KEY_4359406, ['4359406', '2', '2', '', '2', '4', '1'], DEVICE);
const historyIncomingExpected = Array.isArray(CAPTURED_HASHES.customerHistory_incoming) ? CAPTURED_HASHES.customerHistory_incoming[0] : CAPTURED_HASHES.customerHistory_incoming;
if (test('customerHistory_incoming page=2', historyIncomingExpected, historyHash2)) passed++; else failed++;
const historyOutgoingHash = hashC2(USER_KEY_4359406, ['4359406', '1', '1', '', '2', '4', '1'], DEVICE);
const historyOutgoingExpected = Array.isArray(CAPTURED_HASHES.customerHistory_outgoing) ? CAPTURED_HASHES.customerHistory_outgoing[0] : CAPTURED_HASHES.customerHistory_outgoing;
if (test('customerHistory_outgoing page=1 type=1', historyOutgoingExpected, historyOutgoingHash)) passed++; else failed++;

// --- pinCodeCheck – APK c2 [userKey, userId, pinCode, salt] ---
console.log('\n--- pinCodeCheck (c2 [userId, pinCode]) ---\n');
const pinHash = hashC2(USER_KEY_4359406, ['4359406', '0000'], DEVICE);
if (test('pinCodeCheck', CAPTURED_HASHES.pinCodeCheck, pinHash)) passed++; else failed++;

// --- secretCode – APK h2 [userKey, userId, salt] ---
console.log('\n--- secretCode (h2 [userId]) ---\n');
const secretCodeHash = hashH2(USER_KEY_4359406, ['4359406'], DEVICE);
if (test('secretCode', CAPTURED_HASHES.secretCode, secretCodeHash)) passed++; else failed++;

// --- checkCustomer – APK m12340I0 c2 [userId, customerCodeOrGSM, transactAmount] ---
console.log('\n--- checkCustomer (c2 [userId, customerCodeOrGSM, transactAmount]) ---\n');
const checkCust100 = hashC2(USER_KEY_4359406, ['4359406', '0990210184', '100'], DEVICE);
if (test('checkCustomer amount=100', '87d05250ed5b8d03c200e4f73bbafa7c9b42ea9693c9ccb9c30c6df446e018e6', checkCust100)) passed++; else failed++;
for (const [amount, expected] of [['10', '5178df3d8764cd6f98260410e9f275c7a5fde1cfc5b1a024dd6571d215528059'], ['50', '3ee535327e68f312f311f501c3ea8f846a054eff14badfab586e5403468eb1d8']]) {
  const h = hashC2(USER_KEY_4359406, ['4359406', '0990210184', amount], DEVICE);
  if (test(`checkCustomer amount=${amount}`, expected, h)) passed++; else failed++;
}

// --- transfer – APK m12504e6 c2 [userId, pinCode, secretCodeOrGSM, toGSM, fee, billcode, amount] (7 params) ---
console.log('\n--- transfer (c2 [userId, pinCode, secretCodeOrGSM, toGSM, fee, billcode, amount]) ---\n');
const transferHash = hashC2(USER_KEY_4359406, ['4359406', '0000', '0990210184', '0990210184', '1.5', 'W9F', '100'], DEVICE);
const transferExpected = CAPTURED_HASHES.transfer || '63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6';
if (test('transfer', transferExpected, transferHash)) passed++; else failed++;

console.log('\n--- Summary ---');
console.log('Passed:', passed, ' Failed:', failed);
if (failed > 0) console.log('Note: Auth/setToken failures may be from different app build; all cash hashes above should be OK.');
process.exit(failed > 0 ? 1 : 0);
