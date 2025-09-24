import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Patient } from '@/types';
import { useApi } from '@/lib/useApi';
import { useToast } from '@/components/ui/toast/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
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
  Save, 
  MapPin, 
  User, 
  Phone, 
  Users, 
  MapPin as LocationIcon,
  Edit
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

// District code mapping
const DISTRICT_CODES = {
  'Wa West': '11',
  'Mamprugu Moagduri': '22'
} as const;

// Patient code generation functions
const generateRandomDigits = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
};

const generateRandomLetters = (length: number): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Excluding O and I
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
};

const generatePatientId = (district: string): string => {
  const districtCode = DISTRICT_CODES[district as keyof typeof DISTRICT_CODES] || '00';
  const year = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
  const randomDigits = generateRandomDigits(4);
  const randomLetters = generateRandomLetters(2);
  
  return `EN-${districtCode}${year}-${randomDigits}${randomLetters}`;
};

const isValidPatientIdFormat = (id: string): boolean => {
  // Format: EN-(districtcode)(YY)-(4 digits)(2 letters)
  const regex = /^EN-\d{4}-\d{4}[A-Z]{2}$/;
  return regex.test(id);
};

const personDetailsSchema = z.object({
  surname: z.string().min(2, 'Surname must be at least 2 characters'),
  other_names: z.string().min(1, 'Other names are required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  contact_number: z.string()
    .min(10, 'Contact number must be at least 10 digits')
    .max(20, 'Contact number must not exceed 20 characters'),
  alternative_number: z.string().max(20, 'Alternative number must not exceed 20 characters').optional(),
  next_of_kin_name: z.string().optional(),
  next_of_kin_contact: z.string().max(255, 'Next of kin contact must not exceed 255 characters').optional(),
  patient_id: z.string().optional(),
  patient_code: z.string().optional(),
  registration_date: z.string().min(1, 'Registration date is required'),
  region: z.string().min(1, 'Region is required'),
  district: z.string().min(1, 'District is required'),
  subdistrict: z.string().min(1, 'Subdistrict is required'),
  community_name: z.string().min(1, 'Community is required'),
  address: z.string().min(1, 'Address is required'),
  reg_loc_lat: z.number().optional(),
  reg_loc_lng: z.number().optional(),
});

type PersonDetailsFormData = z.infer<typeof personDetailsSchema>;

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

interface PersonDetailsFormProps {
  initialData?: Partial<Patient>;
  onSuccess: (patient: Patient) => void;
  communities?: any[];
  readOnly?: boolean;
}

const PersonDetailsForm = ({ initialData, onSuccess, communities = [], readOnly = false }: PersonDetailsFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { request } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoadingPatientData, setIsLoadingPatientData] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!readOnly); // Start in edit mode if not read-only
  
  // Determine if form fields should be disabled
  const isFormDisabled = readOnly && !isEditMode;
  
  // Geographic dropdown states
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [subdistrictOptions, setSubdistrictOptions] = useState<string[]>([]);
  const [communityOptions, setCommunityOptions] = useState<string[]>([]);

  // Helper function to format ISO date to YYYY-MM-DD for date inputs
  const formatDateForInput = (isoDate: string | null | undefined): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return date.toISOString().split('T')[0]; // Gets just the YYYY-MM-DD part
    } catch {
      return '';
    }
  };

  // Helper function to format date to DD-MMM-YYYY for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch {
      return '';
    }
  };

  const form = useForm<PersonDetailsFormData>({
    resolver: zodResolver(personDetailsSchema),
    defaultValues: {
      surname: initialData?.name || '',
      other_names: initialData?.othernames || '',
      date_of_birth: formatDateForInput(initialData?.dob),
      contact_number: initialData?.contact_number || '',
      alternative_number: initialData?.alternative_number || '',
      next_of_kin_name: initialData?.next_kin || '',
      next_of_kin_contact: initialData?.next_kin_contact || '',
      patient_id: initialData?.patient_id || '',
      patient_code: initialData?.patient_code || '',
      registration_date: formatDateForInput(initialData?.registration_date),
      region: initialData?.region || '',
      district: initialData?.district || '',
      subdistrict: (initialData as any)?.subdistrict || initialData?.sub_district || '',
      community_name: initialData?.community || '',
      address: initialData?.address || '',
      reg_loc_lat: initialData?.reg_loc_lat || undefined,
      reg_loc_lng: initialData?.reg_loc_lng || undefined,
    },
  });

  const watchedRegion = form.watch('region');
  const watchedDistrict = form.watch('district');
  const watchedSubdistrict = form.watch('subdistrict');

  // Generate patient ID for new patients or validate/fix existing ones
  useEffect(() => {
    const currentPatientId = form.getValues('patient_id');
    const district = form.getValues('district');
    
    // If no patient ID (new patient) or invalid format, generate a new one
    if (district && (!currentPatientId || !isValidPatientIdFormat(currentPatientId))) {
      const newId = generatePatientId(district);
      form.setValue('patient_id', newId);
    }
  }, [watchedDistrict, form]);

  // Generate patient ID when creating new patient (no initialData)
  useEffect(() => {
    if (!initialData && watchedDistrict) {
      const newId = generatePatientId(watchedDistrict);
      form.setValue('patient_id', newId);
    }
  }, [initialData, watchedDistrict, form]);

  // Debug: Log form values when they change
  useEffect(() => {
    console.log('Form values:', {
      region: watchedRegion,
      district: watchedDistrict,
      subdistrict: watchedSubdistrict,
      community: form.watch('community_name')
    });
  }, [watchedRegion, watchedDistrict, watchedSubdistrict, form]);

  // Reset form when initialData changes (when a different patient is selected)
  useEffect(() => {
    if (initialData && communities.length > 0) {
      console.log('Resetting form with patient data:', initialData);
      console.log('Communities available:', communities.length);
      setIsLoadingPatientData(true);
      
      // First, set up the dropdown options based on patient data
      if (initialData.region) {
        // Set up regions
        const regions = [...new Set(communities.map((c: any) => c.region).filter(Boolean))].sort();
        setRegionOptions(['None', ...regions.filter((r: string) => r && r !== 'None')]);
        
        // Set districts based on patient's region
        const districts = [...new Set(communities
          .filter((c: any) => c.region === initialData.region)
          .map((c: any) => c.district)
          .filter(Boolean))].sort();
        const districtOptions = ['None', ...districts.filter((d: string) => d && d !== 'None')];
        setDistrictOptions(districtOptions);
        console.log('Set district options for', initialData.region, ':', districtOptions);
        console.log('Patient district:', initialData.district);

        // Set subdistricts based on patient's region and district
        if (initialData.district) {
          const subdistricts = [...new Set(communities
            .filter((c: any) => c.region === initialData.region && c.district === initialData.district)
            .map((c: any) => c.subdistrict)
            .filter(Boolean))].sort();
          const subdistrictOptions = ['None', ...subdistricts.filter((s: string) => s && s !== 'None')];
          setSubdistrictOptions(subdistrictOptions);
          console.log('Set subdistrict options for', initialData.district, ':', subdistrictOptions);

          // Set communities based on patient's region, district, and subdistrict
          const patientSubdistrict = (initialData as any).subdistrict || initialData.sub_district;
          console.log('Patient subdistrict:', patientSubdistrict);
          if (patientSubdistrict) {
            const comms = [...new Set(communities
              .filter((c: any) => 
                c.region === initialData.region && 
                c.district === initialData.district && 
                c.subdistrict === patientSubdistrict
              )
              .map((c: any) => c.community_name)
              .filter(Boolean))].sort();
            const communityOptions = ['None', ...comms.filter((c: string) => c && c !== 'None')];
            setCommunityOptions(communityOptions);
            console.log('Set community options for', patientSubdistrict, ':', communityOptions);
          }
        }
      }

      // Then reset the form with the patient data
      const patientSubdistrict = (initialData as any).subdistrict || initialData.sub_district || '';
      const patientCommunity = initialData.community || '';
      
      const formData = {
        surname: initialData.name || '',
        other_names: initialData.othernames || '',
        date_of_birth: formatDateForInput(initialData.dob),
        contact_number: initialData.contact_number || '',
        alternative_number: initialData.alternative_number || '',
        next_of_kin_name: initialData.next_kin || '',
        next_of_kin_contact: initialData.next_kin_contact || '',
        patient_id: initialData.patient_id || '',
        patient_code: initialData.patient_code || '',
        registration_date: formatDateForInput(initialData.registration_date),
        region: initialData.region || '',
        district: initialData.district || '',
        subdistrict: patientSubdistrict,
        community_name: patientCommunity,
        address: initialData.address || '',
        reg_loc_lat: initialData.reg_loc_lat || undefined,
        reg_loc_lng: initialData.reg_loc_lng || undefined,
      };
      
      console.log('Resetting form with data:', formData);
      form.reset(formData);

      // Also explicitly set values to ensure they take effect
      setTimeout(() => {
        console.log('Setting individual form values...');
        form.setValue('surname', initialData.name || '');
        form.setValue('other_names', initialData.othernames || '');
        form.setValue('date_of_birth', formatDateForInput(initialData.dob));
        form.setValue('contact_number', initialData.contact_number || '');
        form.setValue('alternative_number', initialData.alternative_number || '');
        form.setValue('next_of_kin_name', initialData.next_kin || '');
        form.setValue('next_of_kin_contact', initialData.next_kin_contact || '');
        form.setValue('patient_id', initialData.patient_id || '');
        form.setValue('patient_code', initialData.patient_code || '');
        form.setValue('registration_date', formatDateForInput(initialData.registration_date));
        form.setValue('region', initialData.region || '');
        form.setValue('district', initialData.district || '');
        form.setValue('subdistrict', patientSubdistrict);
        form.setValue('community_name', patientCommunity);
        form.setValue('address', initialData.address || '');
        console.log('Form values set individually');
      }, 50);

      // Small delay to ensure form is fully reset before allowing cascading logic
      setTimeout(() => {
        setIsLoadingPatientData(false);
        console.log('Form loading complete');
      }, 300);
    }
  }, [initialData, form, communities]);

  // Set up region options when communities load
  useEffect(() => {
    if (communities.length > 0) {
      const regions = [...new Set(communities.map((c: any) => c.region).filter(Boolean))].sort();
      setRegionOptions(['None', ...regions.filter((r: string) => r && r !== 'None')]);
    }
  }, [communities]);

  // Handle region changes
  useEffect(() => {
    console.log('Region changed:', watchedRegion, 'isLoadingPatientData:', isLoadingPatientData);
    if (watchedRegion && watchedRegion !== 'None') {
      const districts = [...new Set(communities
        .filter((c: any) => c.region === watchedRegion)
        .map((c: any) => c.district)
        .filter(Boolean))].sort();
      const districtOptions = ['None', ...districts.filter((d: string) => d && d !== 'None')];
      setDistrictOptions(districtOptions);
      console.log('District options set for region', watchedRegion, ':', districtOptions);
      
      // Only clear dependent fields if we're not loading patient data AND this is a manual change
      if (!isLoadingPatientData && initialData) {
        // Only clear if the current region is different from patient's region
        if (watchedRegion !== initialData.region) {
          console.log('Clearing dependent fields due to region change');
          form.setValue('district', '');
          form.setValue('subdistrict', '');
          form.setValue('community_name', '');
        }
      } else if (!isLoadingPatientData && !initialData) {
        // New patient - always clear
        form.setValue('district', '');
        form.setValue('subdistrict', '');
        form.setValue('community_name', '');
      }
    } else {
      setDistrictOptions([]);
      setSubdistrictOptions([]);
      setCommunityOptions([]);
    }
  }, [watchedRegion, communities, form, isLoadingPatientData, initialData]);

  // Handle district changes
  useEffect(() => {
    if (watchedDistrict && watchedDistrict !== 'None' && watchedRegion && watchedRegion !== 'None') {
      const subdistricts = [...new Set(communities
        .filter((c: any) => c.region === watchedRegion && c.district === watchedDistrict)
        .map((c: any) => c.subdistrict)
        .filter(Boolean))].sort();
      setSubdistrictOptions(['None', ...subdistricts.filter((s: string) => s && s !== 'None')]);
      
      // Only clear dependent fields if we're not loading patient data AND this is a manual change
      if (!isLoadingPatientData && initialData) {
        // Only clear if the current district is different from patient's district
        if (watchedDistrict !== initialData.district) {
          console.log('Clearing dependent fields due to district change');
          form.setValue('subdistrict', '');
          form.setValue('community_name', '');
        }
      } else if (!isLoadingPatientData && !initialData) {
        // New patient - always clear
        form.setValue('subdistrict', '');
        form.setValue('community_name', '');
      }
    } else {
      setSubdistrictOptions([]);
      setCommunityOptions([]);
    }
  }, [watchedDistrict, watchedRegion, communities, form, isLoadingPatientData, initialData]);

  // Handle subdistrict changes
  useEffect(() => {
    if (watchedSubdistrict && watchedRegion && watchedRegion !== 'None' && watchedDistrict && watchedDistrict !== 'None') {
      if (watchedSubdistrict === 'None') {
        setCommunityOptions(['None']);
      } else {
        const comms = [...new Set(communities
          .filter((c: any) => 
            c.region === watchedRegion && 
            c.district === watchedDistrict && 
            c.subdistrict === watchedSubdistrict
          )
          .map((c: any) => c.community_name)
          .filter(Boolean))].sort();
        setCommunityOptions(['None', ...comms.filter((c: string) => c && c !== 'None')]);
      }
      
      // Only clear dependent fields if we're not loading patient data AND this is a manual change
      const patientSubdistrict = (initialData as any)?.subdistrict || initialData?.sub_district;
      if (!isLoadingPatientData && initialData) {
        // Only clear if the current subdistrict is different from patient's subdistrict
        if (watchedSubdistrict !== patientSubdistrict) {
          console.log('Clearing dependent fields due to subdistrict change');
          form.setValue('community_name', '');
        }
      } else if (!isLoadingPatientData && !initialData) {
        // New patient - always clear
        form.setValue('community_name', '');
      }
    } else {
      setCommunityOptions([]);
    }
  }, [watchedSubdistrict, watchedRegion, watchedDistrict, communities, form, isLoadingPatientData, initialData]);

  // GPS Location capture function
  const captureLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsCapturingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        form.setValue('reg_loc_lat', latitude);
        form.setValue('reg_loc_lng', longitude);
        
        setIsCapturingLocation(false);
        toast({
          variant: 'success',
          title: 'Location captured successfully',
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        setLocationError(errorMessage);
        setIsCapturingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Phone number formatting function
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/\D/g, '');
    
    // Limit to 10 digits to fit database constraints (varchar 20 with formatting)
    const limitedValue = numericValue.slice(0, 10);
    
    // Format as XXX-XXX-XXXX
    if (limitedValue.length >= 6) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3, 6)}-${limitedValue.slice(6, 10)}`;
    } else if (limitedValue.length >= 3) {
      return `${limitedValue.slice(0, 3)}-${limitedValue.slice(3)}`;
    }
    return limitedValue;
  };

  const onSubmit = async (data: PersonDetailsFormData) => {
    try {
      setIsSubmitting(true);

      // Generate patient ID just before submission if it's a new patient
      if (!initialData?.patient_id) {
        const district = form.getValues('district');
        if (district) {
          const newId = generatePatientId(district);
          form.setValue('patient_id', newId);
          data.patient_id = newId; // Update data object as well
        } else {
          throw new Error('District is required to generate a patient ID.');
        }
      }
      
      // Prepare data for API submission, ensuring all fields match database schema
      const cleanedData: any = {
        // Required fields - ensure they have values
        patient_id: data.patient_id, // Now it's guaranteed to be here
        name: data.surname || '', // Map surname to name for backend compatibility
        dob: data.date_of_birth || '', // Map date_of_birth to dob for backend
        contact_number: data.contact_number || '',
        region: data.region && data.region !== 'None' ? data.region : '',
        district: data.district && data.district !== 'None' ? data.district : '',
        address: data.address || '',
        registration_date: data.registration_date || new Date().toISOString().split('T')[0], // Default to today if not set
        
        // Add assigned_user_id from logged-in user
        ...(user?.user_id && { assigned_user_id: user.user_id }),

        // Optional fields - only include if they have values
        ...(data.other_names && { othernames: data.other_names }),
        ...(data.alternative_number && { alternative_number: data.alternative_number }),
        ...(data.next_of_kin_name && { next_kin: data.next_of_kin_name }),
        ...(data.next_of_kin_contact && { next_kin_contact: data.next_of_kin_contact }),
        ...(data.patient_id && { patient_id: data.patient_id }),
        ...(data.patient_code && { patient_code: data.patient_code }),
        ...(data.registration_date && { registration_date: data.registration_date }),
        ...(data.address && { address: data.address }),
        ...(data.subdistrict && data.subdistrict !== 'None' && { subdistrict: data.subdistrict }),
        ...(data.community_name && data.community_name !== 'None' && { community: data.community_name }),
        ...(typeof data.reg_loc_lat === 'number' && { reg_loc_lat: data.reg_loc_lat }),
        ...(typeof data.reg_loc_lng === 'number' && { reg_loc_lng: data.reg_loc_lng }),
      };

      // Attempt to include community_id (fix for community_id being nulled on update)
      try {
        if (data.community_name && data.community_name !== 'None') {
          // Find matching community object. We match by region, district, subdistrict, and community name when possible
            const matchingCommunity = communities.find((c: any) => {
              // Some APIs may use subdistrict vs sub_district naming; handle both
              const commSubdistrict = c.subdistrict || c.sub_district;
              return (
                (c.community_name === data.community_name || c.community === data.community_name) &&
                (!data.region || !c.region || c.region === data.region) &&
                (!data.district || !c.district || c.district === data.district) &&
                (!data.subdistrict || !commSubdistrict || commSubdistrict === data.subdistrict)
              );
            });
            const derivedCommunityId = matchingCommunity?.community_id || matchingCommunity?.id;
            // Prefer freshly derived id, else fall back to initialData
            const existingCommunityId = (initialData as any)?.community_id;
            if (derivedCommunityId || existingCommunityId) {
              cleanedData.community_id = derivedCommunityId || existingCommunityId;
            }
        } else if ((initialData as any)?.community_id) {
          // If user cleared community name but there is still an existing id, retain it unless explicit clearing desired
          cleanedData.community_id = (initialData as any).community_id;
        }
      } catch (e) {
        console.warn('Failed to derive community_id:', e);
      }

      // For updates, include the patient_id
      if (initialData?.patient_id) {
        cleanedData.patient_id = initialData.patient_id;
      }

      console.log('Submitting cleaned data:', cleanedData);

      // Validate required fields before submission
      if (!cleanedData.name) {
        throw new Error('Patient name is required');
      }
      if (!cleanedData.dob) {
        throw new Error('Date of birth is required');
      }
      if (!cleanedData.contact_number) {
        throw new Error('Contact number is required');
      }
      if (!cleanedData.region) {
        throw new Error('Region is required');
      }
      if (!cleanedData.district) {
        throw new Error('District is required');
      }

      // Ensure assigned_user_id is present for new patients
      if (!cleanedData.assigned_user_id && !initialData?.patient_id) {
        throw new Error('Could not identify the logged-in user. Please log in again.');
      }

      // Remove any undefined values from the object
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key] === undefined) {
          delete cleanedData[key];
        }
      });

      const response = await request<Patient>({
        path: initialData?.patient_id ? `patients/${initialData.patient_id}` : 'patients',
        method: initialData?.patient_id ? 'PUT' : 'POST',
        body: cleanedData,
      });

      toast({
        variant: 'success',
        title: initialData?.patient_id ? 'Patient updated successfully' : 'Patient created successfully',
      });

      onSuccess(response);
    } catch (error: any) {
      console.error('Failed to save patient:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to save patient details',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Personal Details</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {form.watch('patient_id') && (
              <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-sm font-mono text-blue-700">
                  {form.watch('patient_id')}
                </span>
              </div>
            )}
          </div>
        </div>
        <CardDescription>
          {isFormDisabled 
            ? "Viewing patient information including personal details, contact information, and location data"
            : "Manage patient information including personal details, contact information, and location data"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* SECTION A: Basic Information */}
            <SectionHeader 
              title="Basic Information" 
              icon={User}
            />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surname *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter surname" 
                          disabled={isFormDisabled}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="other_names"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Names</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter other names" 
                          disabled={isFormDisabled}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
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
                
                <FormField
                  control={form.control}
                  name="registration_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Date</FormLabel>
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

              {/* NHIS Number Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patient_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NHIS Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter NHIS number" 
                          disabled={isFormDisabled}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION B: Contact Information */}
            <SectionHeader title="Contact Information" icon={Phone} />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXX-XXX-XXXX" 
                          disabled={isFormDisabled}
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="alternative_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternative Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXX-XXX-XXXX" 
                          disabled={isFormDisabled}
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION C: Next of Kin Information */}
            <SectionHeader title="Next of Kin Information" icon={Users} />
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="next_of_kin_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next of Kin Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter next of kin name" disabled={isFormDisabled} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="next_of_kin_contact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next of Kin Contact (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="XXX-XXX-XXXX" 
                          disabled={isFormDisabled}
                          {...field}
                          onChange={(e) => {
                            const formatted = formatPhoneNumber(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SECTION D: Location & Address Information */}
            <SectionHeader title="Location & Address Information" icon={LocationIcon} />
            
            <div className="space-y-4">
              {/* Geographic Information */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Geographic Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""} 
                          disabled={isFormDisabled}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regionOptions.filter(region => region !== 'None').map((region) => (
                              <SelectItem key={region} value={region}>
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={isFormDisabled || !watchedRegion || watchedRegion === 'None'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={!watchedRegion ? "Select region first" : "Select district"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districtOptions.filter(district => district !== 'None').map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="subdistrict"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subdistrict</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={isFormDisabled || !watchedDistrict || watchedDistrict === 'None'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={!watchedDistrict ? "Select district first" : "Select subdistrict"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subdistrictOptions.map((subdistrict) => (
                              <SelectItem key={subdistrict} value={subdistrict}>
                                {subdistrict}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="community_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Community</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          disabled={isFormDisabled || !watchedDistrict || watchedDistrict === 'None'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={!watchedDistrict ? "Select district first" : "Select community"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {communityOptions.map((community) => (
                              <SelectItem key={community} value={community}>
                                {community}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address & GPS Information */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Address & GPS Location
                </h4>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter detailed address" disabled={isFormDisabled} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>GPS Location</FormLabel>
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                      <button
                        type="button"
                        onClick={captureLocation}
                        disabled={isCapturingLocation || isFormDisabled}
                        className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                      >
                        <MapPin size={14} />
                        {isCapturingLocation ? 'Getting location...' : 'Capture Location'}
                      </button>
                      
                      <div className="flex-1 text-sm text-gray-600">
                        {isCapturingLocation && (
                          <span>Getting location...</span>
                        )}
                        {locationError && (
                          <span className="text-red-600">{locationError}</span>
                        )}
                        {form.watch('reg_loc_lat') && form.watch('reg_loc_lng') && !isCapturingLocation && (
                          <span className="text-green-600">
                            Lat: {Number(form.watch('reg_loc_lat') ?? 0).toFixed(4)}, Lng: {Number(form.watch('reg_loc_lng') ?? 0).toFixed(4)}
                          </span>
                        )}
                        {!form.watch('reg_loc_lat') && !form.watch('reg_loc_lng') && !isCapturingLocation && !locationError && (
                          <span>Tap button to capture current location</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              {readOnly && !isEditMode ? (
                <Button 
                  type="button" 
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Patient Details
                </Button>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      if (readOnly) {
                        setIsEditMode(false);
                      }
                    }}
                  >
                    {readOnly ? 'Cancel' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Person Details'}
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PersonDetailsForm;
