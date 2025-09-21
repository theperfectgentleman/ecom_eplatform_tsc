import { AccessLevel, UserType } from '../types';

// Define all possible permissions
export enum Permission {
  // Page Access Permissions
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_PATIENTS = 'view_patients',
  VIEW_PATIENT_SNAPSHOT = 'view_patient_snapshot',
  VIEW_CASES = 'view_cases',
  VIEW_MEETINGS = 'view_meetings',
  VIEW_ADDRESSBOOK = 'view_addressbook',
  VIEW_APPOINTMENTS = 'view_appointments',
  VIEW_REFERRALS = 'view_referrals',
  VIEW_FEEDBACK = 'view_feedback',
  VIEW_ADMIN = 'view_admin',
  VIEW_REPORTS = 'view_reports',
  VIEW_ANTENATAL_CARE = 'view_antenatal_care',
  VIEW_KIT_DISTRIBUTION = 'view_kit_distribution',
  
  // Data Permissions
  CREATE_PATIENTS = 'create_patients',
  EDIT_PATIENTS = 'edit_patients',
  DELETE_PATIENTS = 'delete_patients',
  
  CREATE_CASES = 'create_cases',
  EDIT_CASES = 'edit_cases',
  DELETE_CASES = 'delete_cases',
  
  CREATE_MEETINGS = 'create_meetings',
  EDIT_MEETINGS = 'edit_meetings',
  DELETE_MEETINGS = 'delete_meetings',
  
  CREATE_ADDRESSBOOK = 'create_addressbook',
  EDIT_ADDRESSBOOK = 'edit_addressbook',
  DELETE_ADDRESSBOOK = 'delete_addressbook',
  
  CREATE_APPOINTMENTS = 'create_appointments',
  EDIT_APPOINTMENTS = 'edit_appointments',
  DELETE_APPOINTMENTS = 'delete_appointments',
  
  CREATE_REFERRALS = 'create_referrals',
  EDIT_REFERRALS = 'edit_referrals',
  DELETE_REFERRALS = 'delete_referrals',
  
  CREATE_FEEDBACK = 'create_feedback',
  EDIT_FEEDBACK = 'edit_feedback',
  DELETE_FEEDBACK = 'delete_feedback',
  
  // Admin Permissions
  MANAGE_USERS = 'manage_users',
  MANAGE_SYSTEM = 'manage_system',
}

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<UserType, Permission[]> = {
  [UserType.ADMIN]: [
    // Full access to everything
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_SNAPSHOT,
    Permission.VIEW_CASES,
    Permission.VIEW_MEETINGS,
    Permission.VIEW_ADDRESSBOOK,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_REFERRALS,
    Permission.VIEW_FEEDBACK,
    Permission.VIEW_ADMIN,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANTENATAL_CARE,
    Permission.VIEW_KIT_DISTRIBUTION,
    
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    Permission.DELETE_PATIENTS,
    
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    Permission.DELETE_CASES,
    
    Permission.CREATE_MEETINGS,
    Permission.EDIT_MEETINGS,
    Permission.DELETE_MEETINGS,
    
    Permission.CREATE_ADDRESSBOOK,
    Permission.EDIT_ADDRESSBOOK,
    Permission.DELETE_ADDRESSBOOK,
    
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.DELETE_APPOINTMENTS,
    
    Permission.CREATE_REFERRALS,
    Permission.EDIT_REFERRALS,
    Permission.DELETE_REFERRALS,
    
    Permission.CREATE_FEEDBACK,
    Permission.EDIT_FEEDBACK,
    Permission.DELETE_FEEDBACK,
    
    Permission.MANAGE_USERS,
    Permission.MANAGE_SYSTEM,
  ],
  
  [UserType.MANAGEMENT]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_SNAPSHOT,
  ],
  
  [UserType.TELEMEDICINE]: [
    // Full read/write access to addressbook, appointments, and referrals
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_SNAPSHOT,
    Permission.VIEW_CASES,
    Permission.VIEW_MEETINGS,
    Permission.VIEW_ADDRESSBOOK,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_REFERRALS,
    Permission.VIEW_FEEDBACK,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANTENATAL_CARE,
    Permission.VIEW_KIT_DISTRIBUTION,
    
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    
    Permission.CREATE_MEETINGS,
    Permission.EDIT_MEETINGS,
    
    // Full access to specified pages
    Permission.CREATE_ADDRESSBOOK,
    Permission.EDIT_ADDRESSBOOK,
    Permission.DELETE_ADDRESSBOOK,
    
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    Permission.DELETE_APPOINTMENTS,
    
    Permission.CREATE_REFERRALS,
    Permission.EDIT_REFERRALS,
    Permission.DELETE_REFERRALS,
    
    Permission.CREATE_FEEDBACK,
    Permission.EDIT_FEEDBACK,
  ],
  
  [UserType.CLINICIAN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_PATIENT_SNAPSHOT,
    Permission.VIEW_CASES,
    Permission.VIEW_MEETINGS,
    Permission.VIEW_ADDRESSBOOK,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_REFERRALS,
    Permission.VIEW_FEEDBACK,
    Permission.VIEW_REPORTS,
    Permission.VIEW_ANTENATAL_CARE,
    Permission.VIEW_KIT_DISTRIBUTION,
    
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    
    Permission.CREATE_MEETINGS,
    Permission.EDIT_MEETINGS,
    
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    
    Permission.CREATE_REFERRALS,
    Permission.EDIT_REFERRALS,
    
    Permission.CREATE_FEEDBACK,
    Permission.EDIT_FEEDBACK,
  ],
  
  [UserType.VOLUNTEER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PATIENTS,
    Permission.VIEW_CASES,
    Permission.VIEW_MEETINGS,
    Permission.VIEW_ADDRESSBOOK,
    Permission.VIEW_APPOINTMENTS,
    Permission.VIEW_REFERRALS,
    Permission.VIEW_FEEDBACK,
    
    Permission.CREATE_PATIENTS,
    Permission.EDIT_PATIENTS,
    
    Permission.CREATE_CASES,
    Permission.EDIT_CASES,
    
    Permission.CREATE_APPOINTMENTS,
    Permission.EDIT_APPOINTMENTS,
    
    Permission.CREATE_REFERRALS,
    Permission.EDIT_REFERRALS,
    
    Permission.CREATE_FEEDBACK,
    Permission.EDIT_FEEDBACK,
  ],
};

