/**
 * Brute-force hash variants to match syriatel_api_calls.js.
 * Run: node scripts/find-hash.js
 */

const crypto = require('crypto');

const DEVICE = {
  appVersion: '5.6.0',
  mobileManufaturer: 'samsung',
  mobileModel: 'SM-S931B',
  systemVersion: 'Android+v15',
  deviceId: 'ffffffff-ffac-e209-ffff-ffffef05ac4a',
  lang: '1'
};

const saltBuild = '5.6.0Android+v15samsungSM-S931Bffffffff-ffac-e209-ffff-ffffef05ac4a1';
const saltCash = '5.6.0Androidv15samsungSM-S931Bffffffff-ffac-e209-ffff-ffffef05ac4a1';
const saltSpace = '5.6.0Android v15samsungSM-S931Bffffffff-ffac-e209-ffff-ffffef05ac4a1';
// deviceId without hyphens
const saltNoHyphen = '5.6.0Android+v15samsungSM-S931Bfffffffffface209ffffffffef05ac4a1';
// Samsung with capital S
const saltSamsungCap = '5.6.0Android+v15SamsungSM-S931Bffffffff-ffac-e209-ffff-ffffef05ac4a1';

const USER_KEY_4359406 = '0E6F9870-533A-715C-E063-8917FD0A0B44';
const USER_KEY_5885941 = '3566080F-EF8B-5F49-E063-8917FD0AAA9E';

function sha256(arr, sep = '') {
  const str = Array.isArray(arr) ? arr.join(sep) : arr;
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}
function md5(arr, sep = '') {
  const str = Array.isArray(arr) ? arr.join(sep) : arr;
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}
function hmac256(key, msgArr, sep = '') {
  const msg = Array.isArray(msgArr) ? msgArr.join(sep) : msgArr;
  return crypto.createHmac('sha256', key).update(msg, 'utf8').digest('hex');
}

const salts = [
  ['build', saltBuild],
  ['cash', saltCash],
  ['space', saltSpace]
];

function tryAll(name, expected, key, parts, saltKey = 'build') {
  const salt = salts.find(s => s[0] === saltKey)?.[1] || saltBuild;
  const variants = [];
  // SHA256 concat: key + ...parts + salt (c2)
  variants.push(['sha256 c2 build', () => sha256([key, ...parts, saltBuild])]);
  variants.push(['sha256 c2 cash', () => sha256([key, ...parts, saltCash])]);
  variants.push(['sha256 c2 space', () => sha256([key, ...parts, saltSpace])]);
  variants.push(['sha256 c2 noHyphen', () => sha256([key, ...parts, saltNoHyphen])]);
  variants.push(['sha256 c2 SamsungCap', () => sha256([key, ...parts, saltSamsungCap])]);
  // SHA256 concat: key + part0 + salt + rest (h2)
  if (parts.length >= 1) {
    variants.push(['sha256 h2 build', () => sha256([key, parts[0], saltBuild, ...parts.slice(1)])]);
    variants.push(['sha256 h2 cash', () => sha256([key, parts[0], saltCash, ...parts.slice(1)])]);
  }
  if (parts.length === 0) {
    variants.push(['sha256 key+salt build', () => sha256([key, saltBuild])]);
    variants.push(['sha256 key+salt cash', () => sha256([key, saltCash])]);
  }
  // HMAC: key = key, message = parts + salt
  variants.push(['hmac key msg=parts+salt build', () => hmac256(key, [...parts, saltBuild])]);
  variants.push(['hmac key msg=parts+salt cash', () => hmac256(key, [...parts, saltCash])]);
  // HMAC: key = key, message = part0 + salt + rest (h2 order)
  if (parts.length >= 1) {
    variants.push(['hmac msg=h2 build', () => hmac256(key, [parts[0], saltBuild, ...parts.slice(1)])]);
    variants.push(['hmac msg=h2 cash', () => hmac256(key, [parts[0], saltCash, ...parts.slice(1)])]);
  }
  // SHA256 no key in body: just parts + salt (some APIs use public hash)
  variants.push(['sha256 parts+salt build', () => sha256([...parts, saltBuild])]);
  variants.push(['sha256 parts+salt cash', () => sha256([...parts, saltCash])]);
  // Pipe separator
  variants.push(['sha256 c2 pipe build', () => sha256([key, ...parts, saltBuild], '|')]);
  variants.push(['sha256 c2 pipe cash', () => sha256([key, ...parts, saltCash], '|')]);
  // MD5
  variants.push(['md5 c2 build', () => md5([key, ...parts, saltBuild])]);
  variants.push(['md5 c2 cash', () => md5([key, ...parts, saltCash])]);
  // HMAC with salt as key
  variants.push(['hmac saltAsKey build', () => hmac256(saltBuild, [key, ...parts])]);
  variants.push(['hmac saltAsKey cash', () => hmac256(saltCash, [key, ...parts])]);
  // Salt first: salt + key + parts
  variants.push(['sha256 salt+key+parts build', () => sha256([saltBuild, key, ...parts])]);
  variants.push(['sha256 salt+key+parts cash', () => sha256([saltCash, key, ...parts])]);
  // Parts + salt + key
  variants.push(['sha256 parts+salt+key build', () => sha256([...parts, saltBuild, key])]);
  variants.push(['sha256 parts+salt+key cash', () => sha256([...parts, saltCash, key])]);
  // Double SHA256
  const sha2 = (a) => {
    const s = (Array.isArray(a) ? a.join('') : a);
    const h = crypto.createHash('sha256').update(s, 'utf8').digest('hex');
    return crypto.createHash('sha256').update(h, 'utf8').digest('hex');
  };
  variants.push(['sha256x2 c2 build', () => sha2([key, ...parts, saltBuild])]);
  variants.push(['sha256x2 c2 cash', () => sha2([key, ...parts, saltCash])]);
  // Null byte separator (native C strings)
  variants.push(['sha256 c2 nullSep build', () => sha256([key, ...parts, saltBuild], '\0')]);
  variants.push(['sha256 c2 nullSep cash', () => sha256([key, ...parts, saltCash], '\0')]);
  // Newline separator
  variants.push(['sha256 c2 nl build', () => sha256([key, ...parts, saltBuild], '\n')]);
  variants.push(['sha256 c2 nl cash', () => sha256([key, ...parts, saltCash], '\n')]);
  // All permutations of [key, ...parts, salt] for small arrays
  function permute(arr) {
    if (arr.length <= 1) return [arr];
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      const rest = permute(arr.slice(0, i).concat(arr.slice(i + 1)));
      rest.forEach(r => out.push([arr[i]].concat(r)));
    }
    return out;
  }
  const full = [key, ...parts, saltBuild];
  if (full.length <= 5) {
    permute(full).forEach((p, i) => {
      variants.push([`sha256 perm${i} build`, () => sha256(p)]);
    });
  }
  // Same with saltCash for 3-element case (resend, refresh)
  if (full.length === 3) {
    permute([key, ...parts, saltCash]).forEach((p, i) => {
      variants.push([`sha256 perm${i} cash`, () => sha256(p)]);
    });
  }

  for (const [label, fn] of variants) {
    const got = fn();
    if (got.toLowerCase() === expected.toLowerCase()) {
      console.log('MATCH', name, '->', label);
      return label;
    }
  }
  console.log('NO MATCH', name);
  return null;
}

