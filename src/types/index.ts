export enum UserType {
  VOLUNTEER = 'volunteer',
  CLINICIAN = 'clinician',
  TELEMEDICINE = 'telemedicine',
  MANAGEMENT = 'management',
  ADMIN = 'admin',
}

export enum AccessLevel {
  COMMUNITY = 0,
  SUBDISTRICT = 1,
  DISTRICT = 2,
  REGION = 3,
  NATIONAL = 4,
}

export interface Account {
  account_id?: string; // For backward compatibility
  user_id?: number; // Actual API field
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
  contactid?: number; // For backward compatibility
  ContactID?: number; // Actual API field (uppercase)
  name?: string; // For backward compatibility
  Name?: string; // Actual API field (uppercase)
  position?: string;
  Position?: string;
  description?: string;
  Description?: string;
  region?: string;
  Region?: string;
  district?: string;
  District?: string;
  email1?: string;
  Email1?: string;
  email2?: string;
  Email2?: string;
  mobile1?: string;
  Mobile1?: string;
  mobile2?: string;
  Mobile2?: string;
  user_id?: number;
  username?: string;
  createdat?: string;
  CreatedAt?: string;
  updatedat?: string;
  UpdatedAt?: string;
}

export enum MeetingStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Meeting {
  meetingid: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  patient_id: number; // Legacy field, kept for backward compatibility
  case_file_id?: number; // New field for case file reference
  practitioner_id: number | string;
  created_by: number;
  status: MeetingStatus | string;
  notes_for_attendees?: string;
  region: string;
  district: string;
  meetinglink?: string;
  createdat?: string;
  updatedat?: string;
  // Backend/DB fields
  patient_name?: string;
  practitioner?: string;
  date?: string;
  time?: string;
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
