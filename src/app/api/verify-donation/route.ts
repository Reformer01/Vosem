
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import { createHmac, timingSafeEqual } from 'crypto';
import { verifyIdToken } from '@/lib/verify-id-token';

// In-memory store for rate limiting.
// Note: This is a simple in-memory solution suitable for a single server instance.
// For multi-instance deployments, a distributed store like Redis would be required.
const ipRequestCounts = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 15; // Allow 15 requests per IP per minute


// Initialize Firebase Admin SDK
// This will automatically use the GOOGLE_APPLICATION_CREDENTIALS environment variable
// in production on Firebase App Hosting.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

// Firestore persistence is optional: if Admin credentials are missing we still
// verify the payment and return success, but skip the write.
let db: admin.firestore.Firestore | null = null;
try {
  db = admin.firestore();
} catch (error) {
  console.error('Firestore admin unavailable; donations will not be persisted:', error);
}

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => (
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!
));

function nameFromEmail(email?: string): string | null {
  if (!email) return null;
  const local = email.split('@')[0];
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (!parts.length) return null;
  return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

type DonorTx = {
  metadata?: { name?: string; userId?: string };
  customer?: { email?: string; first_name?: string; last_name?: string };
};

/** Full name for receipts — never fall back to a raw email address. */
async function resolveDonorName(tx: DonorTx, userId?: string): Promise<string> {
  let name = '';
  if (userId && db) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      name = String(userDoc.data()?.name || '').trim();
    } catch { /* fall through to transaction metadata */ }
  }
  if (!name) name = String(tx.metadata?.name || '').trim();
  if (!name && tx.customer?.first_name) {
    name = [tx.customer.first_name, tx.customer.last_name].filter(Boolean).join(' ').trim();
  }
  if (!name) name = nameFromEmail(tx.customer?.email) || '';
  return escapeHtml(name || 'Valued Giver');
}

