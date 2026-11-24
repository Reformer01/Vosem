'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface UserProfile {
  name: string;
  email: string;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  createdAt: { seconds: number; nanoseconds: number };
}

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const donationsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'donations'), where('userId', '==', user.uid)) : null, [user, firestore]);
  const { data: unsortedDonations, isLoading: isDonationsLoading } = useCollection<Donation>(donationsQuery);

  const donations = useMemo(() => {
    if (!unsortedDonations) return null;
    return [...unsortedDonations].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [unsortedDonations]);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push('/login');
  }, [user, isAuthLoading, router]);

  const isLoading = isAuthLoading || isProfileLoading || (user && isDonationsLoading);

  if (isLoading || !user) {
    return (
      <div className="app-shell flex flex-1 items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-dashed border-primary animate-spin" />
      </div>
    );
  }

  const displayName = userProfile?.name || user.displayName || user.email;
  const totalSown = donations?.reduce((acc, donation) => acc + donation.amount, 0) || 0;

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        {/* Welcome */}
        <div className="app-card flex flex-col justify-between gap-6 sm:flex-row sm:items-center sm:gap-10 border-t-4 border-t-primary">
          <div>
            <h1 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Welcome back, {displayName}</h1>
            <p className="mt-2 text-muted-foreground text-lg font-medium max-w-2xl">Your generosity is making a global impact. Thank you for partnering with us.</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Total Sown Year-to-Date</span>
            <div className="mt-1 text-3xl sm:text-4xl font-bold text-foreground font-mono">₦{(totalSown / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Seed history */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="text-foreground text-2xl font-bold">Seed History</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="site-curved border-border text-foreground">Export</Button>
            </div>
          </div>

          <div className="app-table overflow-x-auto bg-card border border-border rounded-[2rem]">
            <table className="app-table">
              <thead>
                <tr className="bg-muted/40 text-muted-foreground uppercase tracking-wider text-xs">
                  <th className="border-b border-border">Date</th>
                  <th className="border-b border-border">Purpose</th>
                  <th className="border-b border-border">Amount</th>
                  <th className="border-b border-border text-center">Status</th>
                  <th className="border-b border-border text-right">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {donations && donations.length > 0 ? (
                  donations.map(donation => (
                    <tr key={donation.id} className="hover:bg-muted/30 transition-colors border-b last:border-0 border-border/50">
                      <td className="text-foreground whitespace-nowrap">
                        {donation.createdAt ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
                      </td>
                      <td className="font-medium text-foreground">{donation.purpose}</td>
                      <td className="font-mono">₦{(donation.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</td>
                      <td className="text-center">
                        <span className={`app-status ${donation.status === 'succeeded' ? 'bg-green-500/10 text-green-700 border-green-500/20' : donation.status === 'pending' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{donation.status}</span>
                      </td>
                      <td className="text-right">
                        <Link href={`/receipt/${donation.id}`} className="text-primary hover:underline">View</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">You have no donation history yet. Your seeds will appear here.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
