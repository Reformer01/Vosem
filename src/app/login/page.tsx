'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase-config-check';
import { startSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) router.push('/dashboard');
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    if (!isFirebaseConfigured()) {
      const message = 'Sign-in is not configured on this deployment. Please contact the church office.';
      setAuthError(message);
      toast({ variant: 'destructive', title: 'Unable to sign in', description: message });
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await startSession(firestore, credential.user);
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'
        ? 'That email and password do not match. Please try again.'
        : 'We could not sign you in just now. Please try again shortly.';
      setAuthError(message);
      toast({ variant: 'destructive', title: 'Sign-in failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || user) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 rounded-full border-4 border-dashed border-primary animate-spin" /></div>;
  }

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center">
      <Link href="/" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back to site
      </Link>
      <div className="app-card max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-foreground">Welcome Back</h1>
          <p className="mt-3 text-muted-foreground">Please sign in to access your member portal.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary/60" />
                      <Input
                        type="email"
                        placeholder="name@vosem.com"
                        {...field}
                        className="site-curved pl-12"
                      />
                    </div>
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
                  <FormLabel>Password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary/60" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          {...field}
                          className="site-curved pl-12 pr-12"
                        />
                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Need help signing in?</Link>
            </div>

            {authError && <p className="text-sm text-red-500">{authError}</p>}

            <Button type="submit" disabled={isSubmitting} className="site-btn site-btn-solid w-full py-4">
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
