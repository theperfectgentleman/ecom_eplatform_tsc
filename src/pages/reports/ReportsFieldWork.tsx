import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Alert from "@/components/ui/alert";
import { useApi } from "@/lib/useApi";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { AccessLevel } from "@/types";
import { ArrowDownUp, Filter, MapPin, Users, CalendarDays, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataCaptureContributor {
  userId: number | null;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  fullName: string;
  userType: string;
  userRegion: string | null;
  userDistrict: string | null;
  userSubdistrict: string | null;
  userPhone: string | null;
  totalRecords: number;
  regionsCovered: number;
  districtsCovered: number;
  communitiesCovered: number;
  firstCapture: string | null;
  lastCapture: string | null;
}

interface DataCaptureMeta {
  filters: {
    startDate: string | null;
    endDate: string | null;
    region: string | null;
    district: string | null;
    subdistrict: string | null;
  };
  totalRecords: number;
  uniqueUsers: number;
  averagePerUser: number;
  generatedAt: string;
  availableRegions: string[];
  availableDistricts: string[];
}

interface DataCaptureBreakdown {
  byRegion: Array<{ region: string; total: number }>;
  byDistrict: Array<{ region: string; district: string; total: number }>;
  byDate: Array<{ date: string; total: number }>;
}

interface DataCaptureResponse {
  meta: DataCaptureMeta;
  data: DataCaptureContributor[];
  breakdown: DataCaptureBreakdown;
}

const toCsvValue = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  const escaped = str.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const ALL_REGIONS_LABEL = "All Regions";
const ALL_DISTRICTS_LABEL = "All Districts";
const ALL_SUBDISTRICTS_LABEL = "All Subdistricts";

const ReportsFieldWork = () => {
  const { request } = useApi();
  const { getAccessLevelInfo, userLocation, userAccessLevel } = useAccessLevelFilter();
  const userRegion = userLocation.region;
  const userDistrict = userLocation.district;
  const userSubdistrict = userLocation.subdistrict;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  
  // New hierarchical filtering approach
  type FilterLevel = 'none' | 'region' | 'district' | 'subdistrict';
  const [filterLevel, setFilterLevel] = useState<FilterLevel>('none');
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedSubdistrict, setSelectedSubdistrict] = useState<string>("");
  
  // Keep legacy variables for backward compatibility with query string
  const region = filterLevel === 'region' ? selectedRegion : ALL_REGIONS_LABEL;
  const district = filterLevel === 'district' ? selectedDistrict : ALL_DISTRICTS_LABEL;
  const subdistrict = filterLevel === 'subdistrict' ? selectedSubdistrict : ALL_SUBDISTRICTS_LABEL;

  const [data, setData] = useState<DataCaptureResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<"totalRecords" | "fullName">("totalRecords");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const accessInfo = getAccessLevelInfo();

  // Determine which filter levels are available to the user
  const availableFilterLevels = useMemo((): FilterLevel[] => {
    const levels: FilterLevel[] = ['none'];
    
    if (userAccessLevel === undefined || userAccessLevel === null) return levels;
    
    // Users can filter at their level and below
    switch (userAccessLevel) {
      case AccessLevel.NATIONAL: // 4
        levels.push('region', 'district', 'subdistrict');
        break;
      case AccessLevel.REGION: // 3
        levels.push('district', 'subdistrict');
        break;
      case AccessLevel.DISTRICT: // 2
        levels.push('subdistrict');
        break;
      case AccessLevel.SUBDISTRICT: // 1
        // Subdistrict users can only see their subdistrict data
        break;
      case AccessLevel.COMMUNITY: // 0
        // Community users can only see their community data
        break;
    }
    
    return levels;
  }, [userAccessLevel]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (region !== ALL_REGIONS_LABEL) params.set("region", region);
    if (district !== ALL_DISTRICTS_LABEL) params.set("district", district);
    if (subdistrict !== ALL_SUBDISTRICTS_LABEL) params.set("subdistrict", subdistrict);
    return params.toString();
  }, [startDate, endDate, region, district, subdistrict]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await request<DataCaptureResponse>({
          path: `reports/data-capture${queryString ? `?${queryString}` : ""}`,
          method: "GET",
          suppressToast: { error: true },
        });
        setData(response);
      } catch (err: any) {
        setError(err?.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request, queryString]);

  // Filter available options based on user's access level
  const availableRegions = useMemo(() => {
    if (!data?.meta?.availableRegions?.length) return [];
    let regions = Array.from(new Set(data.meta.availableRegions.filter(Boolean))).sort();
    
    // Filter based on user access level
    if (userAccessLevel === 3 && userRegion) { // REGION level
      regions = regions.filter(r => r === userRegion);
    } else if (userAccessLevel !== undefined && userAccessLevel < 3) { // DISTRICT, SUBDISTRICT, COMMUNITY
      // These levels can't see region filter
      regions = [];
    }
    
    return regions;
  }, [data?.meta?.availableRegions, userAccessLevel, userRegion]);

  const availableDistricts = useMemo(() => {
    const districtsFromMeta = data?.meta?.availableDistricts || [];
    const districtsFromBreakdown = data?.breakdown?.byDistrict?.map((d) => d.district) || [];
    let combined = Array.from(new Set([...districtsFromMeta, ...districtsFromBreakdown].filter(Boolean)));
    combined.sort();
    
    // Filter by selected region if applicable
    if (filterLevel === 'district' && selectedRegion) {
      const validDistricts = new Set(
        data?.breakdown?.byDistrict
          ?.filter((item) => item.region === selectedRegion)
          .map((item) => item.district) || []
      );
      combined = combined.filter((d) => validDistricts.has(d));
    }
    
    // Filter based on user access level
    if (userAccessLevel === 3 && userRegion) { // REGION level
      // Show districts in user's region
      const validDistricts = new Set(
        data?.breakdown?.byDistrict
          ?.filter((item) => item.region === userRegion)
          .map((item) => item.district) || []
      );
      combined = combined.filter((d) => validDistricts.has(d));
    } else if (userAccessLevel === 2 && userDistrict) { // DISTRICT level
      combined = combined.filter(d => d === userDistrict);
    } else if (userAccessLevel !== undefined && userAccessLevel < 2) { // SUBDISTRICT, COMMUNITY
      // These levels can't see district filter
      combined = [];
    }
    
    return combined;
  }, [data?.meta?.availableDistricts, data?.breakdown?.byDistrict, filterLevel, selectedRegion, userAccessLevel, userRegion, userDistrict]);

  const availableSubdistricts = useMemo(() => {
    if (!data?.data?.length) return [];
    
    let filtered = data.data.filter((contributor) => {
      // Filter by selected district if applicable
      if (filterLevel === 'subdistrict' && selectedDistrict) {
        return contributor.userDistrict === selectedDistrict;
      }
      return true;
    });
    
    // Filter based on user access level
    if (userAccessLevel === 3 && userRegion) { // REGION level
      filtered = filtered.filter(c => c.userRegion === userRegion);
    } else if (userAccessLevel === 2 && userDistrict) { // DISTRICT level
      filtered = filtered.filter(c => c.userDistrict === userDistrict);
    } else if (userAccessLevel === 1 && userSubdistrict) { // SUBDISTRICT level
      filtered = filtered.filter(c => c.userSubdistrict === userSubdistrict);
    } else if (userAccessLevel === 0) { // COMMUNITY level
      // Community users can't see subdistrict filter
      return [];
    }
    
    const unique = Array.from(
      new Set(
        filtered
          .map((contributor) => contributor.userSubdistrict)
          .filter((value): value is string => Boolean(value && value.trim()))
      )
    );
    unique.sort();
    return unique;
  }, [data?.data, filterLevel, selectedDistrict, userAccessLevel, userRegion, userDistrict, userSubdistrict]);

  const sortedContributors = useMemo(() => {
    if (!data?.data) return [];
    const entries = [...data.data];
    entries.sort((a, b) => {
      let comparison = 0;
      if (sortField === "totalRecords") {
        comparison = a.totalRecords - b.totalRecords;
      } else {
        comparison = a.fullName.localeCompare(b.fullName);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
    return entries;
  }, [data?.data, sortDirection, sortField]);

  const handleDownloadCsv = () => {
    if (typeof window === "undefined" || !sortedContributors.length) return;

    const headers = [
      "Full Name",
      "Username",
      "First Name",
      "Last Name",
      "User Type",
      "Phone",
      "Region",
      "District",
      "Subdistrict",
      "Total Records",
      "Regions Covered",
      "Districts Covered",
      "Communities Covered",
      "First Capture",
      "Last Capture",
    ];

    const rows = sortedContributors.map((contributor) => [
      contributor.fullName,
      contributor.username,
      contributor.firstname,
      contributor.lastname,
      contributor.userType,
      contributor.userPhone,
      contributor.userRegion,
      contributor.userDistrict,
      contributor.userSubdistrict,
      contributor.totalRecords,
      contributor.regionsCovered,
      contributor.districtsCovered,
      contributor.communitiesCovered,
      contributor.firstCapture,
      contributor.lastCapture,
    ]);

    const csvTable = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const metaLines: string[] = [];
    const generatedAt = data?.meta?.generatedAt || new Date().toISOString();
    metaLines.push(["Report Generated", generatedAt].map(toCsvValue).join(","));
    if (appliedFilters.length) {
      metaLines.push(["Filters Applied", appliedFilters.join(" | ")].map(toCsvValue).join(","));
    }

    const csvSections = [...metaLines];
    if (metaLines.length) {
      csvSections.push("");
    }
    csvSections.push(csvTable);
    const csvContent = csvSections.join("\n");

    const dateStamp = (() => {
      const source = data?.meta?.generatedAt || new Date().toISOString();
      const parsed = new Date(source);
      return Number.isNaN(parsed.getTime())
        ? new Date().toISOString().slice(0, 10)
        : parsed.toISOString().slice(0, 10);
    })();

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", `data-capture-contributors-${dateStamp}.csv`);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleSortChange = (field: "totalRecords" | "fullName") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "totalRecords" ? "desc" : "asc");
    }
  };

  // Auto-initialize filter based on user's access level
  useEffect(() => {
    if (!data) return;
    
    // Only initialize once when data first loads and no filter is set
    if (filterLevel !== 'none') return;
    
    // REGION users: default to filtering by their districts
    if (userAccessLevel === AccessLevel.REGION && userRegion && availableDistricts.length > 0) {
      // Don't auto-select, let them choose
      return;
    }
    
    // DISTRICT users: default to filtering by subdistricts in their district
    if (userAccessLevel === AccessLevel.DISTRICT && userDistrict && availableSubdistricts.length > 0) {
      // Don't auto-select, let them choose
      return;
    }
    
    // SUBDISTRICT and COMMUNITY users see their data by default, no additional filter needed
  }, [data, filterLevel, userAccessLevel, userRegion, userDistrict, availableDistricts.length, availableSubdistricts.length]);

  const formatNumber = (value: number | null | undefined, fractionDigits = 0) => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);
  };

  const formatDateLabel = (isoDate: string | null) => {
    if (!isoDate) return "—";
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(parsed);
  };

  const appliedFilters = useMemo(() => {
    const active: string[] = [];
    if (startDate) active.push(`Start: ${formatDateLabel(startDate)}`);
    if (endDate) active.push(`End: ${formatDateLabel(endDate)}`);
    
    // New hierarchical filter display
    if (filterLevel === 'region' && selectedRegion) {
      active.push(`Region: ${selectedRegion}`);
    } else if (filterLevel === 'district' && selectedDistrict) {
      active.push(`District: ${selectedDistrict}`);
    } else if (filterLevel === 'subdistrict' && selectedSubdistrict) {
      active.push(`Subdistrict: ${selectedSubdistrict}`);
    }
    
    return active;
  }, [startDate, endDate, filterLevel, selectedRegion, selectedDistrict, selectedSubdistrict]);

  const mostRecentCapture = useMemo(() => {
    if (!data?.data?.length) return null;
    return data.data.reduce((latest: string | null, item) => {
      if (!item.lastCapture) return latest;
      if (!latest) return item.lastCapture;
      return new Date(item.lastCapture) > new Date(latest) ? item.lastCapture : latest;
    }, null);
  }, [data?.data]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <LoadingSpinner />
            <span>Loading data capture summary…</span>
          </div>
        </div>
      );
    }

    if (error) {
      const isNotFound = error.toLowerCase().includes("404");
      const description = isNotFound
        ? "The reporting endpoint isn't available on the API environment you're connected to. Make sure the backend deploy includes /api/reports/data-capture or point this dashboard at a local API before trying again."
        : error;
      return (
        <Alert
          variant="error"
          title={isNotFound ? "Reporting service unavailable" : "Unable to load reports"}
          description={description}
          className="border-destructive/50"
        />
      );
    }

    if (!data) {
      return (
        <Alert
          variant="warning"
          title="No data available"
          description="We could not find any data that matches the selected filters."
        />
      );
    }

    return (
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.meta.totalRecords)}</div>
              <CardDescription>Total patient registrations captured</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Capturers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.meta.uniqueUsers)}</div>
              <CardDescription>Unique users contributing in range</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per User</CardTitle>
              <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(data.meta.averagePerUser, 1)}</div>
              <CardDescription>Mean records captured per contributor</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Recent Entry</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mostRecentCapture ? formatDateLabel(mostRecentCapture) : "—"}
              </div>
              <CardDescription>Latest recorded patient capture</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Contributors table */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Contributor Breakdown</CardTitle>
              <CardDescription>
                Track individual data capturers, their roles, and coverage areas
              </CardDescription>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadCsv}
                disabled={loading || !sortedContributors.length}
                className="inline-flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs font-semibold">Download CSV</span>
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={() => handleSortChange("totalRecords")}
                >
                  Sort by entries
                  <ArrowDownUp className="h-3 w-3" />
                </button>
                <span className="mx-1">•</span>
                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  onClick={() => handleSortChange("fullName")}
                >
                  Sort by name
                  <ArrowDownUp className="h-3 w-3" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Contributor</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                  <TableHead className="text-right">Coverage</TableHead>
                  <TableHead className="text-right">Last Capture</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContributors.map((contributor) => (
                  <TableRow key={`${contributor.userId ?? "unassigned"}-${contributor.fullName}`}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{contributor.fullName}</span>
                        <span className="text-xs text-muted-foreground">
                          {contributor.username || "Unassigned"}
                          {contributor.userPhone ? ` • ${contributor.userPhone}` : ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {contributor.userType || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-muted-foreground">
                        <span>{contributor.userRegion || "—"}</span>
                        <span>{contributor.userDistrict || ""}</span>
                        <span>{contributor.userSubdistrict || ""}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(contributor.totalRecords)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {contributor.regionsCovered} regions • {contributor.districtsCovered} districts • {contributor.communitiesCovered} communities
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {formatDateLabel(contributor.lastCapture)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Geographic breakdown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>By Region</CardTitle>
              <CardDescription>Registrations grouped by region</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead className="text-right">Entries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.breakdown.byRegion.map((item) => (
                    <TableRow key={item.region}>
                      <TableCell>{item.region}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>By District</CardTitle>
              <CardDescription>Regional drilldown by district</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Region</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead className="text-right">Entries</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.breakdown.byDistrict.map((item) => (
                    <TableRow key={`${item.region}-${item.district}`}>
                      <TableCell>{item.region}</TableCell>
                      <TableCell>{item.district}</TableCell>
                      <TableCell className="text-right">{formatNumber(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Daily trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Activity</CardTitle>
            <CardDescription>Number of patient captures per day</CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Entries</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.breakdown.byDate.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>{formatDateLabel(item.date)}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Data Capture Reports</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Contributor Reporting</h1>
        <p className="text-muted-foreground">
          Understand how much data has been captured, by whom, and across which regions. Use the filters to align with payroll cycles or supervisory reviews.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            {appliedFilters.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {appliedFilters.map((filter) => (
                  <Badge key={filter} variant="outline" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Showing national view • No filters applied</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Start Date</label>
              <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">End Date</label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            
            {/* Hierarchical Location Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Filter By</label>
              <Select 
                value={filterLevel} 
                onValueChange={(value: FilterLevel) => {
                  setFilterLevel(value);
                  setSelectedRegion("");
                  setSelectedDistrict("");
                  setSelectedSubdistrict("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select filter level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Location Filter</SelectItem>
                  {availableFilterLevels.includes('region') && (
                    <SelectItem value="region">Region</SelectItem>
                  )}
                  {availableFilterLevels.includes('district') && (
                    <SelectItem value="district">District</SelectItem>
                  )}
                  {availableFilterLevels.includes('subdistrict') && (
                    <SelectItem value="subdistrict">Subdistrict</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* Conditional filter based on selected level */}
            {filterLevel === 'region' && availableRegions.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Select Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a region" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRegions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {filterLevel === 'district' && availableDistricts.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Select District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {filterLevel === 'subdistrict' && availableSubdistricts.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Select Subdistrict</label>
                <Select value={selectedSubdistrict} onValueChange={setSelectedSubdistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a subdistrict" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubdistricts.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Your Access Level</label>
              <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{accessInfo.label}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Report Status</CardTitle>
            <CardDescription>
              Refreshed {data?.meta?.generatedAt ? formatDateLabel(data.meta.generatedAt) : "recently"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={loading ? "outline" : error ? "destructive" : "secondary"}>
              {loading ? "Refreshing" : error ? "Sync issue" : "Up to date"}
            </Badge>
            <span>Filters applied: {appliedFilters.length || 0}</span>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsFieldWork;
