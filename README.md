# Syriatel Cash API (GET-only)

Node.js wrapper that exposes Syriatel Cash as a **GET-only** API: sign in with GSM + password, optional OTP, then balance, transaction history, search by transaction ID, and transfer. Attach the **apiKey** from the first call (signin) to all subsequent requests. Storage: **MySQL** by default (`USE_MEMORY=false`); set `USE_MEMORY=true` for in-memory (no DB, data lost on restart).

## Setup

```bash
cd syriatel-api
npm install
cp .env.example .env
# For MySQL (default): set MYSQL_* in .env. For in-memory only: set USE_MEMORY=true (no MySQL needed).
npm start
```

Server runs at `http://localhost:3000` (or `PORT` in `.env`). **MySQL (default):** set `USE_MEMORY=false` or leave unset; DB and tables are created on startup. **In-memory:** set `USE_MEMORY=true` — no MySQL connection or schema checks.

---

## How to login

### 1. Sign in

Call signin with your Syriatel GSM number and app password:

```http
GET /signin?gsm=0986121503&password=YourPassword
```

**Success (no OTP):** Response includes `apiKey`. Use this `apiKey` for all later requests (balance, history, transfer, etc.).

```json
{
  "success": true,
  "apiKey": "abc123...",
  "accountId": "4359406",
  "userId": "4359406",
  "gsms": [{"gsm": "0986121503", "user_ID": "4359406", "userKey": "..."}]
}
```

**Success (OTP required):** When the server detects a new device, it returns `needsOtp: true` and an `apiKey`. You must complete login by submitting the OTP code sent to your GSM:

```json
{
  "success": true,
  "needsOtp": true,
  "apiKey": "abc123...",
  "gsm": "0986121503",
  "message": "OTP required. Call GET /otp?apiKey=...&code=YOUR_OTP"
}
```

### 2. Submit OTP (only when `needsOtp` was true)

Use the same `apiKey` from the signin response and the code you received (SMS):

```http
GET /otp?apiKey=YOUR_API_KEY&code=123456
```

Response is the same shape as signin (success + `apiKey`, `accountId`, `userId`, `gsms`). After this, use the same `apiKey` for balance, history, transfer, etc.

### 3. Resend OTP

If you didn’t receive the code:

```http
GET /resendOtp?apiKey=YOUR_API_KEY
```

### 4. Use the API with your apiKey

Every request after login must include the **apiKey** (as `apiKey`, `api_key`, or `uniqueId`):

| What you want | Request |
|---------------|---------|
| Balance | `GET /balance?apiKey=YOUR_API_KEY` |
| History (page 1) | `GET /history?apiKey=YOUR_API_KEY&page=1` |
| History for a specific GSM | `GET /history?apiKey=YOUR_API_KEY&gsm=0986121503&page=1` |
| Find transaction | `GET /transaction?apiKey=YOUR_API_KEY&transactionId=600402514192` |
| Transfer | `GET /transfer?apiKey=YOUR_API_KEY&pin=0000&to=0990210184&amount=100` |
| List GSMs on account | `GET /gsms?apiKey=YOUR_API_KEY` |
| Usage / bundles | `GET /usage?apiKey=YOUR_API_KEY` |
| Secret code (receive by code) | `GET /secretCode?apiKey=YOUR_API_KEY` |

**Example (balance):**

```http
GET http://localhost:3000/balance?apiKey=YOUR_API_KEY
```

**Example (transfer):** `to` can be a GSM number or the recipient’s Syriatel Cash secret code. You need your 4‑digit Syriatel Cash PIN.

```http
GET http://localhost:3000/transfer?apiKey=YOUR_API_KEY&pin=0000&to=0990210184&amount=100
```

---

## Endpoints (all GET)

