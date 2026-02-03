import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { FirebaseClientProvider } from '@/firebase';
import { plusJakartaSans, playfairDisplay } from './fonts';

export const metadata: Metadata = {
  title: "VOSEM INT'L 2026 Official Site",
  description: "Where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable} ${playfairDisplay.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body 
        className="font-sans bg-background text-white overflow-x-hidden selection:bg-accent selection:text-white"
        suppressHydrationWarning
      >
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
