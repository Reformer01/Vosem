import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Script from 'next/script';
import { FirebaseClientProvider } from '@/firebase';
import { plusJakartaSans, playfairDisplay } from './fonts';
import JsonLd from '@/components/site/json-ld';
import { FULL_NAME, OG_IMAGE, SITE_NAME, SITE_URL, organizationSchema, websiteSchema } from '@/lib/seo';

const title = "Voice of Salvation Evangelical Ministries | VOSEM";
const description = "VOSEM INT'L — Voice of Salvation Evangelical Ministries in Lagos, Nigeria. Join our church family for worship, teaching, prayer and community.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: `%s | ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  authors: [{ name: FULL_NAME }],
  keywords: ["Voice of Salvation Evangelical Ministries", "VOSEM", "church in Lagos", "Alapere church", "Christian ministry Lagos", "J Olu Ayeni"],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NG",
    url: SITE_URL,
    title,
    description,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "VOSEM worshippers gathered in praise" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [OG_IMAGE],
  },
  category: "Religion",
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
        className="font-sans bg-background text-white selection:bg-accent selection:text-white"
        suppressHydrationWarning
      >
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
