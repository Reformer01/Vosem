"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, HeartHandshake, PiggyBank } from "lucide-react";
import { useUser } from "@/firebase";
import { GivingModal } from "@/components/landing/giving-modal";
import ScriptureQuote from "./scripture-quote";

const options = [
  {
    title: "Tithes",
    description: "Honouring God with the first 10% of our income, acknowledging Him as our provider.",
    icon: PiggyBank,
  },
  {
    title: "Offerings",
    description: "Freewill gifts given out of gratitude to support the daily operations of the ministry.",
    icon: HeartHandshake,
  },
  {
    title: "Kingdom Projects",
    description: "Partnering with us to build infrastructure and expand our reach for the Kingdom.",
    icon: Building,
  },
];

export default function GivingSection() {
  const { user } = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [purpose, setPurpose] = useState("Offerings");

  const give = (name: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    setPurpose(name);
    setOpen(true);
  };

  return (
    <section className="bg-[#e5e0da] py-20 sm:py-28" id="giving">
      <div className="site-wrap">
        <ScriptureQuote
          text="Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver."
          reference="2 Corinthians 9:7"
        />
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="site-eyebrow">Giving &amp; Stewardship</span>
          <h2 className="font-display text-4xl italic sm:text-6xl">Supporting the Vision</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            &ldquo;Give, and it will be given to you. A good measure, pressed down, shaken together and running over&hellip;&rdquo;
            <span className="mt-2 block text-sm font-bold not-italic">Luke 6:38</span>
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {options.map(({ title, description, icon: Icon }) => (
            <div key={title} className="site-curved flex flex-col border border-border bg-card p-8 text-center shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:p-10">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center text-primary">
                <Icon className="size-7" />
              </div>
              <h3 className="mb-3 text-2xl font-bold">{title}</h3>
              <p className="mb-8 flex-grow text-sm leading-relaxed text-muted-foreground">{description}</p>
              <button onClick={() => give(title)} className="site-btn site-btn-solid w-full">Give Now</button>
            </div>
          ))}
        </div>
      </div>
      <GivingModal isOpen={open} onOpenChange={setOpen} defaultPurpose={purpose} />
    </section>
  );
}
