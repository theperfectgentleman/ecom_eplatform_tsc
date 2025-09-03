import React, { createContext, useContext, useState, useCallback } from 'react';
import SessionExpiredModal from '@/components/SessionExpiredModal';

interface SessionContextType {
  showSessionExpired: (reason?: 'expired' | 'unauthorized' | 'invalid') => void;
  hideSessionExpired: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expiredReason, setExpiredReason] = useState<'expired' | 'unauthorized' | 'invalid'>('expired');

  const showSessionExpired = useCallback((reason: 'expired' | 'unauthorized' | 'invalid' = 'expired') => {
    setExpiredReason(reason);
    setIsModalOpen(true);
  }, []);

  const hideSessionExpired = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const value = {
    showSessionExpired,
    hideSessionExpired,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
      {isModalOpen && (
        <SessionExpiredModal 
          isOpen={isModalOpen}
          onClose={hideSessionExpired}
          reason={expiredReason}
        />
      )}
    </SessionContext.Provider>
  );
};
