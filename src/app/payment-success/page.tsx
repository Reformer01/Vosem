'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, LayoutDashboard } from 'lucide-react';
import { Suspense } from 'react';
import { useUser } from '@/firebase';
import SiteShell from '@/components/site/site-shell';
import { WhatsAppIcon } from '@/components/icons';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const amount = searchParams.get('amount');
  const reference = searchParams.get('reference');
  const currency = searchParams.get('currency') || 'NGN';
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const formattedAmount = amount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount))
    : 'your gift';

  const whatsAppMessage = `I just sowed a seed of ${formattedAmount} at VOSEM INT'L! Join us in experiencing God's grace.`;
  const whatsAppLink = `https://wa.me/?text=${encodeURIComponent(whatsAppMessage)}`;

  return (
    <SiteShell>
      <main className="flex-grow px-5 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="app-card text-center">
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-500/10 text-green-600">
              <CheckCircle2 className="size-9" />
            </div>
            <h1 className="font-display text-4xl italic sm:text-5xl">Payment successful</h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Thank you for your seed. Your gift has been received and a receipt has been recorded.
            </p>

            <div className="mt-10 grid gap-6 border-y border-border py-8 text-left sm:grid-cols-3">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Amount</span>
                <p className="mt-2 text-2xl font-bold">{formattedAmount}</p>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Date</span>
                <p className="mt-2 text-lg font-semibold">{date}</p>
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Reference</span>
                <p className="mt-2 truncate font-mono text-sm">{reference || 'N/A'}</p>
              </div>
            </div>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              {user ? (
                <Link href="/dashboard" className="site-btn site-btn-solid"><LayoutDashboard className="size-4" /> Go to dashboard</Link>
              ) : (
                <Link href="/" className="site-btn site-btn-solid">Return home</Link>
              )}
              {reference && (
                <Link href={`/receipt/${reference}`} target="_blank" className="site-btn site-btn-outline"><Download className="size-4" /> Download receipt</Link>
              )}
            </div>
            <a href={whatsAppLink} target="_blank" rel="noopener noreferrer" className="mx-auto mt-5 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-left align-middle text-sm font-bold leading-snug text-[#128C7E] hover:underline">
              <WhatsAppIcon className="size-5 shrink-0" /> <span>Share your testimony on WhatsApp</span>
            </a>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="app-shell flex min-h-screen items-center justify-center"><div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
