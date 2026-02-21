# Syriatel API – Detailed review

This document reviews the current codebase for correctness, consistency, and potential issues.

---

## 1. Environment and configuration

### 1.1 `.env.example`

| Variable | Purpose | Default / values |
|----------|---------|------------------|
| `PORT` | Server port | 3000 |
| `USE_MEMORY` | Store backend | `false` = MySQL, `true` = in-memory (RAM). Accepted: `true`, `1`, `yes` |
| `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` | MySQL connection | Used only when `USE_MEMORY` is false |
| `USE_DYNAMIC_DEVICES` | Device/hash source | `false` = fixed device + captured hashes, `true` = deterministic device + computed hash. Accepted: `true`, `1`, `yes` |
| `SYRIATEL_HASH_MODE` | Hash variant | sha256, hmac, cash (optional) |
| `SYRIATEL_HASH_PROXY_URL` | Hash proxy | If set, all hashes come from proxy (overrides captured/computed) |

**Verdict:** Correct. Boolean flags are consistent across server, store, device, and syriatel.

---

## 2. Server startup (`server.js`)

- **Flow:** `require('dotenv').config()` → load routes → derive `USE_MEMORY` → `start()`.
- **If `USE_MEMORY`:** Log message, then `app.listen(PORT)`. No `require('./src/db')` or `initDatabase()`.
- **If MySQL:** `require('./src/db')`, `await db.initDatabase()`, then `app.listen(PORT)`. On init failure: `process.exit(1)`.
- **Routes:** All GET handlers registered; no POST.

**Verdict:** Correct. DB is only loaded and initialized when not using in-memory store.

---

## 3. Store layer (`src/store.js`)

### 3.1 Backend selection

- `USE_MEMORY` is true only for `process.env.USE_MEMORY === 'true'|'1'|'yes'`. Unset or `false` → MySQL.
- When `USE_MEMORY`: uses in-memory `accounts` and `pendingOtps` Maps. `getDb()` is never called, so `./db` and `mysql2` are never loaded.

### 3.2 In-memory behaviour

- **get(apiKey):** Returns `{ apiKey, ...row }` with same shape as DB (gsm, accountId, userId, userKey, accountData, device, linkedAt).
- **set(apiKey, data):** Sets `linkedAt = data.linkedAt || new Date().toISOString()`, stores all fields.
- **list():** Returns array of `{ apiKey, gsm, accountId, userId, linkedAt }` (matches `db.listAccounts()`).
- **setPendingOtp / getPendingOtp / deletePendingOtp:** Map keyed by apiKey; value `{ gsm, device }`. `device` default `{}` on read.

### 3.3 MySQL path

- **getDb():** Lazy `require('./db')` only when `!USE_MEMORY` and a DB method is used.
- **get/set/remove/list:** Delegate to `db.getAccount`, `setAccount`, `removeAccount`, `listAccounts` with correct field mapping (e.g. `api_key` ↔ `apiKey`, JSON parse for `account_data`/`device`).
- **setAccount:** Uses `ON DUPLICATE KEY UPDATE`; `linkedAt` normalized to datetime string.

**Verdict:** Store behaviour is correct and consistent for both backends. No double response or missing return.

---

## 4. Database layer (`src/db.js`)

- **initDatabase():**
  1. Create pool without DB → `CREATE DATABASE IF NOT EXISTS`.
  2. Close temp pool → create pool with `database: MYSQL_DATABASE`.
  3. `CREATE TABLE IF NOT EXISTS` for `accounts` and `pending_otp`.
  4. `ensureColumns(pool, 'accounts', ACCOUNTS_COLUMNS)` and same for `pending_otp`.
- **ensureColumns:** `DESCRIBE table`, then `ALTER TABLE ADD COLUMN` for any missing column (by name). Handles schema drift.
- **getAccount:** Returns camelCase; parses `account_data` and `device` from JSON if string.
- **setAccount:** Stringifies `accountData` and `device`; `linkedAt` formatted for MySQL datetime.
- **listAccounts:** Returns `apiKey, gsm, accountId, userId, linkedAt` (no userKey/accountData/device).
- **pending_otp:** get/set/delete by apiKey; device JSON stringified/parsed.

**Verdict:** Correct. Pool is created with database set, so all table operations run in the right DB. Column auto-fix is safe for additive changes only (no type/rename handling).

---

## 5. Device layer (`src/device.js`)

- **USE_DYNAMIC_DEVICES:** true only for `'1'|'true'|'yes'`. Default (unset/false) → fixed device.
- **getDeviceForRequest(seed):**
  - If `USE_DYNAMIC_DEVICES`: returns `generateDevice(seed)` (deterministic from seed).
  - Else: returns `{ ...CAPTURE_DEVICE }` (samsung SM-S931B, deviceId `ffffffff-ffac-e209-ffff-ffffef05ac4a`, etc.).
- **CAPTURE_DEVICE:** Matches HAR/capture (appVersion 5.6.0, systemVersion `Android+v15`, lang `1`).
- **generateDevice(seed):** Deterministic model, manufacturer, systemVersion, deviceId from seed; same appVersion/lang. Used for signin and stored with account; later calls use `acc.device` from store.

