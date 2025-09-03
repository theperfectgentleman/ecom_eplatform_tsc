import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading, isTokenExpired } = useAuth();
  const { showSessionExpired } = useSession();
  const location = useLocation();

  console.log('ProtectedRoute: user', user);
  console.log('ProtectedRoute: loading', loading);

  // Check for token expiration on route access
  useEffect(() => {
    if (user && isTokenExpired()) {
      console.log('Token expired on route access');
      showSessionExpired('expired');
    }
  }, [user, isTokenExpired, showSessionExpired, location.pathname]);

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
