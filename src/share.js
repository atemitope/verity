// Thin client for the private profile-share link API.
// The owner-facing routes use credentials:'include' (session cookie); the
// public profile fetch deliberately does not, since anyone with the link
// can view it without signing in.

const opts = { credentials: 'include' };

/** Returns the signed-in user's current share token, or null if none. */
export async function getShareStatus() {
  try {
    const res = await fetch('/api/share', opts);
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

/** Creates (or returns the existing) share token. Returns the token or null on failure. */
export async function createShareLink() {
  try {
    const res = await fetch('/api/share', { method: 'POST', ...opts });
    if (!res.ok) return null;
    const data = await res.json();
    return data.token ?? null;
  } catch {
    return null;
  }
}

/** Revokes the signed-in user's share link. Returns true on success. */
export async function revokeShareLink() {
  try {
    const res = await fetch('/api/share', { method: 'DELETE', ...opts });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetches a shared profile by token. No auth — public route. Returns null if not found. */
export async function fetchSharedProfile(token) {
  try {
    const res = await fetch(`/api/share/${encodeURIComponent(token)}/profile`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
