# MatchaMD — Paid Tier Redesign

Status: proposal for owner review. Implements the guidance from the 2026-10-04
session: search and data stay free; human review stays, on a stated time window.

## The problem being fixed

12 of ~15 advertised premium features were never gated, and entitlement was
resolved from `localStorage` plus a client-writable table. A $9.99 tier whose
headline feature is "the 50-state database" is also a bad product decision
independent of the security hole: charging someone $10 to look up a hospital
generates refunds and App Store complaints.

So this is two changes: **what we charge for**, and **making it actually
enforced**.

---

## Tier 1 — Free (the acquisition engine)

Deliberately generous, because an IMG downloads this app once, decides whether to
keep it, and mostly uses search.

| Feature | Why free |
|---|---|
| Program search across all 50 states + DC | This is why the app gets installed. Paywalling it kills the funnel. |
| Program detail pages | Same — a dead link feels broken, not upsold |
| Program directory, all 12,709 records | The data is already public via ACGME/NRMP |
| Saved searches | Retention, not monetization; cheap to run |
| ECFMG / USMLE milestone stepper | Trust-building; the thing they came for |
| Deadlines calendar | Same |
| Cost calculator | Drives the premium story indirectly |
| Community notes and scam reports, **read** | The differentiator; must be visible to convert anyone |

**The test:** if a user can go from install to a shortlist of real programs
without paying, the free tier is working.

## Tier 2 — MatchaMD+ ($12.99/mo or $99/yr)

Software value: personalization and automation that a static directory cannot do.

| Feature | Basis |
|---|---|
| **"Why this program" fit explanations** | `calculateFitScore()` already computes scored `reasons` against the user's own profile (Step 2 score vs program minimum, visa sponsorship, USCE requirement, grad-year cutoff). Today the UI shows badges instead of the explanation. Turning computed reasons into a sentence per program is pure leverage — the logic exists and is tested. |
| Ranked shortlist | "Your top 15 programs for your profile, re-ranked as you edit" |
| Match-day deadline alerts (push) | Most time-sensitive fact in the app. Drives daily opens through a months-long season. |
| ERAS cost planner wired to real programs | `MatchCostCalculator.jsx` takes manual geography input; `programs` already carries `program_size`, `city`, `state`. |
| LoR / document checklist per program | IMGs miss ERAS deadlines constantly; this is retention. |
| Full data archive export | Already built (`src/utils/profileExporter.js`). Now gated. |

## Tier 3 — MatchaMD Pro ($39/mo, includes one review)

**Owner decision 2026-10-04: the review moves to a 14-day window.** The 5–7 business
day promise below is retired; see the capacity section for why this is the
right call at current scale.

The only tier that involves a human, and therefore the only one with a real
cost to serve. Keep it narrow.

| Feature | Basis |
|---|---|
| **1 physician CV + personal statement review, 14-day turnaround** | Owner-reviewed. Owner-confirmed 2026-10-04. |
| Research abstract / study design critique | Same reviewer capacity, cheaper to deliver. |
| Everything in MatchaMD+ | |
| Priority support | |

### The time-window commitment

Per your guidance, the review product carries a **stated window rather than an
optimistic one**:

- **14 calendar days**, quoted on the purchase screen before checkout
- Shown as a range where honest: "10–14 business days"
- Displayed on the order as a countdown with the due date
- If it misses 14 days, the user gets a full refund **or** a second review
  credit — their choice. This costs nothing in practice and removes the single
  worst failure mode of a service like this.
- A queue position the user can see, so silence doesn't read as neglect

**Why 14 and not "5–7 business days":** the current pricing page advertises 5–7
business days. If that is not reliably deliverable by one reviewer, advertising
it is a promise you'll break, and the refund/review-credit policy is a
disclosure problem, not just a policy problem. Either staff it to 7 days or
quote 14. I would quote 14 and let it usually come in under that.

**Capacity math — how many people will use it?** (owner asked 2026-10-04)

Measured from the live database on 2026-10-04 (`mmfixpgfaskufmrfmzcc`):

