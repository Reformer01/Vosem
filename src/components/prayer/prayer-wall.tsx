"use client";

import { useState } from "react";
import { collection, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { addDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Send } from "lucide-react";

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
  const [sent, setSent] = useState(false);

  const wallQuery = useMemoFirebase(
    () => firestore ? query(collection(firestore, "prayer_requests"), where("approved", "==", true), orderBy("date", "desc")) : null,
    [firestore]
  );
  const mineQuery = useMemoFirebase(
    () => (firestore && user) ? query(collection(firestore, "prayer_requests"), where("authorId", "==", user.uid)) : null,
    [firestore, user]
  );
  const { data: prayers } = useCollection<Prayer>(wallQuery);
  const { data: mine } = useCollection<Prayer>(mineQuery);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !firestore || content.trim().length < 5) return;
    addDocumentNonBlocking(collection(firestore, "prayer_requests"), {
      author: isAnonymous ? "Anonymous" : (user.displayName || "Member"),
      authorId: user.uid,
      content: content.trim(),
      date: serverTimestamp(),
      isAnonymous,
      approved: false,
    });
    setContent("");
    setIsAnonymous(false);
    setSent(true);
  };

  return (
    <section className="bg-card py-20 sm:py-28">
      <div className="site-wrap grid gap-10 lg:grid-cols-2">
        <div className="site-curved border border-border bg-[#e5e0da] p-8 sm:p-10">
          <h2 className="text-2xl font-bold">Share a prayer request</h2>
          <p className="mt-2 text-muted-foreground">Our team reviews requests before they appear on the wall.</p>
          {user ? (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Tell us what you would like the church to pray about…" className="min-h-36" />
              <label className="flex items-center gap-3 text-sm font-semibold">
                <Checkbox checked={isAnonymous} onCheckedChange={checked => setIsAnonymous(checked === true)} /> Post anonymously
              </label>
              <Button type="submit" className="site-btn site-btn-solid" disabled={content.trim().length < 5}><Send className="size-4" /> Send request</Button>
              {sent && <p className="text-sm font-semibold text-primary">Thank you — your request is awaiting review.</p>}
            </form>
          ) : (
            <p className="mt-8 text-muted-foreground">Please <a href="/login" className="font-semibold text-primary underline">log in</a> to share a request.</p>
          )}

          {mine && mine.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-muted-foreground">Your requests</h3>
              <ul className="space-y-3 text-sm">
                {mine.map((p, i) => (
                  <li key={i} className="rounded-2xl bg-card p-4">
                    <span className={`mr-2 font-bold ${p.approved ? "text-primary" : "text-muted-foreground"}`}>{p.approved ? "On the wall" : "Pending"}</span>
                    {p.content.slice(0, 90)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold">Prayer wall</h2>
          <div className="flex flex-col gap-4">
            {prayers && prayers.length > 0 ? prayers.map((p, i) => (
              <article key={i} className="site-curved border border-border bg-[#e5e0da] p-6">
                <p className="leading-relaxed">{p.content}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-widest text-primary">
                  {p.isAnonymous ? "Anonymous" : p.author}
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
