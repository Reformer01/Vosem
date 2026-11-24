// Keyword-to-page map: one primary intent per URL, no keyword cannibalisation.
// Used for page keywords and for the contextual content-cluster links.
export interface KeywordPage {
  primary: string;
  secondary: string[];
  intent: "informational" | "navigational" | "transactional" | "local";
  hub: string;
  related: { href: string; label: string }[];
}

export const keywordMap: Record<string, KeywordPage> = {
  "/": {
    primary: "church in Alapere Lagos",
    secondary: ["VOSEM International", "Voice of Salvation Evangelical Ministries", "worship service Lagos"],
    intent: "navigational",
    hub: "Home",
    related: [
      { href: "/about", label: "About Voice of Salvation Evangelical Ministries" },
      { href: "/events", label: "VOSEM events and service times" },
      { href: "/giving", label: "Give to VOSEM" },
    ],
  },
  "/about": {
    primary: "Voice of Salvation Evangelical Ministries",
    secondary: ["VOSEM vision", "J Olu Ayeni", "church family in Lagos"],
    intent: "informational",
    hub: "About",
    related: [
      { href: "/voice-of-salvation", label: "Our identity and history" },
      { href: "/events", label: "Upcoming VOSEM events" },
      { href: "/contact", label: "Visit the VOSEM headquarters" },
    ],
  },
  "/voice-of-salvation": {
    primary: "Voice of Salvation Evangelical Ministries",
    secondary: ["VOSEM meaning", "General Overseer Prophet J Olu Ayeni", "VOSEM address Alapere"],
    intent: "informational",
    hub: "Identity",
    related: [
      { href: "/about", label: "About the VOSEM church family" },
      { href: "/contact", label: "VOSEM International Headquarters address" },
      { href: "/events", label: "Revival and church programmes" },
    ],
  },
  "/events": {
    primary: "VOSEM events Alapere Lagos",
    secondary: ["Sunday service times Lagos", "Youth Impact Rally", "Word and Wonders service"],
    intent: "local",
    hub: "Events",
    related: [
      { href: "/contact", label: "Plan your visit to VOSEM" },
      { href: "/about", label: "Learn about VOSEM" },
      { href: "/giving", label: "Support VOSEM outreach" },
    ],
  },
  "/giving": {
    primary: "give to VOSEM",
    secondary: ["tithes and offerings Lagos", "Paystack church giving", "Kingdom Projects VOSEM"],
    intent: "transactional",
    hub: "Giving",
    related: [
      { href: "/about", label: "What your giving supports" },
      { href: "/voice-of-salvation", label: "Our ministry and mission" },
      { href: "/contact", label: "Contact the church office" },
    ],
  },
  "/contact": {
    primary: "VOSEM International Headquarters address",
    secondary: ["church in Alapere Lagos", "Davies Street Alapere church", "VOSEM service times"],
    intent: "local",
    hub: "Contact",
    related: [
      { href: "/events", label: "See service times and events" },
      { href: "/about", label: "Meet the church family" },
      { href: "/voice-of-salvation", label: "Our full ministry name" },
    ],
  },
};

export function keywordsFor(path: string): string[] {
  const page = keywordMap[path];
  return page ? [page.primary, ...page.secondary] : [];
}

export function relatedLinksFor(path: string) {
  return keywordMap[path]?.related ?? [];
}
