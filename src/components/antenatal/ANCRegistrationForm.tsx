import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AntenatalRegistration, Patient } from '@/types';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Baby, 
  FileText,
  Heart,
  Droplets,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Function to generate a simple UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ancRegistrationSchema = z.object({
  registrationDate: z.string().min(1, 'Registration date is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  antenatalStatus: z.string().optional(),
  parity: z.number().min(0).optional(),
  gravida: z.number().min(0).optional(),
  gravidaParityComment: z.string().optional(),
  gestationWeeks: z.number().min(0).max(42).optional(),
  estimatedDeliveryDate: z.string().optional(),
  bloodPressure: z.string().optional(),
  weight: z.string().optional(),
  height: z.string().optional(), // Added height
  hemoglobinAtRegistration: z.number().min(0).max(20).optional(),
  bloodGroupAbo: z.string().optional(),
  rhesusStatus: z.string().optional(),
  sicklingStatus: z.string().optional(),
  syphilisScreeningStatus: z.string().optional(),
  syphilisTreatment: z.boolean().optional(),
  hivStatusAtRegistration: z.string().optional(),
  hivRetestedAt34Weeks: z.string().optional(),
  arvTreatment: z.boolean().optional(),
  screenedForTb: z.boolean().optional(),
  tbDiagnosed: z.boolean().optional(),
  tbTreatmentStarted: z.boolean().optional(),
  itnGiven: z.boolean().optional(),
  itnType: z.string().optional(),
  folicAcidIronSupplements: z.string().optional(),
});

type ANCRegistrationFormData = z.infer<typeof ancRegistrationSchema>;

interface ANCRegistrationFormProps {
  patient: Patient;
  initialData?: Partial<AntenatalRegistration>;
  onSuccess: (registration: AntenatalRegistration) => void;
  readOnly?: boolean;
}

// Section Header Component
interface SectionHeaderProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  statusIndicator?: React.ReactNode;
}

const SectionHeader = ({ title, icon: Icon, statusIndicator }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 pb-3 border-b border-gray-200 mb-4">
    <Icon className="h-5 w-5 text-blue-600" />
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    {statusIndicator && (
      <div className="ml-auto">{statusIndicator}</div>
    )}
  </div>
);

// Utility function to generate registration number
const generateAntenatalRegistrationNumber = (patientId: string): string => {
  // Characters allowed (excluding O, I, L)
  const allowedChars = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  // Numbers allowed (excluding 0)
  const allowedNumbers = '123456789';
  
  // Generate random character
  const getRandomChar = () => allowedChars[Math.floor(Math.random() * allowedChars.length)];
  // Generate random number
  const getRandomNumber = () => allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
  
  // Format: Patient_id-[C][N][C]
  const char1 = getRandomChar();
  const number = getRandomNumber();
  const char2 = getRandomChar();
  
  const regNumber = `${patientId}-${char1}${number}${char2}`;
  console.log('Generated ANC registration number:', regNumber);
  return regNumber;
};

// Helper function to format date for input
const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return '';
  }
};

