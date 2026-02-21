/**
 * End-to-end test: sign in → (optional OTP) → setToken → balance.
 * Uses computed hashes (h2 for auth, e2 for setToken). Requires network.
 *
 * Set credentials:
 *   TEST_GSM=0986121503 TEST_PASSWORD=YourPassword node scripts/e2e-login.js
 * Or use defaults from constants (same device as captured hashes).
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const syriatel = require('../src/syriatel');
const { getDeviceForRequest } = require('../src/device');

const GSM = process.env.TEST_GSM || '0986121503';
const PASSWORD = process.env.TEST_PASSWORD || 'Jafar@773050';
const OTP_CODE = process.env.TEST_OTP; // optional: set to complete OTP flow

const device = getDeviceForRequest('e2e-test');

async function main() {
  console.log('E2E: Sign in → setToken → balance\n');
  console.log('GSM:', GSM);
  console.log('DeviceId:', device.deviceId);
  console.log('');

  // 1) Sign in
  let result = await syriatel.signIn(GSM, PASSWORD, device);
  const code = result.code;
  const data = result.data && result.data.data;

  if (code !== '1') {
    console.log('Sign in failed:', result.code, result.message || '');
    process.exit(1);
  }

  const newDevice = data && data.NEW_DEVICE === '1';
  const accountId = data && data.accountId;
  const accountData = data && data.accountData || [];

  if (!accountData.length) {
    console.log('Sign in: no account data');
    process.exit(1);
  }

  const first = accountData[0];
  let userKey = first.userKey || first.user_KEY;
  let userId = first.user_ID || first.userId;
  let accountIdFinal = accountId;

  if (newDevice && !OTP_CODE) {
    console.log('Success: OTP required (NEW_DEVICE=1). Run with TEST_OTP=123456 to complete.');
    process.exit(0);
  }

  if (newDevice && OTP_CODE) {
    result = await syriatel.submitOtp(GSM, OTP_CODE, device);
    if (result.code !== '1' || !result.data || !result.data.data) {
      console.log('OTP verify failed:', result.code, result.message || '');
      process.exit(1);
    }
    const otpData = result.data.data;
    const accData = otpData.accountData || [];
    if (!accData.length) {
      console.log('OTP: no account data');
      process.exit(1);
    }
    const firstOtp = accData[0];
    userKey = firstOtp.userKey || firstOtp.user_KEY;
    userId = firstOtp.user_ID || firstOtp.userId;
    accountIdFinal = otpData.accountId;
  }

  // 2) setToken (e2 with userKey)
  try {
    await syriatel.setToken(accountIdFinal, device, userKey);
    console.log('setToken: OK');
  } catch (e) {
    console.log('setToken (non-fatal):', e.message);
  }

  // 3) Balance
  let balanceRes;
  try {
    balanceRes = await syriatel.refreshBalance(userId, userKey, device);
  } catch (e) {
    console.log('Balance request failed:', e.message);
    process.exit(1);
  }

  const balCode = balanceRes.code;
  const balData = balanceRes.data && balanceRes.data.data;
  if (balCode !== '1' || !balData) {
    console.log('Balance failed:', balanceRes.code, balanceRes.message || '');
    process.exit(1);
  }

  console.log('Balance: OK');
  console.log('AccountId:', accountIdFinal);
  console.log('UserId:', userId);
  if (balData.balance != null) console.log('Balance:', balData.balance);
  if (balData.eWalletBalance != null) console.log('eWalletBalance:', balData.eWalletBalance);
  console.log('\nE2E passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
