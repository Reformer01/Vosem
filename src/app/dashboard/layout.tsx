'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { GivingModal } from "@/components/landing/giving-modal";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
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

  const handleSignOut = () => {
    auth.signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-dashed border-primary animate-spin" />
      </div>
    );
  }

  const navLinkClasses = (path: string) => cn(
    'text-sm font-semibold transition-colors',
    pathname === path ? 'text-primary underline underline-offset-4' : 'text-muted-foreground hover:text-primary'
  );

  return (
    <>
      <div className="app-shell flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
          <div className="site-wrap flex h-16 items-center justify-between">
            <Link href="/" aria-label="VOSEM Home" className="flex items-center gap-2.5">
              <VosemLogoIcon className="size-7 text-primary" />
              <span className="text-lg font-black tracking-tighter">VOSEM <span className="text-primary">INT&apos;L</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={navLinkClasses(link.href)}>{link.label}</Link>
              ))}
              <Button className="site-btn site-btn-solid" onClick={() => setIsModalOpen(true)}>Give</Button>
              <Button variant="ghost" className="rounded-full" onClick={handleSignOut} aria-label="Log out">
                <LogOut className="size-5" />
              </Button>
            </div>
            <Button variant="ghost" className="md:hidden rounded-full" aria-label="Mobile menu"><Menu className="size-6" /></Button>
          </div>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="border-t border-border py-4">
          <div className="site-wrap flex flex-col md:flex-row items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
            <p>© 2026 VOSEM INT&apos;L. All rights reserved.</p>
            <div className="flex gap-6">
              <Link className="hover:text-primary transition-colors" href="#">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="#">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
      <GivingModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} defaultPurpose="Offerings" />
    </>
  );
}
