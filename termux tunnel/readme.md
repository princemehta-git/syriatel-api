# Mobile Reverse SSH SOCKS Proxy (Termux → VPS) — Production Setup Guide

This guide explains how to create a **permanent SOCKS proxy on a VPS using a mobile phone’s IP**, using Termux and reverse SSH tunneling.

This setup is:

* Persistent
* Auto-reconnect
* Survives reboot
* Survives airplane mode toggle
* Requires no manual intervention
* Production safe

---

# Architecture Overview

```
Phone (Termux)
   ↓ Reverse SSH Tunnel
VPS (SSH server + systemd service)
   ↓ SOCKS5 Proxy
Node / curl / apps use proxy
```

---

# Requirements

## Phone Requirements

Install these apps from F-Droid:

* Termux
* Termux:Boot
* Termux:API

DO NOT install Termux from Play Store.

---

## VPS Requirements

* Ubuntu / Debian VPS
* Root access
* Open port 22

---

# PART 1 — PHONE SETUP (TERMUX)

Open Termux.

---

## Step 1 — Update Termux

```
pkg update -y
pkg upgrade -y
```

---

## Step 2 — Install required packages

```
pkg install openssh autossh termux-api -y
```

---

## Step 3 — Find phone username

```
whoami
```

Example output:

```
u0_a858 | u0_a242
```

Save this value. This is your PHONE_USERNAME.

---

## Step 4 — Generate SSH key on PHONE

```
ssh-keygen -t ed25519
```

Press Enter for all prompts.

This creates:

```
~/.ssh/id_ed25519
~/.ssh/id_ed25519.pub
```

---

## Step 5 — Copy phone public key

```
cat ~/.ssh/id_ed25519.pub
```

Copy the output.

---

# PART 2 — VPS SETUP

Login to VPS:

```
ssh root@YOUR_VPS_IP
```

---

## Step 6 — Add phone key to VPS

```
nano ~/.ssh/authorized_keys
```

Paste phone public key.

Save.

Set permissions:

```
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

## Step 7 — Test SSH from PHONE → VPS

On phone:

```
ssh root@YOUR_VPS_IP
```

It should login WITHOUT password.

Exit:

```
exit
```

---

# PART 3 — CREATE TUNNEL SCRIPT ON PHONE

Copy the script from this repo: `termux tunnel/termux/tunnel.sh.txt` into `~/tunnel.sh` on the phone (e.g. paste into `nano ~/tunnel.sh`). Edit `SERVER` if your VPS IP is different.

**Script behavior:** Single instance (second run exits cleanly), 30s between retries (avoids port 2222 conflict on VPS), fewer log lines so the screen does not fill with "Checking network..." / "Cleaning old sessions..." / "Starting tunnel..." every few seconds.

After saving, fix Windows line endings if you copied from a PC:

```
sed -i 's/\r$//' ~/tunnel.sh
```

Save.

Make executable:

```
chmod +x ~/tunnel.sh
```

Test manually:

```
bash ~/tunnel.sh
```

---

# PART 4 — CREATE VPS → PHONE SSH KEY

On VPS:

```
ssh-keygen -t ed25519 -f ~/.ssh/phone_proxy_key
```

Press Enter.

Copy public key:

```
cat ~/.ssh/phone_proxy_key.pub
```

---

## Step 8 — Add VPS key to PHONE

On PHONE:

```
nano ~/.ssh/authorized_keys
```

Paste VPS key.

Save.

Fix permissions:

```
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Restart sshd:

```
pkill sshd
sshd
```

---

# PART 5 — CREATE VPS PROXY SERVICE

On VPS:

```
nano /etc/systemd/system/syrian-proxy.service
```

```

[Unit]
Description=Mobile SOCKS Proxy
After=network.target

[Service]
Type=simple
User=root

# Safe cleanup (ignore failure)
ExecStartPre=-/usr/bin/pkill -f "ssh.*-D 127.0.0.1:1081"

# Main proxy command
ExecStart=/usr/bin/ssh \
-i /root/.ssh/phone_proxy_key \
-o StrictHostKeyChecking=no \
-o ServerAliveInterval=30 \
-o ServerAliveCountMax=3 \
-o TCPKeepAlive=yes \
-o ExitOnForwardFailure=yes \
-N -D 127.0.0.1:1081 \
-p 2222 \
u0_a242@127.0.0.1

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Save.

Reload systemd:

```
systemctl daemon-reload
```

Enable auto-start:

```
systemctl enable syrian-proxy
```

Start service:

```
systemctl restart syrian-proxy
```

Check status:

```
systemctl status syrian-proxy
```

Should show:

```
active (running)
```

---

# PART 6 — TEST PROXY

On VPS:

```
curl --proxy socks5h://127.0.0.1:1081 ifconfig.me
```

It should show phone IP.

---

# PART 7 — AUTO START TUNNEL ON PHONE BOOT

## Step A — Create boot script

```
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start.sh
```

Paste:

```
#!/data/data/com.termux/files/usr/bin/bash

sleep 10

