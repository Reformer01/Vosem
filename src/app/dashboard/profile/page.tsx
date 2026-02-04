'use client';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth, useStorage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ProfileForm } from '@/components/dashboard/profile-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef, type ChangeEvent } from 'react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword, signOut, updateProfile } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  whatsappNumber?: string;
  photoURL?: string;
}

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match",
  path: ["confirmPassword"],
});


export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const storage = useStorage();
  const router = useRouter();
  const { toast } = useToast();
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isPictureUploading, setIsPictureUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userProfileRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!user || !user.email) return;

    setIsPasswordChanging(true);
    
    const credential = EmailAuthProvider.credential(user.email, values.currentPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, values.newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully. Please log in again.",
      });

      await signOut(auth);
      router.push('/login');

    } catch (error: any) {
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        description = "The current password you entered is incorrect.";
      } else if (error.code === 'auth/weak-password') {
        description = "The new password is too weak.";
      }
      console.error("Password change error:", error);
      toast({
        variant: "destructive",
        title: "Error Changing Password",
        description: description,
      });
    } finally {
      setIsPasswordChanging(false);
      passwordForm.reset();
    }
  };

  const handlePictureChangeClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsPictureUploading(true);

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Please select an image file." });
      setIsPictureUploading(false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({ variant: "destructive", title: "Upload Failed", description: "Image size cannot exceed 5MB." });
      setIsPictureUploading(false);
      return;
    }

    const imageRef = storageRef(storage, `profile-pictures/${user.uid}`);

    try {
      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);
      
      await updateProfile(user, { photoURL: downloadURL });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });

      toast({
        title: "Profile Picture Updated",
        description: "Your new picture has been saved.",
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Could not update your profile picture. Please try again.",
      });
    } finally {
      setIsPictureUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


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
                            <AvatarImage src={user.photoURL} alt={userProfile.name} key={user.photoURL} />
                        ) : (
                             <AvatarFallback className="bg-input text-slate-400">
                                {userProfile.name?.charAt(0).toUpperCase()}
                             </AvatarFallback>
                        )}
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png, image/jpeg, image/gif"
                    />
                    <Button 
                      variant="outline" 
                      className="w-full bg-white/5 hover:bg-white/10" 
                      onClick={handlePictureChangeClick}
                      disabled={isPictureUploading}
                    >
                      {isPictureUploading ? 'Uploading...' : 'Change Picture'}
                    </Button>
                </div>
                <div className="flex-1 w-full">
                    <ProfileForm userProfile={userProfile} />
                </div>
            </div>
        </div>

        <div className="glass-panel p-8 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Change Password</h2>
            <p className="text-slate-400 mb-6">For security, you will be logged out after changing your password.</p>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="bg-input/80 border-transparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="bg-input/80 border-transparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} className="bg-input/80 border-transparent" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isPasswordChanging}>
                  {isPasswordChanging ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </Form>
        </div>

      </div>
    </div>
  );
}
