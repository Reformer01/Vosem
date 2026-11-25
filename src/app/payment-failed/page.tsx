'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="border-b border-border bg-card">
        <div className="site-wrap flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-lg font-black tracking-tighter">
            VOSEM <span className="text-primary">INT&apos;L</span>
          </Link>
          <Link href="/contact" className="text-sm font-bold text-muted-foreground hover:text-primary">Contact support</Link>
        </div>
      </header>

      <main className="flex flex-grow items-center justify-center px-5 py-16">
        <div className="app-card max-w-lg text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">Payment unsuccessful</h1>
          <p className="mt-4 text-muted-foreground">
            {reason?.replaceAll('_', ' ') || 'Your transaction could not be completed. Please check your details or try a different payment method.'}
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#giving" className="site-btn site-btn-solid"><RefreshCw className="size-4" /> Try again</Link>
            <Link href="/contact" className="site-btn site-btn-outline">Contact support <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" /></div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
