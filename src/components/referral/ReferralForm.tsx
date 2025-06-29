import React, { useEffect, useState, useRef } from "react";
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

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PRIORITY_OPTIONS = ["Opened", "Urgent", "Closed"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE_STATUS_OPTIONS = ["Insured", "Not Insured", "Unknown"];

const ReferralForm: React.FC<{ initialData?: any; onClear?: () => void; onCaseCreated: () => void }> = ({ initialData, onClear, onCaseCreated }) => {
  const [patients, setPatients] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const [showReferral, setShowReferral] = useState(false);
  const [userId, setUserId] = useState("-1");
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
    user_id: "-1",
  });
  const isInitialMount = useRef(true);

  // Fetch patients and communities on mount
  useEffect(() => {
    request({ path: "api/patients" }).then(setPatients);
    request({ path: "api/communities" }).then((data) => {
      setCommunities(data);
      const regions = Array.from(new Set(data.map((c: any) => String(c.region)).filter(Boolean))) as string[];
      setRegionOptions(["None", ...regions.filter((r: string) => r && r !== "None")]);
    });
  }, [request]);

  // Progressive dropdown logic (same as UserForm)
  useEffect(() => {
    if (isInitialMount.current) return;
    setFormState((s) => ({ ...s, district: "", sub_district: "", community: "" }));
    const districts = Array.from(new Set(communities.filter((c) => c.region === formState.region).map((c) => c.district).filter(Boolean)));
    setDistrictOptions(["None", ...districts]);
    setSubdistrictOptions([]);
    setCommunityOptions([]);
  }, [formState.region, communities]);

  useEffect(() => {
    if (isInitialMount.current) return;
    setFormState((s) => ({ ...s, sub_district: "", community: "" }));
    const subdistricts = Array.from(new Set(communities.filter((c) => c.region === formState.region && c.district === formState.district).map((c) => c.subdistrict).filter(Boolean)));
    setSubdistrictOptions(["None", ...subdistricts]);
    setCommunityOptions([]);
  }, [formState.district, communities, formState.region]);

  useEffect(() => {
    if (isInitialMount.current) return;
    setFormState((s) => ({ ...s, community: "" }));
    const comms = Array.from(new Set(communities.filter((c) => c.region === formState.region && c.district === formState.district && c.subdistrict === formState.sub_district).map((c) => c.community_name).filter(Boolean)));
    setCommunityOptions(["None", ...comms]);
  }, [formState.sub_district, communities, formState.region, formState.district]);

  // Effect to populate form with initialData
  useEffect(() => {
    if (initialData) {
      // This is complex, let's break it down
      const { patient, ...caseData } = initialData;

      // Find the full patient data from the patients state
      const fullPatientData = patients.find(p => p.patient_id === (patient?.patient_id || caseData.patient_id));

      const updatedState = {
        ...formState, // Start with default
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
        present_complaints: fullPatientData?.present_complaints || "",
        examination_findings: fullPatientData?.examination_findings || "",
        temperature: fullPatientData?.temperature?.toString() || "",
        weight: fullPatientData?.weight?.toString() || "",
        blood_group: fullPatientData?.blood_group || "",
        bp: fullPatientData?.bp || "",
        pulse: fullPatientData?.pulse?.toString() || "",
        treatment_given: fullPatientData?.treatment_given || "",
        referral_reason_notes: fullPatientData?.referral_reason_notes || "",
        referring_officer_name: fullPatientData?.referring_officer_name || "",
        referring_officer_position: fullPatientData?.referring_officer_position || "",
        medications_given: fullPatientData?.medications_given || "",
        medications_on: fullPatientData?.medications_on || "",
        referring_facility_name: fullPatientData?.referring_facility_name || "",
        national_id: fullPatientData?.national_id || "",
        facility_referred_to: fullPatientData?.facility_referred_to || "",
        transportation_means: fullPatientData?.transportation_means || "",
        other_notes: fullPatientData?.other_notes || "",
      };

      setFormState(updatedState);

      // Trigger dropdown updates based on populated data
      if (fullPatientData?.region) {
        const districts = Array.from(new Set(communities.filter((c) => c.region === fullPatientData.region).map((c) => c.district).filter(Boolean)));
        setDistrictOptions(["None", ...districts]);
      }
      if (fullPatientData?.district) {
        const subdistricts = Array.from(new Set(communities.filter((c) => c.region === fullPatientData.region && c.district === fullPatientData.district).map((c) => c.subdistrict).filter(Boolean)));
        setSubdistrictOptions(["None", ...subdistricts]);
      }
      if (fullPatientData?.sub_district) {
        const comms = Array.from(new Set(communities.filter((c) => c.region === fullPatientData.region && c.district === fullPatientData.district && c.subdistrict === fullPatientData.sub_district).map((c) => c.community_name).filter(Boolean)));
        setCommunityOptions(["None", ...comms]);
      }

      setShowReferral(updatedState.referral_needed);

      // Mark initial mount as false after the first population
      // Use a timeout to ensure state updates have propagated
      setTimeout(() => {
        isInitialMount.current = false;
      }, 0);

    } else {
      // If no initial data, we are in "create new" mode
      isInitialMount.current = false;
    }
  }, [initialData, communities, patients]);

  const handlePatientChange = (patientId: string) => {
    setUserId(patientId);
    const selectedPatient = patients.find(p => p.patient_id === patientId);
    if (selectedPatient) {
      const updatedState = {
        ...formState,
        patient_id: patientId,
        name: selectedPatient.name,
        year_of_birth: selectedPatient.year_of_birth.toString(),
        gender: selectedPatient.gender,
        region: selectedPatient.region || "",
        district: selectedPatient.district || "",
        sub_district: selectedPatient.sub_district || "",
        community: selectedPatient.community || "",
      };
      setFormState(updatedState);

      // Trigger dropdown updates
      const districts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region).map((c) => c.district).filter(Boolean)));
      setDistrictOptions(["None", ...districts]);
      const subdistricts = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region && c.district === selectedPatient.district).map((c) => c.subdistrict).filter(Boolean)));
      setSubdistrictOptions(["None", ...subdistricts]);
      const comms = Array.from(new Set(communities.filter((c) => c.region === selectedPatient.region && c.district === selectedPatient.district && c.subdistrict === selectedPatient.sub_district).map((c) => c.community_name).filter(Boolean)));
      setCommunityOptions(["None", ...comms]);

    } else {
      // Clear fields if "New Patient" is selected
      setFormState(s => ({ ...s, name: "", year_of_birth: "", gender: "", region: "", district: "", sub_district: "", community: "" }));
      setDistrictOptions([]);
      setSubdistrictOptions([]);
      setCommunityOptions([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formState, user_id: userId };
    try {
      await request({ path: "api/case-files", method: "POST", body: payload });
      alert("Referral submitted successfully!");
      onCaseCreated(); // refetch cases
      handleClear();
    } catch (error) {
      console.error("Failed to submit referral:", error);
      alert("Failed to submit referral.");
    }
  };

  const handleClear = () => {
    setFormState({ ...formState, ...Object.fromEntries(Object.keys(formState).map(k => [k, ""])) });
    setUserId("-1");
    setShowReferral(false);
    if (onClear) onClear();
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
      <CardHeader>
        <CardTitle>Emergency Case File</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Priority Level */}
          <div className="space-y-2">
            <label className="font-semibold">Priority</label>
            <Select value={formState.priority_level} onValueChange={(v) => handleSelectChange("priority_level", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Priority Level" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User/Patient ID */}
          <div className="space-y-2">
            <label className="font-semibold">Patient</label>
            <Select value={formState.patient_id} onValueChange={handlePatientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">New Patient</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.patient_id} value={String(p.patient_id)}>
                    {p.name} ({p.patient_code || p.patient_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personal Info */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input name="name" placeholder="Full Name" value={formState.name} onChange={handleChange} disabled={formState.patient_id !== '-1'} />
              <Input name="year_of_birth" placeholder="Year of Birth" type="number" value={formState.year_of_birth} onChange={handleChange} disabled={formState.patient_id !== '-1'} />
              <Select value={formState.gender} onValueChange={(v) => handleSelectChange("gender", v)} disabled={formState.patient_id !== '-1'}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="national_id" placeholder="National ID" value={formState.national_id} onChange={handleChange} />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Select value={formState.region} onValueChange={(v) => handleSelectChange("region", v)} disabled={formState.patient_id !== '-1'}>
                <SelectTrigger>
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formState.district} onValueChange={(v) => handleSelectChange("district", v)} disabled={!formState.region || formState.patient_id !== '-1'}>
                <SelectTrigger>
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  {districtOptions.map((district) => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formState.sub_district} onValueChange={(v) => handleSelectChange("sub_district", v)} disabled={!formState.district || formState.patient_id !== '-1'}>
                <SelectTrigger>
                  <SelectValue placeholder="Subdistrict" />
                </SelectTrigger>
                <SelectContent>
                  {subdistrictOptions.map((subdistrict) => (
                    <SelectItem key={subdistrict} value={subdistrict}>{subdistrict}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formState.community} onValueChange={(v) => handleSelectChange("community", v)} disabled={!formState.sub_district || formState.patient_id !== '-1'}>
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
          </div>

          {/* Insurance */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Select value={formState.insurance_status} onValueChange={(v) => handleSelectChange("insurance_status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Insurance Status" />
                </SelectTrigger>
                <SelectContent>
                  {INSURANCE_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input name="insurance_no" placeholder="Insurance Number" value={formState.insurance_no} onChange={handleChange} />
            </div>
          </div>

          {/* Clinical */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Clinical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Textarea name="present_complaints" placeholder="Present Complaints" value={formState.present_complaints} onChange={handleChange} className="min-h-[120px]" />
              <Textarea name="examination_findings" placeholder="Examination Findings" value={formState.examination_findings} onChange={handleChange} className="min-h-[120px]" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <Input name="bp" placeholder="Blood Pressure (BP)" value={formState.bp} onChange={handleChange} />
              <Input name="weight" placeholder="Weight (kg)" type="number" value={formState.weight} onChange={handleChange} />
              <Input name="temperature" placeholder="Temperature (°C)" type="number" value={formState.temperature} onChange={handleChange} />
              <Input name="pulse" placeholder="Pulse" type="number" value={formState.pulse} onChange={handleChange} />
              <Select value={formState.blood_group} onValueChange={(v) => handleSelectChange("blood_group", v)}>
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
              <Textarea name="treatment_given" placeholder="Treatment Given" value={formState.treatment_given} onChange={handleChange} className="min-h-[100px]" />
              <Textarea name="medications_given" placeholder="Medications Given" value={formState.medications_given} onChange={handleChange} className="min-h-[100px]" />
              <Textarea name="medications_on" placeholder="Medications On" value={formState.medications_on} onChange={handleChange} className="min-h-[100px]" />
            </div>
          </div>

          {/* Referral Needed Toggle */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Referral</h3>
            <div className="flex items-center gap-2 pt-2">
              <Checkbox id="referral_needed" checked={formState.referral_needed} onCheckedChange={(checked) => {
                setFormState((prev) => ({ ...prev, referral_needed: !!checked }));
                setShowReferral(!!checked);
              }} />
              <label htmlFor="referral_needed" className="text-sm">Referral Needed?</label>
            </div>
            {showReferral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Input name="referring_facility_name" placeholder="Referring Facility Name" value={formState.referring_facility_name} onChange={handleChange} />
                <Input name="facility_referred_to" placeholder="Facility Referred To" value={formState.facility_referred_to} onChange={handleChange} />
                <Input name="referring_officer_name" placeholder="Referring Officer Name" value={formState.referring_officer_name} onChange={handleChange} />
                <Input name="referring_officer_position" placeholder="Referring Officer Position" value={formState.referring_officer_position} onChange={handleChange} />
                <Input name="transportation_means" placeholder="Means of Transportation" value={formState.transportation_means} onChange={handleChange} />
                <Textarea name="referral_reason_notes" placeholder="Referral Reason/Notes" value={formState.referral_reason_notes} onChange={handleChange} className="md:col-span-2" />
              </div>
            )}
          </div>

          {/* Other Notes */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg border-b pb-2">Other Notes</h3>
            <Textarea name="other_notes" placeholder="Any other notes..." value={formState.other_notes} onChange={handleChange} className="min-h-[100px]" />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={handleClear}>Clear Form</Button>
            <Button type="submit">Submit Case</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReferralForm;
