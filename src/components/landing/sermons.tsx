import Image from "next/image";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const sermonImage = PlaceHolderImages.find(img => img.id === 'sermon-main');

export default function Sermons() {
  return (
    <section className="py-32 relative overflow-hidden bg-primary" id="sermons">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white rounded-full mix-blend-screen filter blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent rounded-full mix-blend-screen filter blur-[100px]"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-block py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-black uppercase tracking-widest mb-6">
            Teaching Series
          </span>
          <h2 className="text-5xl md:text-7xl font-display italic text-white mb-6">Walking in Power</h2>
          <p className="text-purple-100 max-w-2xl mx-auto text-xl font-light">Join the current spiritual journey at VOSEM INT'L as we explore the dimensions of the Spirit.</p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="glass-panel p-3 md:p-6 rounded-[2.5rem] shadow-2xl">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-black group">
              {sermonImage && (
                <Image
                  alt="Latest Sermon"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-700"
                  src={sermonImage.imageUrl}
                  fill
                  data-ai-hint={sermonImage.imageHint}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button variant="default" className="size-24 bg-accent/80 backdrop-blur-xl rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-accent transition-all border border-white/30 shadow-2xl">
                  <Play className="h-12 w-12 ml-2" />
                  <span className="sr-only">Play Sermon</span>
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <h3 className="text-white text-2xl font-bold mb-1">Manifesting the Kingdom: Part 4</h3>
                <p className="text-white/70 text-base">Recorded Live at VOSEM INT'L • October 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
