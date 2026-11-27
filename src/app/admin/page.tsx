"use client";
import LoadingDove from "@/components/site/loading-dove";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { addDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { VosemLogoIcon } from "@/components/icons";
import { useSessionGuard } from "@/lib/session";
import { useMembershipGuard } from "@/lib/membership";
import { useMachine } from "@/machines/use-machine";
import { adminMachine, adminCrudMachine, dashboardMenuMachine } from "@/machines/app.machine";
import CrudTable, { type AdminColumn } from "@/components/admin/crud-table";
import RsvpCount from "@/components/admin/rsvp-count";
import { downloadCsv, formatNaira } from "@/lib/csv";
import { ADMIN_ROLES, roleLabel } from "@/lib/roles";
import {
  Activity, BarChart3, BookOpen, CalendarDays, Heart, HeartHandshake, LayoutDashboard,
  MessageCircle, MoreHorizontal, ShieldCheck, Users,
} from "lucide-react";

const tabs = ["Overview", "Sermons", "Events", "Giving", "Testimonies", "Prayer requests", "Users", "Admins", "Reports", "Activity"] as const;
type Tab = typeof tabs[number];

const tabIcons: Record<Tab, typeof LayoutDashboard> = {
  Overview: LayoutDashboard,
  Sermons: BookOpen,
  Events: CalendarDays,
  Giving: HeartHandshake,
  Testimonies: MessageCircle,
  "Prayer requests": Heart,
  Users: Users,
  Admins: ShieldCheck,
  Reports: BarChart3,
  Activity: Activity,
};
const bottomTabs: Tab[] = ["Overview", "Sermons", "Events", "Giving"];

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
  const sessionStatus = useSessionGuard(!!user);
  useMembershipGuard(sessionStatus === 'valid');
  const { toast } = useToast();
  const [tab, setTabState] = useState<Tab>("Overview");
  const [menuState, sendMenu] = useMachine(dashboardMenuMachine);
  const isMoreOpen = menuState === "open";
  const setIsMoreOpen = (next: boolean) => sendMenu(next ? "OPEN" : "CLOSE");

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("tab") as Tab | null;
    if (requested && (tabs as readonly string[]).includes(requested)) setTabState(requested);
  }, []);

  const selectTab = (next: Tab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === "Overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  };

  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: "", speaker: "", videoUrl: "", summary: "", description: "", startTime: "", endTime: "", location: "", email: "", role: "moderator", uid: "" });

  const roleRef = useMemoFirebase(() => (user ? doc(firestore, "admins", user.uid) : null), [user, firestore]);
  const { data: role } = useDoc<{ role: string }>(roleRef);
  const isAdmin = role?.role === "admin" || role?.role === "moderator";
  const isFullAdmin = role?.role === "admin";
  const [gateState, sendGate] = useMachine(adminMachine);
  const [crudState, sendCrud] = useMachine(adminCrudMachine);
  const isBusy = crudState === "saving" || crudState === "deleting";

  useEffect(() => {
    if (!user || sessionStatus !== "valid") {
      sendGate("SIGN_OUT");
      return;
    }
    sendGate("USER_READY");
    sendGate(isAdmin ? "ROLE_ADMIN" : "ROLE_OTHER");
  }, [user, sessionStatus, isAdmin, sendGate]);

  const col = (name: string) => useMemoFirebase(() => firestore ? query(collection(firestore, name), orderBy("__name__")) : null, [firestore, name]);
  const sermons = useCollection<any>(col("sermons"));
  const events = useCollection<any>(col("events"));
  const testimonies = useCollection<any>(col("testimonies"));
  const prayers = useCollection<any>(col("prayer_requests"));
  const users = useCollection<any>(col("users"));
  const admins = useCollection<any>(col("admins"));
  const logs = useCollection<any>(useMemoFirebase(() => firestore ? query(collection(firestore, "audit_logs"), orderBy("createdAt", "desc")) : null, [firestore]));
  const donations = useCollection<any>(useMemoFirebase(() => firestore ? query(collection(firestore, "donations"), orderBy("createdAt", "desc")) : null, [firestore]));

  const log = (action: string, target: string) => {
    if (!user || !firestore) return;
    addDocumentNonBlocking(collection(firestore, "audit_logs"), { actorId: user.uid, actor: user.email, action, target, createdAt: serverTimestamp() });
  };

  const memberSuggestions = (users.data ?? [])
    .filter(member => !form.uid && form.email.trim().length >= 2 && (
      String(member.email || "").toLowerCase().includes(form.email.trim().toLowerCase())
      || String(member.name || "").toLowerCase().includes(form.email.trim().toLowerCase())
    ))
    .slice(0, 5);

  const openForm = (kind: "sermon" | "event" | "admin", row?: any) => {
    setEditing({ kind, id: row?.id });
    setForm(row ? {
      title: row.title || "", speaker: row.speaker || "", videoUrl: row.videoUrl || "",
      summary: row.summary || "", description: row.description || "",
      startTime: row.startTime ? new Date(row.startTime).toISOString().slice(0, 16) : "",
      endTime: row.endTime ? new Date(row.endTime).toISOString().slice(0, 16) : "",
      location: row.location || "", email: row.email || "", role: row.role || "moderator", uid: row.id || "",
    } : { title: "", speaker: "", videoUrl: "", summary: "", description: "", startTime: "", endTime: "", location: "", email: "", role: "moderator", uid: "" });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || !editing || isBusy) return;
    if (editing.kind === "admin" && !isFullAdmin) {
      toast({ variant: "destructive", title: "Admin access required", description: "Only full administrators can manage admin roles." });
      return;
    }
    sendCrud("SUBMIT");
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
        const targetUid = form.uid.trim() || memberSuggestions[0]?.id;
        if (!targetUid) {
          throw new Error("Choose a church member or enter a user ID.");
        }
        if (targetUid === user.uid && form.role !== "admin") {
          throw new Error("You cannot remove your own administrator access.");
        }
        await setDoc(doc(firestore, "admins", targetUid), {
          email: form.email.trim() || memberSuggestions[0]?.email || "",
          role: form.role,
          createdAt: serverTimestamp(),
        }, { merge: true });
      }
      log(editing.id ? "updated" : "created", `${editing.kind}: ${form.title || form.email}`);
      toast({ title: "Saved", description: "Your changes have been saved." });
      sendCrud("SUCCESS");
      setEditing(null);
    } catch (error) {
      sendCrud("FAILURE");
      toast({ variant: "destructive", title: "Could not save", description: error instanceof Error ? error.message : "Please check the details and try again." });
    }
  };

  const approve = async (collectionName: string, id: string) => {
    if (isBusy) return;
    sendCrud("SUBMIT");
    try {
      await updateDoc(doc(firestore, collectionName, id), { approved: true });
      log("approved", `${collectionName}: ${id}`);
      toast({ title: "Approved", description: "Now visible to the church family." });
      sendCrud("SUCCESS");
    } catch {
      sendCrud("FAILURE");
      toast({ variant: "destructive", title: "Could not approve", description: "Please check your permissions and try again." });
    }
  };

  const remove = async (collectionName: string, id: string) => {
    if (isBusy) return;
    sendCrud("DELETE");
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      log("deleted", `${collectionName}: ${id}`);
      toast({ title: "Deleted", description: "The record was removed." });
      sendCrud("SUCCESS");
    } catch {
      sendCrud("FAILURE");
      toast({ variant: "destructive", title: "Could not delete", description: "Please check your permissions and try again." });
    }
  };

  const removeUser = async (row: any) => {
    if (row.id === user?.uid) {
      toast({ variant: "destructive", title: "Cannot delete your own account", description: "Ask another administrator to remove you." });
      return;
    }
    await remove("users", row.id);
  };

  if (user && sessionStatus === 'checking') {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <LoadingDove className="size-10" />
      </div>
    );
  }

  if (!user || sessionStatus !== 'valid' || gateState !== 'admin') {
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
    { key: "summary", label: "Summary", render: r => <span className="line-clamp-1 text-muted-foreground">{r.summary || "-"}</span> },
  ];
  const eventCols: AdminColumn<any>[] = [
    { key: "title", label: "Title" },
    { key: "location", label: "Location" },
    { key: "startTime", label: "Starts", value: r => new Date(r.startTime).getTime(), render: r => <span className="text-muted-foreground">{new Date(r.startTime).toLocaleDateString()}</span> },
    { key: "rsvps", label: "Going", value: () => 0, render: r => <RsvpCount eventId={r.id} /> },
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
    { key: "role", label: "Role", render: r => <span className="app-status bg-primary/10 text-primary">{roleLabel(r.role)}</span> },
  ];
  const logCols: AdminColumn<any>[] = [
    { key: "action", label: "Action" },
    { key: "target", label: "Target" },
    { key: "actor", label: "By" },
  ];
  const donationCols: AdminColumn<any>[] = [
    { key: "createdAt", label: "Date", value: r => r.createdAt?.toMillis?.() ?? 0, render: r => <span className="text-muted-foreground">{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : "-"}</span> },
    { key: "donorName", label: "Donor" },
    { key: "purpose", label: "Purpose" },
    { key: "amount", label: "Amount (₦)", value: r => (Number(r.amount) || 0) / 100, render: r => <span className="font-bold">{formatNaira(Number(r.amount) || 0)}</span> },
    { key: "gateway", label: "Gateway" },
    { key: "status", label: "Status", render: r => <span className="app-status bg-primary/10 text-primary">{r.status}</span> },
    { key: "reference", label: "Reference" },
  ];
  const gifts = data(donations.data);
  const succeeded = gifts.filter(r => r.status === "succeeded");
  const totalGiving = succeeded.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thisMonth = succeeded.filter(r => r.createdAt?.toMillis?.() >= monthStart.getTime()).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const byPurpose = Object.entries(succeeded.reduce((totals: Record<string, number>, r) => {
    const key = String(r.purpose || "Giving");
    totals[key] = (totals[key] || 0) + (Number(r.amount) || 0);
    return totals;
  }, {})).sort((a, b) => b[1] - a[1]);

  const reports = [
    { label: "Giving", count: gifts.length, filename: "vosem-giving.csv", rows: gifts, columns: [{ label: "Date", key: "createdAt" }, { label: "Donor", key: "donorName" }, { label: "Purpose", key: "purpose" }, { label: "Amount (kobo)", key: "amount" }, { label: "Gateway", key: "gateway" }, { label: "Status", key: "status" }, { label: "Reference", key: "reference" }] },
    { label: "Members", count: data(users.data).length, filename: "vosem-members.csv", rows: data(users.data), columns: [{ label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "WhatsApp", key: "whatsappNumber" }] },
    { label: "Events", count: data(events.data).length, filename: "vosem-events.csv", rows: data(events.data), columns: [{ label: "Title", key: "title" }, { label: "Location", key: "location" }, { label: "Starts", key: "startTime" }, { label: "Ends", key: "endTime" }] },
    { label: "Sermons", count: data(sermons.data).length, filename: "vosem-sermons.csv", rows: data(sermons.data), columns: [{ label: "Title", key: "title" }, { label: "Speaker", key: "speaker" }, { label: "Summary", key: "summary" }] },
    { label: "Testimonies", count: data(testimonies.data).length, filename: "vosem-testimonies.csv", rows: data(testimonies.data), columns: [{ label: "Author", key: "author" }, { label: "Content", key: "content" }, { label: "Approved", key: "approved" }] },
    { label: "Prayer requests", count: data(prayers.data).length, filename: "vosem-prayer-requests.csv", rows: data(prayers.data), columns: [{ label: "Author", key: "author" }, { label: "Content", key: "content" }, { label: "Anonymous", key: "isAnonymous" }, { label: "Approved", key: "approved" }] },
  ];

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <AdminHeader />
      <main className="flex-grow px-5 py-10 pb-24 sm:px-10 md:px-24 md:pb-10">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="text-3xl font-black sm:text-4xl">Admin</h1>
          <p className="mt-2 text-muted-foreground">Manage teaching, events, submissions, members and administrators.</p>
          {!isFullAdmin && <p className="mt-1 text-xs font-bold uppercase tracking-widest text-primary">Moderator view: approvals only</p>}

          <div className="mt-8 hidden flex-wrap gap-2 border-b border-border pb-3 md:flex">
            {tabs.map(t => (
              <button key={t} onClick={() => selectTab(t)} className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-8">
            {tab === "Overview" && (
              <>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Sermons", value: data(sermons.data).length },
                    { label: "Events", value: data(events.data).length },
                    { label: "Members", value: data(users.data).length },
                    { label: "Pending submissions", value: data(testimonies.data).filter(r => !r.approved).length + data(prayers.data).filter(r => !r.approved).length },
                    { label: "Giving this month", value: formatNaira(thisMonth) },
                    { label: "Total giving", value: formatNaira(totalGiving) },
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
                <CrudTable rows={data(sermons.data)} columns={sermonCols} loading={sermons.isLoading} onEdit={r => openForm("sermon", r)} onDelete={isFullAdmin ? r => remove("sermons", r.id) : undefined} emptyLabel="No sermons yet." exportFilename="vosem-sermons.csv" />
              </>
            )}

            {tab === "Events" && (
              <>
                <Button className="site-btn site-btn-solid w-fit" onClick={() => openForm("event")}>Add event</Button>
                <CrudTable rows={data(events.data)} columns={eventCols} loading={events.isLoading} onEdit={r => openForm("event", r)} onDelete={isFullAdmin ? r => remove("events", r.id) : undefined} emptyLabel="No events yet." exportFilename="vosem-events.csv" />
              </>
            )}

            {tab === "Giving" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Confirmed gifts", value: succeeded.length },
                    { label: "Total giving", value: formatNaira(totalGiving) },
                    { label: "This month", value: formatNaira(thisMonth) },
                  ].map(s => (
                    <div key={s.label} className="site-curved border border-border bg-card p-6">
                      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                      <p className="mt-2 text-3xl font-black">{s.value}</p>
                    </div>
                  ))}
                </div>
                {byPurpose.length > 0 && (
                  <div className="site-curved border border-border bg-card p-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">By purpose</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {byPurpose.map(([purpose, amount]) => (
                        <div key={purpose} className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 p-4 text-sm">
                          <span className="font-semibold">{purpose}</span>
                          <span className="font-black text-primary">{formatNaira(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <CrudTable rows={gifts} columns={donationCols} loading={donations.isLoading} exportFilename="vosem-giving.csv" emptyLabel="No gifts recorded yet." searchPlaceholder="Search gifts" />
              </>
            )}

            {tab === "Testimonies" && (
              <CrudTable rows={data(testimonies.data)} columns={moderationCols("testimonies")} loading={testimonies.isLoading} onDelete={isFullAdmin ? r => remove("testimonies", r.id) : undefined} emptyLabel="No testimonies yet." exportFilename="vosem-testimonies.csv" />
            )}

            {tab === "Prayer requests" && (
              <CrudTable rows={data(prayers.data)} columns={moderationCols("prayer_requests")} loading={prayers.isLoading} onDelete={isFullAdmin ? r => remove("prayer_requests", r.id) : undefined} emptyLabel="No prayer requests yet." exportFilename="vosem-prayer-requests.csv" />
            )}

            {tab === "Users" && (
              <CrudTable rows={data(users.data)} columns={userCols} loading={users.isLoading} emptyLabel="No members yet." searchPlaceholder="Search members" exportFilename="vosem-members.csv" onDelete={isFullAdmin ? removeUser : undefined} />
            )}

            {tab === "Admins" && (
              <>
                {isFullAdmin && <Button className="site-btn site-btn-solid w-fit" onClick={() => openForm("admin")}>Add admin</Button>}
                <p className="text-sm text-muted-foreground">Pick a church member and assign a predefined role. Members receiving access should sign in once before appearing in the list.</p>
                <CrudTable rows={data(admins.data)} columns={adminCols} loading={admins.isLoading} onEdit={isFullAdmin ? r => openForm("admin", r) : undefined} onDelete={isFullAdmin ? r => {
                  if (r.id === user.uid) {
                    toast({ variant: "destructive", title: "Cannot remove your own access", description: "Ask another administrator to change your role." });
                    return;
                  }
                  return remove("admins", r.id);
                } : undefined} emptyLabel="No admins yet." exportFilename="vosem-admins.csv" />
              </>
            )}

            {tab === "Reports" && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map(report => (
                  <div key={report.label} className="site-curved flex flex-col border border-border bg-card p-6">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{report.label}</p>
                    <p className="mt-2 text-2xl font-black">{report.count}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Download all {report.label.toLowerCase()} records as CSV.</p>
                    <Button variant="outline" className="mt-5 w-fit rounded-xl" onClick={() => downloadCsv(report.filename,
                      report.columns.map(c => ({ label: c.label, value: (row: any) => row[c.key] })), report.rows)}>
                      Download CSV
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {tab === "Activity" && (
              <CrudTable rows={data(logs.data)} columns={logCols} loading={logs.isLoading} emptyLabel="No activity yet." searchPlaceholder="Search activity" exportFilename="vosem-activity.csv" />
            )}
          </div>
        </div>
      </main>

      <nav aria-label="Admin navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {bottomTabs.map(name => {
            const Icon = tabIcons[name];
            return (
              <button key={name} type="button" onClick={() => selectTab(name)}
                className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${tab === name ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
                <Icon className="size-5" aria-hidden="true" />
                {name}
              </button>
            );
          })}
          <button type="button" onClick={() => setIsMoreOpen(true)} aria-label="More admin tabs"
            className={`flex flex-col items-center gap-1 py-3 text-[11px] font-bold transition-colors ${isMoreOpen || !bottomTabs.includes(tab) ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
            <MoreHorizontal className="size-5" aria-hidden="true" />
            More
          </button>
        </div>
      </nav>

      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="left" className="flex flex-col bg-card p-0">
          <SheetHeader className="border-b border-border px-6 py-5 text-left">
            <SheetTitle className="flex items-center gap-2.5">
              <VosemLogoIcon className="size-7 text-primary" />
              <span className="text-lg font-black tracking-tighter">Admin <span className="text-primary">tabs</span></span>
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 px-4 py-6" aria-label="All admin tabs">
            {tabs.map(name => {
              const Icon = tabIcons[name];
              return (
                <SheetClose key={name} asChild>
                  <button type="button" onClick={() => selectTab(name)}
                    className={`flex items-center gap-4 rounded-2xl px-4 py-3.5 text-base font-bold transition-colors ${tab === name ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                    <Icon className="size-5" aria-hidden="true" />
                    {name}
                  </button>
                </SheetClose>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent aria-describedby="admin-form-description">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit" : "Add"} {editing?.kind}</DialogTitle>
            <DialogDescription id="admin-form-description">Changes are saved to the church database immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            {editing?.kind === "admin" ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Type a church member&apos;s name or email, then choose a role. You can enter a user ID instead if they are not listed.</p>
                <Input placeholder="Member name or email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value, uid: editing.id ? form.uid : "" })} />
                {!editing.id && memberSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {memberSuggestions.map(member => (
                      <button key={member.id} type="button"
                        onClick={() => setForm({ ...form, uid: member.id, email: member.email || form.email })}
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${form.uid === member.id ? "border-primary bg-primary text-white" : "border-border text-muted-foreground hover:bg-muted"}`}>
                        {member.name || member.email}
                      </button>
                    ))}
                  </div>
                )}
                {!editing.id && (
                  <Input placeholder="User ID (only if not listed above)" value={form.uid} onChange={e => setForm({ ...form, uid: e.target.value })} />
                )}
                <div className="grid gap-2 pt-2">
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Role</p>
                  {ADMIN_ROLES.map(role => (
                    <button key={role.value} type="button" onClick={() => setForm({ ...form, role: role.value })}
                      className={`rounded-xl border p-3 text-left transition-colors ${form.role === role.value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                      <p className="text-sm font-bold">{role.label}</p>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </button>
                  ))}
                </div>
              </div>
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
