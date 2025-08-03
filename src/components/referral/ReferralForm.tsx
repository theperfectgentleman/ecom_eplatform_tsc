import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import { FloatingSelect } from "@/components/ui/floating-select";
import { SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Patient } from "@/types";
import { normalizeReferralPayload } from "@/lib/normalizeReferralPayload";
import { useToast } from "@/components/ui/toast/useToast";
import ReactSelect, { SingleValue } from "react-select";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PRIORITY_OPTIONS = ["Opened", "Urgent", "Critical", "Closed"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE_STATUS_OPTIONS = ["Insured", "Not Insured", "Unknown"];

// Type for patient select options
interface PatientOption {
  value: string;
  label: string;
  patient: Patient;
}

const getPriorityColorClass = (priority: string) => {
  switch (priority) {
    case "Urgent":
      return "bg-orange-100 text-orange-800";
    case "Critical":
      return "bg-red-100 text-red-800";
    case "Opened":
      return "bg-purple-100 text-purple-800";
    case "Closed":
      return "bg-gray-100 text-gray-800";
    default:
      return "";
  }
};

const ReferralForm: React.FC<{ 
  initialData?: any; 
  onCancel: () => void; 
  onCaseCreated: () => void; 
  isReadOnly: boolean; 
  onNewCase: () => void;
}> = ({ initialData, onCancel, onCaseCreated, isReadOnly, onNewCase }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [selectedPatientOption, setSelectedPatientOption] = useState<PatientOption | null>(null);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [usePatientDropdown, setUsePatientDropdown] = useState<boolean>(false);

  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  // Community options removed as community does not exist in the database
  const [showReferral, setShowReferral] = useState(false);
  const { request } = useApi();
  const [formState, setFormState] = useState({
    case_file_id: undefined as string | undefined,
    priority_level: "Opened",
    region: "",
    district: "",
    sub_district: "",
    gender: "",
    referral_needed: false,
    insurance_status: "",
    insurance_no: "",
    present_complaints: "",
    examination_findings: "",
    temperature: "",
    weight: "",
    blood_group: "",
    bp: "",
    pulse: "",
    treatment_given: "",
    referral_reason_notes: "",
    referring_officer_name: "",
    referring_officer_position: "",
    medications_given: "",
    medications_on: "",
    referring_facility_name: "",
    national_id: "",
    facility_referred_to: "",
    transportation_means: "",
    other_notes: "",
    name: "",
    year_of_birth: "",
    patient_id: "-1",
    contact_number: "",
  });
  const isInitialMount = React.useRef(true);

  const isFormDisabled = isReadOnly && !!initialData;

  // Load all patients based on user's access level when dropdown is enabled and not in edit mode
  useEffect(() => {
    if (user?.user_id && usePatientDropdown && !initialData) {
      setIsLoadingPatients(true);
      console.log(`Loading patients for user ID: ${user.user_id}`);
      request<Patient[]>({
        path: `patients/level/${user.user_id}`,
      })
        .then((data) => {
          // Create options for React-Select
          const options: PatientOption[] = data.map(patient => ({
            value: patient.patient_id.toString(),
            label: `${patient.name || 'Unknown'} ${patient.contact_number ? `(${patient.contact_number})` : '(No phone)'}`,
            patient: patient
          }));
          setPatientOptions(options);
          console.log(`Loaded ${data.length} patients for user access level`);
        })
        .catch((err) => {
          console.error("Failed to load patients", err);
          setPatientOptions([]);
        })
        .finally(() => {
          setIsLoadingPatients(false);
        });
    } else {
      console.log("Patient loading skipped - dropdown disabled or in edit mode");
      setIsLoadingPatients(false);
    }
  }, [user?.user_id, request, usePatientDropdown, initialData]);

  // Fetch communities on mount
  useEffect(() => {
    request({ path: "communities" }).then((data) => {
      setCommunities(data);
      const regions = Array.from(new Set(data.map((c: any) => String(c.region)).filter(Boolean))) as string[];
      setRegionOptions(["None", ...regions.filter((r: string) => r && r !== "None")]);
    });
  }, [request]);

  // Progressive dropdown logic for region changes
  useEffect(() => {
    // Skip if we're in initial loading of existing data
    if (isInitialMount.current) return;
    console.log("Region changed to:", formState.region);
    
    // Handle new case creation or manual changes to region
    if (!initialData || (initialData && !isFormDisabled)) {
      if (formState.region !== initialData?.region) {
        setFormState((s) => ({ ...s, district: "", sub_district: "" })); // community removed
      }
      
      // Update district options based on selected region
      const districts = Array.from(
        new Set(communities
          .filter((c) => c.region === formState.region)
          .map((c) => c.district)
          .filter(Boolean))
      );
      setDistrictOptions(["None", ...districts]);
      
      // Clear child dropdowns only for new entries or manual changes
      if (formState.region !== initialData?.region) {
        setSubdistrictOptions([]);
        // setCommunityOptions removed
      }
    }
  }, [formState.region, communities, initialData, isFormDisabled]);

  // Progressive dropdown logic for district changes
  useEffect(() => {
    // Skip if we're in initial loading of existing data
    if (isInitialMount.current) return;
    console.log("District changed to:", formState.district);
    
    // Handle new case creation or manual changes to district
    if (!initialData || (initialData && !isFormDisabled)) {
      if (formState.district !== initialData?.district) {
        setFormState((s) => ({ ...s, sub_district: "" })); // community removed
      }
      
      // Update subdistrict options based on selected region and district
      const subdistricts = Array.from(
        new Set(communities
          .filter((c) => c.region === formState.region && c.district === formState.district)
          .map((c) => c.subdistrict)
          .filter(Boolean))
      );
      setSubdistrictOptions(["None", ...subdistricts]);
      
      // Clear child dropdowns only for new entries or manual changes
      // setCommunityOptions removed
    }
  }, [formState.district, communities, formState.region, initialData, isFormDisabled]);

  // Progressive dropdown logic for subdistrict changes
  useEffect(() => {
    // Skip if we're in initial loading of existing data
    if (isInitialMount.current) return;
    console.log("Subdistrict changed to:", formState.sub_district);
    
    // Handle new case creation or manual changes to sub_district
    if (!initialData || (initialData && !isFormDisabled)) {
      if (formState.sub_district !== initialData?.sub_district) {
        // Community field removed
      }
      
      // Community dropdown removed
    }
  }, [formState.sub_district, communities, formState.region, formState.district, initialData, isFormDisabled]);

  // Separate effect to handle loading location options for existing data
  useEffect(() => {
    // Skip if no initial data or communities aren't loaded yet
    if (!initialData || !communities.length) return;
    
    const { patient, ...caseData } = initialData;
    const fullPatientData = patient || caseData.patient || initialData;
    
    if (fullPatientData) {
      console.log("LOCATION DEBUG - Loading location data for case:", {
        region: fullPatientData.region,
        district: fullPatientData.district,
        sub_district: fullPatientData.sub_district,
        community: fullPatientData.community,
      });
      
      // Ensure region options are loaded
      const regionsList = Array.from(new Set(communities.map((c) => String(c.region)).filter(Boolean)));
      setRegionOptions(["None", ...regionsList.filter((r) => r && r !== "None")]);
      console.log("LOCATION DEBUG - Available regions:", regionsList);
      
      // Load district options based on region
      if (fullPatientData.region) {
        const districts = Array.from(new Set(
          communities
            .filter(c => c.region === fullPatientData.region)
            .map(c => c.district)
            .filter(Boolean)
        ));
        setDistrictOptions(["None", ...districts]);
        console.log(`LOCATION DEBUG - Districts for region '${fullPatientData.region}':`, districts);
      }
      
      // Load subdistrict options based on district
      if (fullPatientData.region && fullPatientData.district) {
        const subdistricts = Array.from(new Set(
          communities
            .filter(c => c.region === fullPatientData.region && c.district === fullPatientData.district)
            .map(c => c.subdistrict)
            .filter(Boolean)
        ));
        setSubdistrictOptions(["None", ...subdistricts]);
        console.log(`LOCATION DEBUG - Subdistricts for district '${fullPatientData.district}':`, subdistricts);
      }
      
      // Community dropdown removed
    }
  }, [initialData, communities]);

  // Effect to populate form state with initialData
  useEffect(() => {
    if (initialData) {
      isInitialMount.current = true; // Prevent other effects from clearing values
      
      const { patient, ...caseData } = initialData;
      const fullPatientData = patient || caseData.patient || initialData;

      if (fullPatientData) {
        console.log("Setting form state with data:", fullPatientData);
        const updatedState = {
          ...formState,
          ...caseData,
          case_file_id: caseData.case_file_id || initialData.case_file_id || undefined,
          patient_id: fullPatientData?.patient_id?.toString() || "-1",
          name: fullPatientData?.name || "",
          year_of_birth: fullPatientData?.year_of_birth?.toString() || "",
          gender: fullPatientData?.gender || "",
          region: fullPatientData?.region || "",
          district: fullPatientData?.district || "",
          sub_district: fullPatientData?.sub_district || "",
          // community removed
          insurance_status: fullPatientData?.insurance_status || "",
          insurance_no: fullPatientData?.insurance_no || "",
          // Fix typo: present_complaints (frontend) <-> present_compliants (backend)
          present_complaints: caseData?.present_complaints || caseData?.present_compliants || fullPatientData?.present_complaints || fullPatientData?.present_compliants || "",
          examination_findings: caseData?.examination_findings || fullPatientData?.examination_findings || "",
          temperature: caseData?.temperature?.toString() || fullPatientData?.temperature?.toString() || "",
          weight: caseData?.weight?.toString() || fullPatientData?.weight?.toString() || "",
          blood_group: caseData?.blood_group || fullPatientData?.blood_group || "",
          bp: caseData?.bp || fullPatientData?.bp || "",
          pulse: caseData?.pulse?.toString() || fullPatientData?.pulse?.toString() || "",
          treatment_given: caseData?.treatment_given || fullPatientData?.treatment_given || "",
          referral_reason_notes: caseData?.referral_reason_notes || fullPatientData?.referral_reason_notes || "",
          referring_officer_name: caseData?.referring_officer_name || fullPatientData?.referring_officer_name || "",
          referring_officer_position: caseData?.referring_officer_position || fullPatientData?.referring_officer_position || "",
          medications_given: caseData?.medications_given || fullPatientData?.medications_given || "",
          medications_on: caseData?.medications_on || fullPatientData?.medications_on || "",
          referring_facility_name: caseData?.referring_facility_name || fullPatientData?.referring_facility_name || "",
          national_id: fullPatientData?.national_id || "",
          facility_referred_to: caseData?.facility_referred_to || fullPatientData?.facility_referred_to || "",
          transportation_means: caseData?.transportation_means || fullPatientData?.transportation_means || "",
          other_notes: caseData?.other_notes || fullPatientData?.other_notes || "",
        };

        setFormState(updatedState);
        setShowReferral(updatedState.referral_needed);
        // Keep initialMount true for a bit to prevent cascading effects from clearing values
        setTimeout(() => {
          console.log("Setting isInitialMount to false");
          isInitialMount.current = false;
        }, 500);
      }
    } else {
      // If no initialData, reset form and allow normal cascading behavior
      isInitialMount.current = false;
    }
  }, [initialData]);

  const handlePatientSelect = (option: SingleValue<PatientOption>) => {
    if (!option) {
      // Clear selection
      setSelectedPatientOption(null);
      setFormState(prev => ({ 
        ...prev, 
        patient_id: "-1",
        name: "",
        year_of_birth: "",
        gender: "",
        region: "",
        district: "",
        sub_district: "",
        national_id: "",
        insurance_status: "",
        insurance_no: "",
        blood_group: "",
        contact_number: "",
      }));
      return;
    }

    const selectedPatient = option.patient;
    setSelectedPatientOption(option);
    
    // Auto-populate form with patient data
    setFormState(prev => ({
      ...prev,
      patient_id: String(selectedPatient.patient_id),
      name: selectedPatient.name || "",
      year_of_birth: String(selectedPatient.year_of_birth || ""),
      gender: selectedPatient.gender || "",
      region: selectedPatient.region || "",
      district: selectedPatient.district || "",
      sub_district: selectedPatient.sub_district || "",
      national_id: selectedPatient.national_id || "",
      insurance_status: selectedPatient.insurance_status || "",
      insurance_no: selectedPatient.insurance_no || "",
      blood_group: selectedPatient.blood_group || "",
      contact_number: selectedPatient.contact_number || "",
    }));

    console.log("Selected patient:", selectedPatient.name);

    // Trigger dropdown updates
    if (selectedPatient.region) {
      const districts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region).map((c) => c.district).filter(Boolean)));
      setDistrictOptions(["None", ...districts]);
    }
    if (selectedPatient.district) {
      const subdistricts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region && c.district === selectedPatient.district).map((c) => c.subdistrict).filter(Boolean)));
      setSubdistrictOptions(["None", ...subdistricts]);
    }
  };

  const handleTogglePatientMode = (useDropdown: boolean) => {
    setUsePatientDropdown(useDropdown);
    
    // Clear patient selection when switching modes
    if (!useDropdown) {
      setSelectedPatientOption(null);
      // Reset patient fields to allow manual entry
      setFormState(prev => ({
        ...prev,
        patient_id: "-1",
        name: "",
        year_of_birth: "",
        gender: "",
        contact_number: "",
        national_id: "",
        insurance_status: "",
        insurance_no: "",
        blood_group: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to submit a case.",
        variant: "error",
      });
      return;
    }
    // Use the normalization utility to map frontend fields to backend fields
    const payload = normalizeReferralPayload({ ...formState, user_id: user.account_id });
    
    // If we're creating a new case and a patient_id was generated, update the form state
    const needsNewPatientId = !formState.patient_id || 
                             formState.patient_id === "-1" || 
                             formState.patient_id === "0" || 
                             String(formState.patient_id).trim() === "";
    
    if (!formState.case_file_id && needsNewPatientId && payload.patient_id) {
      setFormState((prev) => ({ ...prev, patient_id: payload.patient_id }));
    }
    try {
      if (formState.case_file_id) {
        // Update existing case
        await request({ path: `case-files/${formState.case_file_id}`, method: "PUT", body: payload });
        toast({
          title: "Success",
          description: "Referral updated successfully!",
          variant: "success",
        });
        onCaseCreated();
        handleClear();
      } else {
        // Create new case
        const created = await request({ path: "case-files", method: "POST", body: payload });
        if (created && created.case_file_id) {
          setFormState((prev) => ({ 
            ...prev, 
            case_file_id: created.case_file_id,
            // Update patient_id if it was generated by the backend
            patient_id: created.patient_id || prev.patient_id
          }));
        }
        toast({
          title: "Success",
          description: "Referral submitted successfully!",
          variant: "success",
        });
        onCaseCreated();
        // Optionally, do not clear the form so user can edit the new record
        // handleClear();
      }
    } catch (error) {
      console.error("Failed to submit referral:", error);
      toast({
        title: "Error",
        description: "Failed to submit referral.",
        variant: "error",
      });
    }
  };

  const handleClear = () => {
    const initialFormState = {
      case_file_id: undefined as string | undefined,
      priority_level: "Opened",
      region: "",
      district: "",
      sub_district: "",
      // community removed
      gender: "",
      referral_needed: false,
      insurance_status: "",
      insurance_no: "",
      present_complaints: "",
      examination_findings: "",
      temperature: "",
      weight: "",
      blood_group: "",
      bp: "",
      pulse: "",
      treatment_given: "",
      referral_reason_notes: "",
      referring_officer_name: "",
      referring_officer_position: "",
      medications_given: "",
      medications_on: "",
      referring_facility_name: "",
      national_id: "",
      facility_referred_to: "",
      transportation_means: "",
      other_notes: "",
      name: "",
      year_of_birth: "",
      patient_id: "-1",
      contact_number: "",
    };
    setFormState(initialFormState);
    setShowReferral(false);
    if (onCancel) onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  // Render
  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Emergency Case File</CardTitle>
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <Button type="button" onClick={onNewCase} className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus-square"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
              New Case
            </Button>
          )}
          {!isReadOnly && (
            <>
              <Button type="submit" form="referral-form" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Submit
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form id="referral-form" className="space-y-6" onSubmit={handleSubmit} data-cy="referral-form">
          {/* Priority Level */}
          <div className="space-y-2">
            <FloatingSelect 
              label="Priority Level" 
              value={formState.priority_level} 
              onValueChange={(v) => handleSelectChange("priority_level", v)} 
              disabled={isFormDisabled}
              className={getPriorityColorClass(formState.priority_level)}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p} className={getPriorityColorClass(p)}>{p}</SelectItem>
              ))}
            </FloatingSelect>
          </div>

          {/* Patient Selection - Only show toggle if not in edit mode */}
          {!initialData && (
            <div className="space-y-2">
              <label className="font-semibold">Patient Information</label>
              
              {/* Toggle for patient entry mode */}
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleTogglePatientMode(false)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    !usePatientDropdown
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Enter Details Manually
                </button>
                <button
                  type="button"
                  onClick={() => handleTogglePatientMode(true)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    usePatientDropdown
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Find Existing Patient
                </button>
              </div>

              {/* Patient Dropdown - Only show when toggle is enabled */}
              {usePatientDropdown && (
                <div className="space-y-3">
                  <ReactSelect
                    options={patientOptions}
                    value={selectedPatientOption}
                    onChange={handlePatientSelect}
                    placeholder={isLoadingPatients ? "Loading patients..." : "Search and select a patient..."}
                    isLoading={isLoadingPatients}
                    isSearchable={true}
                    isClearable={true}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    noOptionsMessage={() => "No patients found"}
                    loadingMessage={() => "Loading patients..."}
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        minHeight: '40px',
                        border: state.isFocused ? '2px solid #3b82f6' : '1px solid #d1d5db',
                        boxShadow: state.isFocused ? '0 0 0 0 rgba(59, 130, 246, 0.1)' : 'none',
                        '&:hover': {
                          border: '1px solid #9ca3af'
                        }
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#f3f4f6' : 'white',
                        color: state.isSelected ? 'white' : '#374151',
                        padding: '8px 12px',
                        fontSize: '14px'
                      }),
                      placeholder: (provided) => ({
                        ...provided,
                        color: '#9ca3af'
                      })
                    }}
                  />
                  
                  {selectedPatientOption && (
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800 underline"
                      onClick={() => handlePatientSelect(null)}
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Personal Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
            <div className="space-y-4 pt-2">
              {/* Full Name on its own row */}
              <FloatingInput 
                name="name" 
                label="Full Name" 
                value={formState.name} 
                onChange={handleChange} 
                disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')} 
              />
              
              {/* Other fields on second row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingInput 
                  name="year_of_birth" 
                  label="Year of Birth" 
                  type="text" 
                  mask="year"
                  placeholder="1990"
                  value={formState.year_of_birth} 
                  onChange={handleChange} 
                  disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')} 
                />
                <FloatingSelect 
                  label="Gender" 
                  value={formState.gender} 
                  onValueChange={(v) => handleSelectChange("gender", v)} 
                  disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingInput 
                  name="national_id" 
                  label="National ID" 
                  value={formState.national_id} 
                  onChange={handleChange} 
                  disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')} 
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
            {/* Show fields differently based on whether we're viewing an existing case */}
            {initialData && isFormDisabled ? (
              // Read-only view for existing cases - just display values directly as text
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Region</label>
                  <div className="border p-2 rounded-md bg-gray-50">{formState.region || "—"}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">District</label>
                  <div className="border p-2 rounded-md bg-gray-50">{formState.district || "—"}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Subdistrict</label>
                  <div className="border p-2 rounded-md bg-gray-50">{formState.sub_district || "—"}</div>
                </div>
                {/* Community field removed as it does not exist in the database */}
              </div>
            ) : initialData ? (
              // Edit mode for existing cases - reset to full dropdown controls with cascading
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FloatingSelect 
                  label="Region" 
                  value={formState.region} 
                  onValueChange={(v) => handleSelectChange("region", v)}
                >
                  {regionOptions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect 
                  label="District" 
                  value={formState.district} 
                  onValueChange={(v) => handleSelectChange("district", v)} 
                  disabled={!formState.region}
                >
                  {districtOptions.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect 
                  label="Subdistrict" 
                  value={formState.sub_district} 
                  onValueChange={(v) => handleSelectChange("sub_district", v)} 
                  disabled={!formState.district}
                >
                  {subdistrictOptions.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
                </FloatingSelect>
                {/* Community dropdown removed as it does not exist in the database */}
              </div>
            ) : (
              // New case creation - use normal cascading dropdowns
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <FloatingSelect 
                  label="Region" 
                  value={formState.region} 
                  onValueChange={(v) => handleSelectChange("region", v)} 
                  disabled={isFormDisabled || formState.patient_id !== '-1'}
                >
                  {regionOptions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect 
                  label="District" 
                  value={formState.district} 
                  onValueChange={(v) => handleSelectChange("district", v)} 
                  disabled={isFormDisabled || !formState.region || formState.patient_id !== '-1'}
                >
                  {districtOptions.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect 
                  label="Subdistrict" 
                  value={formState.sub_district} 
                  onValueChange={(v) => handleSelectChange("sub_district", v)} 
                  disabled={isFormDisabled || !formState.district || formState.patient_id !== '-1'}
                >
                  {subdistrictOptions.map((subdistrict) => (
                    <SelectItem key={subdistrict} value={subdistrict}>{subdistrict}</SelectItem>
                  ))}
                </FloatingSelect>
                {/* Community dropdown removed as it does not exist in the database */}
              </div>
            )}
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <FloatingSelect 
                label="Insurance Status" 
                value={formState.insurance_status} 
                onValueChange={(v) => handleSelectChange("insurance_status", v)} 
                disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')}
              >
                {INSURANCE_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </FloatingSelect>
              <FloatingInput 
                name="insurance_no" 
                label="Insurance Number" 
                value={formState.insurance_no} 
                onChange={handleChange} 
                disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')} 
              />
            </div>
          </div>

          {/* Clinical */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Clinical</h3>
            <div className="grid grid-cols-1 gap-4 pt-2">
              <FloatingTextarea 
                name="present_complaints" 
                label="Present Complaints" 
                value={formState.present_complaints} 
                onChange={handleChange} 
                className="min-h-[150px]" 
                disabled={isFormDisabled} 
              />
              <FloatingTextarea 
                name="examination_findings" 
                label="Examination Findings" 
                value={formState.examination_findings} 
                onChange={handleChange} 
                className="min-h-[150px]" 
                disabled={isFormDisabled} 
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <FloatingInput name="bp" label="Blood Pressure (BP)" mask="bp" placeholder="120/80" value={formState.bp} onChange={handleChange} disabled={isFormDisabled} />
              <FloatingInput name="weight" label="Weight (kg)" type="text" mask="weight" placeholder="70" value={formState.weight} onChange={handleChange} disabled={isFormDisabled} />
              <FloatingInput name="temperature" label="Temperature (°C)" type="text" mask="temp" placeholder="37" value={formState.temperature} onChange={handleChange} disabled={isFormDisabled} />
              <FloatingInput name="pulse" label="Pulse" type="text" mask="pulse" placeholder="72" value={formState.pulse} onChange={handleChange} disabled={isFormDisabled} />
              <FloatingSelect 
                label="Blood Group" 
                value={formState.blood_group} 
                onValueChange={(v) => handleSelectChange("blood_group", v)} 
                disabled={isFormDisabled || (usePatientDropdown && formState.patient_id !== '-1')}
              >
                {BLOOD_GROUP_OPTIONS.map((bg) => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </FloatingSelect>
            </div>
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Treatment</h3>
            <div className="grid grid-cols-1 gap-4 pt-2">
              <FloatingTextarea 
                name="treatment_given" 
                label="Treatment Given" 
                value={formState.treatment_given} 
                onChange={handleChange} 
                className="min-h-[120px]" 
                disabled={isFormDisabled} 
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingTextarea 
                  name="medications_given" 
                  label="Medications Given" 
                  value={formState.medications_given} 
                  onChange={handleChange} 
                  className="min-h-[100px]" 
                  disabled={isFormDisabled} 
                />
                <FloatingTextarea 
                  name="medications_on" 
                  label="Medications On" 
                  value={formState.medications_on} 
                  onChange={handleChange} 
                  className="min-h-[100px]" 
                  disabled={isFormDisabled} 
                />
              </div>
            </div>
          </div>

          {/* Referral Needed Toggle */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Referral</h3>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="referral_needed" checked={formState.referral_needed} onCheckedChange={(checked) => {
                setFormState((prev) => ({ ...prev, referral_needed: !!checked }));
                setShowReferral(!!checked);
              }} disabled={isFormDisabled} />
              <label htmlFor="referral_needed" className="text-sm">Referral Needed?</label>
            </div>
            {showReferral && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FloatingInput name="referring_facility_name" label="Referring Facility Name" value={formState.referring_facility_name} onChange={handleChange} disabled={isFormDisabled} />
                  <FloatingInput name="facility_referred_to" label="Facility Referred To" value={formState.facility_referred_to} onChange={handleChange} disabled={isFormDisabled} />
                  <FloatingInput name="referring_officer_name" label="Referring Officer Name" value={formState.referring_officer_name} onChange={handleChange} disabled={isFormDisabled} />
                  <FloatingInput name="referring_officer_position" label="Referring Officer Position" value={formState.referring_officer_position} onChange={handleChange} disabled={isFormDisabled} />
                  <FloatingInput name="transportation_means" label="Means of Transportation" value={formState.transportation_means} onChange={handleChange} disabled={isFormDisabled} />
                </div>
                <FloatingTextarea 
                  name="referral_reason_notes" 
                  label="Referral Reason/Notes" 
                  value={formState.referral_reason_notes} 
                  onChange={handleChange} 
                  className="min-h-[120px]" 
                  disabled={isFormDisabled} 
                />
              </div>
            )}
          </div>

          {/* Other Notes */}
          <div className="space-y-2">
            <FloatingTextarea 
              id="other_notes" 
              name="other_notes" 
              label="Other Notes" 
              value={formState.other_notes} 
              onChange={handleChange} 
              className="min-h-[100px]" 
              disabled={isFormDisabled} 
            />
          </div>

          {/* Bottom Buttons */}
          {!isReadOnly && (
            <div className="flex justify-end gap-2 pt-4 border-t">
               <Button type="submit" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Submit
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                Cancel
              </Button>
              <Button type="button" variant="ghost" onClick={handleClear} className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eraser"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z"/><path d="M22 21H7"/></svg>
                Clear Form
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ReferralForm;
