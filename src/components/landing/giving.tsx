
"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PiggyBank, HeartHandshake, Building, Lock } from "lucide-react";
import { PaystackIcon, FlutterwaveIcon } from "@/components/icons";
import { GivingModal } from "./giving-modal";

const givingBgImage = PlaceHolderImages.find(img => img.id === 'giving-bg');

const givingOptions = [
  {
    icon: <PiggyBank className="text-3xl" />,
    title: "Tithes",
    description: "Honoring God with the first 10% of our income, acknowledging Him as our provider.",
  },
  {
    icon: <HeartHandshake className="text-3xl" />,
    title: "Offerings",
    description: "Freewill gifts given out of gratitude to support the daily operations of the ministry.",
    featured: true,
  },
  {
    icon: <Building className="text-3xl" />,
    title: "Kingdom Projects",
    description: "Partnering with us to build infrastructure and expand our reach for the Kingdom.",
  },
];

export default function Giving() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="py-32 relative bg-background-light dark:bg-primary/5 overflow-hidden" id="giving">
        <div className="absolute inset-0">
          {givingBgImage && (
            <Image
              alt="Giving hands"
              className="w-full h-full object-cover opacity-10 mix-blend-overlay"
              src={givingBgImage.imageUrl}
              fill
              data-ai-hint={givingBgImage.imageHint}
            />
          )}
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block py-1.5 px-4 rounded-full bg-accent/10 border border-accent/20 text-accent font-black uppercase tracking-widest mb-6 text-xs">
              Giving & Stewardship
            </span>
            <h2 className="text-5xl md:text-6xl font-headline italic text-foreground mb-6">Supporting the Vision</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-xl font-light italic">
              "Give, and it will be given to you. A good measure, pressed down, shaken together and running over..." <br /> <span className="text-sm font-bold not-italic mt-2 block">- Luke 6:38</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {givingOptions.map((option, index) => (
              <div
                key={index}
                className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-[2rem] p-10 text-center hover:transform hover:-translate-y-2 transition-all duration-500 shadow-xl group relative overflow-hidden"
              >
                {option.featured && <div className="absolute top-0 right-0 w-24 h-24 bg-accent/20 rounded-bl-[4rem] -mr-4 -mt-4"></div>}
                <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-white/10 flex items-center justify-center mx-auto mb-6 text-primary dark:text-white group-hover:bg-accent group-hover:text-white transition-colors duration-300 relative z-10">
                  {option.icon}
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{option.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                  {option.description}
                </p>
                <Button 
                  className="w-full py-6 rounded-xl bg-accent text-white font-bold hover:bg-primary transition-colors shadow-lg hover:shadow-accent/40 text-base"
                  onClick={() => setIsModalOpen(true)}
                >
                  Give Now
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-16 flex justify-center">
            <div className="bg-primary rounded-[2rem] p-8 md:px-12 md:py-8 shadow-2xl border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col items-center">
                <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                  <Lock className="h-3 w-3" />
                  Fast and secure payments powered by
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 opacity-90">
                  <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
                    <PaystackIcon className="h-6 text-white" />
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-white/30"></div>
                  <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all duration-300">
                    <FlutterwaveIcon className="h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <GivingModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
