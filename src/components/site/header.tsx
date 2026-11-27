"use client";

import Link from "next/link";
import { useMachine } from "@/machines/use-machine";
import { headerMenuMachine } from "@/machines/app.machine";
import { LogOut, Menu } from "lucide-react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VosemLogoIcon } from "@/components/icons";
import { endSession } from "@/lib/session";

const links = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/sermons", label: "Sermons" },
  { href: "/prayer", label: "Prayer" },
  { href: "/voice-of-salvation", label: "Voice of Salvation" },
  { href: "/giving", label: "Giving" },
  { href: "/contact", label: "Contact" },
];

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <VosemLogoIcon className="size-11 text-primary" />
      <span className="text-lg font-black tracking-tighter">
        VOSEM <span className="text-primary">INT&apos;L</span>
      </span>
    </span>
  );
}

export default function SiteHeader() {
  const [menuState, sendMenu] = useMachine(headerMenuMachine);
  const open = menuState === "open";
  const setOpen = (next: boolean) => sendMenu(next ? "OPEN" : "CLOSE");
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const handleSignOut = () => {
    void endSession(firestore).finally(() => auth.signOut());
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
      <div className="site-wrap flex h-[74px] items-center justify-between gap-6">
        <Link href="/" aria-label="VOSEM International home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-bold text-foreground/75 transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isUserLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <Link href="/dashboard" className="site-btn site-btn-solid">Dashboard</Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Log out" className="rounded-full">
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 text-sm font-bold hover:text-primary">Login</Link>
              <Link href="/signup" className="site-btn site-btn-solid">Join Us</Link>
            </>
          )}
        </div>

        <div className="lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open menu">
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-card">
              <SheetHeader>
                <SheetTitle asChild><Logo /></SheetTitle>
              </SheetHeader>
              <nav className="mt-10 flex flex-col gap-6" aria-label="Mobile navigation">
                {links.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link href={link.href} className="text-lg font-bold hover:text-primary">{link.label}</Link>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3 border-t border-border pt-6">
                {user ? (
                  <>
                    <SheetClose asChild><Link href="/dashboard" className="site-btn site-btn-solid">Dashboard</Link></SheetClose>
                    <Button variant="outline" onClick={() => { handleSignOut(); setOpen(false); }}>Log out</Button>
                  </>
                ) : (
                  <>
                    <SheetClose asChild><Link href="/signup" className="site-btn site-btn-solid">Join Us</Link></SheetClose>
                    <SheetClose asChild><Link href="/login" className="site-btn site-btn-outline">Login</Link></SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
