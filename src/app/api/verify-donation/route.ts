import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  const { reference } = await req.json();

  if (!reference) {
    return NextResponse.json({ message: 'Transaction reference is required' }, { status: 400 });
  }

  // Ensure secret keys are available
  if (!process.env.PAYSTACK_SECRET_KEY || !process.env.GMAIL_USER || !process.env.GMAIL_APP_PASS) {
      console.error('Server is missing required environment variables for payment verification or email.');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
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
      const amountPaid = data.amount / 100; // Paystack returns amount in Kobo
      const donorEmail = data.customer.email;
      const donorName = data.customer.first_name || data.metadata.name;
      const currency = data.currency;

      // Step 3: Send receipt email
      try {
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
                <p>Dear ${donorName || 'Beloved'},</p>
                <p>We are writing to confirm that we have received your generous donation of <strong>${currency} ${amountPaid.toLocaleString()}</strong>.</p>
                <p>Your transaction reference is: <strong>${data.reference}</strong></p>
                <p>Your contribution is invaluable to us and will go a long way in supporting the ministry and spreading the gospel. We pray that God blesses you abundantly for your faithfulness.</p>
                <br/>
                <p>With gratitude,<br/>The VOSEM International Team</p>
            </div>
            `,
        };
        
        await transporter.sendMail(mailOptions);

      } catch (emailError) {
          console.error("Failed to send receipt email:", emailError);
          // Do not block the success response if email fails.
          // The payment was successful, which is the most critical part.
      }
      
      // Step 4: Return success response to the frontend
      return NextResponse.json({
        status: 'success',
        message: 'Payment verified and receipt sent!',
        data,
      });

    } else {
      // Transaction was not successful on Paystack's end
      return NextResponse.json({ status: 'failed', message: 'Transaction not successful' }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification API Error:', error);
    return NextResponse.json({ message: 'Server error during verification' }, { status: 500 });
  }
}
