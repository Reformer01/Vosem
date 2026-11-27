'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-16 text-center">
      <div className="app-card max-w-md">
        <h1 className="font-display text-3xl italic">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">We could not load this page just now. Please try again, or head back to the church home page.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="site-btn site-btn-solid">Try again</button>
          <Link href="/" className="site-btn site-btn-outline">Go home</Link>
        </div>
      </div>
    </main>
  );
}
