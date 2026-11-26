'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, MessageCircle, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase-config-check';
import { startSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  whatsapp: z.string().optional(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', whatsapp: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user) router.push('/dashboard');
  }, [user, isUserLoading, router]);

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!isFirebaseConfigured()) {
      const message = 'Registration is not configured on this deployment. Please contact the church office.';
      setAuthError(message);
      toast({ variant: 'destructive', title: 'Unable to create your account', description: message });
      return;
    }
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: values.name });

      const userProfile: Record<string, unknown> = {
        uid: newUser.uid,
        name: values.name,
        email: values.email,
        createdAt: serverTimestamp(),
      };
      if (values.whatsapp) userProfile.whatsappNumber = values.whatsapp;

      await setDoc(doc(firestore, 'users', newUser.uid), userProfile);
      try {
        await startSession(firestore, newUser);
      } catch (sessionError) {
        await signOut(auth);
        throw sessionError;
      }
      router.push('/dashboard');
    } catch (error: any) {
      const message = error.code === 'auth/email-already-in-use'
        ? 'This email already has an account. Try signing in instead.'
        : 'We could not create your account just now. Please try again shortly.';
      setAuthError(message);
      toast({ variant: 'destructive', title: 'Registration failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="app-shell flex min-h-screen items-center justify-center">
        <div className="size-10 animate-spin rounded-full border-4 border-dashed border-primary" />
      </div>
    );
  }

  const fields = [
    { name: "name" as const, label: "Full Name", placeholder: "e.g. John Doe", icon: User, type: "text" },
    { name: "email" as const, label: "Email Address", placeholder: "name@example.com", icon: Mail, type: "email" },
    { name: "whatsapp" as const, label: "WhatsApp Number (optional)", placeholder: "+234 800 000 0000", icon: MessageCircle, type: "tel" },
  ];

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center">
      <Link href="/" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back to site
      </Link>
      <div className="app-card max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tighter sm:text-4xl">Join the Family</h1>
          <p className="mt-3 text-muted-foreground">Connect, grow, and worship with VOSEM INT&apos;L.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {fields.map(({ name, label, placeholder, icon: Icon, type }) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Icon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-primary/60" />
                        <Input type={type} placeholder={placeholder} {...field} className="site-curved pl-12" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

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
                          placeholder="Create a strong password"
                          {...field}
                          className="site-curved pl-12 pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                        </button>
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authError && <p className="text-sm text-red-500">{authError}</p>}

            <Button type="submit" disabled={isSubmitting} className="site-btn site-btn-solid w-full py-4">
              {isSubmitting ? 'Creating Account...' : 'Create Account'} <ArrowRight className="size-4" />
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already a member? <Link href="/login" className="font-semibold text-primary hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}
