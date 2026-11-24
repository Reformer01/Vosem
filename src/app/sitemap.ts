import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// lastmod reflects the actual content update date, not the build time.
const pages = [
  { path: "/", last: "2026-11-24", freq: "daily" as const, priority: 1.0, image: "/images/hero-worship.jpg" },
  { path: "/about", last: "2026-11-24", freq: "monthly" as const, priority: 0.9, image: "/images/about-family.jpg" },
  { path: "/voice-of-salvation", last: "2026-11-24", freq: "monthly" as const, priority: 0.9, image: "/images/banner-celebration.jpg" },
  { path: "/events", last: "2026-11-24", freq: "weekly" as const, priority: 0.8, image: "/images/events-youth.jpg" },
  { path: "/sermons", last: "2026-11-24", freq: "weekly" as const, priority: 0.8, image: "/images/sermon-pastor.jpg" },
  { path: "/prayer", last: "2026-11-24", freq: "monthly" as const, priority: 0.7, image: "/images/next-steps-prayer.jpg" },
  { path: "/giving", last: "2026-11-24", freq: "monthly" as const, priority: 0.8, image: "/images/church-building.jpg" },
  { path: "/contact", last: "2026-11-24", freq: "monthly" as const, priority: 0.7, image: "/images/congregation-worship.jpg" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, last, freq, priority, image }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(`${last}T00:00:00Z`),
    changeFrequency: freq,
    priority,
    images: [`${SITE_URL}${image}`],
  }));
}
