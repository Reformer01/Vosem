import SiteShell from "@/components/site/site-shell";
import PageHero from "@/components/site/page-hero";
import SermonLibrary from "@/components/sermons/sermon-library";
import RelatedLinks from "@/components/site/related-links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "VOSEM Sermon Library and Teaching",
  description: "Browse VOSEM messages with AI-generated summaries, search by title or speaker, and watch the latest teaching from the church family.",
  path: "/sermons",
});

export default function SermonsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Teaching"
        title="Sermon library"
        description="Look back at the messages that are shaping our church family — and get the key points in a short AI-generated summary."
        image="/images/sermon-pastor.jpg"
        path="/sermons"
      />
      <SermonLibrary />
      <RelatedLinks path="/sermons" />
    </SiteShell>
  );
}
