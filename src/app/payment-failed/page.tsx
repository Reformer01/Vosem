'use client';
import { VosemLogoIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentFailedPage() {
  return (
    <div className="bg-background-dark font-body text-white antialiased min-h-screen flex flex-col overflow-x-hidden">
      <header className="w-full absolute top-0 left-0 z-50">
        <div className="px-6 py-5 flex items-center justify-between max-w-[1400px] mx-auto w-full">
          <Link href="/" className="flex items-center gap-3">
            <VosemLogoIcon className="size-8 text-accent" />
            <h2 className="text-white text-lg font-bold tracking-tight">VOSEM INT'L</h2>
          </Link>
        </div>
      </header>

      <main className="relative flex-1 flex items-center justify-center p-4">
        <div className="absolute w-[400px] h-[400px] bg-radial-gradient(circle, rgba(238, 43, 238, 0.15) 0%, rgba(0, 0, 0, 0) 70%) top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none"></div>

        <div className="glass-panel bg-white/5 relative w-full max-w-[480px] rounded-2xl p-8 sm:p-12 text-center z-10 animate-[fadeIn_0.5s_ease-out]">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/20">
            <span className="material-symbols-outlined text-[40px] text-red-500">
              warning
            </span>
          </div>

          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Something went wrong
          </h1>
          <p className="mb-8 text-lg font-normal leading-relaxed text-white/60">
            Transaction declined. Please check your card details or try a different payment method.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <Link href="/#giving" className='w-full'>
              <Button className="group relative flex h-12 w-full flex-1 items-center justify-center overflow-hidden rounded-lg bg-accent px-6 font-semibold text-white transition-all hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-black">
                <span className="material-symbols-outlined mr-2 text-[20px]">refresh</span>
                Try Again
              </Button>
            </Link>
            <Button variant="ghost" className="glass-btn group flex h-12 w-full flex-1 items-center justify-center rounded-lg px-6 font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black">
              <span className="material-symbols-outlined mr-2 text-[20px] text-white/70 group-hover:text-white">support_agent</span>
              Contact Support
            </Button>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <button className="group flex items-center justify-center gap-1 text-sm text-white/40 transition-colors hover:text-white/60 mx-auto">
              <span>Error Code: 502</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
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
