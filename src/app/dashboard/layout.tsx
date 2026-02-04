'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { GivingModal } from "@/components/landing/giving-modal";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { VosemLogoIcon } from '@/components/icons';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/settings', label: 'Settings' },
];


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

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
                                {navLinks.map(link => (
                                    <Link key={link.href} className={navLinkClasses(link.href)} href={link.href}>{link.label}</Link>
                                ))}
                                <button onClick={() => setIsModalOpen(true)} className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Give</button>
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
                        
                        <div className="md:hidden">
                            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                              <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                                  <Menu />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </SheetTrigger>
                              <SheetContent side="left" className="bg-background border-r-0 flex flex-col">
                                <SheetHeader>
                                  <SheetTitle className="sr-only">Menu</SheetTitle>
                                </SheetHeader>
                                <div>
                                  <div className="flex items-center gap-3 mb-8">
                                    <VosemLogoIcon className="size-8 text-primary" />
                                    <h2 className="text-xl font-extrabold tracking-tighter text-white font-sans">
                                      VOSEM <span className="text-primary">INT'L</span>
                                    </h2>
                                  </div>
                                  <div className="flex flex-col gap-6">
                                    {navLinks.map((link) => (
                                      <SheetClose key={link.href} asChild>
                                        <Link
                                          href={link.href}
                                          className="text-lg font-semibold text-white/90 hover:text-primary transition-colors"
                                          onClick={() => setIsSheetOpen(false)}
                                        >
                                          {link.label}
                                        </Link>
                                      </SheetClose>
                                    ))}
                                    <button
                                      onClick={() => { setIsModalOpen(true); setIsSheetOpen(false); }}
                                      className="text-left text-lg font-semibold text-white/90 hover:text-primary transition-colors"
                                    >
                                      Give
                                    </button>
                                  </div>
                                </div>
                                <div className="border-t border-white/10 mt-auto pt-6">
                                   <div className="space-y-4">
                                      <Button onClick={() => { handleSignOut(); setIsSheetOpen(false); }} variant="outline" className="w-full text-white bg-transparent border-white/20 rounded-full">
                                        <LogOut className="mr-2" /> Logout
                                      </Button>
                                    </div>
                                  </div>
                              </SheetContent>
                            </Sheet>
                        </div>
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
