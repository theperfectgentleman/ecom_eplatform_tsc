import { useState, useEffect, useCallback } from 'react';
import { ANCPatient, Patient } from '@/types';
import { useApi } from '@/lib/useApi';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Edit } from 'lucide-react';

interface AntenatalCareListProps {
  selectedPatientId?: string;
  onPatientSelect: (patient: ANCPatient, isReadOnly?: boolean) => void;
  refreshTrigger: number;
}

const AntenatalCareList = ({ 
  selectedPatientId, 
  onPatientSelect, 
  refreshTrigger 
}: AntenatalCareListProps) => {
  const [patients, setPatients] = useState<ANCPatient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { request } = useApi();

  // Helper function to format full name
  const formatFullName = (patient: ANCPatient): string => {
    const surname = patient.name || '';
    const otherNames = patient.othernames || '';
    
    if (surname && otherNames) {
      return `${otherNames} ${surname}`;
    }
    if (surname) {
      return surname;
    }
    if (otherNames) {
      return otherNames;
    }
    return 'No name';
  };

  const loadPatients = useCallback(async () => {
    try {
      setLoading(true);
      // Load regular patients with cache busting parameter
      const timestamp = new Date().getTime();
      const data = await request<Patient[]>({ 
        path: `patients?_t=${timestamp}`
      });
      
      // Transform Patient[] to ANCPatient[] format
      const ancPatients: ANCPatient[] = (data || []).map(patient => ({
        ...patient,
        registration_status: 'active', // Default status
        last_visit_date: patient.registration_date,
        next_appointment: undefined,
        pregnancy_status: 'active',
        gestational_age: undefined
      }));
      
      setPatients(ancPatients);
    } catch (error) {
      console.error('Failed to load ANC patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger, loadPatients]);

  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.name?.toLowerCase().includes(searchLower) ||
      patient.othernames?.toLowerCase().includes(searchLower) ||
      formatFullName(patient).toLowerCase().includes(searchLower) ||
      patient.contact_number?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="space-y-3">
            {/* Search skeleton */}
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            {/* Patient list skeletons */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 flex-shrink-0">        
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No patients found' : 'No patients registered yet'}
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const isSelected = patient.patient_id === selectedPatientId;
            
            return (
              <div
                key={patient.patient_id}
                onClick={() => onPatientSelect(patient, true)} // Read-only mode by default
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar with initials */}
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-gray-600">
                      {patient.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </div>
                  
                  {/* Patient Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{formatFullName(patient)}</h4>
                    {patient.antenatal_registration ? (
                      <p className="text-sm text-gray-500">
                        {new Date(patient.antenatal_registration.registration_date).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">
                        {patient.registration_date ? new Date(patient.registration_date).toLocaleDateString() : 'No date'}
                      </p>
                    )}
                  </div>
                  
                  {/* Edit Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the parent click
                      onPatientSelect(patient, false); // Edit mode
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                    title="Edit patient"
                  >
                    <Edit className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AntenatalCareList;
