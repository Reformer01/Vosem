import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import PrayerWall from "@/components/prayer/prayer-wall";
import RelatedLinks from "@/components/site/related-links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "VOSEM Prayer Wall and Requests",
  description: "Share a prayer request with VOSEM and pray with the church family. Bring your needs before God with the church family.",
  path: "/prayer",
});

export default function PrayerPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Prayer"
        title="Prayer wall"
        description="We believe God answers prayer. Share a need with the church family, or stand in faith with those who have asked for prayer."
        image="/images/next-steps-prayer.jpg"
        path="/prayer"
      />
      <PrayerWall />
      <RelatedLinks path="/prayer" />
    </SiteShell>
  );
}
