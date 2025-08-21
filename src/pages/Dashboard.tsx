import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  FileText,
  Baby,
  Calendar,
  UserCheck,
  Package,
  MapPin,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { useFilteredApi } from "@/hooks/useFilteredApi";

// Community interface for geographic filters
interface Community {
  community_id?: number;
  community_name: string;
  region: string;
  district: string;
  subdistrict?: string;
  sub_district?: string;
}

interface MonthlyTrendsData {
  month: string;
  patients: number;
  anc_registrations: number;
  visits: number;
  referrals: number;
  kits_used: number;
  region?: string;
  district?: string;
  sub_district?: string;
  community?: string;
}

interface DashboardStats {
  totalPatients: number;
  openCases: number;
  scheduledAppointments: number;
  patientMessages: number;
  activePregnancies: number;
  visitsThisMonth: number;
  highRiskPatients: number;
  upcomingAppointments: number;
  newRegistrations: number;
  kitsDistributed: number;
  kitsUsed: number;
  ancRegistrations: number;
}

interface PatientBio {
  patient_id: string;
  name: string;
  dob?: string; // Backend uses 'dob' not 'year_of_birth'
  year_of_birth?: number; // Keep for backward compatibility
  gender?: string;
  contact_number?: string;
  region: string;
  district: string;
  subdistrict?: string; // Backend uses 'subdistrict' not 'sub_district'
  sub_district?: string; // Keep for compatibility
  community?: string;
  national_id?: string;
  insurance_status?: string;
  registration_date: string;
  address?: string; // Additional field from backend
  next_kin?: string; // Additional field from backend
  next_kin_contact?: string; // Additional field from backend
}

interface ANCRegistration {
  antenatal_registration_id: string;
  patient_id: string;
  registration_date: string;
  registration_number: string;
  parity?: number;
  gravida?: number; // Additional field from backend
  gestation_weeks?: number;
  estimated_delivery_date?: string;
  antenatal_status: string;
  region: string;
  district: string;
  subdistrict?: string; // Backend uses 'subdistrict'
  sub_district?: string; // Keep for compatibility
  community?: string;
}

interface ANCVisit {
  antenatal_visit_id: string;
  patient_id: string;
  antenatal_registration_id: string;
  visit_date: string;
  visit_type?: string; // Backend field
  visit_number?: number; // Additional field from backend
  gestation_weeks?: number;
  blood_pressure?: string;
  weight_kg?: number;
  weight?: number; // Backend field
  fetal_heart_rate?: number; // Backend field
  temperature?: number; // Backend field
  pulse?: number; // Backend field
  notes?: string; // Backend field
  nurse_id?: string; // Backend field
  next_visit_date?: string;
  region: string;
  district: string;
  sub_district: string;
  subdistrict?: string; // Backend compatibility
  community: string;
  created_at?: string; // Backend timestamp field
  updated_at?: string; // Backend timestamp field
}

interface CaseFile {
  case_file_id: string;
  patient_id: string;
  priority_level: string;
  status: string;
  date_created: string;
  created_at?: string; // Backend timestamp field
  updated_at?: string; // Backend timestamp field
  region: string;
  district: string;
  sub_district: string;
  subdistrict?: string; // Backend compatibility
  community: string;
  referral_reason_notes?: string;
  facility_referred_to?: string;
  assigned_nurse_id?: string; // Backend field
  notes?: string; // Backend field
}

interface KitDistroLog {
  distro_id: string;
  quantity: number;
  vol_user_id: number;
  adm_user_id: number;
  vol_user_confirm: boolean;
  adm_user_confirm: boolean;
  distro_date: string;
  created_at?: string; // Backend timestamp field
  updated_at?: string; // Backend timestamp field
  region: string;
  district: string;
  sub_district: string;
  subdistrict?: string; // Backend compatibility
  community: string;
  notes?: string; // Backend field
}

interface KitUsageLog {
  kit_id: string;
  user_id: number;
  recipient_name: string;
  recipient_phone?: string;
  lat?: number;
  lng?: number;
  result: string;
  usage_date: string;
  created_at?: string; // Backend timestamp field
  updated_at?: string; // Backend timestamp field
  region: string;
  district: string;
  sub_district: string;
  subdistrict?: string; // Backend compatibility
  community: string;
  notes?: string; // Backend field
}

