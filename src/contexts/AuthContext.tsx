import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Account } from '../types';
import { getPermissionsForUserType } from '../lib/permissions';

interface AuthContextType {
  user: Account | null;
  loading: boolean;
  login: (userData: Account, token: string) => void;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
  userPermissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 minutes

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  const updateUserAndPermissions = useCallback((userData: Account | null) => {
    setUser(userData);
    if (userData) {
      const permissions = getPermissionsForUserType(userData.user_type);
      setUserPermissions(permissions);
    } else {
      setUserPermissions([]);
    }
  }, []);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      const parsedUser: Account = JSON.parse(storedUser);
      updateUserAndPermissions(parsedUser);
    }
    setLoading(false);
  }, [updateUserAndPermissions]);

  // Idle timeout logic
  useEffect(() => {
    const resetTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      setIdleTimer(
        setTimeout(() => {
          logout();
        }, IDLE_TIMEOUT)
      );
    };
    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      resetTimer();
    }
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
    // eslint-disable-next-line
  }, [user]);

  const login = useCallback((userData: Account, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    updateUserAndPermissions(userData);
  }, [updateUserAndPermissions]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateUserAndPermissions(null);
  }, [updateUserAndPermissions]);

  // Placeholder permission check function
  const checkPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkPermission, userPermissions }}>
      {children}
    </AuthContext.Provider>
  );
};
