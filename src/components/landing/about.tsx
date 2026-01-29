import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Globe, Users, School } from "lucide-react";

const aboutImage = PlaceHolderImages.find(img => img.id === 'about-main');

export default function About() {
  return (
    <section className="py-32 bg-background-light dark:bg-background-dark relative overflow-hidden" id="about">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative h-[600px] w-full hidden lg:block">
            <div className="absolute top-0 right-0 w-[450px] h-[550px] rounded-[3rem] overflow-hidden shadow-2xl transform rotate-2 border-4 border-white/5">
              {aboutImage && (
                <Image
                  alt="Church Family"
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  src={aboutImage.imageUrl}
                  width={450}
                  height={550}
                  data-ai-hint={aboutImage.imageHint}
                />
              )}
            </div>
            <div className="absolute -bottom-10 -left-10 w-96 glass-panel p-10 rounded-[2.5rem] shadow-2xl z-20 border-white/40 bg-white/5 backdrop-blur-xl">
              <h3 className="text-2xl font-headline italic font-bold mb-4 text-accent dark:text-accent">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                Raising a kingdom-conscious generation that impacts nations and cultures through the power of the gospel.
              </p>
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30">
                  <Globe />
                </div>
                <span className="font-bold text-sm tracking-widest text-primary dark:text-white">VOSEM IDENTITY</span>
              </div>
            </div>
          </div>
          <div className="lg:pl-12">
            <h3 className="text-accent font-black text-sm tracking-widest uppercase mb-4 italic">Belong to VOSEM</h3>
            <h2 className="text-5xl md:text-6xl font-headline font-bold text-foreground mb-10 leading-[1.1]">More Than a Church, <br /><span className="italic text-primary">A Royal Family.</span></h2>
            <p className="text-xl text-gray-500 dark:text-gray-300 mb-10 leading-relaxed font-light">
              At VOSEM INT'L, we believe every individual carries a divine mandate. Our mission is to nurture that potential in an atmosphere of radical love and excellence.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
              <div className="flex items-start gap-4">
                <Users className="text-accent text-3xl" />
                <div>
                  <h4 className="font-bold text-foreground text-lg">Connect Groups</h4>
                  <p className="text-sm text-gray-500">Find your tribe in Lagos.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <School className="text-accent text-3xl" />
                <div>
                  <h4 className="font-bold text-foreground text-lg">Discipleship</h4>
                  <p className="text-sm text-gray-500">Grow in the Word.</p>
                </div>
              </div>
            </div>
            <Button size="lg" className="px-12 py-7 rounded-xl bg-foreground text-background dark:bg-white dark:text-foreground font-black hover:bg-accent dark:hover:bg-accent dark:hover:text-white transition-all shadow-xl text-lg uppercase tracking-widest">
              Plan Your Visit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
