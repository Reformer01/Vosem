import { createMachine } from "./create-machine";

export const givingMachine = createMachine({
  id: "giving",
  description: "Giving modal from open to gateway handoff.",
  initial: "closed",
  states: ["closed", "open", "paying-paystack", "redirecting-flutterwave", "auth-required", "config-error"] as const,
  events: ["OPEN", "CLOSE", "SELECT", "PROCEED_PAYSTACK", "PROCEED_FLUTTERWAVE", "AUTH_REQUIRED", "CONFIG_ERROR", "PAYMENT_SUCCESS", "PAYMENT_CLOSED", "RESET"] as const,
  transitions: {
    closed: { OPEN: "open" },
    open: {
      SELECT: "open", CLOSE: "closed", PROCEED_PAYSTACK: "paying-paystack",
      PROCEED_FLUTTERWAVE: "redirecting-flutterwave", AUTH_REQUIRED: "auth-required", CONFIG_ERROR: "config-error",
    },
    "paying-paystack": { PAYMENT_SUCCESS: "closed", PAYMENT_CLOSED: "open", CLOSE: "open" },
    "redirecting-flutterwave": { RESET: "closed" },
    "auth-required": { RESET: "closed" },
    "config-error": { RESET: "open" },
  },
});

export const paymentVerificationMachine = createMachine({
  id: "payment-verification",
  description: "Server-confirmed payment verification.",
  initial: "checking",
  states: ["checking", "verifying", "succeeded", "failed"] as const,
  events: ["REFERENCE_MISSING", "TOKEN_MISSING", "START", "API_SUCCESS", "API_FAILED", "NETWORK_ERROR", "RETRY"] as const,
  transitions: {
    checking: { REFERENCE_MISSING: "failed", TOKEN_MISSING: "failed", START: "verifying" },
    verifying: { API_SUCCESS: "succeeded", API_FAILED: "failed", NETWORK_ERROR: "failed" },
    succeeded: {},
    failed: { RETRY: "checking" },
  },
});

export type DonationState = "pending" | "succeeded" | "failed" | "refunded";

/** Canonicalises the three status spellings written by different gateways. */
export function normalizeDonationStatus(raw?: string): DonationState {
  const status = (raw || "").toLowerCase();
  if (["success", "succeeded", "successful", "paid", "completed"].includes(status)) return "succeeded";
  if (["failed", "failed_transaction"].includes(status)) return "failed";
  if (["refunded", "reversed"].includes(status)) return "refunded";
  return "pending";
}

export const donationMachine = createMachine({
  id: "donation",
  description: "Donation record lifecycle after verification.",
  initial: "pending",
  states: ["pending", "succeeded", "failed", "refunded"] as const,
  events: ["CONFIRMED", "FAILED", "REFUNDED"] as const,
  transitions: {
    pending: { CONFIRMED: "succeeded", FAILED: "failed" },
    succeeded: { REFUNDED: "refunded" },
    failed: { CONFIRMED: "succeeded" },
    refunded: {},
  },
});

export type PaymentResultState = "success" | "not-found" | "auth-required" | "verification-failed" | "verification-unavailable" | "generic-error";

const copy: Record<Exclude<PaymentResultState, "success">, { title: string; description: string }> = {
  "not-found": {
    title: "We couldn't find that payment",
    description: "The payment link is missing its reference. Return to Giving and try again. If you were charged, contact us with your bank receipt.",
  },
  "auth-required": {
    title: "Please sign in to see your gift",
    description: "Sign in with the account you used when giving, then we can confirm your donation and prepare your receipt.",
  },
  "verification-failed": {
    title: "We could not confirm this payment yet",
    description: "The payment provider has not confirmed the transaction. Please try again in a few minutes or contact us if the amount has left your account.",
  },
  "verification-unavailable": {
    title: "Verification is temporarily unavailable",
    description: "We could not reach the payment service just now. Your bank will show whether the charge went through. Please retry shortly.",
  },
  "generic-error": {
    title: "Something went wrong with this payment",
    description: "We could not complete this request. Please try again, or contact the church office and we will help you sort it out.",
  },
};

export const paymentResultMachine = createMachine({
  id: "payment-result",
  description: "Terminal payment result page and its friendly status copy.",
  initial: "success",
  states: ["success", "not-found", "auth-required", "verification-failed", "verification-unavailable", "generic-error"] as const,
  events: ["RETRY", "VIEW_RECEIPT", "CONTACT_SUPPORT"] as const,
  transitions: {
    success: { VIEW_RECEIPT: "success", RETRY: "success" },
    "not-found": { RETRY: "verification-failed" },
    "auth-required": { RETRY: "verification-failed" },
    "verification-failed": { RETRY: "verification-failed", CONTACT_SUPPORT: "generic-error" },
    "verification-unavailable": { RETRY: "verification-failed" },
    "generic-error": { RETRY: "verification-failed" },
  },
});

export function paymentResultForReason(reason: string | null): { state: PaymentResultState; title: string; description: string } {
  const map: Record<string, PaymentResultState> = {
    No_transaction_reference_found: "not-found",
    Please_sign_in_to_verify_your_gift: "auth-required",
    Verification_failed: "verification-failed",
    Transaction_mismatch: "verification-failed",
    Verification_unavailable: "verification-unavailable",
  };
  const state = (reason && map[reason]) || "generic-error";
  return state === "success"
    ? { state, title: "Payment successful", description: "Your gift has been received." }
    : { state, ...copy[state] };
}
