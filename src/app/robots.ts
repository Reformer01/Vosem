import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Answer-engine crawlers: allowed so the church can be found in AI answers.
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      // Training crawlers: not needed for search visibility.
      { userAgent: ["GPTBot", "ClaudeBot"], disallow: "/" },
      // Never block /_next/. Google needs CSS and JS to render pages.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
