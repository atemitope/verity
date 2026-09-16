// Thin client for the auth + per-user state API.
// All calls use credentials:'include' so the HttpOnly session cookie is sent.

import { DEV_AUTH, DEV_USER, isDevSignedIn, setDevSignedIn } from './devMode';

const opts = { credentials: 'include' };

/** Returns the current user object, or null if not signed in. */
export async function fetchMe() {
  // Local dev only; stripped from production builds. See devMode.js.
  if (DEV_AUTH) return isDevSignedIn() ? DEV_USER : null;

  try {
    const res = await fetch('/api/auth/me', opts);
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

/** Redirect the browser into the Google OAuth flow. */
export function login() {
  if (DEV_AUTH) {
    // Google can't redirect back to localhost, so simulate the round trip.
    setDevSignedIn(true);
    window.location.reload();
    return;
  }
  window.location.href = '/api/auth/google';
}

/** Clear the server session. Returns true on success. */
export async function logout() {
  if (DEV_AUTH) {
    setDevSignedIn(false);
    return true;
  }

  try {
    const res = await fetch('/api/auth/logout', { method: 'POST', ...opts });
    return res.ok;
  } catch {
    return false;
  }
}

/** Permanently delete the signed-in user's account and all data. Returns true on success. */
export async function deleteAccount() {
  if (DEV_AUTH) {
    // Nothing real to delete; behave as if it succeeded so the UI flow works.
    setDevSignedIn(false);
    return true;
  }

  try {
    const res = await fetch('/api/auth/me', { method: 'DELETE', ...opts });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch the signed-in user's server-saved state, or null if none/unauth. */
export async function getServerState() {
  // No backend locally — returning null makes App seed the server from local
  // state, which is the same path a brand-new account takes.
  if (DEV_AUTH) return null;

  try {
    const res = await fetch('/api/state', opts);
    if (!res.ok) return null;
    const data = await res.json();
    return data.state ?? null;
  } catch {
    return null;
  }
}

/** Persist the signed-in user's state to the server. Returns true on success. */
export async function putServerState(state) {
  // Local state already persists to localStorage; skip the absent backend
  // rather than logging a failed request on every keystroke.
  if (DEV_AUTH) return true;

  try {
    const res = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
      ...opts,
    });
    return res.ok;
  } catch {
    return false;
  }
}
