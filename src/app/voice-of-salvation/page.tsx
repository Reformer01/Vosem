import Link from "next/link";
import { ArrowRight, Building2, Tv } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";

const pillars = [
  {
    title: "World Impact",
    text: "The Church of God of Prophecy Television Ministry is the Voice of Salvation. It is an excellent outreach and ministry with Pastor Billy Wilson. Lives are being transformed on a daily basis by the power of God's word.",
    icon: Tv,
    href: "https://www.worldimpact.tv",
    external: true,
  },
  {
    title: "Harvest Partners Ministry",
    text: "An outgoing ministry that works through this organization to support churches and pastors in Cameroon, Africa — building gospel partnerships that expand churches and reach new regions.",
    icon: Building2,
  },
];

export default function VoiceOfSalvationPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Missions"
        title="Voice of Salvation"
        description="The Church of God of Prophecy Television Ministry is the Voice of Salvation. It is an excellent outreach and ministry with Pastor Billy Wilson — lives are being transformed on a daily basis by the power of God's word."
        image="/images/about-family.jpg"
        cta={{ label: "Learn more", href: "#overview" }}
      />

      <section id="overview" className="bg-card py-20 sm:py-28">
        <div className="site-wrap">
          <h2 className="site-eyebrow">Outreach &amp; Teaching</h2>
          <div className="grid gap-8 lg:grid-cols-2">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="site-curved flex flex-col border border-border bg-[#e5e0da] p-8 sm:p-10">
                  <div className="mb-4 flex size-12 items-center justify-center text-primary"><Icon className="size-6" /></div>
                  <h3 className="mb-4 text-xl font-bold">{p.title}</h3>
                  <p className="mb-8 flex-grow text-muted-foreground">{p.text}</p>
                  {p.href && (
                    <Link href={p.href} target="_blank" rel="noreferrer" className="site-btn site-btn-solid w-fit">
                      Learn more <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#e5e0da] py-20 sm:py-28">
        <div className="site-wrap site-curved bg-card px-6 py-12 sm:px-14 sm:py-16">
          <h2 className="mb-12 text-center font-display text-4xl italic sm:text-5xl">Programs &amp; Ministries</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-[#282b37] p-8 text-white sm:p-10">
              <h3 className="mb-4 text-xl font-bold">World Impact</h3>
              <p className="mb-6 leading-relaxed text-white/75">
                An international television ministry of the Church of God of Prophecy, teaching from Scripture. Two standout series — <em>5 Minutes to Victory</em> and a global outreach series — are distributed free, alongside their online hub.
              </p>
              <Link href="https://www.worldimpact.tv" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all">
                worldimpact.tv <ArrowRight className="size-5" />
              </Link>
            </div>
            <div className="rounded-[2rem] bg-[#282b37] p-8 text-white sm:p-10">
              <h3 className="mb-4 text-xl font-bold">Harvest Partners</h3>
              <p className="mb-6 leading-relaxed text-white/75">
                An outgoing mission organization focused on supporting churches and pastors across Africa. Works closely with the Church of God of Prophecy, helping church plants grow and churches receive gospel partners.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 text-primary">
                Get in touch <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
