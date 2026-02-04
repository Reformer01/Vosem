
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';

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

const db = admin.firestore();

export async function POST(req: NextRequest) {
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json({ message: 'Transaction reference is required' }, { status: 400 });
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
      const donorName = data.metadata?.name || data.customer?.first_name || 'Valued Giver';
      const currency = data.currency;
      const userId = data.metadata?.userId;

      // Step 3: Save the successful transaction to Firestore if a user ID is present
      if (userId) {
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