| Signal | Value |
|---|---|
| Registered users (`auth.users`) | **10** |
| Completed onboarding | 5 |
| Set a target specialty | 5 |
| Set a graduation year | 4 |
| Set a Step 2 score | 3 |
| Subscription rows | 2 |
| One-time purchases | 6 |

**The honest answer: at today's scale the review will not overwhelm you.** Ten
registered users, five of whom finished onboarding and set a specialty. Even a
100% conversion rate on a Pro tier is five to ten reviews per season — a few
hours of your time.

That number is also the whole problem for planning purposes: 10 users is not a
demand signal, it is a pre-launch count. You cannot size a service from it.

So the practical answer is a **soft capacity cap**, not a guess:

1. **Publish the 14-day window and the cap together.** "14 days, capped at 20
   reviews per match season." A stated cap converts an unbounded promise into a
   sellable, honest one, and it is what makes the review tier defensible as you
   grow.
2. **Cap sells out, then the software tier carries the value.** MatchaMD+ is
   unlimited and self-serve; only the human review is rationed. That ordering
   matters — it means the thing you cannot scale is never load-bearing for the
   product.
3. **When the cap binds, the conversion metric to watch is cap-hit rate**, not
   raw signups. If 20 slots sell out, price and raise the cap. If they don't,
   the review is not the product.
4. **Your real constraint is a match season, not a month.** Demand will cluster
   in the ~8 weeks before ERAS submission and again before rank lists. A cap
   per season, not per month, is the right unit.

Reviewing the original "5–7 business days" copy: that was the risky promise, not
the 14 days. At one reviewer, 5–7 business days is 8–10 hours of work in a
single week, which is not sustainable across a season without dropping quality —
and a missed clinical-admissions deadline is the kind of failure that produces a
refund request and a bad review. Fourteen days quoted up front, usually beaten, is
the version I would defend.

---

**Original copy (retired):** "5–7 business day written review turnaround."

---

## Also sell these separately (one-time, outside any subscription)

Users who match once and never subscribe are the natural buyer here.

| Product | Price | Note |
|---|---|---|
| CV + PS review | $79 | Standalone, 14-day window |
| Research abstract critique | $49 | Standalone |
| Interview course | $9.99 | Already a one-time add-on |
| USMLE question pack | $4.99 | Already a one-time add-on |
| Specialty guide (Surgery et al.) | $9.99 | Already a one-time add-on |
| **Match-season bundle** | $149 | All reviews + course + pack. Anchor price for the season. |

---

## What I did not do, and why

- **Did not add new paid software features beyond #2.** Each one needs to earn
  its keep; I'd rather ship the fit explanations (which are nearly free given
  the logic exists) before inventing more.
- **Did not remove the demo-activation path.** It is still reachable in
  production — see issue #3. Cutting it needs your call on whether staging
  builds need it.
- **Did not change prices in code.** `Subscription.jsx` still advertises the old
  tiers and the 5–7 day promise. That copy should change when you sign off on
  the numbers above.

## Engineering status

Done:
- `src/lib/entitlements.js` — single resolver, `FEATURE_ACCESS` table, fails closed
- Profile export gated to premium with an upgrade path
- 15 entitlement tests including a tripwire that free-tier features stay free
- Entitlement self-grant hole closed in the database (SEC-04)
- `src/lib/demoGuard.js` — demo activation blocked in production builds via the
  compile-time `import.meta.env.PROD` gate. Both call sites now use the guarded
  wrappers and no longer show a false "Content Unlocked" toast. 9 tests.
- Review window set to 14 days, with a per-season cap of 20 as the rationing unit.

Still open (issue #3):
- Entitlement is still resolved client-side. The demo-mode hole is closed, but a
  determined user can still hand-edit the `subscriptions` read path. Real
  enforcement means the server owns entitlement — the remaining architectural
  half.
- `Subscription.jsx` copy does not match this proposal yet (still advertises the
  old tiers and the retired 5–7 business day turnaround).