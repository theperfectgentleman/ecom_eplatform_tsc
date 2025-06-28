import { AccessLevel, UserType } from '../types';

export const PERMISSIONS = {
  // General Permissions
  VIEW_DASHBOARD: 'view_dashboard',

  // Patient Management
  MANAGE_PATIENTS: 'manage_patients', // Create, Edit, Delete
  VIEW_PATIENTS: 'view_patients',

  // User Management
  MANAGE_USERS: 'manage_users', // Create, Edit, Delete
  VIEW_USERS: 'view_users',
};

// Permissions assigned to each user type
export const USER_TYPE_PERMISSIONS: Record<UserType, string[]> = {
  [UserType.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_USERS,
  ],
  [UserType.MANAGEMENT]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.VIEW_USERS,
  ],
  [UserType.SUPERVISOR]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_PATIENTS,
    PERMISSIONS.MANAGE_USERS, // Can manage users below them
    PERMISSIONS.VIEW_USERS,
  ],
  [UserType.CLINICIAN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_PATIENTS,
    PERMISSIONS.VIEW_PATIENTS,
  ],
  [UserType.TSC]: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_PATIENTS],
  [UserType.VOLUNTEER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS, // For now, can be restricted later
  ],
  [UserType.CHV]: [
    // Community Health Volunteer
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_PATIENTS,
  ],
};

export const getPermissionsForUserType = (userType: UserType): string[] => {
  return USER_TYPE_PERMISSIONS[userType] || [];
};

export const userTypeColors: Record<UserType, string> = {
  [UserType.ADMIN]: 'bg-red-500',
  [UserType.MANAGEMENT]: 'bg-purple-500',
  [UserType.SUPERVISOR]: 'bg-blue-500',
  [UserType.CLINICIAN]: 'bg-green-500',
  [UserType.TSC]: 'bg-yellow-600',
  [UserType.VOLUNTEER]: 'bg-indigo-500',
  [UserType.CHV]: 'bg-pink-500',
};

export const accessLevelColors: Record<AccessLevel, string> = {
  [AccessLevel.NATIONAL]: 'bg-gray-700',
  [AccessLevel.REGION]: 'bg-slate-600',
  [AccessLevel.DISTRICT]: 'bg-sky-700',
  [AccessLevel.SUBDISTRICT]: 'bg-teal-600',
  [AccessLevel.COMMUNITY]: 'bg-cyan-700',
};
