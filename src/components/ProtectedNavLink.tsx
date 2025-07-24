import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedNavLinkProps extends LinkProps {
  children: React.ReactNode;
}

export const ProtectedNavLink: React.FC<ProtectedNavLinkProps> = ({ 
  to, 
  children, 
  ...props 
}) => {
  const { canAccessPage } = usePermissions();

  // Convert 'to' to string if it's an object
  const pathname = typeof to === 'string' ? to : to.pathname || '';

  if (!canAccessPage(pathname)) {
    return null; // Don't render the link if user can't access the page
  }

  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  );
};
