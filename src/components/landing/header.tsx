"use client";
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="w-full max-w-5xl bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 pl-2">
          <div className="size-8 bg-white/20 rounded-full"></div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tighter text-white font-body">
            VOSEM <span className="text-accent">INT'L</span>
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-semibold text-white/90 hover:text-accent transition-colors">
              {link.label}
            </Link>
          ))}
          <Button asChild className="ml-2 px-6 py-2 rounded-full bg-accent text-white text-sm font-bold hover:bg-white hover:text-accent shadow-[0_0_20px_rgba(181,4,82,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
            <Link href="/#giving">Join Us</Link>
          </Button>
        </div>
        <div className="md:hidden">
          {isMounted ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-2 rounded-full transition-colors">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-background-dark border-r-0">
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="size-8 bg-white/20 rounded-full"></div>
                    <h2 className="text-2xl font-extrabold tracking-tighter text-white font-body">
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
                  <Button asChild className="mt-auto w-full px-6 py-3 rounded-full bg-accent text-white text-md font-bold hover:bg-white hover:text-accent shadow-[0_0_20px_rgba(181,4,82,0.4)] transition-all duration-300">
                    <Link href="/#giving" onClick={() => setIsSheetOpen(false)}>Join Us</Link>
                  </Button>
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
