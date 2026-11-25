"use client";

import { useState } from "react";
import Link from "next/link";
import { VosemLogoIcon } from "@/components/icons";
import { collection, orderBy, query, serverTimestamp, updateDoc, doc, where } from "firebase/firestore";
import { addDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function AdminHeader() {
  return (
    <header className="border-b border-border bg-card">
      <div className="site-wrap flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-sm font-black tracking-tighter">
          <VosemLogoIcon className="size-6 text-primary" /> VOSEM <span className="text-primary">INT&apos;L</span>
        </Link>
        <div className="flex items-center gap-5 text-sm font-bold">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary">Dashboard</Link>
          <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
        </div>
      </div>
    </header>
  );
}

export default function AdminPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [sermon, setSermon] = useState({ title: "", speaker: "", videoUrl: "", summary: "" });
  const [event, setEvent] = useState({ title: "", description: "", startTime: "", endTime: "", location: "" });

  const roleRef = useMemoFirebase(() => (user ? doc(firestore, "admins", user.uid) : null), [user, firestore]);
  const { data: role } = useDoc<{ role: string }>(roleRef);
  const isAdmin = role?.role === "admin" || role?.role === "moderator";

  const pendingTestimonies = useMemoFirebase(() => firestore ? query(collection(firestore, "testimonies"), where("approved", "==", false)) : null, [firestore]);
  const { data: testimonies } = useCollection<any>(pendingTestimonies);

  const pendingPrayers = useMemoFirebase(() => firestore ? query(collection(firestore, "prayer_requests"), where("approved", "==", false), orderBy("date", "desc")) : null, [firestore]);
  const { data: prayers } = useCollection<any>(pendingPrayers);

  const approve = async (path: string, id: string) => {
    await updateDoc(doc(firestore, path, id), { approved: true });
    toast({ title: "Approved", description: "Now visible to the church family." });
  };

  const saveSermon = (e: React.FormEvent) => {
    e.preventDefault();
    addDocumentNonBlocking(collection(firestore, "sermons"), {
      title: sermon.title, speaker: sermon.speaker, videoUrl: sermon.videoUrl,
      summary: sermon.summary, date: serverTimestamp(),
    });
    setSermon({ title: "", speaker: "", videoUrl: "", summary: "" });
    toast({ title: "Sermon added" });
  };

  const saveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addDocumentNonBlocking(collection(firestore, "events"), {
      ...event, startTime: new Date(event.startTime).toISOString(), endTime: new Date(event.endTime).toISOString(),
    });
    setEvent({ title: "", description: "", startTime: "", endTime: "", location: "" });
    toast({ title: "Event added" });
  };

  if (!user || !isAdmin) {
    return (
      <div className="app-shell flex min-h-screen flex-col">
        <AdminHeader />
        <main className="flex flex-grow flex-col items-center justify-center px-5 py-16 text-center">
          <h1 className="text-3xl font-bold">Admin access required</h1>
          <p className="mt-3 text-muted-foreground">Only approved church personnel can manage sermons, events and member submissions.</p>
          <Link href="/dashboard" className="site-btn site-btn-solid mt-8">Back to dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell flex min-h-screen flex-col">
    <AdminHeader />
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Admin</h1>
        <p className="mt-2 text-muted-foreground">Moderate submissions and publish teaching and events.</p>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="site-curved border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Pending testimonies ({testimonies?.length ?? 0})</h2>
            <div className="mt-5 flex flex-col gap-4">
              {testimonies?.map(t => (
                <div key={t.id} className="rounded-2xl bg-muted p-4">
                  <p className="text-sm">{t.content.slice(0, 160)}…</p>
                  <Button variant="outline" className="mt-3 rounded-full" onClick={() => approve("testimonies", t.id)}>Approve</Button>
                </div>
              ))}
              {!testimonies?.length && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
            </div>
          </div>

          <div className="site-curved border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Pending prayer requests ({prayers?.length ?? 0})</h2>
            <div className="mt-5 flex flex-col gap-4">
              {prayers?.map(p => (
                <div key={p.id} className="rounded-2xl bg-muted p-4">
                  <p className="text-sm">{p.content.slice(0, 160)}…</p>
                  <Button variant="outline" className="mt-3 rounded-full" onClick={() => approve("prayer_requests", p.id)}>Approve to wall</Button>
                </div>
              ))}
              {!prayers?.length && <p className="text-sm text-muted-foreground">Nothing to review.</p>}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <form onSubmit={saveSermon} className="site-curved flex flex-col gap-4 border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Add a sermon</h2>
            <Input placeholder="Title" value={sermon.title} onChange={e => setSermon({ ...sermon, title: e.target.value })} required />
            <Input placeholder="Speaker" value={sermon.speaker} onChange={e => setSermon({ ...sermon, speaker: e.target.value })} required />
            <Input type="url" placeholder="Video URL" value={sermon.videoUrl} onChange={e => setSermon({ ...sermon, videoUrl: e.target.value })} required />
            <Textarea placeholder="AI or written summary (optional)" value={sermon.summary} onChange={e => setSermon({ ...sermon, summary: e.target.value })} />
            <Button type="submit" className="site-btn site-btn-solid">Publish sermon</Button>
          </form>

          <form onSubmit={saveEvent} className="site-curved flex flex-col gap-4 border border-border bg-card p-7">
            <h2 className="text-xl font-bold">Add an event</h2>
            <Input placeholder="Title" value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} required />
            <Textarea placeholder="Description" value={event.description} onChange={e => setEvent({ ...event, description: e.target.value })} required />
            <Input type="datetime-local" value={event.startTime} onChange={e => setEvent({ ...event, startTime: e.target.value })} required />
            <Input type="datetime-local" value={event.endTime} onChange={e => setEvent({ ...event, endTime: e.target.value })} required />
            <Input placeholder="Location" value={event.location} onChange={e => setEvent({ ...event, location: e.target.value })} required />
            <Button type="submit" className="site-btn site-btn-solid">Publish event</Button>
          </form>
        </section>
      </div>
    </main>
    </div>
  );
}
