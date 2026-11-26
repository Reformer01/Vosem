"use client";

import { collection } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";

export default function RsvpCount({ eventId }: { eventId: string }) {
  const firestore = useFirestore();
  const ref = useMemoFirebase(() => firestore ? collection(firestore, "events", eventId, "rsvps") : null, [firestore, eventId]);
  const { data, isLoading } = useCollection<{ userId: string }>(ref);
  if (isLoading) return <span className="text-muted-foreground">…</span>;
  return <span>{data?.length ?? 0}</span>;
}
