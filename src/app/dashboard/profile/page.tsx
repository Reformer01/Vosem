'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p>Could not load user profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-8 md:py-12 px-6 md:px-10 lg:px-40">
      <div className="w-full max-w-4xl flex flex-col gap-10">
        <div>
          <h1 className="text-4xl font-bold text-white">Your Profile</h1>
          <p className="text-slate-400 mt-2">Manage your personal information and account settings.</p>
        </div>
        
        <div className="glass-panel p-8 rounded-xl">
            <div className="flex flex-col sm:flex-row items-start gap-8">
                <div className="flex flex-col items-center gap-4 w-full sm:w-48">
                    <Avatar className="w-32 h-32 text-4xl border-4 border-primary/30">
                        {user.photoURL ? (
                            <AvatarImage src={user.photoURL} alt={userProfile.name} />
                        ) : (
                             <AvatarFallback className="bg-input text-slate-400">
                                {userProfile.name?.charAt(0).toUpperCase()}
                             </AvatarFallback>
                        )}
                    </Avatar>
                    <Button variant="outline" className="w-full bg-white/5 hover:bg-white/10">Change Picture</Button>
                </div>
                <div className="flex-1 w-full">
                    <ProfileForm userProfile={userProfile} />
                </div>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
            <p className="text-slate-400 mb-6">For security, you will be logged out after changing your password.</p>
            <form className="space-y-6">
                <Input type="password" placeholder="Current Password" className="bg-input/80 border-transparent" />
                <Input type="password" placeholder="New Password" className="bg-input/80 border-transparent" />
                <Input type="password" placeholder="Confirm New Password" className="bg-input/80 border-transparent" />
                <Button>Update Password</Button>
            </form>
        </div>

      </div>
    </div>
  );
}
