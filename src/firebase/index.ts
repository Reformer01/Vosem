'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (!getApps().length) {
    // With explicit NEXT_PUBLIC_* config, initialise directly: avoids the noisy
    // "Need to provide options" warning from the no-argument attempt.
    if (firebaseConfig.apiKey) return getSdks(initializeApp(firebaseConfig));

    // Firebase App Hosting injects options for no-argument initializeApp().
    try {
      return getSdks(initializeApp());
    } catch {
      throw new Error('Firebase API Key is missing. Set NEXT_PUBLIC_FIREBASE_API_KEY in the deployment environment.');
    }
  }

  // If already initialized, return the SDKs with the already initialized App
  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
