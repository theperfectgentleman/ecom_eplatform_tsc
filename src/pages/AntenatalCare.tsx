import { useState } from 'react';
import { ANCStage, ANCFormState, ANCPatient, Patient } from '@/types';
import AntenatalCareList from '@/components/antenatal/AntenatalCareList';
import AntenatalCareForm from '@/components/antenatal/AntenatalCareForm';
import ANCDashboard from '@/components/antenatal/ANCDashboard';
import { Button } from '@/components/ui/button';
import { Home, Plus } from 'lucide-react';

const AntenatalCare = () => {
  const [formState, setFormState] = useState<ANCFormState>({
    currentStage: ANCStage.PERSON_DETAILS,
    selectedPatient: undefined,
  });
  const [showForm, setShowForm] = useState(false);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePatientSelect = (patient: ANCPatient, isReadOnly: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      selectedPatient: patient,
      currentStage: ANCStage.PERSON_DETAILS, // Always default to person details when patient is selected
      isReadOnly: isReadOnly,
    }));
    setShowForm(true); // Show the form when a patient is selected
  };

  const handleCreateNew = () => {
    setFormState({
      currentStage: ANCStage.PERSON_DETAILS,
      selectedPatient: undefined,
      isReadOnly: false,
    });
    setShowForm(true);
  };

  const handleBackToDashboard = () => {
    setShowForm(false);
    setFormState({
      currentStage: ANCStage.PERSON_DETAILS,
      selectedPatient: undefined,
    });
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleStageChange = (stage: ANCStage) => {
    setFormState(prev => ({
      ...prev,
      currentStage: stage,
    }));
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel - Patient List */}
      <div className="w-[35%] min-w-0 p-6 bg-white border-r flex flex-col">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Patients</h2>
        </div>
        <AntenatalCareList
          selectedPatientId={formState.selectedPatient?.patient_id}
          onPatientSelect={handlePatientSelect}
          refreshTrigger={refreshTrigger}
        />
      </div>
      
      {/* Right Panel - Form/Dashboard */}
      <div className="w-[65%] min-w-0 flex flex-col">
        {/* Header with buttons - moved to top of right panel */}
        <div className="flex justify-between items-center p-6 pb-4 bg-gray-50 border-b flex-shrink-0">
          <h1 className="text-2xl font-bold">Antenatal Care Management</h1>
          <div className="flex gap-2">
            {(formState.selectedPatient || showForm) && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            )}
            {(formState.selectedPatient || showForm) && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleCreateNew}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Registration
              </Button>
            )}
          </div>
        </div>
        
        {/* Form Content */}
        <div className="flex-1 p-6 pt-0 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {formState.selectedPatient || showForm ? (
              <AntenatalCareForm
                formState={formState}
                onStageChange={handleStageChange}
                onSuccess={handleSuccess}
                onPatientUpdate={(patient: Patient) => {
                  setFormState(prev => ({
                    ...prev,
                    selectedPatient: patient
                  }));
                }}
              />
            ) : (
              <ANCDashboard onNewRegistration={handleCreateNew} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AntenatalCare;
