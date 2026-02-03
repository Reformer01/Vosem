
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from 'firebase/auth';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
}

export default function DashboardPage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [user, isAuthLoading, router]);

  const isUserLoading = isAuthLoading || (user && isProfileLoading);

  if (isUserLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background-dark">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }
  
  const handleDeleteAccount = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete account. User or database not available.",
      });
      return;
    }

    // Capture the user ID before any deletion, as the user object will become invalid.
    const userId = user.uid;

    try {
      // Step 1: Delete the user's document from Firestore.
      // This operation requires the user to be authenticated.
      const userDocRef = doc(firestore, 'users', userId);
      await deleteDoc(userDocRef);

      // Step 2: Delete the user's authentication record.
      // This will sign the user out.
      await deleteUser(user);

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been removed.",
      });
      
      router.push('/');

    } catch (error: any) {
      // Handle specific errors, like needing recent re-authentication
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "This is a sensitive action. Please sign out and sign back in before deleting your account.",
        });
      } else {
        // Generic error handler for other issues (e.g., network, Firestore rules failure on the doc delete)
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to delete your account. ${error.message}`,
        });
      }
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  const displayName = userProfile?.name || user.displayName || user.email;

  return (
    <div className="w-full flex justify-center py-8 md:py-12 px-6 md:px-10 lg:px-40">
        <div className="w-full max-w-6xl flex flex-col gap-10">
            {/* Welcome / Hero Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[#331133]">
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{displayName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-medium max-w-2xl">
                        Your generosity is making a global impact. Thank you for partnering with us.
                    </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                    <div className="text-right hidden md:block">
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sown Year-to-Date</span>
                        <div className="text-3xl font-bold text-white font-mono">$0.00</div>
                    </div>
                </div>
            </div>

            {/* Recurring Giving Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">autorenew</span>
                        Active Commitments
                    </h2>
                    <Link className="text-primary text-sm font-semibold hover:underline" href="#">View All Plans</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-5 rounded-xl flex items-center justify-center text-center text-slate-400">
                        <p>You have no active commitments. <br/>Set one up today to automate your giving!</p>
                    </div>
                    <div className="glass-panel p-5 rounded-xl flex items-center justify-center text-center text-slate-400">
                        <p>Your second commitment card could be here.</p>
                    </div>
                </div>
            </section>

            {/* Seed History Section */}
            <section className="flex flex-col gap-4">
                <div className="flex items-end justify-between">
                    <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">history_edu</span>
                        Seed History
                    </h2>
                    <div className="flex gap-2">
                        <Button variant="outline" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a101a] border border-[#331133] text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">filter_list</span>
                            Filter
                        </Button>
                        <Button variant="outline" className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a101a] border border-[#331133] text-xs font-medium text-slate-300 hover:text-white hover:border-primary/50 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            Export
                        </Button>
                    </div>
                </div>

                <div className="glass-panel rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#1a0a1a]/50 text-slate-400 text-xs uppercase tracking-wider border-b border-[#331133]">
                                    <th className="px-6 py-4 font-semibold">Date</th>
                                    <th className="px-6 py-4 font-semibold">Purpose</th>
                                    <th className="px-6 py-4 font-semibold">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-[#331133]">
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-400">
                                        You have no donation history yet. Your seeds will appear here.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                        <div className="px-6 py-4 border-t border-[#331133] bg-[#120a12]/50 flex justify-center">
                        <button className="text-sm text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors">
                            View Full History
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </section>

            <section className="border-t border-red-500/20 pt-8 mt-10">
                <h2 className="text-2xl font-bold text-red-400 flex items-center gap-3">
                    <span className="material-symbols-outlined">warning</span>
                    Danger Zone
                </h2>
                <p className="text-slate-400 mt-2 max-w-2xl">
                    These actions are permanent and cannot be undone. Please proceed with caution.
                </p>
                <div className="mt-6">
                    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">Delete My Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account, your profile, and remove all of your donation history from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className={buttonVariants({ variant: "destructive" })}>
                                    Yes, Delete Account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </section>

        </div>
    </div>
  );
}
