import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/lib/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Patient } from "@/types";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PRIORITY_OPTIONS = ["Opened", "Urgent", "Critical", "Closed"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE_STATUS_OPTIONS = ["Insured", "Not Insured", "Unknown"];

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
  const [patientSearch, setPatientSearch] = useState("");
  const [patientSearchResults, setPatientSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const [showReferral, setShowReferral] = useState(false);
  const { request } = useApi();
  const [formState, setFormState] = useState({
    priority_level: "Opened",
    region: "",
    district: "",
    sub_district: "",
    community: "",
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
  });
  const isInitialMount = React.useRef(true);

  const isFormDisabled = isReadOnly && !!initialData;

  // Debounced search for patients
  useEffect(() => {
    if (patientSearch.trim().length < 3) {
      setPatientSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      if (user?.account_id) {
        setIsSearching(true);
        request<Patient[]>({
          path: `patients/search?search=${patientSearch}`,
        })
          .then((data) => {
            setPatientSearchResults(data);
          })
          .catch((err) => {
            console.error("Failed to search patients", err);
            setPatientSearchResults([]);
          })
          .finally(() => {
            setIsSearching(false);
          });
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [patientSearch, user?.account_id, request]);


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
        setFormState((s) => ({ ...s, district: "", sub_district: "", community: "" }));
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
        setCommunityOptions([]);
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
        setFormState((s) => ({ ...s, sub_district: "", community: "" }));
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
      if (formState.district !== initialData?.district) {
        setCommunityOptions([]);
      }
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
        setFormState((s) => ({ ...s, community: "" }));
      }
      
      // Update community options based on selected region, district and subdistrict
      const comms = Array.from(
        new Set(communities
          .filter((c) => 
            c.region === formState.region && 
            c.district === formState.district && 
            c.subdistrict === formState.sub_district
          )
          .map((c) => c.community_name)
          .filter(Boolean))
      );
      setCommunityOptions(["None", ...comms]);
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
      
      // Load community options based on subdistrict
      if (fullPatientData.region && fullPatientData.district && fullPatientData.sub_district) {
        const comms = Array.from(new Set(
          communities
            .filter(c => 
              c.region === fullPatientData.region && 
              c.district === fullPatientData.district && 
              c.subdistrict === fullPatientData.sub_district
            )
            .map(c => c.community_name)
            .filter(Boolean))
        );
        setCommunityOptions(["None", ...comms]);
        console.log(`LOCATION DEBUG - Communities for subdistrict '${fullPatientData.sub_district}':`, comms);
      }
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
          patient_id: fullPatientData?.patient_id?.toString() || "-1",
          name: fullPatientData?.name || "",
          year_of_birth: fullPatientData?.year_of_birth?.toString() || "",
          gender: fullPatientData?.gender || "",
          region: fullPatientData?.region || "",
          district: fullPatientData?.district || "",
          sub_district: fullPatientData?.sub_district || "",
          community: fullPatientData?.community || "",
          insurance_status: fullPatientData?.insurance_status || "",
          insurance_no: fullPatientData?.insurance_no || "",
          present_complaints: caseData?.present_complaints || fullPatientData?.present_complaints || "",
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
        setPatientSearch(fullPatientData.name ? `${fullPatientData.name} (${fullPatientData.patient_code || fullPatientData.patient_id})` : "");
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

  const handleClearPatientSearch = () => {
    setFormState(s => ({
      ...s,
      patient_id: "-1",
      name: "",
      year_of_birth: "",
      gender: "",
      region: "",
      district: "",
      sub_district: "",
      community: "",
      national_id: "",
      insurance_status: "",
      insurance_no: "",
      blood_group: "",
    }));
    setPatientSearch("");
    setPatientSearchResults([]); // Clear previous results
    setOpen(false);
    setDistrictOptions([]);
    setSubdistrictOptions([]);
    setCommunityOptions([]);
  };

  const handlePatientSelect = (selectedPatient: Patient) => {
    setFormState(prev => ({
      ...prev,
      patient_id: String(selectedPatient.patient_id),
      name: selectedPatient.name,
      year_of_birth: String(selectedPatient.year_of_birth),
      gender: selectedPatient.gender,
      region: selectedPatient.region || "",
      district: selectedPatient.district || "",
      sub_district: selectedPatient.sub_district || "",
      community: selectedPatient.community || "",
      national_id: selectedPatient.national_id || "",
      insurance_status: selectedPatient.insurance_status || "",
      insurance_no: selectedPatient.insurance_no || "",
      blood_group: selectedPatient.blood_group || "",
    }));
    setPatientSearch(`${selectedPatient.name} (${selectedPatient.patient_code || selectedPatient.patient_id})`);
    setOpen(false);

    // Trigger dropdown updates
    if (selectedPatient.region) {
      const districts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region).map((c) => c.district).filter(Boolean)));
      setDistrictOptions(["None", ...districts]);
    }
    if (selectedPatient.district) {
      const subdistricts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region && c.district === selectedPatient.district).map((c) => c.subdistrict).filter(Boolean)));
      setSubdistrictOptions(["None", ...subdistricts]);
    }
    if (selectedPatient.sub_district) {
      const comms = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region && c.district === selectedPatient.district && c.subdistrict === selectedPatient.sub_district).map((c) => c.community_name).filter(Boolean)));
      setCommunityOptions(["None", ...comms]);
    }
  };

  const handleNewPatient = () => {
    handleClearPatientSearch();
    // You might want to focus the 'name' input here later
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit a case.");
      return;
    }
    const payload = { ...formState, user_id: user.account_id };
    try {
      await request({ path: "case-files", method: "POST", body: payload });
      alert("Referral submitted successfully!");
      onCaseCreated();
      handleClear();
    } catch (error) {
      console.error("Failed to submit referral:", error);
      alert("Failed to submit referral.");
    }
  };

  const handleClear = () => {
    const initialFormState = {
      priority_level: "Opened",
      region: "",
      district: "",
      sub_district: "",
      community: "",
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
    };
    setFormState(initialFormState);
    setPatientSearch("");
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
            <label className="font-semibold">Priority</label>
            <Select value={formState.priority_level} onValueChange={(v) => handleSelectChange("priority_level", v)} disabled={isFormDisabled}>
              <SelectTrigger className={getPriorityColorClass(formState.priority_level)}>
                <SelectValue placeholder="Priority Level" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p} className={getPriorityColorClass(p)}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Patient Search */}
          <div className="space-y-2">
            <label className="font-semibold">Patient</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={isFormDisabled}
                >
                  {formState.patient_id !== "-1"
                    ? patientSearch
                    : "Select patient..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                  <CommandInput placeholder="Search patient by name or ID..." onValueChange={setPatientSearch} />
                  <CommandList>
                    {isSearching && <div className="p-4 text-sm">Searching...</div>}
                    <CommandEmpty>No patient found.</CommandEmpty>
                    <CommandGroup>
                       <CommandItem
                        onSelect={handleNewPatient}
                      >
                        + Add New Patient
                      </CommandItem>
                      {patientSearchResults.map((p) => (
                        <CommandItem
                          key={p.patient_id}
                          value={`${p.name} (${p.patient_code || p.patient_id})`}
                          onSelect={() => {
                            handlePatientSelect(p);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formState.patient_id === String(p.patient_id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {p.name} ({p.patient_code || p.patient_id})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Personal Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input name="name" placeholder="Full Name" value={formState.name} onChange={handleChange} disabled={isFormDisabled || formState.patient_id !== '-1'} />
              <Input name="year_of_birth" placeholder="Year of Birth" type="number" value={formState.year_of_birth} onChange={handleChange} disabled={isFormDisabled || formState.patient_id !== '-1'} />
              <Select value={formState.gender} onValueChange={(v) => handleSelectChange("gender", v)} disabled={isFormDisabled || formState.patient_id !== '-1'}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="national_id" placeholder="National ID" value={formState.national_id} onChange={handleChange} disabled={isFormDisabled} />
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
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Community</label>
                  <div className="border p-2 rounded-md bg-gray-50">{formState.community || "—"}</div>
                </div>
              </div>
            ) : initialData ? (
              // Edit mode for existing cases - reset to full dropdown controls with cascading
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Select value={formState.region} onValueChange={(v) => handleSelectChange("region", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.district} onValueChange={(v) => handleSelectChange("district", v)} disabled={!formState.region}>
                  <SelectTrigger>
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.sub_district} onValueChange={(v) => handleSelectChange("sub_district", v)} disabled={!formState.district}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subdistrict" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistrictOptions.map((sub) => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.community} onValueChange={(v) => handleSelectChange("community", v)} disabled={!formState.sub_district}>
                  <SelectTrigger>
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communityOptions.map((comm) => (
                      <SelectItem key={comm} value={comm}>{comm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              // New case creation - use normal cascading dropdowns
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <Select value={formState.region} onValueChange={(v) => handleSelectChange("region", v)} disabled={isFormDisabled || formState.patient_id !== '-1'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.district} onValueChange={(v) => handleSelectChange("district", v)} disabled={isFormDisabled || !formState.region || formState.patient_id !== '-1'}>
                  <SelectTrigger>
                    <SelectValue placeholder="District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((district) => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.sub_district} onValueChange={(v) => handleSelectChange("sub_district", v)} disabled={isFormDisabled || !formState.district || formState.patient_id !== '-1'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subdistrict" />
                  </SelectTrigger>
                  <SelectContent>
                    {subdistrictOptions.map((subdistrict) => (
                      <SelectItem key={subdistrict} value={subdistrict}>{subdistrict}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={formState.community} onValueChange={(v) => handleSelectChange("community", v)} disabled={isFormDisabled || !formState.sub_district || formState.patient_id !== '-1'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communityOptions.map((community) => (
                      <SelectItem key={community} value={community}>{community}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Select value={formState.insurance_status} onValueChange={(v) => handleSelectChange("insurance_status", v)} disabled={isFormDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Insurance Status" />
                </SelectTrigger>
                <SelectContent>
                  {INSURANCE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="insurance_no" placeholder="Insurance Number" value={formState.insurance_no} onChange={handleChange} disabled={isFormDisabled} />
            </div>
          </div>

          {/* Clinical */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Clinical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Textarea name="present_complaints" placeholder="Present Complaints" value={formState.present_complaints} onChange={handleChange} className="min-h-[120px]" disabled={isFormDisabled} />
              <Textarea name="examination_findings" placeholder="Examination Findings" value={formState.examination_findings} onChange={handleChange} className="min-h-[120px]" disabled={isFormDisabled} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <Input name="bp" placeholder="Blood Pressure (BP)" value={formState.bp} onChange={handleChange} disabled={isFormDisabled} />
              <Input name="weight" placeholder="Weight (kg)" type="number" value={formState.weight} onChange={handleChange} disabled={isFormDisabled} />
              <Input name="temperature" placeholder="Temperature (°C)" type="number" value={formState.temperature} onChange={handleChange} disabled={isFormDisabled} />
              <Input name="pulse" placeholder="Pulse" type="number" value={formState.pulse} onChange={handleChange} disabled={isFormDisabled} />
              <Select value={formState.blood_group} onValueChange={(v) => handleSelectChange("blood_group", v)} disabled={isFormDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUP_OPTIONS.map((bg) => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Treatment */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Treatment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Textarea name="treatment_given" placeholder="Treatment Given" value={formState.treatment_given} onChange={handleChange} className="min-h-[100px]" disabled={isFormDisabled} />
              <Textarea name="medications_given" placeholder="Medications Given" value={formState.medications_given} onChange={handleChange} className="min-h-[100px]" disabled={isFormDisabled} />
              <Textarea name="medications_on" placeholder="Medications On" value={formState.medications_on} onChange={handleChange} className="min-h-[100px]" disabled={isFormDisabled} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Input name="referring_facility_name" placeholder="Referring Facility Name" value={formState.referring_facility_name} onChange={handleChange} disabled={isFormDisabled} />
                <Input name="facility_referred_to" placeholder="Facility Referred To" value={formState.facility_referred_to} onChange={handleChange} disabled={isFormDisabled} />
                <Input name="referring_officer_name" placeholder="Referring Officer Name" value={formState.referring_officer_name} onChange={handleChange} disabled={isFormDisabled} />
                <Input name="referring_officer_position" placeholder="Referring Officer Position" value={formState.referring_officer_position} onChange={handleChange} disabled={isFormDisabled} />
                <Input name="transportation_means" placeholder="Means of Transportation" value={formState.transportation_means} onChange={handleChange} disabled={isFormDisabled} />
                <Textarea name="referral_reason_notes" placeholder="Referral Reason/Notes" value={formState.referral_reason_notes} onChange={handleChange} className="md:col-span-2" disabled={isFormDisabled} />
              </div>
            )}
          </div>

          {/* Other Notes */}
          <div className="space-y-2">
            <label htmlFor="other_notes" className="font-semibold">Other Notes</label>
            <Textarea id="other_notes" name="other_notes" value={formState.other_notes} onChange={handleChange} disabled={isFormDisabled} />
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
