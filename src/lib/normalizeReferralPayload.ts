// Utility to map frontend referral form fields to backend API fields
export function normalizeReferralPayload(form: any) {
  // Generate a random 7-digit patient_id if it's null, -1, 0, or blank
  const generateRandomPatientId = () => {
    return Math.floor(1000000 + Math.random() * 9000000).toString(); // 7-digit number (1000000 to 9999999)
  };

  // Check if we need to generate a new patient_id for new patients
  // This happens when no existing patient is selected (patient_id is -1, 0, null, or empty)
  const needsNewPatientId = !form.patient_id || 
                           form.patient_id === null || 
                           form.patient_id === "-1" || 
                           form.patient_id === "0" || 
                           form.patient_id === 0 || 
                           String(form.patient_id).trim() === "";

  return {
    case_file_id: form.case_file_id ?? undefined, // include case_file_id for updates
    patient_id: needsNewPatientId ? generateRandomPatientId() : form.patient_id,
    name: form.name ?? null,
    region: form.region ?? null,
    district: form.district ?? null,
    sub_district: form.sub_district ?? null,
    // community removed
    year_of_birth: form.year_of_birth ?? null,
    gender: form.gender ?? null,
    insurance_status: form.insurance_status ?? null,
    insurance_no: form.insurance_no ?? null,
    present_compliants: form.present_complaints ?? null, // backend expects this typo
    examination_findings: form.examination_findings ?? null,
    temperature: form.temperature ?? null,
    weight: form.weight ?? null,
    blood_group: form.blood_group ?? null,
    BP: form.bp ?? null, // backend expects uppercase
    pulse: form.pulse ?? null,
    treatment_given: form.treatment_given ?? null,
    referral_reason_notes: form.referral_reason_notes ?? null,
    referring_officer_name: form.referring_officer_name ?? null,
    referring_officer_position: form.referring_officer_position ?? null,
    priority_level: form.priority_level ?? null,
    medications_given: form.medications_given ?? null,
    medications_on: form.medications_on ?? null,
    referring_facility_name: form.referring_facility_name ?? null,
    national_id: form.national_id ?? null,
    facility_referred_to: form.facility_referred_to ?? null,
    transportation_means: form.transportation_means ?? null,
    user_id: form.user_id ?? null,
    other_notes: form.other_notes ?? null,
    referral_needed: form.referral_needed ?? null,
  };
}
