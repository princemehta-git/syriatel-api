/**
 * Syriatel API calls from HAR – REFERENCE ONLY. Do not require() this file.
 * Each block is independent; paste any block in browser console to run.
 * The app uses src/constants.js for CAPTURED_HASHES and CAPTURED_SETTOKEN_TOKEN.
 * Cookies: none in captured HAR.
 */

// ✅ 1️⃣ get_stay_tuned_v2 (JSON POST)
// Fetches "Stay tuned" content: events, offers, and news for the app home screen.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/databrowsing/get_stay_tuned_v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "0",
    hash: "32c9c491c793452c40aa9e408e9b0ebba77bce67a8b9650b34ae0806c41ef25c",
    keyword: ""
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "This operation was done successfully",
//   "data": {
//     "data": {
//       "events": {
//         "total": 8,
//         "events": [
//           {
//             "id": 184,
//             "title": "Syriatel sponsors the Syria Sports Team in the Children of Asia International Sports Games",
//             "details": "Syria plays well in the 8th Children of Asia International Sports Games.",
//             "eventCategory": 13,
//             "creationDate": "2024-07-11 13:23:13",
//             "validTo": "2025-07-06 13:21:00",
//             "locationDescription": null,
//             "imgPath": "http://wservices.syriatel.sy/img/Events/E32AD5D5-0957-4386-BED8-99CF3C136706.png",
//             "hyperLink": "https://www.syriatel.sy/news/syriatel-sponsors-the-syria-sports-team-in-the-children-of-asia-international-sports-games",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-06-25 13:21:00"
//           },
//           {
//             "id": 182,
//             "title": "HiTech Exhibition 2024 ",
//             "details": "Syriatel sponsors HiTech 2024 Exhibition of Information and Communication Technologies.",
//             "eventCategory": 13,
//             "creationDate": "2024-06-23 15:00:37",
//             "validTo": "2025-06-07 14:56:00",
//             "locationDescription": null,
//             "imgPath": "http://wservices.syriatel.sy/img/Events/hitech.png",
//             "hyperLink": "https://www.syriatel.sy/news/hitech-exhibition-2024",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-06-04 14:56:00"
//           },
//           {
//             "id": 180,
//             "title": "The 3rd Brazilian Film Festival",
//             "details": "Syriatel the strategic partner of the 3rd Brazilian Film Festival. ",
//             "eventCategory": 13,
//             "creationDate": "2024-05-29 10:41:40",
//             "validTo": "2025-05-25 10:40:00",
//             "locationDescription": null,
//             "imgPath": "http://wservices.syriatel.sy/img/Events/33.png",
//             "hyperLink": "https://www.syriatel.sy/news/the-3rd-brazilian-film-festival",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-05-24 10:40:00"
//           },
//           {
//             "id": 178,
//             "title": "Syriatel in the Occupational Health and Safety Conference 2024",
//             "details": "Syriatel participates in the Occupational Health and Safety Conference 2024.",
//             "eventCategory": 13,
//             "creationDate": "2024-05-19 10:57:46",
//             "validTo": "2025-05-15 10:56:00",
//             "locationDescription": null,
//             "imgPath": "http://wservices.syriatel.sy/img/Events/Syriatel-Website_new_size_870x489_03.png",
//             "hyperLink": "https://www.syriatel.sy/news/syriatel-in-the-occupational-health-and-safety-conference-2024",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-05-16 10:56:00"
//           },
//           {
//             "id": 176,
//             "title": "EPEX 2 in Damascus",
//             "details": "Syriatel participates in EPEX 2, the Electronic Payment Expo.",
//             "eventCategory": 13,
//             "creationDate": "2024-04-29 12:39:02",
//             "validTo": "2025-04-24 12:37:00",
//             "locationDescription": null,
//             "imgPath": "http://wservices.syriatel.sy/img/Events/web-7.png",
//             "hyperLink": "https://www.syriatel.sy/news/epex-2-in-damascus",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-04-25 12:37:00"
//           },
//           {
//             "id": 172,
//             "title": "IHRM’s 17TH Anniversary",
//             "details": "Syriatel, the strategic partner for IHRM anniversary.",
//             "eventCategory": 13,
//             "creationDate": "2024-02-22 11:37:50",
//             "validTo": "2025-02-19 11:37:00",
//             "locationDescription": null,
//             "imgPath": "https://wservices.syriatel.sy/img/Events/IHRM.png",
//             "hyperLink": "https://www.syriatel.sy/news/ihrm-s-17th-anniversary",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-02-20 11:37:00"
//           },
//           {
//             "id": 170,
//             "title": "Syriatel Supports Syrian Women’s Sports Teams in Sharjah",
//             "details": "With Syriatel’s official sponsorship, Syrian women’s teams participated in the 7th edition of the Arab Women’s Sports Tournament.",
//             "eventCategory": 13,
//             "creationDate": "2024-02-21 12:26:14",
//             "validTo": "2025-02-11 12:25:00",
//             "locationDescription": null,
//             "imgPath": "https://wservices.syriatel.sy/img/Events/Syriatel-Website_new_size_870x489-0.png",
//             "hyperLink": "https://www.syriatel.sy/news/syriatel-supports-syrian-women-s-sports-teams-in-sharjah",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-02-12 12:25:00"
//           },
//           {
//             "id": 169,
//             "title": "Syrian Championship for Romanian Wrestling",
//             "details": "Syriatel sponsors Child Rights Society participating team in the championship.",
//             "eventCategory": 13,
//             "creationDate": "2024-02-01 11:19:33",
//             "validTo": "2025-01-25 11:18:00",
//             "locationDescription": null,
//             "imgPath": "https://wservices.syriatel.sy/img/Events/3.png",
//             "hyperLink": "https://www.syriatel.sy/events/syrian-championship-for-romanian-wrestling",
//             "catId": 13,
//             "catName": "Syriatel Event ",
//             "defaultSharingMessage": null,
//             "startDate": "2024-01-26 11:18:00"
//           }
//         ]
//       },
//       "offers": [],
//       "news": {
//         "total": 0,
//         "newses": []
//       }
//     }
//   }
// }

