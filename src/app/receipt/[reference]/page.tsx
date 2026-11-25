"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { doc } from "firebase/firestore";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
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
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" />
      </div>
    );
  }

  if (!donation) {
    return (
      <div className="app-shell flex min-h-screen flex-col">
        <header className="border-b border-border bg-card">
          <div className="site-wrap flex h-16 items-center gap-2.5 text-lg font-black tracking-tighter">
            <VosemLogoIcon className="size-7 text-primary" /> VOSEM <span className="text-primary">INT&apos;L</span>
          </div>
        </header>
        <main className="flex flex-grow items-center justify-center p-6">
          <div className="app-card max-w-lg text-center">
            <h1 className="text-3xl font-bold">Receipt not found</h1>
            <p className="mt-3 text-muted-foreground">This reference may be invalid, or the record is still being saved. Check your giving history in the dashboard.</p>
            <Link href="/dashboard" className="site-btn site-btn-solid mt-8">Return to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  const createdAt = typeof donation.createdAt === "string"
    ? donation.createdAt
    : donation.createdAt?.toDate?.().toISOString() ?? new Date().toISOString();

  return (
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
  );
}
