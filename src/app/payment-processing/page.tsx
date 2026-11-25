'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/firebase';
import { Lock } from 'lucide-react';
import { VosemLogoIcon } from '@/components/icons';

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = useAuth();
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
            router.replace(`/payment-success?amount=${amount}&reference=${reference}&currency=${currency}`);
          } else {
            router.replace(`/payment-failed?reason=${encodeURIComponent(result.message || 'Payment verification failed.')}`);
          }
        } else {
          router.replace(`/payment-failed?reason=${encodeURIComponent(`Server error: ${response.statusText}`)}`);
        }
      } catch {
        router.replace('/payment-failed?reason=Could_not_connect_to_the_verification_service');
      }
    };

    verifyPayment();
  }, [router, searchParams, auth, gateway]);

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="site-wrap flex h-16 items-center justify-center gap-3">
          <VosemLogoIcon className="size-7 text-primary" />
          <span className="font-black tracking-widest text-sm uppercase">VOSEM INT&apos;L</span>
        </div>
      </header>
      <main className="flex flex-grow items-center justify-center px-5 py-16">
        <div className="app-card max-w-md text-center">
          <div className="relative mx-auto mb-8 flex size-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
            <span className="absolute inset-2 animate-ping rounded-full bg-primary/10" />
            <span className="relative z-10 flex size-16 items-center justify-center rounded-full bg-primary text-white">₦</span>
          </div>
          <h1 className="text-2xl font-bold">Verifying your seed…</h1>
          <p className="mt-2 text-muted-foreground">Please do not close this window.</p>
        </div>
      </main>
      <footer className="border-t border-border py-5">
        <div className="site-wrap flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <Lock className="size-4" /> Secure payment processing
        </div>
      </footer>
    </div>
  );
}

export default function PaymentProcessingPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" /></div>}>
      <PaymentProcessingContent />
    </Suspense>
  );
}
