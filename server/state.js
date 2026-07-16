import { Router } from 'express';
import { query } from './db.js';
import { requireAuth } from './session.js';

const router = Router();

// Return the signed-in user's saved app state (or null if none yet).
router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(
    'SELECT state FROM user_state WHERE user_id = $1',
    [req.userId],
  );
  res.json({ state: rows.length ? rows[0].state : null });
});

// Upsert the signed-in user's app state.
router.put('/', requireAuth, async (req, res) => {
  const state = req.body;
  if (state === null || typeof state !== 'object' || Array.isArray(state)) {
    return res.status(400).json({ error: 'state must be a JSON object' });
  }

  await query(
    `INSERT INTO user_state (user_id, state, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (user_id) DO UPDATE
       SET state = EXCLUDED.state,
           updated_at = now()`,
    [req.userId, state],
  );
  res.status(204).end();
});

export default router;
