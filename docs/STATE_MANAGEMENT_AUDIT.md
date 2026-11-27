# State management and state-machine audit (27 Nov 2026)

Companion to `docs/STATE_MACHINE_AUDIT.md`, refreshed after the session, admin and receipt changes.

## 1. Explicit machines

`src/machines/` holds 19 typed machines built with `createMachine()` and bound with `useMachine()` (a `useReducer` wrapper). Registry: `src/machines/index.ts`.

| Machine | File | Bound to UI? |
| --- | --- | --- |
| `authSessionMachine`, `loginMachine`, `signupMachine` | `auth.machine.ts` | No. Login/signup use local `useState` flags with the same states. |
| `givingMachine`, `paymentVerificationMachine`, `donationMachine`, `paymentResultMachine` | `payment.machine.ts` | Only `normalizeDonationStatus` and `paymentResultForReason` (as `friendlyPaymentError`) are used. |
| `testimonyMachine`, `prayerMachine`, `rsvpMachine` | `content.machine.ts` | No. Firestore `approved` field carries the moderation state. |
| **`prayerSubmissionMachine`** | **`prayer-submission.machine.ts`** | **Yes, added in this pass** via `useMachine` in `PrayerWall`. |
| `adminMachine`, `dashboardDataMachine`, `formMachine`, 5 overlay machines | `app.machine.ts` | No. Admin uses `tab`/`editing` flags; overlays use boolean state. |

`prayerMachine` still declares a `deleted` state with no transition into it; `donationMachine.pending` is never written (client writes `succeeded`, webhook writes `success`).

## 2. Route / state map

| Route | State entry points | Status |
| --- | --- | --- |
| `/`, `/about`, `/voice-of-salvation`, `/contact` | Static; child testimonies/giving dialogs use `open` + form state | Overlay machines not bound |
| `/giving`, `/events`, `/sermons`, `/prayer` | Giving modal, RSVP `busy`, `busyId`/`error`, prayer submission | Prayer submission now explicit; others ad-hoc |
| `/login`, `/signup` | `isSubmitting`, `authError`, `showPassword`, `hasSession()` gate | Compound auth flow still implicit |
| `/admin` | `useSessionGuard` (`checking/valid/invalid`), role doc, `tab`, `editing`, `form` | Session machine not bound; CRUD has no pending state |
| `/payment-processing` | One-shot effect, no local state, no retry, no unmount guard | Unhandled `network error`/`retry` states |
| `/payment-success`, `/payment-failed` | Query params only; no verification | Terminal states only |
| `/receipt/[reference]` | `useDoc` → loading/not-found/ready | No auth gate; status rendered raw |
| `/dashboard` and all 6 `/dashboard/*` pages | Layout `useSessionGuard`; page `isLoading`, `search`, `range`, `page`; dialog flags | `error` from `useDoc`/`useCollection` ignored |
| `POST /api/verify-donation`, `POST /api/verify-flutterwave` | Rate-limit map, HMAC/token branches | Stateless apart from in-memory rate limit |

There is no `loading.tsx`, `error.tsx` or `not-found.tsx` anywhere, so route-level error states fall back to component-level spinners, some of which can spin forever when a Firestore read fails.

## 3. Fixes made in this pass

- `PrayerWall` now uses `prayerSubmissionMachine` (`idle → submitting → success|error → idle`), awaits the write, disables double submits, resets the banner when the member edits the form, validates 5–1000 characters, and shows only the member's latest request so old ones stop stacking in the UI. Rows use stable Firestore IDs; loading is shown instead of a false "no requests" state.
- Admin approval now writes only `approved`, matching the deployed rule (previously it wrote `reviewedAt`/`reviewedBy` and was denied).
- RSVPs use a deterministic document ID `{event}/{rsvps}/{uid}` and a `try/finally` so a failed write cannot leave the button stuck.
- The Paystack hand-off timer in `GivingModal` is cleared on unmount.

## 4. Remaining implicit machines (mapped, not yet bound)

| Flow | Implicit states | Where |
| --- | --- | --- |
| Firebase auth | loading → authenticated / anonymous / error | `src/firebase/provider.tsx` |
| Session guard | checking → valid → invalid → redirect | `src/lib/session.tsx` |
| Login/signup | checking → ready → submitting → redirect / error | `src/app/login`, `src/app/signup` |
| Giving modal | closed → open → paying → config-error / auth-required | `src/components/landing/giving-modal.tsx` |
| Payment verification | checking → verifying → succeeded / failed / network-error | `src/app/payment-processing/page.tsx` |
| Admin CRUD | checking-role → ready → saving / deleting / error | `src/app/admin/page.tsx` |
| Data hooks | loading → data / empty / error | `src/firebase/firestore/use-collection.tsx`, `use-doc.tsx` |
| Dialogs/sheets/menus | closed → open | headers, dashboard layout, `CrudTable` |

These remain ad-hoc boolean/flag state, but each maps 1:1 to an existing typed machine, so the registry is a complete map of the app's state surfaces. Highest-risk remaining gaps: payment processing has no retry or unmount guard, and dashboard/admin ignore Firestore read errors.
