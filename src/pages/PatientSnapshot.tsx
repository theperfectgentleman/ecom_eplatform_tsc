import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/toast/useToast';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { PatientSummary } from '@/types';
import PatientSnapshotCard from '@/components/patient-snapshot/PatientSnapshotCard';
import PaginationControls from '@/components/patient-snapshot/PaginationControls';
import SnapshotFilters from '@/components/patient-snapshot/SnapshotFilters';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, AlertTriangle, Clock, CheckCircle, Camera } from 'lucide-react';

const PatientSnapshot: React.FC = () => {
  // State management
  const [allPatients, setAllPatients] = useState<PatientSummary[]>([]); // Store ALL patients
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [autoOverdue, setAutoOverdue] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [ancStatusFilter, setAncStatusFilter] = useState('all');

  const { toast } = useToast();
  const navigate = useNavigate();
  const { request } = useApi();
  const { user } = useAuth();

  // Debug: Log state changes
  console.log('=== STATE DEBUG ===');
  console.log('All patients state:', allPatients);
  console.log('Current loading state:', loading);

  // Fetch ALL patients data (no pagination at API level)
  const fetchPatients = useCallback(async (page: number = 1) => {
    console.log('fetchPatients called with user:', user);

    if (!user?.user_id) {
      console.error('No user ID available, user object:', user);
      // Avoid infinite loading if user not ready yet
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('=== DEBUGGING API CALLS ===');
      console.log('User ID:', user.user_id);

      // Step 1: Get all patients the current user can view
      console.log('Step 1: Fetching viewable patients...');
      
      let allPatientsResponse;
      
      // If user access level is 4 (national), get all patients
      if (user.access_level === 4) {
        console.log('User access level is 4 (national) - fetching all patients...');
        allPatientsResponse = await request<any[]>({
          method: 'GET',
          path: 'patients?limit=10000',
        });
      } else {
        console.log('User access level is not national - fetching via access level...');
        allPatientsResponse = await request<any[]>({
          method: 'GET',
          path: `patients/level/${user.user_id}?limit=10000`,
        });
      }

      console.log('All patients response:', allPatientsResponse);

      // Extract patient IDs from the response
      const patientIds: string[] = Array.isArray(allPatientsResponse)
        ? allPatientsResponse
            .map((patient) => patient.patient_id || patient.id || patient.patientId)
            .filter(Boolean)
        : [];

      // Build a map for enriching summary data with base fields (like patient_code, othernames)
      const baseById = new Map<string, any>();
      if (Array.isArray(allPatientsResponse)) {
        for (const p of allPatientsResponse) {
          const id = p.patient_id || p.id || p.patientId;
          if (id) baseById.set(id, p);
        }
      }

      console.log('Extracted patient IDs:', patientIds);

      if (!patientIds || patientIds.length === 0) {
        console.log('No patient IDs found');
        setAllPatients([]);
        setCurrentPage(1);
        return;
      }

      // Step 2: Fetch ALL patient summaries at once (no pagination at API level)
      console.log('Step 2: Getting summaries for ALL patient IDs...');

      const requestData = {
        patient_ids: patientIds, // Get ALL summaries, not paginated
      };

      console.log('Summary request data:', requestData);

      const response = await request<
        | PatientSummary[]
        | { data: any[]; count?: number }
        | { results: any[]; count?: number }
      >({
        method: 'POST',
        path: 'patients/summary',
        body: requestData,
      });

      const rawSummaries: any[] = Array.isArray(response)
        ? response
        : (response as any)?.data || (response as any)?.results || [];
      console.log('Patient summaries raw response:', rawSummaries);

      // Helper to safely parse and map priority
      const toPriorityStatus = (
        priority?: string,
        overdue_days?: number | null,
        next_visit_date?: string | null
      ): 'overdue' | 'due_soon' | 'on_track' => {
        if (typeof overdue_days === 'number' && overdue_days > 0) return 'overdue';
        if (priority === 'overdue') return 'overdue';
        if (priority === 'due_soon') return 'due_soon';
        if (priority === 'on_track') return 'on_track';
        if (next_visit_date) {
          try {
            const now = new Date();
            const next = new Date(next_visit_date);
            const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (!isNaN(diffDays) && diffDays >= 0 && diffDays <= 3) return 'due_soon';
          } catch {
            // Invalid date format, ignore
          }
        }
        return 'on_track';
      };

      const summaries: PatientSummary[] = rawSummaries.map((s: any) => {
        const base = baseById.get(s.patient_id);
        // Compute days_until_due when possible
        let days_until_due: number | undefined;
        if (s.next_visit_date) {
          try {
            const now = new Date();
            const next = new Date(s.next_visit_date);
            const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (!isNaN(diff)) days_until_due = diff;
          } catch {
            // Invalid date format, ignore
          }
        }

        return {
          patient_id: s.patient_id,
          name: s.name || base?.name || '',
          othernames: base?.othernames,
          dob: s.dob ?? base?.dob,
          contact_number: s.contact_number ?? base?.contact_number,
          patient_code: base?.patient_code,
          anc_registered: Boolean(s.anc_registered),
          registration_date: s.anc_registration_date ?? s.registration_date,
          next_appointment_date: s.next_visit_date ?? s.next_appointment_date,
          visits_attended: s.visit_dates ?? s.visits_attended ?? [],
          total_visits: s.visits_count ?? s.total_visits ?? 0,
          last_visit_date: s.last_visit_date,
          priority_status: toPriorityStatus(s.priority, s.overdue_days, s.next_visit_date),
          days_overdue: s.overdue_days ?? s.days_overdue,
          days_until_due,
        } as PatientSummary;
      });
      console.log('Patient summaries mapped:', summaries);

      // Store ALL patients - filtering and pagination happens in useMemo
      setAllPatients(summaries);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch patient summaries:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: 'Failed to load patient summaries. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  }, [request, toast, user]);

  // Filter ALL patients based on search and filter criteria
  const filteredPatients = useMemo(() => {
    console.log('=== FILTERING DEBUG ===');
    console.log('Input allPatients for filtering:', allPatients);
    console.log('searchTerm:', searchTerm);
    console.log('priorityFilter:', priorityFilter);
    console.log('ancStatusFilter:', ancStatusFilter);
    
    const result = allPatients.filter((patient: PatientSummary) => {
      console.log('Filtering patient:', patient);
      
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        patient.name?.toLowerCase().includes(searchLower) ||
        patient.othernames?.toLowerCase().includes(searchLower) ||
        patient.patient_code?.toLowerCase().includes(searchLower) ||
        patient.contact_number?.includes(searchTerm);

      console.log('matchesSearch:', matchesSearch);

      // Priority filter
      const matchesPriority = priorityFilter === 'all' || patient.priority_status === priorityFilter;
      console.log('matchesPriority:', matchesPriority, 'patient.priority_status:', patient.priority_status);

      // ANC status filter
      const matchesAncStatus = ancStatusFilter === 'all' ||
        (ancStatusFilter === 'registered' && patient.anc_registered) ||
        (ancStatusFilter === 'not_registered' && !patient.anc_registered);

      console.log('matchesAncStatus:', matchesAncStatus, 'patient.anc_registered:', patient.anc_registered);

      const passes = matchesSearch && matchesPriority && matchesAncStatus;
      console.log('Patient passes filter:', passes);
      
      return passes;
    });
    
    console.log('Filtered result:', result);
    console.log('Filtered result length:', result.length);
    
    return result;
  }, [allPatients, searchTerm, priorityFilter, ancStatusFilter]);

  // Overall statistics (for the entire dataset, not just current page)
  const overallStats = useMemo(() => {
    if (!allPatients.length) return { total: 0, overdue: 0, dueSoon: 0, onTrack: 0, ancRegistered: 0 };

    const total = allPatients.length;
    const dueSoon = allPatients.filter(s => s.priority_status === 'due_soon').length;
    const onTrack = allPatients.filter(s => s.priority_status === 'on_track').length;
    const ancRegistered = allPatients.filter(s => s.anc_registered).length;

    let overdueCount = 0;
    if (autoOverdue) {
      overdueCount = allPatients.filter(s => s.priority_status === 'overdue').length;
    } else {
      // Filter only patients added after September 2025 (i.e., from Oct 1, 2025)
      const cutoffDate = new Date('2025-09-30');
      overdueCount = allPatients.filter(s => {
        if (s.priority_status !== 'overdue') return false;
        if (!s.registration_date) return false;
        const regDate = new Date(s.registration_date);
        return regDate > cutoffDate;
      }).length;
    }

    return {
      total,
      overdue: overdueCount,
      dueSoon,
      onTrack,
      ancRegistered
    };
  }, [allPatients, autoOverdue]);

  // Paginate filtered patients
  const { paginatedPatients, totalPages } = useMemo(() => {
    const total = filteredPatients.length;
    const pages = Math.ceil(total / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginated = filteredPatients.slice(startIndex, endIndex);
    
    return { 
      paginatedPatients: paginated,
      totalPages: pages
    };
  }, [filteredPatients, currentPage, pageSize]);

  // Handle page changes (no need to fetch, just update current page)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Handle filter changes
  const handleClearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
    setAncStatusFilter('all');
  };

  // Handle patient actions
  const handleViewDetails = (patient: PatientSummary) => {
    // Navigate to patient overview with patient ID as query parameter
    navigate(`/patient-overview?patientId=${patient.patient_id}`);
  };

  const handleRefresh = () => {
    fetchPatients(currentPage);
  };

  // Initial load - fetch all patients once
  useEffect(() => {
    if (user?.user_id) {
      fetchPatients(1);
    }
  }, [fetchPatients, user?.user_id]);

  // Debug: Log current state values in render
  console.log('=== RENDER DEBUG ===');
  console.log('allPatients:', allPatients);
  console.log('allPatients.length:', allPatients.length);
  console.log('filteredPatients:', filteredPatients);
  console.log('filteredPatients.length:', filteredPatients.length);
  console.log('paginatedPatients.length:', paginatedPatients.length);
  console.log('loading:', loading);
  console.log('currentPage:', currentPage);
  console.log('totalPages:', totalPages);
  console.log('overallStats:', overallStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Patient Snapshot
          </h1>
          <p className="text-gray-600 mt-1">Quick overview of patient status and priorities</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} className="whitespace-nowrap">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Summary Statistics */}
      <div>
        <div className="flex items-center mb-3 gap-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Overall Statistics - All Patients
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700">{overallStats.total}</div>
              <div className="text-sm text-gray-600">Total Patients</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-700">{overallStats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-amber-700">{overallStats.dueSoon}</div>
              <div className="text-sm text-gray-600">Due Soon</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700">{overallStats.onTrack}</div>
              <div className="text-sm text-gray-600">On Track</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-700">{overallStats.ancRegistered}</div>
              <div className="text-sm text-gray-600">ANC Registered</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <SnapshotFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        ancStatusFilter={ancStatusFilter}
        onAncStatusFilterChange={setAncStatusFilter}
        autoOverdue={autoOverdue}
        onAutoOverdueChange={setAutoOverdue}
        onClearFilters={handleClearFilters}
        totalPatients={allPatients.length}
        filteredPatients={filteredPatients.length}
      />

      {/* Patient Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {Array.from({ length: pageSize }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {searchTerm || priorityFilter !== 'all' || ancStatusFilter !== 'all'
                ? "Try adjusting your search criteria or filters."
                : "No patient data available."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12">
          {paginatedPatients.map((patient: PatientSummary) => (
            <PatientSnapshotCard
              key={patient.patient_id}
              patient={patient}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredPatients.length > 0 && (
        <Card>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredPatients.length}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Card>
      )}
    </div>
  );
};

export default PatientSnapshot;
