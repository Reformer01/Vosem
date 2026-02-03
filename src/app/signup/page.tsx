'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { VosemLogoIcon } from '@/components/icons';
import { useEffect, useState } from 'react';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  whatsapp: z.string().optional(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = getAuth();
  const { user, isUserLoading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      whatsapp: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setAuthError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const userProfile: { [key: string]: any } = {
        uid: user.uid,
        name: values.name,
        email: values.email,
        createdAt: serverTimestamp(),
      };

      if (values.whatsapp) {
        userProfile.whatsappNumber = values.whatsapp;
      }
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, userProfile);

      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('This email address is already in use.');
      } else {
        setAuthError('An error occurred during signup. Please try again.');
      }
    }
  };

  
  if (isUserLoading || user) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-white font-sans min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <Link href="/" className="fixed top-8 left-4 md:left-8 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="hidden md:inline">Back to Home</span>
        </Link>

        <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[520px] glass-card rounded-2xl p-8 sm:p-10 shadow-2xl">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                        <VosemLogoIcon className="size-8" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Join the Family</h1>
                    <p className="text-muted-foreground text-base">Connect, grow, and worship with us.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-white text-sm font-medium flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                                      Full Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. John Doe"
                                            {...field}
                                            className="form-input w-full rounded-lg bg-input border-transparent focus:border-primary focus:ring-0 text-white placeholder:text-muted-foreground/50 h-12 px-4 transition-all hover:bg-input/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-white text-sm font-medium flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-[18px]">mail</span>
                                      Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="name@example.com"
                                            {...field}
                                            className="form-input w-full rounded-lg bg-input border-transparent focus:border-primary focus:ring-0 text-white placeholder:text-muted-foreground/50 h-12 px-4 transition-all hover:bg-input/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="whatsapp"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                    <FormLabel className="text-white text-sm font-medium flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                                      WhatsApp Number
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder="+1 (555) 000-0000"
                                            {...field}
                                            className="form-input w-full rounded-lg bg-input border-transparent focus:border-primary focus:ring-0 text-white placeholder:text-muted-foreground/50 h-12 px-4 transition-all hover:bg-input/80"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="flex flex-col gap-2">
                                     <FormLabel className="text-white text-sm font-medium flex items-center gap-2">
                                      <span className="material-symbols-outlined text-primary text-[18px]">lock</span>
                                      Password
                                    </FormLabel>
                                    <div className="relative">
                                        <FormControl>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Create a strong password"
                                                {...field}
                                                className="form-input w-full rounded-lg bg-input border-transparent focus:border-primary focus:ring-0 text-white placeholder:text-muted-foreground/50 h-12 px-4 pr-12 transition-all hover:bg-input/80"
                                            />
                                        </FormControl>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors" type="button">
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        {authError && (
                          <p className="text-sm text-red-500 text-center">{authError}</p>
                        )}
                        
                        <Button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d620d6] text-white font-bold h-12 mt-4 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(238,43,238,0.3)] hover:shadow-[0_0_25px_rgba(238,43,238,0.5)]">
                            Create Account
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </Button>
                    </form>
                </Form>

                <div className="mt-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        Already a member?
                        <Link className="text-primary font-semibold hover:text-white hover:underline transition-colors ml-1" href="/login">Login here</Link>
                    </p>
                </div>
            </div>
        </main>
        <footer className="relative z-10 w-full py-6 text-center text-white/30 text-xs">
            <p>© 2026 VOSEM INT'L. All rights reserved.</p>
        </footer>
    </div>
  );
}
