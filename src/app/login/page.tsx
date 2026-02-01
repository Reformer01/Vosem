
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth, initiateEmailSignIn } from '@/firebase';
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
    if (user && !isUserLoading) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setAuthError(null);
    initiateEmailSignIn(auth, values.email, values.password);
  };
  
  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-background text-white font-display min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-900/20 blur-[120px] pointer-events-none"></div>

        <div className="flex h-full grow flex-col items-center justify-center p-4 z-10">
            <div className="glass-card w-full max-w-[480px] rounded-xl flex flex-col p-8 sm:p-10 transition-all duration-300">
                <div className="flex flex-col items-center mb-8">
                    <Link href="/" className="mb-4 text-primary bg-white/5 p-3 rounded-full ring-1 ring-white/10">
                        <VosemLogoIcon className="size-8" />
                    </Link>
                    <h2 className="text-white text-xl font-bold tracking-[0.1em] uppercase mb-1">VOSEM INT'L</h2>
                    <h1 className="text-white tracking-tight text-[32px] font-bold leading-tight text-center">Welcome Back</h1>
                    <p className="text-gray-400 text-base font-normal leading-normal pt-2 text-center max-w-xs font-sans">
                        Please sign in to access your exclusive member portal.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 w-full">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-white text-sm font-medium leading-normal pb-2 font-sans">Email Address</FormLabel>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-4 text-gray-400 material-symbols-outlined text-[20px]">mail</span>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@vosem.com"
                                                {...field}
                                                className="form-input flex w-full min-w-0 resize-none rounded-lg text-white placeholder:text-gray-500 bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-4 text-base font-normal leading-normal font-sans transition-all duration-200"
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex justify-between items-center pb-2">
                                        <FormLabel className="text-white text-sm font-medium leading-normal font-sans">Password</FormLabel>
                                    </div>
                                    <div className="relative flex w-full items-center rounded-lg">
                                         <span className="absolute left-4 text-gray-400 material-symbols-outlined text-[20px]">lock</span>
                                        <FormControl>
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                {...field}
                                                className="form-input flex w-full min-w-0 flex-1 resize-none rounded-lg text-white placeholder:text-gray-500 bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary h-12 pl-12 pr-12 text-base font-normal leading-normal font-sans transition-all duration-200"
                                            />
                                        </FormControl>
                                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 bottom-0 px-4 flex items-center justify-center text-gray-400 hover:text-white transition-colors" type="button">
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                        </button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end -mt-1">
                            <a className="text-xs font-medium text-gray-400 hover:text-primary transition-colors font-sans" href="#">Forgot Password?</a>
                        </div>
                        
                        {authError && (
                          <p className="text-sm text-red-500">{authError}</p>
                        )}
                        
                        <Button type="submit" className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-4 bg-primary hover:bg-[#d926d9] text-white text-base font-bold leading-normal tracking-[0.015em] transition-colors shadow-[0_0_20px_rgba(238,43,238,0.3)] mt-2 font-sans">
                            <span className="truncate">Sign In</span>
                        </Button>
                    </form>
                </Form>

                <div className="flex items-center justify-center gap-2 pt-8 font-sans">
                    <p className="text-gray-400 text-sm">Don't have an account?</p>
                    <Link href="/signup" className="text-primary hover:text-[#ff4fff] text-sm font-bold leading-normal underline decoration-primary/30 underline-offset-4 hover:decoration-primary transition-all">Sign Up</Link>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-white/20 text-xs font-sans">© 2026 VOSEM INT'L. All rights reserved.</p>
            </div>
        </div>
    </div>
  );
}
