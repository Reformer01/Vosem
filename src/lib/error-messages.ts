// User-facing copy is owned by the explicit payment-result machine.
export { paymentResultForReason as friendlyPaymentError } from "@/machines/payment.machine";

export function paymentErrorCode(message: string | undefined): string {
  if (!message) return "Verification_failed";
  if (/does not belong|mismatch/i.test(message)) return "Transaction_mismatch";
  if (/configuration|not configured/i.test(message)) return "Verification_unavailable";
  return "Verification_failed";
}
