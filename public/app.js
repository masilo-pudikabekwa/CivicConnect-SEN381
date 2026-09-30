// Minimal browser client for the M2 baseline. Talks only to the /api endpoints.
// All server data is rendered with textContent (never innerHTML) to avoid script injection.
const state = { token: sessionStorage.getItem('token'), user: null, meta: null };
const $ = (sel) => document.querySelector(sel);

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fields = data.error?.fields ? ': ' + Object.entries(data.error.fields).map(([k, v]) => `${k} ${v}`).join('; ') : '';
    throw new Error((data.error?.message || `Request failed (${res.status})`) + fields);
  }
  return data;
}

function show(message, isError = false) {
  const el = $('#message');
  el.textContent = message;
  el.classList.toggle('error', isError);
  el.hidden = false;
}

function fillSelect(select, values) {
  for (const v of values) select.append(new Option(v.replace('_', ' '), v));
}

function render() {
  const role = state.user?.role;
  $('#auth-section').hidden = !!state.user;
  $('#session').hidden = !state.user;
  $('#whoami').textContent = state.user ? `${state.user.email} (${role})` : '';
  $('#report-section').hidden = role !== 'CITIZEN';
  $('#status-section').hidden = !state.user;
  $('#staff-section').hidden = !['PERSONNEL', 'ADMIN'].includes(role);
  if ($('#staff-section').hidden === false) loadReports();
}

async function loadSession() {
  if (!state.token) return render();
  try {
    state.user = await api('/auth/me');
  } catch {
    state.token = null;
    sessionStorage.removeItem('token');
  }
  render();
}

$('#auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const creds = { email: form.get('email'), password: form.get('password') };
  try {
    if (e.submitter?.dataset.action === 'register') {
      await api('/auth/register', { method: 'POST', body: creds });
    }
    const { token, user } = await api('/auth/login', { method: 'POST', body: creds });
    state.token = token;
    state.user = user;
    sessionStorage.setItem('token', token);
    show(`Signed in as ${user.email}`);
    e.target.reset();
    render();
  } catch (err) {
    show(err.message, true);
  }
});

$('#logout').addEventListener('click', () => {
  state.token = null;
  state.user = null;
  sessionStorage.removeItem('token');
  show('Signed out');
  render();
});

$('#report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const report = await api('/reports', { method: 'POST', body: Object.fromEntries(new FormData(e.target)) });
    show(`Report submitted. Your reference number is ${report.reference} (status: ${report.status}).`);
    e.target.reset();
  } catch (err) {
    show(err.message, true);
  }
});

$('#status-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const reference = new FormData(e.target).get('reference').trim();
  const dl = $('#status-result');
  try {
    const r = await api(`/reports/${encodeURIComponent(reference)}`);
    dl.replaceChildren();
    for (const [label, value] of [
      ['Reference', r.reference],
      ['Status', r.status.replace('_', ' ')],
      ['Category', r.category],
      ['Location', r.location],
      ['Submitted', new Date(r.submittedAt).toLocaleString()],
      ['Last updated', new Date(r.lastUpdated).toLocaleString()],
    ]) {
      const dt = document.createElement('dt');
      dt.textContent = label;
      const dd = document.createElement('dd');
      dd.textContent = value;
      dl.append(dt, dd);
    }
    dl.hidden = false;
  } catch (err) {
    dl.hidden = true;
    show(err.message, true);
  }
});

async function loadReports() {
  const params = new URLSearchParams([...new FormData($('#filter-form'))].filter(([, v]) => v));
  const tbody = $('#report-rows');
  try {
    const reports = await api(`/reports?${params}`);
    tbody.replaceChildren();
    for (const r of reports) {
      const tr = document.createElement('tr');
      for (const v of [r.reference, r.category, r.location, r.status.replace('_', ' '), new Date(r.lastUpdated).toLocaleString()]) {
        const td = document.createElement('td');
        td.textContent = v;
        tr.append(td);
      }
      const action = document.createElement('td');
      if (r.allowedNext.length) {
        const select = document.createElement('select');
        select.append(new Option('Move to…', ''));
        fillSelect(select, r.allowedNext);
        select.addEventListener('change', () => changeStatus(r.reference, select.value));
        action.append(select);
      } else {
        action.textContent = '—';
      }
      tr.append(action);
      tbody.append(tr);
    }
  } catch (err) {
    show(err.message, true);
  }
}

async function changeStatus(reference, status) {
  if (!status) return;
  try {
    await api(`/reports/${encodeURIComponent(reference)}/status`, { method: 'PATCH', body: { status } });
    show(`${reference} moved to ${status.replace('_', ' ')}`);
  } catch (err) {
    show(err.message, true);
  }
  loadReports();
}

$('#filter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  loadReports();
});

(async function init() {
  state.meta = await api('/reports/meta');
  fillSelect($('#report-form [name=category]'), state.meta.categories);
  fillSelect($('#filter-form [name=category]'), state.meta.categories);
  fillSelect($('#filter-form [name=status]'), Object.keys(state.meta.transitions));
  loadSession();
})();
