import Link from "next/link";
import { ArrowRight, BookOpen, Church, MapPin, Radio, Users } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import JsonLd from "@/components/site/json-ld";
import { pageMetadata, SITE_URL } from "@/lib/seo";
import RelatedLinks from "@/components/site/related-links";

export const metadata = pageMetadata({
  title: "Voice of Salvation Evangelical Ministries | VOSEM INT'L",
  description: "Voice of Salvation Evangelical Ministries (VOSEM INT'L) is a Lagos church led by Prophet J. Olu Ayeni. Learn our name, location, leadership and beliefs.",
  path: "/voice-of-salvation",
  absolute: true,
});

const faqs = [
  {
    question: "What is Voice of Salvation Evangelical Ministries?",
    answer: "Voice of Salvation Evangelical Ministries International, shortened to VOSEM INT'L, is a Christian church family based in Alapere, Lagos, Nigeria, committed to worship, prayer, teaching and community life.",
  },
  {
    question: "Who leads VOSEM International?",
    answer: "Prophet J. Olu Ayeni is the General Overseer and host of VOSEM's programmes. He also coordinates God's General International Ministers' Fellowship.",
  },
  {
    question: "Where is the VOSEM International Headquarters?",
    answer: "The VOSEM International Headquarters Auditorium is at 12/14 Ademola Adefuye Street, off Davies Street, Alapere, Agboyi/Ketu LGA, Lagos State, Nigeria.",
  },
  {
    question: "What happens at a VOSEM service?",
    answer: "Services include worship, practical teaching from the Bible, prayer and time together as a church family. Midweek gatherings and outreach programmes run alongside Sunday services.",
  },
];

const leaderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}/voice-of-salvation#leader`,
  name: "Prophet J. Olu Ayeni",
  jobTitle: "General Overseer",
  worksFor: { "@id": `${SITE_URL}/#organization` },
  description: "General Overseer and host of Voice of Salvation Evangelical Ministries programmes, and coordinator of God's General International Ministers' Fellowship.",
  url: `${SITE_URL}/voice-of-salvation`,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/voice-of-salvation#faq`,
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

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
        path="/voice-of-salvation"
        cta={{ label: "Plan your visit", href: "/contact" }}
      />

      <section className="bg-[#e5e0da] py-12">
        <div className="site-wrap site-curved bg-card px-6 py-10 sm:px-12">
          <h2 className="font-display text-3xl italic sm:text-4xl">What is VOSEM?</h2>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
            Voice of Salvation Evangelical Ministries International — VOSEM INT'L — is a Christian church family in Alapere, Lagos, Nigeria, led by General Overseer Prophet J. Olu Ayeni. The church exists to help people encounter God through worship, Bible teaching, prayer and community.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: 24 November 2026. Source: <a className="text-primary underline underline-offset-4" href="https://independent.ng/voice-of-salvation-evangelical-ministries-holds-special-programme/" target="_blank" rel="noreferrer">Independent Nigeria, 17 April 2022</a>.
          </p>
        </div>
      </section>

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

      <section id="faq" className="bg-[#e5e0da] py-20 sm:py-28">
        <div className="site-wrap">
          <JsonLd data={[faqSchema, leaderSchema]} />
          <h2 className="mb-10 text-center font-display text-4xl italic sm:text-5xl">Questions people ask</h2>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            {faqs.map(({ question, answer }) => (
              <div key={question} className="site-curved border border-border bg-card p-7">
                <h3 className="mb-3 text-lg font-bold">{question}</h3>
                <p className="text-muted-foreground">{answer}</p>
              </div>
            ))}
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
      <RelatedLinks path="/voice-of-salvation" />
    </SiteShell>
  );
}
