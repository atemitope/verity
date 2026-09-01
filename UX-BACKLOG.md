# UX backlog: from colour-first to behaviour-first

> **Status.** Shipped: P0.1, P0.2, P0.3, P1.1, P1.2, P2.1, P2.2, P3.2, P4.1,
> P4.2, and P4.3 in part. Still open: P3.1 in part — the Report's sections are
> now question-phrased but still render as visually uniform cards.
>
> Two items changed shape once the code was opened: P0.3 turned out to be a
> **correctness bug** rather than a copy fix, and P4.1 surfaced that "Profile"
> was being used for two different things (see those sections).

A user-centered review of Verity, written for the everyday visitor rather than
someone who already knows how the app works. Separate from `BACKLOG.md` (which
tracks deferred technical work) because this is a product-direction document:
it argues for a reframe, then lists the work that reframe implies.

---

## The diagnosis

Verity is a **behavioural** assessment, but the interface is organised around
**colour** and **arithmetic**. Colour should be the shorthand for a set of
behaviours - a memorable label and a visual system. Right now it *is* the
content: the colour name is the headline, and the supporting detail is a score
out of 6.

The behavioural substance already exists and is genuinely good. `db.json` gives
every colour `typical_behaviours`, `communication_cues`, `strengths`,
`blind_spots`, `under_pressure`, `best_environment`, and `how_to_work_with`,
and `generateReport()` (`src/scoring.js`) already assembles all of it. The
problem is not missing content. The problem is **where that content sits and
what gets top billing.**

One finding sharpens this more than any other. `db.json` contains an entire
`interpretation_rules` block - authored, plain-language explanations of what
the scores actually *mean* - and a grep across `src/` confirms **it is never
read anywhere in the frontend.** Not in Results, not in Report, nowhere. The
app computes the metrics that block was written to explain, prints them as bare
decimals, and leaves the explanations unused in the database. Several items
below are simply "render the text we already wrote."

Three things follow from that, and they're the spine of this backlog:

1. **The payoff moment shows maths instead of meaning.** After 32 questions,
   the Results page gives you a colour name and four numbers.
2. **Numbers are shown without the meanings that `db.json` already defines**,
   so they read as jargon.
3. **Content is organised by report section, not by the question a person
   actually has** ("how do I communicate?", "what am I like under pressure?").

---

## What a user actually experiences today

Not hypothetical - this is the live Results page after completing the
assessment, in order:

```
YOUR DOMINANT ENERGY
🟡 Sunshine Yellow
connection, possibility, optimism, influence, variety
Secondary 🔵 Cool Blue          Confidence 87%

Spectrum Scores
🟡 Sunshine Yellow  Dominant   5.42 / 6
🔵 Cool Blue                   3.18 / 6
🟢 Earth Green                 2.05 / 6
🔴 Fiery Red                   1.44 / 6

🔍 Explainability Panel
  Raw Points & Normalisation    Cool Blue  19.0  36.0  3.180 …
  Formula: 6 × raw ÷ max
  Derived Metrics    Top gap 1.800 · Range 3.980 · Balance index 0.420
                     Red–Green polarity 0.100 · Blue–Yellow polarity 0.200
  Confidence = 20 + 25×spread + 25×top_gap + 30×forced_alignment (−15 if spread < 1)
```

The words **communication**, **pressure**, **strengths**, and **how to work
with you** do not appear anywhere on this page. To learn a single thing about
their own behaviour, the user has to notice and click "Read Full Report."

That's the whole problem in one screen: maximum technical precision, zero
behavioural insight, at the exact moment the user is most invested.

---

## Constraints any fix must respect

From `CSP_Dev_Context.docx` and `db.json`'s own `report_quality_rubric` - these
are non-negotiable and they rule out the lazy fix of "just delete the maths":

- **Explainability is mandatory.** Raw points, max points, normalised scores,
  derived metrics and confidence inputs must be shown. So the work is to
  *demote and progressively disclose* them, never to remove them.
- **All content must come from `db.json`.** Never hardcode trait or report
  text. (One existing violation, see P0.3.)
- **Non-clinical language only**, and the Insights Discovery® disclaimer must
  appear wherever results are shown.
- **Privacy default: results stay on-device**; sharing stays explicit opt-in.

Worth noting the rubric's own must-have list already asks for what's missing:
*"Plain language and behaviour anchors"* and *"Explainability: show numbers
**and how they map to text**."* Today the app does the numbers half and skips
the mapping. This backlog is largely about honouring a standard the project
already set for itself.

---

## P0 - The payoff moment

### P0.1 Lead Results with behaviour, not colour and scores · **M** · ✅ shipped
**Problem.** The first thing a user sees after investing 32 questions is a
label and four decimals. Nothing tells them what they're *like*.

