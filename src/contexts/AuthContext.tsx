import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Account } from '../types';
import { getPermissionsForUserType } from '../lib/permissions';

interface AuthContextType {
  user: Account | null;
  token: string | null;
  loading: boolean;
  login: (userData: Account, token: string) => void;
  logout: (options?: { message?: string; reason?: 'expired' | 'manual' | 'unauthorized' }) => void;
  checkPermission: (permission: string) => boolean;
  userPermissions: string[];
  isTokenExpired: () => boolean;
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

const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours - suitable for poor network conditions

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

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
    // Only check for storedUser, not token
    if (storedUser && storedUser !== 'undefined' && storedToken) {
      try {
        const parsedUser: Account = JSON.parse(storedUser);
        updateUserAndPermissions(parsedUser);
        setToken(storedToken);
      } catch {
        // If parsing fails, clear the bad value
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        updateUserAndPermissions(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, [updateUserAndPermissions]);


  // Idle timeout logic - optimized for poor network conditions
  useEffect(() => {
    let lastActivity = Date.now();
    
    const resetTimer = () => {
      // Throttle timer resets to reduce CPU usage
      const now = Date.now();
      if (now - lastActivity < 30000) return; // Only reset timer every 30 seconds
      lastActivity = now;
      
      if (idleTimer) clearTimeout(idleTimer);
      setIdleTimer(
        setTimeout(() => {
          logout();
        }, IDLE_TIMEOUT)
      );
    };
    
    if (user) {
      // Reduced event listeners - focus on key user interactions only
      window.addEventListener('mousedown', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('touchstart', resetTimer);
      resetTimer();
    }
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
    // eslint-disable-next-line
  }, [user]);

  // Sync auth state across tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'user' || event.key === 'token') {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedUser !== 'undefined' && storedToken) {
          try {
            const parsedUser: Account = JSON.parse(storedUser);
            updateUserAndPermissions(parsedUser);
            setToken(storedToken);
          } catch {
            updateUserAndPermissions(null);
            setToken(null);
          }
        } else {
          updateUserAndPermissions(null);
          setToken(null);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [updateUserAndPermissions]);

  const login = useCallback((userData: Account, token: string) => {
    console.log('AuthContext login called with:', userData, token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setToken(token);
    updateUserAndPermissions(userData); // This line was missing
    console.log('AuthContext state updated.');
  }, [updateUserAndPermissions]);

  // Enhanced logout function with optional message and redirect
  const logout = useCallback((options?: { 
    message?: string; 
    reason?: 'expired' | 'manual' | 'unauthorized' 
  }) => {
    const { message, reason = 'manual' } = options || {};
    
    console.log('Logging out user. Reason:', reason, 'Message:', message);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateUserAndPermissions(null);
    setToken(null);
    
    // If this is an expiration or unauthorized logout, we'll handle it via the session context
    // The redirect will be handled by the ProtectedRoute component
    if (reason === 'expired' || reason === 'unauthorized') {
      // Store the reason in sessionStorage so it can be picked up by other components
      sessionStorage.setItem('logout_reason', reason);
      if (message) {
        sessionStorage.setItem('logout_message', message);
      }
    }
  }, [updateUserAndPermissions]);

  const checkPermission = (permission: string) => {
    return userPermissions.includes(permission);
  };

  // Helper function to check if token is expired (basic check)
  const isTokenExpired = useCallback(() => {
    if (!token) return true;
    
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      
      // Decode the payload (second part)
      const payload = JSON.parse(atob(parts[1]));
      
      // Check if token has expiration claim and if it's expired
      if (payload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < currentTime;
        const timeUntilExpiry = payload.exp - currentTime;
        
        if (isExpired) {
          console.log('Token is expired');
        } else if (timeUntilExpiry < 1800) { // Less than 30 minutes (more appropriate for 2-hour intervals)
          console.log(`Token expires in ${Math.floor(timeUntilExpiry / 60)} minutes`);
        }
        return isExpired;
      }
      
      // If no expiration claim, assume token is valid
      return false;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // If we can't parse it, assume it's invalid
    }
  }, [token]);

  // Periodic token validation - placed after logout and isTokenExpired are defined
  useEffect(() => {
    if (!user || !token) return;

    const checkTokenPeriodically = setInterval(() => {
      if (isTokenExpired()) {
        console.log('Token expired during periodic check - logging out');
        logout({ 
          reason: 'expired', 
          message: 'Your session has expired. Please log in again to continue.' 
        });
      }
    }, 2 * 60 * 60 * 1000); // Check every 2 hours to minimize network usage

    return () => clearInterval(checkTokenPeriodically);
  }, [user, token, isTokenExpired, logout]);

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    checkPermission,
    userPermissions,
    isTokenExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
