import React, { useEffect, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, Tab } from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Meeting, MeetingStatus, Contact } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { Copy, RefreshCcw } from 'lucide-react';

interface AppointmentFormProps {
  onSuccess: () => void;
  meeting: Meeting | null;
  onCancel: () => void;
  readOnly?: boolean;
}

const appointmentSchema = z.object({
  title: z.string().optional(),
  case_file_id: z.string().optional(), // Primary field for case file selection
  patient_id: z.string().optional(), // Kept for backward compatibility, but not used in new submissions
  patient_name: z.string().optional(),
  practitioner_id: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.nativeEnum(MeetingStatus).optional(),
  notes_for_attendees: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  meetinglink: z.string().optional(),
  appointment_date: z.string().optional(),
  appointment_time: z.string().optional(),
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

  const [caseFiles, setCaseFiles] = useState<any[]>([]);
  const [practitioners, setPractitioners] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
        case_file_id: '',
        patient_id: '',
        patient_name: '',
        practitioner_id: '',
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes_for_attendees: '',
        region: '',
        district: '',
        meetinglink: '',
    }
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch practitioners and case files
        const practitionerRes = await request<Contact[]>({ path: '/contacts', method: 'GET' });
        setPractitioners(practitionerRes || []);
        await fetchCaseFiles();
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

  // Fetch case files
  const fetchCaseFiles = async () => {
    try {
      console.log('Fetching case files...');
      const caseFilesRes = await request<any[]>({ path: '/case-files', method: 'GET' });
      console.log('Raw case files response:', caseFilesRes);
      console.log('Number of case files:', caseFilesRes?.length || 0);
      console.log('Sample case file:', caseFilesRes?.[0]);
      
      if (!caseFilesRes || !Array.isArray(caseFilesRes)) {
        console.warn('Invalid case files response:', caseFilesRes);
        setCaseFiles([]);
        return;
      }
      
      // Log the structure of the first case file to understand the data
      if (caseFilesRes.length > 0) {
        console.log('Case file fields available:', Object.keys(caseFilesRes[0]));
      }
      
      setCaseFiles(caseFilesRes);
    } catch (error) {
      console.error("Failed to fetch case files", error);
      toast({ title: 'Error', description: 'Could not load case files. Please try the refresh button.', variant: 'error' });
    }
  };

  // Remove the search effect that was causing issues

  useEffect(() => {
    if (meeting) {
      try {
        const startDate = meeting.date ? new Date(meeting.date) : null;
        const timeParts = meeting.time ? meeting.time.split(':') : [];
        
        if(startDate && timeParts.length >= 2) {
          startDate.setHours(parseInt(timeParts[0], 10));
          startDate.setMinutes(parseInt(timeParts[1], 10));
        }

        const statusValue = (meeting.status?.toLowerCase() as MeetingStatus) || MeetingStatus.SCHEDULED;

        const safeReset = {
          title: meeting.title ?? '',
          case_file_id: meeting.case_file_id !== undefined && meeting.case_file_id !== null ? String(meeting.case_file_id) : '',
          patient_id: meeting.patient_id !== undefined && meeting.patient_id !== null ? String(meeting.patient_id) : '',
          patient_name: meeting.patient_name ?? '',
          practitioner_id: meeting.practitioner_id !== undefined && meeting.practitioner_id !== null ? String(meeting.practitioner_id) : '',
          appointment_date: meeting.date ? meeting.date.slice(0,10) : '',
          appointment_time: meeting.time ? meeting.time.slice(0,5) : '',
          status: statusValue,
          notes_for_attendees: meeting.notes_for_attendees ?? '',
          region: meeting.region ?? '',
          district: meeting.district ?? '',
          meetinglink: meeting.meetinglink ?? '',
        } as AppointmentFormData;
        form.reset(safeReset);
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
        case_file_id: '',
        patient_id: '',
        patient_name: '',
        practitioner_id: '',
        start_time: '',
        end_time: '',
        status: MeetingStatus.SCHEDULED,
        notes_for_attendees: '',
        region: '',
        district: '',
        meetinglink: '',
      });
    }
  }, [meeting, form, user, toast]);

  // Generate meeting URL for new appointments
  useEffect(() => {
    if (!meeting && !form.getValues('meetinglink')) {
      const newUrl = generateMeetingUrl();
      form.setValue('meetinglink', newUrl);
    }
  }, [meeting, form]);

  // Automatically sync end_time with start_time
  const watchedStartTime = form.watch('start_time');
  useEffect(() => {
    if (watchedStartTime) {
      form.setValue('end_time', watchedStartTime);
    }
  }, [watchedStartTime, form]);

  // Handle case file selection
  const handleCaseFileSelection = (caseFileId: string) => {
    console.log('handleCaseFileSelection called:', { caseFileId });
    
    const caseFile = caseFiles.find(cf => cf.case_file_id.toString() === caseFileId);
    console.log('Found case file:', caseFile);
    
    if (caseFile) {
      console.log('Case file fields:', Object.keys(caseFile));
      // Set the case_file_id for dropdown matching
      form.setValue('case_file_id', caseFileId);
      // Use the actual patient_id from the case file, not the case_file_id
      form.setValue('patient_id', String(caseFile.patient_id || ''));
      form.setValue('patient_name', caseFile.name || 'Unknown Patient');
      form.setValue('region', caseFile.region || '');
      form.setValue('district', caseFile.district || '');
      
      console.log('Set form values:', {
        case_file_id: caseFileId,
        patient_id: caseFile.patient_id,
        patient_name: caseFile.name,
        region: caseFile.region,
        district: caseFile.district
      });
    }
  };

  const onSubmit = async (data: AppointmentFormData) => {
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

      if (!data.practitioner_id || data.practitioner_id.trim() === '' || isNaN(parseInt(data.practitioner_id, 10)) || parseInt(data.practitioner_id, 10) <= 0) {
        toast({ 
          title: 'Error', 
          description: 'Please select a valid practitioner.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.case_file_id || data.case_file_id.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Please select a valid case file.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.patient_name || data.patient_name.trim() === '') {
        toast({ 
          title: 'Error', 
          description: 'Patient information is missing. Please reselect the case file.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      if (!data.appointment_date || !data.appointment_time) {
        toast({ 
          title: 'Error', 
          description: 'Please select a date and time.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Prepare fields for backend
      const date = data.appointment_date;
      const time = data.appointment_time;

      const selectedCaseFile = caseFiles.find(cf => cf.case_file_id.toString() === data.case_file_id);

      if (!selectedCaseFile) {
        toast({ 
          title: 'Error', 
          description: 'Could not find the selected case file. Please select it again.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Status should be capitalized (Scheduled)
      const status = data.status ?
        (typeof data.status === 'string' ? (data.status.charAt(0).toUpperCase() + data.status.slice(1).toLowerCase()) : 'Scheduled')
        : 'Scheduled';

      // Practitioner fields: save both ID (number) and name (string)
      const practitioner_id = data.practitioner_id ? parseInt(data.practitioner_id, 10) : 0;
      let practitioner = '';
      if (practitioner_id && practitioner_id > 0 && practitioners.length > 0) {
        const found = practitioners.find(p => String(p.contactid || p.ContactID) === String(practitioner_id));
        practitioner = found ? (found.name || found.Name || '') : '';
      }

      // Validate practitioner_id before payload construction
      if (!practitioner_id || practitioner_id <= 0) {
        toast({ 
          title: 'Error', 
          description: 'Please select a valid practitioner.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Always include all DB fields, defaulting to empty string for varchar/text fields and proper defaults for other types
      const payload = {
        title: data.title || '',
        case_file_id: data.case_file_id || '', // Keep as string, don't parse as int
        patient_id: selectedCaseFile?.patient_id || 0, // Add patient_id from the selected case
        notes_for_attendees: data.notes_for_attendees || '',
        date: date || '',
        time: time || '',
        region: data.region || '',
        district: data.district || '',
        status: status || 'Scheduled',
        practitioner: practitioner || '',
        practitioner_id: practitioner_id, // This will be a valid number > 0
        meetinglink: data.meetinglink || '',
        patient_name: data.patient_name || '',
        // Add created_by from user context
        created_by: user?.user_id || 0, // Use user's user_id as created_by
      };

      // Clean payload to remove only undefined/null values (keep empty strings)
      function cleanForBackend(obj: any): any {
        if (Array.isArray(obj)) {
          return obj.map(cleanForBackend).filter((v) => v !== undefined && v !== null);
        } else if (obj && typeof obj === 'object') {
          const cleaned: any = {};
          for (const [key, value] of Object.entries(obj)) {
            if (value !== undefined && value !== null) {
              cleaned[key] = cleanForBackend(value);
            }
          }
          return cleaned;
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
        case_file_id: typeof cleanPayload.case_file_id,
        practitioner_id: typeof cleanPayload.practitioner_id,
        created_by: typeof cleanPayload.created_by,
        start_time: typeof cleanPayload.start_time,
        end_time: typeof cleanPayload.end_time,
        status: typeof cleanPayload.status
      });
      console.log('Form practitioners array:', practitioners);
      console.log('Selected practitioner from form:', data.practitioner_id);
      console.log('Found practitioner:', practitioners.find(p => String(p.contactid || p.ContactID) === String(data.practitioner_id)));
      console.log('================================');

      // Validate required fields and data types
      // Check if case_file_id is valid (must be a non-empty string)
      if (!cleanPayload.case_file_id || cleanPayload.case_file_id.trim() === '') {
        console.log('Invalid case_file_id:', cleanPayload.case_file_id);
        toast({ 
          title: 'Error', 
          description: 'Invalid case file selection. Please select a valid case file.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Check if practitioner_id is a valid number (must be > 0, 0 is NOT valid per database schema)
      if (cleanPayload.practitioner_id === null || cleanPayload.practitioner_id === undefined || isNaN(cleanPayload.practitioner_id as number) || cleanPayload.practitioner_id <= 0) {
        console.log('Invalid practitioner_id:', cleanPayload.practitioner_id);
        toast({ 
          title: 'Error', 
          description: 'Invalid practitioner selection. Please select a valid practitioner.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Validate created_by is a valid number (must be > 0)
      if (!cleanPayload.created_by || isNaN(cleanPayload.created_by as number) || cleanPayload.created_by <= 0) {
        console.log('Invalid created_by:', cleanPayload.created_by);
        toast({ 
          title: 'Error', 
          description: 'User authentication error. Please log in again.', 
          variant: 'error' 
        });
        setIsLoading(false);
        return;
      }

      // Debug: Log the case_file_id/practitioner IDs and payload before validation
      console.log('DEBUG: case_file_id:', data.case_file_id, 'practitioner_id:', data.practitioner_id);
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
        {/* Buttons at top (no edit button here) */}
        <div className="flex justify-between items-center pb-4 border-b">
          <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}>
            <Tab label="Details" value={0} />
            <Tab label="Notes" value={1} />
          </Tabs>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            {/* Removed edit button from the form. Only submit button remains. */}
            <Button type="submit" disabled={isLoading || readOnly}>
              {isLoading ? 'Saving...' : `${meeting ? 'Update' : 'Create'} Appointment`}
            </Button>
          </div>
        </div>
        {/* ...existing code... */}
        {tabIndex === 0 && (
          <div className="space-y-6">
            {/* Appointment Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Appointment Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter appointment title" {...field} disabled={readOnly} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Case File Selection */}
            <div className="space-y-4">
              <FormLabel>Case File Selection</FormLabel>
              <Autocomplete
                options={caseFiles}
                getOptionLabel={(option) => {
                  // Format: "Case ID - Patient Name (Date)"
                  const caseId = option.case_file_id || 'Unknown ID';
                  const patientName = option.name || 'Unknown Patient';
                  const dateCreated = option.date_created ? new Date(option.date_created).toLocaleDateString() : '';
                  
                  return `Case ${caseId} - ${patientName}${dateCreated ? ` (${dateCreated})` : ''}`;
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <div className="flex flex-col w-full">
                      <div className="font-medium text-gray-900">
                        Case {option.case_file_id || 'Unknown ID'}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>Patient: {option.name || 'Unknown'}</span>
                        {option.date_created && (
                          <span className="text-xs text-gray-500">
                            • {new Date(option.date_created).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {option.priority_level && (
                        <div className="text-xs text-gray-500">
                          Priority: {option.priority_level}
                        </div>
                      )}
                    </div>
                  </li>
                )}
                value={caseFiles.find(cf => cf.case_file_id.toString() === form.watch('case_file_id')) || null}
                onChange={(_, newValue) => {
                  if (newValue) {
                    handleCaseFileSelection(newValue.case_file_id.toString());
                  }
                }}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Select Case File" 
                    variant="outlined" 
                    size="small" 
                    disabled={readOnly}
                    helperText="Cases are displayed as: Case ID - Patient Name (Date Created)"
                  />
                )}
                disabled={readOnly}
              />
              
              {/* Region and District - Read-only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Region" 
                          disabled={true}
                          className="bg-gray-50"
                        />
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
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="District" 
                          disabled={true}
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Practitioner Selection */}
            <FormField
              control={form.control}
              name="practitioner_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Practitioner</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={practitioners}
                      getOptionLabel={(option) => (option.name || option.Name) || 'Unknown Practitioner'}
                      value={practitioners.find(p => (p.contactid || p.ContactID)?.toString() === field.value) || null}
                      onChange={(_, newValue) => {
                        field.onChange((newValue?.contactid || newValue?.ContactID)?.toString() || '');
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Select Practitioner" 
                          variant="outlined" 
                          size="small" 
                          disabled={readOnly}
                        />
                      )}
                      disabled={readOnly}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointment_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={readOnly}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MeetingStatus.SCHEDULED}>Scheduled</SelectItem>
                        <SelectItem value={MeetingStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={MeetingStatus.CANCELLED}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Meeting Link */}
            <FormField
              control={form.control}
              name="meetinglink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Link</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Meeting URL" 
                        {...field} 
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => field.onChange(generateMeetingUrl())}
                        disabled={readOnly}
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={copyMeetingUrl}
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
        {tabIndex === 1 && (
          <div className="space-y-6">
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes_for_attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes for Attendees</FormLabel>
                  <FormControl>
                    <ReactQuill
                      value={field.value || ''}
                      onChange={field.onChange}
                      readOnly={readOnly}
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          ['link'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        {/* Buttons outside tabs (no edit button here) */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          {/* Removed edit button from the form. Only submit button remains. */}
          <Button type="submit" disabled={isLoading || readOnly}>
            {isLoading ? 'Saving...' : `${meeting ? 'Update' : 'Create'} Appointment`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AppointmentForm;
