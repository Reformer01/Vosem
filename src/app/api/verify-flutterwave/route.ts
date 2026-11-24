import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try { admin.initializeApp(); } catch (error) { console.error("Firebase admin init error", error); }
}
const db = admin.firestore();

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  let uid: string;
  try {
    uid = (await admin.auth().verifyIdToken(authHeader.slice(7))).uid;
  } catch {
    return NextResponse.json({ message: "Invalid authentication token" }, { status: 401 });
  }

  const { reference } = await req.json();
  if (!reference || typeof reference !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(reference)) {
    return NextResponse.json({ message: "Invalid transaction reference" }, { status: 400 });
  }
  if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    return NextResponse.json({ message: "Flutterwave is not configured" }, { status: 500 });
  }

  try {
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/verify/by-reference/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` } }
    );
    const data = response.data?.data;
    if (response.data?.status !== "success" || data?.status !== "successful") {
      return NextResponse.json({ status: "failed", message: "Transaction was not successful" }, { status: 400 });
    }

    const metaUserId = data.meta?.userId;
    if (!metaUserId || metaUserId !== uid) {
      return NextResponse.json({ message: "This transaction does not belong to you" }, { status: 403 });
    }

    const amountInKobo = Math.round(Number(data.amount) * 100);
    await db.collection("donations").doc(data.tx_ref).set({
      userId: uid,
      amount: amountInKobo,
      currency: data.currency || "NGN",
      purpose: data.meta?.purpose || "N/A",
      reference: data.tx_ref,
      status: "succeeded",
      gateway: "flutterwave",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      donorName: data.meta?.name || "Valued Giver",
      donorEmail: data.customer?.email || "",
    });

    return NextResponse.json({
      status: "success",
      data: { currency: data.currency || "NGN", reference: data.tx_ref, amount: amountInKobo },
    });
  } catch (error) {
    console.error("Flutterwave verification error", error);
    return NextResponse.json({ message: "Server error during verification" }, { status: 500 });
  }
}
