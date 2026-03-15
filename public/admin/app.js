/* Syriatel Cash Admin Panel */

const API_BASE = '/admin/api';
let token = localStorage.getItem('admin_token');
let pendingApiKey = null; // for OTP flow
let pendingName = null;
let pendingPin = null;

// Current transfer context
let transferApiKey = null;
let transferFromGsm = null;

// ─── Auth ───

async function authFetch(url, opts = {}) {
  opts.headers = { ...opts.headers, 'Authorization': 'Bearer ' + token };
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(opts.body);
  }
  const res = await fetch(url, opts);
  if (res.status === 401) {
    doLogout();
    throw new Error('Session expired');
  }
  return res;
}

async function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.querySelector('#login-screen button');
  const btnText = btn && btn.querySelector('.btn-text');
  errEl.textContent = '';
  btn.disabled = true;
  btn.classList.add('loading');
  if (btnText) btnText.textContent = 'Logging in...'; else btn.textContent = 'Logging in...';
  try {
    const res = await fetch(API_BASE + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!data.success) {
      errEl.textContent = data.error || 'Login failed';
      return;
    }
    token = data.token;
    localStorage.setItem('admin_token', token);
    showMainScreen();
  } catch (e) {
    errEl.textContent = 'Connection error';
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
    if (btnText) btnText.textContent = 'Sign In'; else btn.textContent = 'Login';
  }
}

function doLogout() {
  token = null;
  localStorage.removeItem('admin_token');
  document.getElementById('login-screen').style.display = '';
  document.getElementById('main-screen').style.display = 'none';
}

async function showMainScreen() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-screen').style.display = 'block';
  await loadAccounts();
}

// ─── Tabs ───

function showTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  if (name === 'accounts') {
    document.querySelector('.tab:nth-child(1)').classList.add('active');
    document.getElementById('tab-accounts').style.display = 'block';
    loadAccounts();
  } else {
    document.querySelector('.tab:nth-child(2)').classList.add('active');
    document.getElementById('tab-add').style.display = 'block';
    resetAddForm();
  }
}

// ─── Linked Accounts ───

let allAccounts = []; // cached for search filtering

async function loadAccounts() {
  const tbody = document.getElementById('accounts-body');
  const COL_COUNT = 8;
  tbody.innerHTML = '<tr><td colspan="' + COL_COUNT + '" class="loading">Loading...</td></tr>';
  try {
    const res = await authFetch(API_BASE + '/accounts');
    const data = await res.json();
    if (!data.success) {
      tbody.innerHTML = '<tr><td colspan="' + COL_COUNT + '" class="error">' + esc(data.error) + '</td></tr>';
      return;
    }
    allAccounts = data.accounts;
    renderAccounts();
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="8" class="error">Failed to load accounts</td></tr>';
  }
}

function filterAccounts() {
  renderAccounts();
}

