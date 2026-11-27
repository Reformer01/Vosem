"use client";

import { useMachine } from "@/machines/use-machine";
import { testimonyDialogMachine } from "@/machines/app.machine";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import * as z from "zod";
import { useFirestore, useUser } from "@/firebase";
import { testimonySubmissionMachine } from "@/machines/content.machine";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ScriptureQuote from "./scripture-quote";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  content: z.string().min(20, "Your testimony must be at least 20 characters.").max(1000, "Please keep it under 1000 characters."),
});

const testimonies = [
  { text: "I found a family here when I felt most alone. The love I've experienced at VOSEM has completely restored my faith.", name: "Chidinma O.", context: "Lagos Campus", image: "/images/testimony-woman.jpg" },
  { text: "The youth ministry at VOSEM gave me direction. I'm now a purposeful leader.", name: "Emmanuel K.", context: null, image: "/images/events-youth.jpg" },
  { text: "Walking into VOSEM felt like coming home. The teaching is practical and life-changing.", name: "Sarah J.", context: null, image: "/images/about-family.jpg" },
  { text: "I was struggling for years. The business network at VOSEM helped me land my dream job. God is faithful!", name: "Tunde B.", context: "Entrepreneurs Forum", image: "/images/testimony-man.jpg" },
];

export default function TestimoniesSection() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [dialogState, sendDialog] = useMachine(testimonyDialogMachine);
  const open = dialogState === "open";
  const setOpen = (next: boolean) => sendDialog(next ? "OPEN" : "CLOSE");
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { content: "" } });
  const [submitState, sendSubmit] = useMachine(testimonySubmissionMachine);

  const submit = async (values: z.infer<typeof schema>) => {
    if (!user || submitState === "submitting") return;
    sendSubmit("SUBMIT");
    try {
      await addDoc(collection(firestore, "testimonies"), {
        author: user.displayName || "Anonymous",
        authorId: user.uid,
        content: values.content,
        date: serverTimestamp(),
        approved: false,
      });
      sendSubmit("SUCCESS");
      toast({ title: "Testimony submitted!", description: "Your testimony has been received." });
      form.reset();
      setOpen(false);
    } catch {
      sendSubmit("FAILURE");
      toast({ variant: "destructive", title: "Could not submit", description: "Please try again shortly." });
    }
  };

  return (
    <section className="bg-card py-20 sm:py-28" id="testimonies">
      <div className="site-wrap">
        <ScriptureQuote
          text="They overcame him by the blood of the Lamb and by the word of their testimony."
          reference="Revelation 12:11"
        />
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="site-eyebrow">Voices of VOSEM</span>
          <h2 className="font-display text-4xl italic sm:text-6xl">Testimonies of Grace</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Discover how God is writing new chapters of victory in the lives of the VOSEM INT&apos;L family.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonies.map((item) => (
            <figure key={item.name} className="site-curved relative flex min-h-[380px] flex-col justify-end overflow-hidden bg-[#282b37] p-7 text-white">
              <Image src={item.image} alt={item.name} fill className="object-cover opacity-60" sizes="(max-width: 768px) 100vw, 25vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#282b37] via-[#282b37]/60 to-transparent" />
              <blockquote className="relative z-10 text-lg font-medium italic leading-relaxed">&ldquo;{item.text}&rdquo;</blockquote>
              <figcaption className="relative z-10 mt-6 border-t border-white/25 pt-5">
                <span className="block font-bold">{item.name}</span>
                {item.context && <span className="mt-1 block text-xs font-black uppercase tracking-widest text-[#f3a6c6]">{item.context}</span>}
              </figcaption>
            </figure>
          ))}
        </div>

        {user && (
          <div className="mt-12 text-center">
            <Button onClick={() => setOpen(true)} className="site-btn site-btn-solid">Share your story</Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby="testimony-dialog-description">
          <DialogHeader>
            <DialogTitle>Share your testimony</DialogTitle>
            <DialogDescription id="testimony-dialog-description">Let your story of faith inspire others.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <Textarea {...form.register("content")} placeholder="Tell us what God has done for you..." className="min-h-36" />
            {form.formState.errors.content && (
              <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitState === "submitting"} className="site-btn site-btn-solid">{submitState === "submitting" ? "Submitting..." : "Submit"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
