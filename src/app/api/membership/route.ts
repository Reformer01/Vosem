import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken } from "@/lib/verify-id-token";

/**
 * Checks that the signed-in member still has a profile after the ID token has
 * been verified. Uses the member's own token so Firestore rules see the owner.
 */
export async function GET(request: NextRequest) {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = header.slice(7);
  let uid: string;
  try {
    ({ uid } = await verifyIdToken(token));
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project) return NextResponse.json({ active: true });

  try {
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${encodeURIComponent(uid)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
    );
    // A read failure must never lock a member out.
    if (!response.ok) return NextResponse.json({ active: true });
    const document = await response.json();
    return NextResponse.json({ active: !!document.name });
  } catch {
    return NextResponse.json({ active: true });
  }
}
