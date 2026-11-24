import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  cta?: { label: string; href: string };
}

export default function PageHero({ eyebrow, title, description, image, cta }: PageHeroProps) {
  return (
    <section className="relative flex min-h-[46vh] items-end overflow-hidden bg-[#282b37] py-20 text-white sm:min-h-[52vh] sm:py-28">
      <Image src={image} alt="" fill priority className="object-cover" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#282b37] via-[#282b37]/70 to-[#282b37]/30" />
      <div className="site-wrap relative z-10">
        <span className="site-eyebrow !text-white/80">{eyebrow}</span>
        <h1 className="max-w-4xl font-display text-5xl italic leading-[1.05] sm:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">{description}</p>
        {cta && (
          <Link href={cta.href} className="site-btn site-btn-light mt-8">
            {cta.label} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </section>
  );
}
