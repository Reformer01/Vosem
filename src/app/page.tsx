import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram, Youtube } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import ContentSplit from "@/components/site/content-split";
import EventsSection from "@/components/site/events-section";
import TestimoniesSection from "@/components/site/testimonies-section";
import GivingSection from "@/components/site/giving-section";
import RelatedLinks from "@/components/site/related-links";

const cards = [
  { title: "Connect Groups", href: "/about#connect", image: "/images/groups-fellowship.jpg" },
  { title: "Kids & Youth", href: "/about#kids", image: "/images/events-youth.jpg" },
  { title: "Dream Team", href: "/contact", image: "/images/community-outreach.jpg" },
];

export default function Home() {
  return (
    <SiteShell>
      {/* Hero heading block */}
      <section id="home" className="relative flex min-h-[85vh] items-end overflow-hidden bg-[#282b37] pb-20 pt-36 text-white sm:min-h-[88vh] sm:pb-28">
        <Image src="/images/hero-worship.jpg" alt="Worshippers gathered in praise" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#282b37] via-[#282b37]/70 to-[#282b37]/25" />
        <div className="site-wrap relative z-10">
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-5 py-2 text-xs font-black uppercase tracking-[0.25em] backdrop-blur">
            Experience God&apos;s Presence
          </span>
          <h1 className="mt-7 max-w-5xl font-display text-6xl italic leading-[1.02] sm:text-8xl">
            Gather together<br />with us
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-2xl">
            Welcome to Voice of Salvation Evangelical Ministries (VOSEM INT&apos;L) — where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat in Lagos and beyond.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/contact" className="site-btn site-btn-solid">Come and visit us <ArrowRight className="size-4" /></Link>
            <Link href="/giving" className="site-btn site-btn-light">Give</Link>
          </div>
        </div>
      </section>

      {/* Full-size media banner */}
      <section className="bg-background py-8 sm:py-12">
        <div className="site-wrap">
          <div className="site-curved relative aspect-[16/9] overflow-hidden sm:aspect-[21/9]">
            <Image src="/images/banner-celebration.jpg" alt="VOSEM family celebrating in worship" fill className="object-cover" sizes="100vw" />
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-card py-8">
        <div className="site-wrap text-center">
          <p className="mb-5 text-lg font-bold sm:text-xl">Join us this Sunday at 9:00 AM &amp; 11:00 AM — in person and online.</p>
          <Link href="/events" className="site-btn site-btn-outline">See all upcoming events <ArrowRight className="size-4" /></Link>
        </div>
      </section>

      <ContentSplit
        eyebrow="Welcome to VOSEM"
        title="This is VOSEM"
        body="At VOSEM INT'L, we believe every individual carries a divine mandate. Our mission is to nurture that potential in an atmosphere of radical love and excellence — a family where you can belong, grow and discover your purpose."
        image="/images/about-family.jpg"
        href="/about"
        cta="Find out more"
      />

      {/* Image cards */}
      <section className="bg-[#e5e0da] py-20 sm:py-28">
        <div className="site-wrap">
          <h2 className="mb-12 text-center font-display text-4xl italic sm:text-6xl">Find your people</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <Link key={card.title} href={card.href} className="site-curved group relative flex h-72 items-end overflow-hidden p-7 text-white sm:h-80">
                <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="relative z-10 flex w-full items-end justify-between gap-4">
                  <h3 className="text-2xl font-bold">{card.title}</h3>
                  <span className="site-btn site-btn-light !px-5 !py-2">View <ArrowRight className="size-4" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContentSplit
        eyebrow="Growth Track"
        title="Take your Next Step"
        body="Choosing to follow Jesus is the best decision you can ever make. Take a look at our Next Steps — from Foundations to water baptism — and discover where you belong in the family."
        image="/images/next-steps-prayer.jpg"
        href="/about#vision"
        cta="Find out more"
        tint="white"
      />

      <ContentSplit
        eyebrow="Community"
        title="Groups"
        body="Our groups help us to be a connected, growing and healthy community. Here we care for each other, grow in our faith and reach out to serve together."
        image="/images/groups-fellowship.jpg"
        href="/contact"
        cta="Find your people"
        flip
        tint="cream"
      />

      {/* Teaching */}
      <section id="sermons" className="bg-[#403f38] py-20 text-white sm:py-28">
        <div className="site-wrap site-curved grid items-center gap-10 bg-[#2f2e29] p-6 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div className="relative h-72 overflow-hidden rounded-[2rem] sm:h-[420px] lg:order-2">
            <Image src="/images/sermon-pastor.jpg" alt="A pastor teaching from the Bible" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
          <div className="lg:order-1">
            <span className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-[#f3a6c6]">Teaching Series</span>
            <h2 className="font-display text-4xl italic sm:text-6xl">Walking in Power</h2>
            <p className="mt-6 text-lg leading-relaxed text-white/75">
              Join the current journey at VOSEM INT&apos;L as we explore the dimensions of the Spirit. Our latest message, <em>Manifesting the Kingdom: Part 4</em>, was recorded live in October 2026.
            </p>
            <Link href="/events" className="site-btn site-btn-light mt-9">Find out more <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>

      <EventsSection />
      <TestimoniesSection />
      <GivingSection />

      {/* Stay connected */}
      <section className="bg-[#e5e0da] py-16 sm:py-20">
        <div className="site-wrap site-curved flex flex-col items-center justify-between gap-8 bg-card px-6 py-12 text-center sm:px-12 md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-3xl italic sm:text-4xl">Give us a follow</h2>
            <p className="mt-3 max-w-xl text-muted-foreground">Stay close to what God is doing in the life of VOSEM every week.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram" className="site-btn site-btn-solid"><Instagram className="size-4" /> Instagram</Link>
            <Link href="https://www.youtube.com" target="_blank" aria-label="YouTube" className="site-btn site-btn-outline"><Youtube className="size-4" /> YouTube</Link>
            <Link href="/signup" className="site-btn site-btn-outline">Join Us</Link>
          </div>
        </div>
      </section>
      <RelatedLinks path="/" />
    </SiteShell>
  );
}
