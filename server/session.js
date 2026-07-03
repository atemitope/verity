import { SignJWT, jwtVerify } from 'jose';

const isProd = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set — provide a random 32+ byte secret.');
}
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);

export const SESSION_COOKIE = 'csp_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

const baseCookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/',
};

/** Sign a session JWT for the given user id and set it as an HttpOnly cookie. */
export async function setSessionCookie(res, userId) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SEC}s`)
    .sign(secret);

  res.cookie(SESSION_COOKIE, token, {
    ...baseCookieOpts,
    maxAge: SESSION_MAX_AGE_SEC * 1000,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(SESSION_COOKIE, baseCookieOpts);
}

/** Verify the session cookie; returns the user id (number) or null. */
export async function getSessionUserId(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    const uid = Number(payload.uid);
    return Number.isInteger(uid) ? uid : null;
  } catch {
    return null;
  }
}

/** Express middleware: requires a valid session, attaches req.userId. */
export async function requireAuth(req, res, next) {
  const userId = await getSessionUserId(req);
  if (!userId) return res.status(401).json({ error: 'unauthenticated' });
  req.userId = userId;
  next();
}