// Page-specific permission mappings
export const PAGE_PERMISSIONS: Record<string, Permission> = {
  '/': Permission.VIEW_DASHBOARD,
  '/dashboard': Permission.VIEW_DASHBOARD,
  '/patient-overview': Permission.VIEW_PATIENTS,
  '/patient-snapshot': Permission.VIEW_PATIENT_SNAPSHOT,
  '/referral': Permission.VIEW_REFERRALS,
  '/antenatal-care': Permission.VIEW_ANTENATAL_CARE,
  '/reports': Permission.VIEW_REPORTS,
  '/address-book': Permission.VIEW_ADDRESSBOOK,
  '/appointments': Permission.VIEW_APPOINTMENTS,
  '/kit-distribution': Permission.VIEW_KIT_DISTRIBUTION,
  '/feedback': Permission.VIEW_FEEDBACK,
  '/admin': Permission.VIEW_ADMIN,
  '/admin/settings': Permission.VIEW_ADMIN,
  '/admin/docs': Permission.VIEW_ADMIN,
  '/admin/implementation': Permission.VIEW_ADMIN,
  '/download': Permission.VIEW_DASHBOARD, // Allow access to download page for all users
  '/guide': Permission.VIEW_DASHBOARD, // Allow access to guide page for all users
};

// Permission checker functions
export const isValidUserType = (userType: any): userType is UserType => {
  return Object.values(UserType).includes(userType);
};

export const isUnknownUserType = (userType: any): boolean => {
  return !isValidUserType(userType);
};

export const shouldRedirectToGuide = (userType: any): boolean => {
  return isUnknownUserType(userType) || userType === UserType.VOLUNTEER;
};

export const hasPermission = (userType: any, permission: Permission): boolean => {
  // If user type is unknown, deny all permissions
  if (isUnknownUserType(userType)) {
    return false;
  }
  
  const userPermissions = ROLE_PERMISSIONS[userType as UserType];
  return userPermissions ? userPermissions.includes(permission) : false;
};

export const canAccessPage = (userType: any, pathname: string): boolean => {
  // Unknown user types can only access the guide page
  if (isUnknownUserType(userType)) {
    return pathname === '/guide';
  }
  
  const requiredPermission = PAGE_PERMISSIONS[pathname];
  if (!requiredPermission) {
    // If no specific permission is required, allow access
    return true;
  }
  return hasPermission(userType, requiredPermission);
};

export const hasAnyPermission = (userType: any, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userType, permission));
};

export const getUserPermissions = (userType: any): Permission[] => {
  if (isUnknownUserType(userType)) {
    return []; // Unknown user types have no permissions
  }
  return ROLE_PERMISSIONS[userType as UserType] || [];
};

export const getPermissionsForUserType = (userType: any): string[] => {
  return getUserPermissions(userType).map(p => p.toString());
};

export const userTypeColors: Record<UserType, string> = {
  [UserType.ADMIN]: 'bg-red-500',
  [UserType.MANAGEMENT]: 'bg-purple-500',
  [UserType.TELEMEDICINE]: 'bg-blue-500',
  [UserType.CLINICIAN]: 'bg-green-500',
  [UserType.VOLUNTEER]: 'bg-indigo-500',
};

export const accessLevelColors: Record<AccessLevel, string> = {
  [AccessLevel.NATIONAL]: 'bg-gray-700',
  [AccessLevel.REGION]: 'bg-slate-600',
  [AccessLevel.DISTRICT]: 'bg-sky-700',
  [AccessLevel.SUBDISTRICT]: 'bg-teal-600',
  [AccessLevel.COMMUNITY]: 'bg-cyan-700',
};
