# State management and state-machine audit (updated 27 Nov 2026)

Companion to `docs/STATE_MACHINE_AUDIT.md`. This is the current map after the session, admin, receipt, PWA and state-binding work.

## 1. Explicit machines and bindings

All machines live in `src/machines/` and are built with `createMachine()`. `useMachine()` binds them to React via `useReducer`.

| Machine | Bound to |
| --- | --- |
| `authSessionMachine`, `loginMachine`, `signupMachine` | `src/firebase/provider.tsx`, `src/app/login/page.tsx`, `src/app/signup/page.tsx` |
| `givingMachine`, `paymentVerificationMachine` | `src/components/landing/giving-modal.tsx`, `src/app/payment-processing/page.tsx` |
| `prayerSubmissionMachine` | `src/components/prayer/prayer-wall.tsx` |
| `testimonySubmissionMachine` | `src/components/site/testimonies-section.tsx`, `src/app/dashboard/testimonies/page.tsx` |
| `sessionGuardMachine` | `src/lib/session.tsx` (dashboard + admin gates) |
| `dataLoadMachine` | `src/firebase/firestore/use-collection.tsx`, `use-doc.tsx` |
| `adminMachine`, `adminCrudMachine`, `confirmDeleteMachine` | `src/app/admin/page.tsx`, `src/components/admin/crud-table.tsx` |
| `dashboardDataMachine` | `src/app/dashboard/page.tsx` |
| `formMachine` | `src/components/dashboard/profile-form.tsx` |
| Overlay machines | site/landing/dashboard menus, giving dialog, delete-account dialog, testimony dialogs, admin More sheet |

Unused declarations remain as documentation-only: `donationMachine` (status vocabulary lives in Firestore), `paymentResultMachine` transitions (only its copy helper is used), `testimonyMachine`/`prayerMachine` moderation tables (Firestore `approved` is the source of truth), `rsvpMachine`, and the unused overlay variants.

## 2. Route / state map

| Route | State handling |
| --- | --- |
| `/`, `/about`, `/voice-of-salvation`, `/contact`, `/giving`, `/events`, `/sermons`, `/prayer` | Static pages; child components own dialog/RSVP/submission machines. |
| `/login`, `/signup` | `loginMachine` / `signupMachine`, session-cookie gate, friendly error from `?reason=account-removed`. |
| `/admin` | `sessionGuardMachine` + `adminMachine` gate, `adminCrudMachine` writes, full-admin vs moderator UI, membership check. |
| `/payment-processing` | `paymentVerificationMachine`, 15s watchdog, unmount guard, retry UI. |
| `/payment-success`, `/payment-failed` | Terminal result copy from query params. |
| `/receipt/[reference]` | `useDoc` data-load machine; loading / not-found / ready. |
| `/dashboard` + children | Layout session guard + membership check; page uses `dashboardDataMachine`, Firestore read errors surface as a retry card. |
| `POST /api/membership` | Verifies the ID token, then checks the profile with the member's own token. Fails open on errors. |
| `POST /api/verify-donation`, `/api/verify-flutterwave` | Token verification plus gateway checks. |

Global `error.tsx`, `loading.tsx` and `not-found.tsx` now cover every route.

## 3. Fixes made

- **Deleted members**: `/api/membership` verifies the token before checking the profile; dashboard/admin sign out and redirect with a friendly message when the profile is gone. No Firestore read happens during sign-in, and network errors cannot lock a member out.
- **Payment processing**: 15-second watchdog replaces an endless spinner; a Retry button re-runs verification instead of leaving the user stranded.
- **Permissions**: `isFullAdmin()` rules helper and admin UI distinguish admins (full CRUD) from moderators (approval/content editing only). Destructive actions, user deletion and admin-role management are admin-only.
- **Machines**: auth, dashboard data, forms, testimony submits and the table delete confirm are now explicit and bound.

## 4. Remaining gaps

- The new `isFullAdmin()` rule changes are in `firestore.rules` but **not yet deployed**: Firebase CLI reauthentication is required. Until then the UI restriction applies but the rules still allow moderator deletes.
- `addDocumentNonBlocking` is still used in a few places (audit logs, admin profile writes) without caller-visible errors.
- No automated test suite; machine transitions were verified with a one-off Node assertion script.
- HttpOnly session cookies need a server endpoint with Firebase Admin credentials, which this deployment does not have.
