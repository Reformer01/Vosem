"use client";

import { useMemo, useState } from "react";
import { collection, orderBy, query } from "firebase/firestore";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { generateSermonSummary } from "@/app/sermons/actions";

interface Sermon {
  title: string;
  speaker: string;
  date?: string;
  videoUrl: string;
  summary?: string;
}

export default function SermonLibrary() {
  const firestore = useFirestore();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  const sermonsQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "sermons"), orderBy("date", "desc")) : null,
    [firestore]
  );
  const { data: sermons, isLoading } = useCollection<Sermon>(sermonsQuery);

  const filtered = useMemo(() => {
    if (!sermons) return [];
    const term = search.trim().toLowerCase();
    return term ? sermons.filter(s => `${s.title} ${s.speaker}`.toLowerCase().includes(term)) : sermons;
  }, [sermons, search]);

  const summarize = async (sermon: Sermon & { id: string }) => {
    setBusyId(sermon.id);
    setError(null);
    try {
      const summary = await generateSermonSummary(sermon.title, sermon.speaker);
      // Display locally; persisted summaries are written by admins in /admin.
      setSummaries(prev => ({ ...prev, [sermon.id]: summary }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate a summary.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="bg-card py-20 sm:py-28">
      <div className="site-wrap">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-4xl italic sm:text-5xl">Message Library</h2>
            <p className="mt-3 text-muted-foreground">Browse recent teaching and read AI-generated summaries.</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary/60" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or speaker" className="site-curved pl-12" />
          </div>
        </div>

        {error && <p className="mb-6 text-sm text-red-500">{error}</p>}
        {isLoading && <p className="text-muted-foreground">Loading messages…</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground">No messages yet. Check back after the next service.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(sermon => (
            <article key={sermon.id} className="site-curved flex flex-col border border-border bg-[#e5e0da] p-7">
              <span className="text-xs font-black uppercase tracking-widest text-primary">{sermon.speaker}</span>
              <h3 className="mt-3 text-xl font-bold">{sermon.title}</h3>
              {sermon.date && <p className="mt-1 text-sm text-muted-foreground">{String(sermon.date).slice(0, 10)}</p>}
              <p className="mt-4 flex-grow text-sm leading-relaxed text-muted-foreground">
                {summaries[sermon.id] || sermon.summary || "No summary yet. Generate one below."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={sermon.videoUrl} target="_blank" rel="noreferrer" className="site-btn site-btn-solid !px-5 !py-2 !text-xs">Watch</a>
                <Button variant="outline" className="site-btn !px-5 !py-2 !text-xs" disabled={busyId === sermon.id} onClick={() => summarize(sermon)}>
                  <Sparkles className="size-3.5" /> {busyId === sermon.id ? "Summarising…" : "Summarise"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
