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
- **Team-mode data sharing between accounts** - `TeamMode.jsx` is still
  entirely local (one person manually retyping teammates' scores into their
  own browser, nothing server-side, no real other accounts involved). The
  Profile page's private share-link feature is the first *real* cross-account
  sharing in the app, but it's individual-profile-only, not team aggregation
  - see "Real team invites via email" below for what would actually replace
  this.

## Product / UX

- **Full emoji-to-icon-library migration.** The homepage redesign
  deliberately kept emoji (the app uses them everywhere - nav, buttons,
  section headings) rather than mixing in an icon library for one page.
  A real migration is its own project.

## Now possible with real accounts + email (evaluated, not built)

Recorded during the Profile page build once accounts had actual identities
and email addresses attached. Sizing: S = hours, M = a day or two, L = a real
project.

**Market scan (2026-08), the two items below it directly draw on:**
Gallup/CliftonStrengths keeps *multiple* saved results per account, lets you
pick which is "current," and ships "Partnership Insights" comparing two
specific people directly ([Gallup Help Center](https://support.gallup.com/hc/en-us/sections/48762948543635-CliftonStrengths)).
Everything DiSC/Thomas DISC both ship a dedicated "Colleague Compare"/"Team
View" for direct two-person comparison ([DiSC Comparison Reports](https://www.discprofile.com/fac-sup/disc-fac-tools/sample-reports/comparison)).
Insights Discovery (this app's own named comparator) surfaces your profile
inline inside Microsoft Teams during a chat/meeting ([Insights.com](https://www.insights.com/products/insights-discovery/))
- validated, but a materially bigger infra lift (a Teams/Slack app, new
OAuth scopes) than anything else here, not pursued yet. 16Personalities/
Truity confirmed a market gap instead of a pattern to copy: paid report
unlocks, no real 1:1 comparison feature - people just screenshot results.
Spotify Wrapped / Duolingo Year in Review validate a different pattern -
a personalized, shareable recap built from accumulated account history -
which shipped as the Profile page's "Your Verity Journey" view.

- **[M, needs infra]** Email re-engagement/reminders - e.g. turning the
  report's existing "14-Day Experiment" daily check-in prompts (already in
  `db.json`) into actual scheduled emails. Needs a transactional email
  provider (Resend/Postmark), a scheduler, unsubscribe handling, and a real
  opt-in preference - don't ship a fake toggle before the capability exists.
- **[S, needs infra]** Email yourself your report - reuses the existing
  `pdfExport.js`/JSON export logic server-side, sent via whatever provider
  gets picked for the item above.
- **[L] "Compare with a colleague" - designed, ready to build next.** Fully
  specced (not just sized) after a competitive scan turned up that DISC
  ("Colleague Compare"/"Team View") and Gallup ("Partnership Insights") both
  validate direct 1:1 comparison as a real, valued feature - and that
  `TeamMode.jsx` already has decent pairing-analysis *copy*, just fed by
  fake locally-entered data instead of a real second account.
  - **Growth angle**: the invite should work on someone who's never used
    Verity, not just two existing users - `App.jsx` picks up a `?compare=token`
    param, stores it through anonymous quiz-taking, and claiming the
    comparison (and therefore seeing it) requires signing in. That sign-in
    gate is deliberate: it's the acquisition moment.
  - **Model**: new `comparison_invites(token, inviter_user_id,
    invitee_user_id NULL, created_at)` table - a two-sided claim, not a
    one-sided broadcast like the existing view-only `profile_shares` link.
    `GET /api/compare/:token` public for the first look (who invited you,
    still open?); `POST /api/compare/:token/claim` (auth) locks it to the
    second signer.
  - **Tailored output, not templates**: `db.json`'s colour objects already
    have `strengths`, `blind_spots`, `communication_cues`, and
    `how_to_work_with` per colour - real, specific, already-written guidance
    that `TeamMode.jsx` doesn't currently use (it only pulls a fragment of
    `core_drive`, producing the same "Different paces and priorities" string
    for every mismatched pair regardless of which colours are involved). A
    new `src/compare.js` (`buildComparison(personA, personB, db)`) should
    source synergy/friction/how-to-work-with from those fields instead,
    genuinely tailored per pair.
  - Explicitly not an open, searchable directory of all users - that would
    conflict with the app's own "results stay on-device" privacy default.
- **[M]** Saved profile history (multiple snapshots over time). Today
  there's exactly one saved profile per account, always current - retaking
  the quiz overwrites it, no history. A "save a snapshot" action (e.g. "Q1
  2026") plus a small history/comparison view would need a new
  `profile_snapshots` table and isn't just a state-shape change like
  preferences was.
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
