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

// API toast suppression options
export interface ToastSuppression {
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  info?: boolean;
  all?: boolean;
}

// API request options interface
export interface ApiRequestOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  isPublic?: boolean;
  suppressToast?: ToastSuppression;
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
  patient_id: string; // Updated to string to match database change
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
  patient_id: string;
  name: string;
  patient_code?: string;
  year_of_birth: number;
  gender: string;
  contact_number?: string;
  region?: string;
  district?: string;
  sub_district?: string;
  community?: string;
  national_id?: string;
  insurance_status?: string;
  insurance_no?: string;
  blood_group?: string;
  assigned_user_id?: number;
  othernames?: string;
  dob?: string;
  address?: string;
  alternative_number?: string;
  next_kin?: string;
  next_kin_contact?: string;
  registration_date?: string;
  community_id?: number;
  reg_loc_lat?: number;
  reg_loc_lng?: number;
}

export interface Case {
  case_file_id: string; // Changed from number
  patient_id: string;
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

export interface AntenatalRegistration {
  antenatal_registration_id: string;
  patient_id: string;
  registration_date: string;
  registration_number: string;
  parity?: number;
  folic_acid_iron_supplements?: string;
  hemoglobin_at_registration?: number;
  gestation_weeks?: number;
  estimated_delivery_date?: string;
  blood_group_abo?: string;
  rhesus_status?: string;
  sickling_status?: string;
  itn_type?: string;
  itn_given?: boolean;
  syphilis_screening_status?: string;
  syphilis_treatment?: boolean;
  hiv_status_at_registration?: string;
  hiv_retested_at_34weeks?: string;
  arv_treatment?: boolean;
  screened_for_tb?: boolean;
  tb_diagnosed?: boolean;
  tb_treatment_started?: boolean;
  blood_pressure?: string;
  weight?: number;
  antenatal_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AntenatalVisit {
  id: number;
  patient_id: string;
  antenatal_registration_id: string;
  visit_date: string;
  blood_pressure?: string;
  weight_kg?: number;
  fetal_heart_inspection?: string;
  urine_p?: string;
  urine_s?: string;
  fetal_heart_rate?: number;
  folic_acid_iron?: string;
  pt?: string;
  tt?: string;
  gestation_weeks?: number;
  next_visit_date?: string;
  fundal_height?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PatientOverviewData extends Patient {
  assigned_user?: {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    user_type: string;
  };
  age?: number;
}

// ANC-specific extended types
export interface ANCPatient extends Patient {
  antenatal_registration?: AntenatalRegistration;
  latest_visit?: AntenatalVisit;
  visits_count?: number;
}

// Form stage types
export enum ANCStage {
  PERSON_DETAILS = 1,
  ANC_REGISTRATION = 2,
  ANC_VISITS = 3,
}

export interface ANCFormState {
  currentStage: ANCStage;
  selectedPatient?: ANCPatient;
  personDetails?: Partial<Patient>;
  registration?: Partial<AntenatalRegistration>;
  currentVisit?: Partial<AntenatalVisit>;
}
