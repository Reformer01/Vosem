import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tv } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden" id="home">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/60 mix-blend-multiply z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-background z-10"></div>
        {heroImage && (
          <Image
            alt="Joyful congregation worshiping with raised hands"
            className="w-full h-full object-cover"
            src={heroImage.imageUrl}
            fill
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
      </div>
      <div className="relative z-20 container mx-auto px-6 text-center text-white pt-24">
        <span className="inline-block py-1.5 px-4 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/40 text-xs font-bold tracking-[0.2em] uppercase mb-8 text-white">
          Experience God's Presence
        </span>
        <h2 className="text-6xl md:text-8xl font-display italic mb-8 leading-tight max-w-5xl mx-auto drop-shadow-2xl">
          Welcome to VOSEM INT'L
        </h2>
        <p className="text-lg md:text-2xl text-white/90 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
          Where hearts are transformed, destinies are discovered, and the love of Christ is our heartbeat in the city of Lagos and beyond.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Button className="bg-accent h-14 px-10 rounded-full text-white font-bold flex items-center gap-3 group w-full sm:w-auto justify-center text-lg hover:bg-white hover:text-accent transition-all shadow-lg hover:shadow-[0_0_30px_rgba(181,4,82,0.5)]">
            <Tv className="group-hover:scale-110 transition-transform" />
            <span>Join Live Service</span>
          </Button>
          <Button className="glass-btn h-14 px-10 rounded-full font-bold text-white hover:bg-white/25 hover:text-primary transition-colors w-full sm:w-auto justify-center shadow-2xl text-lg">
            Visit Us This Sunday
          </Button>
        </div>
      </div>
    </section>
  );
}
