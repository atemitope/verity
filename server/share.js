import { Router } from 'express';
import { randomBytes } from 'node:crypto';
import { query } from './db.js';
import { requireAuth } from './session.js';

const router = Router();

// Current share status for the signed-in user.
router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT token FROM profile_shares WHERE user_id = $1', [req.userId]);
  res.json({ token: rows.length ? rows[0].token : null });
});

// Idempotent create: returns the existing token if one exists, else mints one.
router.post('/', requireAuth, async (req, res) => {
  const token = randomBytes(24).toString('base64url');
  const { rows } = await query(
    `INSERT INTO profile_shares (token, user_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING token`,
    [token, req.userId],
  );
  if (rows.length) return res.json({ token: rows[0].token });

  // Someone already had a token — return theirs instead of the unused one just generated.
  const existing = await query('SELECT token FROM profile_shares WHERE user_id = $1', [req.userId]);
  res.json({ token: existing.rows[0].token });
});

// Revoke — deletes the row, immediately cutting off access.
router.delete('/', requireAuth, async (req, res) => {
  await query('DELETE FROM profile_shares WHERE user_id = $1', [req.userId]);
  res.status(204).end();
});

// Public — no auth. Only result data goes out here, never account/security
// fields (no email, no user id, no session-relevant data).
router.get('/:token/profile', async (req, res) => {
  const { rows } = await query(
    `SELECT u.name, s.state->'scores' AS scores, s.state->'report' AS report
     FROM profile_shares p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN user_state s ON s.user_id = p.user_id
     WHERE p.token = $1`,
    [req.params.token],
  );
  if (!rows.length || !rows[0].scores) return res.status(404).json({ error: 'not_found' });

  const { name, scores, report } = rows[0];
  res.json({ name, scores, report });
});

export default router;