function renderAccounts() {
  const tbody = document.getElementById('accounts-body');
  const COL_COUNT = 8;
  const query = (document.getElementById('accounts-search').value || '').trim().toLowerCase();
  const filtered = query
    ? allAccounts.filter(acc =>
        (acc.name || '').toLowerCase().includes(query) ||
        (acc.gsm || '').toLowerCase().includes(query) ||
        (acc.apiKey || '').toLowerCase().includes(query) ||
        (acc.accountId || '').toLowerCase().includes(query) ||
        (acc.pin || '').toLowerCase().includes(query) ||
        (acc.password || '').toLowerCase().includes(query)
      )
    : allAccounts;
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="' + COL_COUNT + '" class="loading">' + (query ? 'No matching accounts.' : 'No accounts linked yet.') + '</td></tr>';
    return;
  }
  tbody.innerHTML = filtered.map(acc => `
    <tr id="row-${esc(acc.apiKey)}" data-search="${esc((acc.name||'') + ' ' + (acc.gsm||'') + ' ' + (acc.apiKey||''))}">
      <td>${esc(acc.name || '—')}</td>
      <td>${esc(acc.gsm)}</td>
      <td>${esc(acc.password || '—')}</td>
      <td class="api-key-cell" title="Click to copy: ${esc(acc.apiKey)}" onclick="copyText('${escAttr(acc.apiKey)}', event)">${esc(acc.apiKey.slice(0, 10))}...</td>
      <td>${esc(acc.pin || '—')}</td>
      <td>${esc(acc.accountId || '—')}</td>
      <td>${formatDate(acc.linkedAt)}</td>
      <td class="actions">
        <button class="btn-sm primary" onclick="showGsms('${escAttr(acc.apiKey)}', '${escAttr(acc.name || acc.gsm)}')">GSMs</button>
        <button class="btn-sm" onclick="editAccount('${escAttr(acc.apiKey)}', '${escAttr(acc.name || '')}', '${escAttr(acc.pin || '')}')">Edit</button>
        <button class="btn-sm danger" onclick="deleteAccount('${escAttr(acc.apiKey)}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showCopiedTooltip(e) {
  const tip = document.createElement('div');
  tip.className = 'copied-tooltip';
  tip.textContent = 'Copied!';
  const x = (e && (e.clientX ?? e.changedTouches?.[0]?.clientX)) ?? window.innerWidth / 2;
  const y = (e && (e.clientY ?? e.changedTouches?.[0]?.clientY)) ?? window.innerHeight / 2;
  tip.style.left = Math.min(Math.max(x - 40, 10), window.innerWidth - 90) + 'px';
  tip.style.top = Math.min(y - 36, window.innerHeight - 50) + 'px';
  document.body.appendChild(tip);
  setTimeout(() => tip.remove(), 1200);
}

function copyText(text, e) {
  const done = () => showCopiedTooltip(e);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, onSuccess) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '0';
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, text.length);
  try {
    const ok = document.execCommand('copy');
    if (ok) onSuccess();
  } catch (err) {
    console.warn('Copy failed:', err);
  } finally {
    document.body.removeChild(ta);
  }
}

async function editAccount(apiKey, currentName, currentPin) {
  const row = document.getElementById('row-' + apiKey);
  if (!row) return;
  const cells = row.children;
  // Replace name and pin cells with inputs (name=0, pin=4, actions=7)
  cells[0].innerHTML = `<input id="edit-name-${apiKey}" value="${esc(currentName)}" placeholder="Name">`;
  cells[4].innerHTML = `<input id="edit-pin-${apiKey}" value="${esc(currentPin)}" placeholder="PIN">`;
  cells[7].innerHTML = `
    <div class="edit-inline">
      <button class="btn-sm success" onclick="saveAccount('${escAttr(apiKey)}')">Save</button>
      <button class="btn-sm" onclick="loadAccounts()">Cancel</button>
    </div>`;
}

async function saveAccount(apiKey) {
  const name = document.getElementById('edit-name-' + apiKey).value.trim() || null;
  const pin = document.getElementById('edit-pin-' + apiKey).value.trim() || null;
  try {
    const res = await authFetch(API_BASE + '/accounts/' + apiKey, {
      method: 'PUT',
      body: { name, pin }
    });
    const data = await res.json();
    if (!data.success) {
      alert('Error: ' + data.error);
      return;
    }
    loadAccounts();
  } catch (e) {
    alert('Failed to save');
  }
}

async function deleteAccount(apiKey) {
  if (!confirm('Are you sure you want to delete this account?')) return;
  try {
    await authFetch(API_BASE + '/accounts/' + apiKey, { method: 'DELETE' });
    loadAccounts();
  } catch (e) {
    alert('Failed to delete');
  }
}

// ─── GSMs ───

async function showGsms(apiKey, label) {
  const modal = document.getElementById('gsm-modal');
  const body = document.getElementById('gsm-modal-body');
  document.getElementById('gsm-modal-title').textContent = 'GSMs – ' + label;
  body.innerHTML = '<div class="loading">Loading GSMs...</div>';
  modal.style.display = 'flex';
  try {
    const res = await fetch('/gsms?apiKey=' + apiKey + '&dbOnly=1');
    const data = await res.json();
    if (data.error) {
      body.innerHTML = renderGsmRefreshButton(apiKey, label) + '<div class="error">' + esc(data.error) + '</div>';
      return;
    }
    const gsms = data.gsms || data.accountData || [];
    if (gsms.length === 0) {
      body.innerHTML = renderGsmRefreshButton(apiKey, label) + '<div class="info">No GSMs found.</div>';
      return;
    }
    body.innerHTML = renderGsmRefreshButton(apiKey, label) + gsms.map(g => `
        <div class="gsm-card">
          <div class="gsm-card-header">
            <strong>${esc(g.gsm)}</strong>
          </div>
          <div class="gsm-card-info">
            Secret Code: ${esc(g.secretCode || '—')} &nbsp;|&nbsp;
            User ID: ${esc(g.user_ID || '—')} &nbsp;|&nbsp;
            Type: ${esc(g.post_OR_PRE || '—')}
          </div>
          <div class="gsm-card-actions">
            <button class="btn-sm primary" onclick="checkBalance('${escAttr(apiKey)}', '${escAttr(g.gsm)}', this)">Balance</button>
            <button class="btn-sm" onclick="showHistory('${escAttr(apiKey)}', '${escAttr(g.gsm)}')">History</button>
            <button class="btn-sm success" onclick="openTransfer('${escAttr(apiKey)}', '${escAttr(g.gsm)}')">Transfer</button>
            <button class="btn-sm" onclick="showAccountInfo('${escAttr(apiKey)}', '${escAttr(g.gsm)}', this)">Account Info</button>
          </div>
          <div id="balance-${esc(apiKey)}-${esc(g.gsm)}"></div>
          <div id="info-${esc(apiKey)}-${esc(g.gsm)}"></div>
        </div>
      `).join('');
  } catch (e) {
    body.innerHTML = renderGsmRefreshButton(apiKey, label) + '<div class="error">Failed to load GSMs</div>';
  }
}

async function refreshGsms(apiKey, label) {
  const body = document.getElementById('gsm-modal-body');
  const btn = body && body.querySelector('.btn-refresh-gsms');
  if (btn) btn.disabled = true;
  const loadingHtml = '<div class="loading">Refreshing from Syriatel (sign-in + secret codes)...</div>';
  if (body) body.innerHTML = loadingHtml;
  try {
    const res = await fetch('/gsms?apiKey=' + apiKey);
    const data = await res.json();
    if (data.error) {
      body.innerHTML = '<div class="error">' + esc(data.error) + '</div>' + renderGsmRefreshButton(apiKey, label);
      return;
    }
    const gsms = data.gsms || data.accountData || [];
    if (gsms.length === 0) {
      body.innerHTML = '<div class="info">No GSMs found.</div>' + renderGsmRefreshButton(apiKey, label);
      return;
    }
    body.innerHTML = renderGsmRefreshButton(apiKey, label) + gsms.map(g => `
      <div class="gsm-card">
        <div class="gsm-card-header">
          <strong>${esc(g.gsm)}</strong>
        </div>
        <div class="gsm-card-info">
          Secret Code: ${esc(g.secretCode || '—')} &nbsp;|&nbsp;
          User ID: ${esc(g.user_ID || '—')} &nbsp;|&nbsp;
          Type: ${esc(g.post_OR_PRE || '—')}
        </div>
        <div class="gsm-card-actions">
          <button class="btn-sm primary" onclick="checkBalance('${escAttr(apiKey)}', '${escAttr(g.gsm)}', this)">Balance</button>
          <button class="btn-sm" onclick="showHistory('${escAttr(apiKey)}', '${escAttr(g.gsm)}')">History</button>
          <button class="btn-sm success" onclick="openTransfer('${escAttr(apiKey)}', '${escAttr(g.gsm)}')">Transfer</button>
          <button class="btn-sm" onclick="showAccountInfo('${escAttr(apiKey)}', '${escAttr(g.gsm)}', this)">Account Info</button>
        </div>
        <div id="balance-${esc(apiKey)}-${esc(g.gsm)}"></div>
        <div id="info-${esc(apiKey)}-${esc(g.gsm)}"></div>
      </div>
    `).join('');
  } catch (e) {
    body.innerHTML = '<div class="error">Failed to refresh GSMs</div>' + renderGsmRefreshButton(apiKey, label);
  }
  if (btn) btn.disabled = false;
}

function renderGsmRefreshButton(apiKey, label) {
  return `<button class="btn-sm primary btn-refresh-gsms" onclick="refreshGsms('${escAttr(apiKey)}', '${escAttr(label)}')" style="margin-bottom:12px">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:4px"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
    Refresh
  </button>`;
}

function closeGsmModal() {
  document.getElementById('gsm-modal').style.display = 'none';
}

// ─── Balance ───

async function checkBalance(apiKey, gsm, btn) {
  const el = document.getElementById('balance-' + apiKey + '-' + gsm);
  el.innerHTML = '<div class="loading">Checking balance...</div>';
  btn.disabled = true;
  try {
    const res = await fetch('/balance?apiKey=' + apiKey + '&gsm=' + gsm);
    const data = await res.json();
    if (data.error) {
      el.innerHTML = '<div class="error">' + esc(data.error) + '</div>';
    } else {
      el.innerHTML = `<div class="balance-display">
        Customer Balance: <strong>${esc(String(data.customerBalance ?? data.CUSTOMER_BALANCE ?? '—'))}</strong>
        &nbsp;|&nbsp; Merchant Balance: <strong>${esc(String(data.merchantBalance ?? data.MERCHANT_BALANCE ?? '—'))}</strong>
      </div>`;
    }
  } catch (e) {
    el.innerHTML = '<div class="error">Failed to check balance</div>';
  }
  btn.disabled = false;
}

// ─── Account Info ───

async function showAccountInfo(apiKey, gsm, btn) {
  const el = document.getElementById('info-' + apiKey + '-' + gsm);
  el.innerHTML = '<div class="loading">Loading...</div>';
  btn.disabled = true;
  try {
    const res = await fetch('/accountInfo?apiKey=' + apiKey + '&gsm=' + gsm);
    const data = await res.json();
    if (data.error) {
      el.innerHTML = '<div class="error">' + esc(data.error) + '</div>';
    } else {
      const info = data.accountInfo || data;
      el.innerHTML = `<div class="balance-display balance-display--info">
        <pre style="font-size:12px;white-space:pre-wrap">${esc(JSON.stringify(info, null, 2))}</pre>
      </div>`;
    }
  } catch (e) {
    el.innerHTML = '<div class="error">Failed to load account info</div>';
  }
  btn.disabled = false;
}

// ─── History ───

let historyApiKey = null;
let historyGsm = null;
let historyPage = 1;
let historyDirection = 'incoming';

async function showHistory(apiKey, gsm, page, direction) {
  historyApiKey = apiKey;
  historyGsm = gsm;
  historyPage = Math.max(1, page || 1);
  if (direction) historyDirection = direction;
  const modal = document.getElementById('history-modal');
  const body = document.getElementById('history-modal-body');
  document.getElementById('history-modal-title').textContent = 'History – ' + gsm;
  body.innerHTML = '<div class="loading">Loading history...</div>';
  modal.style.display = 'flex';
  try {
    const res = await fetch('/history?apiKey=' + apiKey + '&for=' + gsm + '&page=' + historyPage + '&direction=' + historyDirection);
    const data = await res.json();
    if (data.error) {
      body.innerHTML = renderHistoryDirectionTabs() + '<div class="error">' + esc(data.error) + '</div>';
      return;
    }
    const items = data.history || data.transactions || [];
    let html = renderHistoryDirectionTabs();
    if (items.length === 0) {
      html += '<div class="info">No ' + historyDirection + ' transactions found on page ' + historyPage + '.</div>';
      body.innerHTML = html;
      renderHistoryPagination(body);
      return;
    }
    html += '<table class="history-table"><thead><tr>';
    const cols = Object.keys(items[0]);
    cols.forEach(c => { html += '<th>' + esc(c) + '</th>'; });
    html += '</tr></thead><tbody>';
    items.forEach(item => {
      html += '<tr>';
      cols.forEach(c => {
        const v = item[c];
        html += '<td>' + esc(typeof v === 'object' ? JSON.stringify(v) : String(v ?? '')) + '</td>';
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    body.innerHTML = html;
    renderHistoryPagination(body);
  } catch (e) {
    body.innerHTML = renderHistoryDirectionTabs() + '<div class="error">Failed to load history</div>';
  }
}

function renderHistoryDirectionTabs() {
  return `<div class="direction-tabs">
    <button class="direction-tab ${historyDirection === 'incoming' ? 'active' : ''}" onclick="showHistory(historyApiKey, historyGsm, 1, 'incoming')">Incoming</button>
    <button class="direction-tab ${historyDirection === 'outgoing' ? 'active' : ''}" onclick="showHistory(historyApiKey, historyGsm, 1, 'outgoing')">Outgoing</button>
  </div>`;
}

function renderHistoryPagination(container) {
  const div = document.createElement('div');
  div.className = 'history-pagination';
  if (historyPage > 1) {
    const prev = document.createElement('button');
    prev.className = 'btn-sm';
    prev.textContent = 'Previous';
    prev.onclick = () => showHistory(historyApiKey, historyGsm, historyPage - 1, historyDirection);
    div.appendChild(prev);
  }
  const span = document.createElement('span');
  span.textContent = 'Page ' + historyPage;
  span.style.lineHeight = '28px';
  div.appendChild(span);
  const next = document.createElement('button');
  next.className = 'btn-sm';
  next.textContent = 'Next';
  next.onclick = () => showHistory(historyApiKey, historyGsm, historyPage + 1, historyDirection);
  div.appendChild(next);
  container.appendChild(div);
}

function closeHistoryModal() {
  document.getElementById('history-modal').style.display = 'none';
  historyDirection = 'incoming';
}

// ─── Transfer ───

function openTransfer(apiKey, fromGsm) {
  transferApiKey = apiKey;
  transferFromGsm = fromGsm;
  document.getElementById('transfer-modal-title').textContent = 'Transfer from ' + fromGsm;
  document.getElementById('transfer-to').value = '';
  document.getElementById('transfer-amount').value = '';
  document.getElementById('transfer-pin').value = '';
  document.getElementById('transfer-error').textContent = '';
  document.getElementById('transfer-success').textContent = '';
  document.getElementById('transfer-modal').style.display = 'flex';
}

async function doTransfer() {
  const to = document.getElementById('transfer-to').value.trim();
  const amount = document.getElementById('transfer-amount').value.trim();
  const pin = document.getElementById('transfer-pin').value.trim();
  const errEl = document.getElementById('transfer-error');
  const sucEl = document.getElementById('transfer-success');
  errEl.textContent = '';
  sucEl.textContent = '';
  if (!to || !amount) {
    errEl.textContent = 'To and Amount are required';
    return;
  }
  if (!confirm('Transfer ' + amount + ' SYP to ' + to + ' from ' + transferFromGsm + '?')) return;
  let url = '/transfer?apiKey=' + transferApiKey + '&to=' + encodeURIComponent(to) + '&amount=' + encodeURIComponent(amount) + '&from=' + encodeURIComponent(transferFromGsm);
  if (pin) url += '&pin=' + encodeURIComponent(pin);
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      errEl.textContent = data.error;
    } else if (data.success) {
      sucEl.textContent = 'Transfer successful!';
    } else {
      errEl.textContent = JSON.stringify(data);
    }
  } catch (e) {
    errEl.textContent = 'Transfer request failed';
  }
}

function closeTransferModal() {
  document.getElementById('transfer-modal').style.display = 'none';
  transferApiKey = null;
  transferFromGsm = null;
}

// ─── Add New Account ───

function resetAddForm() {
  document.getElementById('signin-form').style.display = '';
  document.getElementById('otp-form').style.display = 'none';
  document.getElementById('add-gsm').value = '';
  document.getElementById('add-password').value = '';
  document.getElementById('add-name').value = '';
  document.getElementById('add-pin').value = '';
  document.getElementById('add-isnew').checked = true;
  document.getElementById('add-otp').value = '';
  document.getElementById('add-error').textContent = '';
  document.getElementById('add-success').textContent = '';
  pendingApiKey = null;
  pendingName = null;
  pendingPin = null;
}

async function doSignin() {
  const gsm = document.getElementById('add-gsm').value.trim();
  const password = document.getElementById('add-password').value;
  pendingName = document.getElementById('add-name').value.trim();
  pendingPin = document.getElementById('add-pin').value.trim();
  const errEl = document.getElementById('add-error');
  const sucEl = document.getElementById('add-success');
  errEl.textContent = '';
  sucEl.textContent = '';
  if (!gsm || !password) {
    errEl.textContent = 'GSM and password are required';
    return;
  }
  try {
    const isnew = document.getElementById('add-isnew').checked ? '1' : '0';
    const res = await fetch('/signin?gsm=' + encodeURIComponent(gsm) + '&password=' + encodeURIComponent(password) + '&isnew=' + isnew);
    const data = await res.json();
    if (!data.success) {
      errEl.textContent = data.message || data.error || 'Sign in failed';
      return;
    }
    pendingApiKey = data.apiKey;
    if (data.needsOtp) {
      document.getElementById('signin-form').style.display = 'none';
      document.getElementById('otp-form').style.display = '';
      return;
    }
    // No OTP needed — account linked
    await saveNewAccountMeta();
    sucEl.textContent = 'Account linked successfully!';
    setTimeout(() => { showTab('accounts'); }, 1500);
  } catch (e) {
    errEl.textContent = 'Connection error';
  }
}

async function doSubmitOtp() {
  const code = document.getElementById('add-otp').value.trim();
  const errEl = document.getElementById('add-error');
  const sucEl = document.getElementById('add-success');
  errEl.textContent = '';
  if (!code) {
    errEl.textContent = 'Enter the OTP code';
    return;
  }
  try {
    const res = await fetch('/otp?apiKey=' + pendingApiKey + '&code=' + encodeURIComponent(code));
    const data = await res.json();
    if (!data.success) {
      errEl.textContent = data.message || data.error || 'Sign in failed';
      return;
    }
    await saveNewAccountMeta();
    sucEl.textContent = 'Account linked successfully!';
    setTimeout(() => { showTab('accounts'); }, 1500);
  } catch (e) {
    errEl.textContent = 'Connection error';
  }
}

async function doResendOtp() {
  const errEl = document.getElementById('add-error');
  errEl.textContent = '';
  try {
    const res = await fetch('/resendOtp?apiKey=' + pendingApiKey);
    const data = await res.json();
    if (data.error) {
      errEl.textContent = data.error;
    } else {
      errEl.textContent = '';
      document.getElementById('add-success').textContent = 'OTP resent.';
    }
  } catch (e) {
    errEl.textContent = 'Failed to resend OTP';
  }
}

async function saveNewAccountMeta() {
  if (!pendingApiKey) return;
  const updates = {};
  if (pendingName) updates.name = pendingName;
  if (pendingPin) updates.pin = pendingPin;
  if (Object.keys(updates).length === 0) return;
  try {
    await authFetch(API_BASE + '/accounts/' + pendingApiKey, {
      method: 'PUT',
      body: updates
    });
  } catch (e) { console.warn('Failed to save account name/pin:', e); }
}

// ─── Helpers ───

function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

/** Escape for use inside single-quoted onclick attribute strings. */
function escAttr(str) {
  return esc(str).replace(/'/g, '&#39;').replace(/\\/g, '&#92;');
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}

// ─── Init ───

document.addEventListener('DOMContentLoaded', async () => {
  if (token) {
    try {
      const res = await fetch(API_BASE + '/accounts', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        showMainScreen();
        return;
      }
    } catch { /* token invalid */ }
    doLogout();
  }
});

// Close modals on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const gsm = document.getElementById('gsm-modal');
    const hist = document.getElementById('history-modal');
    const trans = document.getElementById('transfer-modal');
    if (gsm && gsm.style.display === 'flex') closeGsmModal();
    else if (hist && hist.style.display === 'flex') closeHistoryModal();
    else if (trans && trans.style.display === 'flex') closeTransferModal();
  }
});

// Close modals on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal') || e.target.classList.contains('modal-backdrop')) {
    const modal = e.target.classList.contains('modal') ? e.target : e.target.closest('.modal');
    if (modal) {
      if (modal.id === 'gsm-modal') closeGsmModal();
      else if (modal.id === 'history-modal') closeHistoryModal();
      else if (modal.id === 'transfer-modal') closeTransferModal();
    }
  }
});
