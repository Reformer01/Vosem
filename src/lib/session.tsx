'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, type Auth, type User } from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, Timestamp, type Firestore } from 'firebase/firestore';
import { useAuth, useFirestore } from '@/firebase';

export const SESSION_COOKIE = 'vosem_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function readSessionId(): string | null {
  if (typeof document === 'undefined') return null;
  const entry = document.cookie.split('; ').find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return entry ? entry.slice(SESSION_COOKIE.length + 1) : null;
}

// Firebase Auth handles credentials; this record gives the session a revocable,
// expiring server-side identity. The cookie is not HttpOnly because it is set here.
export function hasSession(): boolean {
  return !!readSessionId();
}

export async function startSession(firestore: Firestore, user: User) {
  const previous = readSessionId();
  if (previous) await deleteDoc(doc(firestore, 'sessions', previous)).catch(() => {});
  const id = crypto.randomUUID();
  await setDoc(doc(firestore, 'sessions', id), {
    userId: user.uid,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromMillis(Date.now() + SESSION_DURATION_MS),
  });
  document.cookie = `${SESSION_COOKIE}=${id}; Max-Age=${SESSION_DURATION_MS / 1000}; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

export async function endSession(firestore: Firestore) {
  const id = readSessionId();
  if (id) await deleteDoc(doc(firestore, 'sessions', id)).catch(() => {});
  document.cookie = `${SESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export async function signOutUser(auth: Auth, firestore: Firestore) {
  await endSession(firestore);
  await signOut(auth);
}

type SessionStatus = 'checking' | 'valid' | 'invalid';

export function useSessionGuard(enabled: boolean): SessionStatus {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>('checking');

  useEffect(() => {
    if (!enabled) {
      setStatus('checking');
      return;
    }
    let active = true;
    setStatus('checking');
    (async () => {
      const id = readSessionId();
      if (!id || !firestore) {
        if (active) setStatus('invalid');
        return;
      }
      try {
        const snapshot = await getDoc(doc(firestore, 'sessions', id));
        const expiresAt = snapshot.data()?.expiresAt;
        const valid = snapshot.exists() && expiresAt instanceof Timestamp && expiresAt.toMillis() > Date.now();
        if (active) setStatus(valid ? 'valid' : 'invalid');
      } catch {
        if (active) setStatus('invalid');
      }
    })();
    return () => { active = false; };
  }, [enabled, firestore]);

  useEffect(() => {
    if (enabled && status === 'invalid') {
      void signOutUser(auth, firestore).catch(() => {}).finally(() => router.push('/login'));
    }
  }, [enabled, status, auth, firestore, router]);

  return status;
}
