// Thin client for the auth + per-user state API.
// All calls use credentials:'include' so the HttpOnly session cookie is sent.

const opts = { credentials: 'include' };

/** Returns the current user object, or null if not signed in. */
export async function fetchMe() {
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
  window.location.href = '/api/auth/google';
}

/** Clear the server session. Returns true on success. */
export async function logout() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST', ...opts });
    return res.ok;
  } catch {
    return false;
  }
}

/** Permanently delete the signed-in user's account and all data. Returns true on success. */
export async function deleteAccount() {
  try {
    const res = await fetch('/api/auth/me', { method: 'DELETE', ...opts });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch the signed-in user's server-saved state, or null if none/unauth. */
export async function getServerState() {
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
