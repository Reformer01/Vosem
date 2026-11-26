import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe, HeartHandshake, School, Users } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import ContentSplit from "@/components/site/content-split";
import { pageMetadata } from "@/lib/seo";
import RelatedLinks from "@/components/site/related-links";
import ScriptureQuote from "@/components/site/scripture-quote";

export const metadata = pageMetadata({
  title: "About Voice of Salvation Ministries",
  description: "Meet Voice of Salvation Evangelical Ministries (VOSEM INT'L): our vision, leadership, connect groups and life in Lagos. Plan your visit today.",
  path: "/about",
});

const values = [
  { icon: Users, title: "Connect Groups", text: "Find your tribe in Lagos and grow together in faith." },
  { icon: School, title: "Discipleship", text: "Grow in the Word through Foundations and Growth Track." },
  { icon: HeartHandshake, title: "Love in Action", text: "Serve our community with practical love and compassion." },
  { icon: Globe, title: "Kingdom Reach", text: "A global family impacting nations and cultures with the gospel." },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About Us"
        title="More than a church, a royal family"
        description="Every individual carries a divine mandate. At VOSEM INT'L we nurture that potential in an atmosphere of radical love and excellence."
        image="/images/banner-celebration.jpg"
        path="/about"
        cta={{ label: "Plan your visit", href: "/contact" }}
      />

      <ContentSplit
        eyebrow="Belong to VOSEM"
        title="This is VOSEM"
        body="Voice of Salvation Evangelical Ministries International (VOSEM INT'L) is a community of believers passionate about God's presence and people's purpose. Led by General Overseer Prophet J. Olu Ayeni, we are a family where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat in Lagos and beyond."
        image="/images/about-family.jpg"
        href="/contact"
        cta="Come and visit us"
      />

      <section id="vision" className="bg-[#403f38] py-20 text-white sm:py-28">
        <div className="site-wrap site-curved bg-[#2f2e29] px-6 py-12 sm:px-14 sm:py-16">
          <span className="mb-3 block text-xs font-black uppercase tracking-[0.25em] text-[#f3a6c6]">Our Vision</span>
          <h2 className="max-w-4xl font-display text-4xl italic leading-tight sm:text-5xl">
            Raising a kingdom-conscious generation that impacts nations and cultures through the power of the gospel.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/75">
            We exist to lift up the name of Jesus, to see lives changed by His love, and to equip every member to walk in the purpose God has for them.
          </p>
        </div>
      </section>

      <section id="connect" className="bg-card py-20 sm:py-28">
        <div className="site-wrap">
          <ScriptureQuote
            text="Let us consider how we may spur one another on toward love and good deeds, not giving up meeting together."
            reference="Hebrews 10:24-25"
          />
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="site-eyebrow">Life at VOSEM</span>
            <h2 className="font-display text-4xl italic sm:text-6xl">There&apos;s a place for you</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="site-curved border border-border p-8 shadow-sm">
                <div className="mb-6 flex size-14 items-center justify-center text-primary"><Icon className="size-6" /></div>
                <h3 className="mb-3 text-xl font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="kids" className="bg-[#e5e0da] py-20 sm:py-28">
        <div className="site-wrap site-curved grid items-center gap-10 bg-card p-6 sm:p-12 lg:grid-cols-2 lg:p-16">
          <div className="lg:order-2">
            <span className="site-eyebrow">Next Generation</span>
            <h2 className="font-display text-4xl italic leading-tight sm:text-5xl">Kids, Youth &amp; Young Adults</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              We believe the next generation is not the church of tomorrow. They are the church today. Expect vibrant, safe and life-changing environments for every age, where young people encounter God and discover their purpose.
            </p>
            <Link href="/contact" className="site-btn site-btn-outline mt-9">Plan your visit <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative h-80 overflow-hidden rounded-[2rem] sm:h-[420px] lg:order-1">
            <Image src="/images/groups-fellowship.jpg" alt="VOSEM young people" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </section>
      <RelatedLinks path="/about" />
    </SiteShell>
  );
}
