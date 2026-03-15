-- Syriatel Cash API – MySQL schema
-- Run manually if needed, or let the server auto-create on startup.

CREATE DATABASE IF NOT EXISTS syriatel_api
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE syriatel_api;

-- Linked accounts (after sign-in or OTP). Keyed by apiKey.
CREATE TABLE IF NOT EXISTS accounts (
  api_key VARCHAR(64) NOT NULL PRIMARY KEY,
  gsm VARCHAR(24) NOT NULL,
  password VARCHAR(255) NULL,
  name VARCHAR(255) NULL COMMENT 'Optional friendly name for this account',
  pin VARCHAR(32) NULL COMMENT 'Default PIN for transfers (plain text)',
  account_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(32) NOT NULL,
  user_key VARCHAR(128) NOT NULL,
  account_data JSON NOT NULL COMMENT 'Array of { gsm, user_ID, userKey, ... } per line',
  device JSON NOT NULL COMMENT 'Device payload for API requests',
  linked_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pending OTP (before OTP step). Keyed by apiKey.
CREATE TABLE IF NOT EXISTS pending_otp (
  api_key VARCHAR(64) NOT NULL PRIMARY KEY,
  gsm VARCHAR(24) NOT NULL,
  password VARCHAR(255) NULL,
  device JSON NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
