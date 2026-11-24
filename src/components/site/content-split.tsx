import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ContentSplitProps {
  eyebrow?: string;
  title: string;
  body: string;
  image: string;
  href: string;
  cta: string;
  flip?: boolean;
  tint?: "white" | "cream" | "sage";
}

export default function ContentSplit({ eyebrow, title, body, image, href, cta, flip = false, tint = "white" }: ContentSplitProps) {
  const bg = tint === "cream" ? "bg-[#e5e0da]" : tint === "sage" ? "bg-[#eef2ea]" : "bg-card";

  return (
    <section className={`${bg} py-20 sm:py-28`}>
      <div className="site-wrap">
        <div className="site-curved grid items-center gap-10 p-6 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
          <div className={flip ? "lg:order-2" : ""}>
            {eyebrow && <span className="site-eyebrow">{eyebrow}</span>}
            <h2 className="font-display text-4xl italic leading-tight sm:text-5xl lg:text-6xl">{title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{body}</p>
            <Link href={href} className="site-btn site-btn-outline mt-9">
              {cta} <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className={`relative h-80 overflow-hidden rounded-[2rem] sm:h-[420px] lg:h-[500px] ${flip ? "lg:order-1" : ""}`}>
            <Image src={image} alt={title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </div>
    </section>
  );
}
