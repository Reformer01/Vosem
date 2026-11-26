'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { endSession } from '@/lib/session';
import { useToast } from '@/hooks/use-toast';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const { user } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [prefs, setPrefs] = useState({ eventReminders: true, weeklyNewsletter: true, givingUpdates: false });

  const profileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [user, firestore]);
  const { data: profile } = useDoc<{ notificationPreferences?: typeof prefs }>(profileRef);

  useEffect(() => {
    if (profile?.notificationPreferences) setPrefs(profile.notificationPreferences);
  }, [profile]);

  const savePrefs = async (next: typeof prefs) => {
    if (!user) return;
    setPrefs(next);
    await updateDoc(doc(firestore, 'users', user.uid), { notificationPreferences: next });
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete account. User or database not available.",
      });
      return;
    }

    const userId = user.uid;

    try {
      const userDocRef = doc(firestore, 'users', userId);
      await deleteDoc(userDocRef);

      await deleteUser(user);
      await endSession(firestore);

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been removed.",
      });
      
      router.push('/');

    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "This is a sensitive action. Please sign out and sign back in before deleting your account.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: 'We could not delete your account. Please try again or contact the church office.',
        });
      }
    } finally {
      setIsDeleteAlertOpen(false);
    }
  };

  return (
    <div className="w-full flex justify-center py-8 md:py-12 px-6 md:px-10 lg:px-40">
      <div className="w-full max-w-4xl flex flex-col gap-12">
        <div>
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account and notification preferences.</p>
        </div>

        <section className="flex flex-col gap-8">
            <h2 className="text-2xl font-bold text-foreground border-b border-border pb-4">Notifications</h2>
            <div className="site-curved border border-border bg-card p-8 shadow-sm flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="event-notifications" className="font-semibold text-lg text-foreground">Event Reminders</Label>
                        <p className="text-sm text-muted-foreground">Receive email notifications for upcoming events.</p>
                    </div>
                    <Switch id="event-notifications" checked={prefs.eventReminders} onCheckedChange={checked => savePrefs({ ...prefs, eventReminders: checked })} />
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="newsletter" className="font-semibold text-lg text-foreground">Weekly Newsletter</Label>
                        <p className="text-sm text-muted-foreground">Stay up to date with the latest news and sermons.</p>
                    </div>
                    <Switch id="newsletter" checked={prefs.weeklyNewsletter} onCheckedChange={checked => savePrefs({ ...prefs, weeklyNewsletter: checked })} />
                </div>
                 <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="giving-updates" className="font-semibold text-lg text-foreground">Giving Updates</Label>
                        <p className="text-sm text-muted-foreground">Get summaries and reports on your contributions.</p>
                    </div>
                    <Switch id="giving-updates" checked={prefs.givingUpdates} onCheckedChange={checked => savePrefs({ ...prefs, givingUpdates: checked })} />
                </div>
            </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-red-600/30 pt-8 mt-4">
            <h2 className="text-2xl font-bold text-red-700 flex items-center gap-3">
                <span className="material-symbols-outlined">warning</span>
                Danger Zone
            </h2>
            <p className="text-muted-foreground mt-2 max-w-2xl">
                This action is permanent and cannot be undone. Please proceed with caution.
            </p>
            <div className="mt-4">
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