// ✅ 2️⃣ CheckGSM (Form URL Encoded)
// Checks if a GSM number is available for registration (e.g. not already registered).
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/api2/CheckGSM", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "gsm": "0986121504",
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-1000",
//   "message": "Please try again",
//   "data": {
//     "data": null
//   }
// }

// ✅ 3️⃣ CheckGSM (Form URL Encoded)
// Checks if a GSM number is available for registration (e.g. not already registered).
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/api2/CheckGSM", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "gsm": "0986121503",
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-2",
//   "message": "Mobile number already registered ",
//   "data": {
//     "data": null
//   }
// }

// ✅ 4️⃣ SIGN_IN3 (JSON POST)
// Sign in with GSM and password. Returns account data and user keys on success.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/SIGN_IN3", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    password: "Jafar@773050\n",
    osType: "1",
    hash: "4fa61cb57629ff34617606f6e2a34a8fc1309da8df7e5158197a28fcef79b111"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-12",
//   "message": "Wrong mobile number or password ",
//   "data": null
// }

// ✅ 5️⃣ SIGN_IN3 (JSON POST)
// Sign in with GSM and password. Returns account data and user keys on success.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/SIGN_IN3", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    password: "Jafar@773050",
    osType: "1",
    hash: "fac31b4cbe5acd3d5d1b3fe45c9e0b7d9c9bb141ad22bc830f959498a8f4a144"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "تمت العملية بنجاح",
//   "data": {
//     "data": {
//       "accountId": "4359406",
//       "NEW_DEVICE": "1",
//       "accountData": [
//         {
//           "_x0031_": 1,
//           "account_ID": "4359406",
//           "user_ID": "4359406",
//           "gsm": "0986121503",
//           "post_OR_PRE": "PREP",
//           "is_2G_OR_3G": "",
//           "gsm_TARIFF_PROFILE": "CLAS2",
//           "userKey": "0E6F9870-533A-715C-E063-8917FD0A0B44",
//           "name": ""
//         },
//         {
//           "_x0031_": 1,
//           "account_ID": "4359406",
//           "user_ID": "5885941",
//           "gsm": "0984143090",
//           "post_OR_PRE": "PREP",
//           "is_2G_OR_3G": "",
//           "gsm_TARIFF_PROFILE": "CLAS2",
//           "userKey": "3566080F-EF8B-5F49-E063-8917FD0AAA9E",
//           "name": ""
//         }
//       ]
//     }
//   }
// }

// ✅ 6️⃣ LOGIN_RESEND_CODE (JSON POST)
// Resends the OTP / verification code for login on the given GSM.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/LOGIN_RESEND_CODE", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    hash: "f202fc49d21bfd84ff92d145e57a8bfe812f6ea2b5591a3a08d0c54c9ba3a462"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "This operation was done successfully",
//   "data": null
// }

// ✅ 7️⃣ LOGIN_RESEND_CODE (JSON POST)
// Resends the OTP / verification code for login on the given GSM.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/LOGIN_RESEND_CODE", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    hash: "f202fc49d21bfd84ff92d145e57a8bfe812f6ea2b5591a3a08d0c54c9ba3a462"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "This operation was done successfully",
//   "data": null
// }

// ✅ 8️⃣ LOGIN_CODE_VERIFY (JSON POST)
// Verifies the OTP code sent to GSM and completes login; returns account info.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/LOGIN_CODE_VERIFY", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    code: "148952",
    hash: "6cf995ac8364d4ef7181cd3250c7c368a88f27c1489c7797b160fdb5b62e276b"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-6",
//   "message": "Wrong verification code",
//   "data": null
// }

// ✅ 9️⃣ LOGIN_CODE_VERIFY (JSON POST)
// Verifies the OTP code sent to GSM and completes login; returns account info.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/authentication/LOGIN_CODE_VERIFY", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    gsm: "0986121503",
    code: "148942",
    hash: "e406fa734d3c7d917f9b3e02dea4bcc7839f41ebf6fcc7d58ae355bd19d2e078"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "تمت العملية بنجاح",
//   "data": {
//     "data": {
//       "accountId": "4359406",
//       "NEW_DEVICE": "",
//       "accountData": [
//         {
//           "_x0031_": 1,
//           "account_ID": "4359406",
//           "user_ID": "4359406",
//           "gsm": "0986121503",
//           "post_OR_PRE": "PREP",
//           "is_2G_OR_3G": "",
//           "gsm_TARIFF_PROFILE": "CLAS2",
//           "userKey": "0E6F9870-533A-715C-E063-8917FD0A0B44",
//           "name": ""
//         },
//         {
//           "_x0031_": 1,
//           "account_ID": "4359406",
//           "user_ID": "5885941",
//           "gsm": "0984143090",
//           "post_OR_PRE": "PREP",
//           "is_2G_OR_3G": "",
//           "gsm_TARIFF_PROFILE": "CLAS2",
//           "userKey": "3566080F-EF8B-5F49-E063-8917FD0AAA9E",
//           "name": ""
//         }
//       ]
//     }
//   }
// }

// ✅ 🔟 setToken (Form URL Encoded)
// Registers the device FCM/push notification token for the logged-in account.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/notification/setToken", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "accountId": "4359406",
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "osType": "2",
    "lang": "1",
    "systemVersion": "Androidv15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "hash": "1e5116f7950be7ec25cd981ba2440ae7106b4396645a584a9de7104c5e5a7b02",
    "token": "dFWCFnnhQPmjiFuZ_uwSBw:APA91bGDMujLobHWhIxx5Jk2dSvE__XguNzEBrG2fAL2h2txPHvsk1TTGa_rxGxYmIcn4cVlMXiKkL9Yiy8KRAupnU0dyfyE2GzSJyZdFRmb-6kZLp38vNM"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "This operation was done successfully",
