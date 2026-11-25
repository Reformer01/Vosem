
import * as admin from 'firebase-admin';
import { ReceiptDetails } from '@/components/receipt/receipt-details';
import { VosemLogoIcon } from '@/components/icons';
import Link from 'next/link';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();

interface Donation {
  id: string;
  amount: number; // in kobo
  currency: string;
  purpose: string;
  status: string;
  createdAt: admin.firestore.Timestamp;
  donorName: string;
  donorEmail: string;
}

async function getDonation(reference: string): Promise<any | null> {
  if (!reference) return null;
  try {
    const docSnap = await db.collection('donations').doc(reference).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      // Ensure createdAt is a serializable object for the client component
      const processedData = {
        ...data,
        id: docSnap.id,
        createdAt: data?.createdAt.toDate().toISOString(),
      }
      return processedData;
    }
    return null;
  } catch (error) {
    console.error("Error fetching donation:", error);
    return null;
  }
}


export default async function ReceiptPage({ params }: { params: { reference: string } }) {
  const donation = await getDonation(params.reference);

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
            <p className="mt-3 text-muted-foreground">The transaction reference may be invalid or the receipt is not available.</p>
            <Link href="/dashboard" className="site-btn site-btn-solid mt-8">Return to dashboard</Link>
          </div>
        </main>
      </div>
    );
  }

  return <ReceiptDetails donation={donation} />;
}
