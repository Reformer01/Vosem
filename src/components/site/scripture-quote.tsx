import { Quote } from "lucide-react";

export default function ScriptureQuote({ text, reference }: { text: string; reference: string }) {
  return (
    <aside className="site-curved mx-auto mb-8 flex max-w-3xl items-start gap-4 border border-border bg-[#e5e0da] px-6 py-5">
      <Quote className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium italic leading-relaxed text-foreground">&ldquo;{text}&rdquo;</p>
        <p className="mt-2 text-xs font-black uppercase tracking-widest text-primary">{reference}</p>
      </div>
    </aside>
  );
}