**Verdict:** Correct. Single device per account when dynamic; fixed device when not.

---

## 6. Hash and API client (`src/syriatel.js`)

### 6.1 getHash(style, privateKey, params, device, endpointKey)

1. **If `HASH_PROXY_URL`:** POST to proxy, return `body.hash`. No use of endpointKey or captured hash.
2. **If `!USE_DYNAMIC_DEVICES` and `endpointKey` and `CAPTURED_HASHES[endpointKey]`:** Return that captured hash (no computation).
3. **Else:** `hashC2WithMode` or `hashH2WithMode` from `hash.js` (depends on `SYRIATEL_HASH_MODE`).

So with default flags we never call hash.js for the endpoints that have captured hashes; with `USE_DYNAMIC_DEVICES=true` we always compute (and proxy still wins if set).

### 6.2 Endpoint → endpointKey mapping

| Function | endpointKey | In CAPTURED_HASHES |
|----------|-------------|--------------------|
| signIn | SIGN_IN3 | ✓ |
| resendOtp | LOGIN_RESEND_CODE | ✓ |
| submitOtp | LOGIN_CODE_VERIFY | ✓ |
| setToken | setToken | ✓ |
| getUsage | getUsage | ✓ |
| refreshBalance | refresh_balance | ✓ |
| checkAccountRefreshBalance | checkAccountRefreshBalance | ✓ |
| pinCodeCheck | pinCodeCheck | ✓ |
| checkCustomer | checkCustomer | ✓ |
| transfer | transfer | ✓ |
| customerHistory | customerHistory | ✓ |
| secretCode | secretCode | ✓ |
| getHistoryTypes | getHistoryTypes | ✓ |

**Verdict:** All keys exist in `CAPTURED_HASHES`. When `USE_DYNAMIC_DEVICES=false`, these endpoints use the captured hashes from `syriatel_api_calls.js`.

### 6.3 setToken(accountId, device)

- **Hash:** `getHash('h2', '0', [accountId], device, 'setToken')` → captured hash when `USE_DYNAMIC_DEVICES=false`, else computed.
- **Token:** Always `CAPTURED_SETTOKEN_TOKEN` from `syriatel_api_calls.js`.
- **Body:** Form params: accountId, appVersion, mobileManufaturer, mobileModel, osType `'2'`, lang, systemVersion, deviceId, hash, token. `systemVersion` is normalized to `Androidv15` style with `.replace('Android+', 'Android')` to match HAR.
- **Request:** `postFapiForm('/notification/setToken', params, device)`.

**Verdict:** Matches HAR setToken (same token, same hash when not dynamic, same param shape). With dynamic device, computed hash may or may not match server; if it fails, consider calling setToken only when `USE_DYNAMIC_DEVICES=false` or using a proxy.

### 6.4 Other API calls

- Auth (signIn, resendOtp, submitOtp), balance/usage/historyTypes/secretCode, cash (refreshBalance, checkAccountRefreshBalance, pinCodeCheck, checkCustomer, transfer, customerHistory) all pass the correct (style, privateKey, params, device, endpointKey). Request bodies/params match the HAR shape (device fields, userId, hash, etc.).
- **checkGSM:** No hash in request; only device + gsm. Correct.

---

## 7. Routes (`src/routes.js`)

### 7.1 getAccountOrFail(req, res)

- **apiKey:** From `req.query.apiKey || req.query.api_key || req.query.uniqueId` (backward compatible).
- **Missing apiKey:** 400, JSON error, returns `null`.
- **Account missing:** 404, JSON error, returns `null`.
- **Success:** Returns account object (from store.get). Callers always do `if (!acc) return;` after.

**Verdict:** Correct. No double response.

### 7.2 resolveUser(acc, gsm)

- **No gsm:** Returns `{ userId: acc.userId, userKey: acc.userKey }` (first/default line).
- **With gsm:** Finds entry in `acc.accountData` with `a.gsm === gsm` (string-safe). Returns `{ userId, userKey }` from that entry (`user_ID`/`userId`, `userKey`/`user_KEY`). If not found, returns `null`.
- Callers check `if (!user)` and respond 400 with “gsm not found… Use GET /gsms?apiKey=...”.

**Verdict:** Correct. Multi-GSM accounts are handled and error message is clear.

### 7.3 signin

- Validates gsm + password; generates apiKey; `getDeviceForRequest(apiKey)`; calls `syriatel.signIn(gsm, password, device)`.
- On success without OTP: `store.set(apiKey, { gsm, accountId, userId, userKey, accountData, device })`, then `syriatel.setToken(accountId, device).catch(() => {})`, then JSON response with apiKey, accountId, userId, gsms.
- On OTP required: `store.setPendingOtp(apiKey, { gsm, device })`, response with needsOtp and apiKey.

**Verdict:** Correct. setToken is fire-and-forget so login success does not depend on it.

### 7.4 otp

