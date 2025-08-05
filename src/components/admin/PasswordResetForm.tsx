import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Form, FormField, FormItem, FormControl, FormMessage } from '../ui/form';
import { Account } from '@/types';

interface PasswordResetFormProps {
  account: Account;
  onSuccess: () => void;
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

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ account, onSuccess }) => {
  const { toast } = useToast();
  const { request } = useApi();

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
    if (identifierType && account) {
      let identifierValue = '';
      switch (identifierType) {
        case 'username':
          identifierValue = account.username || '';
          break;
        case 'email':
          identifierValue = account.email || '';
          break;
        case 'phone':
          identifierValue = account.phone || '';
          break;
      }
      form.setValue('identifier', identifierValue);
    }
  }, [identifierType, account, form]);

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
        description: `Password has been reset successfully for ${account.firstname} ${account.lastname}.`,
        variant: 'success'
      });
      form.reset();
      onSuccess();
    } catch (error: any) {
        toast({
            title: 'Error resetting password',
            description: error.response?.data?.message || 'An unexpected error occurred.',
            variant: 'error',
        });
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
        <p className="text-sm text-gray-600 mt-1">
          Reset password for <strong>{account.firstname} {account.lastname}</strong>
        </p>
      </div>

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
                <Label>Identifier</Label>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Identifier value" 
                    readOnly
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
                  <Input 
                    {...field} 
                    type="password" 
                    placeholder="Enter new password" 
                  />
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
                <Label>Confirm Password</Label>
                <FormControl>
                  <Input 
                    {...field} 
                    type="password" 
                    placeholder="Confirm new password" 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onSuccess}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PasswordResetForm;