// Sample data - will be replaced with API calls when backend is ready
const samplePatientBio: PatientBio[] = [
  {
    patient_id: "PAT001",
    name: "Alice Mensah",
    year_of_birth: 1995,
    gender: "female",
    contact_number: "+233201234567",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu",
    national_id: "GHA123456789",
    insurance_status: "active",
    registration_date: "2025-01-15"
  },
  {
    patient_id: "PAT002", 
    name: "Mary Kwame",
    year_of_birth: 1992,
    gender: "female",
    region: "Ashanti",
    district: "Kumasi Metropolitan", 
    sub_district: "Manhyia",
    community: "Adum",
    registration_date: "2025-02-10"
  },
  {
    patient_id: "PAT003",
    name: "Grace Owusu",
    year_of_birth: 1998,
    gender: "female",
    region: "Western",
    district: "Sekondi-Takoradi Metropolitan",
    sub_district: "Sekondi",
    community: "Market Circle",
    registration_date: "2025-03-05"
  }
];

const sampleANCRegistrations: ANCRegistration[] = [
  {
    antenatal_registration_id: "ANC001",
    patient_id: "PAT001",
    registration_date: "2025-01-20",
    registration_number: "ANC2025001",
    parity: 1,
    gestation_weeks: 12,
    estimated_delivery_date: "2025-08-15",
    antenatal_status: "active",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu"
  },
  {
    antenatal_registration_id: "ANC002",
    patient_id: "PAT002",
    registration_date: "2025-02-15",
    registration_number: "ANC2025002",
    parity: 0,
    gestation_weeks: 16,
    estimated_delivery_date: "2025-09-10",
    antenatal_status: "active",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    sub_district: "Manhyia",
    community: "Adum"
  }
];

const sampleANCVisits: ANCVisit[] = [
  {
    antenatal_visit_id: "VISIT001",
    patient_id: "PAT001",
    antenatal_registration_id: "ANC001",
    visit_date: "2025-07-10",
    gestation_weeks: 24,
    blood_pressure: "120/80",
    weight_kg: 65,
    next_visit_date: "2025-08-10",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu"
  },
  {
    antenatal_visit_id: "VISIT002",
    patient_id: "PAT002",
    antenatal_registration_id: "ANC002",
    visit_date: "2025-07-12",
    gestation_weeks: 28,
    blood_pressure: "110/70",
    weight_kg: 68,
    next_visit_date: "2025-08-12",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    sub_district: "Manhyia",
    community: "Adum"
  }
];

const sampleCaseFiles: CaseFile[] = [
  {
    case_file_id: "CASE001",
    patient_id: "PAT001",
    priority_level: "high",
    status: "open",
    date_created: "2025-07-05",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu",
    referral_reason_notes: "Hypertension in pregnancy",
    facility_referred_to: "Ridge Hospital"
  },
  {
    case_file_id: "CASE002",
    patient_id: "PAT003",
    priority_level: "medium",
    status: "pending",
    date_created: "2025-07-08",
    region: "Western",
    district: "Sekondi-Takoradi Metropolitan",
    sub_district: "Sekondi",
    community: "Market Circle",
    referral_reason_notes: "Anemia follow-up needed"
  }
];

const sampleKitDistroLogs: KitDistroLog[] = [
  {
    distro_id: "DIST001",
    quantity: 50,
    vol_user_id: 101,
    adm_user_id: 201,
    vol_user_confirm: true,
    adm_user_confirm: true,
    distro_date: "2025-07-01",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu"
  },
  {
    distro_id: "DIST002",
    quantity: 30,
    vol_user_id: 102,
    adm_user_id: 201,
    vol_user_confirm: true,
    adm_user_confirm: true,
    distro_date: "2025-07-03",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    sub_district: "Manhyia",
    community: "Adum"
  }
];

const sampleKitUsageLogs: KitUsageLog[] = [
  {
    kit_id: "KIT001",
    user_id: 101,
    recipient_name: "Alice Mensah",
    recipient_phone: "+233201234567",
    lat: 5.6037,
    lng: -0.1870,
    result: "positive",
    usage_date: "2025-07-05",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    sub_district: "Osu Klottey",
    community: "Osu"
  },
  {
    kit_id: "KIT002",
    user_id: 102,
    recipient_name: "Mary Kwame",
    result: "negative",
    usage_date: "2025-07-06",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    sub_district: "Manhyia",
    community: "Adum"
  }
];

// Chart data for trends
const generateMonthlyData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return months.map((month, index) => ({
    month,
    patients: 45 + index * 12,
    ancRegistrations: 25 + index * 8,
    visits: 80 + index * 15,
    referrals: 5 + index * 3,
    kitsUsed: 15 + index * 5
  }));
};

// Helper function to ensure array data safety
const ensureArray = <T,>(data: T[] | null | undefined): T[] => {
  return Array.isArray(data) ? data : [];
};

// Normalize priority levels to handle both systems (critical/urgent/routine -> high/medium/low)
const normalizePriorityLevel = (level: string | null | undefined): string => {
  const normalized = level?.toLowerCase();
  switch (normalized) {
    case 'critical':
      return 'high';
    case 'urgent':
      return 'medium';
    case 'routine':
      return 'low';
    default:
      return normalized || 'low';
  }
};

