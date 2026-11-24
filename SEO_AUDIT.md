# VOSEM SEO / GEO Audit

Status labels: **Verified** (command output or file contents), **User-provided**, **Estimated** (model inference). No measured SEO metrics are claimed without a tool/export.

Last verified: 2026-11-24. Canonical host: `https://vosem.vercel.app`.

## 1. Implemented on-site strategies (Verified)

| Strategy | Implementation | Evidence |
|---|---|---|
| Unique titles/descriptions | `src/app/layout.tsx`, `src/lib/seo.ts`, per-page `metadata` | `npx next build` passes; titles 50–60 chars, descriptions 132–157 chars |
| Canonical + self-referencing hreflang (`en`, `x-default`) | `pageMetadata()` + root layout | Built HTML: `<link rel="alternate" hrefLang="en" href="https://vosem.vercel.app/about"/>` and `x-default`, on all six public URLs; canonical matches |
| OG / Twitter cards, 1200×630 OG image | `src/app/layout.tsx`, `public/images/og-image.jpg` | `curl /images/og-image.jpg` → 200 image/jpeg; HTML contains `og:*` and `twitter:*` |
| robots.txt + sitemap (with image URLs) | `src/app/robots.ts`, `src/app/sitemap.ts` | `curl /robots.txt` and `/sitemap.xml` → 200; sitemap lists 6 canonical URLs with `lastmod`, `changefreq`, `priority` |
| AI-crawler policy | `robots.ts`: OAI-SearchBot / Claude-SearchBot / PerplexityBot allowed; GPTBot / ClaudeBot blocked | Verified in live robots.txt output |
| noindex for private/conversion pages | `next.config.ts` `X-Robots-Tag` | `curl -I /login` → `X-Robots-Tag: noindex, nofollow` |
| Structured data | `JsonLd`: Organization + WebSite globally; BreadcrumbList, Church, Person, FAQPage per page | `schema_lint.py https://vosem.vercel.app/voice-of-salvation` → 5 blocks, `parse_errors: []`, required props present; live HTML h1 + JSON-LD present |
| SSR/crawlability | `FirebaseClientProvider` no longer gates children behind `useEffect`; stub fallback when env vars missing | Live HTML contains real `<h1>` content on all public pages; no Firebase error screen |
| GEO answer blocks | `/voice-of-salvation`: 40–60 word definition, dated source citation, visible FAQ | Live page: "What is VOSEM?", "Questions people ask", source link to Independent Nigeria |
| Keyword-to-page mapping | `src/lib/seo-keywords.ts` → page `keywords` meta + related links | Built HTML keywords present per URL (see table below) |
| Content-cluster internal links | `RelatedLinks` on all six public pages | Built HTML contains "Explore more of VOSEM" on every public page |
| IndexNow | `scripts/indexnow.mjs`, key verification file | `npm run indexnow` → `IndexNow: 202` |

## 2. Keyword-to-page map (from `src/lib/seo-keywords.ts`)

| URL | Primary keyword | Secondary | Intent |
|---|---|---|---|
| `/` | church in Alapere Lagos | VOSEM International; Voice of Salvation Evangelical Ministries; worship service Lagos | Navigational |
| `/about` | Voice of Salvation Evangelical Ministries | VOSEM vision; J Olu Ayeni; church family in Lagos | Informational |
| `/voice-of-salvation` | Voice of Salvation Evangelical Ministries | VOSEM meaning; General Overseer Prophet J Olu Ayeni; VOSEM address Alapere | Informational |
| `/events` | VOSEM events Alapere Lagos | Sunday service times Lagos; Youth Impact Rally; Word and Wonders service | Local |
| `/giving` | give to VOSEM | tithes and offerings Lagos; Paystack church giving; Kingdom Projects VOSEM | Transactional |
| `/contact` | VOSEM International Headquarters address | church in Alapere Lagos; Davies Street Alapere church; VOSEM service times | Local |

Note: `/about` and `/voice-of-salvation` share the same primary phrase but have different intents (family/vision vs identity/history). If both pages compete in Search Console, consolidate or re-target `/about` to "VOSEM vision and leadership" — **Estimated**, requires GSC data.

