/**
 * Test that hash.js produces the expected checkCustomer and transfer hashes (same formula in real code).
 * Run: node scripts/test-checkcustomer-hash.js
 */

const { hashC2 } = require('../src/hash');

const USER_KEY = '0E6F9870-533A-715C-E063-8917FD0A0B44';
const USER_ID = '4359406';
const CUSTOMER_GSM = '0990210184';
const DEVICE = {
  appVersion: '5.6.0',
  mobileManufaturer: 'samsung',
  mobileModel: 'SM-S931B',
  systemVersion: 'Android+v15',
  deviceId: 'ffffffff-ffac-e209-ffff-ffffef05ac4a',
  lang: '1'
};

function test(name, expected, got) {
  const ok = got.toLowerCase() === expected.toLowerCase();
  console.log(ok ? '  OK ' : '  FAIL', name);
  if (!ok) {
    console.log('    expected:', expected);
    console.log('    got:     ', got);
  }
  return ok;
}

let passed = 0;
let failed = 0;

console.log('--- checkCustomer (c2: userId, customerCodeOrGSM, transactAmount) ---\n');

const checkCustomerExpected = [
  { amount: '10', hash: '5178df3d8764cd6f98260410e9f275c7a5fde1cfc5b1a024dd6571d215528059' },
  { amount: '20', hash: '3bcbffeed2ca0b8b7d787e0ca18f89f578092fa88a17fda75f0356af28e9068d' },
  { amount: '30', hash: 'e6a48a786f1b251be5ce7923d42b8a32defd7c8fcccdb6009a7ea2b22fbd8f7e' },
  { amount: '40', hash: '5639139d4d9490e9e240c19f1f1de4446f08c482f50724c95ab643d37a6f0b2b' },
  { amount: '50', hash: '3ee535327e68f312f311f501c3ea8f846a054eff14badfab586e5403468eb1d8' }
];

for (const { amount, hash: expected } of checkCustomerExpected) {
  const got = hashC2(USER_KEY, [USER_ID, CUSTOMER_GSM, amount], DEVICE);
  if (test(`checkCustomer amount ${amount}`, expected, got)) passed++; else failed++;
}

console.log('\n--- transfer (c2: userId, pinCode, secretCodeOrGSM, toGSM, fee, billcode, amount) ---\n');

const transferHash = hashC2(USER_KEY, ['4359406', '0000', '0990210184', '0990210184', '1.5', 'W9F', '100'], DEVICE);
if (test('transfer userId=4359406 pin=0000 to=0990210184 fee=1.5 billcode=W9F amount=100', '63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6', transferHash)) passed++; else failed++;

console.log('\n' + (failed === 0 ? 'All checkCustomer and transfer hashes match.' : `Failed: ${failed}`));
process.exit(failed === 0 ? 0 : 1);
