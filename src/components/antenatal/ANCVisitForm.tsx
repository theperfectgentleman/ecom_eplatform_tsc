import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AntenatalVisit, AntenatalRegistration, Patient } from '@/types';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Save, 
  Plus, 
  Weight, 
  Activity, 
  Heart,
  ArrowLeft,
  Edit,
  ChevronRight
} from 'lucide-react';

const ancVisitSchema = z.object({
  visit_date: z.string().min(1, 'Visit date is required'),
  gestation_weeks: z.number().min(0).max(42).optional(),
  blood_pressure: z.string().optional(),
  weight_kg: z.number().min(0).optional(),
  fundal_height: z.number().min(0).optional(),
  fetal_heart_rate: z.number().min(0).optional(),
  fetal_heart_inspection: z.string().optional(),
  urine_p: z.string().optional(),
  urine_s: z.string().optional(),
  folic_acid_iron: z.string().optional(),
  pt: z.string().optional(),
  tt: z.string().optional(),
  next_visit_date: z.string().optional(),
});

type ANCVisitFormData = z.infer<typeof ancVisitSchema>;

interface ANCVisitFormProps {
  patient: Patient;
  registration: AntenatalRegistration;
  onSuccess: (visit: AntenatalVisit) => void;
  readOnly?: boolean;
}

