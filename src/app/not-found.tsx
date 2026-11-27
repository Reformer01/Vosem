import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-5 py-16 text-center">
      <div className="app-card max-w-md">
        <p className="site-eyebrow">404</p>
        <h1 className="font-display text-3xl italic">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-muted-foreground">The link may have moved. You can return home or explore what&apos;s happening at VOSEM.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="site-btn site-btn-solid">Go home</Link>
          <Link href="/contact" className="site-btn site-btn-outline">Contact us</Link>
        </div>
      </div>
    </main>
  );
}
