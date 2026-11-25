'use client';

import { useEffect, useRef } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Listens for Firestore permission errors and reports them as a friendly toast.
 * Never throws — a denied read must not crash the whole member portal.
 */
export function FirebaseErrorListener() {
  const { toast } = useToast();
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      const key = `${error.request.path}:${error.request.method}`;
      if (seen.current.has(key)) return; // avoid toast spam from repeated listeners
      seen.current.add(key);
      toast({
        variant: 'destructive',
        title: 'Some information could not be loaded',
        description: 'Your account does not have access to this data yet. If you think this is a mistake, please contact the church office.',
      });
    };

    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, [toast]);

  return null;
}
