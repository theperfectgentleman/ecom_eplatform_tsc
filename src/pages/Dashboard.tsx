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
  year_of_birth: number;
  gender: string;
  contact_number?: string;
  region: string;
  district: string;
  sub_district: string;
  community: string;
  national_id?: string;
  insurance_status?: string;
  registration_date: string;
}

interface ANCRegistration {
  antenatal_registration_id: string;
  patient_id: string;
  registration_date: string;
  registration_number: string;
  parity?: number;
  gestation_weeks?: number;
  estimated_delivery_date?: string;
  antenatal_status: string;
  region: string;
  district: string;
  sub_district: string;
  community: string;
}

interface ANCVisit {
  antenatal_visit_id: string;
  patient_id: string;
  antenatal_registration_id: string;
  visit_date: string;
  gestation_weeks?: number;
  blood_pressure?: string;
  weight_kg?: number;
  next_visit_date?: string;
  region: string;
  district: string;
  sub_district: string;
  community: string;
}

interface CaseFile {
  case_file_id: string;
  patient_id: string;
  priority_level: string;
  status: string;
  date_created: string;
  region: string;
  district: string;
  sub_district: string;
  community: string;
  referral_reason_notes?: string;
  facility_referred_to?: string;
}

interface KitDistroLog {
  distro_id: string;
  quantity: number;
  vol_user_id: number;
  adm_user_id: number;
  vol_user_confirm: boolean;
  adm_user_confirm: boolean;
  distro_date: string;
  region: string;
  district: string;
  sub_district: string;
  community: string;
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
  region: string;
  district: string;
  sub_district: string;
  community: string;
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

const regions = ["All Regions", "Greater Accra", "Ashanti", "Western"];
const districtsByRegion: { [key: string]: string[] } = {
  "Greater Accra": ["All Districts", "Accra Metropolitan", "Tema Metropolitan"],
  "Ashanti": ["All Districts", "Kumasi Metropolitan", "Obuasi Municipal"],
  "Western": ["All Districts", "Sekondi-Takoradi Metropolitan", "Tarkwa-Nsuaem Municipal"],
};

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [useLiveData, setUseLiveData] = useState(false);
  const { filterByAccessLevel } = useAccessLevelFilter();
  const { token } = useAuth();

  // API calls for live data - using the correct dashboard endpoints that exist in your API
  const { data: livePatients, loading: patientsLoading } = useFilteredApi<PatientBio>({
    path: 'dashboard/patient-bio',
    autoFetch: useLiveData,
    applyFilter: false // Dashboard endpoints already handle filtering
  });

  const { data: liveANCRegistrations, loading: ancLoading } = useFilteredApi<ANCRegistration>({
    path: 'dashboard/antenatal-registration',
    autoFetch: useLiveData,
    applyFilter: false
  });

  // Sample data for analytics
  const sampleAgeDistribution = [
    { age_group: 'Under 20', count: 45 },
    { age_group: '20-24', count: 123 },
    { age_group: '25-29', count: 89 },
    { age_group: '30-34', count: 67 },
    { age_group: '35+', count: 32 }
  ];

  const sampleInsuranceCoverage = [
    { status: 'active', count: 248 },
    { status: 'inactive', count: 89 },
    { status: 'unknown', count: 19 }
  ];

  const sampleRiskDistribution = [
    { priority_level: 'low', count: 178 },
    { priority_level: 'medium', count: 134 },
    { priority_level: 'high', count: 44 }
  ];

  const sampleANCPerformance = {
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
  };

  const sampleKitPerformance = {
    total_distributed: 245,
    total_used: 189,
    utilization_rate: 77.1,
    positive_rate: 23.8,
    active_volunteers: 12
  };

  const sampleVolunteerPerformance = [
    { vol_user_id: 1, total_kits_received: 45, kits_used: 38, confirmation_rate: 84.4, usage_rate: 76.2 },
    { vol_user_id: 2, total_kits_received: 32, kits_used: 28, confirmation_rate: 87.5, usage_rate: 81.3 },
    { vol_user_id: 3, total_kits_received: 28, kits_used: 23, confirmation_rate: 82.1, usage_rate: 78.9 }
  ];