const ANCVisitForm = ({ patient, registration, onSuccess, readOnly = false }: ANCVisitFormProps) => {
  const { toast } = useToast();
  const { quietRequest, request } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visits, setVisits] = useState<AntenatalVisit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVisit, setEditingVisit] = useState<AntenatalVisit | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'form' | 'details'>('list');

  // Function to generate antenatal visit SID
  const generateAntenatalVisitSid = (registrationNumber: string): string => {
    // Characters allowed (excluding O, I, L, 0 for better readability)
    const allowedChars = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
    
    // Generate 8 random characters
    const getRandomChar = () => allowedChars[Math.floor(Math.random() * allowedChars.length)];
    
    const randomChars = Array.from({ length: 8 }, getRandomChar).join('');
    
    return `${registrationNumber}-${randomChars}`;
  };

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

  const form = useForm<ANCVisitFormData>({
    resolver: zodResolver(ancVisitSchema),
    defaultValues: {
      visit_date: new Date().toISOString().split('T')[0],
      gestation_weeks: undefined,
      blood_pressure: '',
      weight_kg: undefined,
      fundal_height: undefined,
      fetal_heart_rate: undefined,
      fetal_heart_inspection: '',
      urine_p: '',
      urine_s: '',
      folic_acid_iron: '',
      pt: '',
      tt: '',
      next_visit_date: '',
    },
  });

  const loadVisits = useCallback(async () => {
    try {
      const data = await quietRequest<AntenatalVisit[]>({
        path: `antenatal-visits/patient/${patient.patient_id}`,
      });
      setVisits(data || []);
    } catch (error) {
      console.error('Failed to load visits:', error);
      setVisits([]);
    }
  }, [patient.patient_id, quietRequest]);

  useEffect(() => {
    loadVisits();
  }, [loadVisits]);

  const onSubmit = async (data: ANCVisitFormData) => {
    try {
      setIsSubmitting(true);
      
      const visitData = {
        ...data,
        patient_id: patient.patient_id,
        antenatal_registration_id: registration.antenatal_registration_id,
        // Generate antenatal_visit_sid for new visits, preserve existing for edits
        antenatal_visit_sid: editingVisit 
          ? editingVisit.antenatal_visit_sid 
          : generateAntenatalVisitSid(registration.registration_number),
      };

      const response = await request<AntenatalVisit>({
        path: editingVisit 
          ? `antenatal-visits/${editingVisit.id}` 
          : 'antenatal-visits',
        method: editingVisit ? 'PUT' : 'POST',
        body: visitData,
      });

      toast({
        variant: 'success',
        title: editingVisit 
          ? 'Visit updated successfully' 
          : 'Visit recorded successfully',
      });

      await loadVisits();
      setViewMode('list');
      setEditingVisit(null);
      onSuccess(response);
    } catch (error: any) {
      console.error('Failed to save visit:', error);
      toast({
        variant: 'error',
        title: 'Error',
        description: error.message || 'Failed to save visit',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {editingVisit ? 'Edit ANC Visit' : 'New ANC Visit'} for {patient.name}
          </CardTitle>
          <div className="text-sm text-gray-600">
            Registration: {registration.registration_number}
          </div>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Visit Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visit_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gestation_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gestation Weeks</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Weeks"
                          min="0"
                          max="42"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Physical Measurements */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Physical Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="blood_pressure"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blood Pressure</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 120/80" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Weight in kg"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
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
                    name="fundal_height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fundal Height (cm)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Height in cm"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fetal_heart_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fetal Heart Rate (bpm)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Beats per minute"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="fetal_heart_inspection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fetal Heart Inspection</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Abnormal">Abnormal</SelectItem>
                          <SelectItem value="Not Detected">Not Detected</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Urine Tests */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Urine Tests</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="urine_p"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urine Protein</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="Trace">Trace</SelectItem>
                            <SelectItem value="+">+</SelectItem>
                            <SelectItem value="++">++</SelectItem>
                            <SelectItem value="+++">+++</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="urine_s"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urine Sugar</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select result" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Negative">Negative</SelectItem>
                            <SelectItem value="Trace">Trace</SelectItem>
                            <SelectItem value="+">+</SelectItem>
                            <SelectItem value="++">++</SelectItem>
                            <SelectItem value="+++">+++</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Medications & Treatments */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medications & Treatments</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="folic_acid_iron"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Folic Acid/Iron</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Given">Given</SelectItem>
                            <SelectItem value="Not Given">Not Given</SelectItem>
                            <SelectItem value="Continued">Continued</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IPT (Prophylactic Treatment)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Given">Given</SelectItem>
                            <SelectItem value="Not Given">Not Given</SelectItem>
                            <SelectItem value="Continued">Continued</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>TD (Tetanus Diphtheria)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="TT1">TT1</SelectItem>
                            <SelectItem value="TT2">TT2</SelectItem>
                            <SelectItem value="TT3">TT3</SelectItem>
                            <SelectItem value="TT4">TT4</SelectItem>
                            <SelectItem value="TT5">TT5</SelectItem>
                            <SelectItem value="Not Given">Not Given</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="next_visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Visit Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Visit'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Calculate latest values for progress cards
  const getLatestWeight = () => {
    const weights = visits.filter(v => v.weight_kg).map(v => v.weight_kg);
    return weights.length > 0 ? weights[weights.length - 1] : null;
  };

  const getLatestFundalHeight = () => {
    const heights = visits.filter(v => v.fundal_height).map(v => v.fundal_height);
    return heights.length > 0 ? heights[heights.length - 1] : null;
  };

  // Render form for adding/editing visits
  if (viewMode === 'form') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setViewMode('list')}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {editingVisit ? 'Edit Visit' : 'New Visit'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="visit_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={readOnly} />
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
                  name="gestation_weeks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gestation (weeks)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g. 28"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="blood_pressure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Pressure</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 120/80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 65.5"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fundal_height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fundal Height (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="e.g. 28.5"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fetal_heart_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fetal Heart Rate (bpm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g. 140"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="next_visit_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Next Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={readOnly} />
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

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setViewMode('list')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Visit'}
                  <Save className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weight Progress */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Weight className="h-4 w-4" />
                  <span className="text-sm font-medium">Weight Progress</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {getLatestWeight() ? `${getLatestWeight()} kg` : 'No data'}
                </div>
                <div className="text-xs text-blue-700">Latest</div>
              </div>
              <div className="w-16 h-12 bg-blue-400 rounded"></div>
            </div>
          </CardContent>
        </Card>

        {/* Fundal Height */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Fundal Height</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {getLatestFundalHeight() ? `${getLatestFundalHeight()} cm` : 'No data'}
                </div>
                <div className="text-xs text-green-700">Latest</div>
              </div>
              <div className="w-16 h-12 bg-green-400 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visit List */}
      <div className="space-y-3">
        {visits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No visits recorded yet</p>
              {readOnly ? (
                <p className="text-sm text-gray-400">Enable edit mode to record visits</p>
              ) : (
                <Button onClick={() => setViewMode('form')} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" />
                  Record First Visit
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          visits.map((visit, index) => (
            <Card key={visit.id} className="bg-green-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-green-500 text-white text-xs">
                        Visit #{visits.length - index}
                      </Badge>
                      <span className="font-semibold">
                        {new Date(visit.visit_date).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                          <Heart className="h-3 w-3" />
                          <span>BP</span>
                        </div>
                        <div className="font-semibold">{visit.blood_pressure || 'N/A'}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Weight className="h-3 w-3" />
                          <span>Weight</span>
                        </div>
                        <div className="font-semibold">{visit.weight_kg ? `${visit.weight_kg} kg` : 'N/A'}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <Activity className="h-3 w-3" />
                          <span>Gestation</span>
                        </div>
                        <div className="font-semibold">{visit.gestation_weeks ? `${visit.gestation_weeks} wks` : 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!readOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingVisit(visit);
                          
                          // Format dates to YYYY-MM-DD for HTML date inputs
                          const formatDateForInput = (dateString: string | null | undefined) => {
                            if (!dateString) return '';
                            
                            try {
                              // Handle both ISO format and date-only format
                              const date = new Date(dateString);
                              if (isNaN(date.getTime())) return '';
                              
                              // Return in YYYY-MM-DD format
                              return date.toISOString().split('T')[0];
                            } catch {
                              return '';
                            }
                          };
                          
                          form.reset({
                            visit_date: formatDateForInput(visit.visit_date),
                            gestation_weeks: visit.gestation_weeks || undefined,
                            blood_pressure: visit.blood_pressure || '',
                            weight_kg: visit.weight_kg || undefined,
                            fundal_height: visit.fundal_height || undefined,
                            fetal_heart_rate: visit.fetal_heart_rate || undefined,
                            fetal_heart_inspection: visit.fetal_heart_inspection || '',
                            urine_p: visit.urine_p || '',
                            urine_s: visit.urine_s || '',
                            folic_acid_iron: visit.folic_acid_iron || '',
                            pt: visit.pt || '',
                            tt: visit.tt || '',
                            next_visit_date: formatDateForInput(visit.next_visit_date),
                          });
                          setViewMode('form');
                        }}
                        title="Edit Visit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Floating Add Button */}
      {visits.length > 0 && !readOnly && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => {
              setEditingVisit(null);
              form.reset();
              setViewMode('form');
            }}
            size="lg"
            className="rounded-full bg-green-500 hover:bg-green-600 shadow-lg px-6 py-3 h-auto"
            title="Add New Visit"
          >
            <Plus className="h-5 w-5 mr-2" />
            Record Visit
          </Button>
        </div>
      )}
    </div>
  );
};

export default ANCVisitForm;
