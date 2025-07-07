import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Meeting, MeetingStatus, Account, Contact } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, MapPin, FileText } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess: () => void;
  meeting: Meeting | null;
  onCancel: () => void;
}

const appointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  patient_id: z.string().min(1, "Patient is required"),
  practitioner_id: z.string().min(1, "Practitioner is required"),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  status: z.nativeEnum(MeetingStatus),
  notes: z.string().optional(),
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  google_meet_link: z.string().url().optional().or(z.literal('')),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, meeting, onCancel }) => {
  const { user } = useAuth();
  const { request } = useApi();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Account[]>([]);
  const [practitioners, setPractitioners] = useState<Contact[]>([]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
        title: '',
        patient_id: undefined,
        practitioner_id: undefined,
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes: '',
        region: user?.region || '',
        district: user?.district || '',
        google_meet_link: '',
    }
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const patientRes = await request<Account[]>({ path: '/accounts?user_type=patient', method: 'GET' });
        const practitionerRes = await request<Contact[]>({ path: '/contacts', method: 'GET' });
        setPatients(patientRes);
        setPractitioners(practitionerRes);
      } catch (error) {
        console.error("Failed to fetch patients or practitioners", error);
        toast({ title: 'Error', description: 'Could not load patient or practitioner data.', variant: 'error' });
      }
    };
    fetchDropdownData();
  }, [request, toast]);

  useEffect(() => {
    if (meeting) {
      form.reset({
        ...meeting,
        patient_id: String(meeting.patient_id),
        practitioner_id: String(meeting.practitioner_id),
        start_time: new Date(meeting.start_time).toISOString().slice(0, 16),
        end_time: new Date(meeting.end_time).toISOString().slice(0, 16),
      });
    } else {
      form.reset({
        title: '',
        patient_id: undefined,
        practitioner_id: undefined,
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes: '',
        region: user?.region || '',
        district: user?.district || '',
        google_meet_link: '',
      });
    }
  }, [meeting, form, user]);

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      const payload = {
        ...data,
        patient_id: parseInt(data.patient_id, 10),
        practitioner_id: parseInt(data.practitioner_id, 10),
        created_by: user?.account_id,
        start_time: new Date(data.start_time).toISOString(),
        end_time: new Date(data.end_time).toISOString(),
      };

      if (meeting) {
        await request({ path: `/meetings/${meeting.meeting_id}`, method: 'PUT', body: payload });
      } else {
        await request({ path: '/meetings', method: 'POST', body: payload });
      }

      toast({ title: 'Success', description: `Appointment ${meeting ? 'updated' : 'created'} successfully.`, variant: 'success' });
      onSuccess();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'An error occurred', variant: 'error' });
    }
  };

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center"><Calendar className="mr-2 h-5 w-5" /> Appointment Details</h3>
                <Separator />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => <FormItem className="col-span-2"><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center"><User className="mr-2 h-5 w-5"/> Participants</h3>
                <Separator />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {patients.map(p => <SelectItem key={p.account_id} value={String(p.account_id)}>{`${p.firstname} ${p.lastname}`}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="practitioner_id"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Practitioner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a practitioner" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {practitioners.map(p => <SelectItem key={p.contactid} value={String(p.contactid)}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="start_time" render={({ field }) => <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="end_time" render={({ field }) => <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center"><MapPin className="mr-2 h-5 w-5"/> Location & Status</h3>
                <Separator />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="region" render={({ field }) => <FormItem><FormLabel>Region</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="district" render={({ field }) => <FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {Object.values(MeetingStatus).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium flex items-center"><FileText className="mr-2 h-5 w-5"/> Notes & Links</h3>
                <Separator />
            </div>

            <FormField control={form.control} name="notes" render={({ field }) => <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>} />
            <FormField control={form.control} name="google_meet_link" render={({ field }) => <FormItem><FormLabel>Google Meet Link</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>} />

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{meeting ? 'Update' : 'Create'} Appointment</Button>
            </div>
          </form>
        </Form>
  );
};

export default AppointmentForm;
