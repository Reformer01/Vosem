'use client';
import { VosemLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RefreshCw, Headset, AlertTriangle, ChevronDown } from 'lucide-react';

export default function PaymentFailedPage() {
  return (
    <div className="bg-background font-sans text-white antialiased min-h-screen flex flex-col">
      <Link href="/" className="absolute top-8 left-8 z-20 flex items-center gap-3">
        <VosemLogoIcon className="size-8 text-accent" />
        <h2 className="text-white text-lg font-bold tracking-tight">VOSEM INT'L</h2>
      </Link>

      <main className="relative flex-1 flex items-center justify-center p-4">
        <div className="absolute w-[400px] h-[400px] bg-radial-gradient(circle, rgba(238, 43, 238, 0.15) 0%, rgba(0, 0, 0, 0) 70%) top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>

        <div className="glass-panel bg-white/5 relative w-full max-w-[480px] rounded-2xl p-8 sm:p-12 text-center z-10 animate-[fadeIn_0.5s_ease-out]">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mb-8 text-lg font-normal leading-relaxed text-white/60">
            Transaction declined. Please check your card details or try a different payment method.
          </p>

          <div className="flex flex-col sm:flex-row sm:gap-4 gap-3">
            <Button asChild className="group relative flex h-12 w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-accent px-6 font-semibold text-white transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background">
              <Link href="/#giving">
                <RefreshCw className="mr-2 h-5 w-5" />
                Try Again
              </Link>
            </Button>
            <Button variant="secondary" className="group flex h-12 w-full flex-1 items-center justify-center rounded-lg px-6 font-semibold text-white transition-all bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-background">
              <Headset className="mr-2 h-5 w-5 text-white/70 group-hover:text-white" />
              Contact Support
            </Button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <button className="group flex items-center justify-center gap-1 text-sm text-white/40 transition-colors hover:text-white/60 mx-auto">
              <span>Error Code: 502</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 left-0 w-full py-6 text-center z-10">
        <p className="text-xs text-white/20">
          © 2026 VOSEM INT'L. Secure Payment Processing.
        </p>
      </footer>
    </div>
  );
}
