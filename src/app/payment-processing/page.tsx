'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Lock } from 'lucide-react';
import SiteShell from '@/components/site/site-shell';
import { paymentErrorCode } from '@/lib/error-messages';

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
  const firestore = useFirestore();
  const gateway = searchParams.get('gateway') || 'paystack';

  useEffect(() => {
    const reference = searchParams.get('reference');
    const amount = searchParams.get('amount');
    if (!reference) {
      router.replace('/payment-failed?reason=No_transaction_reference_found');
      return;
    }

    const verifyPayment = async () => {
      try {
        await auth.authStateReady();
        const token = await auth.currentUser?.getIdToken();
        if (!token) {
          router.replace('/payment-failed?reason=Please_sign_in_to_verify_your_gift');
          return;
        }
        const response = await fetch(gateway === 'flutterwave' ? '/api/verify-flutterwave' : '/api/verify-donation', {
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
            router.replace(`/payment-success?amount=${amount}&reference=${reference}&currency=${currency}`);
          } else {
            router.replace(`/payment-failed?reason=${paymentErrorCode(result.message)}`);
          }
        } else {
          router.replace('/payment-failed?reason=Verification_unavailable');
        }
      } catch {
        router.replace('/payment-failed?reason=Verification_unavailable');
      }
    };

    verifyPayment();
  }, [router, searchParams, auth, firestore, gateway]);

  return (
    <SiteShell>
      <main className="flex flex-grow items-center justify-center px-5 py-16">
        <div className="app-card max-w-md text-center">
          <div className="relative mx-auto mb-8 flex size-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-2 animate-ping rounded-full bg-primary/10" />
            <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-primary text-white">₦</span>
          </div>
          <h1 className="text-2xl font-bold">Verifying your seed…</h1>
          <p className="mt-2 text-muted-foreground">Please do not close this window.</p>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
            <Lock className="size-4" /> Secure payment processing
          </p>
          <a href="/dashboard" className="mt-4 inline-block text-sm font-bold text-primary hover:underline">Back to dashboard</a>
        </div>
      </main>
    </SiteShell>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" /></div>}>
      <PaymentProcessingContent />
    </Suspense>
  );
}
