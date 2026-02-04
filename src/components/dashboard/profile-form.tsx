'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
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
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { useState } from 'react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  whatsappNumber: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  userProfile: {
    name: string;
    email: string;
    whatsappNumber?: string;
  };
}

export function ProfileForm({ userProfile }: ProfileFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile.name || '',
      email: userProfile.email || '',
      whatsappNumber: userProfile.whatsappNumber || '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsSaving(true);
    
    try {
        const userDocRef = doc(firestore, 'users', user.uid);
        
        // Update auth profile display name
        if (user.displayName !== data.name) {
          await updateProfile(user, { displayName: data.name });
        }

        // Prepare data for Firestore update
        const updateData = {
            name: data.name,
            whatsappNumber: data.whatsappNumber || ''
        };
        
        // Update firestore document
        await updateDoc(userDocRef, updateData);

        toast({
          title: 'Profile Updated',
          description: 'Your information has been saved successfully.',
        });
        form.reset(data); // Resets the form's dirty state
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not save your profile changes. Please try again.",
        });
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} className="bg-input/80 border-transparent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} disabled className="bg-input/80 border-transparent cursor-not-allowed"/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="whatsappNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number</FormLabel>
              <FormControl>
                <Input placeholder="Your WhatsApp number" {...field} className="bg-input/80 border-transparent" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.formState.isDirty || isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
}
