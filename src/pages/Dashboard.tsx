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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import {
  Users,
  Baby,
  Package,
  Calendar,
  UserCheck,
  TrendingUp,
  Heart,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
 
interface DashboardAggregates {
  overview: {
    totalPatients: number;
    totalAntenatalRegistrations: number;
    totalAncVisits: number;
    registrationsLastPeriod: number;
    kitsDistributedLastPeriod: number;
    kitsUsedLastPeriod: number;
    referralsLastPeriod: number;
  };
  trends: {
    registrationsByWeek: Array<{
      week: string;
      cnt: number;
    }>;
  };
  kits: {
    totalDistributed: number;
    confirmedByVolunteers: number;
    totalUsed: number;
    usageRatePercent: number;
  };
  testing: {
    totalTests: number;
    positives: number;
    positivityPercent: number;
  };
  antenatal: {
    registrationsLastPeriod: number;
    earlyRegistrationsLastPeriod: number;
    earlyRegistrationPercent: number;
    totalRegistrationsAllTime: number;
    avgVisitsPerRegistration: number;
    percentRegistrationsWithVisit: number;
    avgDaysToFirstVisit: number;
    visitsByGestation: {
      'visits_<=12weeks': number;
      'visits_13_20weeks': number;
      'visits_21_28weeks': number;
      'visits_29plus': number;
    };
  };
  referrals: {
    totalAllTime: number;
    lastPeriod: number;
    withPriorityCount: number;
  };
  geo: Array<{
    region: string;
    district: string;
    patients: number;
  }>;
  age: {
    average: number;
    median: number;
    distribution: {
      '<18': number;
      '18-24': number;
      '25-34': number;
      '35-44': number;
      '45+': number;
    };
  };
  meta: {
    filtered: boolean;
    filter_level: 'national' | 'region' | 'district' | 'subdistrict';
    params: {
      days: number;
      weeks: number;
    };
  };
}

interface VolunteerPerformance {
  user_id: number;
  volunteer_name: string;
  patients_registered: number;
  patients_registered_30d: number;
  first_registration: string | null;
  last_registration: string | null;
}

interface Patient {
  id: string | number;
  registration_date: string; // ISO date string
  region: string;
  district: string;
  subdistrict?: string; // May not be available in all data
  community?: string; // May not be available in all data
  username: string; // Derived registrar label
  age?: number; // Computed from dob / year_of_birth when available
  dob?: string | null;
  year_of_birth?: number | null;
  assigned_user_id?: number | null;
}

const TIMEFRAME_OPTIONS = [
  { value: '30d', label: 'Last 30 Days', days: 30, weeks: 12 },
  { value: '90d', label: 'Last 90 Days', days: 90, weeks: 24 },
  { value: '180d', label: 'Last 180 Days', days: 180, weeks: 36 },
  { value: '365d', label: 'Last 365 Days', days: 365, weeks: 52 },
  { value: 'all', label: 'All Available Data', days: 1460, weeks: 208 },
];

const PATIENT_LIMIT_OPTIONS = [
  { value: '200', label: 'Top 200 records' },
  { value: '500', label: 'Top 500 records' },
  { value: '1000', label: 'Top 1,000 records' },
  { value: '2500', label: 'Top 2,500 records' },
  { value: '3000', label: 'Top 3,000 records' },
];

const Dashboard = () => {
  const { token, user } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(TIMEFRAME_OPTIONS[0].value);
  const [patientLimit, setPatientLimit] = useState<string>(PATIENT_LIMIT_OPTIONS[4].value); // Default to 3000

  // Main aggregated data (1 API call)
  const [aggregates, setAggregates] = useState<DashboardAggregates | null>(null);
  const [aggregatesLoading, setAggregatesLoading] = useState(false);
  const [aggregatesError, setAggregatesError] = useState<string | null>(null);

  // Volunteer performance (1 additional API call - most actionable for users)
  const [volunteers, setVolunteers] = useState<VolunteerPerformance[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  // Patients data for admin stats
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  
  // Collapsible admin stats state
  const [adminStatsExpanded, setAdminStatsExpanded] = useState(true);
  
  // Sorting state for geographic table
  const [geoSortField, setGeoSortField] = useState<'region' | 'district' | 'subdistrict' | 'community' | 'count'>('count');
  const [geoSortDirection, setGeoSortDirection] = useState<'asc' | 'desc'>('desc');

  // Client-side filters for Admin Insights
  const [colFilters, setColFilters] = useState<{
    region: string[];
    district: string[];
    subdistrict: string[];
    community: string[];
  }>({
    region: [],
    district: [],
    subdistrict: [],
    community: []
  });

  // Build query parameters
  const timeframeConfig = useMemo(() => {
    return TIMEFRAME_OPTIONS.find(option => option.value === selectedTimeframe) ?? TIMEFRAME_OPTIONS[0];
  }, [selectedTimeframe]);

  const baseQueryString = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedRegion !== "All Regions") params.append('region', selectedRegion);
    if (selectedDistrict !== "All Districts") params.append('district', selectedDistrict);
    if (timeframeConfig.days) params.append('days', timeframeConfig.days.toString());
    if (timeframeConfig.weeks) params.append('weeks', timeframeConfig.weeks.toString());
    return params.toString();
  }, [selectedRegion, selectedDistrict, timeframeConfig]);

  const aggregatesQueryString = baseQueryString ? `?${baseQueryString}` : '';

  const patientQueryString = useMemo(() => {
    const params = new URLSearchParams(baseQueryString);
    params.set('limit', patientLimit);
    params.set('page', '1');
    return `?${params.toString()}`;
  }, [baseQueryString, patientLimit]);

  const patientLimitNumber = useMemo(() => Number(patientLimit) || 0, [patientLimit]);

  // Reset client-side filters when main data changes
  useEffect(() => {
    setColFilters({
      region: [],
      district: [],
      subdistrict: [],
      community: []
    });
  }, [patients]);

  // Compute filter options based on all patients data
  const filterOptions = useMemo(() => {
    const getOptions = (key: keyof Patient) => {
      const values = Array.from(new Set(patients.map(p => p[key]).filter(Boolean) as string[])).sort();
      return values.map(v => ({ label: v, value: v }));
    };
    return {
      region: getOptions('region'),
      district: getOptions('district'),
      subdistrict: getOptions('subdistrict'),
      community: getOptions('community'),
    };
  }, [patients]);

  // Helper to normalize patient objects from API
  const normalizePatient = (raw: any): Patient => {
    const now = new Date();

    const computeAge = (): number | undefined => {
      if (raw.age != null && !isNaN(Number(raw.age))) {
        return Number(raw.age);
      }

      if (raw.dob) {
        const dobDate = new Date(raw.dob);
        if (!isNaN(dobDate.getTime())) {
          let ageYears = now.getFullYear() - dobDate.getFullYear();
          const monthDiff = now.getMonth() - dobDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate())) {
            ageYears--;
          }
          return ageYears;
        }
      }

      if (raw.year_of_birth != null && !isNaN(Number(raw.year_of_birth))) {
        return now.getFullYear() - Number(raw.year_of_birth);
      }

      return undefined;
    };

    const age = computeAge();

    return {
      id: raw.id ?? raw.patient_id,
      registration_date: raw.registration_date,
      region: raw.region ?? 'Unknown',
      district: raw.district ?? 'Unknown',
      subdistrict: raw.subdistrict ?? raw.sub_district ?? undefined,
      community: raw.community ?? undefined,
      username: raw.username ?? raw.created_by ?? (raw.assigned_user_id != null ? `User ${raw.assigned_user_id}` : 'Unknown'),
      age,
      dob: raw.dob ?? null,
      year_of_birth: raw.year_of_birth ?? null,
      assigned_user_id: raw.assigned_user_id ?? null,
    };
  };

  // Fetch aggregated data
  useEffect(() => {
    console.log('Dashboard useEffect triggered:', {
      hasToken: !!token,
      aggregatesQuery: aggregatesQueryString,
      patientQuery: patientQueryString
    });
    
    if (!token) {
      console.log('Skipping API calls - No token');
      setAggregates(null);
      setVolunteers([]);
      return;
    }

    const fetchData = async () => {
      console.log('Starting API calls...');
      setAggregatesLoading(true);
      setVolunteersLoading(true);
      setAggregatesError(null);

      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      console.log('API Base URL:', apiBaseUrl);
  console.log('Aggregates query params:', aggregatesQueryString);
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      console.log('Request headers:', { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` });

      try {
        // Fetch both endpoints in parallel
        console.log('Fetching endpoints...');
        const [aggregatesRes, volunteersRes] = await Promise.allSettled([
          fetch(`${apiBaseUrl}/dashboard/aggregates${aggregatesQueryString}`, { headers }),
          fetch(`${apiBaseUrl}/dashboard/volunteer-performance${aggregatesQueryString}`, { headers })
        ]);

        console.log('API responses received:', {
          aggregates: aggregatesRes.status,
          volunteers: volunteersRes.status
        });

        // Handle aggregates response
        if (aggregatesRes.status === 'fulfilled') {
          console.log('Aggregates response status:', aggregatesRes.value.status);
          if (aggregatesRes.value.ok) {
            const data = await aggregatesRes.value.json();
            console.log('Aggregates data loaded successfully:', Object.keys(data));
            setAggregates(data);
          } else {
            const errorText = await aggregatesRes.value.text();
            console.error('Aggregates API error:', aggregatesRes.value.status, errorText);
            const errorMessage = errorText.length > 200 ? errorText.substring(0, 200) + '...' : errorText;
            setAggregatesError(`API Error ${aggregatesRes.value.status}: ${errorMessage}`);
          }
        } else {
          console.error('Aggregates promise rejected:', aggregatesRes.reason);
          setAggregatesError(`Network error: ${aggregatesRes.reason.message}`);
        }

        // Handle volunteers response
        if (volunteersRes.status === 'fulfilled') {
          console.log('Volunteers response status:', volunteersRes.value.status);
          if (volunteersRes.value.ok) {
            const data = await volunteersRes.value.json();
            console.log('Volunteers data loaded:', Array.isArray(data) ? data.length : 'Not array', typeof data);
            setVolunteers(data.data || data || []);
          } else {
            const errorText = await volunteersRes.value.text();
            console.error('Volunteers API error:', volunteersRes.value.status, errorText);
          }
        } else {
          console.error('Volunteers promise rejected:', volunteersRes.reason);
        }

        // Fetch patients data
        setPatientsLoading(true);
        try {
          console.log('Patients query params:', patientQueryString);
          const patientsRes = await fetch(`${apiBaseUrl}/patients${patientQueryString}`, { headers });
          if (patientsRes.ok) {
            const patientsData = await patientsRes.json();
            const rawPatients = patientsData.data || patientsData || [];
            const normalized = Array.isArray(rawPatients) ? rawPatients.map(normalizePatient) : [];
            setPatients(normalized);
          } else {
            setPatientsError('Failed to load patients data');
          }
        } catch (error) {
          console.error('Patients API error:', error);
          setPatientsError('Failed to load patients data');
        } finally {
          setPatientsLoading(false);
        }

      } catch (error) {
        console.error('Dashboard API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setAggregatesError(`Network error: ${errorMessage}`);
      } finally {
        console.log('API calls completed');
        setAggregatesLoading(false);
        setVolunteersLoading(false);
      }
    };

    fetchData();
  }, [token, aggregatesQueryString, patientQueryString]);

  // Compute patient stats
  const patientStats = useMemo(() => {
    if (!patients.length) return null;

    // Apply client-side filters
    const filteredPatients = patients.filter(p => {
      if (colFilters.region.length > 0 && !colFilters.region.includes(p.region)) return false;
      if (colFilters.district.length > 0 && !colFilters.district.includes(p.district)) return false;
      if (colFilters.subdistrict.length > 0 && (!p.subdistrict || !colFilters.subdistrict.includes(p.subdistrict))) return false;
      if (colFilters.community.length > 0 && (!p.community || !colFilters.community.includes(p.community))) return false;
      return true;
    });

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const registrations24h = filteredPatients.filter(p => new Date(p.registration_date) >= last24h).length;
    const registrationsWeek = filteredPatients.filter(p => new Date(p.registration_date) >= lastWeek).length;
    const registrationsMonth = filteredPatients.filter(p => new Date(p.registration_date) >= lastMonth).length;

    const regionalBreakdown = filteredPatients.reduce((acc, p) => {
      acc[p.region] = (acc[p.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const usernameBreakdown = filteredPatients.reduce((acc, p) => {
      acc[p.username] = (acc[p.username] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average age, filtering out invalid/null/undefined ages
    const validAges = filteredPatients
      .map(p => p.age)
      .filter(age => age != null && !isNaN(Number(age)) && Number(age) > 0 && Number(age) < 120)
      .map(age => Number(age));
    const avgAge = validAges.length > 0 ? validAges.reduce((sum, age) => sum + age, 0) / validAges.length : 0;

    // Create weekly trends by region for the last 12 weeks
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const recentPatients = filteredPatients.filter(p => new Date(p.registration_date) >= twelveWeeksAgo);
    
    // Get unique regions
    const regions = [...new Set(filteredPatients.map(p => p.region))];
    
    // Create week labels
    const weeklyTrends = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `W${Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;
      
      const weekData: any = { week: weekLabel };
      let totalForWeek = 0;
      
      regions.forEach(region => {
        const count = recentPatients.filter(p => {
          const regDate = new Date(p.registration_date);
          return regDate >= weekStart && regDate < weekEnd && p.region === region;
        }).length;
        weekData[region] = count;
        totalForWeek += count;
      });
      
      weekData.total = totalForWeek;
      weeklyTrends.push(weekData);
    }

    // Create geographic breakdown
    const geographicBreakdown = filteredPatients.reduce((acc, p) => {
      const key = `${p.region} > ${p.district}${p.subdistrict ? ` > ${p.subdistrict}` : ''}${p.community ? ` > ${p.community}` : ''}`;
      const existingEntry = acc.find(entry => entry.location === key);
      
      if (existingEntry) {
        existingEntry.count += 1;
      } else {
        acc.push({
          location: key,
          region: p.region,
          district: p.district,
          subdistrict: p.subdistrict || 'N/A',
          community: p.community || 'N/A',
          count: 1
        });
      }
      
      return acc;
    }, [] as Array<{
      location: string;
      region: string;
      district: string;
      subdistrict: string;
      community: string;
      count: number;
    }>);

    // Sort based on current sort field and direction
    geographicBreakdown.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (geoSortField === 'count') {
        aValue = a.count;
        bValue = b.count;
      } else {
        aValue = a[geoSortField].toLowerCase();
        bValue = b[geoSortField].toLowerCase();
      }
      
      if (geoSortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return {
      totalPatients: filteredPatients.length,
      registrations24h,
      registrationsWeek,
      registrationsMonth,
      regionalBreakdown,
      usernameBreakdown,
      avgAge: avgAge.toFixed(1),
      validAgeCount: validAges.length,
      weeklyTrends,
      regions,
      geographicBreakdown,
    };
  }, [patients, geoSortField, geoSortDirection, colFilters]);

  const patientDataIsPartial = useMemo(() => {
    const total = aggregates?.overview.totalPatients ?? 0;
    if (!total || !patientLimitNumber) return false;
    return total > patientLimitNumber;
  }, [aggregates?.overview.totalPatients, patientLimitNumber]);

  // Process chart data
  const trendData = useMemo(() => {
    if (!aggregates?.trends?.registrationsByWeek) return [];
    return aggregates.trends.registrationsByWeek.map(item => ({
      week: item.week.replace('2024-W', 'W').replace('2025-W', 'W'),
      registrations: item.cnt
    }));
  }, [aggregates]);

  const ageData = useMemo(() => {
    if (!aggregates?.age?.distribution) return [];
    const dist = aggregates.age.distribution;
    return [
      { group: 'Under 18', count: dist['<18'] },
      { group: '18-24', count: dist['18-24'] },
      { group: '25-34', count: dist['25-34'] },
      { group: '35-44', count: dist['35-44'] },
      { group: '45+', count: dist['45+'] }
    ];
  }, [aggregates]);

  const gestationData = useMemo(() => {
    if (!aggregates?.antenatal?.visitsByGestation) return [];
    const visits = aggregates.antenatal.visitsByGestation;
    return [
      { period: '≤12 weeks', visits: visits['visits_<=12weeks'] },
      { period: '13-20 weeks', visits: visits['visits_13_20weeks'] },
      { period: '21-28 weeks', visits: visits['visits_21_28weeks'] },
      { period: '29+ weeks', visits: visits['visits_29plus'] }
    ];
  }, [aggregates]);

  const regionalData = useMemo(() => {
    if (!aggregates?.geo) return [];
    
    const regionCounts: Record<string, number> = {};
    
    aggregates.geo.forEach(item => {
      regionCounts[item.region] = (regionCounts[item.region] || 0) + item.patients;
    });
    
    return Object.entries(regionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [aggregates]);

  const regions = [...new Set(aggregates?.geo?.map(g => g.region) || ['Greater Accra', 'Ashanti'])];
  const districts = aggregates?.geo?.filter(g => selectedRegion === "All Regions" || g.region === selectedRegion)
    .map(g => g.district) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const isLoading = aggregatesLoading || volunteersLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading optimized dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle geographic table sorting
  const handleGeoSort = (field: 'region' | 'district' | 'subdistrict' | 'community' | 'count') => {
    if (geoSortField === field) {
      // Toggle direction if same field
      setGeoSortDirection(geoSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setGeoSortField(field);
      setGeoSortDirection(field === 'count' ? 'desc' : 'asc');
    }
  };

  const getSortIcon = (field: 'region' | 'district' | 'subdistrict' | 'community' | 'count') => {
    if (geoSortField !== field) {
      return <ChevronDown className="h-3 w-3 opacity-50" />;
    }
    return geoSortDirection === 'asc' ? 
      <ChevronUp className="h-3 w-3" /> : 
      <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EnComPAS Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive maternal health insights • Optimized for performance</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Region Filter */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Regions">All Regions</SelectItem>
              {regions.map(region => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* District Filter */}
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Districts">All Districts</SelectItem>
              {districts.map(district => (
                <SelectItem key={district} value={district}>{district}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Timeframe Filter */}
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Patient Limit */}
          <Select value={patientLimit} onValueChange={setPatientLimit}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select data scope" />
            </SelectTrigger>
            <SelectContent>
              {PATIENT_LIMIT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance Indicator */}
      {token && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${aggregatesLoading ? 'bg-yellow-500 animate-pulse' : aggregatesError ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="text-sm font-medium">
                  {aggregatesLoading ? 'Loading Dashboard...' : aggregatesError ? 'Dashboard Error' : 'Optimized Dashboard Active'}
                </span>
                <Badge variant="outline" className={aggregatesLoading ? "text-yellow-700" : aggregatesError ? "text-red-700" : "text-green-700"}>
                  {aggregatesLoading ? 'Loading...' : aggregatesError ? 'Error' : '2 API Calls • Fast Performance'}
                </Badge>
              </div>
              {aggregatesError && (
                <div className="flex flex-col items-end">
                  <Badge variant="destructive" className="mb-1">Failed to load dashboard data</Badge>
                  <span className="text-xs text-red-600 max-w-md truncate" title={aggregatesError}>
                    {aggregatesError}
                  </span>
                </div>
              )}
              {aggregates?.meta && !aggregatesError && (
                <span className="text-sm text-muted-foreground">
                  {aggregates.meta.filtered ? `${aggregates.meta.filter_level.charAt(0).toUpperCase() + aggregates.meta.filter_level.slice(1)} view` : "National view"} • 
                  {timeframeConfig.label}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard Scope Notice */}
      {user && user.access_level !== 4 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-amber-900 mb-1">
                  Dashboard shows system-wide data
                </h3>
                <p className="text-sm text-amber-700">
                  This dashboard displays the <strong>complete picture</strong> across all regions. 
                  {user.access_level === 3 && ` However, in Patient Overview you can only work with patients from: ${user.region} Region.`}
                  {user.access_level === 2 && ` However, in Patient Overview you can only work with patients from: ${user.district} District.`}
                  {user.access_level === 1 && ` However, in Patient Overview you can only work with patients from: ${user.subdistrict} Subdistrict.`}
                  {user.access_level === 0 && ` However, in Patient Overview you can only work with patients from: ${user.community_name} Community.`}
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  <strong>Note:</strong> The Patient Overview count will be lower than the Dashboard total because it only shows patients you have access to manage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Source Comparison - Only for National users to show reconciliation */}
      {user && user.access_level === 4 && patients.length > 0 && aggregates?.overview.totalPatients !== patients.length && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Data Source Information
                </h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Dashboard Total:</strong> {aggregates?.overview.totalPatients.toLocaleString()} patients (from aggregates API)</p>
                  <p><strong>Patient Overview:</strong> {patients.length.toLocaleString()} patients (from patient list - showing top {patientLimit})</p>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  <strong>Note:</strong> Patient Overview shows the top {patientLimit} records. Increase the data scope above to see more patients.
                  The Dashboard uses aggregated counts which may include all historical records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates?.overview.totalPatients.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{aggregates?.overview.registrationsLastPeriod || 0} last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsLoading ? "..." : patientStats?.registrationsMonth ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsLoading ? "..." : patientStats?.registrationsWeek ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patientsLoading ? "..." : patientStats?.registrations24h ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              New registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">1st Trimester Reg.</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(aggregates?.antenatal.earlyRegistrationPercent ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Registered within first 12 weeks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kit Usage</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(aggregates?.kits.usageRatePercent ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {aggregates?.kits.totalUsed || 0}/{aggregates?.kits.totalDistributed || 0} kits used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregates?.referrals.withPriorityCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Cases requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Age</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(aggregates?.age.average ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Average age (median: {Number(aggregates?.age.median ?? 0).toFixed(1)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Registration Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registration Trends</CardTitle>
            <CardDescription>Weekly ANC registrations over last 12 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="registrations" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Patient demographics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ group, percent }) => `${group} ${(((percent ?? 0) * 100)).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Visits by Gestation Period */}
        <Card>
          <CardHeader>
            <CardTitle>Visits by Gestation</CardTitle>
            <CardDescription>ANC visit timing distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gestationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Regional</CardTitle>
            <CardDescription>Patient distribution by region</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionalData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volunteer Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Volunteers</CardTitle>
            <CardDescription>Volunteer performance (patient registrations)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volunteers.slice(0, 5).map((volunteer) => (
                <div key={volunteer.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">{volunteer.volunteer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {volunteer.patients_registered} patients registered, {volunteer.patients_registered_30d} in last 30 days
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>
                      First: {volunteer.first_registration ? new Date(volunteer.first_registration).toLocaleDateString() : '-'}
                    </div>
                    <div>
                      Latest: {volunteer.last_registration ? new Date(volunteer.last_registration).toLocaleDateString() : '-'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collapsible Admin Stats Section */}
      <div className="w-full">
        <Button
          variant="ghost"
          onClick={() => setAdminStatsExpanded(!adminStatsExpanded)}
          className="w-full justify-between text-lg font-semibold p-4 h-auto"
        >
          Admin Insights: Patient Registration Stats
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${adminStatsExpanded ? 'rotate-180' : ''}`} />
        </Button>
        
        {adminStatsExpanded && (
          <div className="mt-4">
            {patientsLoading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading patient stats...</p>
                </div>
              </div>
            ) : patientsError ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-red-600">{patientsError}</p>
                </CardContent>
              </Card>
            ) : patientStats ? (
              <div className="space-y-6">
                {patientDataIsPartial && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      Showing {patients.length.toLocaleString()} of {aggregates?.overview.totalPatients.toLocaleString()} total patients. Increase the data scope above to analyze the full dataset.
                    </div>
                  </div>
                )}
                {/* Client-side Filters removed */}

                {/* Key Stats Grid - Removed as moved to top */}
                
                {/* Regional Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Regional Breakdown</CardTitle>
                    <CardDescription>Registrations by region</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(patientStats.regionalBreakdown).map(([region, count]) => (
                        <div key={region} className="flex justify-between">
                          <span>{region}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Geographic Breakdown */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>Patient registrations by region, district, and community</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground border-b pb-2 mb-2">
                        <button 
                          className="col-span-3 flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-left"
                          onClick={() => handleGeoSort('region')}
                        >
                          Region {getSortIcon('region')}
                        </button>
                        <button 
                          className="col-span-3 flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-left"
                          onClick={() => handleGeoSort('district')}
                        >
                          District {getSortIcon('district')}
                        </button>
                        <button 
                          className="col-span-3 flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-left"
                          onClick={() => handleGeoSort('subdistrict')}
                        >
                          Subdistrict {getSortIcon('subdistrict')}
                        </button>
                        <button 
                          className="col-span-2 flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer text-left"
                          onClick={() => handleGeoSort('community')}
                        >
                          Community {getSortIcon('community')}
                        </button>
                        <button 
                          className="col-span-1 flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer justify-end"
                          onClick={() => handleGeoSort('count')}
                        >
                          Count {getSortIcon('count')}
                        </button>
                      </div>
                      
                      {/* Column Filters */}
                      <div className="grid grid-cols-12 gap-2 mb-2 pb-2 border-b">
                        <div className="col-span-3">
                          <MultiSelect
                            options={filterOptions.region}
                            selected={colFilters.region}
                            onChange={(selected: string[]) => setColFilters(prev => ({...prev, region: selected}))}
                            placeholder="Region"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <MultiSelect
                            options={filterOptions.district}
                            selected={colFilters.district}
                            onChange={(selected: string[]) => setColFilters(prev => ({...prev, district: selected}))}
                            placeholder="District"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-3">
                          <MultiSelect
                            options={filterOptions.subdistrict}
                            selected={colFilters.subdistrict}
                            onChange={(selected: string[]) => setColFilters(prev => ({...prev, subdistrict: selected}))}
                            placeholder="Subdistrict"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <MultiSelect
                            options={filterOptions.community}
                            selected={colFilters.community}
                            onChange={(selected: string[]) => setColFilters(prev => ({...prev, community: selected}))}
                            placeholder="Community"
                            className="h-7 text-xs"
                          />
                        </div>
                        <div className="col-span-1 flex justify-end">
                           {(colFilters.region.length > 0 || colFilters.district.length > 0 || colFilters.subdistrict.length > 0 || colFilters.community.length > 0) && (
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="h-7 w-7"
                               onClick={() => setColFilters({region: [], district: [], subdistrict: [], community: []})}
                               title="Clear filters"
                             >
                               <span className="sr-only">Clear</span>
                               <span className="text-xs">×</span>
                             </Button>
                           )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        {patientStats.geographicBreakdown.slice(0, 20).map((item, index) => (
                          <div key={index} className="grid grid-cols-12 gap-2 text-sm py-1 hover:bg-muted/50 rounded">
                            <div className="col-span-3 truncate">{item.region}</div>
                            <div className="col-span-3 truncate">{item.district}</div>
                            <div className="col-span-3 truncate text-muted-foreground">{item.subdistrict}</div>
                            <div className="col-span-2 truncate text-muted-foreground">{item.community}</div>
                            <div className="col-span-1 text-right">
                              <Badge variant="secondary">{item.count}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                      {patientStats.geographicBreakdown.length > 20 && (
                        <div className="text-center mt-4 text-sm text-muted-foreground">
                          Showing top 20 of {patientStats.geographicBreakdown.length} locations
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Regional Trends Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Registration Trends by Region</CardTitle>
                    <CardDescription>Weekly registration patterns over last 12 weeks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={patientStats.weeklyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip />
                        {patientStats.regions.map((region, index) => (
                          <Area
                            key={region}
                            type="monotone"
                            dataKey={region}
                            stackId="1"
                            stroke={COLORS[index % COLORS.length]}
                            fill={COLORS[index % COLORS.length]}
                            fillOpacity={0.6}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">No patient data available.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