**Fix.** Restructure the Results page so the first screen answers "what does
this say about me?" Open with three or four behaviour statements drawn from the
dominant colour's `typical_behaviours` (e.g. *"Defines criteria, checks
assumptions, asks for evidence"*) framed as recognition - "You'll probably
recognise yourself in these." The colour becomes the **label for that
pattern**, sitting alongside it rather than above it. Scores move below the
behaviour. The explainability panel stays exactly where it is (already
collapsed) and keeps every number.

### P0.2 Show what the numbers mean - the text is already in `db.json` · **S** · ✅ shipped
**Problem.** The page prints `Red–Green polarity 0.100` and `Blue–Yellow
polarity 0.200`. Meaningless to a normal person.

**Evidence.** `db.interpretation_rules.polarities` already defines them:
`red_vs_green` = *"Task and pace versus people and harmony"*; `blue_vs_yellow`
= *"Precision and analysis versus spontaneity and enthusiasm"*. Verified: the
frontend never reads `interpretation_rules` at all, so neither definition has
ever reached a user. `src/components/Results.jsx:129-130` prints only
`polarityRedGreen.toFixed(3)`.

**Fix.** Render each polarity as a labelled spectrum with a marker -
`Task & pace ←—•——→ People & harmony` - using the `db.json` definition as the
end labels. Identical data, now legible, and it satisfies the rubric's
"how they map to text" requirement with content that already exists.

### P0.3 Balance Profile was misclassifying profiles · **S** · ✅ shipped

> **Upgraded during implementation.** This was filed as a copy fix. It was a
> correctness bug. `balanceIndex = 1 - range/6`, so the shipped thresholds
> (`0.8` / `0.5`) put the band boundaries at range 1.2 and 3.0 — but
> `db.json` specifies 1 and 2.5. A profile with range 2.7 was told
> *"Moderately differentiated"* when the spec classifies it as `high`, whose
> guidance is materially different advice: *"Watch for interpersonal friction
> in low-energy areas."* Now classified by `describeBalance()` against the
> db thresholds, with a regression test pinning the 2.7 case.

**Problem.** `src/components/Results.jsx:167-170` hardcoded three strings for
the Balance Profile ("Flat profile — your energies are broadly balanced…").

