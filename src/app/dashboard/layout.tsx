'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { GivingModal } from "@/components/landing/giving-modal";
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSignOut = () => {
        auth.signOut();
        router.push('/');
    };

    if (!user) {
        // This can be a loading spinner or null, as the page itself will redirect.
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-dark">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
            </div>
        );
    }
    
    const navLinkClasses = (path: string) => cn(
        "text-sm font-medium transition-colors",
        pathname === path
            ? "text-primary font-bold border-b-2 border-primary pb-0.5"
            : "text-slate-300 hover:text-white"
    );

    return (
        <>
            <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-white">
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
                                <Link className={navLinkClasses("/dashboard")} href="/dashboard">Dashboard</Link>
                                <button onClick={() => setIsModalOpen(true)} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Give</button>
                                <Link className={navLinkClasses("/dashboard/profile")} href="/dashboard/profile">Profile</Link>
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

                <main className="flex-grow flex flex-col">
                    {children}
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
