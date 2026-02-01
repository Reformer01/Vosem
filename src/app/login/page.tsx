
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setAuthError(null);
    initiateEmailSignIn(auth, values.email, values.password);
    // Non-blocking, so we don't handle the redirect here.
    // The useUser effect and onAuthStateChanged will handle it.
    // We can listen for errors via an error emitter if needed, but for now we'll rely on the main listener
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
            Welcome Back
          </h1>
          <p className="mt-2 text-white/60">
            Sign in to access your member dashboard.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                Sign In
              </Button>
            </form>
          </Form>
        </div>
        <p className="mt-8 text-center text-sm text-white/60">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
