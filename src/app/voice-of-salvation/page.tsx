import Link from "next/link";
import { ArrowRight, BookOpen, Church, MapPin, Radio, Users } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";

const identity = [
  {
    icon: Church,
    title: "Our name",
    text: "Voice of Salvation Evangelical Ministries International — VOSEM INT'L. A church family in Lagos, Nigeria, built around the gospel of Jesus Christ and the power of His word.",
  },
  {
    icon: Users,
    title: "Our leader",
    text: "Prophet J. Olu Ayeni is the host and General Overseer. He also coordinates God's General International Ministers' Fellowship, a platform for raising ministers.",
  },
  {
    icon: Radio,
    title: "Our online ministry",
    text: "VOSEM's online ministry teaches the word, leads prayer and shares testimonies of answered prayer — the message is simple: we pray, and we get answers.",
  },
];

export default function VoiceOfSalvationPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Our Identity"
        title="Voice of Salvation Evangelical Ministries"
        description="VOSEM INT'L is a Lagos-based church family where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat."
        image="/images/about-family.jpg"
        cta={{ label: "Plan your visit", href: "/contact" }}
      />

      <section id="overview" className="bg-card py-20 sm:py-28">
        <div className="site-wrap">
          <h2 className="site-eyebrow">Who we are</h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {identity.map(({ icon: Icon, title, text }) => (
              <div key={title} className="site-curved flex flex-col border border-border bg-[#e5e0da] p-8 sm:p-10">
                <div className="mb-4 flex size-12 items-center justify-center text-primary"><Icon className="size-6" /></div>
                <h3 className="mb-4 text-xl font-bold">{title}</h3>
                <p className="flex-grow text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#e5e0da] py-20 sm:py-28">
        <div className="site-wrap site-curved bg-card px-6 py-12 sm:px-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-4xl italic sm:text-5xl">A heritage of revival</h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Our special promotion and revival programmes have drawn worshippers from across Lagos to the VOSEM International Headquarters Auditorium. The 2022 programme themed <em>Mercy</em> ran through April and featured guest clerics ministering alongside our own pastors — a picture of the church&apos;s heart for prayer, healing and the word.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                That same spirit shapes every service today: worship, practical teaching and a community where you can belong and grow.
              </p>
              <Link href="/events" className="site-btn site-btn-solid mt-9">See what&apos;s happening <ArrowRight className="size-4" /></Link>
            </div>
            <div className="site-curved bg-[#282b37] p-8 text-white sm:p-10">
              <div className="mb-5 flex size-12 items-center justify-center text-[#f3a6c6]"><BookOpen className="size-6" /></div>
              <h3 className="mb-4 text-xl font-bold">Find us</h3>
              <p className="flex items-start gap-3 leading-relaxed text-white/80">
                <MapPin className="mt-1 size-5 shrink-0" />
                <span>VOSEM International Headquarters Auditorium,<br />12/14 Ademola Adefuye Street, off Davies Street,<br />Alapere, Agboyi/Ketu LGA, Lagos State, Nigeria.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-card py-16 text-center sm:py-20">
        <div className="site-wrap">
          <h2 className="font-display text-3xl italic sm:text-5xl">Follow the ministry</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Teaching, prayer and testimonies from Prophet J. Olu Ayeni and the VOSEM family.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="https://www.youtube.com/@JOluAyeni1" target="_blank" rel="noreferrer" className="site-btn site-btn-solid">Watch on YouTube <ArrowRight className="size-4" /></Link>
            <Link href="/contact" className="site-btn site-btn-outline">Get in touch</Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
