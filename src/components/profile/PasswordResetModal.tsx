import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Account } from '@/types';

interface PasswordResetModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  account?: Account; // Allow passing an account for admin resets
}

const passwordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({ isOpen, onOpenChange, account }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { request } = useApi();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        newPassword: '',
        confirmPassword: '',
    }
  });

  const onSubmit = async (data: PasswordFormData) => {
    const targetUser = account || user;

    if (!targetUser) {
      toast({
        title: 'Error',
        description: 'No user specified for password reset.',
        variant: 'error',
      });
      return;
    }

    try {
      await request({
        path: '/accounts/password',
        method: 'PUT',
        body: {
            identifier: (targetUser as any).email || (targetUser as any).username, // Use email for Account, username for AuthContext user
            newPassword: data.newPassword,
            type: 'email', // Assuming backend can handle email identifier for resets
        }
      });

      toast({
        title: 'Success',
        description: 'Your password has been updated successfully.',
        variant: 'success'
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
        toast({
            title: 'Error updating password',
            description: error.response?.data?.message || 'An unexpected error occurred.',
            variant: 'error',
        });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter a new password for {account ? `${account.firstname} ${account.lastname}` : 'your account'}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                    <Label>New Password</Label>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                    <FormItem>
                    <Label>Confirm New Password</Label>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;