const ANCRegistrationForm = ({ patient, initialData, onSuccess, readOnly = false }: ANCRegistrationFormProps) => {
  const { toast } = useToast();
  const { request } = useApi();
  const [isLoading, setIsLoading] = useState(false);

  // Determine if form should be disabled
  const isFormDisabled = readOnly;

  // Utility function to format date for display
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      };
      return date.toLocaleDateString('en-GB', options);
    } catch {
      return '';
    }
  };

  const form = useForm<ANCRegistrationFormData>({
    resolver: zodResolver(ancRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      registrationDate: formatDateForInput(initialData?.registration_date || '') || new Date().toISOString().split('T')[0],
      registrationNumber: initialData?.registration_number || generateAntenatalRegistrationNumber(patient.patient_id),
      antenatalStatus: initialData?.antenatal_status || 'Active',
      parity: initialData?.parity || undefined,
      gravida: initialData?.gravida || undefined,
      gravidaParityComment: initialData?.gravida_parity_comment || '',
      gestationWeeks: initialData?.gestation_weeks || undefined,
      estimatedDeliveryDate: formatDateForInput(initialData?.estimated_delivery_date || ''),
      bloodPressure: initialData?.blood_pressure || '',
      weight: initialData?.weight?.toString() || '',
      height: initialData?.height?.toString() || '', // Added height
      hemoglobinAtRegistration: initialData?.hemoglobin_at_registration || undefined,
      bloodGroupAbo: initialData?.blood_group_abo || 'N/A',
      rhesusStatus: initialData?.rhesus_status || 'N/A',
      sicklingStatus: initialData?.sickling_status || 'N/A',
      syphilisScreeningStatus: initialData?.syphilis_screening_status || 'N/A',
      syphilisTreatment: initialData?.syphilis_treatment || undefined,
      hivStatusAtRegistration: initialData?.hiv_status_at_registration || 'N/A',
      hivRetestedAt34Weeks: initialData?.hiv_retested_at_34weeks || 'N/A',
      arvTreatment: initialData?.arv_treatment || undefined,
      screenedForTb: initialData?.screened_for_tb || undefined,
      tbDiagnosed: initialData?.tb_diagnosed || undefined,
      tbTreatmentStarted: initialData?.tb_treatment_started || undefined,
      itnGiven: initialData?.itn_given || undefined,
      itnType: initialData?.itn_type || 'N/A',
      folicAcidIronSupplements: initialData?.folic_acid_iron_supplements || 'N/A',
    },
  });

  // Reset form when initialData changes and generate registration number for new registrations
  useEffect(() => {
    if (form) {
      if (initialData) {
        // Reset form with existing data
        const formData = {
          registrationDate: formatDateForInput(initialData?.registration_date || '') || new Date().toISOString().split('T')[0],
          registrationNumber: initialData?.registration_number || '',
          antenatalStatus: initialData?.antenatal_status || 'Active',
          parity: initialData?.parity || undefined,
          gravida: initialData?.gravida || undefined,
          gravidaParityComment: initialData?.gravida_parity_comment || '',
          gestationWeeks: initialData?.gestation_weeks || undefined,
          estimatedDeliveryDate: formatDateForInput(initialData?.estimated_delivery_date || ''),
          bloodPressure: initialData?.blood_pressure || '',
          weight: initialData?.weight?.toString() || '',
          height: initialData?.height?.toString() || '', // Added height
          hemoglobinAtRegistration: initialData?.hemoglobin_at_registration || undefined,
          bloodGroupAbo: initialData?.blood_group_abo || 'N/A',
          rhesusStatus: initialData?.rhesus_status || 'N/A',
          sicklingStatus: initialData?.sickling_status || 'N/A',
          syphilisScreeningStatus: initialData?.syphilis_screening_status || 'N/A',
          syphilisTreatment: initialData?.syphilis_treatment || undefined,
          hivStatusAtRegistration: initialData?.hiv_status_at_registration || 'N/A',
          hivRetestedAt34Weeks: initialData?.hiv_retested_at_34weeks || 'N/A',
          arvTreatment: initialData?.arv_treatment || undefined,
          screenedForTb: initialData?.screened_for_tb || undefined,
          tbDiagnosed: initialData?.tb_diagnosed || undefined,
          tbTreatmentStarted: initialData?.tb_treatment_started || undefined,
          itnGiven: initialData?.itn_given || undefined,
          itnType: initialData?.itn_type || 'N/A',
          folicAcidIronSupplements: initialData?.folic_acid_iron_supplements || 'N/A',
        };
        
        // Use setTimeout to ensure the form is properly initialized
        setTimeout(() => {
          form.reset(formData);
        }, 0);
      } else {
        // Generate registration number for new registration immediately
        const newRegNumber = generateAntenatalRegistrationNumber(patient.patient_id);
        
        // Reset form to default values for new registration WITH generated registration number
        const defaultFormData = {
          registrationDate: new Date().toISOString().split('T')[0],
          registrationNumber: newRegNumber, // Generated registration number
          antenatalStatus: 'Active',
          parity: undefined,
          gravida: undefined,
          gravidaParityComment: '',
          gestationWeeks: undefined,
          estimatedDeliveryDate: '',
          bloodPressure: '',
          weight: '',
          height: '',
          hemoglobinAtRegistration: undefined,
          bloodGroupAbo: 'N/A',
          rhesusStatus: 'N/A',
          sicklingStatus: 'N/A',
          syphilisScreeningStatus: 'N/A',
          syphilisTreatment: undefined,
          hivStatusAtRegistration: 'N/A',
          hivRetestedAt34Weeks: 'N/A',
          arvTreatment: undefined,
          screenedForTb: undefined,
          tbDiagnosed: undefined,
          tbTreatmentStarted: undefined,
          itnGiven: undefined,
          itnType: 'N/A',
          folicAcidIronSupplements: 'N/A',
        };
        
        // Use setTimeout to ensure the form is properly reset
        setTimeout(() => {
          form.reset(defaultFormData);
        }, 0);
      }
    }
  }, [initialData, form, patient.patient_id]);

  const onSubmit = async (data: ANCRegistrationFormData) => {
    try {
      setIsLoading(true);
      
      console.log('Form submission data:', data);
      console.log('Registration number from form:', data.registrationNumber);
      
      const isUpdate = !!initialData?.antenatal_registration_id;

      const registrationData: Partial<AntenatalRegistration> = {
        antenatal_registration_id: isUpdate 
          ? initialData.antenatal_registration_id 
          : generateUUID(),
        patient_id: patient.patient_id,
        registration_number: data.registrationNumber || generateAntenatalRegistrationNumber(patient.patient_id),
        registration_date: data.registrationDate,
        antenatal_status: data.antenatalStatus || undefined,
        parity: data.parity ?? undefined,
        gravida: data.gravida ?? undefined,
        gravida_parity_comment: data.gravidaParityComment || undefined,
        gestation_weeks: data.gestationWeeks ?? undefined,
        estimated_delivery_date: data.estimatedDeliveryDate || undefined,
        blood_pressure: data.bloodPressure || undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        height: data.height ? parseFloat(data.height) : undefined,
        hemoglobin_at_registration: data.hemoglobinAtRegistration ?? undefined,
        blood_group_abo: data.bloodGroupAbo || undefined,
        rhesus_status: data.rhesusStatus || undefined,
        sickling_status: data.sicklingStatus || undefined,
        syphilis_screening_status: data.syphilisScreeningStatus || undefined,
        syphilis_treatment: data.syphilisTreatment ?? undefined,
        hiv_status_at_registration: data.hivStatusAtRegistration || undefined,
        hiv_retested_at_34weeks: data.hivRetestedAt34Weeks || undefined,
        arv_treatment: data.arvTreatment ?? undefined,
        screened_for_tb: data.screenedForTb ?? undefined,
        tb_diagnosed: data.tbDiagnosed ?? undefined,
        tb_treatment_started: data.tbTreatmentStarted ?? undefined,
        itn_given: data.itnGiven ?? undefined,
        itn_type: data.itnType || undefined,
        folic_acid_iron_supplements: data.folicAcidIronSupplements || undefined,
      };

      const response = await request<AntenatalRegistration>({
        path: isUpdate
          ? `antenatal-registrations/${initialData.antenatal_registration_id}` 
          : 'antenatal-registrations',
        method: isUpdate ? 'PUT' : 'POST',
        body: registrationData,
      });

      toast({
        variant: 'success',
        title: isUpdate 
          ? 'ANC registration updated successfully' 
          : 'ANC registration created successfully',
      });

      onSuccess(response);
    } catch (error: any) {
      console.error('Failed to save ANC registration:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to save ANC registration',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5" />
          Antenatal Care Registration
        </CardTitle>
        <CardDescription>
          Register new antenatal care records and track pregnancy information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECTION A: Registration Information */}
            <SectionHeader 
              title="Registration Information" 
              icon={FileText}
            />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registrationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || new Date().toISOString().split('T')[0]}
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      {field.value && (
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateForDisplay(field.value)}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Auto-generated (PatientID-[C][N][C])" 
                          disabled={true}
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="antenatalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Antenatal Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SECTION B: Pregnancy Information */}
            <SectionHeader title="Pregnancy Information" icon={Baby} />
            
            <div className="space-y-4">
              {/* Gravida, Parity and Comment Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="parity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                          placeholder="e.g., 4"
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Number of previous births
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gravida"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gravida</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                          placeholder="e.g., 5"
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Number of pregnancies (including current)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gravidaParityComment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gravida/Parity Comment</FormLabel>
                      <FormControl>
                        <Input 
                          type="text" 
                          {...field}
                          value={field.value || ''}
                          placeholder="e.g G3P2 1D"
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Additional gravida/parity details
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Gestation Weeks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gestationWeeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gestation Weeks</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="42" 
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                          placeholder="1-42 weeks"
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedDeliveryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Delivery Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} disabled={isFormDisabled} />
                    </FormControl>
                    {field.value && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDateForDisplay(field.value)}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* SECTION C: Physical Assessment */}
            <SectionHeader title="Physical Assessment" icon={Heart} />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bloodPressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 120/80" disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter weight" disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter height" disabled={isFormDisabled} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                  control={form.control}
                  name="hemoglobinAtRegistration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hemoglobin Level (g/dL)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          value={field.value || ''}
                          placeholder="Enter hemoglobin level" 
                          disabled={isFormDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            {/* SECTION D: Blood Work & Laboratory Results */}
            <SectionHeader title="Blood Work & Laboratory Results" icon={Droplets} />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bloodGroupAbo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group (ABO)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="AB">AB</SelectItem>
                          <SelectItem value="O">O</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="rhesusStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rhesus Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Rhesus status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="Positive">Positive</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sicklingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sickling Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select sickling status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="AA">AA</SelectItem>
                          <SelectItem value="AS">AS</SelectItem>
                          <SelectItem value="SS">SS</SelectItem>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="Negative">Negative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION E: Infections Screening */}
            <SectionHeader title="Infections Screening" icon={Shield} />
            
            <div className="space-y-6">
              {/* Syphilis Section */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  Syphilis Screening
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="syphilisScreeningStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screening Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select screening status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Not Done">Not Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('syphilisScreeningStatus') === 'Positive' && (
                    <FormField
                      control={form.control}
                      name="syphilisTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Given</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select treatment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* HIV Section */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  HIV Screening
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="hivStatusAtRegistration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HIV Status at Registration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select HIV status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Not Done">Not Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="hivRetestedAt34Weeks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>HIV Retested at 34 Weeks</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select retest status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Not Done">Not Done</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {(form.watch('hivStatusAtRegistration') === 'Positive' || form.watch('hivRetestedAt34Weeks') === 'Positive') && (
                  <div className="mt-4">
                    <FormField
                      control={form.control}
                      name="arvTreatment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ARV Treatment</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ARV treatment status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* TB Section */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                  TB Screening
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="screenedForTb"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Screened for TB</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select screening status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('screenedForTb') === true && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="tbDiagnosed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TB Diagnosed</FormLabel>
                            <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select diagnosis status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="N/A">N/A</SelectItem>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('tbDiagnosed') === true && (
                        <FormField
                          control={form.control}
                          name="tbTreatmentStarted"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>TB Treatment Started</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select treatment status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="N/A">N/A</SelectItem>
                                  <SelectItem value="Yes">Yes</SelectItem>
                                  <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION F: Preventive Measures */}
            <SectionHeader title="Preventive Measures" icon={ShieldCheck} />
            
            <div className="space-y-6">
              {/* ITN Section */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Insecticide Treated Nets (ITN)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="itnGiven"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ITN Given</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === 'Yes')} value={field.value === true ? 'Yes' : field.value === false ? 'No' : 'N/A'} disabled={isFormDisabled}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select ITN status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="N/A">N/A</SelectItem>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {form.watch('itnGiven') === true && (
                    <FormField
                      control={form.control}
                      name="itnType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ITN Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ITN type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="N/A">N/A</SelectItem>
                              <SelectItem value="LLIN">LLIN (Long-Lasting)</SelectItem>
                              <SelectItem value="Standard">Standard</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="folicAcidIronSupplements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Folic Acid & Iron Supplements</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isFormDisabled}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplement status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="N/A">N/A</SelectItem>
                        <SelectItem value="Given">Given</SelectItem>
                        <SelectItem value="Not Given">Not Given</SelectItem>
                        <SelectItem value="Contraindicated">Contraindicated</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <Button type="button" variant="outline" disabled={isFormDisabled}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || isFormDisabled}>
                {isLoading ? 'Saving...' : 'Save Registration'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ANCRegistrationForm;