**Evidence.** This breaks the "never hardcode content" constraint, and
`db.interpretation_rules.balance_vs_intensity.guidance` holds canonical text
that is more useful than what's shipped - it tells the user what to *do*
("Interpret cautiously. Validate with behaviour checks.", "Watch for
interpersonal friction in low-energy areas.").

**Fix.** Read from `db.json`. Small change, fixes a constraint violation and
improves the copy at the same time.

---

## P1 - Finding your profile

### P1.1 There is no "my profile" in the navigation · **M** · ✅ shipped
**Problem.** The nav is `Home · Quiz · Results · Report · Challenges ·
Achievements · Team`. The Profile page isn't in it at all - it's reachable only
through a small avatar/Settings chip in the header corner. A user thinking
"where's my profile?" has three plausible-sounding options (Results, Report,
Profile-that-isn't-listed) and no correct one.

**Fix.** Rename navigation to what a person is looking for rather than what the
system calls it, and give the profile a real home. Results and Report are an
internal distinction (scores vs. narrative) that shouldn't be exposed as two
peer destinations - either merge them or make one clearly a section of the
other.

### P1.2 A first-time visitor's nav is mostly padlocks · **S** · ✅ shipped
**Problem.** Before completing the assessment, four of seven nav items render
greyed out with 🔒. The first structural message is "most of this is denied to
you," before the app has said what any of it is.

**Fix.** Either hide locked destinations until they're relevant, or reframe
them as a visible preview of what's coming.

---

## P2 - Colour as label, not as content

### P2.1 Colour names are undecodable on first contact · **S** · ✅ shipped
**Problem.** "Sunshine Yellow" carries no meaning for a newcomer. The homepage
lists four colour names each followed by a comma-separated keyword dump
(*"connection, possibility, optimism, influence, variety"*), which reads as
tags rather than a description of a person.

**Fix.** Never show a colour name on first encounter without a behavioural
sentence next to it. On the homepage energy cards, lead with the behaviour and
let the colour be the tag.

### P2.2 Invert the hierarchy everywhere colour currently headlines · **M** · ✅ shipped
**Problem.** The Results hero, the Report cover, the PDF cover, the share page,
and the Journey recap all headline the **colour name**. That's the core
critique: the label is being presented as the insight.

**Fix.** Make the behavioural pattern the headline and the colour the visual
system (gradient, chip, accent). Apply consistently across those five surfaces
so the framing is coherent wherever someone lands - including on a shared link,
which is often a stranger's first ever exposure to Verity.

---

## P3 - Making the report readable

### P3.1 Nine near-identical bullet-list cards · **M** · ◑ partly shipped
**Problem.** Profile Summary, Strengths, Possible Challenges, Communication
Tips, Under Pressure, How to Work With You, Next Steps, and the 14-Day
Experiment are rendered as visually interchangeable card + bullet blocks. There
is no hierarchy, so nothing signals what matters most, and it's hard to
navigate back to a specific part later.

**Fix.** Differentiate the domains visually and structurally. Give the report a
contents/jump affordance so it's returnable-to, not just a single long scroll.

### P3.2 Technical scores interrupt the narrative in position 2 · **S**
**Problem.** "Spectrum Scores & Explainability" (`19 / 36 pts → 3.18/6`) sits
directly between Profile Summary and Strengths, breaking the story with maths
at the earliest possible moment.

**Fix.** Move it to the end of the report as an appendix. Explainability is
preserved - it's just no longer the second thing you read about yourself.

---

## P4 - The structural change

### P4.1 Organise around life questions, not report sections · **L** · ✅ shipped

> **Shipped in two places, and it surfaced a naming collision.** "Profile" in
> the nav meant *account settings* — while the user's complaint was about
> finding their *behavioural* profile. Those are now separate: **Profile** is
> the behavioural profile, browsable by question via `src/domains.js`; account
> and app settings moved to **Settings**, reached from the header chip that
> already existed. The Report keeps its `db.json`-spec'd section list but is
> now phrased as questions, and the PDF was realigned so screen and export
> don't drift.
**Problem.** This is the deepest version of the original critique. Content is
currently structured the way the *report* is built, not the way a person
*thinks*. Someone wondering "how do I come across in meetings?" or "why do I
clash with my manager?" has no way to ask that.

**Evidence.** `db.json` is already organised by behavioural domain -
`communication_cues`, `how_to_work_with`, `under_pressure`, `best_environment`,
`typical_behaviours`, `strengths`, `blind_spots`. The domain model exists; the
UI flattens it into a linear document.

**Fix.** Promote those domains to first-class, navigable areas of a person's
profile, phrased as questions:

| Domain | `db.json` source |
|---|---|
| How you communicate | `communication_cues` |
| How you behave day to day | `typical_behaviours` |
| What you're great at | `strengths` |
| What to watch for | `blind_spots` |
| How you are under pressure | `under_pressure` |
| Where you do your best work | `best_environment` |
| How others should work with you | `how_to_work_with` |

This is what turns Verity from "a test that outputs a colour" into "a profile
of how you work." Everything in P0–P3 moves toward it; this is the item that
makes the reframe structural rather than cosmetic.

### P4.2 A low score is never explained · **S** · ✅ shipped

> Shipped as "Where you'll feel friction" on the Profile. The useful reading of
> a low score isn't "you're bad at this" — it's where your instincts differ most
> from other people, which is exactly the friction `interpretation_rules` warns
> about. Shows what people who lead with that energy tend to do, and its own
> `how_to_work_with` as guidance for working with them. Returns nothing at all
> for a flat profile, rather than inventing a weak spot from noise.
**Problem.** `Fiery Red 1.44 / 6` - is that a problem? A neutral fact?
Something to work on? The app never says.

**Fix.** Surface guidance for low energies. `interpretation_rules` already
warns to "watch for interpersonal friction in low-energy areas" - that's a
genuinely useful thing to tell someone about their lowest colour, and it's
sitting unused.

### P4.3 System vocabulary in user-facing copy · **S** · ◑ partly shipped
**Problem.** "Spectrum Scores", "Explainability Panel", "Derived Metrics",
"Forced alignment", "Balance index", "Top gap", "Polarity" are all internal
engineering terms shown directly to users.

**Fix.** A copy pass across user-facing surfaces. Keep the precise terms inside
the (collapsed) explainability section where they're appropriate and expected;
use plain language everywhere else.

---

## Explicitly not doing

- **Removing explainability.** Mandated by the project's own constraints. All
  of the above demotes or contextualises it; none of it deletes anything.
- **Hardcoding nicer copy into components.** Improvements must land in
  `db.json` or read from it. P0.3 exists specifically to fix a case where this
  rule was already broken.
- **Softening the disclaimer or drifting toward clinical language.** The
  non-clinical constraint holds; "behaviour anchors" means concrete and
  recognisable, not diagnostic.

## Suggested order

P0.2 and P0.3 first - both are small, both are pure wins, and both are fixed by
reading text that already exists in `db.json`. They also prove the central
thesis cheaply: the app is more technical than its own content requires.

Then P0.1 (the payoff moment), then P1 (findability), then P2/P3, with P4.1 as
the structural target the rest is building toward.
