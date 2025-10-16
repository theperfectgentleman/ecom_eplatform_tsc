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
import { ArrowDownUp, Filter, MapPin, Users, CalendarDays } from "lucide-react";

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

const ALL_REGIONS_LABEL = "All Regions";
const ALL_DISTRICTS_LABEL = "All Districts";
const ALL_SUBDISTRICTS_LABEL = "All Subdistricts";

const Reports = () => {
  const { request } = useApi();
  const { getAccessLevelInfo, userLocation } = useAccessLevelFilter();
  const userRegion = userLocation.region;
  const userDistrict = userLocation.district;
  const userSubdistrict = userLocation.subdistrict;

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [region, setRegion] = useState<string>(ALL_REGIONS_LABEL);
  const [district, setDistrict] = useState<string>(ALL_DISTRICTS_LABEL);
  const [subdistrict, setSubdistrict] = useState<string>(ALL_SUBDISTRICTS_LABEL);

  const [data, setData] = useState<DataCaptureResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<"totalRecords" | "fullName">("totalRecords");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const accessInfo = getAccessLevelInfo();

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

  const availableRegions = useMemo(() => {
    if (!data?.meta?.availableRegions?.length) return [];
    return Array.from(new Set(data.meta.availableRegions.filter(Boolean))).sort();
  }, [data?.meta?.availableRegions]);

  const availableDistricts = useMemo(() => {
    const districtsFromMeta = data?.meta?.availableDistricts || [];
    const districtsFromBreakdown = data?.breakdown?.byDistrict?.map((d) => d.district) || [];
    const combined = Array.from(new Set([...districtsFromMeta, ...districtsFromBreakdown].filter(Boolean)));
    combined.sort();
    if (region !== ALL_REGIONS_LABEL) {
      const validDistricts = new Set(
        data?.breakdown?.byDistrict
          ?.filter((item) => item.region === region)
          .map((item) => item.district) || []
      );
      return combined.filter((d) => validDistricts.has(d));
    }
    return combined;
  }, [data?.meta?.availableDistricts, data?.breakdown?.byDistrict, region]);

  const availableSubdistricts = useMemo(() => {
    if (!data?.data?.length) return [];
    const filtered = data.data.filter((contributor) => {
      if (district !== ALL_DISTRICTS_LABEL) {
        return contributor.userDistrict === district;
      }
      if (region !== ALL_REGIONS_LABEL) {
        return contributor.userRegion === region;
      }
      return true;
    });
    const unique = Array.from(
      new Set(
        filtered
          .map((contributor) => contributor.userSubdistrict)
          .filter((value): value is string => Boolean(value && value.trim()))
      )
    );
    unique.sort();
    return unique;
  }, [data?.data, district, region]);

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

  const handleSortChange = (field: "totalRecords" | "fullName") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "totalRecords" ? "desc" : "asc");
    }
  };

  useEffect(() => {
    // Auto-select filters based on user's access information on first load
    if (!data) return;

    if (region === ALL_REGIONS_LABEL && userRegion) {
      setRegion(userRegion);
      return;
    }

    if (
      region === userRegion &&
      district === ALL_DISTRICTS_LABEL &&
      userDistrict
    ) {
      setDistrict(userDistrict);
      return;
    }

    if (
      district === userDistrict &&
      subdistrict === ALL_SUBDISTRICTS_LABEL &&
      userSubdistrict
    ) {
      setSubdistrict(userSubdistrict);
    }
  }, [data, district, region, subdistrict, userDistrict, userRegion, userSubdistrict]);

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
    if (region !== ALL_REGIONS_LABEL) active.push(`Region: ${region}`);
    if (district !== ALL_DISTRICTS_LABEL) active.push(`District: ${district}`);
    if (subdistrict !== ALL_SUBDISTRICTS_LABEL) active.push(`Subdistrict: ${subdistrict}`);
    return active;
  }, [startDate, endDate, region, district, subdistrict]);

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
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Region</label>
              <Select value={region} onValueChange={(value) => {
                setRegion(value);
                setDistrict(ALL_DISTRICTS_LABEL);
                setSubdistrict(ALL_SUBDISTRICTS_LABEL);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_REGIONS_LABEL}>{ALL_REGIONS_LABEL}</SelectItem>
                  {availableRegions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">District</label>
              <Select value={district} onValueChange={(value) => {
                setDistrict(value);
                setSubdistrict(ALL_SUBDISTRICTS_LABEL);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_DISTRICTS_LABEL}>{ALL_DISTRICTS_LABEL}</SelectItem>
                  {availableDistricts.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Subdistrict</label>
              <Select value={subdistrict} onValueChange={setSubdistrict}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subdistrict" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SUBDISTRICTS_LABEL}>{ALL_SUBDISTRICTS_LABEL}</SelectItem>
                  {availableSubdistricts.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Access Scope</label>
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

export default Reports;
