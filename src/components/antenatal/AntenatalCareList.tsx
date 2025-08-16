import { useState, useEffect } from 'react';
import { ANCPatient, Patient } from '@/types';
import { useApi } from '@/lib/useApi';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, User } from 'lucide-react';

interface AntenatalCareListProps {
  selectedPatientId?: string;
  onPatientSelect: (patient: ANCPatient) => void;
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

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Load regular patients - we'll extend this to include ANC-specific data
      const data = await request<Patient[]>({ 
        path: 'patients'
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
  };

  const filteredPatients = patients.filter(patient => 
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.contact_number?.includes(searchTerm)
  );

  const getPatientStatus = (patient: ANCPatient) => {
    if (patient.antenatal_registration) {
      return patient.latest_visit ? 'Active' : 'Registered';
    }
    return 'New';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Registered': return 'bg-blue-100 text-blue-800';
      case 'New': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <Card className="h-full">
      <CardHeader className="pb-4">        
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
      
      <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No patients found' : 'No patients registered yet'}
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const status = getPatientStatus(patient);
            const isSelected = patient.patient_id === selectedPatientId;
            
            return (
              <div
                key={patient.patient_id}
                onClick={() => onPatientSelect(patient)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <h4 className="font-medium text-sm">{patient.name}</h4>
                    </div>
                    
                    {patient.contact_number && (
                      <p className="text-xs text-gray-500 mt-1">
                        {patient.contact_number}
                      </p>
                    )}
                    
                    {patient.antenatal_registration && (
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          Reg: {new Date(patient.antenatal_registration.registration_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Badge className={`text-xs ${getStatusColor(status)}`}>
                    {status}
                  </Badge>
                </div>
                
                {patient.visits_count !== undefined && (
                  <div className="mt-2 text-xs text-gray-500">
                    Visits: {patient.visits_count}
                  </div>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default AntenatalCareList;
