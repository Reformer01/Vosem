'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Check, Download, Flame, Search, Trophy } from 'lucide-react';
import Link from 'next/link';
import { normalizeDonationStatus } from '@/machines/payment.machine';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
  avatarStyle?: string;
}

interface Donation {
  id: string;
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  reference?: string;
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

  const testimoniesQuery = useMemoFirebase(() => user ? query(collection(firestore, 'testimonies'), where('authorId', '==', user.uid)) : null, [user, firestore]);
  const { data: myTestimonies } = useCollection(testimoniesQuery);

  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 5;

  const donations = useMemo(() => {
    if (!unsortedDonations) return null;
    return [...unsortedDonations].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }, [unsortedDonations]);

  const filteredDonations = useMemo(() => {
    if (!donations) return [];
    const term = search.trim().toLowerCase();
    return donations.filter(d => {
      const date = d.createdAt ? new Date(d.createdAt.seconds * 1000) : null;
      const matchesTerm = !term || d.purpose.toLowerCase().includes(term) || d.reference?.toLowerCase().includes(term);
      const matchesFrom = !fromDate || (date && date >= new Date(fromDate));
      const matchesTo = !toDate || (date && date <= new Date(`${toDate}T23:59:59`));
      return matchesTerm && matchesFrom && matchesTo;
    });
  }, [donations, search, fromDate, toDate]);

  const totalSown = donations?.reduce((acc, donation) => acc + donation.amount, 0) || 0;

  const givingMonths = useMemo(() => {
    const set = new Set((donations ?? []).map(d => new Date(d.createdAt.seconds * 1000).toISOString().slice(0, 7)));
    let streak = 0;
    const cursor = new Date();
    while (set.has(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`)) {
      streak++;
      cursor.setMonth(cursor.getMonth() - 1);
    }
    return { streak, months: set.size, count: donations?.length ?? 0, total: totalSown / 100 };
  }, [donations, totalSown]);

  const milestones = [
    { label: 'First seed sown', reached: givingMonths.count >= 1 },
    { label: '3 gifts given', reached: givingMonths.count >= 3 },
    { label: '₦10,000 sown', reached: givingMonths.total >= 10000 },
    { label: '₦50,000 sown', reached: givingMonths.total >= 50000 },
  ];

  const pagedDonations = filteredDonations.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / pageSize));

  const exportCsv = () => {
    const rows = [['Date', 'Purpose', 'Amount (NGN)', 'Status', 'Reference'], ...filteredDonations.map(d => [
      d.createdAt ? new Date(d.createdAt.seconds * 1000).toISOString().slice(0, 10) : '',
      d.purpose,
      String(d.amount / 100),
      d.status,
      d.reference || d.id,
    ])];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vosem-giving-history.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

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

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        {/* Welcome */}
        <div className="app-card flex flex-col justify-between gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div>
            <h1 className="text-foreground text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Welcome back, {displayName}</h1>
            <p className="mt-2 text-muted-foreground text-lg font-medium max-w-2xl">Your generosity is making a global impact. Thank you for partnering with us.</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-muted-foreground text-sm font-bold uppercase tracking-wider">Total Sown Year-to-Date</span>
            <div className="mt-1 text-3xl sm:text-4xl font-bold text-foreground font-mono">₦{(totalSown / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>

        {/* Onboarding / progress */}
        <section className="app-card flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold">Your next steps</h2>
            <p className="mt-1 text-sm text-muted-foreground">Small steps help you feel at home in the VOSEM family.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Complete your profile', done: !!userProfile?.name && !!userProfile?.whatsappNumber, href: '/dashboard/profile' },
              { label: 'Sow your first seed', done: (donations?.length ?? 0) > 0, href: '/giving' },
              { label: 'Share a testimony', done: (myTestimonies?.length ?? 0) > 0, href: '/#testimonies' },
              { label: 'Join a prayer group', done: false, href: '/prayer' },
            ].map(step => (
              <Link key={step.label} href={step.href} className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-sm font-semibold transition-colors ${step.done ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border bg-card hover:bg-muted'}`}>
                {step.label} {step.done ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
              </Link>
            ))}
          </div>
        </section>

        {/* Giving milestones and streak */}
        <section className="app-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="size-5 text-primary" /> Giving milestones</h2>
              <p className="mt-1 text-sm text-muted-foreground">Celebrate every step of your generosity journey.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
              <Flame className="size-4" /> {givingMonths.streak}-month streak · {givingMonths.months} months giving
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map(m => (
              <div key={m.label} className={`flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold ${m.reached ? 'border-primary/30 bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
                {m.reached ? <Check className="size-4" /> : <span className="size-4 rounded-full border border-current" />}
                {m.label}
              </div>
            ))}
          </div>
        </section>

        {/* Seed history */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-foreground text-2xl font-bold">Seed History</h2>
              <Button variant="outline" className="site-curved border-border text-foreground" onClick={exportCsv}>
                <Download className="size-4" /> Export CSV
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Search purpose or reference" className="site-curved pl-9" />
              </div>
              <Input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(0); }} className="site-curved w-auto" aria-label="From date" />
              <Input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(0); }} className="site-curved w-auto" aria-label="To date" />
            </div>
          </div>

          {/* Mobile: stacked transaction records, no sideways scrolling */}
          <div className="md:hidden flex flex-col gap-3">
            {pagedDonations.length > 0 ? pagedDonations.map(donation => (
              <article key={donation.id} className="site-curved border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</p>
                    <p className="mt-1 text-xl font-bold text-foreground">₦{(donation.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <span className={`app-status shrink-0 ${normalizeDonationStatus(donation.status) === 'succeeded' ? 'bg-green-500/10 text-green-700 border border-green-500/20' : normalizeDonationStatus(donation.status) === 'pending' ? 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20' : 'bg-primary/10 text-primary border border-primary/20'}`}>{normalizeDonationStatus(donation.status)}</span>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">{donation.purpose}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {donation.createdAt ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '...'}
                    </p>
                  </div>
                  <Link href={`/receipt/${donation.id}`} className="shrink-0 text-sm font-bold text-primary underline underline-offset-4">Receipt</Link>
                </div>
              </article>
            )) : (
              <div className="site-curved border border-border bg-card p-8 text-center text-muted-foreground">
                You have no donation history yet. Your seeds will appear here.
              </div>
            )}
          </div>

          {/* Desktop: full table */}
          <div className="hidden md:block bg-card border border-border rounded-[2rem]">
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
                        <span className={`app-status ${normalizeDonationStatus(donation.status) === 'succeeded' ? 'bg-green-500/10 text-green-700 border-green-500/20' : normalizeDonationStatus(donation.status) === 'pending' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{normalizeDonationStatus(donation.status)}</span>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-2 text-sm font-semibold">
              <Button variant="outline" className="rounded-full" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="text-muted-foreground">Page {page + 1} of {totalPages}</span>
              <Button variant="outline" className="rounded-full" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
