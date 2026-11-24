import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/icons";

const columns = [
  {
    title: "Explore",
    links: [
      { href: "/about", label: "About VOSEM" },
      { href: "/events", label: "Events" },
      { href: "/#sermons", label: "Teaching" },
      { href: "/voice-of-salvation", label: "Voice of Salvation" },
      { href: "/#testimonies", label: "Testimonies" },
      { href: "/giving", label: "Give" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/about#connect", label: "Connect Groups" },
      { href: "/about#kids", label: "Kids & Youth" },
      { href: "/about#vision", label: "Our Vision" },
      { href: "/signup", label: "Join the Family" },
      { href: "/contact", label: "Plan a Visit" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-[#403f38] pt-10 text-[#282b37] sm:pt-16">
      <div className="site-wrap pb-10 sm:pb-14">
        <div className="site-curved bg-[#e5e0da] px-6 py-12 sm:px-12 sm:py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="mb-6 text-xl font-black tracking-tight">Reach us</h4>
              <div className="space-y-4 text-sm font-semibold">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0" />
                  <span>12/14, Ademolu Adefuye, Off Davies Street,<br />Alapere, Ketu, Lagos State, Nigeria.</span>
                </p>
                {/* shortcut: placeholder inbox, replace with the church's real address */}
                <p className="flex items-center gap-3">
                  <Mail className="size-5 shrink-0" />
                  <a href="mailto:hello@vosem.org" className="hover:text-primary">hello@vosem.org</a>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0" />
                  <span>Services: Sun 9:00 AM &amp; 11:00 AM</span>
                </p>
              </div>
            </div>

            {columns.map((column) => (
              <div key={column.title}>
                <h4 className="mb-6 text-xl font-black tracking-tight">{column.title}</h4>
                <ul className="space-y-3 text-sm font-semibold">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="transition-colors hover:text-primary">{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="mb-6 text-xl font-black tracking-tight">Follow us</h4>
              <p className="mb-6 text-sm font-medium leading-relaxed">
                A global community of believers passionate about God&apos;s presence and people&apos;s purpose.
              </p>
              <div className="flex gap-3">
                <Link href="https://www.youtube.com" target="_blank" aria-label="YouTube" className="flex size-11 items-center justify-center rounded-full bg-foreground text-[#e5e0da] transition-colors hover:bg-primary">
                  <YoutubeIcon className="size-5" />
                </Link>
                <Link href="https://www.instagram.com" target="_blank" aria-label="Instagram" className="flex size-11 items-center justify-center rounded-full bg-foreground text-[#e5e0da] transition-colors hover:bg-primary">
                  <InstagramIcon className="size-5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-foreground/20 pt-8 text-xs font-bold uppercase tracking-widest sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 VOSEM International. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="/contact" className="hover:text-primary">Privacy</Link>
              <Link href="/contact" className="hover:text-primary">Terms</Link>
              <Link href="/contact" className="hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
