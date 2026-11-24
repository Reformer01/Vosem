import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { relatedLinksFor } from "@/lib/seo-keywords";

// Contextual hub-to-spoke links so every public page links back into the cluster.
export default function RelatedLinks({ path }: { path: string }) {
  const links = relatedLinksFor(path);
  if (!links.length) return null;

  return (
    <section className="bg-card py-14">
      <div className="site-wrap">
        <div className="site-curved flex flex-col gap-5 bg-[#e5e0da] p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Explore more of VOSEM</h2>
            <p className="mt-1 text-sm text-muted-foreground">Helpful next steps from the church family.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {links.map(({ href, label }) => (
              <Link key={href + label} href={href} className="site-btn site-btn-outline !px-5 !py-2.5 !text-xs">
                {label} <ArrowRight className="size-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
