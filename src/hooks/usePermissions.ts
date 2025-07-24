import { useAuth } from '@/contexts/AuthContext';
import { Permission, hasPermission, canAccessPage, getUserPermissions } from '@/lib/permissions';

export const usePermissions = () => {
  const { user } = useAuth();

  const checkPermission = (permission: Permission): boolean => {
    if (!user?.user_type) return false;
    return hasPermission(user.user_type, permission);
  };

  const checkPageAccess = (pathname: string): boolean => {
    if (!user?.user_type) return false;
    return canAccessPage(user.user_type, pathname);
  };

  const getAllPermissions = (): Permission[] => {
    if (!user?.user_type) return [];
    return getUserPermissions(user.user_type);
  };

  return {
    hasPermission: checkPermission,
    canAccessPage: checkPageAccess,
    getAllPermissions,
    userType: user?.user_type,
  };
};
