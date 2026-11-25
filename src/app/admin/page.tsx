"use client";

import { useState } from "react";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { addDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VosemLogoIcon } from "@/components/icons";
import CrudTable, { type AdminColumn } from "@/components/admin/crud-table";

const tabs = ["Overview", "Sermons", "Events", "Testimonies", "Prayer requests", "Users", "Admins", "Activity"] as const;
type Tab = typeof tabs[number];

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
  const [tab, setTab] = useState<Tab>("Overview");
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", speaker: "", videoUrl: "", summary: "", description: "", startTime: "", endTime: "", location: "", email: "", role: "admin", uid: "" });

  const roleRef = useMemoFirebase(() => (user ? doc(firestore, "admins", user.uid) : null), [user, firestore]);
  const { data: role } = useDoc<{ role: string }>(roleRef);
  const isAdmin = role?.role === "admin" || role?.role === "moderator";

  const col = (name: string) => useMemoFirebase(() => firestore ? query(collection(firestore, name), orderBy("__name__")) : null, [firestore, name]);
  const sermons = useCollection<any>(col("sermons"));
  const events = useCollection<any>(col("events"));
  const testimonies = useCollection<any>(col("testimonies"));
  const prayers = useCollection<any>(col("prayer_requests"));
  const users = useCollection<any>(col("users"));
  const admins = useCollection<any>(col("admins"));
  const logs = useCollection<any>(useMemoFirebase(() => firestore ? query(collection(firestore, "audit_logs"), orderBy("createdAt", "desc")) : null, [firestore]));

  const log = (action: string, target: string) => {
    if (!user || !firestore) return;
    addDocumentNonBlocking(collection(firestore, "audit_logs"), { actorId: user.uid, actor: user.email, action, target, createdAt: serverTimestamp() });
  };

  const openForm = (kind: "sermon" | "event" | "admin", row?: any) => {
    setEditing({ kind, id: row?.id });
    setForm(row ? {
      title: row.title || "", speaker: row.speaker || "", videoUrl: row.videoUrl || "",
      summary: row.summary || "", description: row.description || "",
      startTime: row.startTime ? new Date(row.startTime).toISOString().slice(0, 16) : "",
      endTime: row.endTime ? new Date(row.endTime).toISOString().slice(0, 16) : "",
      location: row.location || "", email: row.email || "", role: row.role || "admin", uid: row.id || "",
    } : { title: "", speaker: "", videoUrl: "", summary: "", description: "", startTime: "", endTime: "", location: "", email: "", role: "admin", uid: "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !editing) return;
    try {
      if (editing.kind === "sermon") {
        const data = { title: form.title, speaker: form.speaker, videoUrl: form.videoUrl, summary: form.summary, updatedAt: serverTimestamp() };
        if (editing.id) await updateDoc(doc(firestore, "sermons", editing.id), data);
        else await addDoc(collection(firestore, "sermons"), { ...data, date: serverTimestamp() });
      } else if (editing.kind === "event") {
        const data = {
          title: form.title, description: form.description, location: form.location,
          startTime: new Date(form.startTime).toISOString(), endTime: new Date(form.endTime).toISOString(), updatedAt: serverTimestamp(),
        };
        if (editing.id) await updateDoc(doc(firestore, "events", editing.id), data);
        else await addDoc(collection(firestore, "events"), data);
      } else {
        await setDoc(doc(firestore, "admins", form.uid.trim()), { email: form.email.trim(), role: form.role, createdAt: serverTimestamp() }, { merge: true });
      }
      log(editing.id ? "updated" : "created", `${editing.kind}: ${form.title || form.email}`);
      toast({ title: "Saved", description: "Your changes have been saved." });
      setEditing(null);
    } catch {
      toast({ variant: "destructive", title: "Could not save", description: "Please check the details and try again." });
    }
  };

  const approve = async (collectionName: string, id: string) => {
    await updateDoc(doc(firestore, collectionName, id), { approved: true, reviewedAt: serverTimestamp(), reviewedBy: user?.uid });
    log("approved", `${collectionName}: ${id}`);
    toast({ title: "Approved", description: "Now visible to the church family." });
  };

  const remove = async (collectionName: string, id: string) => {
    await deleteDoc(doc(firestore, collectionName, id));
    log("deleted", `${collectionName}: ${id}`);
    toast({ title: "Deleted", description: "The record was removed." });
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

  const data = (rows: any[] | null) => (rows ?? []).map(r => ({ ...r, id: r.id }));
  const sermonCols: AdminColumn<any>[] = [
    { key: "title", label: "Title" },
    { key: "speaker", label: "Speaker" },
    { key: "summary", label: "Summary", render: r => <span className="line-clamp-1 text-muted-foreground">{r.summary || "—"}</span> },
  ];
  const eventCols: AdminColumn<any>[] = [
    { key: "title", label: "Title" },
    { key: "location", label: "Location" },
    { key: "startTime", label: "Starts", value: r => new Date(r.startTime).getTime(), render: r => <span className="text-muted-foreground">{new Date(r.startTime).toLocaleDateString()}</span> },
  ];
  const moderationCols = (collectionName: string): AdminColumn<any>[] => [
    { key: "author", label: "Author" },
    { key: "content", label: "Content", render: r => <span className="line-clamp-1 text-muted-foreground">{r.content}</span> },
    { key: "approved", label: "Status", render: r => <span className="app-status bg-primary/10 text-primary">{r.approved ? "Approved" : "Pending"}</span> },
    { key: "action", label: "Action", render: r => r.approved ? <span className="text-muted-foreground">Done</span> : (
      <Button variant="outline" className="rounded-xl" onClick={() => approve(collectionName, r.id)}>Approve</Button>
    ) },
  ];
  const userCols: AdminColumn<any>[] = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "whatsappNumber", label: "WhatsApp" },
  ];
  const adminCols: AdminColumn<any>[] = [
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: r => <span className="app-status bg-primary/10 text-primary">{r.role}</span> },
  ];
  const logCols: AdminColumn<any>[] = [
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "actor", label: "By" },
  ];

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-grow px-5 py-10 sm:px-10 md:px-24">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-black sm:text-4xl">Admin</h1>
          <p className="mt-2 text-muted-foreground">Manage teaching, events, submissions, members and administrators.</p>

          <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {tab === "Overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Sermons", value: data(sermons.data).length },
                    { label: "Events", value: data(events.data).length },
                    { label: "Members", value: data(users.data).length },
                    { label: "Pending submissions", value: data(testimonies.data).filter(r => !r.approved).length + data(prayers.data).filter(r => !r.approved).length },
                  ].map(s => (
                    <div key={s.label} className="site-curved border border-border bg-card p-6">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                      <p className="mt-2 text-3xl font-black">{s.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Use the tabs above to create, edit and delete records. Every action is written to the Activity log.</p>
              </>
            )}

            {tab === "Sermons" && (
              <>
                <Button className="site-btn site-btn-solid w-fit" onClick={() => openForm("sermon")}>Add sermon</Button>
                <CrudTable rows={data(sermons.data)} columns={sermonCols} loading={sermons.isLoading} onEdit={r => openForm("sermon", r)} onDelete={r => remove("sermons", r.id)} emptyLabel="No sermons yet." />
              </>
            )}

            {tab === "Events" && (
              <>
                <Button className="site-btn site-btn-solid w-fit" onClick={() => openForm("event")}>Add event</Button>
                <CrudTable rows={data(events.data)} columns={eventCols} loading={events.isLoading} onEdit={r => openForm("event", r)} onDelete={r => remove("events", r.id)} emptyLabel="No events yet." />
              </>
            )}

            {tab === "Testimonies" && (
              <CrudTable rows={data(testimonies.data)} columns={moderationCols("testimonies")} loading={testimonies.isLoading} onDelete={r => remove("testimonies", r.id)} emptyLabel="No testimonies yet." />
            )}

            {tab === "Prayer requests" && (
              <CrudTable rows={data(prayers.data)} columns={moderationCols("prayer_requests")} loading={prayers.isLoading} onDelete={r => remove("prayer_requests", r.id)} emptyLabel="No prayer requests yet." />
            )}

            {tab === "Users" && (
              <CrudTable rows={data(users.data)} columns={userCols} loading={users.isLoading} emptyLabel="No members yet." searchPlaceholder="Search members" />
            )}

            {tab === "Admins" && (
              <>
                <Button className="site-btn site-btn-solid w-fit" onClick={() => openForm("admin")}>Add admin</Button>
                <CrudTable rows={data(admins.data)} columns={adminCols} loading={admins.isLoading} onEdit={r => openForm("admin", r)} onDelete={r => remove("admins", r.id)} emptyLabel="No admins yet." />
              </>
            )}

            {tab === "Activity" && (
              <CrudTable rows={data(logs.data)} columns={logCols} loading={logs.isLoading} emptyLabel="No activity yet." searchPlaceholder="Search activity" />
            )}
          </div>
        </div>
      </main>

      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent aria-describedby="admin-form-description">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Add"} {editing?.kind}</DialogTitle>
            <DialogDescription id="admin-form-description">Changes are saved to the church database immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {editing?.kind === "admin" ? (
              <>
                <Input placeholder="User ID (uid)" value={form.uid} disabled={!!editing.id} onChange={e => setForm({ ...form, uid: e.target.value })} required />
                <Input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                <Input placeholder="Role (admin or moderator)" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required />
              </>
            ) : editing?.kind === "event" ? (
              <>
                <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <Textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                <Input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                <Input type="datetime-local" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required />
                <Input type="datetime-local" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required />
              </>
            ) : (
              <>
                <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                <Input placeholder="Speaker" value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} required />
                <Input placeholder="Video URL" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} required />
                <Textarea placeholder="Summary" value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} />
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" className="site-btn site-btn-solid">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
