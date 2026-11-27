'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { signOutUser } from './session';

/** Signs out members whose profile was removed by an admin. Fails open on network errors. */
export function useMembershipGuard(enabled: boolean) {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!enabled || !user || !auth || !firestore) return;
    let active = true;
    (async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) return;
        const response = await fetch('/api/membership', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (!response.ok) return;
        const result = await response.json();
        if (active && result.active === false) {
          await signOutUser(auth, firestore);
          router.push('/login?reason=account-removed');
        }
      } catch {
        // Verification is best-effort; never lock out a member on a network error.
      }
    })();
    return () => { active = false; };
  }, [enabled, user, auth, firestore, router]);
}