## 3. Internal-link cluster

- Hub: `/` links to About, Events, Giving (header, footer, image cards, RelatedLinks).
- Spokes: each inner page links back to hub-related pages via contextual body links, header/footer, breadcrumb, and `RelatedLinks`.
- All public URLs are ≤1 click from the homepage; no orphan pages among the six public routes.
- `crawl.py` + `linkgraph.py` over the live site: `pages: 8, orphans: 0, deep_pages: 0, max_depth: 1, total_internal_links: 43` (Verified). The crawler also lists the bare-domain root as a separate node (`in: 0, out: 7`): internal links use `/` while Next.js normalises the canonical to `https://vosem.vercel.app` (no trailing slash) — **Verified** in live HTML. Canonical consolidation handles the variant; a server-level 301 is not available inside Next.js App Router.

## 4. GEO self-check (Estimated — no AI-citation telemetry available)

| Check | Status | Note |
|---|---|---|
| C02 direct answer | Pass | Definition block answers "What is VOSEM?" in 45 words |
| O03 quotable statements | Pass | FAQ answers are self-contained and quotable |
| O05 entity clarity | Pass | Full legal name, alternateName, stable `@id`, sameAs YouTube, leader Person schema |
| E01 source signals | Pass | Dated Independent Nigeria citation on identity page; testimonials on homepage |
| Freshness | Pass | Visible "Last updated" + accurate sitemap `lastmod` |
| AI Query Coverage | N/A | Cannot measure without an AI monitor connector |
| Citation rate | N/A | Requires Search Console / AI referral data |

## 5. Content gaps (from `docs/blueprint.md`) — now implemented

- `/sermons` — sermon library with search, displayed summaries and an AI-summary action (`src/app/sermons/actions.ts`).
- `/prayer` — prayer wall with submit form, anonymous option and member status list; rules updated to expose approved requests.
- `/dashboard/testimonies` — member testimony list with approval status and delete.
- `/events` — Firestore-backed event calendar with RSVP buttons; RSVP subcollection rules added.
- `/admin` — role-gated moderation (testimonies, prayer requests) and sermon/event publishing via `/admins/{uid}`.

Remaining product blockers: true Paystack recurring subscriptions need a plan code; Flutterwave needs merchant keys; AI summaries need `GEMINI_API_KEY` in Vercel env. Firestore rules were not emulator-validated (Java unavailable in this environment).

## 6. Strategies requiring external credentials or tools (blocked, not implemented)

| Strategy | Needed | Status |
|---|---|---|
| Search Console: CTR by query, index coverage, Core Web Vitals field data, snippet opportunities | GSC access | Blocked — no credentials |
| PageSpeed Insights / Lighthouse field + lab scores | PSI API or URL access | Blocked — no measurement run |
| Rank tracking / SERP feature monitoring | Semrush/Ahrefs or equivalent API key | Blocked — no credentials |
| Competitor analysis / content-gap analysis at scale | SEO tool exports | Blocked — no credentials |
| Backlink analysis & link building | Backlink tool data + outreach | Blocked — no credentials/authority |
| Google Business Profile + NAP citations | Business owner account | Blocked — no credentials |
| Bing Webmaster verification of IndexNow | Bing account | Submitted (202); verification pending |
| hreflang for multiple locales | Localised pages | Not applicable — single-language site |
| Video / programmatic / parasite SEO | Hosted video; scalable template; third-party sites | Not applicable / not advisable |

## 7. Publish blockers

- Vercel Firebase env vars (`NEXT_PUBLIC_FIREBASE_*`, `PAYSTACK_SECRET_KEY`, `GMAIL_*`) are missing: login, dashboard, giving and receipts cannot function in production. Public pages render via the stub fallback.
- `hello@vosem.org` is a placeholder inbox in footer/contact; replace with the real church address.
- Rotated `PAYSTACK_SECRET_KEY` / `GMAIL_APP_PASS` remain in git history; rotate if still live.
