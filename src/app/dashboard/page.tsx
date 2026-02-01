
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { GivingModal } from "@/components/landing/giving-modal";
import Link from 'next/link';
import Image from 'next/image';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
}

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const isUserLoading = isAuthLoading || (user && isProfileLoading);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-dark">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }
  
  const handleSignOut = () => {
    auth.signOut();
    router.push('/');
  };

  const displayName = userProfile?.name || user.displayName || user.email;

  return (
    <>
    <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 w-full border-b border-[#331133] bg-[#0a050a]/90 backdrop-blur-md">
            <div className="px-6 md:px-10 lg:px-40 flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-4 text-white">
                    <div className="flex items-center justify-center size-8 rounded bg-gradient-to-br from-primary to-purple-900 text-white">
                        <span className="material-symbols-outlined text-[20px]">church</span>
                    </div>
                    <h2 className="text-white text-lg font-extrabold tracking-wide">VOSEM INT'L</h2>
                </Link>

                <div className="hidden md:flex flex-1 justify-end gap-8 items-center">
                    <nav className="flex items-center gap-8">
                        <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-0.5" href="/dashboard">Dashboard</Link>
                        <button onClick={() => setIsModalOpen(true)} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Give</button>
                        <Link className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Profile</Link>
                        <Link className="text-slate-300 hover:text-white text-sm font-medium transition-colors" href="#">Settings</Link>
                    </nav>
                    <div className="h-6 w-px bg-[#331133]"></div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleSignOut} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                            <span className="text-sm font-medium">Log Out</span>
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                        {user.photoURL ? (
                            <Image src={user.photoURL} alt="User profile avatar" width={40} height={40} className="rounded-full size-10 border-2 border-primary/30" />
                        ) : (
                            <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary/30 flex items-center justify-center bg-surface-dark text-slate-400">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                        )}
                    </div>
                </div>

                <button className="md:hidden text-white">
                    <span className="material-symbols-outlined">menu</span>
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col">
            <div className="w-full flex justify-center py-8 md:py-12 px-6 md:px-10 lg:px-40">
                <div className="w-full max-w-6xl flex flex-col gap-10">
                    {/* Welcome / Hero Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#331133]">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">
                                Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{displayName}</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-medium max-w-2xl">
                                Your generosity is making a global impact. Thank you for partnering with us.
                            </p>
                        </div>
                        <div className="flex flex-col items-start md:items-end gap-3">
                            <div className="text-right hidden md:block">
                                <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sown Year-to-Date</span>
                                <div className="text-3xl font-bold text-white font-mono">$0.00</div>
                            </div>
                            <Button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 rounded-lg h-12 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold tracking-wide shadow-[0_0_20px_rgba(238,43,238,0.3)] transition-all transform hover:scale-105">
                                <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
                                <span>New Donation</span>
                            </Button>
                        </div>
                    </div>

                    {/* Recurring Giving Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">autorenew</span>
                                Active Commitments
                            </h2>
                            <Link className="text-primary text-sm font-semibold hover:underline" href="#">View All Plans</Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="glass-panel p-5 rounded-xl flex items-center justify-center text-center text-slate-400">
                             <p>You have no active commitments. <br/>Set one up today to automate your giving!</p>
                           </div>
                           <div className="glass-panel p-5 rounded-xl flex items-center justify-center text-center text-slate-400">
                             <p>Your second commitment card could be here.</p>
                           </div>
                        </div>
                    </section>

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
                                        <tr>
                                            <td colSpan={5} className="text-center p-8 text-slate-400">
                                                You have no donation history yet. Your seeds will appear here.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                             <div className="px-6 py-4 border-t border-[#331133] bg-[#120a12]/50 flex justify-center">
                                <button className="text-sm text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                                    View Full History
                                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
        <footer className="mt-auto border-t border-[#331133] py-6 bg-[#0a050a]">
            <div className="px-6 md:px-40 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
                <p>© 2026 VOSEM INT'L. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link className="hover:text-white transition-colors" href="#">Privacy Policy</Link>
                    <Link className="hover:text-white transition-colors" href="#">Terms of Service</Link>
                    <Link className="hover:text-white transition-colors" href="#">Support</Link>
                </div>
            </div>
        </footer>
    </div>
    <GivingModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} defaultPurpose="Offerings" />
    </>
  );
}
