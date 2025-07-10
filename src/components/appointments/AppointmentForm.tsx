import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, Tab, Switch, FormControlLabel } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Meeting, MeetingStatus, Account, Contact } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';
import { User, Calendar, MapPin, FileText, Copy, RefreshCcw } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess: () => void;
  meeting: Meeting | null;
  onCancel: () => void;
  readOnly?: boolean;
}

const appointmentSchema = z.object({
  title: z.string().optional(),
  patient_source: z.enum(['patient', 'case_file']).optional(),
  patient_id: z.string().optional(),
  patient_name: z.string().optional(),
  practitioner_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.nativeEnum(MeetingStatus).optional(),
  notes_for_attendees: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  meetinglink: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSuccess, meeting, onCancel, readOnly = false }) => {
  const { user } = useAuth();
  const { request } = useApi();
  const { toast } = useToast();
  
  // Debug: Log the current user object to understand the structure
  useEffect(() => {
    console.log('=== USER DEBUG INFO ===');
    console.log('Full user object:', user);
    console.log('user.account_id:', user?.account_id);
    console.log('user type:', typeof user?.account_id);
    console.log('user keys:', user ? Object.keys(user) : 'user is null');
    console.log('======================');
  }, [user]);

  const [patients, setPatients] = useState<Account[]>([]);
  const [caseFiles, setCaseFiles] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const [caseFilesLoaded, setCaseFilesLoaded] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  // Removed patientSearchOpen state, not needed for MUI Autocomplete

  // Generate unique Jitsi meeting URL
  const generateMeetingUrl = () => {
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'garden', 'harbor',
      'island', 'jungle', 'kitten', 'lemon', 'mountain', 'ocean', 'piano', 'quiet',
      'rainbow', 'sunset', 'turtle', 'unicorn', 'valley', 'winter', 'yellow', 'zebra'
    ];
    
    const word1 = words[Math.floor(Math.random() * words.length)];
    const word2 = words[Math.floor(Math.random() * words.length)];
    const numbers = Math.floor(Math.random() * 900) + 100; // 3-digit number 100-999
    
    return `https://meet.jit.si/encompas${word1}${word2}${numbers}`;
  };

  // Copy meeting URL to clipboard
  const copyMeetingUrl = async () => {
    const url = form.getValues('meetinglink');
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        toast({ 
          title: 'Success', 
          description: 'Meeting URL copied to clipboard!', 
          variant: 'success' 
        });
      } catch (error) {
        toast({ 
          title: 'Error', 
          description: 'Failed to copy URL to clipboard.', 
          variant: 'error' 
        });
      }
    }
  };

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
    reValidateMode: 'onSubmit', // Only re-validate on submit
    criteriaMode: 'firstError', // Stop on first error
    shouldFocusError: false, // Don't auto-focus on errors
    defaultValues: {
        title: '',
        patient_source: 'case_file', // default to case files
        patient_id: '',
        patient_name: '',
        practitioner_id: '',
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes_for_attendees: '',
        region: user?.region || '',
        district: user?.district || '',
        meetinglink: '',
    }
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Always fetch practitioners first
        const practitionerRes = await request<Contact[]>({ path: '/contacts', method: 'GET' });
        setPractitioners(practitionerRes || []);
        // Always load patients (no account_id check)
        await fetchPatients();
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        toast({ title: 'Error', description: 'Could not load practitioner data.', variant: 'error' });
      }
    };
    // Only fetch if we have a user
    if (user) {
      fetchDropdownData();
    }
  }, [request, toast, user]);

  // Fetch patients based on user's access level
  // Fetch all patients (no account_id check)
  const fetchPatients = async () => {
    try {
      console.log('Fetching all patients...');
      const patientsRes = await request<any[]>({ path: '/patients', method: 'GET' });
      console.log('Raw patients response:', patientsRes);

      if (!patientsRes || !Array.isArray(patientsRes)) {
        console.warn('Invalid patients response:', patientsRes);
        setPatients([]);
        setPatientsLoaded(true);
        return;
      }

      // Transform the patient data to match our needs
      const transformedPatients = patientsRes.map(patient => ({
        account_id: patient.patient_id?.toString() || patient.id?.toString() || '',
        firstname: patient.name || patient.firstname || 'Unknown',
        lastname: patient.lastname || '',
        region: patient.region || '',
        district: patient.district || '',
        // Keep original data for reference
        patient_id: patient.patient_id || patient.id,
        name: patient.name || `${patient.firstname || ''} ${patient.lastname || ''}`.trim(),
        ...patient
      }));

      console.log('Transformed patients:', transformedPatients);
      setPatients(transformedPatients);
      setPatientsLoaded(true);

      toast({
        title: 'Success',
        description: `Loaded ${transformedPatients.length} patients.`,
        variant: 'success'
      });
    } catch (error) {
      console.error("Failed to fetch patients", error);
      setPatientsLoaded(true); // Mark as loaded even on error to prevent retries
      toast({ title: 'Error', description: 'Could not load patients. Please try the refresh button.', variant: 'error' });
    }
  };

  // Fetch case files
  const fetchCaseFiles = async () => {
    try {
      console.log('Fetching case files...');
      const caseFilesRes = await request<any[]>({ path: '/case-files', method: 'GET' });
      console.log('Raw case files response:', caseFilesRes);
      
      if (!caseFilesRes || !Array.isArray(caseFilesRes)) {
        console.warn('Invalid case files response:', caseFilesRes);
        setCaseFiles([]);
        setCaseFilesLoaded(true);
        return;
      }
      
      setCaseFiles(caseFilesRes);
      setCaseFilesLoaded(true);
      
      toast({ 
        title: 'Success', 
        description: `Loaded ${caseFilesRes.length} case files.`, 
        variant: 'success' 
      });
    } catch (error) {
      console.error("Failed to fetch case files", error);
      setCaseFilesLoaded(true); // Mark as loaded even on error
      toast({ title: 'Error', description: 'Could not load case files. Please try the refresh button.', variant: 'error' });
    }
  };

  // Remove the search effect that was causing issues

  useEffect(() => {
    if (meeting) {
      try {
        const safeReset = {
          title: meeting.title ?? '',
          patient_source: 'patient',
          patient_id: meeting.patient_id !== undefined && meeting.patient_id !== null ? String(meeting.patient_id) : '',
          patient_name: '', // Will be populated from patient data
          practitioner_id: meeting.practitioner_id !== undefined && meeting.practitioner_id !== null ? String(meeting.practitioner_id) : '',
          start_time: meeting.start_time ? new Date(meeting.start_time).toISOString().slice(0, 16) : '',
          end_time: meeting.end_time ? new Date(meeting.end_time).toISOString().slice(0, 16) : '',
          status: meeting.status ?? MeetingStatus.SCHEDULED,
          notes_for_attendees: meeting.notes_for_attendees ?? '',
          region: meeting.region ?? user?.region ?? '',
          district: meeting.district ?? user?.district ?? '',
          meetinglink: meeting.meetinglink ?? '',
        } as AppointmentFormData;
        form.reset(safeReset);
        
        // Find and set patient name for existing meeting
        if (meeting.patient_id) {
          const patient = patients.find(p => p.account_id === String(meeting.patient_id));
          if (patient) {
            const patientData = patient as any;
            const patientName = patientData.name || `${patient.firstname} ${patient.lastname}`.trim();
            form.setValue('patient_name', patientName);
          }
        }
      } catch (error) {
        console.error('Error initializing form with meeting data:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load appointment data. Please try again.', 
          variant: 'error' 
        });
      }
    } else {
      form.reset({
        title: '',
        patient_source: 'case_file', // default to case files
        patient_id: '',
        patient_name: '',
        practitioner_id: '',
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes_for_attendees: '',
        region: user?.region || '',
        district: user?.district || '',
        meetinglink: '',
      });
    }
  }, [meeting, form, user, toast, patients]);

  // Generate meeting URL for new appointments
  useEffect(() => {
    if (!meeting && !form.getValues('meetinglink')) {
      const newUrl = generateMeetingUrl();
      form.setValue('meetinglink', newUrl);
    }
  }, [meeting, form]);

  // Handle patient selection from either source
  const handlePatientSelection = (patientId: string, source: 'patient' | 'case_file') => {
    console.log('handlePatientSelection called:', { patientId, source });
    
    if (source === 'patient') {
      const patient = patients.find(p => p.account_id === patientId);
      console.log('Found patient:', patient);
      if (patient) {
        form.setValue('patient_id', patientId);
        // Use the name field directly from the API
        const patientData = patient as any;
        const patientName = patientData.name || `${patient.firstname} ${patient.lastname}`.trim();
        form.setValue('patient_name', patientName);
        form.setValue('region', patient.region || user?.region || '');
        form.setValue('district', patient.district || user?.district || '');
      }
    } else if (source === 'case_file') {
      const caseFile = caseFiles.find(cf => cf.case_file_id.toString() === patientId);
      if (caseFile) {
        // Use the actual patient_id from the case file, not the case_file_id
        form.setValue('patient_id', String(caseFile.patient_id || ''));
        form.setValue('patient_name', caseFile.name || 'Unknown Patient');
        form.setValue('region', caseFile.region || user?.region || '');
        form.setValue('district', caseFile.district || user?.district || '');
      }
    }
  };

  // Watch patient source to clear patient selection when switching
  const patientSource = form.watch('patient_source');
  useEffect(() => {
    // Clear current selection when switching sources
    form.setValue('patient_id', '');
    form.setValue('patient_name', '');
    form.setValue('region', user?.region || '');
    form.setValue('district', user?.district || '');
    
    // Load data when switching sources if not already loaded
    if (patientSource === 'patient' && !patientsLoaded && user?.account_id) {
      fetchPatients();
    } else if (patientSource === 'case_file' && !caseFilesLoaded) {
      fetchCaseFiles();
    }
  }, [patientSource, form, user, patientsLoaded, caseFilesLoaded]);

  const onSubmit = async (data: AppointmentFormData) => {
    // Recursively remove all undefined, null, and empty string values from an object
    function deepClean(obj: any): any {
      if (Array.isArray(obj)) {
        return obj
          .map(deepClean)
          .filter((v) => v !== undefined && v !== null && v !== '');
      } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, deepClean(v)])
        );
      }
      return obj;
    }
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Comprehensive manual validation since we made schema optional
      if (!data.title || data.title.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please enter a title for the appointment.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.practitioner_id || data.practitioner_id.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please select a practitioner.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.patient_id || data.patient_id.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please select a patient.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.patient_name || data.patient_name.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Patient information is missing. Please reselect the patient.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.start_time || data.start_time.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please select a start time.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.end_time || data.end_time.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please select an end time.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Prepare fields for backend
      // Split start_time into date and time
      const startDateObj = data.start_time ? new Date(data.start_time) : null;
      const date = startDateObj ? startDateObj.toISOString().slice(0, 10) : undefined;
      const time = startDateObj ? startDateObj.toISOString().slice(11, 19) : undefined;

      // Status should be capitalized (Scheduled)
      const status = data.status ?
        (typeof data.status === 'string' ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : 'Scheduled')
        : 'Scheduled';

      // Practitioner fields: save both ID (number) and name (string)
      const practitioner_id = data.practitioner_id ? parseInt(data.practitioner_id, 10) : 0;
      let practitioner = '';
      if (practitioner_id && practitioners.length > 0) {
        const found = practitioners.find(p => String(p.contactid) === String(practitioner_id));
        practitioner = found ? found.name : String(practitioner_id);
      } else if (data.practitioner_id) {
        practitioner = data.practitioner_id;
      }

      // Always include all DB fields, defaulting to empty string for varchar/text fields
      const payload = {
        title: data.title || '',
        patient_id: parseInt(data.patient_id, 10),
        notes_for_attendees: data.notes_for_attendees || '',
        date: date || '',
        time: time || '',
        region: data.region || '',
        district: data.district || '',
        status: status || '',
        practitioner: practitioner || '',
        practitioner_id: practitioner_id || '',
        meetinglink: data.meetinglink || '',
        patient_name: data.patient_name || '',
      };

      // Remove only undefined/null values (not empty string)
      function cleanForBackend(obj: any): any {
        if (Array.isArray(obj)) {
          return obj.map(cleanForBackend).filter((v) => v !== undefined && v !== null);
        } else if (obj && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined && v !== null)
              .map(([k, v]) => [k, cleanForBackend(v)])
          );
        }
        return obj;
      }
      const cleanPayload = cleanForBackend(payload);

      // Debug: Log the payload being sent
      console.log('=== APPOINTMENT PAYLOAD DEBUG ===');
      console.log('Form data:', data);
      console.log('User object:', user);
      console.log('Raw payload:', payload);
      console.log('Clean payload:', cleanPayload);
      console.log('Payload types:', {
        title: typeof cleanPayload.title,
        patient_id: typeof cleanPayload.patient_id,
        practitioner_id: typeof cleanPayload.practitioner_id,
        created_by: typeof cleanPayload.created_by,
        start_time: typeof cleanPayload.start_time,
        end_time: typeof cleanPayload.end_time,
        status: typeof cleanPayload.status
      });
      console.log('================================');

      // Validate required fields and data types
      if (isNaN(cleanPayload.patient_id as number) || !cleanPayload.practitioner) {
        toast({ 
          title: 'Error', 
          description: 'Invalid patient or practitioner selection.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (cleanPayload.created_by && isNaN(cleanPayload.created_by as number)) {
        toast({ 
          title: 'Error', 
          description: 'Invalid user account ID.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Debug: Log the patient/practitioner IDs and payload before validation
      console.log('DEBUG: patient_id:', data.patient_id, 'practitioner_id:', data.practitioner_id, 'patient_source:', data.patient_source);
      console.log('DEBUG: Cleaned payload:', cleanPayload);

      if (meeting) {
        await request({ path: `/meetings/${meeting.meetingid}`, method: 'PUT', body: cleanPayload });
      } else {
        await request({ path: '/meetings', method: 'POST', body: cleanPayload });
      }

      toast({ 
        title: 'Success', 
        description: `Appointment ${meeting ? 'updated' : 'created'} successfully.`, 
        variant: 'success' 
      });
      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'An error occurred while saving the appointment.', 
        variant: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        {/* Buttons at top */}
        <div className="flex justify-between items-center pb-4 border-b">
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab label="Details" value={0} />
            <Tab label="Notes" value={1} />
          </Tabs>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : `${meeting ? 'Update' : 'Create'} Appointment`}
            </Button>
          </div>
        </div>
        
        {tabIndex === 0 && (
          <div className="space-y-6">
            {/* Appointment Details, Participants, Patient, Schedule, Status */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center"><Calendar className="mr-2 h-5 w-5" /> Appointment Details</h3>
              <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="title" render={({ field }) => <FormItem className="col-span-2"><FormLabel>Title</FormLabel><FormControl><Input {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center"><User className="mr-2 h-5 w-5"/> Participants</h3>
              <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="practitioner_id"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Practitioner</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger disabled={readOnly}><SelectValue placeholder="Select a practitioner" /></SelectTrigger>
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
            <div className="space-y-4">
              {/* Patient Source Toggle */}
              <FormField
                control={form.control}
                name="patient_source"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Patient Source</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value === 'patient' ? 'Loading from Patient Table' : 'Loading from Case Files'}
                      </div>
                    </div>
                    <FormControl>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value === 'case_file'}
                            onChange={(e) => field.onChange(e.target.checked ? 'case_file' : 'patient')}
                            color="primary"
                            disabled={true}
                          />
                        }
                        label={field.value === 'case_file' ? 'Case Files' : 'Patients'}
                        labelPlacement="start"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Patient/Case File Selection - Now Full Width */}
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>{form.watch('patient_source') === 'patient' ? 'Select Patient' : 'Select Case File'}</span>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (form.watch('patient_source') === 'patient') {
                            setPatientsLoaded(false);
                            fetchPatients();
                          } else {
                            setCaseFilesLoaded(false);
                            fetchCaseFiles();
                          }
                        }}
                        className="h-6 px-2 text-xs"
                        disabled={isLoading}
                      >
                        <RefreshCcw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </FormLabel>
                    <FormControl>
                      <Autocomplete
                        disablePortal
                        options={form.watch('patient_source') === 'patient' ? patients : caseFiles}
                        getOptionLabel={option => {
                          if (form.watch('patient_source') === 'patient') {
                            const patient = option as any;
                            return patient.name || `${patient.firstname || ''} ${patient.lastname || ''}`.trim() || 'Unknown';
                          } else {
                            const caseFile = option as any;
                            const caseDate = caseFile.date_created ? new Date(caseFile.date_created).toLocaleDateString() : 'No date';
                            return `${caseFile.name || 'Unknown'} (${caseDate})`;
                          }
                        }}
                        isOptionEqualToValue={(option, value) => {
                          if (form.watch('patient_source') === 'patient') {
                            return option.account_id === value.account_id;
                          } else {
                            return String(option.case_file_id) === String(value.case_file_id);
                          }
                        }}
                        value={(() => {
                          if (!field.value) return null;
                          if (form.watch('patient_source') === 'patient') {
                            return patients.find(p => p.account_id === field.value) || null;
                          } else {
                            return caseFiles.find(cf => String(cf.case_file_id) === String(field.value)) || null;
                          }
                        })()}
                        onChange={readOnly ? undefined : ((_, newValue) => {
                          if (!newValue) {
                            field.onChange('');
                            form.setValue('patient_name', '');
                            return;
                          }
                          if (form.watch('patient_source') === 'patient') {
                            field.onChange(newValue.account_id);
                            handlePatientSelection(newValue.account_id, 'patient');
                          } else {
                            field.onChange(String(newValue.case_file_id));
                            handlePatientSelection(String(newValue.case_file_id), 'case_file');
                          }
                        })}
                        renderInput={params => (
                          <TextField 
                            {...params} 
                            label={`Select a ${form.watch('patient_source') === 'patient' ? 'patient' : 'case file'}`} 
                            size="small"
                            placeholder={`Search ${form.watch('patient_source') === 'patient' ? 'patients' : 'case files'}...`}
                            disabled={readOnly}
                          />
                        )}
                        fullWidth
                        sx={{ background: 'white', borderRadius: 1 }}
                        loading={form.watch('patient_source') === 'patient' ? !patientsLoaded : !caseFilesLoaded}
                        loadingText={`Loading ${form.watch('patient_source') === 'patient' ? 'patients' : 'case files'}...`}
                        noOptionsText={`No ${form.watch('patient_source') === 'patient' ? 'patients' : 'case files'} found`}
                        disabled={readOnly}
                      />
                    </FormControl>
                    <FormMessage />
                    {/* Status info */}
                    <div className="text-xs text-gray-500 mt-1">
                      {form.watch('patient_source') === 'patient' ? 
                        (patientsLoaded ? `${patients.length} patients loaded` : 'Loading patients...') : 
                        (caseFilesLoaded ? `${caseFiles.length} case files loaded` : 'Loading case files...')
                      }
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {/* Auto-populated Patient Information */}
            {form.watch('patient_name') && (
              <div className="space-y-2">
                <h4 className="text-md font-medium text-gray-700">Patient Information (Auto-populated)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                  <FormField
                    control={form.control}
                    name="patient_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient Region</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Patient District</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center"><Calendar className="mr-2 h-5 w-5"/> Schedule</h3>
              <Separator />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="start_time" render={({ field }) => <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="datetime-local" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>} />
              <FormField control={form.control} name="end_time" render={({ field }) => <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="datetime-local" {...field} disabled={readOnly} /></FormControl><FormMessage /></FormItem>} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center"><MapPin className="mr-2 h-5 w-5"/> Status</h3>
              <Separator />
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
                        <SelectTrigger disabled={readOnly}><SelectValue placeholder="Select status" /></SelectTrigger>
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
          </div>
        )}
        
        {tabIndex === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center"><FileText className="mr-2 h-5 w-5"/> Notes & Links</h3>
              <Separator />
            </div>
            <FormField
              control={form.control}
              name="notes_for_attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for Attendees</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      value={field.value || ''}
                      onChange={readOnly ? () => {} : field.onChange}
                      style={{ minHeight: 200, background: 'white' }}
                      readOnly={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField 
              control={form.control} 
              name="meetinglink" 
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} disabled className="bg-gray-50" />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyMeetingUrl}
                        className="px-3"
                        disabled={!field.value}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} 
            />
          </div>
        )}
        
        {/* Buttons outside tabs */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || readOnly}>
            {isLoading ? 'Saving...' : `${meeting ? 'Update' : 'Create'} Appointment`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
