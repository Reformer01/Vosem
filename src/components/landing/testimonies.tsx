
'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { testimonies } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useUser } from "@/firebase";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { addDocumentNonBlocking, useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const testimonySchema = z.object({
  content: z.string().min(20, { message: 'Testimony must be at least 20 characters long.'}).max(1000, { message: 'Testimony must be less than 1000 characters.' }),
});


const TestimonyCard = ({ testimony, className = "" }: { testimony: (typeof testimonies)[0], className?: string }) => {
  const testimonyImage = PlaceHolderImages.find(img => img.id === testimony.imageId);
  return (
    <div className={`glass-panel relative rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-all duration-700 border-white/10 ${className}`}>
      {testimonyImage && (
        <Image
          alt={testimony.name}
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 ${testimony.imageClass}`}
          src={testimonyImage.imageUrl}
          fill
          data-ai-hint={testimonyImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent"></div>
      {testimony.blend_overlay && <div className="absolute inset-0 bg-primary/40 mix-blend-overlay"></div>}
      <div className={`relative z-10 p-8 flex flex-col h-full ${testimony.style}`}>
        {testimony.quote_mark && <span className="text-7xl text-accent/50 font-headline absolute top-8 right-8">"</span>}
        <p className={`text-white italic ${testimony.text_size}`}>
          {testimony.text}
        </p>
        <div className={testimony.author_style}>
          <h4 className="text-white font-bold text-xl">{testimony.name}</h4>
          {testimony.context && <p className="text-accent text-xs font-black uppercase tracking-widest mt-1">{testimony.context}</p>}
        </div>
      </div>
    </div>
  );
};

export default function Testimonies() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(testimonySchema),
    defaultValues: {
      content: ''
    }
  });

  const onSubmit = (values: z.infer<typeof testimonySchema>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to share a testimony.",
      });
      return;
    }
    
    const testimonyData = {
      author: user.displayName || 'Anonymous',
      authorId: user.uid,
      content: values.content,
      date: serverTimestamp(),
      approved: false,
    };
    
    const testimoniesColRef = collection(firestore, 'testimonies');
    addDocumentNonBlocking(testimoniesColRef, testimonyData);

    toast({
      title: "Testimony Submitted!",
      description: "Thank you for sharing your story. It will be reviewed by our team.",
    });

    form.reset();
    setIsModalOpen(false);
  }

  return (
    <section className="py-32 relative bg-primary overflow-hidden" id="testimonies">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="glass-panel border-white/10 dark:bg-[#141414]/80 text-white">
          <DialogHeader>
            <DialogTitle>Share Your Testimony</DialogTitle>
            <DialogDescription>
              Let your story of faith inspire others.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Textarea
                  {...form.register('content')}
                  placeholder="Tell us what God has done for you..."
                  className="min-h-[150px] bg-white/5 border-white/20"
              />
              {form.formState.errors.content && (
                  <p className="text-sm text-red-400">{form.formState.errors.content.message}</p>
              )}
              <div className="flex justify-end gap-4">
                  <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-accent">Submit</Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>


      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-primary/80 dark:bg-primary-dark/50 rounded-full mix-blend-screen filter blur-[150px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-accent/40 rounded-full mix-blend-screen filter blur-[120px]"></div>
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <span className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-xs uppercase tracking-[0.3em] mb-6">
            Voices of VOSEM
          </span>
          <h2 className="text-5xl md:text-7xl font-headline italic text-white mb-8">Testimonies of Grace</h2>
          <p className="text-purple-100 max-w-2xl mx-auto text-xl leading-relaxed font-light">
            Discover how God is writing new chapters of victory in the lives of the VOSEM INT'L family.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TestimonyCard testimony={testimonies[0]} className="h-[500px]" />
          <div className="space-y-6">
            <TestimonyCard testimony={testimonies[1]} className="h-[240px]" />
            <TestimonyCard testimony={testimonies[2]} className="h-[240px]" />
          </div>
          <TestimonyCard testimony={testimonies[3]} className="h-[500px]" />
        </div>
        <div className="mt-20 text-center">
            {user ? (
                <Button onClick={() => setIsModalOpen(true)} className="glass-btn px-12 py-5 rounded-full text-white font-black text-lg border-2 border-white/40 hover:bg-white hover:text-accent hover:border-white shadow-2xl uppercase tracking-widest">
                    Share Your Story
                </Button>
            ) : (
                <Button asChild className="glass-btn px-12 py-5 rounded-full text-white font-black text-lg border-2 border-white/40 hover:bg-white hover:text-accent hover:border-white shadow-2xl uppercase tracking-widest">
                    <Link href="/login">Login to Share Your Story</Link>
                </Button>
            )}
        </div>
      </div>
    </section>
  );
}