- Gets apiKey + code; loads pending OTP; `syriatel.submitOtp(gsm, code, device)`; on success `store.deletePendingOtp`, `store.set(apiKey, ...)`, `syriatel.setToken(accountId, device).catch(() => {})`, then response.

**Verdict:** Correct.

### 7.5 balance, history, transaction, transfer, accountInfo, historyTypes, usage, secretCode

- All: `getAccountOrFail` → `resolveUser(acc, req.query.gsm)` → use `user.userId`, `user.userKey`, `acc.device`. Optional `gsm` is consistently used for multi-line accounts.

**Verdict:** Correct.

### 7.6 checkGsm

- No apiKey. Uses `getDeviceForRequest(gsm)` and `syriatel.checkGSM(gsm, device)`.

**Verdict:** Correct.

### 7.7 accounts

- `store.list()` only; no getAccountOrFail. Returns list of linked accounts (apiKey, gsm, accountId, userId, linkedAt from store/DB).

**Verdict:** Correct.

---

## 8. Captured data (`src/syriatel_api_calls.js`)

- **CAPTURED_HASHES:** One hash per endpoint (SIGN_IN3, LOGIN_RESEND_CODE, LOGIN_CODE_VERIFY, setToken, refresh_balance, checkAccountRefreshBalance, getUsage, getHistoryTypes, customerHistory, checkCustomer, transfer, secretCode, pinCodeCheck). Values match the HAR examples in the same file.
- **CAPTURED_SETTOKEN_TOKEN:** FCM token from the setToken HAR request. Exported and used as the only token in `setToken()`.

**Verdict:** Consistent with HAR. No duplicate or wrong keys.

---

## 9. Potential issues and edge cases

### 9.1 setToken with USE_DYNAMIC_DEVICES=true

- When dynamic devices are on, setToken uses **computed** hash `hashH2WithMode('0', [accountId], device)`. The real app may use a different formula (e.g. different salt or style). If the server returns an error for setToken in this mode, options are: (1) only call setToken when `USE_DYNAMIC_DEVICES=false`, or (2) use a hash proxy that implements the exact setToken hash.

**Recommendation:** Leave as is; if setToken fails with dynamic devices, treat as non-fatal (already fire-and-forget) or restrict setToken to fixed-device mode.

### 9.2 customerHistory with captured hash

- We use a **single** captured hash for customerHistory (page 1, type 2, etc.). The HAR has different hashes for different page/type (e.g. page 2, type 1). So when `USE_DYNAMIC_DEVICES=false`, every customerHistory request sends the same hash regardless of page/type/search. The server might accept it (if it only checks device/session) or reject it (if it validates hash against full params).

**Recommendation:** If the server rejects history for other pages or filters when using fixed device, consider either enabling `USE_DYNAMIC_DEVICES` for that flow or adding more captured hashes per (page, type) and a way to select them (or use hash proxy).

### 9.3 PIN check before transfer

- The Syriatel flow may require a separate PIN check (e.g. `pinCodeCheck`) before calling transfer. The current route calls `checkCustomer` then `transfer` with the same PIN. If the API returns “PIN not validated” or similar, add a call to `syriatel.pinCodeCheck(user.userId, user.userKey, pin, acc.device)` before `transfer` and surface errors to the client.

### 9.4 DB column types

- **ensureColumns** only adds missing columns with fixed types (e.g. `VARCHAR(64)`, `JSON`). It does not alter existing columns or drop columns. If you change a column type in code (e.g. longer VARCHAR), existing DBs will keep the old type until you migrate manually.

**Verdict:** Acceptable for additive, backward-compatible schema evolution.

### 9.5 Error handling in routes

- All routes that call `getAccountOrFail` correctly check `if (!acc) return;` and do not send a second response. Same for `if (!user)` after `resolveUser`. No obvious double-send or unhandled rejection in the reviewed paths.

---

## 10. Summary table

| Area | Status | Notes |
|------|--------|--------|
| Env flags (USE_MEMORY, USE_DYNAMIC_DEVICES) | OK | Consistent; default = MySQL + fixed device |
| Server startup | OK | DB init only when !USE_MEMORY |
| Store (memory + MySQL) | OK | Same API; lazy DB load when MySQL |
| DB init + ensureColumns | OK | Correct pool usage; additive column fix |
| Device (fixed vs dynamic) | OK | Correct branching and storage |
| getHash + CAPTURED_HASHES | OK | All endpointKeys present; proxy wins when set |
| setToken (token + hash) | OK | Same token as HAR; captured hash when !dynamic |
| Routes (apiKey, gsm, resolveUser) | OK | Backward compat uniqueId; multi-GSM supported |
| signin / otp / setToken after login | OK | setToken non-blocking |
| Captured hashes vs HAR | OK | Matches syriatel_api_calls.js examples |

**Overall:** The implementation is consistent and matches the intended design. The only caveats are: (1) setToken with dynamic device may need a correct hash formula or proxy if the server is strict, and (2) customerHistory with fixed device uses one hash for all page/type combinations, which may or may not be accepted by the server. Everything else is wired correctly and should work for the default configuration (USE_MEMORY=false, USE_DYNAMIC_DEVICES=false).
