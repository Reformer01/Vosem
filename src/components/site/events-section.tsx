import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const siteEvents = [
  {
    title: "Youth Impact Rally",
    tag: "Upcoming Event",
    details: "Friday, 7:00 PM",
    location: "Main Sanctuary",
    image: "/images/events-youth.jpg",
  },
  {
    title: "Word & Wonders",
    tag: "Weekly Service",
    details: "Every Wednesday, 6:00 PM",
    location: "Main Sanctuary & Online",
    image: "/images/events-worship.jpg",
  },
  {
    title: "Love In Action",
    tag: "Community",
    details: "Medical Outreach 2026",
    location: "Alapere, Ketu",
    image: "/images/community-outreach.jpg",
  },
];

export default function EventsSection({ withHeading = true }: { withHeading?: boolean }) {
  return (
    <section className="bg-[#e5e0da] py-20 sm:py-28" id="events">
      <div className="site-wrap">
        {withHeading && (
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="site-eyebrow">Our Calendar</span>
              <h2 className="font-display text-4xl italic sm:text-6xl">At VOSEM This Month</h2>
            </div>
            <Link href="/events" className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
              All events <ArrowRight className="size-5" />
            </Link>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {siteEvents.map((event) => (
            <Link key={event.title} href="/events" className="site-curved group overflow-hidden border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={event.image} alt={event.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-7">
                <span className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary">{event.tag}</span>
                <h3 className="mt-4 text-2xl font-bold">{event.title}</h3>
                <p className="mt-2 text-sm font-semibold text-muted-foreground">{event.details}</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.location}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Read more <ArrowRight className="size-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