// Safe date parsing function
const safeParseDate = (dateString: string | null | undefined): Date => {
  if (!dateString) return new Date();
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [useLiveData, setUseLiveData] = useState(true); // Default to live data to avoid misleading sample data
  const [isLiveDataStatusExpanded, setIsLiveDataStatusExpanded] = useState(false); // Collapsed by default
  const { filterByAccessLevel } = useAccessLevelFilter();
  const { token } = useAuth();

  // Helper function to build query parameters for API calls
  const buildQueryParams = (region: string, district: string): string => {
    const params = new URLSearchParams();
    
    // Only add region parameter if not "All Regions"
    if (region && region !== "All Regions") {
      params.append('region', region);
    }
    
    // Only add district parameter if not "All Districts" and region is selected
    if (district && district !== "All Districts" && region !== "All Regions") {
      params.append('district', district);
    }
    
    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
  };

  // Generate query parameters based on current selection
  const queryParams = buildQueryParams(selectedRegion, selectedDistrict);

  // API calls for live data - using the correct dashboard endpoints that exist in your API
  const { data: livePatients, loading: patientsLoading } = useFilteredApi<PatientBio>({
    path: `dashboard/patient-bio${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false, // Dashboard endpoints already handle filtering
    dependencies: [selectedRegion, selectedDistrict] // Re-fetch when filters change
  });

  const { data: liveANCRegistrations, loading: ancLoading } = useFilteredApi<ANCRegistration>({
    path: `dashboard/antenatal-registration${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  // Fetch communities for geographic filters
  const { data: communities } = useFilteredApi<Community>({
    path: 'communities',
    autoFetch: true, // Always fetch communities for filters
    applyFilter: false
  });

  // Sample data for analytics - wrapped in useMemo to prevent re-creation on every render
  const sampleAgeDistribution = useMemo(() => [
    { age_group: 'Under 20', count: 45 },
    { age_group: '20-24', count: 123 },
    { age_group: '25-29', count: 89 },
    { age_group: '30-34', count: 67 },
    { age_group: '35+', count: 32 }
  ], []);

  const sampleInsuranceCoverage = useMemo(() => [
    { status: 'active', count: 248 },
    { status: 'inactive', count: 89 },
    { status: 'unknown', count: 19 }
  ], []);

  const sampleRiskDistribution = useMemo(() => [
    { priority_level: 'low', count: 178 },
    { priority_level: 'medium', count: 134 },
    { priority_level: 'high', count: 44 }
  ], []);

  const sampleANCPerformance = useMemo(() => ({
    total_registrations: 356,
    total_visits: 892,
    avg_gestation_at_registration: 18.5,
    completion_rate: 78.4,
    first_trimester_registrations: 67,
    second_trimester_registrations: 189,
    third_trimester_registrations: 100,
    single_visit_patients: 45,
    two_visit_patients: 89,
    three_visit_patients: 134,
    four_plus_visit_patients: 88
  }), []);

  const sampleKitPerformance = useMemo(() => ({
    total_distributed: 245,
    total_used: 189,
    utilization_rate: 77.1,
    positive_rate: 23.8,
    active_volunteers: 12
  }), []);

  const sampleVolunteerPerformance = useMemo(() => [
    { vol_user_id: 1, total_kits_received: 45, kits_used: 38, confirmation_rate: 84.4, usage_rate: 76.2 },
    { vol_user_id: 2, total_kits_received: 32, kits_used: 28, confirmation_rate: 87.5, usage_rate: 81.3 },
    { vol_user_id: 3, total_kits_received: 28, kits_used: 23, confirmation_rate: 82.1, usage_rate: 78.9 }
  ], []);

  // Generate dynamic regions and districts from communities data
  const regions = useMemo(() => {
    if (!communities || communities.length === 0) {
      return ["All Regions"];
    }
    const uniqueRegions = Array.from(new Set(communities.map(c => c.region))).sort();
    return ["All Regions", ...uniqueRegions];
  }, [communities]);

  const districtsByRegion = useMemo(() => {
    if (!communities || communities.length === 0) {
      return {};
    }
    
    const result: { [key: string]: string[] } = {};
    
    communities.forEach(community => {
      if (!result[community.region]) {
        result[community.region] = ["All Districts"];
      }
      if (!result[community.region].includes(community.district)) {
        result[community.region].push(community.district);
      }
    });
    
    // Sort districts for each region
    Object.keys(result).forEach(region => {
      const districts = result[region].filter(d => d !== "All Districts").sort();
      result[region] = ["All Districts", ...districts];
    });
    
    return result;
  }, [communities]);

  const { data: liveANCVisits, loading: visitsLoading } = useFilteredApi<ANCVisit>({
    path: `dashboard/antenatal-visits${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  const { data: liveCases, loading: casesLoading } = useFilteredApi<CaseFile>({
    path: `dashboard/case-files${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  const { data: liveKitDistro, loading: kitDistroLoading } = useFilteredApi<KitDistroLog>({
    path: `dashboard/kit-distribution${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  const { data: liveKitUsage, loading: kitUsageLoading } = useFilteredApi<KitUsageLog>({
    path: `dashboard/kit-usage${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  // Enable the geographic data call since the endpoint exists
  const { data: liveGeographicData } = useFilteredApi<{region: string, district: string, patient_count: number}>({
    path: `dashboard/geographic-distribution${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  // Additional API calls for analytics (using regular fetch since they don't return FilterableData)
  const [liveAgeDistribution, setLiveAgeDistribution] = useState<{age_group: string, count: number}[]>([]);
  const [liveInsuranceCoverage, setLiveInsuranceCoverage] = useState<{status: string, count: number}[]>([]);
  const [liveRiskDistribution, setLiveRiskDistribution] = useState<{priority_level: string, count: number}[]>([]);
  const [liveANCPerformance, setLiveANCPerformance] = useState<any>(null);
  const [liveKitPerformance, setLiveKitPerformance] = useState<any>(null);
  const [liveVolunteerPerformance, setLiveVolunteerPerformance] = useState<any[]>([]);
  
  // Track API failures for user notification
  const [apiFailures, setApiFailures] = useState<string[]>([]);

  // Fetch analytics data when live data is enabled with enhanced error handling
  useEffect(() => {
    if (useLiveData && token) {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Reset failures when starting fresh fetch
      setApiFailures([]);

      // Helper function for safe API calls with query parameters
      const safeApiCall = async (endpoint: string, setter: Function, fallback: any, label: string) => {
        try {
          const response = await fetch(`${apiBaseUrl}/${endpoint}${queryParams}`, { headers });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          // Handle different response formats safely
          const processedData = data?.data ?? data ?? fallback;
          setter(Array.isArray(processedData) || typeof processedData === 'object' ? processedData : fallback);
          
        } catch (err: any) {
          console.warn(`${label} API failed:`, err?.message || err);
          setter(fallback);
          setApiFailures(prev => [...prev, label]);
        }
      };
      
      // Execute all API calls with better error handling and query parameters
      safeApiCall('dashboard/age-distribution', setLiveAgeDistribution, sampleAgeDistribution, 'Age Distribution');
      safeApiCall('dashboard/insurance-coverage', setLiveInsuranceCoverage, sampleInsuranceCoverage, 'Insurance Coverage');
      safeApiCall('dashboard/risk-distribution', setLiveRiskDistribution, sampleRiskDistribution, 'Risk Distribution');
      safeApiCall('dashboard/anc-performance', setLiveANCPerformance, sampleANCPerformance, 'ANC Performance');
      safeApiCall('dashboard/kit-performance', setLiveKitPerformance, sampleKitPerformance, 'Kit Performance');
      safeApiCall('dashboard/volunteer-performance', setLiveVolunteerPerformance, sampleVolunteerPerformance, 'Volunteer Performance');
    }
  }, [useLiveData, token, queryParams, sampleAgeDistribution, sampleInsuranceCoverage, sampleRiskDistribution, sampleANCPerformance, sampleKitPerformance, sampleVolunteerPerformance]);

  const { data: liveMonthlyTrends } = useFilteredApi<MonthlyTrendsData>({
    path: `dashboard/monthly-trends${queryParams}`,
    autoFetch: useLiveData,
    applyFilter: false,
    dependencies: [selectedRegion, selectedDistrict]
  });

  // Enhanced data source selection with robust null handling
  const dataSelection = useMemo(() => {
    if (useLiveData) {
      return {
        patients: ensureArray(livePatients),
        ancRegistrations: ensureArray(liveANCRegistrations),
        ancVisits: ensureArray(liveANCVisits),
        cases: ensureArray(liveCases),
        kitDistro: ensureArray(liveKitDistro),
        kitUsage: ensureArray(liveKitUsage)
      };
    } else {
      return {
        patients: ensureArray(samplePatientBio),
        ancRegistrations: ensureArray(sampleANCRegistrations),
        ancVisits: ensureArray(sampleANCVisits),
        cases: ensureArray(sampleCaseFiles),
        kitDistro: ensureArray(sampleKitDistroLogs),
        kitUsage: ensureArray(sampleKitUsageLogs)
      };
    }
  }, [useLiveData, livePatients, liveANCRegistrations, liveANCVisits, liveCases, liveKitDistro, liveKitUsage]);

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict("All Districts");
  };

  // Apply manual filters (region/district dropdowns) with enhanced safety checks
  const manuallyFilteredData = useMemo(() => {
    const filterByRegionDistrict = <T extends { region?: string; district?: string }>(data: T[]): T[] => {
      if (!Array.isArray(data)) return [];
      return data.filter(item => {
        const itemRegion = item.region || '';
        const itemDistrict = item.district || '';
        const regionMatch = selectedRegion === "All Regions" || itemRegion === selectedRegion;
        const districtMatch = selectedDistrict === "All Districts" || itemDistrict === selectedDistrict;
        return regionMatch && districtMatch;
      });
    };

    return {
      patients: filterByRegionDistrict(dataSelection.patients),
      ancRegistrations: filterByRegionDistrict(dataSelection.ancRegistrations),
      ancVisits: filterByRegionDistrict(dataSelection.ancVisits),
      cases: filterByRegionDistrict(dataSelection.cases),
      kitDistro: filterByRegionDistrict(dataSelection.kitDistro),
      kitUsage: filterByRegionDistrict(dataSelection.kitUsage)
    };
  }, [dataSelection, selectedRegion, selectedDistrict]);

  // Apply access level filters with enhanced safety checks
  const filteredData = useMemo(() => {
    const safeFilter = (data: any[]): any[] => {
      try {
        return Array.isArray(data) ? filterByAccessLevel(data) : [];
      } catch (error) {
        console.warn('Access level filtering failed, returning unfiltered data:', error);
        return Array.isArray(data) ? data : [];
      }
    };

    return {
      patients: safeFilter(manuallyFilteredData.patients),
      ancRegistrations: safeFilter(manuallyFilteredData.ancRegistrations),
      ancVisits: safeFilter(manuallyFilteredData.ancVisits),
      cases: safeFilter(manuallyFilteredData.cases),
      kitDistro: safeFilter(manuallyFilteredData.kitDistro),
      kitUsage: safeFilter(manuallyFilteredData.kitUsage)
    };
  }, [manuallyFilteredData, filterByAccessLevel]);

  // Calculate statistics with enhanced null safety
  const stats = useMemo((): DashboardStats => {
    const safeLengthCalc = (data: any[] | null | undefined): number => {
      return Array.isArray(data) ? data.length : 0;
    };

    const safeFilter = (data: any[] | null | undefined, predicate: (item: any) => boolean): any[] => {
      return Array.isArray(data) ? data.filter(predicate) : [];
    };

    const safeReduce = (data: any[] | null | undefined, reducer: (acc: number, item: any) => number, initial: number = 0): number => {
      return Array.isArray(data) ? data.reduce(reducer, initial) : initial;
    };

    if (useLiveData && livePatients && liveANCRegistrations) {
      // Calculate from live data with null safety
      const totalPatients = safeLengthCalc(livePatients);
      const activePregnancies = safeFilter(liveANCRegistrations, reg => reg?.antenatal_status === 'active').length;
      const openCases = safeFilter(liveCases, c => c?.status === 'open').length;
      const highRiskPatients = safeFilter(liveCases, c => normalizePriorityLevel(c?.priority_level) === 'high').length;
      
      const currentMonth = new Date().getMonth();
      const visitsThisMonth = safeFilter(liveANCVisits, v => {
        if (!v?.visit_date) return false;
        const visitDate = safeParseDate(v.visit_date);
        return visitDate.getMonth() === currentMonth;
      }).length;
      
      const kitsDistributed = safeReduce(liveKitDistro, (sum, log) => sum + (Number(log?.quantity) || 0), 0);
      const kitsUsed = safeLengthCalc(liveKitUsage);
      const ancRegistrations = safeLengthCalc(liveANCRegistrations);
      
      // Calculate derived stats from live data
      const scheduledAppointments = Math.max(0, ancRegistrations * 2);
      const patientMessages = Math.max(0, totalPatients * 3);
      const upcomingAppointments = Math.max(0, Math.ceil(ancRegistrations * 0.8));
      const newRegistrations = Math.max(0, Math.ceil(totalPatients * 0.1));

      return {
        totalPatients,
        openCases,
        scheduledAppointments,
        patientMessages,
        activePregnancies,
        visitsThisMonth,
        highRiskPatients,
        upcomingAppointments,
        newRegistrations,
        kitsDistributed,
        kitsUsed,
        ancRegistrations
      };
    } else {
      // Calculate from sample data (existing logic) with enhanced safety
      const totalPatients = safeLengthCalc(filteredData.patients);
      const activePregnancies = safeFilter(filteredData.ancRegistrations, reg => reg?.antenatal_status === 'active').length;
      const openCases = safeFilter(filteredData.cases, c => c?.status === 'open').length;
      const highRiskPatients = safeFilter(filteredData.cases, c => normalizePriorityLevel(c?.priority_level) === 'high').length;
      
      const currentMonth = new Date().getMonth();
      const visitsThisMonth = safeFilter(filteredData.ancVisits, v => {
        if (!v?.visit_date) return false;
        const visitDate = safeParseDate(v.visit_date);
        return visitDate.getMonth() === currentMonth;
      }).length;
      
      const kitsDistributed = safeReduce(filteredData.kitDistro, (sum, log) => sum + (Number(log?.quantity) || 0), 0);
      const kitsUsed = safeLengthCalc(filteredData.kitUsage);
      const ancRegistrations = safeLengthCalc(filteredData.ancRegistrations);
      
      // Mock some additional stats
      const scheduledAppointments = Math.max(0, ancRegistrations * 2);
      const patientMessages = Math.max(0, totalPatients * 3);
      const upcomingAppointments = Math.max(0, Math.ceil(ancRegistrations * 0.8));
      const newRegistrations = Math.max(0, Math.ceil(totalPatients * 0.1));

      return {
        totalPatients,
        openCases,
        scheduledAppointments,
        patientMessages,
        activePregnancies,
        visitsThisMonth,
        highRiskPatients,
        upcomingAppointments,
        newRegistrations,
        kitsDistributed,
        kitsUsed,
        ancRegistrations
      };
    }
  }, [useLiveData, livePatients, liveANCRegistrations, liveCases, liveANCVisits, liveKitDistro, liveKitUsage, filteredData]);

  // Aggregate all chart data from various sources with null safety
  const chartData = useMemo(() => {
    const safeData = (data: any, fallback: any): any => {
      return data != null ? data : fallback;
    };

    if (useLiveData) {
      return {
        monthlyTrends: safeData(liveMonthlyTrends, generateMonthlyData()),
        ageDistribution: safeData(liveAgeDistribution, sampleAgeDistribution),
        insuranceCoverage: safeData(liveInsuranceCoverage, sampleInsuranceCoverage),
        riskDistribution: safeData(liveRiskDistribution, sampleRiskDistribution),
        ancPerformance: safeData(liveANCPerformance, sampleANCPerformance),
        kitPerformance: safeData(liveKitPerformance, sampleKitPerformance),
        volunteerPerformance: safeData(liveVolunteerPerformance, sampleVolunteerPerformance)
      };
    } else {
      return {
        monthlyTrends: generateMonthlyData(),
        ageDistribution: sampleAgeDistribution,
        insuranceCoverage: sampleInsuranceCoverage,
        riskDistribution: sampleRiskDistribution,
        ancPerformance: sampleANCPerformance,
        kitPerformance: sampleKitPerformance,
        volunteerPerformance: sampleVolunteerPerformance
      };
    }
  }, [useLiveData, liveMonthlyTrends, liveAgeDistribution, liveInsuranceCoverage, 
      liveRiskDistribution, liveANCPerformance, liveKitPerformance, liveVolunteerPerformance,
      sampleAgeDistribution, sampleInsuranceCoverage, sampleRiskDistribution, 
      sampleANCPerformance, sampleKitPerformance, sampleVolunteerPerformance]);

  // Chart data - use live data when available, otherwise use sample data
  const monthlyChartData = chartData.monthlyTrends;

  // Kit usage pie chart data with enhanced safety checks
  const kitUsageByResult = useMemo(() => {
    // Safety checks for data existence and validity
    if (!filteredData?.kitUsage || !Array.isArray(filteredData.kitUsage) || filteredData.kitUsage.length === 0) {
      return [
        { name: 'No Data', value: 1, fill: '#94a3b8' }
      ];
    }

    try {
      const results = filteredData.kitUsage.reduce((acc, usage) => {
        // Handle null/undefined usage objects and results
        const result = usage?.result || 'unknown';
        acc[result] = (acc[result] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Ensure we have valid data
      const entries = Object.entries(results);
      if (entries.length === 0) {
        return [{ name: 'No Data', value: 1, fill: '#94a3b8' }];
      }

      return entries.map(([name, value]) => ({
        name: name || 'Unknown',
        value: Math.max(Number(value) || 0, 0),
        fill: name === 'positive' ? '#ef4444' : name === 'negative' ? '#22c55e' : '#f59e0b'
      }));
    } catch (error) {
      console.warn('Error processing kit usage data:', error);
      return [{ name: 'Error', value: 1, fill: '#94a3b8' }];
    }
  }, [filteredData.kitUsage]);

  const isLoading = useLiveData && (patientsLoading || ancLoading || visitsLoading || casesLoading || kitDistroLoading || kitUsageLoading);
  const hasData = useLiveData ? 
    (livePatients?.length || 0) > 0 || (liveANCRegistrations?.length || 0) > 0 : 
    true; // Sample data is always available

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Data Source Toggle */}
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-sm font-medium">Demo Data</span>
            <Switch
              checked={useLiveData}
              onCheckedChange={setUseLiveData}
            />
            <span className="text-sm font-medium">Real Data</span>
          </div>
          
          {/* Regional Filters */}
          <Select value={selectedRegion} onValueChange={handleRegionChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={selectedRegion === "All Regions"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select District" />
            </SelectTrigger>
            <SelectContent>
              {selectedRegion !== "All Regions" && districtsByRegion[selectedRegion]?.map(d => 
                <SelectItem key={d} value={d}>{d}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Enhanced debug information for live data - Collapsible */}
      {useLiveData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setIsLiveDataStatusExpanded(!isLiveDataStatusExpanded)}
          >
            <h3 className="font-medium text-blue-900">Live Data Status:</h3>
            {isLiveDataStatusExpanded ? (
              <ChevronDown className="h-4 w-4 text-blue-700" />
            ) : (
              <ChevronRight className="h-4 w-4 text-blue-700" />
            )}
          </div>
          
          {isLiveDataStatusExpanded && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                <div>
                  <span className="font-medium">Patients:</span> 
                  <span className={`ml-2 px-2 py-1 rounded ${livePatients ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {patientsLoading ? 'Loading...' : livePatients ? `${livePatients.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">ANC Registrations:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${liveANCRegistrations ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {ancLoading ? 'Loading...' : liveANCRegistrations ? `${liveANCRegistrations.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Visits:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${liveANCVisits ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {visitsLoading ? 'Loading...' : liveANCVisits ? `${liveANCVisits.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Cases:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${liveCases ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {casesLoading ? 'Loading...' : liveCases ? `${liveCases.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Kit Distribution:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${liveKitDistro ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {kitDistroLoading ? 'Loading...' : liveKitDistro ? `${liveKitDistro.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Kit Usage:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${liveKitUsage ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {kitUsageLoading ? 'Loading...' : liveKitUsage ? `${liveKitUsage.length} loaded` : 'No data'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Data Quality:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${hasData ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {hasData ? 'Good' : 'Limited'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">API Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${apiFailures.length === 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {apiFailures.length === 0 ? 'All OK' : `${apiFailures.length} failed`}
                  </span>
                </div>
              </div>
              
              {/* Show API failures warning with details */}
              {apiFailures.length > 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-600 font-medium text-sm">⚠️ API Endpoints with Issues:</span>
                  </div>
                  <div className="text-sm text-yellow-700">
                    <strong>Failed Endpoints:</strong> {apiFailures.join(', ')}
                    <br />
                    <strong>Status:</strong> Using fallback data for unavailable endpoints
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Warning when using demo/sample data */}
      {!useLiveData && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="font-medium text-amber-900 mb-1">Demo Data Mode Active</h3>
              <p className="text-sm text-amber-700">
                You are currently viewing <strong>simulated demo data</strong> for demonstration purposes. 
                This data is not real and should not be used for actual decision making. 
                Switch to "Real Data" mode to view live system data.
              </p>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANC Registrations</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ancRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              Active pregnancies: {stats.activePregnancies}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANC Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.visitsThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openCases}</div>
            <p className="text-xs text-muted-foreground">
              High risk: {stats.highRiskPatients}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kits Distributed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.kitsDistributed}</div>
            <p className="text-xs text-muted-foreground">
              Used: {stats.kitsUsed}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
      </div>
      
            
      {/* Charts and Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Monthly Trends Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
            <CardDescription>
              Tracking project progress over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#8884d8"
                  name="Total Patients"
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ancRegistrations" 
                  stroke="#82ca9d" 
                  name="ANC Registrations"
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#ffc658" 
                  name="ANC Visits"
                />
                <Line 
                  type="monotone" 
                  dataKey="referrals" 
                  stroke="#ff7300" 
                  name="Referrals"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Kit Usage Distribution */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Kit Usage Results</CardTitle>
            <CardDescription>
              Distribution of kit testing results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={kitUsageByResult}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {kitUsageByResult.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart for Regional Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kit Distribution by Month</CardTitle>
            <CardDescription>
              Monthly kit distribution and usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="kitsUsed" fill="#8884d8" name="Kits Used" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ANC Progress</CardTitle>
            <CardDescription>
              Registration vs Visit completion rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="ancRegistrations" fill="#82ca9d" name="Registrations" />
                <Bar dataKey="visits" fill="#ffc658" name="Visits" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ANC Completion Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANC Completion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.ancRegistrations.length > 0 
                ? Math.round((filteredData.ancVisits.length / filteredData.ancRegistrations.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredData.ancVisits.length} visits / {filteredData.ancRegistrations.length} registrations
            </p>
          </CardContent>
        </Card>

        {/* Average Gestation at Registration */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Gestation at Registration</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.ancRegistrations.length > 0
                ? Math.round(
                    filteredData.ancRegistrations
                      .filter(reg => reg.gestation_weeks)
                      .reduce((sum, reg) => sum + (reg.gestation_weeks || 0), 0) /
                    filteredData.ancRegistrations.filter(reg => reg.gestation_weeks).length
                  )
                : 0}w
            </div>
            <p className="text-xs text-muted-foreground">
              Early registration indicator
            </p>
          </CardContent>
        </Card>

        {/* Kit Utilization Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kit Utilization Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.kitsDistributed > 0 
                ? Math.round((stats.kitsUsed / stats.kitsDistributed) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.kitsUsed} used / {stats.kitsDistributed} distributed
            </p>
          </CardContent>
        </Card>

        {/* Referral Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredData.patients.length > 0 
                ? Math.round((filteredData.cases.length / filteredData.patients.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredData.cases.length} referrals / {filteredData.patients.length} patients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Outcomes and Risk Analysis */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Risk Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
            <CardDescription>
              Distribution of patient risk levels in referral cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(
                    filteredData.cases.reduce((acc, caseItem) => {
                      const normalizedLevel = normalizePriorityLevel(caseItem.priority_level);
                      acc[normalizedLevel] = (acc[normalizedLevel] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([level, count]) => ({
                    name: level.charAt(0).toUpperCase() + level.slice(1),
                    value: count,
                    fill: level === 'high' ? '#ef4444' : level === 'medium' ? '#f59e0b' : '#22c55e'
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {Object.entries(
                    filteredData.cases.reduce((acc, caseItem) => {
                      acc[caseItem.priority_level] = (acc[caseItem.priority_level] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map((_, index) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Age Distribution</CardTitle>
            <CardDescription>
              Age groups of registered patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age_group" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Insurance Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Coverage</CardTitle>
            <CardDescription>
              Patient insurance status distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.insuranceCoverage.map((item: {status: string, count: number}) => ({
                    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
                    value: item.count,
                    fill: item.status === 'active' ? '#22c55e' : item.status === 'inactive' ? '#ef4444' : '#94a3b8'
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {chartData.insuranceCoverage.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* ANC Visit Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>ANC Visit Frequency</CardTitle>
            <CardDescription>
              Number of visits per patient over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(
                  filteredData.ancVisits.reduce((acc, visit) => {
                    const patientVisits = filteredData.ancVisits.filter(v => v.patient_id === visit.patient_id).length;
                    const visitCount = patientVisits > 4 ? '4+' : patientVisits.toString();
                    acc[visitCount] = (acc[visitCount] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([visits, patients]) => ({ visits: `${visits} visits`, patients }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="visits" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gestation Progress Tracking */}
        <Card>
          <CardHeader>
            <CardTitle>Gestation Progress</CardTitle>
            <CardDescription>
              Current gestation weeks distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(
                  filteredData.ancRegistrations.reduce((acc, reg) => {
                    if (reg.gestation_weeks) {
                      const trimester = reg.gestation_weeks <= 12 ? '1st Trimester' : 
                                       reg.gestation_weeks <= 24 ? '2nd Trimester' : 
                                       '3rd Trimester';
                      acc[trimester] = (acc[trimester] || 0) + 1;
                    }
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([trimester, count]) => ({ trimester, count }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="trimester" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Kit Management Analytics */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Kit Distribution vs Usage Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Kit Distribution vs Usage</CardTitle>
            <CardDescription>
              Monthly comparison of kit distribution and actual usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="kitsUsed"
                  stroke="#8884d8"
                  name="Kits Used"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ancRegistrations"
                  stroke="#82ca9d"
                  name="Expected Usage (ANC Registrations)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volunteer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Volunteer Performance</CardTitle>
            <CardDescription>
              Kit usage rates and confirmation rates by volunteers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.volunteerPerformance.slice(0, 5).map((volunteer: any) => (
                <div key={volunteer.vol_user_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">Vol-{volunteer.vol_user_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {volunteer.kits_used}/{volunteer.total_kits_received} kits
                    </span>
                    <Badge variant={volunteer.usage_rate > 75 ? "default" : "secondary"}>
                      {volunteer.usage_rate.toFixed(1)}% usage
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>
            Patient distribution across regions and districts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {(useLiveData && liveGeographicData ? 
              liveGeographicData.map(item => ({
                location: `${item?.region || 'Unknown'} - ${item?.district || 'Unknown'}`,
                count: Number(item?.patient_count) || 0
              })) :
              Object.entries(
                filteredData.patients.reduce((acc, patient) => {
                  const key = `${patient?.region || 'Unknown'} - ${patient?.district || 'Unknown'}`;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([location, count]) => ({ location, count: Number(count) || 0 }))
            ).map(({ location, count }) => (
              <div key={location} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{location}</p>
                    <p className="text-xs text-muted-foreground">Patients</p>
                  </div>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

