# VOSEM State Machine & Navigation Audit

Status: **report only — no code changed**. Date: 2026-11-25.
Method: static inspection of `src/app`, `src/components`, `firestore.rules`, `next.config.ts`; route list from `next build`; navigation graph from `crawl.py` + `linkgraph.py` against `https://vosem.vercel.app`.

## 1. Navigation map (audited in/out)

| Route | Enters from | Exits to | Guard / state |
|---|---|---|---|
| `/` | header logo, `Try Again` (`/payment-failed`), footer, signup/login fallback | header/footer → all public pages; hero CTAs → `/contact`, `/giving`; cards → `/about#connect`, `/about#kids`; giving cards → login or modal | public, no guard |
| `/about` | header, footer, related links | `/contact`, `/events`, `/voice-of-salvation`, `/#giving` | public |
| `/voice-of-salvation` | header, footer, related links | `/contact`, `/events`, `/about`, `/giving` | public |
| `/events` | header, footer, related links | `/contact`, `/about`, `/giving` | public read; RSVP requires signed-in user |
| `/sermons` | header, footer, related links | `/voice-of-salvation`, `/events`, `/giving` | public read; summarise requires `GEMINI_API_KEY` |
| `/prayer` | header, footer, related links | `/contact`, `/events`, `/about` | submit requires auth; wall shows `approved === true` |
| `/giving` | header, footer, homepage, related links | giving modal → `/login` or `/payment-processing` | modal requires auth |
| `/contact` | header, footer, many CTAs | `/signup`, `/events`, `/about` | public |
| `/login` | header, auth redirects, giving modal | `/dashboard`, `/signup` | redirects if already signed in |
| `/signup` | header/footer, login | `/dashboard`, `/login` | redirects if already signed in |
| `/dashboard` | login/signup, nav | all dashboard subpages, `/giving`, `/login` | redirects to `/login` when no user |
| `/dashboard/profile` | dashboard nav | dashboard, `/login` after password change | auth + profile load |
| `/dashboard/settings` | dashboard nav | dashboard, `/` after delete | auth |
| `/dashboard/events` | dashboard nav | `/events` | auth + RSVP collection-group query |
| `/dashboard/testimonies` | dashboard nav | `/#testimonies` (submit) | auth, owner query |
| `/admin` | dashboard nav (visible to everyone) | none | `admins/{uid}.role` gate; shows "access required" otherwise |
| `/payment-processing` | giving modal (`gateway`, `amount`, `reference`) | `/payment-success`, `/payment-failed` | requires token + reference |
| `/payment-success` | payment-processing only (but directly reachable) | `/dashboard`, `/receipt/[reference]`, WhatsApp | **no verification guard** |
| `/payment-failed` | payment-processing errors | `/#giving`, `/contact` | `reason` mapped to friendly copy |
| `/receipt/[reference]` | payment-success, dashboard rows | `/dashboard` | server fetch via Firebase Admin; falls back to not-found |

Link-graph evidence (live crawl): `pages 11, orphans 0, deep_pages 0, max_depth 2, total_internal_links 74` — every public page is reachable, but depth-2 pages are the auth/payment branches.

### Behavioral friction found in navigation
- **Forgot Password?** is `href="#"` — dead end on the login page (`src/app/login/page.tsx:128`). Highest-friction failure: a user in distress cannot recover.
- Dashboard Privacy/Terms are `href="#"` (`src/app/dashboard/layout.tsx:124-125`).
- `Try Again` on `/payment-failed` jumps to `/#giving` but does not reopen the giving modal — the user must re-enter amount and purpose (state lost).
- **Give** means two different flows: public header → `/giving` page; dashboard → modal. Same intent, different path.
- `/admin` is in the nav for all members but only usable after a manual Firestore role insert; dead-end state with no "request access" path.
- Success page's celebration moment exists (check icon + receipt CTA), but there is no in-app testimony flow — only an external WhatsApp link.
- No progress indicator across the "join → verify → give → share" habit loop.

## 2. State machine inventory

Notation: `state —event→ next`. Events are user actions, Firestore snapshots, redirects, or API responses.

### SM-1 Authentication / session (`src/firebase/provider.tsx`, `client-provider.tsx`)
- States: `init`, `loading`, `authenticated`, `anonymous`, `error`, `missing-config`.
- Transitions:
  - `init —FirebaseClientProvider useMemo→ loading|missing-config` (placeholder app when env vars absent)
  - `loading —onAuthStateChanged(user)→ authenticated`
  - `loading —onAuthStateChanged(null)→ anonymous`
  - `loading —listener error→ error`
  - `authenticated —signOut→ anonymous`
- Pages react: login/signup redirect `authenticated → /dashboard`; dashboard redirects `anonymous → /login`.
- **Flag:** `error` and `missing-config` are rendered as a raw config error screen; no recovery path except setting env vars. `userError` is never shown as a friendly toast.