| Endpoint | Query params | Description |
|----------|--------------|-------------|
| **GET /signin** | `gsm`, `password` | Sign in. Returns `apiKey` and either linked account or `needsOtp: true` + `apiKey` for OTP step. |
| **GET /otp** | `apiKey`, `code` | Submit OTP after sign-in when `needsOtp` was true. Completes login and links account. |
| **GET /resendOtp** | `apiKey` | Resend OTP for a pending sign-in (when `needsOtp` was true). |
| **GET /balance** | `apiKey`, optional `gsm` | Balance. Use `gsm` for a specific line. |
| **GET /history** | `apiKey`, optional `gsm`, `page`, `type`, `status`, … | History. Use `gsm` for a specific line. |
| **GET /transaction** | `apiKey`, `transactionId`, optional `gsm` | Find transaction by ID. |
| **GET /transfer** | `apiKey`, `pin`, `to`, `amount`, optional `gsm` | Transfer. |
| **GET /gsms** | `apiKey` | List of GSMs (phone numbers) attached to this account. |
| **GET /accounts** | — | List all linked accounts (apiKey, gsm, accountId). |
| **GET /checkGsm** | `gsm` | Check if GSM is registered (no login). Code: 1=register, -2=sign in, -3=verification. |
| **GET /accountInfo** | `apiKey`, optional `gsm`, `firstUse` | Full account status. |
| **GET /historyTypes** | `apiKey`, optional `gsm` | History types. |
| **GET /usage** | `apiKey`, optional `gsm` | Usage summary. |
| **GET /secretCode** | `apiKey`, optional `gsm` | This account’s Syriatel Cash secret code (for receiving by code). |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the API server. |
| `npm run verify-hashes` | Run `scripts/verify-all-hashes.js`: compare computed hashes (auth, setToken, cash) with captured defaults. All 18 should pass. |
| `npm run e2e` | Run `scripts/e2e-login.js`: sign in → setToken → balance (requires network). Set `TEST_GSM`, `TEST_PASSWORD` and optionally `TEST_OTP` in env, or script uses built-in test values. |

---

## Hash and device options

Request hashes are computed to match the Syriatel app (reverse‑engineered from the APK). Auth uses **h2**, setToken uses **e2** with the account’s userKey, and cash endpoints use **c2** or **h2** as in the app.

- **USE_DYNAMIC_DEVICES** (default: `false`): When `false`, all requests use the same fixed device (as in the captured traffic). When `true`, a deterministic device is generated per `apiKey` so you can use the API with any account.
- **SYRIATEL_HASH_MODE**: `sha256` (default), `hmac`, or `cash`. Only change if you need a different variant.
- **SYRIATEL_HASH_PROXY_URL**: If set, the API POSTs `{ style, privateKey, params, device }` to this URL and uses the returned `{ hash }` instead of built-in hash. Use this if you have your own implementation (e.g. calling the real native lib).

Run `npm run verify-hashes` to confirm all hashes match the default/captured values.

---

## Proxy fallback (SOCKS5)

When the Syriatel API is unreachable directly (e.g. geo-restriction), the server can retry the same request via a SOCKS5 proxy. Configure in `.env`:

| Variable | Description | Example |
|----------|-------------|---------|
| **DIRECT_TIMEOUT_MS** | How long to wait for direct request (ms) before falling back to proxy. | `5000` |
| **PROXY_ENABLED** | Set to `true`, `1`, or `yes` to enable proxy fallback. | `true` |
| **PROXY_URL** | SOCKS5 proxy URL. | `socks5://127.0.0.1:1081` |

**Behaviour:** Each API request tries a direct connection first (with the above timeout). If the direct request times out, fails with a network error, or is aborted, and **PROXY_ENABLED** is true, the same request (method, headers, body) is retried once via the SOCKS5 proxy. If the proxy also fails, the original (direct) error is thrown. The proxy is only used when the direct attempt fails; it is never used unnecessarily.

**Example `.env`:**

```env
DIRECT_TIMEOUT_MS=5000
PROXY_ENABLED=true
PROXY_URL=socks5://127.0.0.1:1081
```

**Example usage of the helper (same options as `fetch`):**

```js
const { fetchWithFallback } = require('./src/fetchWithFallback');

const res = await fetchWithFallback('https://cash-api.syriatel.sy/...', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: '123', hash: '...' })
});
const data = await res.json();
```

**Dependencies for proxy:** `socks-proxy-agent`, `node-fetch` (used only for the proxy retry path; direct requests use Node’s native fetch on Node 18+).

---

## Notes

- **In-memory store:** With `USE_MEMORY=true`, linked accounts and pending OTP are kept in memory. Restart wipes them; for production, use MySQL (`USE_MEMORY=false`).
- **GET-only:** All operations are GET with query parameters so they can be called from a browser or any HTTP client.
- **PIN:** For `/transfer` you need the 4‑digit Syriatel Cash PIN set in the app. Pass it as `pin`.
- **Network:** The Syriatel API may be geo-restricted. If you see connection errors (e.g. ECONNRESET), try another network, VPN, or enable **proxy fallback** (see above) with a SOCKS5 proxy.
