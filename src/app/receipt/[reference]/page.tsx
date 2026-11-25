"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import SiteShell from "@/components/site/site-shell";
import { VosemLogoIcon } from "@/components/icons";
import { ReceiptDetails } from "@/components/receipt/receipt-details";

interface Donation {
  amount: number;
  currency: string;
  purpose: string;
  status: string;
  createdAt: { toDate?: () => Date } | string;
  donorName: string;
  donorEmail: string;
}

export default function ReceiptPage() {
  const params = useParams<{ reference: string }>();
  const firestore = useFirestore();
  const ref = useMemoFirebase(() => (firestore ? doc(firestore, "donations", params.reference) : null), [firestore, params.reference]);
  const { data: donation, isLoading } = useDoc<Donation>(ref);

  if (isLoading) {
    return (
      <SiteShell>
        <main className="flex flex-grow items-center justify-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" />
        </main>
      </SiteShell>
    );
  }

  if (!donation) {
    return (
      <SiteShell>
        <main className="flex flex-grow items-center justify-center px-5 py-16">
          <div className="app-card max-w-lg text-center">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <VosemLogoIcon className="size-7" />
            </div>
            <h1 className="text-3xl font-bold">Receipt not found</h1>
            <p className="mt-3 text-muted-foreground">
              This reference may be invalid, or the record is still being saved. Check your giving history in the dashboard.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/dashboard" className="site-btn site-btn-solid">Back to dashboard</Link>
              <Link href="/giving" className="site-btn site-btn-outline">Giving</Link>
              <Link href="/contact" className="site-btn site-btn-outline">Contact support</Link>
            </div>
          </div>
        </main>
      </SiteShell>
    );
  }

  const createdAt = typeof donation.createdAt === "string"
    ? donation.createdAt
    : donation.createdAt?.toDate?.().toISOString() ?? new Date().toISOString();

  return (
    <SiteShell>
      <main className="flex-grow px-5 py-10">
        <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            ← Back to dashboard
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary">My giving history</Link>
        </div>
        <ReceiptDetails donation={{
          id: params.reference,
          amount: donation.amount,
          currency: donation.currency,
          purpose: donation.purpose,
          status: donation.status,
          createdAt,
          donorName: donation.donorName || "Valued Giver",
          donorEmail: donation.donorEmail || "",
        }} />
      </main>
    </SiteShell>
  );
}
