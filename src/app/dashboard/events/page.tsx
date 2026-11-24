"use client";

import { collection, collectionGroup, deleteDoc, doc, query, where } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

interface Rsvp {
  eventId: string;
  userId: string;
  status: string;
}

interface Event {
  title: string;
  startTime: string;
  location: string;
}

export default function MyEventsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const rsvpsQuery = useMemoFirebase(
    () => (user && firestore) ? query(collectionGroup(firestore, "rsvps"), where("userId", "==", user.uid)) : null,
    [user, firestore]
  );
  const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "events")) : null, [firestore]);

  const { data: rsvps, isLoading } = useCollection<Rsvp>(rsvpsQuery);
  const { data: events } = useCollection<Event>(eventsQuery);

  const eventById = new Map((events ?? []).map(e => [e.id, e]));

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold sm:text-4xl">My events</h1>
        <p className="mt-2 text-muted-foreground">Events you have RSVP&apos;d to. Cancel anytime from here.</p>

        <div className="mt-10 flex flex-col gap-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && (!rsvps || rsvps.length === 0) && (
            <div className="site-curved border border-border bg-card p-8 text-center text-muted-foreground">
              You haven&apos;t RSVP&apos;d to an event yet. <Link href="/events" className="font-bold text-primary underline">Browse the calendar</Link>.
            </div>
          )}
          {rsvps?.map(rsvp => {
            const event = eventById.get(rsvp.eventId);
            return (
              <article key={rsvp.eventId} className="site-curved flex flex-col gap-4 border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="app-status bg-primary/10 text-primary">{rsvp.status}</span>
                  <h2 className="mt-3 text-xl font-bold">{event?.title || "Event"}</h2>
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {event?.startTime ? new Date(event.startTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Date TBA"}
                  </p>
                </div>
                <Button variant="outline" className="rounded-full" onClick={() => firestore && deleteDoc(doc(firestore, "events", rsvp.eventId, "rsvps", user!.uid))}>
                  Cancel RSVP
                </Button>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
