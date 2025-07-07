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

export interface Contact {
  ContactID: number;
  Name: string;
  Position?: string;
  Description?: string;
  Region?: string;
  District?: string;
  Email1?: string;
  Email2?: string;
  Mobile1?: string;
  Mobile2?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Meeting {
  meeting_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  patient_id: number;
  practitioner_id: number;
  created_by: number;
  status: MeetingStatus;
  notes?: string;
  region: string;
  district: string;
  google_meet_link?: string;
}

export interface Patient {
  patient_id: number;
  name: string;
  patient_code?: string;
  year_of_birth: number;
  gender: string;
  region?: string;
  district?: string;
  sub_district?: string;
  community?: string;
  national_id?: string;
  insurance_status?: string;
  insurance_no?: string;
  blood_group?: string;
}

export interface Case {
  case_file_id: string; // Changed from number
  patient_id: number;
  name: string; // Changed from patient_name
  status: string; // This will be mapped from priority_level
  priority_level: string; // Added from API data
  summary?: string; // Kept as optional
  date_created: string; // Changed from created_at
  date_modified: string; // Changed from updated_at
  created_by_name?: string; // Kept as optional
  assignee_name?: string;
  // Adding other relevant fields from the sample
  region?: string;
  district?: string;
  sub_district?: string;
  year_of_birth?: number;
  gender?: string;
  insurance_status?: string;
  insurance_no?: string;
  present_compliants?: string;
  examination_findings?: string;
  temperature?: string;
  weight?: string;
  blood_group?: string;
  bp?: string;
  pulse?: number;
  treatment_given?: string;
  referral_reason_notes?: string;
  referring_officer_name?: string;
  referring_officer_position?: string;
  medications_given?: string;
  medications_on?: string;
  referring_facility_name?: string;
  national_id?: string;
  facility_referred_to?: string;
  transportation_means?: string;
  user_id?: number;
  other_notes?: string;
  referral_needed?: boolean;
}