console.log('Searching for hash algorithm that matches captures...\n');

const results = {};

results.signIn = tryAll('SIGN_IN3', 'fac31b4cbe5acd3d5d1b3fe45c9e0b7d9c9bb141ad22bc830f959498a8f4a144', '0', ['0986121503', 'Jafar@773050', '1']);
results.resend = tryAll('LOGIN_RESEND', 'f202fc49d21bfd84ff92d145e57a8bfe812f6ea2b5591a3a08d0c54c9ba3a462', '0', ['0986121503']);
results.verify1 = tryAll('LOGIN_VERIFY 148952', '6cf995ac8364d4ef7181cd3250c7c368a88f27c1489c7797b160fdb5b62e276b', '0', ['148952', '0986121503']);
results.verify2 = tryAll('LOGIN_VERIFY 148942', 'e406fa734d3c7d917f9b3e02dea4bcc7839f41ebf6fcc7d58ae355bd19d2e078', '0', ['148942', '0986121503']);
results.refresh = tryAll('refresh_balance', '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def', USER_KEY_4359406, ['4359406']);
results.checkAcc1 = tryAll('checkAccountRefreshBalance 4359406', 'ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd', USER_KEY_4359406, ['4359406', '1']);
results.checkAcc2 = tryAll('checkAccountRefreshBalance 5885941', 'cb0a2e9ef44f04d5b2c7680da9bf9016d50697a9dc9662476f84fbe32bf59944', USER_KEY_5885941, ['5885941', '1']);
results.pin = tryAll('pinCode/check', '5911873577e12abb7ec781ecc46a35b8ee2a449bf454d575456b47ba507565d2', USER_KEY_4359406, ['4359406', '0000']);
results.checkCust = tryAll('checkCustomer', '87d05250ed5b8d03c200e4f73bbafa7c9b42ea9693c9ccb9c30c6df446e018e6', USER_KEY_4359406, ['4359406', '0990210184', '100']);
results.transfer = tryAll('transfer', '63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6', USER_KEY_4359406, ['4359406', '0000', '0990210184', '0990210184', '1.5', '0', 'W9F', '100']);
results.hist1 = tryAll('customerHistory p1', '15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0', USER_KEY_4359406, ['4359406', '1', '2', '', '2', '4', '1']);
results.hist2 = tryAll('customerHistory p2', 'ce64fa82ffe1a93fcab5538a43e095355af5521653e97a9ddc871cda20be2553', USER_KEY_4359406, ['4359406', '2', '2', '', '2', '4', '1']);

console.log('\n--- Summary ---');
const matched = Object.values(results).filter(Boolean);
console.log('Matched', matched.length, '/ 12');
if (matched.length > 0) {
  console.log('Winning variants:', [...new Set(matched)]);
}
