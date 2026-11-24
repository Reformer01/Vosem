import type { Metadata } from "next";
import { keywordsFor } from "./seo-keywords";

export const SITE_URL = "https://vosem.vercel.app";
export const SITE_NAME = "VOSEM INT'L";
export const FULL_NAME = "Voice of Salvation Evangelical Ministries International";
export const OG_IMAGE = "/images/og-image.jpg";

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: FULL_NAME,
  alternateName: [SITE_NAME, "Voice of Salvation Evangelical Ministries"],
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description:
    "VOSEM INT'L is a Lagos-based church family where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "12/14 Ademola Adefuye Street, off Davies Street, Alapere",
    addressLocality: "Agboyi/Ketu, Lagos State",
    addressCountry: "NG",
  },
  sameAs: ["https://www.youtube.com/@JOluAyeni1"],
};

export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
}: {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
}): Metadata {
  return {
    title: absolute ? { absolute: title } : title,
    description,
    keywords: keywordsFor(path),
    // Single-language site: self-referencing en + x-default, aligned with canonical.
    alternates: {
      canonical: path,
      languages: { en: path, "x-default": path },
    },
    openGraph: {
      type: "website",
      title: absolute ? title : `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}${path}`,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "VOSEM church family" }],
    },
    twitter: {
      card: "summary_large_image",
      title: absolute ? title : `${title} | ${SITE_NAME}`,
      description,
      images: [OG_IMAGE],
    },
  };
}

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-NG",
};
