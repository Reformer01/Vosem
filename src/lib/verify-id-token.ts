/**
 * Verify a Firebase ID token without the Admin SDK. Uses the public Firebase
 * Auth lookup endpoint, so it works on Vercel without service-account creds.
 */
export async function verifyIdToken(token: string): Promise<{ uid: string; email?: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw new Error("Firebase API key is not configured");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
    }
  );

  if (!response.ok) throw new Error("Invalid authentication token");
  const data = await response.json();
  const user = data.users?.[0];
  if (!user?.localId) throw new Error("Unknown user");
  return { uid: user.localId, email: user.email };
}