### SM-2 Login page (`src/app/login/page.tsx`)
- States: `checking-auth`, `ready`, `submitting`, `error`, `redirecting`.
- Transitions: `checking-auth —user→ redirecting`; `—no user→ ready`; `ready —submit→ submitting`; `submitting —success→ redirecting`; `submitting —failure→ error`; `error —submit→ submitting`.
- **Flag:** `submitting` has no timeout state; double submit is prevented by `isSubmitting` only.

### SM-3 Signup page (`src/app/signup/page.tsx`)
- Same states as SM-2 plus a **critical compound transition**: `submitting —auth created→ updateProfile → setDoc(users/{uid}) → redirecting`. Failure after `createUserWithEmailAndPassword` leaves an auth user without a Firestore profile; the catch shows "could not create account" and the next reload redirects to `/dashboard` with a missing profile.
- **Flag:** unreachable recovery state — no "complete profile" repair path for a half-created account.

### SM-4 Giving modal (`src/components/landing/giving-modal.tsx`)
- State variables: `isOpen`, `purpose`, `amount`, `customAmount`, `frequency` (`one-time|recurring`), `gateway` (`paystack|flutterwave`), `isPaying`.
- Transitions:
  - `closed —Give click→ open`; `open —cancel→ closed`
  - `open —select amount/purpose/frequency/gateway→ open`
  - `open —proceed (no user)→ /login`
  - `open —proceed (missing key)→ open + toast`
  - `open —proceed (paystack)→ isPaying → onSuccess → /payment-processing | onClose → open`
  - `open —proceed (flutterwave)→ POST hosted checkout (navigates away)`
- **Flag:** `isPaying` hides the form but the dialog can still be dismissed; no explicit "payment in progress" lock. `recurring` with no plan code silently becomes a one-time charge — a state/UI mismatch. Flutterwave has no configured keys in Vercel yet → dead branch.

### SM-5 Payment verification (`src/app/payment-processing/page.tsx`)
- States: `checking-auth`, `verifying`, `success`, `failed`.
- Events: missing reference, missing token, API `success`, API `failed`, network error.
- Transitions to `/payment-success?amount&reference&currency` or `/payment-failed?reason=<code>`.
- **Flag:** `verifyPayment()` is a one-shot effect; no retry state inside the page — retry goes via `/#giving`. Direct navigation with an arbitrary reference is accepted and triggers verification.

### SM-6 Payment result pages
- `/payment-success`: terminal celebratory state; accessible directly with any query params (spoofable). Receipt link uses unvalidated `reference`.
- `/payment-failed`: terminal status state; `reason` codes mapped via `friendlyPaymentError()`; unknown codes fall back to generic copy. Retry exits to `/#giving` (state lost).

### SM-7 Donation record (`firestore.rules`, API routes, dashboard table)
- Intended states: `pending → success/succeeded`; UI renders `succeeded` (green), `pending` (amber), else pink.
- Actual writes:
  - Paystack verification writes `status: data.status` = **`success`**
  - Paystack webhook writes **`success`**
  - Flutterwave writes **`succeeded`**
  - `pending` is never written by any code.
- **Flag:** invalid/duplicated vocabulary — Paystack donations render as the fallback pink state; `pending` is unreachable. No refund/failed/disputed state exists.

### SM-8 Testimony lifecycle
- States: `draft (client form) → pending (approved:false) → approved:true`; terminal `deleted`.
- Events: submit (auth required), admin approve, author delete.
- Transitions: `pending —admin approve→ approved`; `pending|approved —author delete→ deleted`.
- **Flag:** no `rejected` state; no edit state (rules explicitly deny update). Public site only displays approved testimonies; pending are visible to author in `/dashboard/testimonies`. Two submit implementations exist (`site/testimonies-section.tsx`, unused `landing/testimonies.tsx`) — duplicate writers.

### SM-9 Prayer request lifecycle
- States: `draft → pending (approved:false) → approved:true`; terminal `deleted` (admin only).
- Events: submit, admin approve, admin delete.
- Author may read own pending but cannot edit/delete. No `rejected` state. Anonymous flag freezes author display as "Anonymous".

### SM-10 RSVP (`src/components/events/event-calendar.tsx`, `/dashboard/events`)
- States: `not-going → going → not-going`.
- Events: click RSVP (create doc with `status: "going"`), click cancel (delete doc).
- **Flag:** `status` field is constant; no "maybe", "waitlisted", "attended", or event-cancelled state. Event deletion by admin leaves orphan RSVPs.

### SM-11 Admin role gate (`src/app/admin/page.tsx`, `firestore.rules`)
- States: `no-user`, `loading-role`, `not-admin`, `admin`.
- Events: `useDoc('/admins/{uid}')` snapshot, sign out.
- **Flag:** the only reachable way into `admin` is manually seeding `admins/{uid}`; rules deny all client writes to that collection. No self-service admin provisioning, no "access requested" state.

