import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientSummary } from '@/types';
import { PATIENT_SNAPSHOT_TAG_REASONS, type PatientSnapshotTagReasonCode } from '@/constants/patientSnapshotTags';

interface PatientSnapshotTagDialogProps {
  open: boolean;
  patient: PatientSummary | null;
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: { reason_code: PatientSnapshotTagReasonCode; note?: string }) => Promise<void>;
}

const PatientSnapshotTagDialog: React.FC<PatientSnapshotTagDialogProps> = ({
  open,
  patient,
  saving,
  onOpenChange,
  onSave,
}) => {
  const [reasonCode, setReasonCode] = useState<PatientSnapshotTagReasonCode | ''>('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setReasonCode('');
      setNote('');
    }
  }, [open]);

  const handleSave = async () => {
    if (!reasonCode) {
      return;
    }

    await onSave({
      reason_code: reasonCode,
      note: note.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Tag Missed Appointment</DialogTitle>
          <DialogDescription>
            Mark this missed ANC appointment so it does not keep appearing in the active overdue queue.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-700">
            <div className="font-medium text-slate-900">{patient?.name || 'Patient'}</div>
            <div>
              Scheduled visit: {patient?.next_appointment_date ? new Date(patient.next_appointment_date).toLocaleDateString() : 'Unknown'}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snapshot-tag-reason">Reason</Label>
            <Select value={reasonCode} onValueChange={(value) => setReasonCode(value as PatientSnapshotTagReasonCode)}>
              <SelectTrigger id="snapshot-tag-reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {PATIENT_SNAPSHOT_TAG_REASONS.map((reason) => (
                  <SelectItem key={reason.code} value={reason.code}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="snapshot-tag-note">Comment</Label>
            <Textarea
              id="snapshot-tag-note"
              placeholder="Optional note for the next person reviewing this patient"
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!reasonCode || saving}>
            {saving ? 'Saving...' : 'Save Tag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientSnapshotTagDialog;