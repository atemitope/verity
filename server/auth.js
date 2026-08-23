import { Router } from 'express';
import { Google, generateState, generateCodeVerifier } from 'arctic';
import { decodeJwt } from 'jose';
import { query } from './db.js';
import { setSessionCookie, clearSessionCookie, getSessionUserId, requireAuth } from './session.js';

const isProd = process.env.NODE_ENV === 'production';

for (const key of ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'APP_URL']) {
  if (!process.env[key]) throw new Error(`${key} is not set.`);
}

const google = new Google(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

const STATE_COOKIE = 'google_oauth_state';
const VERIFIER_COOKIE = 'google_code_verifier';
const TX_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/',
  maxAge: 10 * 60 * 1000, // 10 minutes to complete the flow
};

const router = Router();

// Step 1 — redirect the user to Google's consent screen.
router.get('/google', (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile']);

  res.cookie(STATE_COOKIE, state, TX_COOKIE_OPTS);
  res.cookie(VERIFIER_COOKIE, codeVerifier, TX_COOKIE_OPTS);
  res.redirect(url.toString());
});

// Step 2 — Google redirects back here with a code; exchange it and start a session.
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.[STATE_COOKIE];
  const codeVerifier = req.cookies?.[VERIFIER_COOKIE];

  // Clear the transaction cookies regardless of outcome.
  res.clearCookie(STATE_COOKIE, { ...TX_COOKIE_OPTS, maxAge: undefined });
  res.clearCookie(VERIFIER_COOKIE, { ...TX_COOKIE_OPTS, maxAge: undefined });

  if (!code || !state || !storedState || !codeVerifier || state !== storedState) {
    return res.status(400).send('Invalid OAuth state. Please try signing in again.');
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, codeVerifier);
    const claims = decodeJwt(tokens.idToken());
    const { sub, email, name, picture } = claims;
    if (!sub) return res.status(400).send('Google did not return a user id.');

    const result = await query(
      `INSERT INTO users (google_sub, email, name, avatar_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_sub) DO UPDATE
         SET email = EXCLUDED.email,
             name = EXCLUDED.name,
             avatar_url = EXCLUDED.avatar_url,
             updated_at = now()
       RETURNING id`,
      [sub, email ?? null, name ?? null, picture ?? null],
    );

    await setSessionCookie(res, result.rows[0].id);
    res.redirect(process.env.APP_URL);
  } catch (err) {
    console.error('[auth] callback failed:', err);
    res.status(500).send('Authentication failed. Please try again.');
  }
});

// Current user (used by the SPA on load to detect an active session).
router.get('/me', async (req, res) => {
  const userId = await getSessionUserId(req);
  if (!userId) return res.status(401).json({ user: null });

  const { rows } = await query(
    'SELECT id, email, name, avatar_url FROM users WHERE id = $1',
    [userId],
  );
  if (rows.length === 0) return res.status(401).json({ user: null });

  const u = rows[0];
  res.json({ user: { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatar_url } });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

// Permanently delete the account and all its data (cascades to user_state).
// Only clear the session cookie once the delete has actually succeeded.
router.delete('/me', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.userId]);
  } catch (err) {
    console.error('[auth] account deletion failed:', err);
    return res.status(500).json({ error: 'Failed to delete account. Please try again.' });
  }
  clearSessionCookie(res);
  res.status(204).end();
});

export default router;
