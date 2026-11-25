"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, query } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import EventCalendar from "@/components/events/event-calendar";

interface Event {
  title: string;
  startTime: string;
  location: string;
}

export default function MyEventsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [goingIds, setGoingIds] = useState<string[]>([]);

  const eventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "events")) : null, [firestore]);
  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  useEffect(() => {
    if (!user || !firestore || !events?.length) return;
    let active = true;
    Promise.all(events.map(async event => {
      const snap = await getDoc(doc(firestore, "events", event.id, "rsvps", user.uid));
      return snap.exists() ? event.id : null;
    })).then(ids => {
      if (active) setGoingIds(ids.filter(Boolean) as string[]);
    }).catch(() => {});
    return () => { active = false; };
  }, [user, firestore, events]);

  const going = events?.filter(event => goingIds.includes(event.id)) ?? [];

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="text-3xl font-bold sm:text-4xl">My events</h1>
        <p className="mt-2 text-muted-foreground">Your upcoming gatherings and event calendar.</p>

        <div className="mt-10 flex flex-col gap-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && going.length === 0 && (
            <div className="site-curved border border-border bg-card p-8 text-center text-muted-foreground">
              You haven&apos;t RSVP&apos;d to an event yet. <Link href="/events" className="font-bold text-primary underline">Browse the calendar</Link>.
            </div>
          )}
          {going.map(event => (
            <article key={event.id} className="site-curved flex flex-col gap-4 border border-border bg-card p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="app-status bg-primary/10 text-primary">Going</span>
                <h2 className="mt-3 text-xl font-bold">{event.title}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="size-4" />
                  {new Date(event.startTime).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={async () => {
                  if (!user || !firestore) return;
                  await deleteDoc(doc(firestore, "events", event.id, "rsvps", user.uid));
                  setGoingIds(ids => ids.filter(id => id !== event.id));
                }}
              >
                Cancel RSVP
              </Button>
            </article>
          ))}
        </div>
      </div>
      <EventCalendar />
    </main>
  );
}
