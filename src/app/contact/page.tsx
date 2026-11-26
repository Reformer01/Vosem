import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import JsonLd from "@/components/site/json-ld";
import { FULL_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import RelatedLinks from "@/components/site/related-links";

const churchSchema = {
  "@context": "https://schema.org",
  "@type": "Church",
  "@id": `${SITE_URL}/contact#church`,
  name: FULL_NAME,
  alternateName: "VOSEM International Headquarters",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    streetAddress: "12/14 Ademola Adefuye Street, off Davies Street, Alapere",
    addressLocality: "Agboyi/Ketu, Lagos State",
    addressCountry: "NG",
  },
  sameAs: ["https://www.youtube.com/@JOluAyeni1"],
};

export const metadata = pageMetadata({
  title: "Contact VOSEM in Alapere, Lagos",
  description: "Find the VOSEM International Headquarters in Alapere, Lagos. Get our exact address, Sunday and midweek service times, and plan your visit this week.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Come and visit us"
        description="Find us in Alapere, Ketu, or join us online. We would love to meet you."
        image="/images/church-building.jpg"
        path="/contact"
      />

      <JsonLd data={churchSchema} />
      <section className="bg-card py-20 sm:py-28">
        <div className="site-wrap site-curved grid gap-10 bg-[#e5e0da] p-6 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div>
            <span className="site-eyebrow">Our Campus</span>
            <h2 className="font-display text-4xl italic sm:text-5xl">Plan your visit</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Come a little early, meet a friendly face, and make yourself at home. Our team will be glad to help you find your seat and get connected.
            </p>
            <div className="mt-10 space-y-6">
              <p className="flex items-start gap-4 text-lg font-semibold">
                <MapPin className="mt-1 size-6 shrink-0 text-primary" />
                <span>VOSEM International Headquarters Auditorium,<br />12/14 Ademola Adefuye Street, off Davies Street,<br />Alapere, Agboyi/Ketu LGA, Lagos State, Nigeria.</span>
              </p>
              <p className="flex items-start gap-4 text-lg font-semibold">
                <Clock className="mt-1 size-6 shrink-0 text-primary" />
                <span>Sundays at 9:00 AM &amp; 11:00 AM<br />Wednesdays at 6:00 PM</span>
              </p>
              <p className="flex items-start gap-4 text-lg font-semibold">
                <Mail className="mt-1 size-6 shrink-0 text-primary" />
                {/* shortcut: placeholder inbox, replace with the church's real address */}
                <a href="mailto:hello@vosem.org" className="hover:text-primary">hello@vosem.org</a>
              </p>
            </div>
            <Link href="/signup" className="site-btn site-btn-solid mt-10">Join the family <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-[2rem] sm:min-h-[420px]">
            <Image src="/images/congregation-worship.jpg" alt="VOSEM congregation gathering for worship" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </section>
      <RelatedLinks path="/contact" />
    </SiteShell>
  );
}
