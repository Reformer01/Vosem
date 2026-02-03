'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/firebase';
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
import { useUser } from '@/firebase/provider';
import { signInWithEmailAndPassword } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
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
  

  return (
    <div className="bg-background text-white font-sans min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-primary/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <Link href="/" className="absolute top-8 left-4 md:left-8 z-20 flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="hidden md:inline">Back to Home</span>
        </Link>

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
