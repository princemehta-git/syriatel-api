/**
 * Captured hashes and token from HAR (optional).
 * checkCustomer and transfer always use computed hash (reversed libhashing.so formula in hash.js).
 */

const CAPTURED_HASHES = {
  SIGN_IN3: 'fac31b4cbe5acd3d5d1b3fe45c9e0b7d9c9bb141ad22bc830f959498a8f4a144',
  LOGIN_RESEND_CODE: 'f202fc49d21bfd84ff92d145e57a8bfe812f6ea2b5591a3a08d0c54c9ba3a462',
  LOGIN_CODE_VERIFY: '6cf995ac8364d4ef7181cd3250c7c368a88f27c1489c7797b160fdb5b62e276b',
  setToken: '1e5116f7950be7ec25cd981ba2440ae7106b4396645a584a9de7104c5e5a7b02',
  refresh_balance: ['d300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd', '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def'],
  checkAccountRefreshBalance: 'ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd',
  getUsage: '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def',
  getHistoryTypes: '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def',
  customerHistory: '15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0',
  customerHistory_incoming: ['ce64fa82ffe1a93fcab5538a43e095355af5521653e97a9ddc871cda20be2553', '15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0'],
  customerHistory_outgoing: ['63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7'],
  secretCode: '423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def',
  pinCodeCheck: '5911873577e12abb7ec781ecc46a35b8ee2a449bf454d575456b47ba507565d2',
  /** Expected hash for transfer (used by verify-all-hashes.js). Computed with same formula as checkCustomer. */
  transfer: '63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6'
};

const CAPTURED_SETTOKEN_TOKEN = 'dFWCFnnhQPmjiFuZ_uwSBw:APA91bGDMujLobHWhIxx5Jk2dSvE__XguNzEBrG2fAL2h2txPHvsk1TTGa_rxGxYmIcn4cVlMXiKkL9Yiy8KRAupnU0dyfyE2GzSJyZdFRmb-6kZLp38vNM';

module.exports = { CAPTURED_HASHES, CAPTURED_SETTOKEN_TOKEN };
