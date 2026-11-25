// User-facing status copy for payment problems. Never expose raw codes,
// statusText or server messages to the member portal.
const messages: Record<string, { title: string; description: string }> = {
  No_transaction_reference_found: {
    title: "We couldn't find that payment",
    description: "The payment link is missing its reference. Return to Giving and try again — if you were charged, contact us with your bank receipt.",
  },
  Please_sign_in_to_verify_your_gift: {
    title: 'Please sign in to see your gift',
    description: 'Sign in with the account you used when giving, then we can confirm your donation and prepare your receipt.',
  },
  Verification_failed: {
    title: 'We could not confirm this payment yet',
    description: 'The payment provider has not confirmed the transaction. Please try again in a few minutes or contact us if the amount has left your account.',
  },
  Transaction_mismatch: {
    title: 'This payment belongs to a different account',
    description: 'Sign in with the account used at checkout, or contact the church office so we can help you locate the receipt.',
  },
  Verification_unavailable: {
    title: 'Verification is temporarily unavailable',
    description: 'We could not reach the payment service just now. Your bank will show whether the charge went through — please retry shortly.',
  },
};

const fallback = {
  title: 'Something went wrong with this payment',
  description: 'We could not complete this request. Please try again, or contact the church office and we will help you sort it out.',
};

export function friendlyPaymentError(reason: string | null) {
  if (!reason) return fallback;
  return messages[reason] ?? fallback;
}

export function paymentErrorCode(message: string | undefined): string {
  if (!message) return 'Verification_failed';
  if (/does not belong|mismatch/i.test(message)) return 'Transaction_mismatch';
  if (/configuration|not configured/i.test(message)) return 'Verification_unavailable';
  return 'Verification_failed';
}
