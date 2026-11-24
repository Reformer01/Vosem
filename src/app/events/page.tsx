import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import EventsSection from "@/components/site/events-section";
import { pageMetadata } from "@/lib/seo";
import RelatedLinks from "@/components/site/related-links";

export const metadata = pageMetadata({
  title: "Events & Service Times in Alapere, Lagos",
  description: "See upcoming VOSEM events in Alapere, Lagos: Sunday services, Word & Wonders, Youth Impact Rally and Love In Action community outreach. Plan your visit.",
  path: "/events",
});

const services = [
  { title: "Sunday Service", time: "9:00 AM & 11:00 AM", place: "Main Sanctuary & Online" },
  { title: "Word & Wonders", time: "Every Wednesday, 6:00 PM", place: "Main Sanctuary & Online" },
  { title: "Youth Impact Rally", time: "Fridays, 7:00 PM", place: "Youth Hall" },
];

export default function EventsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Events"
        title="Come and be part of it"
        description="From Sunday gatherings to impactful outreaches, there is always something happening in the life of VOSEM."
        image="/images/events-youth.jpg"
        path="/events"
      />

      <div className="bg-card py-16 sm:py-20">
        <div className="site-wrap grid gap-6 md:grid-cols-3">
          {services.map((service) => (
            <div key={service.title} className="site-curved border border-border p-7">
              <CalendarDays className="mb-5 size-7 text-primary" />
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Clock className="size-4" /> {service.time}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" /> {service.place}</p>
            </div>
          ))}
        </div>
      </div>

      <EventsSection withHeading={false} />

      <section className="bg-card py-16 text-center sm:py-20">
        <div className="site-wrap">
          <h2 className="font-display text-3xl italic sm:text-5xl">We&apos;d love to see you</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Plan your visit and we&apos;ll help you find your place in the family.</p>
          <Link href="/contact" className="site-btn site-btn-solid mt-8">Plan your visit <ArrowRight className="size-4" /></Link>
        </div>
      </section>
      <RelatedLinks path="/events" />
    </SiteShell>
  );
}