  const { data: liveANCVisits, loading: visitsLoading } = useFilteredApi<ANCVisit>({
    path: 'dashboard/antenatal-visits',
    autoFetch: useLiveData,
    applyFilter: false
  });

  const { data: liveCases, loading: casesLoading } = useFilteredApi<CaseFile>({
    path: 'dashboard/case-files',
    autoFetch: useLiveData,
    applyFilter: false
  });

  const { data: liveKitDistro, loading: kitDistroLoading } = useFilteredApi<KitDistroLog>({
    path: 'dashboard/kit-distribution',
    autoFetch: useLiveData,
    applyFilter: false
  });

  const { data: liveKitUsage, loading: kitUsageLoading } = useFilteredApi<KitUsageLog>({
    path: 'dashboard/kit-usage',
    autoFetch: useLiveData,
    applyFilter: false
  });

  // Enable the geographic data call since the endpoint exists
  const { data: liveGeographicData } = useFilteredApi<{region: string, district: string, patient_count: number}>({
    path: 'dashboard/geographic-distribution',
    autoFetch: useLiveData,
    applyFilter: false
  });

  // Additional API calls for analytics (using regular fetch since they don't return FilterableData)
  const [liveAgeDistribution, setLiveAgeDistribution] = useState<{age_group: string, count: number}[]>([]);
  const [liveInsuranceCoverage, setLiveInsuranceCoverage] = useState<{status: string, count: number}[]>([]);
  const [liveRiskDistribution, setLiveRiskDistribution] = useState<{priority_level: string, count: number}[]>([]);
  const [liveANCPerformance, setLiveANCPerformance] = useState<any>(null);
  const [liveKitPerformance, setLiveKitPerformance] = useState<any>(null);
  const [liveVolunteerPerformance, setLiveVolunteerPerformance] = useState<any[]>([]);

  // Fetch analytics data when live data is enabled
  useEffect(() => {
    if (useLiveData && token) {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Age distribution
      fetch(`${apiBaseUrl}/dashboard/age-distribution`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveAgeDistribution(data.data || data))
        .catch(err => {
          console.warn('Age distribution API failed:', err);
          setLiveAgeDistribution(sampleAgeDistribution);
        });

      // Insurance coverage
      fetch(`${apiBaseUrl}/dashboard/insurance-coverage`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveInsuranceCoverage(data.data || data))
        .catch(err => {
          console.warn('Insurance coverage API failed:', err);
          setLiveInsuranceCoverage(sampleInsuranceCoverage);
        });

      // Risk distribution
      fetch(`${apiBaseUrl}/dashboard/risk-distribution`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveRiskDistribution(data.data || data))
        .catch(err => {
          console.warn('Risk distribution API failed:', err);
          setLiveRiskDistribution(sampleRiskDistribution);
        });

      // ANC Performance
      fetch(`${apiBaseUrl}/dashboard/anc-performance`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveANCPerformance(data.data || data))
        .catch(err => {
          console.warn('ANC performance API failed:', err);
          setLiveANCPerformance(sampleANCPerformance);
        });

      // Kit Performance
      fetch(`${apiBaseUrl}/dashboard/kit-performance`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveKitPerformance(data.data || data))
        .catch(err => {
          console.warn('Kit performance API failed:', err);
          setLiveKitPerformance(sampleKitPerformance);
        });

      // Volunteer Performance
      fetch(`${apiBaseUrl}/dashboard/volunteer-performance`, { headers })
        .then(res => res.ok ? res.json() : Promise.reject(`Status: ${res.status}`))
        .then(data => setLiveVolunteerPerformance(data.data || data))
        .catch(err => {
          console.warn('Volunteer performance API failed:', err);
          setLiveVolunteerPerformance(sampleVolunteerPerformance);
        });
    }
  }, [useLiveData, token]);

