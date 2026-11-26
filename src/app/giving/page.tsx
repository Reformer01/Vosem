import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import GivingSection from "@/components/site/giving-section";
import { pageMetadata } from "@/lib/seo";
import RelatedLinks from "@/components/site/related-links";

export const metadata = pageMetadata({
  title: "Giving & Stewardship at VOSEM",
  description: "Support the vision of Voice of Salvation Evangelical Ministries. Give securely online via Paystack to tithes, offerings or kingdom projects, with a receipt for every gift.",
  path: "/giving",
});

export default function GivingPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Giving"
        title="Supporting the vision"
        description="Every gift helps us reach more lives with the love of Christ in Lagos and beyond."
        image="/images/church-building.jpg"
        path="/giving"
      />

      <GivingSection />

      <section className="bg-card py-16 sm:py-20">
        <div className="site-wrap site-curved giving-assurance flex flex-col items-start justify-between gap-6 bg-[#e5e0da] p-8 sm:flex-row sm:items-center sm:p-12">
          <div className="flex items-start gap-5">
            <ShieldCheck className="mt-1 size-8 shrink-0 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Secure, simple giving</h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">Donations are processed securely through Paystack. You will receive a receipt for every gift once the payment is confirmed.</p>
            </div>
          </div>
          <Link href="/signup" className="site-btn site-btn-solid shrink-0">Join Us <ArrowRight className="size-4" /></Link>
        </div>
      </section>
      <RelatedLinks path="/giving" />
    </SiteShell>
  );
}
