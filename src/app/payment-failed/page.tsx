'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { friendlyPaymentError } from '@/lib/error-messages';
import SiteShell from '@/components/site/site-shell';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const status = friendlyPaymentError(searchParams.get('reason'));

  return (
    <SiteShell>
      <main className="flex flex-grow items-center justify-center px-5 py-16">
        <div className="app-card max-w-lg text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <AlertTriangle className="size-8" />
          </div>
          <h1 className="text-3xl font-black sm:text-4xl">{status.title}</h1>
          <p className="mt-4 text-muted-foreground">{status.description}</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/#giving" className="site-btn site-btn-solid"><RefreshCw className="size-4" /> Try again</Link>
            <Link href="/contact" className="site-btn site-btn-outline">Contact support <ArrowRight className="size-4" /></Link>
          </div>
          <Link href="/dashboard" className="mt-6 inline-block text-sm font-bold text-primary hover:underline">Back to dashboard</Link>
        </div>
      </main>
    </SiteShell>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" /></div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