//   "data": {
//     "data": null
//   }
// }

// ✅ 11) getUsage (Form URL Encoded)
// Gets usage summary: bundles, balance, shortcuts, sliders, and unbilled usage.
// Paste this in browser console:

fetch("https://new-fapi.syriatel.sy/Wrapper/app/7/SS2MTLGSM/api2/getUsage", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "hash": "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Success",
//   "data": {
//     "data": {
//       "bundles": [],
//       "gsminfo": {
//         "gsmtype": "2G",
//         "preORpost": "PREP",
//         "specialOfferStatus": "0",
//         "tarrifProfile": "CLAS2"
//       },
//       "related_apis": {
//         "Shortcuts": {
//           "data": [
//             {
//               "id": "19",
//               "name_en": "Thank you Program",
//               "name_ar": "برنامج شكراً",
//               "is_static": "1",
//               "icon_order": "9",
//               "is_checked": "1",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/points_icon.png"
//             },
//             {
//               "id": "17",
//               "name_en": "Edit",
//               "name_ar": "تعديل",
//               "is_static": "1",
//               "icon_order": "1000",
//               "is_checked": "1",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_new_add_shourtcut.png"
//             },
//             {
//               "id": "13",
//               "name_en": "Offers",
//               "name_ar": "العروض",
//               "is_static": "1",
//               "icon_order": "8",
//               "is_checked": "1",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_offers.png"
//             },
//             {
//               "id": "0",
//               "name_en": "My service",
//               "name_ar": "خدماتي",
//               "is_static": "1",
//               "icon_order": "5",
//               "is_checked": "1",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_myservices.png"
//             },
//             {
//               "id": "1",
//               "name_en": "My Bundle",
//               "name_ar": "باقاتي",
//               "is_static": "1",
//               "icon_order": "6",
//               "is_checked": "1",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_mybundles.png"
//             },
//             {
//               "id": "12",
//               "name_en": "Complaints",
//               "name_ar": "الشكاوى",
//               "is_static": "0",
//               "icon_order": "15",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_complaints.png"
//             },
//             {
//               "id": "6",
//               "name_en": "Migration service between Ya Hala Products",
//               "name_ar": "التحويل بين منتجات ياهلا",
//               "is_static": "0",
//               "icon_order": "17",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_migrationyahlacard.png"
//             },
//             {
//               "id": "3",
//               "name_en": "Reserve credit",
//               "name_ar": "كفيها على الحساب",
//               "is_static": "0",
//               "icon_order": "16",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_reservecredit.png"
//             },
//             {
//               "id": "103",
//               "name_en": "Kiosk device",
//               "name_ar": "أجهزة الخدمة الذاتية",
//               "is_static": "0",
//               "icon_order": "99",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/kiosk_icon.png"
//             },
//             {
//               "id": "11",
//               "name_en": "Syriatel Sub Dealers",
//               "name_ar": "مراكز الخدمة المعتمدة",
//               "is_static": "0",
//               "icon_order": "19",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_sc_dialog_mobileservicecenter.png"
//             },
//             {
//               "id": "8",
//               "name_en": "Call Me Back service",
//               "name_ar": "حاكيني",
//               "is_static": "0",
//               "icon_order": "12",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_callmeback.png"
//             },
//             {
//               "id": "4",
//               "name_en": "Manage Black list",
//               "name_ar": "إدارة القائمة السوداء",
//               "is_static": "0",
//               "icon_order": "10",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_manageblacklist.png"
//             },
//             {
//               "id": "104",
//               "name_en": "Gifting Corner",
//               "name_ar": "ركن الإهداء",
//               "is_static": "0",
//               "icon_order": "450",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_giftingcorner.png"
//             },
//             {
//               "id": "10",
//               "name_en": "Important Numbers",
//               "name_ar": "الأرقام الهامة",
//               "is_static": "0",
//               "icon_order": "14",
//               "is_checked": "0",
//               "is_checked_new": "0",
//               "image": "https://wservices.syriatel.sy/img/Shortcuts/ic_shourtcut_importantnumbers.png"
//             }
//           ]
//         },
//         "Sliders": {
//           "data": {
//             "sliders": [
//               {
//                 "id": "4",
//                 "title": "Cashoo",
//                 "Image_Path": "https://wservices.syriatel.sy/img/Sliders/test banner.png",
//                 "SUB_ID": null,
//                 "navigate_directly": "1",
//                 "indirect_path": "18",
//                 "direct_path": "18"
//               },
//               {
//                 "id": "76",
//                 "title": "gifting",
//                 "Image_Path": "https://wservices.syriatel.sy/img/Sliders/gifting_corner_Slider_w817X315h.png",
//                 "SUB_ID": null,
//                 "navigate_directly": "1",
//                 "indirect_path": "96",
//                 "direct_path": "96"
//               }
//             ]
//           }
//         }
//       },
//       "unBilledBill": {
//         "balanceGifting": "0",
//         "calls": "0",
//         "international": "0",
//         "internet": "0",
//         "mon": "0",
//         "notificationsCount": "14",
//         "roaming": "0",
//         "shortCodes": "0",
//         "sms": "0"
//       },
//       "usages": [
//         {
//           "accountDescription": "from local SMS plan of Monthly Plan",
//           "accountId": "46219",
//           "accountUnit": "SMS",
//           "booster": "0",
//           "boosterPrice": "0",
//           "boosterValue": "0",
//           "equipId": "bundle^",
//           "expirationDate": "04-MAR-26",
//           "isBundle": "1",
//           "limit": "600",
//           "notificationsCount": "14",
//           "remaining": "595",
//           "shortCode": "Sub Account",
//           "usagePrecentage": "0.83"
//         },
//         {
//           "accountDescription": "PrepaidBalanceSubaccount",
//           "accountId": "2000",
//           "accountUnit": "SYP",
//           "booster": "0",
//           "boosterPrice": "0",
//           "boosterValue": "0",
//           "equipId": "bundle^",
//           "expirationDate": "14-MAY-26",
//           "isBundle": "1",
//           "limit": "52.2768",
//           "notificationsCount": "14",
//           "remaining": "52.28",
//           "shortCode": "Main Account",
//           "usagePrecentage": "0"
//         },
//         {
//           "accountDescription": "from local mobile minutes of Monthly Plan",
//           "accountId": "46213",
//           "accountUnit": "MIN",
//           "booster": "0",
//           "boosterPrice": "0",
//           "boosterValue": "0",
//           "equipId": "bundle^",
//           "expirationDate": "04-MAR-26",
//           "isBundle": "1",
//           "limit": "600",
//           "notificationsCount": "14",
//           "remaining": "498",
//           "shortCode": "Sub Account",
//           "usagePrecentage": "17"
//         },
//         {
//           "accountDescription": "from internet plan of Monthly Plan",
//           "accountId": "46207",
//           "accountUnit": "BYT",
//           "booster": "0",
//           "boosterPrice": "0",
//           "boosterValue": "0",
//           "equipId": "bundle^",
//           "expirationDate": "04-MAR-26",
//           "isBundle": "1",
//           "limit": "20480",
//           "notificationsCount": "14",
//           "remaining": "10459.86",
//           "shortCode": "Sub Account",
//           "usagePrecentage": "48.93"
//         }
//       ]
//     }
//   }
// }

// ✅ 12) checkAccountRefreshBalance (JSON POST)
// Checks Syriatel Cash account status: balance, PIN, features list (QR, transfer, bills, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/checkAccountRefreshBalance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    firstUse: "1",
    hash: "ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "hasMerchantSubaccount": "0",
//         "merchantBalance": "0",
//         "hasCustomerSubaccount": "1",
//         "customerBalance": "5342.58",
//         "hasPinCode": "1",
//         "isLocked": "0",
//         "FEATURES": [
//           {
//             "featureId": "2",
//             "appearanceStatus": "1",
//             "name": "Scan QR Code",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_qr_payment.png"
//           },
//           {
//             "featureId": "1",
//             "appearanceStatus": "1",
//             "name": "Generate QR Code",
//             "description": "This action helps you to receive amounts via QR code you can create with adding the amount you want, so the other party can scan this code and do the action.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           },
//           {
//             "featureId": "3",
//             "appearanceStatus": "1",
//             "name": "Manual Payment",
//             "description": "This process enables you to pay manually by entering the merchant’s code/GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_manual_payment.png"
//           },
//           {
//             "featureId": "4",
//             "appearanceStatus": "1",
//             "name": "Manual Transfer",
//             "description": "This process enables you to transfer manually by entering the customer’s code/GSM and the amount you wish to transfer.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_transfer.png"
//           },
//           {
//             "featureId": "0",
//             "appearanceStatus": "1",
//             "name": "History",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_history.png"
//           },
//           {
//             "featureId": "11",
//             "appearanceStatus": "1",
//             "name": "Security Settings",
//             "description": "Please choose a protection level for your account: fingerprint, facial recognition, or a PIN code. If authentication fails, a PIN code will be required to verify your identity.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/login_settings.png"
//           },
//           {
//             "featureId": "10",
//             "appearanceStatus": "1",
//             "name": "Mobile Bills Payment",
//             "description": "This process enables you to pay your mobile bills for postpaid lines and charge your prepaid cards by entering the GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/syriatel_logo_v4.png"
//           },
//           {
//             "featureId": "6",
//             "appearanceStatus": "1",
//             "name": "Merchants List",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_merchant_list.png"
//           },
//           {
//             "featureId": "7",
//             "appearanceStatus": "1",
//             "name": "Syriatel Cash Sub-dealers",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_subdealers.png"
//           },
//           {
//             "featureId": "12",
//             "appearanceStatus": "1",
//             "name": "ISP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/isp_icon.png"
//           },
//           {
//             "featureId": "5",
//             "appearanceStatus": "1",
//             "name": "SEP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_sep.png"
//           },
//           {
//             "featureId": "13",
//             "appearanceStatus": "0",
//             "name": "Loan",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/loan_icon.png"
//           },
//           {
//             "featureId": "14",
//             "appearanceStatus": "1",
//             "name": "Payment Others",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/other.png"
//           },
//           {
//             "featureId": "17",
//             "appearanceStatus": "0",
//             "name": "QR",
//             "description": "QR Code contains data (Customer or Merchant GSM/code) and cash amount can be added for payment and transfer transactions. Via QR codes, customer can pay and transfer amounts by generating or scanning QR codes",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           }
//         ]
//       }
//     ]
//   }
// }

// ✅ 13) check (Form URL Encoded)
// Validates the Syriatel Cash PIN before sensitive actions (e.g. transfer).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/pinCode/check", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "pinCode": "0000",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "hash": "5911873577e12abb7ec781ecc46a35b8ee2a449bf454d575456b47ba507565d2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Success",
//   "data": {
//     "data": null
//   }
// }

// ✅ 14) secretCode (Form URL Encoded)
// Returns the Syriatel Cash secret code (e.g. for receiving by code).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/secretCode", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "hash": "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Success",
//   "data": {
//     "data": {
//       "secretCode": "03363877"
//     }
//   }
// }

// ✅ 15) getHistoryTypes (JSON POST)
// Returns list of ePayment history types (transfers, bills, mobile recharge, ISP, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/getHistoryTypes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "success",
//   "data": {
//     "data": [
//       {
//         "id": "1",
//         "name": "Incoming Transfer",
//         "Services": []
//       },
//       {
//         "id": "2",
//         "name": "Outgoing Transfer",
//         "Services": []
//       },
//       {
//         "id": "3",
//         "name": "Outgoing Payment",
//         "Services": []
//       },
//       {
//         "id": "4",
//         "name": "Bills",
//         "Services": [
//           {
//             "service_name": "Lattakia Water",
//             "service_code": "BL1123"
//           },
//           {
//             "service_name": "Alfurat University",
//             "service_code": "BL1443"
//           },
//           {
//             "service_name": "Tartous University",
//             "service_code": "BL1362"
//           },
//           {
//             "service_name": "Electronic Services Gateway",
//             "service_code": "BL1104"
//           },
//           {
//             "service_name": "P.E. Trans and Distrib of Electricity",
//             "service_code": "BL1024"
//           },
//           {
//             "service_name": "Ministry of Interior - Civil Affairs",
//             "service_code": "BL1282"
//           },
//           {
//             "service_name": "Technical Inspection Lanes for vehicles",
//             "service_code": "BL1329"
//           },
//           {
//             "service_name": "Hama University",
//             "service_code": "BL1361"
//           },
//           {
//             "service_name": "Syrian Telecom",
//             "service_code": "BL1025"
//           },
//           {
//             "service_name": "Tartous Water",
//             "service_code": "BL1122"
//           },
//           {
//             "service_name": "Aleppo University",
//             "service_code": "BL1261"
//           },
//           {
//             "service_name": "Damascus Governorate",
//             "service_code": "BL1041"
//           },
//           {
//             "service_name": "Damascus and its rural-water",
//             "service_code": "BL1061"
//           },
//           {
//             "service_name": "Aleppo Water",
//             "service_code": "BL1142"
//           },
//           {
//             "service_name": "Homs Water",
//             "service_code": "BL1161"
//           },
//           {
//             "service_name": "General Commission for Taxes and Fees",
//             "service_code": "BL1181"
//           },
//           {
//             "service_name": "Daraa Water",
//             "service_code": "BL1221"
//           },
//           {
//             "service_name": "Tishreen University",
//             "service_code": "BL1382"
//           },
//           {
//             "service_name": "Transportation Directorates",
//             "service_code": "BL1023"
//           },
//           {
//             "service_name": "Hama Water",
//             "service_code": "BL1141"
//           },
//           {
//             "service_name": "Traffic-Passport-Judicial Record",
//             "service_code": "BL1081"
//           },
//           {
//             "service_name": "Syrian Virtual University",
//             "service_code": "BL1201"
//           },
//           {
//             "service_name": "Damascus University",
//             "service_code": "BL1341"
//           },
//           {
//             "service_name": "General Housing Establishment",
//             "service_code": "BL1403"
//           },
//           {
//             "service_name": "Homs University",
//             "service_code": "BL1422"
//           },
//           {
//             "service_name": "Internal Trade and Consumer Protection",
//             "service_code": "BL1523"
//           },
//           {
//             "service_name": "Ministry of higher education",
//             "service_code": "BL1303"
//           }
//         ]
//       },
//       {
//         "id": "5",
//         "name": "Mobile Payment / Recharge",
//         "Services": []
//       },
//       {
//         "id": "6",
//         "name": "ISPs Services",
//         "Services": [
//           {
//             "service_name": "Aalami",
//             "service_code": "ALAMI"
//           },
//           {
//             "service_name": "SCS-NET",
//             "service_code": "SCS"
//           },
//           {
//             "service_name": "INET",
//             "service_code": "INET"
//           },
//           {
//             "service_name": "Bitakat",
//             "service_code": "BITAKAT"
//           },
//           {
//             "service_name": "Yara",
//             "service_code": "YARA"
//           },
//           {
//             "service_name": "Dunia",
//             "service_code": "DUNIA"
//           }
//         ]
//       },
//       {
//         "id": "8",
//         "name": "Other Services",
//         "Services": [
//           {
//             "service_name": "SyTPRA",
//             "service_code": "SYTRA"
//           },
//           {
//             "service_name": "Charities",
//             "service_code": "CHARITIES"
//           }
//         ]
//       }
//     ]
//   }
// }

// ✅ 16) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "1",
    "searchGsmOrSecret": "",
    "type": "2",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "تمت العملية بنجاح",
//   "data": {
//     "data": [
//       {
//         "transactionNo": "600402514192",
//         "date": "2026-02-14 15:46:20",
//         "from": "0936369266",
//         "to": "0986121503",
//         "status": "1",
//         "amount": "500",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "500",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600401415073",
//         "date": "2026-02-13 03:18:19",
//         "from": "0993227060",
//         "to": "03363877",
//         "status": "1",
//         "amount": "5400",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "5400",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600398823074",
//         "date": "2026-02-10 07:01:30",
//         "from": "0991790341",
//         "to": "0986121503",
//         "status": "1",
//         "amount": "1800",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "1800",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       }
//     ]
//   }
// }

// ✅ 17) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "2",
    "searchGsmOrSecret": "",
    "type": "2",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "ce64fa82ffe1a93fcab5538a43e095355af5521653e97a9ddc871cda20be2553",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-998",
//   "message": "No data found",
//   "data": null
// }

// ✅ 18) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 19) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 20) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 21) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 22) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 23) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 24) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 25) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5342.58
//       }
//     ]
//   }
// }

// ✅ 26) checkCustomer (Form URL Encoded)
// Checks recipient (GSM or code) before transfer; returns fee and billcode.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/checkCustomer", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "lang": "1",
    "customerCodeOrGSM": "0990210184",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "transactAmount": "100",
    "hash": "87d05250ed5b8d03c200e4f73bbafa7c9b42ea9693c9ccb9c30c6df446e018e6"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Success",
//   "data": {
//     "data": {
//       "feeAmount": "1.5",
//       "billcode": "W9F",
//       "customerGSM": "0990210184"
//     }
//   }
// }

// ✅ 27) transfer (Form URL Encoded)
// Performs a Syriatel Cash transfer to another customer (GSM or secret code).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/transfer", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "amount": "100",
    "fee": "1.5",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "toGSM": "0990210184",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "pinCode": "0000",
    "billcode": "W9F",
    "lang": "1",
    "secretCodeOrGSM": "0990210184",
    "hash": "63246febbaa5011fc1e43ab0f415c72dad99322701131e7249ce289883ab16c6"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": null
//   }
// }

// ✅ 28) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5241.08
//       }
//     ]
//   }
// }

// ✅ 29) getHistoryTypes (JSON POST)
// Returns list of ePayment history types (transfers, bills, mobile recharge, ISP, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/getHistoryTypes", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "success",
//   "data": {
//     "data": [
//       {
//         "id": "1",
//         "name": "Incoming Transfer",
//         "Services": []
//       },
//       {
//         "id": "2",
//         "name": "Outgoing Transfer",
//         "Services": []
//       },
//       {
//         "id": "3",
//         "name": "Outgoing Payment",
//         "Services": []
//       },
//       {
//         "id": "4",
//         "name": "Bills",
//         "Services": [
//           {
//             "service_name": "Lattakia Water",
//             "service_code": "BL1123"
//           },
//           {
//             "service_name": "Alfurat University",
//             "service_code": "BL1443"
//           },
//           {
//             "service_name": "Tartous University",
//             "service_code": "BL1362"
//           },
//           {
//             "service_name": "Electronic Services Gateway",
//             "service_code": "BL1104"
//           },
//           {
//             "service_name": "P.E. Trans and Distrib of Electricity",
//             "service_code": "BL1024"
//           },
//           {
//             "service_name": "Ministry of Interior - Civil Affairs",
//             "service_code": "BL1282"
//           },
//           {
//             "service_name": "Technical Inspection Lanes for vehicles",
//             "service_code": "BL1329"
//           },
//           {
//             "service_name": "Hama University",
//             "service_code": "BL1361"
//           },
//           {
//             "service_name": "Syrian Telecom",
//             "service_code": "BL1025"
//           },
//           {
//             "service_name": "Tartous Water",
//             "service_code": "BL1122"
//           },
//           {
//             "service_name": "Aleppo University",
//             "service_code": "BL1261"
//           },
//           {
//             "service_name": "Damascus Governorate",
//             "service_code": "BL1041"
//           },
//           {
//             "service_name": "Damascus and its rural-water",
//             "service_code": "BL1061"
//           },
//           {
//             "service_name": "Aleppo Water",
//             "service_code": "BL1142"
//           },
//           {
//             "service_name": "Homs Water",
//             "service_code": "BL1161"
//           },
//           {
//             "service_name": "General Commission for Taxes and Fees",
//             "service_code": "BL1181"
//           },
//           {
//             "service_name": "Daraa Water",
//             "service_code": "BL1221"
//           },
//           {
//             "service_name": "Tishreen University",
//             "service_code": "BL1382"
//           },
//           {
//             "service_name": "Transportation Directorates",
//             "service_code": "BL1023"
//           },
//           {
//             "service_name": "Hama Water",
//             "service_code": "BL1141"
//           },
//           {
//             "service_name": "Traffic-Passport-Judicial Record",
//             "service_code": "BL1081"
//           },
//           {
//             "service_name": "Syrian Virtual University",
//             "service_code": "BL1201"
//           },
//           {
//             "service_name": "Damascus University",
//             "service_code": "BL1341"
//           },
//           {
//             "service_name": "General Housing Establishment",
//             "service_code": "BL1403"
//           },
//           {
//             "service_name": "Homs University",
//             "service_code": "BL1422"
//           },
//           {
//             "service_name": "Internal Trade and Consumer Protection",
//             "service_code": "BL1523"
//           },
//           {
//             "service_name": "Ministry of higher education",
//             "service_code": "BL1303"
//           }
//         ]
//       },
//       {
//         "id": "5",
//         "name": "Mobile Payment / Recharge",
//         "Services": []
//       },
//       {
//         "id": "6",
//         "name": "ISPs Services",
//         "Services": [
//           {
//             "service_name": "Aalami",
//             "service_code": "ALAMI"
//           },
//           {
//             "service_name": "SCS-NET",
//             "service_code": "SCS"
//           },
//           {
//             "service_name": "INET",
//             "service_code": "INET"
//           },
//           {
//             "service_name": "Bitakat",
//             "service_code": "BITAKAT"
//           },
//           {
//             "service_name": "Yara",
//             "service_code": "YARA"
//           },
//           {
//             "service_name": "Dunia",
//             "service_code": "DUNIA"
//           }
//         ]
//       },
//       {
//         "id": "8",
//         "name": "Other Services",
//         "Services": [
//           {
//             "service_name": "SyTPRA",
//             "service_code": "SYTRA"
//           },
//           {
//             "service_name": "Charities",
//             "service_code": "CHARITIES"
//           }
//         ]
//       }
//     ]
//   }
// }

// ✅ 30) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "1",
    "searchGsmOrSecret": "",
    "type": "2",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "15ce14efbd1cf2372db6f4c3b4007d6e86d3a277b711c2c47389bd3f8ff1a9d0",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "تمت العملية بنجاح",
//   "data": {
//     "data": [
//       {
//         "transactionNo": "600402514192",
//         "date": "2026-02-14 15:46:20",
//         "from": "0936369266",
//         "to": "0986121503",
//         "status": "1",
//         "amount": "500",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "500",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600401415073",
//         "date": "2026-02-13 03:18:19",
//         "from": "0993227060",
//         "to": "03363877",
//         "status": "1",
//         "amount": "5400",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "5400",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600398823074",
//         "date": "2026-02-10 07:01:30",
//         "from": "0991790341",
//         "to": "0986121503",
//         "status": "1",
//         "amount": "1800",
//         "feeOnMerchant": "0",
//         "fee": "0",
//         "net": "1800",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       }
//     ]
//   }
// }

// ✅ 31) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "2",
    "searchGsmOrSecret": "",
    "type": "2",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "ce64fa82ffe1a93fcab5538a43e095355af5521653e97a9ddc871cda20be2553",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-998",
//   "message": "No data found",
//   "data": null
// }

// ✅ 32) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "1",
    "searchGsmOrSecret": "",
    "type": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "63649506304f64224fa00b0be93e4b23f86ad928b42676f0e4109ca881f1c1b7",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "تمت العملية بنجاح",
//   "data": {
//     "data": [
//       {
//         "transactionNo": "600402656519",
//         "date": "2026-02-14 18:27:46",
//         "from": "0986121503",
//         "to": "0990210184",
//         "status": "1",
//         "amount": "100",
//         "feeOnMerchant": "0",
//         "fee": "1.50",
//         "net": "101.50",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600399667484",
//         "date": "2026-02-11 00:41:39",
//         "from": "0986121503",
//         "to": "24774420",
//         "status": "1",
//         "amount": "1200",
//         "feeOnMerchant": "0",
//         "fee": "2",
//         "net": "1202",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600399654494",
//         "date": "2026-02-11 00:15:47",
//         "from": "0986121503",
//         "to": "02488802",
//         "status": "1",
//         "amount": "500",
//         "feeOnMerchant": "0",
//         "fee": "2",
//         "net": "502",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600391767644",
//         "date": "2026-02-01 23:34:29",
//         "from": "0986121503",
//         "to": "35368945",
//         "status": "1",
//         "amount": "1",
//         "feeOnMerchant": "0",
//         "fee": "0.75",
//         "net": "1.75",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600380315478",
//         "date": "2026-01-20 02:44:06",
//         "from": "0986121503",
//         "to": "02488802",
//         "status": "1",
//         "amount": "1",
//         "feeOnMerchant": "0",
//         "fee": "0.75",
//         "net": "1.75",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600380311933",
//         "date": "2026-01-20 02:12:40",
//         "from": "0986121503",
//         "to": "14386417",
//         "status": "1",
//         "amount": "1",
//         "feeOnMerchant": "0",
//         "fee": "0.75",
//         "net": "1.75",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       },
//       {
//         "transactionNo": "600380305482",
//         "date": "2026-01-20 01:32:34",
//         "from": "0986121503",
//         "to": "02488802",
//         "status": "1",
//         "amount": "1",
//         "feeOnMerchant": "0",
//         "fee": "0.75",
//         "net": "1.75",
//         "channel": "Akrab Elik",
//         "rechargeAmount": "",
//         "tax": "",
//         "payMode": ""
//       }
//     ]
//   }
// }

// ✅ 33) customerHistory (Form URL Encoded)
// Returns paginated Cash transaction history (incoming/outgoing by type and page).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/customerHistory", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "pageNumber": "2",
    "searchGsmOrSecret": "",
    "type": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "sortType": "1",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "channelName": "4",
    "lang": "1",
    "hash": "f9a4635d1251f32dec935e69ad89aba3d664f218deafb24b4b6824ac7088382c",
    "status": "2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-998",
//   "message": "No data found",
//   "data": null
// }

// ✅ 34) refresh_balance (JSON POST)
// Refreshes and returns current Syriatel Cash merchant/customer balance.
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/refresh_balance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    hash: "423d29e9589bebe0c5d36143e0ea9e0d68ed08ecf525649dde2d36ef00969def"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "CODE": 1,
//         "MESSAGE": "Success",
//         "HAS_MERCHANT_S_A": 0,
//         "MERCHANT_BALANCE": 0,
//         "HAS_CUSTOMER_S_A": 1,
//         "CUSTOMER_BALANCE": 5241.08
//       }
//     ]
//   }
// }

// ✅ 35) checkAccountRefreshBalance (JSON POST)
// Checks Syriatel Cash account status: balance, PIN, features list (QR, transfer, bills, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/checkAccountRefreshBalance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "5885941",
    firstUse: "1",
    hash: "cb0a2e9ef44f04d5b2c7680da9bf9016d50697a9dc9662476f84fbe32bf59944"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "-83",
//   "message": "Sorry, the entered GSM does not have a Syriatel Cash account.",
//   "data": null
// }

// ✅ 36) checkAccountRefreshBalance (JSON POST)
// Checks Syriatel Cash account status: balance, PIN, features list (QR, transfer, bills, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/checkAccountRefreshBalance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    firstUse: "1",
    hash: "ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "hasMerchantSubaccount": "0",
//         "merchantBalance": "0",
//         "hasCustomerSubaccount": "1",
//         "customerBalance": "5241.08",
//         "hasPinCode": "1",
//         "isLocked": "0",
//         "FEATURES": [
//           {
//             "featureId": "2",
//             "appearanceStatus": "1",
//             "name": "Scan QR Code",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_qr_payment.png"
//           },
//           {
//             "featureId": "1",
//             "appearanceStatus": "1",
//             "name": "Generate QR Code",
//             "description": "This action helps you to receive amounts via QR code you can create with adding the amount you want, so the other party can scan this code and do the action.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           },
//           {
//             "featureId": "3",
//             "appearanceStatus": "1",
//             "name": "Manual Payment",
//             "description": "This process enables you to pay manually by entering the merchant’s code/GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_manual_payment.png"
//           },
//           {
//             "featureId": "4",
//             "appearanceStatus": "1",
//             "name": "Manual Transfer",
//             "description": "This process enables you to transfer manually by entering the customer’s code/GSM and the amount you wish to transfer.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_transfer.png"
//           },
//           {
//             "featureId": "0",
//             "appearanceStatus": "1",
//             "name": "History",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_history.png"
//           },
//           {
//             "featureId": "11",
//             "appearanceStatus": "1",
//             "name": "Security Settings",
//             "description": "Please choose a protection level for your account: fingerprint, facial recognition, or a PIN code. If authentication fails, a PIN code will be required to verify your identity.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/login_settings.png"
//           },
//           {
//             "featureId": "10",
//             "appearanceStatus": "1",
//             "name": "Mobile Bills Payment",
//             "description": "This process enables you to pay your mobile bills for postpaid lines and charge your prepaid cards by entering the GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/syriatel_logo_v4.png"
//           },
//           {
//             "featureId": "6",
//             "appearanceStatus": "1",
//             "name": "Merchants List",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_merchant_list.png"
//           },
//           {
//             "featureId": "7",
//             "appearanceStatus": "1",
//             "name": "Syriatel Cash Sub-dealers",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_subdealers.png"
//           },
//           {
//             "featureId": "12",
//             "appearanceStatus": "1",
//             "name": "ISP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/isp_icon.png"
//           },
//           {
//             "featureId": "5",
//             "appearanceStatus": "1",
//             "name": "SEP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_sep.png"
//           },
//           {
//             "featureId": "13",
//             "appearanceStatus": "0",
//             "name": "Loan",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/loan_icon.png"
//           },
//           {
//             "featureId": "14",
//             "appearanceStatus": "1",
//             "name": "Payment Others",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/other.png"
//           },
//           {
//             "featureId": "17",
//             "appearanceStatus": "0",
//             "name": "QR",
//             "description": "QR Code contains data (Customer or Merchant GSM/code) and cash amount can be added for payment and transfer transactions. Via QR codes, customer can pay and transfer amounts by generating or scanning QR codes",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           }
//         ]
//       }
//     ]
//   }
// }

// ✅ 37) checkAccountRefreshBalance (JSON POST)
// Checks Syriatel Cash account status: balance, PIN, features list (QR, transfer, bills, etc.).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/features/ePayment/checkAccountRefreshBalance", {
  method: "POST",
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: JSON.stringify({
    appVersion: "5.6.0",
    mobileManufaturer: "samsung",
    mobileModel: "SM-S931B",
    lang: "1",
    systemVersion: "Android+v15",
    deviceId: "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    userId: "4359406",
    firstUse: "1",
    hash: "ad300ab11491d0615250d9fc6f716f6e46b784499015a4669c4c1440c700a3bd"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Done",
//   "data": {
//     "data": [
//       {
//         "hasMerchantSubaccount": "0",
//         "merchantBalance": "0",
//         "hasCustomerSubaccount": "1",
//         "customerBalance": "5241.08",
//         "hasPinCode": "1",
//         "isLocked": "0",
//         "FEATURES": [
//           {
//             "featureId": "2",
//             "appearanceStatus": "1",
//             "name": "Scan QR Code",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_qr_payment.png"
//           },
//           {
//             "featureId": "1",
//             "appearanceStatus": "1",
//             "name": "Generate QR Code",
//             "description": "This action helps you to receive amounts via QR code you can create with adding the amount you want, so the other party can scan this code and do the action.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           },
//           {
//             "featureId": "3",
//             "appearanceStatus": "1",
//             "name": "Manual Payment",
//             "description": "This process enables you to pay manually by entering the merchant’s code/GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_manual_payment.png"
//           },
//           {
//             "featureId": "4",
//             "appearanceStatus": "1",
//             "name": "Manual Transfer",
//             "description": "This process enables you to transfer manually by entering the customer’s code/GSM and the amount you wish to transfer.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_transfer.png"
//           },
//           {
//             "featureId": "0",
//             "appearanceStatus": "1",
//             "name": "History",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_history.png"
//           },
//           {
//             "featureId": "11",
//             "appearanceStatus": "1",
//             "name": "Security Settings",
//             "description": "Please choose a protection level for your account: fingerprint, facial recognition, or a PIN code. If authentication fails, a PIN code will be required to verify your identity.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/login_settings.png"
//           },
//           {
//             "featureId": "10",
//             "appearanceStatus": "1",
//             "name": "Mobile Bills Payment",
//             "description": "This process enables you to pay your mobile bills for postpaid lines and charge your prepaid cards by entering the GSM and the amount you wish to pay.",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/syriatel_logo_v4.png"
//           },
//           {
//             "featureId": "6",
//             "appearanceStatus": "1",
//             "name": "Merchants List",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_merchant_list.png"
//           },
//           {
//             "featureId": "7",
//             "appearanceStatus": "1",
//             "name": "Syriatel Cash Sub-dealers",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_subdealers.png"
//           },
//           {
//             "featureId": "12",
//             "appearanceStatus": "1",
//             "name": "ISP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/isp_icon.png"
//           },
//           {
//             "featureId": "5",
//             "appearanceStatus": "1",
//             "name": "SEP",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_sep.png"
//           },
//           {
//             "featureId": "13",
//             "appearanceStatus": "0",
//             "name": "Loan",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/loan_icon.png"
//           },
//           {
//             "featureId": "14",
//             "appearanceStatus": "1",
//             "name": "Payment Others",
//             "description": "",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/other.png"
//           },
//           {
//             "featureId": "17",
//             "appearanceStatus": "0",
//             "name": "QR",
//             "description": "QR Code contains data (Customer or Merchant GSM/code) and cash amount can be added for payment and transfer transactions. Via QR codes, customer can pay and transfer amounts by generating or scanning QR codes",
//             "img_path": "https://wservices.syriatel.sy/img/Shortcuts/ic_ep_generate_qr.png"
//           }
//         ]
//       }
//     ]
//   }
// }

// ✅ 38) check (Form URL Encoded)
// Validates the Syriatel Cash PIN before sensitive actions (e.g. transfer).
// Paste this in browser console:

fetch("https://cash-api.syriatel.sy/Wrapper/app/7/SS2MTLGSM/ePayment/pinCode/check", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 15; SM-S931B Build/AP3A.240905.015.A2)",
    "Accept-Encoding": "gzip"
  },
  body: new URLSearchParams({
    "appVersion": "5.6.0",
    "mobileManufaturer": "samsung",
    "mobileModel": "SM-S931B",
    "pinCode": "0000",
    "lang": "1",
    "systemVersion": "Android+v15",
    "deviceId": "ffffffff-ffac-e209-ffff-ffffef05ac4a",
    "userId": "4359406",
    "hash": "5911873577e12abb7ec781ecc46a35b8ee2a449bf454d575456b47ba507565d2"
  }).toString()
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));

// Response:
// {
//   "code": "1",
//   "message": "Success",
//   "data": {
//     "data": null
//   }
// }

// Captured hashes and CAPTURED_SETTOKEN_TOKEN are in src/constants.js. Do not require this file.
