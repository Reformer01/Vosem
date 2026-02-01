
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { VosemLogoIcon } from '@/components/icons';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-accent"></div>
      </div>
    );
  }
  
  const handleSignOut = () => {
    auth.signOut();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-white">
       <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="w-full max-w-5xl bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl">
                <Link href="/" className="flex items-center gap-3 pl-2">
                    <VosemLogoIcon className="h-8 w-8 text-accent" />
                    <h1 className="text-xl md:text-2xl font-extrabold tracking-tighter text-white font-sans">
                        VOSEM <span className="text-accent">INT'L</span>
                    </h1>
                </Link>
                <div className="flex items-center gap-4">
                    <Button onClick={handleSignOut} variant="ghost" className="text-white/80 hover:text-accent hover:bg-white/10 rounded-full">
                        Logout
                    </Button>
                </div>
            </nav>
        </header>

      <main className="flex flex-1 flex-col items-center justify-center pt-32 p-6">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Welcome, {user.displayName || user.email}!
          </h1>
          <p className="mt-4 text-lg text-white/70">
            This is your personal dashboard. More features coming soon!
          </p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-panel p-8 rounded-2xl text-left">
              <h2 className="text-2xl font-bold text-accent mb-4">Donation History</h2>
              <p className="text-white/60">
                You have no donation records yet. All your future contributions will appear here.
              </p>
            </div>
            <div className="glass-panel p-8 rounded-2xl text-left">
              <h2 className="text-2xl font-bold text-accent mb-4">Recurring Giving</h2>
               <p className="text-white/60 mb-6">
                Automate your faithfulness. Set up a recurring gift today.
              </p>
              <Button disabled className="bg-accent/50 cursor-not-allowed w-full h-12 rounded-lg font-bold">
                Setup Recurring Gift (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