export PATH="/data/data/com.termux/files/usr/bin:$PATH"
export HOME="/data/data/com.termux/files/home"

termux-wake-lock

nohup bash ~/tunnel.sh >> ~/tunnel.log 2>&1 &
```

Save.

Make executable:

```
chmod +x ~/.termux/boot/start.sh
```

Why this is different from a simple `bash ~/tunnel.sh`:

* `sleep 10` — gives Android time to fully initialize the network stack after boot
* `export PATH` and `HOME` — Termux:Boot runs in a minimal environment, these may not be set
* `termux-wake-lock` — prevents Android from sleeping the process
* `nohup ... &` — runs tunnel in background so the boot script exits cleanly
* `>> ~/tunnel.log 2>&1` — logs output for debugging

---

## Step B — Open Termux:Boot app (CRITICAL)

Open the Termux:Boot app at least ONCE after installing it.

It will show a blank/empty screen. That is normal.

This step REGISTERS the Android boot receiver. Without this, Termux:Boot will NEVER trigger on reboot.

---

## Step C — Auto-start tunnel when manually opening Termux

The boot script ONLY runs on device reboot via Termux:Boot. If you manually open Termux, it does NOT execute boot scripts.

To also auto-start the tunnel when you open Termux manually:

```
nano ~/.bashrc
```

Add at the bottom:

```
# Auto-start tunnel if not already running
if ! pgrep -f "autossh.*2222" > /dev/null 2>&1; then
    echo "Tunnel not running. Starting..."
    nohup bash ~/tunnel.sh >> ~/tunnel.log 2>&1 &
    disown
    echo "Tunnel started in background. Check: tail -f ~/tunnel.log"
else
    echo "Tunnel already running."
fi
```

Save.

Now every time you open Termux (new session), it will check if the tunnel is already running. If not, it starts it automatically.

---

# PART 8 — IMPORTANT ANDROID SETTINGS

## Battery optimization — ALL THREE APPS

Go to Settings → Apps for EACH of these:

* Termux
* Termux:Boot
* Termux:API

For each app:

Set Battery to:

```
Unrestricted
```

Disable:

```
Battery optimization
```

Add ALL THREE to:

```
Never sleeping apps
```

## Notification permission (Android 13+)

For EACH of these apps, enable notifications:

```
Settings → Apps → Termux → Notifications → Enable
Settings → Apps → Termux:Boot → Notifications → Enable
```

This is required on Android 13+ for background execution.

## Autostart permission (some phone brands)

On Xiaomi / MIUI / Realme / OPPO / Vivo / Samsung:

```
Settings → Apps → Termux → Autostart → Enable
Settings → Apps → Termux:Boot → Autostart → Enable
```

Or check:

```
Settings → Battery → Battery optimization → All apps → Termux → Don't optimize
```

---

# PART 9 — VERIFY EVERYTHING

On VPS:

```
systemctl status syrian-proxy
```

and

```
ss -tlnp | grep 1081
```

and

```
curl --proxy socks5h://127.0.0.1:1081 ifconfig.me
```

---

# PART 10 — TEST AUTO RECOVERY

Test these scenarios:

* Turn airplane mode ON → OFF
* Reboot phone
* Reboot VPS
* Switch WiFi / mobile data

Proxy should recover automatically.

---

# PART 11 — TROUBLESHOOTING BOOT

If the tunnel does not start after phone reboot:

## Check 1 — Was Termux:Boot opened at least once?

Open Termux:Boot app. You should see a blank screen. Close it.

## Check 2 — Does boot script exist and have correct permissions?

```
ls -la ~/.termux/boot/start.sh
```

Should show `-rwx` (executable). If not:

```
chmod +x ~/.termux/boot/start.sh
```

## Check 3 — Check tunnel log after reboot

After rebooting, wait 30 seconds, open Termux, then:

```
cat ~/tunnel.log
```

If the file exists and has output, the boot script DID execute.
If the file does not exist, the boot script did NOT run.

## Check 4 — Is autossh running?

```
pgrep -f autossh
```

If it returns a PID, the tunnel is running.

## Check 5 — Manual test of boot script

```
bash ~/.termux/boot/start.sh
```

Then check:

```
pgrep -f autossh
tail -f ~/tunnel.log
```

## Check 6 — Battery optimization killing the process?

If tunnel starts but dies after a few minutes, battery optimization is killing it.
Recheck PART 8 for all three apps.

---

# Useful Commands

Restart proxy service (on VPS):

```
systemctl restart syrian-proxy
```

Restart tunnel manually (on phone):

```
pkill -f autossh
bash ~/tunnel.sh
```

Check if tunnel is running (on phone):

```
pgrep -f autossh
```

Check tunnel log (on phone):

```
tail -20 ~/tunnel.log
```

Check tunnel port (on VPS):

```
ss -tlnp | grep 2222
```

---

# Final Result

You now have a production-grade mobile SOCKS proxy.

Features:

* Persistent tunnel
* Automatic reconnect
* Automatic restart
* Fully autonomous

---

# Proxy Address

```
socks5h://127.0.0.1:1081
```

---

# Done
