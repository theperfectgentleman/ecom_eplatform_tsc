export const PATIENT_SNAPSHOT_TAG_REASONS = [
  { code: 'unreachable', label: 'Unreachable' },
  { code: 'phone_off', label: 'Phone off / no answer' },
  { code: 'travelled', label: 'Travelled temporarily' },
  { code: 'moved', label: 'Moved out of area' },
  { code: 'rebooked', label: 'Rebooked' },
  { code: 'transferred_care', label: 'Transferred care' },
  { code: 'attended_elsewhere', label: 'Attended elsewhere' },
  { code: 'hospitalized', label: 'Hospitalized' },
  { code: 'delivered', label: 'Delivered already' },
  { code: 'declined_follow_up', label: 'Declined follow-up' },
  { code: 'other', label: 'Other' },
] as const;

export type PatientSnapshotTagReasonCode = (typeof PATIENT_SNAPSHOT_TAG_REASONS)[number]['code'];