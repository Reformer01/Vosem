"use client";
import Link from 'next/link';
import { Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@/firebase';
import { VosemLogoIcon } from '../icons';

const navLinks = [
  { href: '/#home', label: 'Home' },
  { href: '/#events', label: 'Events' },
  { href: '/#sermons', label: 'Sermons' },
  { href: '/#testimonies', label: 'Testimonies' },
  { href: '/#giving', label: 'Giving' },
  { href: '/#about', label: 'About' },
];

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-5xl bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 pl-2">
          <VosemLogoIcon className="size-8 text-accent" />
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tighter text-white font-sans">
            VOSEM <span className="text-accent">INT'L</span>
          </h1>
        </Link>
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-white/90 hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
          {isUserLoading ? (
             <div className="h-8 w-24 bg-white/10 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Button asChild className="ml-2 px-6 py-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-white hover:text-accent shadow-[0_0_20px_rgba(181,4,82,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleSignOut} variant="ghost" size="icon" className="text-white/70 hover:text-accent rounded-full">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full">
                 <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="ml-2 px-6 py-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-white hover:text-accent shadow-[0_0_20px_rgba(181,4,82,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
                <Link href="/signup">Join Us</Link>
              </Button>
            </>
          )}
        </div>
        <div className="lg:hidden">
          {isMounted ? (
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
                    <VosemLogoIcon className="size-8 text-accent" />
                    <h2 className="text-2xl font-extrabold tracking-tighter text-white font-sans">
                      VOSEM <span className="text-accent">INT'L</span>
                    </h2>
                  </div>
                  <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className="text-lg font-semibold text-white/90 hover:text-accent transition-colors"
                          onClick={() => setIsSheetOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 mt-auto pt-6">
                    {isUserLoading ? (
                       <div className="h-12 w-full bg-white/10 rounded-full animate-pulse" />
                    ): user ? (
                       <div className="space-y-4">
                          <Button asChild className="w-full px-6 py-3 rounded-full bg-accent text-white text-md font-bold" onClick={() => setIsSheetOpen(false)}>
                            <Link href="/dashboard">Dashboard</Link>
                          </Button>
                          <Button onClick={() => { handleSignOut(); setIsSheetOpen(false); }} variant="outline" className="w-full text-white bg-transparent border-white/20 rounded-full">
                            Logout
                          </Button>
                        </div>
                    ) : (
                       <div className="space-y-4">
                        <Button asChild className="w-full px-6 py-3 rounded-full bg-accent text-white text-md font-bold" onClick={() => setIsSheetOpen(false)}>
                           <Link href="/signup">Join Us</Link>
                        </Button>
                        <Button asChild variant="ghost" className="w-full text-white" onClick={() => setIsSheetOpen(false)}>
                           <Link href="/login">Login</Link>
                        </Button>
                      </div>
                    )}
                  </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
              <Menu />
              <span className="sr-only">Open menu</span>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
