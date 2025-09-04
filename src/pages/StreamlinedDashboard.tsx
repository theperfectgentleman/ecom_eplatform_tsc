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
  Baby,
  Package,
  Activity,
  Calendar,
  UserCheck,
  TrendingUp,
  Heart,
  AlertTriangle,
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

// Optimized Dashboard using aggregates endpoint + volunteer performance
// Total API calls: 2 (aggregates + volunteers) vs previous 15+

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
  };
  referrals: {
    totalAllTime: number;
    lastPeriod: number;
    withPriorityCount: number;
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
  vol_user_id: number;
  volunteer_name: string;
  kits_distributed: number;
  kits_confirmed: number;
  confirmation_rate: number;
  avg_days_to_confirm: number;
}

const Dashboard = () => {
  const { token } = useAuth();
  const [useLiveData, setUseLiveData] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");

  // Main aggregated data (1 API call)
  const [aggregates, setAggregates] = useState<DashboardAggregates | null>(null);
  const [aggregatesLoading, setAggregatesLoading] = useState(false);
  const [aggregatesError, setAggregatesError] = useState<string | null>(null);

  // Volunteer performance (1 additional API call - most actionable for users)
  const [volunteers, setVolunteers] = useState<VolunteerPerformance[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedRegion !== "All Regions") params.append('region', selectedRegion);
    if (selectedDistrict !== "All Districts") params.append('district', selectedDistrict);
    params.append('days', '30');
    params.append('weeks', '12');
    return params.toString() ? `?${params.toString()}` : '';
  }, [selectedRegion, selectedDistrict]);

  // Fetch aggregated data
  useEffect(() => {
    if (!useLiveData || !token) {
      setAggregates(null);
      setVolunteers([]);
      return;
    }

    const fetchData = async () => {
      setAggregatesLoading(true);
      setVolunteersLoading(true);
      setAggregatesError(null);

      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // Fetch both endpoints in parallel
        const [aggregatesRes, volunteersRes] = await Promise.allSettled([
          fetch(`${apiBaseUrl}/dashboard/aggregates${queryParams}`, { headers }),
          fetch(`${apiBaseUrl}/dashboard/volunteer-performance${queryParams}`, { headers })
        ]);

        // Handle aggregates response
        if (aggregatesRes.status === 'fulfilled' && aggregatesRes.value.ok) {
          const data = await aggregatesRes.value.json();
          setAggregates(data);
        } else {
          setAggregatesError('Failed to load dashboard data');
        }

        // Handle volunteers response
        if (volunteersRes.status === 'fulfilled' && volunteersRes.value.ok) {
          const data = await volunteersRes.value.json();
          setVolunteers(data.data || data || []);
        }

      } catch (error) {
        console.error('Dashboard API error:', error);
        setAggregatesError('Network error loading dashboard');
      } finally {
        setAggregatesLoading(false);
        setVolunteersLoading(false);
      }
    };

    fetchData();
  }, [useLiveData, token, queryParams]);

  // Sample data for demo mode
  const sampleData: DashboardAggregates = {
    overview: {
      totalPatients: 1247,
      totalAntenatalRegistrations: 856,
      totalAncVisits: 2341,
      registrationsLastPeriod: 34,
      kitsDistributedLastPeriod: 67,
      kitsUsedLastPeriod: 52,
      referralsLastPeriod: 8
    },
    trends: {
      registrationsByWeek: [
        { week: '2024-W45', cnt: 12 }, { week: '2024-W46', cnt: 18 },
        { week: '2024-W47', cnt: 15 }, { week: '2024-W48', cnt: 22 },
        { week: '2024-W49', cnt: 19 }, { week: '2024-W50', cnt: 25 },
        { week: '2024-W51', cnt: 28 }, { week: '2024-W52', cnt: 31 },
        { week: '2025-W01', cnt: 24 }, { week: '2025-W02', cnt: 29 },
        { week: '2025-W03', cnt: 33 }, { week: '2025-W04', cnt: 27 }
      ]
    },
    kits: {
      totalDistributed: 1124,
      confirmedByVolunteers: 987,
      totalUsed: 756,
      usageRatePercent: 67.3
    },
    testing: {
      totalTests: 756,
      positives: 64,
      positivityPercent: 8.5
    },
    antenatal: {
      registrationsLastPeriod: 34,
      earlyRegistrationsLastPeriod: 28,
      earlyRegistrationPercent: 82.4,
      totalRegistrationsAllTime: 856
    },
    referrals: {
      totalAllTime: 187,
      lastPeriod: 8,
      withPriorityCount: 23,
      avgVisitsPerRegistration: 2.7,
      percentRegistrationsWithVisit: 89.2,
      avgDaysToFirstVisit: 12.3,
      visitsByGestation: {
        'visits_<=12weeks': 312,
        'visits_13_20weeks': 456,
        'visits_21_28weeks': 389,
        'visits_29plus': 567
      }
    },
    geo: [
      { region: 'Greater Accra', district: 'Accra Metropolitan', patients: 245 },
      { region: 'Ashanti', district: 'Kumasi Metropolitan', patients: 189 },
      { region: 'Greater Accra', district: 'Tema Metropolitan', patients: 156 },
      { region: 'Western', district: 'Sekondi-Takoradi', patients: 134 },
      { region: 'Northern', district: 'Tamale Metropolitan', patients: 112 }
    ],
    age: {
      average: 26.7,
      median: 25.0,
      distribution: { '<18': 89, '18-24': 342, '25-34': 567, '35-44': 198, '45+': 51 }
    },
    meta: {
      filtered: false,
      filter_level: 'national',
      params: { days: 30, weeks: 12 }
    }
  };

  const sampleVolunteers: VolunteerPerformance[] = [
    { vol_user_id: 1, volunteer_name: 'Sarah Mensah', kits_distributed: 45, kits_confirmed: 42, confirmation_rate: 93.3, avg_days_to_confirm: 2.1 },
    { vol_user_id: 2, volunteer_name: 'Kofi Asante', kits_distributed: 38, kits_confirmed: 35, confirmation_rate: 92.1, avg_days_to_confirm: 1.8 },
    { vol_user_id: 3, volunteer_name: 'Ama Osei', kits_distributed: 52, kits_confirmed: 48, confirmation_rate: 92.3, avg_days_to_confirm: 2.3 }
  ];

  // Use live or sample data
  const dashboardData = useLiveData ? aggregates : sampleData;
  const volunteerData = useLiveData ? volunteers : sampleVolunteers;

  // Process chart data
  const trendData = useMemo(() => {
    if (!dashboardData?.trends?.registrationsByWeek) return [];
    return dashboardData.trends.registrationsByWeek.map(item => ({
      week: item.week.replace('2024-W', 'W').replace('2025-W', 'W'),
      registrations: item.cnt
    }));
  }, [dashboardData]);

  const ageData = useMemo(() => {
    if (!dashboardData?.age?.distribution) return [];
    const dist = dashboardData.age.distribution;
    return [
      { group: 'Under 18', count: dist['<18'] },
      { group: '18-24', count: dist['18-24'] },
      { group: '25-34', count: dist['25-34'] },
      { group: '35-44', count: dist['35-44'] },
      { group: '45+', count: dist['45+'] }
    ];
  }, [dashboardData]);

  const gestationData = useMemo(() => {
    if (!dashboardData?.referrals?.visitsByGestation) return [];
    const visits = dashboardData.referrals.visitsByGestation;
    return [
      { period: '≤12 weeks', visits: visits['visits_<=12weeks'] },
      { period: '13-20 weeks', visits: visits['visits_13_20weeks'] },
      { period: '21-28 weeks', visits: visits['visits_21_28weeks'] },
      { period: '29+ weeks', visits: visits['visits_29plus'] }
    ];
  }, [dashboardData]);

  const regions = [...new Set(dashboardData?.geo?.map(g => g.region) || ['Greater Accra', 'Ashanti'])];
  const districts = dashboardData?.geo?.filter(g => selectedRegion === "All Regions" || g.region === selectedRegion)
    .map(g => g.district) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const isLoading = useLiveData && (aggregatesLoading || volunteersLoading);

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

  return (
    <div className="space-y-6 p-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EnComPAS Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive maternal health insights • Optimized for performance</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Data Source Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Demo</span>
            <Switch checked={useLiveData} onCheckedChange={setUseLiveData} />
            <span className="text-sm font-medium">Live Data</span>
          </div>

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
        </div>
      </div>

      {/* Performance Indicator */}
      {useLiveData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Optimized Dashboard Active</span>
                <Badge variant="outline" className="text-green-700">2 API Calls • Fast Performance</Badge>
              </div>
              {aggregatesError && (
                <Badge variant="destructive">{aggregatesError}</Badge>
              )}
              {dashboardData?.meta && (
                <span className="text-sm text-muted-foreground">
                  {dashboardData.meta.filtered ? `${dashboardData.meta.filter_level.charAt(0).toUpperCase() + dashboardData.meta.filter_level.slice(1)} view` : "National view"} • 
                  Last {dashboardData.meta.params.days} days
                </span>
              )}
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
            <div className="text-2xl font-bold">{dashboardData?.overview.totalPatients.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{dashboardData?.overview.registrationsLastPeriod || 0} last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ANC Coverage</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.referrals.percentRegistrationsWithVisit ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {(dashboardData?.antenatal.earlyRegistrationPercent ?? 0).toFixed(1)}% early registration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kit Usage</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.kits.usageRatePercent ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.kits.totalUsed || 0}/{dashboardData?.kits.totalDistributed || 0} kits used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Positivity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.testing.positivityPercent ?? 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.testing.positives || 0} of {dashboardData?.testing.totalTests || 0} tests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visit Frequency</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.referrals.avgVisitsPerRegistration ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Avg visits per registration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(dashboardData?.referrals.avgDaysToFirstVisit ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Days to first visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.referrals.withPriorityCount || 0}</div>
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
            <div className="text-2xl font-bold">{(dashboardData?.age.average ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Average age (median: {(dashboardData?.age.median ?? 0).toFixed(1)})
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
            <CardTitle>Top Regions</CardTitle>
            <CardDescription>Patient distribution by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.geo?.slice(0, 5).map((location) => (
                <div key={`${location.region}-${location.district}`} className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{location.district}</div>
                    <div className="text-muted-foreground">{location.region}</div>
                  </div>
                  <Badge variant="secondary">{location.patients}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Volunteer Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top Volunteers</CardTitle>
            <CardDescription>Volunteer performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volunteerData.slice(0, 5).map((volunteer) => (
                <div key={volunteer.vol_user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">{volunteer.volunteer_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {volunteer.kits_distributed} kits distributed • {(volunteer.confirmation_rate ?? 0).toFixed(1)}% confirmed
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{(volunteer.avg_days_to_confirm ?? 0).toFixed(1)}d</Badge>
                    <div className="text-xs text-muted-foreground mt-1">avg response</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
