"use client";

import { useState } from "react";
import { collection, deleteDoc, doc, query, serverTimestamp, where } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Testimony {
  author: string;
  authorId: string;
  content: string;
  approved: boolean;
}

const schema = z.object({
  content: z.string().min(20, "Please write at least 20 characters.").max(1000, "Please keep it under 1000 characters."),
});

export default function MyTestimoniesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { content: "" },
  });

  const testimoniesQuery = useMemoFirebase(
    () => (user && firestore) ? query(collection(firestore, "testimonies"), where("authorId", "==", user.uid)) : null,
    [user, firestore]
  );
  const { data: testimonies, isLoading } = useCollection<Testimony>(testimoniesQuery);

  const submit = (values: z.infer<typeof schema>) => {
    if (!user || !firestore) return;
    addDocumentNonBlocking(collection(firestore, "testimonies"), {
      author: user.displayName || "Anonymous",
      authorId: user.uid,
      content: values.content.trim(),
      date: serverTimestamp(),
      approved: false,
    });
    toast({ title: "Testimony submitted", description: "Thank you for sharing. Our team will review it shortly." });
    form.reset();
    setOpen(false);
  };

  const remove = (id: string) => {
    deleteDoc(doc(firestore, "testimonies", id));
    toast({ title: "Testimony removed", description: "Your story has been deleted." });
  };

  return (
    <main className="flex-grow px-5 py-12 sm:px-10 md:px-40">
      <div className="w-full max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">My testimonies</h1>
            <p className="mt-2 text-muted-foreground">Stories you have shared with the VOSEM family and their review status.</p>
          </div>
          <Button className="site-btn site-btn-solid" onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Share a testimony
          </Button>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {!isLoading && (!testimonies || testimonies.length === 0) && (
            <div className="site-curved flex flex-col items-center gap-4 border border-border bg-card p-10 text-center">
              <p className="font-semibold">You haven&apos;t shared a story yet.</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Tell the church family what God has done for you. Your story will be reviewed before it appears publicly.
              </p>
              <Button className="site-btn site-btn-outline" onClick={() => setOpen(true)}>Share your story</Button>
            </div>
          )}
          {testimonies?.map((testimony) => (
            <article key={(testimony as any).id} className="site-curved flex flex-col gap-4 border border-border bg-card p-7 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className={`app-status ${testimony.approved ? "bg-green-500/10 text-green-700" : "bg-primary/10 text-primary"}`}>
                  {testimony.approved ? "Approved" : "Pending review"}
                </span>
                <p className="mt-4 leading-relaxed">{testimony.content}</p>
              </div>
              <Button variant="outline" size="icon" aria-label="Delete testimony" className="rounded-full" onClick={() => remove((testimony as any).id)}>
                <Trash2 className="size-4" />
              </Button>
            </article>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby="my-testimony-dialog-description">
          <DialogHeader>
            <DialogTitle>Share your testimony</DialogTitle>
            <DialogDescription id="my-testimony-dialog-description">Let your story of faith inspire others. Our team reviews every submission.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Textarea {...form.register("content")} placeholder="Tell us what God has done for you..." className="min-h-36" />
            {form.formState.errors.content && <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="site-btn site-btn-solid">Submit</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
