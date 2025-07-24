import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { shouldRedirectToGuide } from '@/lib/permissions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { canAccessPage, userType } = usePermissions();
  const location = useLocation();

  // If user type is not available yet, show loading
  if (!userType) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Special handling for users who should be redirected to guide (unknown types or volunteers)
  if (shouldRedirectToGuide(userType) && location.pathname !== '/guide') {
    return <Navigate to="/guide" replace />;
  }

  // Check if user can access this page
  if (!canAccessPage(location.pathname)) {
    // For users who should use guide, redirect to guide instead of dashboard
    const redirectPath = shouldRedirectToGuide(userType) ? '/guide' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
