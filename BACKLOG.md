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

- **Full emoji-to-icon-library migration.** The homepage redesign
  deliberately kept emoji (the app uses them everywhere - nav, buttons,
  section headings) rather than mixing in an icon library for one page.
  A real migration is its own project.

## Now possible with real accounts + email (evaluated, not built)

Recorded during the Profile page build once accounts had actual identities
and email addresses attached. Sizing: S = hours, M = a day or two, L = a real
project.

- **[M, needs infra]** Email re-engagement/reminders - e.g. turning the
  report's existing "14-Day Experiment" daily check-in prompts (already in
  `db.json`) into actual scheduled emails. Needs a transactional email
  provider (Resend/Postmark), a scheduler, unsubscribe handling, and a real
  opt-in preference - don't ship a fake toggle before the capability exists.
- **[S, needs infra]** Email yourself your report - reuses the existing
  `pdfExport.js`/JSON export logic server-side, sent via whatever provider
  gets picked for the item above.
- **[L]** Real team invites via email - today's Team mode has people
  manually enter teammates' scores; a real invite-and-join flow (invite
  token, teammate signs in with their own Google account, auto-links into a
  shared team) needs a new `teams` table and membership model.
- **[S]** Self-service data export ("download everything you have on me" -
  a JSON dump of the `users` + `user_state` row). Natural pairing with
  account deletion (shipped in the Profile page).
- **[M]** Alternative sign-in method (e.g. email magic-link) alongside
  Google OAuth, for people who'd rather not use Google. Distinct from the
  "additional OAuth providers" item above - this is a different mechanism
  (no OAuth provider, just a one-time emailed link).
- **[L, strategic]** Org/workspace accounts - if this tool ends up used
  inside a company, "team" could become a first-class concept (shared
  dashboards, manager visibility with consent). A product direction more
  than a feature, worth a deliberate call before building toward it.
- **[S, low priority]** Lightweight internal admin view (signup counts,
  completion rates) - now trivially possible with a real `users` table. Not
  obviously wanted for a personal-development tool; noting the option exists.
- **[Follow-up on shipped work]** Delete-account currently uses a typed-
  email confirmation gate as a proportionate MVP mitigation. A stronger gate
  (require a fresh OAuth round-trip before allowing deletion) has real value
  given sessions are 30-day non-revocable JWTs - worth it if this ever holds
  more sensitive data.

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
