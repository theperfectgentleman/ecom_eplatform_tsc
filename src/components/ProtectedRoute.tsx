import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: user', user);
  console.log('ProtectedRoute: loading', loading);

  if (loading) {
    // You can return a loading spinner here
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