### SM-12 Dashboard data loading (`/dashboard`, profile, events, testimonies, sermons)
- States: `auth-loading → data-loading → ready | empty | error | redirecting`.
- Combined flag `isLoading = isAuthLoading || isProfileLoading || (user && isDonationsLoading)` can stay true if a Firestore listener never resolves; no timeout/error UI for `useCollection` errors.

### SM-13 Drawers/dialogs
- `isSheetOpen` in public header and dashboard layout; `isModalOpen` in giving; `isDeleteAlertOpen` in settings; `isModalOpen` in testimonies.
- Standard `closed ↔ open`; no deep-link state (URL never reflects dialog state), so refresh returns to base page.

### SM-14 Forms (react-hook-form, all forms)
- Implicit states: `pristine → dirty → invalid → valid → submitting → success | error → reset`.
- Error display differs across forms (inline vs toast). No global form-state persistence across navigation.

## 3. Invalid, unreachable, or unhandled states

| # | Finding | Severity |
|---|---|---|
| 1 | `pending` donation status is unreachable; Paystack stores `success` but UI highlights `succeeded` | High (trust/visual bug) |
| 2 | Password reset is a dead link (`href="#"`) | High (support burden) |
| 3 | Admin role cannot be obtained through the UI; `/admin` is a dead end for members | High |
| 4 | `recurring` giving silently downgrades to one-time without a plan code | High (user expectation) |
| 5 | Flutterwave branch has no keys in Vercel; toast failure is the only outcome | Medium |
| 6 | `/payment-success` is directly reachable with arbitrary params; no verification guard | Medium |
| 7 | `error`/`missing-config` auth states have no friendly recovery path | Medium |
| 8 | Half-created signup (auth user, no Firestore profile) has no repair path | Medium |
| 9 | No `rejected` state for testimonies or prayer requests | Medium |
| 10 | No retry state inside `/payment-processing`; retry loses amount/purpose context | Medium |
| 11 | Privacy/Terms links are dead | Low |
| 12 | Duplicate testimony writers could diverge in schema validation | Low |
| 13 | Orphan RSVP docs when admins delete events | Low |
| 14 | Firestore rules not deployed in this environment — all write transitions remain blocked | Blocker |
| 15 | Firebase Admin credentials missing — receipt and webhook persistence transitions fail silently | Blocker |

## 4. Paths not even started (candidates, not built)

- Password reset / email verification / change-email flows.
- Admin role provisioning, role revocation, moderator vs admin permissions.
- Testimony and prayer-request **rejection** with reason, plus edit/resubmit.
- Sermon and event detail pages; series/category hubs; sermon video state (draft → published → archived).
- Event lifecycle beyond "going": waitlist, cancelled, completed, attendance check-in.
- Giving: refunds, failed/disputed charges, recurring plan lifecycle (pause/resume/cancel), receipts resend, annual statements, pledges.
- Donation currency other than NGN; international payment methods.
- Anonymous giving (currently blocked by login requirement).
- Search/filter state persisted in URL across navigation; deep links into open dialogs.
- Graceful Firestore permission/error states instead of perpetual spinners.
- Rate-limit-exhausted UI (429 from verification API).
- Webhook replay/idempotency UI and reconciliation screen for "charged but not recorded".
- Notification delivery for approved testimonies/prayers/RSVP reminders — the stored preferences have no consumer yet.
- Onboarding completion state persistence — the checklist on the dashboard is derived, not tracked.
- 404/not-found pages for sermon/event/receipt IDs.
- Zero-click/AI-citation measurement (external tooling).

## 5. Behavioral-design read (skills applied)

Target behaviours: (a) join the family, (b) give first seed, (c) return to give/share regularly.

Barriers found:
- **Present bias / friction:** forgot-password dead end; retry after failed payment returns to a generic homepage anchor instead of a pre-filled giving modal.
- **Status quo bias:** smart defaults exist (₦10,000, "Offerings", one-time, Paystack) — good; but recurring silently downgrades, breaking trust.
- **Loss aversion / habit loop:** dashboard shows a milestone streak, but no notification or email uses it; nothing would be lost by leaving.
- **Celebration / pause moment:** payment-success has a check icon and receipt CTA, but no impact statement or next-step prompt (share testimony / join group) beyond WhatsApp.
- **Uncertainty aversion:** failed/success pages explain what happened, but "charged but not recorded" has no dedicated resolution path.

Recommended interventions (not implemented): pre-filled retry deep link, password-reset route, split "recurring" into explicit plan selection with confirmation, rejection-with-reason + resubmit loop, impact statement + one clear next action after giving, and notifications that close the loop on approved testimonies/prayers.

## 6. Evidence commands

```
find src/app -name page.tsx -o -name route.ts        # 23 routes
grep -rnE "router\.(push|replace)\(" src            # all programmatic transitions
grep -rn 'href="#"' src --include=*.tsx              # dead-end links
grep -rnE "status: ['\"][a-z_]+|approved: (true|false)" src firestore.rules
crawl.py + linkgraph.py over https://vosem.vercel.app
  -> pages 11, orphans 0, total_internal_links 74
```
