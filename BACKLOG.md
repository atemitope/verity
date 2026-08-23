# Backlog

Running list of deferred work, maintained together as we go. Not a roadmap or
priority order - just things we've deliberately chosen not to do yet, with
enough context to pick back up later. Add an entry whenever something gets
punted; remove it once it's done (check the commit/PR that closed it).

## Deployment & access

- **Add Google OAuth test users, or complete full app verification.** The
  consent screen is in Testing mode (Google Cloud project `insights-501414`,
  client "CSP Web") - only allow-listed test users can sign in today (1/100
  used). Publishing to Production is blocked: Google's Branding page requires
  an Authorized domain you can verify ownership of via Search Console, and
  `up.railway.app` is Railway's domain, not ours - so full verification
  likely needs a real owned domain first. Fastest path for external testers
  right now: add their emails under Test users.
- **Custom domain.** Not set up - currently sharing
  `verity-app-production-5dc6.up.railway.app` directly. Once a domain is
  bought: `railway domain <domain> --service verity-app`, add the DNS record
  Railway gives you, then update `APP_URL` + `GOOGLE_REDIRECT_URI` (Railway
  vars) and the Authorized redirect URI (Google Console) to match. Unblocks
  full OAuth verification too (see above).
- **Enable Railway's Serverless/Sleep on `verity-app`.** Dashboard-only
  toggle (no CLI support, confirmed) - idle-scales the service to cut cost
  under the $5/mo Hobby plan. Trade-off: first request after idle can 502
  while it wakes. Service → Settings → look for "Serverless".

## Auth & security follow-ups (from the original auth build)

- **Server-side session revocation.** Sessions are stateless signed JWTs with
  no revocation list - rotating `SESSION_SECRET` invalidates everyone at
  once, but there's no way to kill a single session early.
- **Rate limiting / CSRF hardening.** Currently just SameSite cookies + the
  OAuth `state`/PKCE flow. No rate limiting on auth or state endpoints.
- **Additional OAuth providers** (GitHub, Microsoft, etc.) - the Arctic-based
  setup leaves room for this, not implemented.
- **Team-mode data sharing between accounts** - stays local/opt-in per the
  existing consent model; no server-side team sharing.

## Product / UX

- **Wire up a visible "Reset profile" control.** `handleReset` exists in
  `src/App.jsx` but isn't connected to any button anywhere in the UI -
  dead code today. The only way to reset locally is clearing `localStorage`
  by hand.
- **Full emoji-to-icon-library migration.** The homepage redesign
  deliberately kept emoji (the app uses them everywhere - nav, buttons,
  section headings) rather than mixing in an icon library for one page.
  A real migration is its own project.

## Design polish (flagged by the design-review hook, left as-is pending a call)

- **Gamification chrome (level badge, XP pill, tier badge) reads as an "AI
  purple/violet palette."** Flagged repeatedly across the session. Passes
  contrast; the concern is purely aesthetic distinctiveness. Needs a product
  decision on the actual palette, not a technical fix.
- **Spectrum score bars animate `width`, not `transform`.** Flagged as a
  layout-thrashing pattern; assessed as a false positive since the bars are
  `rounded-full` pills (a `scaleX` transform would squish the end caps). Worth
  a second look only if the bar treatment itself changes.

## Dependencies

- **jsPDF security advisories.** Several CVEs listed against jspdf@3.x
  (AcroForm/addJS/image-decoder related). Assessed as not exploitable here -
  the PDF export never uses those APIs, only renders the user's own profile
  data via `text()`/`rect()`. The "fixed" version (4.2.1) is a breaking major
  upgrade, so we stayed on 3.x. Revisit if the PDF export ever grows to touch
  more of jsPDF's surface.
