import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const PRIORITY_OPTIONS = ["Opened", "Urgent", "Closed"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const INSURANCE_STATUS_OPTIONS = ["Insured", "Not Insured", "Unknown"];

const ReferralForm: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);
  const [showReferral, setShowReferral] = useState(false);
  const [userId, setUserId] = useState("-1");
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
    apiRequest({ path: "api/patients" }).then(setPatients);
    apiRequest({ path: "api/communities" }).then((data) => {
      setCommunities(data);
      const regions = Array.from(new Set(data.map((c: any) => String(c.region)).filter(Boolean))) as string[];
      setRegionOptions(["None", ...regions.filter((r: string) => r && r !== "None")]);
    });
  }, []);

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

  useEffect(() => {
    if (communities.length > 0) {
      const timer = setTimeout(() => {
        isInitialMount.current = false;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [communities]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "referral_needed") setShowReferral(checked);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepare payload
    const payload = {
      ...formState,
      patient_id: userId !== "-1" ? Number(userId) : undefined,
      user_id: userId !== "-1" ? Number(userId) : undefined,
      sub_district: formState.sub_district || formState.sub_district || "",
      region: formState.region,
      district: formState.district,
      community: formState.community,
      referral_needed: !!formState.referral_needed,
      year_of_birth: formState.year_of_birth ? Number(formState.year_of_birth) : undefined,
      temperature: formState.temperature ? Number(formState.temperature) : undefined,
      weight: formState.weight ? Number(formState.weight) : undefined,
      pulse: formState.pulse ? Number(formState.pulse) : undefined,
    };
    try {
      await apiRequest({ path: "api/case-files", method: "POST", body: payload });
      alert("Case file submitted successfully!");
    } catch (err) {
      alert("Submission failed. Please check your input and try again.");
    }
  };

  // Render
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Case File</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Priority Level */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Priority</h3>
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Patient</h3>
            <Select value={userId} onValueChange={(v) => { setUserId(v); setFormState((prev) => ({ ...prev, patient_id: v, user_id: v })); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Patient" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">None</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.patient_id} value={String(p.patient_id)}>
                    {p.name} ({p.patient_code || p.patient_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input name="name" placeholder="Full Name" value={formState.name} onChange={handleChange} />
              <Input name="year_of_birth" placeholder="Year of Birth" type="number" value={formState.year_of_birth} onChange={handleChange} />
              <Select value={formState.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {subdistrictOptions.map((subdistrict) => (
                    <SelectItem key={subdistrict} value={subdistrict}>{subdistrict}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={formState.community} onValueChange={(v) => handleSelectChange("community", v)} disabled={!formState.sub_district}>
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Insurance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Clinical</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <h3 className="font-semibold text-lg mb-2">Treatment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea name="treatment_given" placeholder="Treatment Given" value={formState.treatment_given} onChange={handleChange} className="min-h-[100px]" />
              <Textarea name="medications_given" placeholder="Medications Given" value={formState.medications_given} onChange={handleChange} className="min-h-[100px]" />
              <Textarea name="medications_on" placeholder="Medications On" value={formState.medications_on} onChange={handleChange} className="min-h-[100px]" />
            </div>
          </div>

          {/* Referral Needed Toggle */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Referral</h3>
            <div className="flex items-center gap-2 mb-2">
              <Checkbox id="referral_needed" checked={formState.referral_needed} onCheckedChange={(checked) => {
                setFormState((prev) => ({ ...prev, referral_needed: !!checked }));
                setShowReferral(!!checked);
              }} />
              <label htmlFor="referral_needed" className="text-sm">Referral Needed?</label>
            </div>
            {showReferral && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <Input name="referring_facility_name" placeholder="Referring Facility Name" value={formState.referring_facility_name} onChange={handleChange} />
                <Input name="referring_officer_name" placeholder="Referring Officer Name" value={formState.referring_officer_name} onChange={handleChange} />
                <Input name="referring_officer_position" placeholder="Referring Officer Position" value={formState.referring_officer_position} onChange={handleChange} />
                <Textarea name="referral_reason_notes" placeholder="Referral Reason & Notes" value={formState.referral_reason_notes} onChange={handleChange} />
                <Input name="facility_referred_to" placeholder="Facility Referred To" value={formState.facility_referred_to} onChange={handleChange} />
                <Input name="transportation_means" placeholder="Means of Transportation" value={formState.transportation_means} onChange={handleChange} />
              </div>
            )}
          </div>

          {/* Other Notes */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Other Notes</h3>
            <Textarea name="other_notes" placeholder="Other Notes" value={formState.other_notes} onChange={handleChange} />
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => setFormState({ ...formState, ...Object.fromEntries(Object.keys(formState).map(k => [k, ""])) })}>Clear</Button>
            <Button type="button" variant="secondary">Save Draft</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReferralForm;
