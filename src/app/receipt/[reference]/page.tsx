
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
      <div className="flex flex-col min-h-screen items-center justify-center bg-background text-white p-6">
         <div className="text-center">
            <VosemLogoIcon className="size-16 text-primary mx-auto mb-6"/>
            <h1 className="text-3xl font-bold mb-4">Receipt Not Found</h1>
            <p className="text-slate-400 mb-8">The transaction reference may be invalid or the receipt is not available.</p>
            <Link href="/dashboard" className="text-primary hover:underline">
              Return to Dashboard
            </Link>
        </div>
      </div>
    );
  }

  return <ReceiptDetails donation={donation} />;
}
