'use client';
import LoadingDove from "@/components/site/loading-dove";

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Lock } from 'lucide-react';
import SiteShell from '@/components/site/site-shell';
import { paymentErrorCode } from '@/lib/error-messages';
import { useMachine } from '@/machines/use-machine';
import { paymentVerificationMachine } from '@/machines/payment.machine';

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const gateway = 'paystack';
  const [verifyState, sendVerify] = useMachine(paymentVerificationMachine);
  const [attempt, setAttempt] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let active = true;
    const reference = searchParams.get('reference');
    const amount = searchParams.get('amount');
    if (!reference) {
      sendVerify('REFERENCE_MISSING');
      router.replace('/payment-failed?reason=No_transaction_reference_found');
      return () => { active = false; };
    }

    const go = (url: string) => { if (active) router.replace(url); };
    const watchdog = window.setTimeout(() => {
      if (!active) return;
      active = false;
      setTimedOut(true);
      sendVerify('NETWORK_ERROR');
    }, 15000);

    const verifyPayment = async () => {
      sendVerify('START');
      try {
        await auth.authStateReady();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          sendVerify('TOKEN_MISSING');
          go('/payment-failed?reason=Please_sign_in_to_verify_your_gift');
          return;
        }
        const response = await fetch('/api/verify-donation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reference }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.status === 'success') {
            const currency = result.data?.currency || 'NGN';
            // Persist the gift from the client: server-side writes need Admin
            // credentials that aren't available on this deployment.
            try {
              const current = auth.currentUser;
              if (current && firestore) {
                await setDoc(doc(firestore, 'donations', reference), {
                  userId: current.uid,
                  amount: Number(result.data?.amount || Number(amount) * 100),
                  currency,
                  purpose: result.data?.metadata?.purpose || 'Giving',
                  reference,
                  status: 'succeeded',
                  gateway,
                  createdAt: serverTimestamp(),
                  donorName: current.displayName || 'Valued Giver',
                  donorEmail: current.email || '',
                }, { merge: true });
              }
            } catch (error) {
              console.error('Could not save donation record:', error);
            }
            sendVerify('API_SUCCESS');
            go(`/payment-success?amount=${amount}&reference=${reference}&currency=${currency}`);
          } else {
            sendVerify('API_FAILED');
            go(`/payment-failed?reason=${paymentErrorCode(result.message)}`);
          }
        } else {
          sendVerify('NETWORK_ERROR');
          go('/payment-failed?reason=Verification_unavailable');
        }
      } catch {
        sendVerify('NETWORK_ERROR');
        go('/payment-failed?reason=Verification_unavailable');
      }
    };

    verifyPayment();
    return () => { active = false; window.clearTimeout(watchdog); };
  }, [router, searchParams, auth, firestore, gateway, sendVerify, attempt]);

  return (
    <SiteShell>
      <main className="flex flex-grow items-center justify-center px-5 py-16">
        <div className="app-card max-w-md text-center">
          {timedOut ? (
            <>
              <h1 className="text-2xl font-bold">Verification is taking longer than expected</h1>
              <p className="mt-4 text-muted-foreground">Your bank will show whether the charge went through. Please retry, or contact the church office if you were charged.</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button onClick={() => { sendVerify('RETRY'); setTimedOut(false); setAttempt(a => a + 1); }} className="site-btn site-btn-solid">Try again</button>
                <a href="/contact" className="site-btn site-btn-outline">Contact support</a>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 flex justify-center">
                <LoadingDove className="size-16" label="Verifying your gift" />
              </div>
              <h1 className="text-2xl font-bold">Verifying your seed…</h1>
              <p className="mt-2 text-muted-foreground" aria-live="polite">{verifyState === 'checking' ? 'Please do not close this window.' : 'Confirming your gift with the payment provider...'}</p>
              <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
                <Lock className="size-4" /> Secure payment processing
              </p>
              <a href="/dashboard" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">Back to dashboard</a>
            </>
          )}
        </div>
      </main>
    </SiteShell>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><LoadingDove className="size-10" /></div>}>
      <PaymentProcessingContent />
    </Suspense>
  );
}
