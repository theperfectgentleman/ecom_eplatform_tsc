import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FileText,
  ClipboardList,
  MessageSquare,
  Baby,
  Calendar,
  AlertTriangle,
  UserCheck,
  Clock,
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
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";

const mockChartData = [
    { 
      name: "Jan", 
      cases: 35, 
      appointments: 20, 
      region: "Greater Accra", 
      district: "Accra Metropolitan",
      subdistrict: "Osu Klottey",
      community_name: "Osu",
      accessLevel: 2 // District level data
    },
    { 
      name: "Feb", 
      cases: 45, 
      appointments: 30, 
      region: "Ashanti", 
      district: "Kumasi Metropolitan",
      subdistrict: "Manhyia",
      community_name: "Adum",
      accessLevel: 2 // District level data
    },
    { 
      name: "Mar", 
      cases: 50, 
      appointments: 40, 
      region: "Greater Accra", 
      district: "Tema Metropolitan",
      subdistrict: "Tema West",
      community_name: "Community 1",
      accessLevel: 0 // Community level data
    },
    { 
      name: "Apr", 
      cases: 60, 
      appointments: 50, 
      region: "Western", 
      district: "Sekondi-Takoradi Metropolitan",
      subdistrict: "Sekondi",
      community_name: "Market Circle",
      accessLevel: 1 // Subdistrict level data
    },
    { 
      name: "May", 
      cases: 55, 
      appointments: 45, 
      region: "Ashanti", 
      district: "Obuasi Municipal",
      subdistrict: "Obuasi East",
      community_name: "Tutuka",
      accessLevel: 0 // Community level data
    },
    { 
      name: "Jun", 
      cases: 70, 
      appointments: 60, 
      region: "Greater Accra", 
      district: "Accra Metropolitan",
      subdistrict: "Ablekuma Central",
      community_name: "Dansoman",
      accessLevel: 1 // Subdistrict level data
    },
    { 
      name: "Jul", 
      cases: 75, 
      appointments: 65, 
      region: "Western", 
      district: "Tarkwa-Nsuaem Municipal",
      subdistrict: "Tarkwa",
      community_name: "Tarkwa Township",
      accessLevel: 2 // District level data
    },
];

const mockRecentCases = [
  {
    id: "CASE-001",
    patient: "John Doe",
    type: "Standard",
    status: "Open",
    date: "2025-07-07",
    assignee: "Dr. Smith",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    subdistrict: "Osu Klottey",
    community_name: "Osu",
    accessLevel: 2 // District level case
  },
  {
    id: "CASE-002",
    patient: "Jane Smith",
    type: "Complex",
    status: "Closed",
    date: "2025-07-06",
    assignee: "Dr. Jones",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    subdistrict: "Manhyia",
    community_name: "Adum",
    accessLevel: 0 // Community level case
  },
  {
    id: "CASE-003",
    patient: "Peter Pan",
    type: "Standard",
    status: "Closed",
    date: "2025-07-05",
    assignee: "Dr. Smith",
    region: "Greater Accra",
    district: "Tema Metropolitan",
    subdistrict: "Tema West",
    community_name: "Community 1",
    accessLevel: 1 // Subdistrict level case
  },
  {
    id: "CASE-004",
    patient: "Alice Wonderland",
    type: "High-Risk",
    status: "Open",
    date: "2025-07-04",
    assignee: "Dr. Brown",
    region: "Western",
    district: "Sekondi-Takoradi Metropolitan",
    subdistrict: "Sekondi",
    community_name: "Market Circle",
    accessLevel: 2 // District level case
  },
  {
    id: "CASE-005",
    patient: "Charlie Brown",
    type: "Standard",
    status: "Pending",
    date: "2025-07-03",
    assignee: "Dr. Jones",
    region: "Ashanti",
    district: "Obuasi Municipal",
    subdistrict: "Obuasi East",
    community_name: "Tutuka",
    accessLevel: 0 // Community level case
  },
];

const regions = ["All Regions", "Greater Accra", "Ashanti", "Western"];
const districtsByRegion: { [key: string]: string[] } = {
  "Greater Accra": ["All Districts", "Accra Metropolitan", "Tema Metropolitan"],
  "Ashanti": ["All Districts", "Kumasi Metropolitan", "Obuasi Municipal"],
  "Western": ["All Districts", "Sekondi-Takoradi Metropolitan", "Tarkwa-Nsuaem Municipal"],
};

const Dashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedDistrict, setSelectedDistrict] = useState("All Districts");
  const { filterByAccessLevel } = useAccessLevelFilter();

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region);
    setSelectedDistrict("All Districts");
  };

  // Apply both manual filters and access level filters
  const manuallyFilteredCases = mockRecentCases.filter(c => 
    (selectedRegion === "All Regions" || c.region === selectedRegion) &&
    (selectedDistrict === "All Districts" || c.district === selectedDistrict)
  );
  const filteredCases = filterByAccessLevel(manuallyFilteredCases);

  const manuallyFilteredChartData = mockChartData.filter(d => 
    (selectedRegion === "All Regions" || d.region === selectedRegion) &&
    (selectedDistrict === "All Districts" || d.district === selectedDistrict)
  );
  const filteredChartData = filterByAccessLevel(manuallyFilteredChartData);

  const openCasesCount = filteredCases.filter(c => c.status === 'Open').length;
  const totalPatients = filteredCases.length > 0 ? new Set(filteredCases.map(c => c.patient)).size + 1200 : 1234; // Mock logic


  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
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
              {selectedRegion !== "All Regions" && districtsByRegion[selectedRegion].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Cases
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openCasesCount}</div>
            <p className="text-xs text-muted-foreground">
              +5 since last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Appointments</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+57</div>
            <p className="text-xs text-muted-foreground">
              +10 since last hour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pregnancies</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +5 new registrations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visits This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Additional ANC Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Patients</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Next 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Week</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              New patient registrations
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cases vs Appointments</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={filteredChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cases"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="appointments" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Cases</CardTitle>
            <CardDescription>
              You have {openCasesCount} open cases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>
                      <div className="font-medium">{caseItem.patient}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {caseItem.assignee}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {caseItem.type}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge className="text-xs" variant={caseItem.status === 'Closed' ? 'default' : 'secondary'}>
                        {caseItem.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{caseItem.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
