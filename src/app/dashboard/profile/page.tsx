'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ProfileForm } from '@/components/dashboard/profile-form';

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

  if (isUserLoading || isProfileLoading) {
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
          <p className="text-slate-400 mt-2">Manage your personal information.</p>
        </div>
        <div className="glass-panel p-8 rounded-xl">
            <ProfileForm userProfile={userProfile} />
        </div>
      </div>
    </div>
  );
}
