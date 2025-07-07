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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  identifierType: z.enum(['username', 'email', 'phone'], {
    required_error: 'Please select an identifier type',
  }),
  identifier: z.string().min(1, 'Identifier is required'),
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

  // Use the passed account or fallback to the current user
  const targetUser = account || user;

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        identifierType: undefined,
        identifier: '',
        newPassword: '',
        confirmPassword: '',
    }
  });

  // Watch for changes in identifier type and update the identifier field accordingly
  const identifierType = form.watch('identifierType');
  
  React.useEffect(() => {
    if (identifierType && targetUser) {
      let identifierValue = '';
      switch (identifierType) {
        case 'username':
          identifierValue = targetUser.username || '';
          break;
        case 'email':
          identifierValue = targetUser.email || '';
          break;
        case 'phone':
          identifierValue = targetUser.phone || '';
          break;
      }
      form.setValue('identifier', identifierValue);
    }
  }, [identifierType, targetUser, form]);

  const onSubmit = async (data: PasswordFormData) => {
    try {
      await request({
        path: '/accounts/password',
        method: 'PUT',
        body: {
            identifier: data.identifier,
            newPassword: data.newPassword,
            type: data.identifierType,
        }
      });

      toast({
        title: 'Success',
        description: 'Password has been reset successfully.',
        variant: 'success'
      });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
        toast({
            title: 'Error resetting password',
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
            {account 
              ? `Reset password for ${account.firstname} ${account.lastname}` 
              : 'Reset your password'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="identifierType"
                render={({ field }) => (
                    <FormItem>
                    <Label>Identifier Type</Label>
                    <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                            <SelectValue placeholder="-- Select --" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="username">Username</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                        </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                    <FormItem>
                    <Label>Identifier (Username, Email, or Phone)</Label>
                    <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Select identifier type first" 
                          disabled={true}
                          className="bg-gray-50"
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
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
                    <Button type="submit">Reset Password</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetModal;
