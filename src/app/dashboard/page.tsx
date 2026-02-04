
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
}

interface Donation {
  id: string;
  amount: number; // in kobo
  currency: string;
  purpose: string;
  status: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const donationsQuery = useMemoFirebase(
    () => user ? query(collection(firestore, 'donations'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')) : null,
    [user, firestore]
  );

  const { data: donations, isLoading: isDonationsLoading } = useCollection<Donation>(donationsQuery);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const isLoading = isAuthLoading || isProfileLoading || (user && isDonationsLoading);

  if (isLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-dark">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }
  
  const displayName = userProfile?.name || user.displayName || user.email;
  const totalSown = donations?.reduce((acc, donation) => acc + donation.amount, 0) || 0;

  return (
    <div className="w-full flex justify-center py-8 md:py-12 px-6 md:px-10 lg:px-40">
        <div className="w-full max-w-6xl flex flex-col gap-10">
            {/* Welcome / Hero Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 pb-8 border-b border-[#331133]">
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{displayName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">
                        Your generosity is making a global impact. Thank you for partnering with us.
                    </p>
                </div>
                <div className="w-full lg:w-auto pt-6 lg:pt-0 mt-6 lg:mt-0 border-t border-[#331133] lg:border-none">
                    <div className="text-left lg:text-right">
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sown Year-to-Date</span>
                        <div className="text-4xl font-bold text-white font-mono mt-1">₦{(totalSown / 100).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>

            {/* Seed History Section */}
            <section className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                    <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">history_edu</span>
                        Seed History
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a101a] border border-[#331133] text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">filter_list</span>
                            Filter
                        </Button>
                        <Button variant="outline" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a101a] border border-[#331133] text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Export
                        </Button>
                    </div>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1a0a1a]/50 text-slate-400 text-xs uppercase tracking-wider border-b border-[#331133]">
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Purpose</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-[#331133]">
                                {donations && donations.length > 0 ? (
                                  donations.map(donation => (
                                    <tr key={donation.id} className="glass-row">
                                      <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                        {donation.createdAt ? new Date(donation.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '...'}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-slate-200 font-medium">{donation.purpose}</td>
                                      <td className="px-6 py-4 whitespace-nowrap font-mono text-white">
                                          ₦{(donation.amount / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize bg-green-500/10 text-green-300 border border-green-500/20">
                                          {donation.status}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-primary hover:text-purple-300 transition-colors">
                                          View
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-400">
                                      You have no donation history yet. Your seeds will appear here.
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {donations && donations.length > 0 && (
                        <div className="px-6 py-4 border-t border-[#331133] bg-[#120a12]/50 flex justify-center">
                            <button className="text-sm text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                                View Full History
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

        </div>
    </div>
  );
}
