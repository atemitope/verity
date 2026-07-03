import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { ensureSchema } from './db.js';
import authRoutes from './auth.js';
import stateRoutes from './state.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8080;

const app = express();
app.set('trust proxy', 1); // Railway terminates TLS at a proxy; needed for Secure cookies.

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));

// In dev the SPA runs on the Vite server (5173) and proxies /api here, so same-origin
// cookies work. CORS with credentials is a belt-and-suspenders fallback for direct calls.
if (!isProd) {
  app.use(
    cors({
      origin: process.env.APP_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );
}

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/state', stateRoutes);

// In production the backend also serves the built SPA.
if (isProd) {
  const distDir = join(__dirname, '..', 'dist');
  app.use(express.static(distDir));
  // SPA fallback for any non-API route.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(join(distDir, 'index.html'));
  });
}

ensureSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`[server] listening on :${PORT} (${isProd ? 'production' : 'development'})`));
  })
  .catch((err) => {
    console.error('[server] failed to start:', err);
    process.exit(1);
  });
