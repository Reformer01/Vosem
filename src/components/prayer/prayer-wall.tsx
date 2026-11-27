"use client";

import { useState } from "react";
import { collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { useMachine } from "@/machines";
import { prayerSubmissionMachine } from "@/machines/prayer-submission.machine";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";
import ScriptureQuote from "@/components/site/scripture-quote";

interface Prayer {
  author: string;
  authorId: string;
  content: string;
  isAnonymous: boolean;
  approved: boolean;
}

export default function PrayerWall() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState("");
  const [state, send] = useMachine(prayerSubmissionMachine);

  const wallQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "prayer_requests"), where("approved", "==", true), orderBy("date", "desc")) : null,
    [firestore]
  );
  const mineQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, "prayer_requests"), where("authorId", "==", user.uid)) : null,
    [firestore, user]
  );
  const { data: prayers, isLoading: wallLoading } = useCollection<Prayer>(wallQuery);
  const { data: mine } = useCollection<Prayer>(mineQuery);

  const changeContent = (value: string) => {
    setContent(value);
    if (state !== "idle") {
      setError("");
      send("RESET");
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const text = content.trim();
    if (!user || !firestore || text.length < 5 || text.length > 1000 || state === "submitting") return;
    send("SUBMIT");
    setError("");
    try {
      // One live request per member. Older submissions are removed so they do not stack.
      const old = (mine ?? []).filter(request => request.id !== user.uid);
      await Promise.all(old.map(request => deleteDoc(doc(firestore, "prayer_requests", request.id))));
      await setDoc(doc(firestore, "prayer_requests", user.uid), {
        author: isAnonymous ? "Anonymous" : (user.displayName || "Member"),
        authorId: user.uid,
        content: text,
        date: serverTimestamp(),
        isAnonymous,
        approved: false,
      });
      setContent("");
      setIsAnonymous(false);
      send("SUCCESS");
    } catch {
      setError("We could not send your request. Please try again.");
      send("FAILURE");
    }
  };

  return (
    <section className="bg-card py-20 sm:py-28">
      <div className="site-wrap">
        <ScriptureQuote
          text="Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
          reference="Philippians 4:6"
        />
      </div>
      <div className="site-wrap grid gap-10 lg:grid-cols-2">
        <div className="site-curved border border-border bg-[#e5e0da] p-8 sm:p-10">
          <h2 className="text-2xl font-bold">Share a prayer request</h2>
          <p className="mt-2 text-muted-foreground">Pray with the church family. Every request matters to God.</p>
          {user ? (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <Textarea value={content} onChange={e => changeContent(e.target.value)} placeholder="Tell us what you would like the church to pray about..." className="min-h-36" />
              <label className="flex items-center gap-3 text-sm font-semibold">
                <Checkbox checked={isAnonymous} onCheckedChange={checked => setIsAnonymous(checked === true)} /> Post anonymously
              </label>
              <Button type="submit" className="site-btn site-btn-solid" disabled={state === "submitting" || content.trim().length < 5 || content.trim().length > 1000}>
                <Send className="size-4" /> {state === "submitting" ? "Sending..." : "Send request"}
              </Button>
              {state === "success" && <p className="text-sm font-semibold text-primary">Your prayer request has been received.</p>}
              {state === "error" && <p className="text-sm font-semibold text-destructive">{error}</p>}
            </form>
          ) : (
            <p className="mt-8 text-muted-foreground">Please <a href="/login" className="font-semibold text-primary underline">log in</a> to share a request.</p>
          )}

          {mine && mine.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Your request</h3>
              <ul className="space-y-3 text-sm">
                {mine.map(request => (
                  <li key={request.id} className="rounded-2xl bg-card p-4">
                    <span className={`mr-2 font-bold ${request.approved ? "text-primary" : "text-muted-foreground"}`}>{request.approved ? "On the wall" : "Received"}</span>
                    {request.content.slice(0, 90)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Prayer wall</h2>
          <div className="flex flex-col gap-4">
            {wallLoading ? (
              <p className="text-muted-foreground">Loading prayer requests...</p>
            ) : prayers && prayers.length > 0 ? prayers.map(request => (
              <article key={request.id} className="site-curved border border-border bg-[#e5e0da] p-6">
                <p className="leading-relaxed">{request.content}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">
                  {request.isAnonymous ? "Anonymous" : request.author}
                </p>
              </article>
            )) : (
              <p className="text-muted-foreground">No approved requests yet. Be the first to share and pray.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
