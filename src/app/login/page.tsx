
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, useFirestore } from '@/firebase';
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
import { VosemLogoIcon, GoogleIcon, FacebookIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { User, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, UserCredential } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

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
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);


  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      setAuthError("Invalid credentials. Please check your email and password.");
    }
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }
  
  const handleSocialSignIn = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    if (user && firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (!docSnap.exists()) {
            const userProfile = {
                uid: user.uid,
                name: user.displayName || user.email,
                email: user.email,
                createdAt: serverTimestamp(),
                whatsappNumber: user.phoneNumber || ''
            };
            await setDoc(userDocRef, userProfile);
        }
        router.push('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential);
    } catch (error: any) {
      console.error(error);
      setAuthError("Could not sign in with Google. Please try again later.");
    }
  };

  const handleFacebookSignIn = async () => {
    setAuthError(null);
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      await handleSocialSignIn(userCredential);
    } catch (error: any) {
      console.error(error);
      setAuthError("Could not sign in with Facebook. Please try again later.");
    }
  };

  return (
    <div className="bg-background text-white font-sans min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <main className="relative z-10 flex-grow flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-[520px] glass-card rounded-2xl p-8 sm:p-10 shadow-2xl">
                <div className="mb-8 text-center">
                    <Link href="/" className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                         <VosemLogoIcon className="size-8" />
                    </Link>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground text-base">Please sign in to access your member portal.</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                                            placeholder="name@vosem.com"
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
                                                placeholder="••••••••"
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

                        <div className="flex justify-end -mt-2">
                            <a className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors" href="#">Forgot Password?</a>
                        </div>
                        
                        {authError && (
                          <p className="text-sm text-red-500 text-center">{authError}</p>
                        )}
                        
                        <Button type="submit" className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-[#d620d6] text-white font-bold h-12 mt-4 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(238,43,238,0.3)] hover:shadow-[0_0_25px_rgba(238,43,238,0.5)]">
                            Sign In
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </Button>

                         <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-card px-2 text-xs text-muted-foreground uppercase">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button type="button" onClick={handleGoogleSignIn} variant="outline" className="flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border-white/10 text-white text-sm font-medium h-10 transition-all">
                                <GoogleIcon className="w-5 h-5" />
                                Google
                            </Button>
                            <Button type="button" onClick={handleFacebookSignIn} variant="outline" className="flex items-center justify-center gap-2 rounded-lg bg-white/5 hover:bg-white/10 border-white/10 text-white text-sm font-medium h-10 transition-all">
                                <FacebookIcon className="w-5 h-5" />
                                Facebook
                            </Button>
                        </div>
                    </form>
                </Form>

                <div className="mt-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        Don't have an account? 
                        <Link className="text-primary font-semibold hover:text-white hover:underline transition-colors ml-1" href="/signup">Sign up</Link>
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
