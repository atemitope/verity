# Authentication & Server Sync

Google OAuth sign-in with per-account state persistence, deployed on Railway.
Auth is **additive and opt-in**: signed-out users keep the original 100% on-device
(localStorage) experience. Signing in enables cross-device sync of your profile.

## Architecture

- **Frontend** — the existing React/Vite SPA. In dev it runs on Vite (`:5173`) and
  proxies `/api/*` to the backend. In production the backend serves the built `dist/`.
- **Backend** (`server/`) — Express app exposing:
  - `GET  /api/auth/google` → start Google OAuth (PKCE)
  - `GET  /api/auth/google/callback` → exchange code, upsert user, set session cookie
  - `GET  /api/auth/me` → current user or `401`
  - `POST /api/auth/logout` → clear session
  - `GET/PUT /api/state` → the signed-in user's app state (JSONB), auth-required
- **Session** — signed JWT in an `HttpOnly`, `SameSite=Lax`, `Secure`-in-prod cookie
  (`csp_session`). Stateless; no server-side session table.
- **Database** — Postgres. Tables `users` and `user_state` are created idempotently on
  boot (`server/schema.sql`).

## Environment variables

See `server/.env.example`. Required: `DATABASE_URL`, `GOOGLE_CLIENT_ID`,
`GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `APP_URL`, `SESSION_SECRET`.
Optional: `PORT` (default `8080`), `NODE_ENV`.

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Google Cloud setup

1. Google Cloud Console → **APIs & Services → Credentials → Create Credentials →
   OAuth client ID → Web application**.
2. **Authorized redirect URIs** — add both:
   - `http://localhost:8080/api/auth/google/callback` (local dev)
   - `https://<your-railway-domain>/api/auth/google/callback` (production)
3. Copy the Client ID and Client Secret into your env vars.
4. Configure the OAuth consent screen (scopes: `openid`, `email`, `profile`).

## Local development

```bash
# 1. Backend env
cp server/.env.example server/.env      # then fill in the values
#    - DATABASE_URL: a local Postgres or the Railway DATABASE_URL
#    - GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback
#    - APP_URL=http://localhost:5173

# 2. Install
npm install
npm install --prefix server

# 3. Run (two terminals)
node server/index.js     # backend on :8080 (creates tables on first boot)
npm run dev              # frontend on :5173 (proxies /api -> :8080)
```

Open http://localhost:5173 and click **Sign in**.

## Deploy to Railway

1. Create a Railway project from this repo (uses `railway.json`).
2. Add the **Postgres** plugin — it injects `DATABASE_URL` automatically.
3. Set service variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
   `GOOGLE_REDIRECT_URI` (the production callback), `APP_URL` (the Railway domain),
   `SESSION_SECRET`, and `NODE_ENV=production`.
4. Deploy. The build runs `npm run build` then installs server deps; the start command
   is `node server/index.js`, which serves both the API and the built SPA. Tables are
   created on first boot.
