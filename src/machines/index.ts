/** Registry: every implicit flow in the app now has an explicit, typed machine. */
import { authSessionMachine, loginMachine, signupMachine } from "./auth.machine";
import {
  givingMachine, paymentVerificationMachine, donationMachine,
  paymentResultMachine, normalizeDonationStatus, paymentResultForReason,
} from "./payment.machine";
import { testimonyMachine, prayerMachine, rsvpMachine } from "./content.machine";
import { prayerSubmissionMachine } from "./prayer-submission.machine";
import {
  adminMachine, dashboardDataMachine, formMachine, headerMenuMachine,
  dashboardMenuMachine, givingDialogMachine, deleteAccountDialogMachine,
  testimonyDialogMachine,
} from "./app.machine";

export * from "./types";
export * from "./create-machine";
export * from "./use-machine";
export * from "./auth.machine";
export * from "./payment.machine";
export * from "./content.machine";
export * from "./prayer-submission.machine";
export * from "./app.machine";

export const machineRegistry = [
  authSessionMachine, loginMachine, signupMachine,
  givingMachine, paymentVerificationMachine, donationMachine, paymentResultMachine,
  testimonyMachine, prayerMachine, prayerSubmissionMachine, rsvpMachine,
  adminMachine, dashboardDataMachine, formMachine,
  headerMenuMachine, dashboardMenuMachine, givingDialogMachine,
  deleteAccountDialogMachine, testimonyDialogMachine,
];

export { normalizeDonationStatus, paymentResultForReason };
