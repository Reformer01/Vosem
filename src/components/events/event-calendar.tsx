"use client";

import { useState } from "react";
import { collection, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin } from "lucide-react";

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

  const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "events"), orderBy("startTime", "asc")) : null, [firestore]);
  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  const toggleRsvp = async (eventId: string, going: boolean) => {
    if (!user || !firestore) return;
    setBusy(eventId);
    const rsvpRef = doc(firestore, "events", eventId, "rsvps", user.uid);
    if (going) await deleteDoc(rsvpRef);
    else await addDocumentNonBlocking(collection(firestore, "events", eventId, "rsvps"), {
      userId: user.uid, eventId, createdAt: serverTimestamp(), status: "going",
    });
    setBusy(null);
  };

  return (
    <section className="bg-card py-20 sm:py-28">
      <div className="site-wrap">
        <h2 className="font-display text-4xl italic sm:text-5xl">Church calendar</h2>
        <p className="mt-3 text-muted-foreground">See what&apos;s coming up and let us know you&apos;re going.</p>
        {isLoading && <p className="mt-8 text-muted-foreground">Loading events…</p>}
        {!isLoading && (!events || events.length === 0) && <p className="mt-8 text-muted-foreground">No events scheduled yet — check back soon.</p>}
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
        {!signedIn ? "Log in to RSVP" : busy ? "Saving…" : data ? "Going — cancel RSVP" : "RSVP"}
      </Button>
    </article>
  );
}
