
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Auth, getAuth } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useUser, setDocumentNonBlocking, useFirestore } from '@/firebase';
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
import { onAuthStateChanged, User } from 'firebase/auth';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = getAuth();
  const { user, isUserLoading } = useUser();

  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (newUser) => {
      if (newUser && form.formState.isSubmitting) {
        const { name, email } = form.getValues();
        const userProfile = {
          uid: newUser.uid,
          name,
          email,
          createdAt: serverTimestamp(),
        };
        const userDocRef = doc(firestore, 'users', newUser.uid);
        setDocumentNonBlocking(userDocRef, userProfile, { merge: false });
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [auth, firestore, router, form]);


  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    setAuthError(null);
    try {
      // We are purposefully not awaiting this. The onAuthStateChanged listener will handle profile creation.
      auth.createUserWithEmailAndPassword(values.email, values.password);
    } catch (error: any) {
      setAuthError(error.message);
    }
  };
  
  if (isUserLoading || user) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background-dark">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-accent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background-dark p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <VosemLogoIcon className="h-12 w-12 text-accent" />
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white tracking-tight">
            Create an Account
          </h1>
          <p className="mt-2 text-white/60">
            Join the VOSEM INT'L family today.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-lg"
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
                  <FormItem>
                    <FormLabel className="text-white/80">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        {...field}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-lg"
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
                  <FormItem>
                    <FormLabel className="text-white/80">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {authError && (
                <p className="text-sm text-red-500">{authError}</p>
              )}
              <Button type="submit" className="w-full bg-accent h-12 rounded-lg font-bold text-white hover:bg-accent/90">
                Create Account
              </Button>
            </form>
          </Form>
        </div>

        <p className="mt-8 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
