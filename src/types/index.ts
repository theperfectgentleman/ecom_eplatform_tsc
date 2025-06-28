export enum UserType {
  VOLUNTEER = 'volunteer',
  TSC = 'tsc',
  CLINICIAN = 'clinician',
  SUPERVISOR = 'supervisor',
  MANAGEMENT = 'management',
  ADMIN = 'admin',
  CHV = 'CHV', // Community Health Volunteer, from API
}

export enum AccessLevel {
  COMMUNITY = 0,
  SUBDISTRICT = 1,
  DISTRICT = 2,
  REGION = 3,
  NATIONAL = 4,
}

export interface Account {
  account_id: string;
  username: string;
  firstname: string;
  lastname: string;
  user_type: UserType;
  email: string;
  access_level: AccessLevel;
  phone: string;
  district?: string;
  region?: string;
  subdistrict?: string;
  community_name?: string;
}
