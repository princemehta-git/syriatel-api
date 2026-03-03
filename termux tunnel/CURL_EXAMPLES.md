# cURL examples — History & Signin

Reference data (from your DB):
- **gsm:** 0986121503  
- **password:** Jafar@773050  
- **userKey:** 0E6F9870-533A-715C-E063-8917FD0A0B44  
- **userId (user_ID):** 4359406  
- **apiKey:** 77b8c695596987e7e3f74c81d003fa8d  
- **device:** lang=1, deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a, appVersion=5.6.0, mobileModel=SM-S931B, systemVersion=Android+v15, mobileManufaturer=samsung  

Base URL for **our API:** `http://31.97.205.230:3009`  
Syriatel **cash-api:** `https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM`  
Proxy on VPS: `socks5h://127.0.0.1:1081`  

---

## 1. Our API (signin & history)

Use these from **anywhere** (VPS or Termux). No proxy: you are calling your own server.

### Signin (returns apiKey)

```bash
curl -s 'http://31.97.205.230:3009/signin?gsm=0986121503&password=Jafar%40773050&isnew=0'
```

(Password encoded: `@` → `%40`.)

### History (outgoing, for 0986121503)

```bash
curl -s 'http://31.97.205.230:3009/history?apiKey=77b8c695596987e7e3f74c81d003fa8d&direction=outgoing&for=0986121503'
```

With optional params:

```bash
curl -s 'http://31.97.205.230:3009/history?apiKey=77b8c695596987e7e3f74c81d003fa8d&direction=outgoing&for=0986121503&page=1'
```

### History (incoming)

```bash
curl -s 'http://31.97.205.230:3009/history?apiKey=77b8c695596987e7e3f74c81d003fa8d&direction=incoming&for=0986121503'
```

---

## 2. VPS — via proxy (calling Syriatel cash-api)

Run on the **VPS**. Traffic to Syriatel goes through the phone proxy.

### Connectivity check (GET, no hash)

```bash
curl -s --proxy socks5h://127.0.0.1:1081 'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM'
```

### customerHistory (POST, form-encoded)

Hash is required; the repo computes it. Example with a **captured hash** for **outgoing** (type=1), page 1, userId 4359406. If Syriatel returns invalid hash, use our API instead.

```bash
curl -s --proxy socks5h://127.0.0.1:1081 \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' \
  -H 'Accept-Encoding: gzip' \
  -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=1&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7&status=2' \
  'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

**Incoming** (type=2), same user, captured hash:

```bash
curl -s --proxy socks5h://127.0.0.1:1081 \
  -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' \
  -H 'Accept-Encoding: gzip' \
  -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=2&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0&status=2' \
  'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

---

## 3. Termux (phone) — direct to Syriatel (no proxy)

Run in **Termux** on the phone. No proxy: phone is in Syria and hits Syriatel directly.

### Connectivity check (GET)

```bash
curl -s 'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM'
```

### customerHistory (POST, form-encoded)

**Outgoing** (type=1), captured hash:

```bash
curl -s -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' \
  -H 'Accept-Encoding: gzip' \
  -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=1&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7&status=2' \
  'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

**Incoming** (type=2):

```bash
curl -s -X POST \
  -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' \
  -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' \
  -H 'Accept-Encoding: gzip' \
  -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=2&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0&status=2' \
  'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

---

## 4. One-liners (copy-paste)

**Our API — history (any host):**
```bash
curl -s 'http://31.97.205.230:3009/history?apiKey=77b8c695596987e7e3f74c81d003fa8d&direction=outgoing&for=0986121503'
```

**Our API — signin:**
```bash
curl -s 'http://31.97.205.230:3009/signin?gsm=0986121503&password=Jafar%40773050&isnew=0'
```

**VPS via proxy — Syriatel customerHistory (outgoing):**
```bash
curl -s --proxy socks5h://127.0.0.1:1081 -X POST -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=1&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7&status=2' 'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

**Termux direct — Syriatel customerHistory (outgoing):**
```bash
curl -s -X POST -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'User-Agent: Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)' -d 'appVersion=5.6.0&pageNumber=1&searchGsmOrSecret=&type=1&systemVersion=Android%2Bv15&deviceId=ffffffff-ffac-e209-ffff-ffffef05ac4a&userId=4359406&sortType=1&mobileManufaturer=samsung&mobileModel=SM-S931B&channelName=4&lang=1&hash=63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7&status=2' 'https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory'
```

---

**Note:** Hashes in this file are from `src/constants.js` (captured). If Syriatel returns invalid-hash or changes params, use the **our API** history/signin endpoints; the app computes the correct hash per request.
