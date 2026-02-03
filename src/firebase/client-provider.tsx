'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

interface FirebaseServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

const MissingConfigError = ({ error }: { error: Error }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#0a0a1a',
        color: 'white',
        fontFamily: 'sans-serif',
        padding: '2rem',
        textAlign: 'center',
        boxSizing: 'border-box'
    }}>
        <div style={{
            border: '1px solid hsl(271 83% 53%)',
            padding: '2rem 3rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(30, 20, 30, 0.4)',
            maxWidth: '800px',
            backdropFilter: 'blur(12px)'
        }}>
            <h1 style={{ color: 'hsl(271 83% 53%)', fontSize: '2rem', marginBottom: '1rem' }}>Firebase Configuration Error</h1>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem', color: '#ccc' }}>
                Your Firebase API keys are missing. To use the app, you need to provide your project's configuration.
            </p>
            
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderTop: '1px solid #331133', paddingTop: '1.5rem' }}>Action Required:</h2>
            <ol style={{ paddingLeft: '20px', margin: 0, textAlign: 'left', listStylePosition: 'inside' }}>
                <li style={{ marginBottom: '1rem' }}>
                    Open the <strong><code>.env</code></strong> file in your project's root directory.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    Fill in the values for your Firebase project. You can find these in your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'hsl(271 83% 53%)', textDecoration: 'underline' }}>Firebase Console</a> under Project Settings.
                </li>
                <li style={{ marginBottom: '1rem' }}>
                    <strong>Important:</strong> After saving the <code>.env</code> file, you must <strong>restart your development server</strong> for the changes to apply.
                </li>
            </ol>
            <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                backgroundColor: 'black',
                padding: '1rem',
                borderRadius: '4px',
                marginTop: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid #331133'
            }}>
{`NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
// Add other keys from your .env file here`}
            </pre>
            <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem', borderTop: '1px solid #331133', paddingTop: '1rem' }}>
                <strong>Error details:</strong> {error.message}
            </p>
        </div>
    </div>
);

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const firebaseServices = initializeFirebase();
      setServices(firebaseServices as FirebaseServices);
    } catch (e) {
      if (e instanceof Error) {
        setInitError(e);
      } else {
        setInitError(new Error('An unknown error occurred during Firebase initialization.'));
      }
    }
  }, []);

  if (initError) {
    return <MissingConfigError error={initError} />;
  }

  if (!services) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={services.firebaseApp}
      auth={services.auth}
      firestore={services.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