export async function POST(req: NextRequest) {
  // Simple IP-based rate limiting to prevent abuse
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
  const now = Date.now();

  const record = ipRequestCounts.get(ip);

  if (record) {
    const isNewWindow = now - record.windowStart > RATE_LIMIT_WINDOW_MS;
    if (isNewWindow) {
      // Start a new window
      ipRequestCounts.set(ip, { count: 1, windowStart: now });
    } else {
      // Check request count in the current window
      if (record.count >= MAX_REQUESTS_PER_WINDOW) {
        return NextResponse.json({ message: 'Too many requests. Please try again later.' }, { status: 429 });
      }
      // Increment count
      record.count++;
    }
  } else {
    // First request from this IP
    ipRequestCounts.set(ip, { count: 1, windowStart: now });
  }
  
  // Paystack webhook (signature-authenticated, no user token). This lets the
  // configured webhook URL point at the same endpoint as client verification.
  const signature = req.headers.get('x-paystack-signature');
  const rawBody = await req.text();
  if (signature) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ message: 'Missing payment key' }, { status: 500 });
    const expected = createHmac('sha512', secret).update(rawBody).digest('hex');
    const valid = signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!valid) return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });

    let payload: any;
    try { payload = JSON.parse(rawBody); } catch { return NextResponse.json({ message: 'Invalid payload' }, { status: 400 }); }
    if (payload.event === 'charge.success') {
      const tx = payload.data;
      const userId = tx?.metadata?.userId;
      const donorName = await resolveDonorName(tx, userId);
      if (userId && db) {
        try {
          await db.collection('donations').doc(tx.reference).set({
            userId,
            amount: tx.amount,
            currency: tx.currency || 'NGN',
            purpose: tx.metadata?.purpose || 'N/A',
            reference: tx.reference,
            status: 'success',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            donorName,
            donorEmail: tx.customer?.email || '',
          });
        } catch (e) {
          // Never make Paystack retry a successfully charged transaction because of a write error.
          console.error('CRITICAL: failed to record webhook donation:', e);
        }
      }
    }
    return NextResponse.json({ status: 'success' });
  }

  // Only the signed-in giver may verify their own transaction. Without this,
  // a caller could post any reference and have it recorded against any uid
  // supplied in the client-controlled Paystack metadata.
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }
  let uid: string;
  try {
    const decoded = await verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ message: 'Invalid authentication token' }, { status: 401 });
  }

  let body: { reference?: string };
  try { body = JSON.parse(rawBody); } catch { return NextResponse.json({ message: 'Invalid payload' }, { status: 400 }); }
  const { reference } = body;

  if (!reference || typeof reference !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(reference)) {
    return NextResponse.json({ message: 'Invalid transaction reference' }, { status: 400 });
  }

  // Critical check: The API cannot function without the Paystack secret key.
  if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('Server is missing PAYSTACK_SECRET_KEY environment variable.');
      return NextResponse.json({ message: 'Server configuration error: Missing payment key' }, { status: 500 });
  }

  try {
    // Step 1: Verify transaction with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data.data;

    // Step 2: Check if transaction was successful
    if (data.status === 'success') {
      const amountInKobo = data.amount;
      const amountInNaira = amountInKobo / 100;
      const donorEmail = data.customer.email;
      const currency = data.currency;
      const userId = data.metadata?.userId;

      // The reference must belong to the authenticated giver.
      if (!userId || userId !== uid) {
        return NextResponse.json({ message: 'This transaction does not belong to you' }, { status: 403 });
      }

      // Always use the member's full name in the receipt, never the raw email.
      const donorName = await resolveDonorName(data, userId);

      // Step 3: Save the successful transaction to Firestore if a user ID is present
      if (userId && db) {
        try {
          const donationData = {
            userId: userId,
            amount: amountInKobo,
            currency: currency,
            purpose: data.metadata.purpose || 'N/A',
            reference: data.reference,
            status: data.status,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            donorName: donorName,
            donorEmail: donorEmail,
          };
          // Use the Paystack reference as the document ID to prevent duplicates
          await db.collection('donations').doc(data.reference).set(donationData);
        } catch (firestoreError) {
          // This is a critical error for monitoring, but should not block the user flow
          console.error(`CRITICAL: Failed to save donation ${data.reference} to Firestore:`, firestoreError);
        }
      } else {
        console.warn(`Skipping Firestore write: userId not found in metadata for transaction ${data.reference}`);
      }

      // Step 4: Attempt to send receipt email, but do not fail the request if it errors.
      try {
        // Check for email credentials only when we need them.
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
            console.warn('Gmail credentials are not set in .env file. Skipping receipt email.');
        } else {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_APP_PASS,
                },
            });

            const mailOptions = {
                from: `"VOSEM INT'L Finance" <${process.env.GMAIL_USER}>`,
                to: donorEmail,
                subject: 'Thank You For Your Generous Giving',
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                    <h1 style="color: #7c28c5;">Thank You for Your Donation</h1>
                    <p>Dear ${donorName},</p>
                    <p>We are writing to confirm that we have received your generous donation of <strong>${currency} ${amountInNaira.toLocaleString()}</strong>.</p>
                    <p>Your transaction reference is: <strong>${data.reference}</strong></p>
                    <p>Your contribution is invaluable to us and will go a long way in supporting the ministry and spreading the gospel. We pray that God blesses you abundantly for your faithfulness.</p>
                    <br/>
                    <p>With gratitude,<br/>The VOSEM International Team</p>
                </div>
                `,
            };
            
            await transporter.sendMail(mailOptions);
        }
      } catch (emailError) {
          console.error("Failed to send receipt email:", emailError);
          // Do not block the success response if email fails.
          // The payment was successful, which is the most critical part.
      }
      
      // Step 5: Return success response to the frontend regardless of email outcome.
      return NextResponse.json({
        status: 'success',
        message: 'Payment verified and recorded successfully.',
        data,
      });

    } else {
      // Transaction was not successful on Paystack's end
      return NextResponse.json({ status: 'failed', message: `Transaction status from Paystack: ${data.status}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification API Error:', error);
    // This will catch errors from the axios call if the PAYSTACK_SECRET_KEY is invalid or network fails.
    return NextResponse.json({ message: 'Server error during verification' }, { status: 500 });
  }
}
