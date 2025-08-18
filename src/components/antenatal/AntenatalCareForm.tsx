import { useState, useEffect } from 'react';
import { ANCStage, ANCFormState, Patient, AntenatalRegistration } from '@/types';
import { useApi } from '@/lib/useApi';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Calendar } from 'lucide-react';
import PersonDetailsForm from './PersonDetailsForm';
import ANCRegistrationForm from './ANCRegistrationForm';
import ANCVisitForm from './ANCVisitForm';
import StageProgress from './StageProgress';
import { LoadingModal } from '@/components/ui/loading-modal';
import { ShimmerCard } from '@/components/ui/shimmer';

interface AntenatalCareFormProps {
  formState: ANCFormState;
  onStageChange: (stage: ANCStage) => void;
  onSuccess: () => void;
  onPatientUpdate?: (patient: Patient) => void;
}

const AntenatalCareForm = ({ formState, onStageChange, onSuccess, onPatientUpdate }: AntenatalCareFormProps) => {
  const { currentStage, selectedPatient, isReadOnly } = formState;
  const { quietRequest, request } = useApi();
  const [communities, setCommunities] = useState<any[]>([]);
  const [registration, setRegistration] = useState<AntenatalRegistration | null>(null);
  const [completedStages, setCompletedStages] = useState<ANCStage[]>([]);
  const [isLoadingRegistration, setIsLoadingRegistration] = useState(false);

  // Load communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const data = await request({ path: 'communities' });
        setCommunities(data);
      } catch (error) {
        console.error('Failed to fetch communities:', error);
      }
    };
    
    fetchCommunities();
  }, [request]);

  // Load registration data and determine completed stages when patient is selected
  useEffect(() => {
    const loadRegistrationData = async () => {
      if (selectedPatient) {
        setIsLoadingRegistration(true);
        const completed: ANCStage[] = [];
        
        // Person details is completed if patient exists
        completed.push(ANCStage.PERSON_DETAILS);
        
        // First check if registration is already in patient data
        if (selectedPatient.antenatal_registration) {
          setRegistration(selectedPatient.antenatal_registration);
          completed.push(ANCStage.ANC_REGISTRATION);
          setIsLoadingRegistration(false);
        } else {
          // Try to load registration from API
          try {
            const registrations = await quietRequest<AntenatalRegistration[]>({
              path: `antenatal-registrations/patient/${selectedPatient.patient_id}`,
            });
            
            if (registrations && registrations.length > 0) {
              // Use the most recent registration
              const latestRegistration = registrations[0];
              setRegistration(latestRegistration);
              completed.push(ANCStage.ANC_REGISTRATION);
            } else {
              setRegistration(null);
            }
          } catch (error) {
            console.error('Failed to load registration:', error);
            setRegistration(null);
          } finally {
            setIsLoadingRegistration(false);
          }
        }
        
        setCompletedStages(completed);
      } else {
        setCompletedStages([]);
        setRegistration(null);
        setIsLoadingRegistration(false);
      }
    };

    loadRegistrationData();
  }, [selectedPatient, request]);

  const isStageAccessible = (stage: ANCStage) => {
    switch (stage) {
      case ANCStage.PERSON_DETAILS:
        return true;
      case ANCStage.ANC_REGISTRATION:
        // Always allow access if patient exists (regardless of registration status)
        return !!selectedPatient?.patient_id;
      case ANCStage.ANC_VISITS:
        // Always allow access if patient exists (regardless of visit records)
        return !!selectedPatient?.patient_id;
      default:
        return false;
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case ANCStage.PERSON_DETAILS:
        return (
          <PersonDetailsForm
            initialData={selectedPatient}
            communities={communities}
            readOnly={isReadOnly}
            onSuccess={(patient: Patient) => {
              // Update selected patient with latest data and move to next stage
              if (onPatientUpdate) {
                onPatientUpdate(patient);
              }
              // Mark this stage as completed
                setCompletedStages(prev => {
                  if (!prev.includes(ANCStage.PERSON_DETAILS)) {
                    return [...prev, ANCStage.PERSON_DETAILS];
                  }
                  return prev;
                });
                onStageChange(ANCStage.ANC_REGISTRATION);
                onSuccess();
              }}
            />
        );
      
      case ANCStage.ANC_REGISTRATION:
        if (!selectedPatient) {
          return (
            <div className="p-6 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Patient Required</h3>
              <p className="text-gray-600">
                Please complete person details first before ANC registration.
              </p>
            </div>
          );
        }
        
        return (
          <ANCRegistrationForm
            patient={selectedPatient}
            initialData={registration || undefined}
            readOnly={isReadOnly}
            onSuccess={(newRegistration: AntenatalRegistration) => {
              setRegistration(newRegistration);
              // Mark this stage as completed
              setCompletedStages(prev => {
                if (!prev.includes(ANCStage.ANC_REGISTRATION)) {
                  return [...prev, ANCStage.ANC_REGISTRATION];
                }
                return prev;
              });
              onStageChange(ANCStage.ANC_VISITS);
              onSuccess();
            }}
          />
        );
      
      case ANCStage.ANC_VISITS:
        if (!selectedPatient) {
          return (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Patient Required</h3>
              <p className="text-gray-600">
                Please select or create a patient first.
              </p>
            </div>
          );
        }

        // Show loading state while fetching registration
        if (isLoadingRegistration) {
          return (
            <div className="p-6">
              <ShimmerCard />
            </div>
          );
        }

        if (!registration) {
          return (
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">ANC Registration Required</h3>
              <p className="text-gray-600 mb-4">
                Complete ANC registration first before recording visits.
              </p>
              <button
                onClick={() => onStageChange(ANCStage.ANC_REGISTRATION)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Go to ANC Registration
              </button>
            </div>
          );
        }
        
        return (
          <ANCVisitForm
            patient={selectedPatient}
            registration={registration}
            readOnly={isReadOnly}
            onSuccess={() => {
              onSuccess();
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Loading Modal */}
      <LoadingModal 
        isOpen={isLoadingRegistration} 
        title="Loading ANC Data"
        message="Fetching antenatal registration information..."
      />
      
      {/* Form Content - no internal scrolling, let parent handle it */}
      <div className="flex-1">
        <div className="w-full">
          <Card className="w-full">
            <CardContent className="p-0">
              {/* Stage Progress - Inside card, at the top */}
              <div className="p-6 pb-0">
                <StageProgress 
                  currentStage={currentStage}
                  completedStages={completedStages}
                  onStageClick={(stage) => {
                    if (isStageAccessible(stage)) {
                      onStageChange(stage);
                    }
                  }}
                  isStageAccessible={isStageAccessible}
                />
              </div>
              
              {/* Form Content */}
              <div className="p-6 pt-0">
                {renderStageContent()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AntenatalCareForm;
