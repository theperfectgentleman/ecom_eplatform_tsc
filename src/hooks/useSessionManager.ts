import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import { useToast } from '@/components/ui/toast/useToast';

export const useSessionManager = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showSessionExpired } = useSession();
  const { toast } = useToast();

  const handleSessionExpired = useCallback((reason: 'expired' | 'unauthorized' | 'invalid' = 'expired') => {
    console.log('Session expired:', reason);
    
    // Show modal for user-friendly notification
    showSessionExpired(reason);
  }, [showSessionExpired]);

  const handleDirectLogout = useCallback((message?: string) => {
    console.log('Direct logout requested:', message);
    
    logout();
    toast({
      variant: 'warning',
      title: 'Logged out',
      description: message || 'You have been logged out for security reasons.',
    });
    navigate('/login', { replace: true });
  }, [logout, toast, navigate]);

  const handleForceLogout = useCallback(() => {
    console.log('Force logout - immediate redirect');
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  return {
    handleSessionExpired,
    handleDirectLogout,
    handleForceLogout,
  };
};
