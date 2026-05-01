const AUTH_KEY = 'profile.adminAuth';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function setCredentials(username, password) {
  const token = btoa(`${username}:${password}`);
  sessionStorage.setItem(AUTH_KEY, token);
}

export function clearCredentials() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthed() {
  return !!sessionStorage.getItem(AUTH_KEY);
}

function authHeader() {
  const token = sessionStorage.getItem(AUTH_KEY);
  return token ? { Authorization: `Basic ${token}` } : {};
}

export async function getProfile() {
  const r = await fetch(`${API_BASE}/profile`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function getAdminProfile() {
  const r = await fetch(`${API_BASE}/admin/profile`, { headers: authHeader() });
  if (r.status === 401) {
    clearCredentials();
    throw new Error('UNAUTHORIZED');
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function saveProfile(profile) {
  const r = await fetch(`${API_BASE}/admin/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(profile)
  });
  if (r.status === 401) {
    clearCredentials();
    throw new Error('UNAUTHORIZED');
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function postContact(payload) {
  const r = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
