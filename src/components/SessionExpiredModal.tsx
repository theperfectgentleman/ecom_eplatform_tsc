import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, LogOut } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: 'expired' | 'unauthorized' | 'invalid';
}

const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({ 
  isOpen, 
  onClose,
  reason = 'expired'
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogoutAndRedirect = () => {
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  const getModalContent = () => {
    switch (reason) {
      case 'expired':
        return {
          title: 'Session Expired',
          description: 'Your session has expired for security reasons. Please log in again to continue using the application.',
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />
        };
      case 'unauthorized':
        return {
          title: 'Access Denied',
          description: 'You are not authorized to access this resource. Your session may have expired or your permissions may have changed.',
          icon: <LogOut className="h-6 w-6 text-red-500" />
        };
      case 'invalid':
        return {
          title: 'Invalid Session',
          description: 'Your session is no longer valid. This may happen if you logged in from another device or browser.',
          icon: <AlertTriangle className="h-6 w-6 text-red-500" />
        };
      default:
        return {
          title: 'Session Issue',
          description: 'There was an issue with your session. Please log in again to continue.',
          icon: <AlertTriangle className="h-6 w-6 text-amber-500" />
        };
    }
  };

  const { title, description, icon } = getModalContent();

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {icon}
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={handleLogoutAndRedirect}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Go to Login
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SessionExpiredModal;
