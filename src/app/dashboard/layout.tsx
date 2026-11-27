'use client';
import LoadingDove from "@/components/site/loading-dove";

import { useMachine } from '@/machines/use-machine';
import { dashboardMenuMachine, givingDialogMachine } from '@/machines/app.machine';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { GivingModal } from "@/components/landing/giving-modal";
import { cn } from '@/lib/utils';
import { signOutUser, useSessionGuard } from '@/lib/session';
import { useMembershipGuard } from '@/lib/membership';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CalendarDays, FileText, Flame, HeartHandshake, LayoutDashboard, LogOut, MoreHorizontal, Settings2, ShieldCheck, UserRound } from 'lucide-react';
import { VosemLogoIcon } from '@/components/icons';

const baseLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/profile', label: 'Profile', icon: UserRound },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings2 },
  { href: '/dashboard/events', label: 'My Events', icon: CalendarDays },
  { href: '/dashboard/prayer', label: 'Prayer', icon: Flame },
  { href: '/dashboard/testimonies', label: 'My Testimonies', icon: FileText },
];
const adminLink = { href: '/admin', label: 'Admin', icon: ShieldCheck };
const bottomLinks = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: CalendarDays },
  { href: '/dashboard/prayer', label: 'Prayer', icon: Flame },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [dialogState, sendDialog] = useMachine(givingDialogMachine);
  const [menuState, sendMenu] = useMachine(dashboardMenuMachine);
  const isModalOpen = dialogState === "open";
  const isSheetOpen = menuState === "open";
  const setIsModalOpen = (next: boolean) => sendDialog(next ? "OPEN" : "CLOSE");
  const setIsSheetOpen = (next: boolean) => sendMenu(next ? "OPEN" : "CLOSE");
  const sessionStatus = useSessionGuard(!!user);
  useMembershipGuard(sessionStatus === 'valid');

  const roleRef = useMemoFirebase(() => (user ? doc(firestore, 'admins', user.uid) : null), [user, firestore]);
  const { data: role } = useDoc<{ role: string }>(roleRef);
  const isAdmin = role?.role === 'admin' || role?.role === 'moderator';
  const navLinks = isAdmin ? [...baseLinks, adminLink] : baseLinks;

  const handleSignOut = () => {
    void signOutUser(auth, firestore).finally(() => router.push('/'));
  };

  if (!user || sessionStatus !== 'valid') {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <LoadingDove className="size-10" />
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
          </div>
        </header>

        <main className="flex-grow pb-20 md:pb-0">{children}</main>

        <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
          <div className="grid grid-cols-5">
            {bottomLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${pathname === href ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                <Icon className="size-5" aria-hidden="true" />
                {label}
              </Link>
            ))}
            <button type="button" onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center gap-1 py-3 text-[11px] font-bold text-muted-foreground transition-colors hover:text-primary">
              <HeartHandshake className="size-5" aria-hidden="true" />
              Give
            </button>
            <button type="button" onClick={() => setIsSheetOpen(true)} aria-label="More options"
              className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${isSheetOpen ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <MoreHorizontal className="size-5" aria-hidden="true" />
              More
            </button>
          </div>
        </nav>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetContent side="left" className="flex flex-col bg-card p-0">
            <SheetHeader className="border-b border-border px-6 py-5 text-left">
              <SheetTitle className="flex items-center gap-2.5">
                <VosemLogoIcon className="size-7 text-primary" />
                <span className="text-lg font-black tracking-tighter">VOSEM <span className="text-primary">INT&apos;L</span></span>
              </SheetTitle>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Member portal</p>
            </SheetHeader>

            <nav className="flex flex-col gap-2 px-4 py-6" aria-label="More options">
              {[baseLinks[1], baseLinks[2], baseLinks[5], ...(isAdmin ? [adminLink] : [])].map(({ href, label, icon: Icon }) => (
                <SheetClose key={href} asChild>
                  <Link href={href} onClick={() => setIsSheetOpen(false)}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-bold transition-colors ${pathname === href ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    <Icon className="size-5" aria-hidden="true" />
                    {label}
                  </Link>
                </SheetClose>
              ))}
              <button type="button" onClick={() => { setIsSheetOpen(false); setIsModalOpen(true); }}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-bold text-foreground transition-colors hover:bg-muted">
                <HeartHandshake className="size-5" aria-hidden="true" />
                Give
              </button>
            </nav>

            <div className="mt-auto border-t border-border px-6 py-6">
              <p className="mb-4 text-sm font-semibold text-muted-foreground">{user.displayName || user.email}</p>
              <div className="mb-4 flex gap-4 text-xs font-semibold text-muted-foreground">
                <Link href="/contact" onClick={() => setIsSheetOpen(false)} className="hover:text-primary">Privacy Policy</Link>
                <Link href="/contact" onClick={() => setIsSheetOpen(false)} className="hover:text-primary">Terms of Service</Link>
              </div>
              <Button variant="outline" className="w-full rounded-full" onClick={() => { handleSignOut(); setIsSheetOpen(false); }}>
                <LogOut className="size-4" /> Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <footer className="border-t border-border py-4 pb-24 md:pb-4">
          <div className="site-wrap flex items-center justify-end gap-2 text-xs font-semibold text-muted-foreground">
            <div className="flex gap-6">
              <Link className="hover:text-primary transition-colors" href="/contact">Privacy Policy</Link>
              <Link className="hover:text-primary transition-colors" href="/contact">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </div>
      <GivingModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} defaultPurpose="Offerings" />
    </>
  );
}
