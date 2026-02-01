'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VosemLogoIcon } from '@/components/icons';

function PaymentProcessingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount');

  useEffect(() => {
    const timer = setTimeout(() => {
      const transaction_id = `VOSEM-${Date.now()}`;
      // Simulate a random outcome for the payment
      if (Math.random() > 0.2) { // 80% success rate
        router.push(`/payment-success?amount=${amount}&transaction_id=${transaction_id}`);
      } else {
        router.push('/payment-failed');
      }
    }, 3000); // 3-second processing time

    return () => clearTimeout(timer);
  }, [router, amount]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#0f0510] group/design-root overflow-x-hidden font-sans text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="w-full flex justify-center py-8 z-20">
        <div className="flex items-center gap-3 opacity-80">
          <VosemLogoIcon className="w-8 h-8 text-accent" />
          <span className="font-bold tracking-widest text-sm uppercase">VOSEM INT'L</span>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-5">
        <div className="flex flex-col items-center max-w-[960px] flex-1">
          <div className="relative flex flex-col items-center justify-center w-[340px] h-[340px] sm:w-[400px] sm:h-[400px] rounded-full bg-background-dark/30 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] text-center p-8 ring-1 ring-white/5">
            <div className="relative flex items-center justify-center mb-10">
              <div className="absolute h-20 w-20 origin-center rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] bg-accent opacity-75"></div>
              <div className="absolute h-20 w-20 origin-center rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] bg-accent opacity-40 delay-300"></div>
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#2d1220] bg-accent shadow-[0_0_50px_rgba(181,4,80,0.5)]">
                <span className="material-symbols-outlined animate-pulse text-4xl text-white">ecg_heart</span>
              </div>
            </div>

            <div className="z-10 flex max-w-[280px] flex-col items-center gap-3">
              <h2 className="text-center text-xl font-semibold leading-tight tracking-tight text-white">Verifying your seed...</h2>
              <p className="text-center text-sm font-normal leading-normal text-white/60">Please do not close this window.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="z-20 flex w-full justify-center py-6">
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-black/20 px-4 py-2 backdrop-blur-sm">
          <span className="material-symbols-outlined text-sm text-accent/60">lock</span>
          <p className="text-xs font-medium tracking-wide text-accent/60">256-bit SSL Secure Payment</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentProcessingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentProcessingContent />
        </Suspense>
    )
}
