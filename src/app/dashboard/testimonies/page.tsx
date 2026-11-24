"use client";

import { collection, deleteDoc, doc, query, where } from "firebase/firestore";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface Testimony {
  author: string;
  authorId: string;
  content: string;
  approved: boolean;
}

export default function MyTestimoniesPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const testimoniesQuery = useMemoFirebase(
    () => (user && firestore) ? query(collection(firestore, "testimonies"), where("authorId", "==", user.uid)) : null,
    [user, firestore]
  );
  const { data: testimonies, isLoading } = useCollection<Testimony>(testimoniesQuery);

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold sm:text-4xl">My testimonies</h1>
        <p className="mt-2 text-muted-foreground">Stories you have shared with the VOSEM family and their review status.</p>

        <div className="mt-10 flex flex-col gap-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && (!testimonies || testimonies.length === 0) && (
            <p className="site-curved border border-border bg-card p-8 text-center text-muted-foreground">
              You haven&apos;t shared a testimony yet. Use the share button on the homepage testimonies section.
            </p>
          )}
          {testimonies?.map((testimony, index) => (
            <article key={index} className="site-curved flex flex-col gap-4 border border-border bg-card p-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className={`app-status ${testimony.approved ? "bg-green-500/10 text-green-700" : "bg-primary/10 text-primary"}`}>
                  {testimony.approved ? "Approved" : "Pending review"}
                </span>
                <p className="mt-4 leading-relaxed">{testimony.content}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                aria-label="Delete testimony"
                className="rounded-full"
                onClick={() => deleteDoc(doc(firestore, "testimonies", (testimony as any).id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