  const { data: liveMonthlyTrends } = useFilteredApi<MonthlyTrendsData>({
    path: 'dashboard/monthly-trends',
    autoFetch: useLiveData,
    applyFilter: false
  });

  // Data source selection
  const patients = useLiveData ? (livePatients || []) : samplePatientBio;
  const ancRegistrations = useLiveData ? (liveANCRegistrations || []) : sampleANCRegistrations;
  const ancVisits = useLiveData ? (liveANCVisits || []) : sampleANCVisits;
  const cases = useLiveData ? (liveCases || []) : sampleCaseFiles;
  const kitDistro = useLiveData ? (liveKitDistro || []) : sampleKitDistroLogs;
  const kitUsage = useLiveData ? (liveKitUsage || []) : sampleKitUsageLogs;

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict("All Districts");
  };

  // Apply manual filters (region/district dropdowns) with safety checks
  const manuallyFilteredData = useMemo(() => {
    const filterByRegionDistrict = <T extends { region: string; district: string }>(data: T[]) => {
      if (!Array.isArray(data)) return [];
      return data.filter(item => 
        (selectedRegion === "All Regions" || item.region === selectedRegion) &&
        (selectedDistrict === "All Districts" || item.district === selectedDistrict)
      );
    };

    return {
      patients: filterByRegionDistrict(patients || []),
      ancRegistrations: filterByRegionDistrict(ancRegistrations || []),
      ancVisits: filterByRegionDistrict(ancVisits || []),
      cases: filterByRegionDistrict(cases || []),
      kitDistro: filterByRegionDistrict(kitDistro || []),
      kitUsage: filterByRegionDistrict(kitUsage || [])
    };
  }, [patients, ancRegistrations, ancVisits, cases, kitDistro, kitUsage, selectedRegion, selectedDistrict]);

  // Apply access level filters with safety checks
  const filteredData = useMemo(() => {
    return {
      patients: filterByAccessLevel(manuallyFilteredData.patients || []),
      ancRegistrations: filterByAccessLevel(manuallyFilteredData.ancRegistrations || []),
      ancVisits: filterByAccessLevel(manuallyFilteredData.ancVisits || []),
      cases: filterByAccessLevel(manuallyFilteredData.cases || []),
      kitDistro: filterByAccessLevel(manuallyFilteredData.kitDistro || []),
      kitUsage: filterByAccessLevel(manuallyFilteredData.kitUsage || [])
    };
  }, [manuallyFilteredData, filterByAccessLevel]);

  // Calculate statistics - use live data when available
  const stats = useMemo((): DashboardStats => {
    if (useLiveData && livePatients && liveANCRegistrations) {
      // Calculate from live data
      const totalPatients = livePatients.length;
      const activePregnancies = liveANCRegistrations.filter(reg => reg.antenatal_status === 'active').length;
      const openCases = liveCases?.filter(c => c.status === 'open').length || 0;
      const highRiskPatients = liveCases?.filter(c => c.priority_level === 'high').length || 0;
      const visitsThisMonth = liveANCVisits?.filter(v => 
        new Date(v.visit_date).getMonth() === new Date().getMonth()
      ).length || 0;
      const kitsDistributed = liveKitDistro?.reduce((sum: number, log: any) => sum + log.quantity, 0) || 0;
      const kitsUsed = liveKitUsage?.length || 0;
      const ancRegistrations = liveANCRegistrations.length;
      
      // Calculate derived stats from live data
      const scheduledAppointments = ancRegistrations * 2;
      const patientMessages = totalPatients * 3;
      const upcomingAppointments = Math.ceil(ancRegistrations * 0.8);
      const newRegistrations = Math.ceil(totalPatients * 0.1);

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
      // Calculate from sample data (existing logic)
      const totalPatients = filteredData.patients.length;
      const activePregnancies = filteredData.ancRegistrations.filter(reg => reg.antenatal_status === 'active').length;
      const openCases = (filteredData.cases || []).filter(c => c.status === 'open').length;
      const highRiskPatients = (filteredData.cases || []).filter(c => c.priority_level === 'high').length;
      const visitsThisMonth = (filteredData.ancVisits || []).filter(v => 
        new Date(v.visit_date).getMonth() === new Date().getMonth()
      ).length;
      const kitsDistributed = (filteredData.kitDistro || []).reduce((sum, log) => sum + log.quantity, 0);
      const kitsUsed = (filteredData.kitUsage || []).length;
      const ancRegistrations = (filteredData.ancRegistrations || []).length;
      
      // Mock some additional stats
      const scheduledAppointments = ancRegistrations * 2;
      const patientMessages = totalPatients * 3;
      const upcomingAppointments = Math.ceil(ancRegistrations * 0.8);
      const newRegistrations = Math.ceil(totalPatients * 0.1);

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

  // Aggregate all chart data from various sources
  const chartData = useMemo(() => {
    if (useLiveData) {
      return {
        monthlyTrends: liveMonthlyTrends || generateMonthlyData(),
        ageDistribution: liveAgeDistribution || sampleAgeDistribution,
        insuranceCoverage: liveInsuranceCoverage || sampleInsuranceCoverage,
        riskDistribution: liveRiskDistribution || sampleRiskDistribution,
        ancPerformance: liveANCPerformance || sampleANCPerformance,
        kitPerformance: liveKitPerformance || sampleKitPerformance,
        volunteerPerformance: liveVolunteerPerformance || sampleVolunteerPerformance
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
      liveRiskDistribution, liveANCPerformance, liveKitPerformance, liveVolunteerPerformance]);

  // Chart data - use live data when available, otherwise use sample data
  const monthlyChartData = chartData.monthlyTrends;

  // Kit usage pie chart data with safety checks
  const kitUsageByResult = useMemo(() => {
    if (!filteredData.kitUsage || !Array.isArray(filteredData.kitUsage)) {
      return [
        { name: 'No Data', value: 1, fill: '#94a3b8' }
      ];
    }

    const results = filteredData.kitUsage.reduce((acc, usage) => {
      acc[usage.result] = (acc[usage.result] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(results).map(([name, value]) => ({
      name,
      value,
      fill: name === 'positive' ? '#ef4444' : name === 'negative' ? '#22c55e' : '#f59e0b'
    }));
  }, [filteredData.kitUsage]);

  const isLoading = useLiveData && (patientsLoading || ancLoading || visitsLoading || casesLoading || kitDistroLoading || kitUsageLoading);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          {/* Data Source Toggle */}
          <div className="flex items-center space-x-2 mr-4">
            <span className="text-sm font-medium">Sample Data</span>
            <Switch
              checked={useLiveData}
              onCheckedChange={setUseLiveData}
            />
            <span className="text-sm font-medium">Live Data</span>
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

      {/* Debug information for live data */}
      {useLiveData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Live Data Status:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading dashboard data...</p>
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
                      acc[caseItem.priority_level] = (acc[caseItem.priority_level] || 0) + 1;
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
            <CardTitle>Volunteer Kit Distribution</CardTitle>
            <CardDescription>
              Distribution confirmation rates by volunteers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(filteredData.kitDistro || []).slice(0, 5).map((distro) => (
                <div key={distro.distro_id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span className="text-sm font-medium">Vol-{distro.vol_user_id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{distro.quantity} kits</span>
                    <Badge variant={distro.vol_user_confirm && distro.adm_user_confirm ? "default" : "secondary"}>
                      {distro.vol_user_confirm && distro.adm_user_confirm ? "Confirmed" : "Pending"}
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
                location: `${item.region} - ${item.district}`,
                count: item.patient_count
              })) :
              Object.entries(
                filteredData.patients.reduce((acc, patient) => {
                  const key = `${patient.region} - ${patient.district}`;
                  acc[key] = (acc[key] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([location, count]) => ({ location, count }))
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

