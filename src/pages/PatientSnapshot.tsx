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
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  
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
  console.log('Current patients state:', patients);
  console.log('Current loading state:', loading);

  // Fetch patients data
  const fetchPatients = useCallback(async (page: number = 1, limit: number = 12) => {
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
      console.log('Step 1: Fetching viewable patients via access level...');
      const allPatientsResponse = await request<any[]>({
        method: 'GET',
        path: `patients/level/${user.user_id}`,
      });

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
        setPatients([]);
        setTotalPages(0);
        setTotalItems(0);
        setCurrentPage(1);
        return;
      }

      // Step 2: Paginate the IDs and get summaries for current page
      console.log('Step 2: Getting summaries for paginated IDs...');

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedIds = patientIds.slice(startIndex, endIndex);

      console.log('Paginated IDs for this page:', paginatedIds);

      const requestData = {
        patient_ids: paginatedIds,
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

      // Calculate pagination info from total patient IDs
      const totalPatientsCount = patientIds.length;
      const calculatedTotalPages = Math.ceil(totalPatientsCount / limit);

  setPatients(summaries);
      setTotalPages(calculatedTotalPages);
      setTotalItems(totalPatientsCount);
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

  // Filter patients based on search and filter criteria
  const filteredPatients = useMemo(() => {
    console.log('=== FILTERING DEBUG ===');
    console.log('Input patients for filtering:', patients);
    console.log('searchTerm:', searchTerm);
    console.log('priorityFilter:', priorityFilter);
    console.log('ancStatusFilter:', ancStatusFilter);
    
    const result = patients.filter(patient => {
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
  }, [patients, searchTerm, priorityFilter, ancStatusFilter]);

  // Get summary statistics
  const summaryStats = useMemo(() => {
    const total = patients.length;
    const overdue = patients.filter(p => p.priority_status === 'overdue').length;
    const dueSoon = patients.filter(p => p.priority_status === 'due_soon').length;
    const onTrack = patients.filter(p => p.priority_status === 'on_track').length;
    const ancRegistered = patients.filter(p => p.anc_registered).length;

    return { total, overdue, dueSoon, onTrack, ancRegistered };
  }, [patients]);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchPatients(page, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    fetchPatients(1, newPageSize);
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
    fetchPatients(currentPage, pageSize);
  };

  // Initial load
  useEffect(() => {
    if (user?.user_id) {
      fetchPatients(1, pageSize);
    }
  }, [fetchPatients, pageSize, user?.user_id]);

  // Debug: Log current state values in render
  console.log('=== RENDER DEBUG ===');
  console.log('patients:', patients);
  console.log('patients.length:', patients.length);
  console.log('filteredPatients:', filteredPatients);
  console.log('filteredPatients.length:', filteredPatients.length);
  console.log('loading:', loading);
  console.log('totalItems:', totalItems);
  console.log('summaryStats:', summaryStats);

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

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-700">{summaryStats.total}</div>
            <div className="text-sm text-gray-600">Total Patients</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700">{summaryStats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-2xl font-bold text-amber-700">{summaryStats.dueSoon}</div>
            <div className="text-sm text-gray-600">Due Soon</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-700">{summaryStats.onTrack}</div>
            <div className="text-sm text-gray-600">On Track</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-700">{summaryStats.ancRegistered}</div>
            <div className="text-sm text-gray-600">ANC Registered</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <SnapshotFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        ancStatusFilter={ancStatusFilter}
        onAncStatusFilterChange={setAncStatusFilter}
        onClearFilters={handleClearFilters}
        totalPatients={patients.length}
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
          {filteredPatients.map((patient) => (
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
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Card>
      )}
    </div>
  );
};

export default PatientSnapshot;
