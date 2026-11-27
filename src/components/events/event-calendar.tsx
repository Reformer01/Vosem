"use client";

import { useState } from "react";
import { collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import ScriptureQuote from "@/components/site/scripture-quote";

interface Event {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl?: string;
}

export default function EventCalendar() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [busy, setBusy] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "events"), orderBy("startTime", "asc")) : null, [firestore]);
  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  const toggleRsvp = async (eventId: string, going: boolean) => {
    if (!user || !firestore) return;
    if (busy) return;
    setBusy(eventId);
    const rsvpRef = doc(firestore, "events", eventId, "rsvps", user.uid);
    try {
      if (going) await deleteDoc(rsvpRef);
      else await setDoc(rsvpRef, { userId: user.uid, eventId, createdAt: serverTimestamp(), status: "going" });
    } finally {
      setBusy(null);
    }
  };

  const view = new Date();
  view.setDate(1);
  view.setMonth(view.getMonth() + monthOffset);
  const monthName = view.toLocaleDateString("en-NG", { month: "long", year: "numeric" });
  const dayCount = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const leadingBlanks = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const eventDays = new Set((events ?? []).map(e => new Date(e.startTime).toDateString()));

  return (
    <section className="bg-card py-20 sm:py-28">
      <div className="site-wrap">
        <ScriptureQuote
          text="For where two or three gather in my name, there am I with them."
          reference="Matthew 18:20"
        />
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-4xl italic sm:text-5xl">Church calendar</h2>
            <p className="mt-3 text-muted-foreground">See what&apos;s coming up and let us know you&apos;re going.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-xl" aria-label="Previous month" onClick={() => setMonthOffset(m => m - 1)}><ChevronLeft className="size-4" /></Button>
            <span className="min-w-36 text-center text-sm font-bold">{monthName}</span>
            <Button variant="outline" size="icon" className="rounded-xl" aria-label="Next month" onClick={() => setMonthOffset(m => m + 1)}><ChevronRight className="size-4" /></Button>
          </div>
        </div>

        <div className="mb-10 rounded-[1.5rem] border border-border bg-card p-4 sm:p-6">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black uppercase tracking-wider text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <span key={day} className="py-2">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }, (_, i) => <div key={`blank-${i}`} />)}
            {Array.from({ length: dayCount }, (_, i) => i + 1).map(day => {
              const date = new Date(view.getFullYear(), view.getMonth(), day);
              const hasEvent = eventDays.has(date.toDateString());
              return (
                <div key={day} className={`flex aspect-square items-center justify-center rounded-xl text-sm font-semibold ${hasEvent ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                  {day}
                  {hasEvent && <span className="sr-only">event</span>}
                </div>
              );
            })}
          </div>
        </div>

        {isLoading && <p className="mt-8 text-muted-foreground">Loading events…</p>}
        {!isLoading && (!events || events.length === 0) && <p className="mt-8 text-muted-foreground">No events scheduled yet. Check back soon.</p>}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events?.map(event => (
            <RsvpCard key={event.id} event={event} onToggle={(going) => toggleRsvp(event.id, going)} busy={busy === event.id} signedIn={!!user} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Hook cannot be called inside a callback; read each RSVP in the card instead.
function RsvpCard({ event, onToggle, busy, signedIn }: { event: Event & { id: string }; onToggle: (going: boolean) => void; busy: boolean; signedIn: boolean }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const ref = useMemoFirebase(() => (user && firestore) ? doc(firestore, "events", event.id, "rsvps", user.uid) : null, [user, firestore, event.id]);
  const { data } = useDoc(ref);

  const when = event.startTime ? new Date(event.startTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Date to be announced";

  return (
    <article className="site-curved flex flex-col border border-border bg-[#e5e0da] p-7">
      <CalendarDays className="size-6 text-primary" />
      <h3 className="mt-4 text-xl font-bold">{event.title}</h3>
      <p className="mt-2 text-sm font-semibold text-foreground">{when}</p>
      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="size-4" /> {event.location}</p>
      <p className="mt-4 flex-grow text-sm leading-relaxed text-muted-foreground">{event.description}</p>
      <Button variant={data ? "outline" : "default"} className="site-btn site-btn-solid mt-6 w-full" disabled={!signedIn || busy} onClick={() => onToggle(!!data)}>
        {!signedIn ? "Log in to RSVP" : busy ? "Saving…" : data ? "Going (cancel RSVP)" : "RSVP"}
      </Button>
    </article>
  );
}
