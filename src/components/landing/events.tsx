import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin, HeartHandshake } from "lucide-react";
import { events } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  Clock: <Clock className="h-5 w-5 text-accent" />,
  MapPin: <MapPin className="h-5 w-5 text-accent" />,
  HeartHandshake: <HeartHandshake className="h-5 w-5 text-accent" />,
};

export default function Events() {
  return (
    <section className="py-24 px-6 bg-background-light dark:bg-background relative" id="events">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
          <div>
            <h3 className="text-accent font-extrabold text-sm tracking-widest uppercase mb-3">Our Calendar</h3>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight italic">At VOSEM This Month</h2>
          </div>
          <Link href="#" className="text-accent font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View Full Calendar <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {events.map((event) => {
            const eventImage = PlaceHolderImages.find(img => img.id === event.imageId);
            return (
              <div key={event.title} className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer shadow-2xl hover:shadow-primary/20 transition-all">
                {eventImage && (
                  <Image
                    alt={event.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    src={eventImage.imageUrl}
                    fill
                    data-ai-hint={eventImage.imageHint}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent"></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                  <Badge
                    variant="default"
                    className={`self-start px-4 py-1.5 rounded-full mb-4 text-[10px] font-black uppercase tracking-widest border border-white/20 ${event.badgeType === 'upcoming' ? 'bg-accent/80 backdrop-blur-md' : 'glass-panel'}`}
                  >
                    {event.badge}
                  </Badge>
                  <h3 className="text-3xl font-bold mb-2">{event.title}</h3>
                  <p className="text-white/80 text-sm flex items-center gap-2">
                    {iconMap[event.icon as keyof typeof iconMap]} {event.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
