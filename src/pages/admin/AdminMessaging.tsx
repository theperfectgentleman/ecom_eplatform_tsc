import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/useApi';
import { isSuperUserType } from '@/lib/permissions';
import { useToast } from '@/components/ui/toast/useToast';
import {
  Play,
  Square,
  VolumeX,
  Users,
  UserCheck,
  PhoneCall,
  Search,
  AlertTriangle,
  Loader2,
  Send,
  RefreshCw,
  SlidersHorizontal,
  Music,
  Activity
} from 'lucide-react';

// Pre-recorded voice messages - identical to ReportsMessaging catalog
const mockVoiceMessages = [
  // North East Region (10 messages)
  {
    id: 1,
    refCode: '2002',
    topic: 'Documents',
    region: 'North East',
    message: 'Always carry your maternal health card to every visit. This card holds important information about you and your baby.',
    audioFile: '2002.mp3',
  },
  {
    id: 2,
    refCode: '2003',
    topic: 'Communication',
    region: 'North East',
    message: "Prepare questions before your clinic visit. Don't be afraid to ask if you don't understand something.",
    audioFile: '2003.mp3',
  },
  {
    id: 3,
    refCode: '2004',
    topic: 'Health insurance',
    region: 'North East',
    message: 'Have you registered for the National Health Insurance? Pregnant women can register for free and receive free care.',
    audioFile: '2004.mp3',
  },
  {
    id: 4,
    refCode: '2101',
    topic: 'Work safety',
    region: 'North East',
    message: 'When working, take breaks every hour to rest and drink water. Avoid chemicals, heavy lifting, and standing too long.',
    audioFile: '2101.mp3',
  },
  {
    id: 5,
    refCode: '2102',
    topic: 'Household management',
    region: 'North East',
    message: 'As your pregnancy advances, rearrange home duties. Ask family members to help with fetching water, washing clothes, and cooking.',
    audioFile: '2102.mp3',
  },
  {
    id: 6,
    refCode: '2103',
    topic: 'Financial planning',
    region: 'North East',
    message: 'Babies bring joy and also new expenses. Start setting aside small amounts now for delivery related costs, baby clothes, and emergency transport.',
    audioFile: '2103.mp3',
  },
  {
    id: 7,
    refCode: '2104',
    topic: 'Time management',
    region: 'North East',
    message: 'Planning your day can reduce stress. Spread your work in bits over the day so you do not get too tired.',
    audioFile: '2104.mp3',
  },
  {
    id: 8,
    refCode: '2201',
    topic: 'Emergency contacts',
    region: 'North East',
    message: 'Save these important numbers in your phone: your midwife, local driver, nearest health facility, and a family emergency contact.',
    audioFile: '2201.mp3',
  },
  {
    id: 9,
    refCode: '2202',
    topic: 'Health information',
    region: 'North East',
    message: 'Staying informed about your health is key to well-being. Reliable health information is available at your community health center.',
    audioFile: '2202.mp3',
  },
  {
    id: 10,
    refCode: '2203',
    topic: 'Record keeping',
    region: 'North East',
    message: 'Keep all health cards, test results, and medicine instructions in one safe place at home, protected from water and children.',
    audioFile: '2203.mp3',
  },
  // Upper West Region (10 messages)
  {
    id: 11,
    refCode: '1101',
    topic: 'Regular checkups',
    region: 'Upper West',
    message: 'Your baby is growing each day! Remember to visit the health center at your appointment times.',
    audioFile: '1101.mp3',
  },
  {
    id: 12,
    refCode: '1102',
    topic: 'Danger signs',
    region: 'Upper West',
    message: "If you notice bleeding, severe headache, fever, baby not moving, or swelling in your face and hands, don't wait!",
    audioFile: '1102.mp3',
  },
  {
    id: 13,
    refCode: '1103',
    topic: 'Malaria prevention',
    region: 'Upper West',
    message: 'Malaria is dangerous during pregnancy. Always sleep under a treated mosquito net every night.',
    audioFile: '1103.mp3',
  },
  {
    id: 14,
    refCode: '1104',
    topic: 'Managing discomforts',
    region: 'Upper West',
    message: 'Feeling morning sickness? Try eating small amounts often instead of big meals. For backache, rest often and avoid heavy lifting.',
    audioFile: '1104.mp3',
  },
  {
    id: 15,
    refCode: '1201',
    topic: 'Birth plan',
    region: 'Upper West',
    message: 'It\'s time to prepare for birth! Talk with your family about where you will deliver, how to get there, and who will accompany you.',
    audioFile: '1201.mp3',
  },
  {
    id: 16,
    refCode: '1202',
    topic: 'Labor signs',
    region: 'Upper West',
    message: 'Soon you will meet your baby. Labor has started when you feel regular pains that get stronger, waters break, or you see mucus with blood.',
    audioFile: '1202.mp3',
  },
  {
    id: 17,
    refCode: '1204',
    topic: 'Transport planning',
    region: 'Upper West',
    message: 'Have you arranged how to reach the health center when labor begins? Speak with a driver or neighbor with a vehicle now.',
    audioFile: '1204.mp3',
  },
  {
    id: 18,
    refCode: '1301',
    topic: 'Local nutritious foods',
    region: 'Upper West',
    message: 'Your baby needs good food to grow strong. Try to eat kontomire, garden eggs, groundnuts, beans, and small fish daily.',
    audioFile: '1301.mp3',
  },
  {
    id: 19,
    refCode: '1302',
    topic: 'Iron-rich foods',
    region: 'Upper West',
    message: 'To prevent anemia and ensure a healthy pregnancy, eat dark green vegetables, beans and fruits. Also add meat or fish to your meals daily.',
    audioFile: '1302.mp3',
  },
  {
    id: 20,
    refCode: '1404',
    topic: 'Managing Emotions',
    region: 'Upper West',
    message: 'During pregnancy, it\'s important to take care of your emotional well-being. Make time for activities that help you relax.',
    audioFile: '1404.mp3',
  },
];

const calculateAge = (dobString?: string): number | null => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const AdminMessaging = () => {
  const { request } = useApi();
  const { user } = useAuth();
  const { toast } = useToast();

  const isSuperOrAdmin = isSuperUserType(user?.user_type) || user?.user_type?.toLowerCase() === 'admin';

  // Core data states
  const [patients, setPatients] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('All Ages');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Audio catalog states
  const [selectedAudioId, setSelectedAudioId] = useState<number | null>(null);
  const [playingAudioFile, setPlayingAudioFile] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Dispatch states
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [statsToggle, setStatsToggle] = useState<'count' | 'percent'>('count');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Soundwave visualizer element values
  const visualizerBars = Array.from({ length: 6 }, (_, i) => i);

  // Load patient list and communities list
  const loadInitialData = useCallback(async () => {
    if (!user?.user_id) return;
    setLoading(true);
    try {
      // 1. Fetch Patients
      let allPatientsResponse;
      if (isSuperUserType(user.user_type) || user.access_level === 4) {
        allPatientsResponse = await request<any[]>({
          method: 'GET',
          path: 'patients?limit=10000',
        });
      } else {
        allPatientsResponse = await request<any[]>({
          method: 'GET',
          path: `patients/level/${user.user_id}?limit=10000`,
        });
      }
      setPatients(allPatientsResponse || []);

      // 2. Fetch Communities (for region/district options and mapping)
      const communitiesResponse = await request<any[]>({
        method: 'GET',
        path: 'communities',
      });
      setCommunities(communitiesResponse || []);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      toast({
        variant: 'error',
        title: 'Error loading data',
        description: 'Could not load patient or community records.',
      });
    } finally {
      setLoading(false);
    }
  }, [user, request, toast]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Compute unique regions from communities
  const regionOptions = useMemo(() => {
    const uniqueRegions = Array.from(
      new Set(communities.map((c) => c.region).filter((r): r is string => typeof r === 'string' && r.trim().length > 0))
    ).sort();
    return ['All Regions', ...uniqueRegions];
  }, [communities]);

  // Compute unique districts based on selected region
  const districtOptions = useMemo(() => {
    const filteredCommunities = selectedRegion === 'All Regions'
      ? communities
      : communities.filter((c) => c.region === selectedRegion);

    const uniqueDistricts = Array.from(
      new Set(filteredCommunities.map((c) => c.district).filter((d): d is string => typeof d === 'string' && d.trim().length > 0))
    ).sort();

    return ['All Districts', ...uniqueDistricts];
  }, [communities, selectedRegion]);

  // Reset selected district if it becomes invalid under new region
  useEffect(() => {
    if (selectedDistrict !== 'All Districts' && !districtOptions.includes(selectedDistrict)) {
      setSelectedDistrict('All Districts');
    }
  }, [selectedRegion, districtOptions, selectedDistrict]);

  // Map age filters to condition callback
  const matchesAgeRange = (age: number | null, range: string): boolean => {
    if (range === 'All Ages') return true;
    if (age === null) return false;
    switch (range) {
      case 'Under 18':
        return age < 18;
      case '18-24':
        return age >= 18 && age <= 24;
      case '25-34':
        return age >= 25 && age <= 34;
      case '35-44':
        return age >= 35 && age <= 44;
      case '45+':
        return age >= 45;
      default:
        return true;
    }
  };

  // Filter patients client-side
  const filteredPatients = useMemo(() => {
    setCurrentPage(1); // Reset page on filter change
    return patients.filter((patient) => {
      // 1. Region Filter
      if (selectedRegion !== 'All Regions' && patient.region !== selectedRegion) {
        return false;
      }

      // 2. District Filter
      if (selectedDistrict !== 'All Districts' && patient.district !== selectedDistrict) {
        return false;
      }

      // 3. Age Range Filter
      if (selectedAgeRange !== 'All Ages') {
        const age = calculateAge(patient.dob);
        if (!matchesAgeRange(age, selectedAgeRange)) {
          return false;
        }
      }

      // 4. Search text filter
      if (searchTerm.trim().length > 0) {
        const query = searchTerm.toLowerCase();
        const patientName = `${patient.name || ''} ${patient.othernames || ''}`.toLowerCase();
        const code = (patient.patient_code || '').toLowerCase();
        const contact = patient.contact_number || '';
        if (!patientName.includes(query) && !code.includes(query) && !contact.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }, [patients, selectedRegion, selectedDistrict, selectedAgeRange, searchTerm]);

  // Determine active region for pre-recorded audios
  const activeAudioRegion = useMemo(() => {
    if (selectedDistrict !== 'All Districts') {
      const comm = communities.find((c) => c.district === selectedDistrict);
      if (comm?.region) return comm.region;
      // Fallback
      const districtFallback: Record<string, string> = {
        'Wa West': 'Upper West',
        'Nadowli-Kaleo': 'Upper West',
        'Jirapa': 'Upper West',
        'Mamprugu Moagduri': 'North East',
      };
      return districtFallback[selectedDistrict] || null;
    }

    if (selectedRegion !== 'All Regions') {
      return selectedRegion;
    }

    return null;
  }, [selectedRegion, selectedDistrict, communities]);

  // Dynamically filter mock voice messages based on target region
  const filteredAudioMessages = useMemo(() => {
    if (!activeAudioRegion) {
      return mockVoiceMessages; // Show all by default
    }
    return mockVoiceMessages.filter((msg) => msg.region === activeAudioRegion);
  }, [activeAudioRegion]);

  // Automatically select the first audio in the list if the current one is filtered out
  useEffect(() => {
    if (selectedAudioId !== null) {
      const exists = filteredAudioMessages.some((msg) => msg.id === selectedAudioId);
      if (!exists) {
        setSelectedAudioId(null);
      }
    }
  }, [filteredAudioMessages, selectedAudioId]);

  // Get currently selected audio object
  const selectedAudio = useMemo(() => {
    return mockVoiceMessages.find((msg) => msg.id === selectedAudioId) || null;
  }, [selectedAudioId]);

  // Audio player handles
  const handlePlayAudio = (audioFile: string, region: string) => {
    if (playingAudioFile === audioFile && audioRef.current) {
      handleStopAudio();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const regionFolder = region === 'North East' ? 'east' : 'west';
    const audioPath = `/src/assets/audio/${regionFolder}/${audioFile}`;

    const audio = new Audio(audioPath);
    audioRef.current = audio;

    audio.play().catch((err) => {
      console.error('Audio play failed:', err);
      toast({
        variant: 'error',
        title: 'Playback Error',
        description: 'Unable to play preview audio.',
      });
      setPlayingAudioFile(null);
    });

    setPlayingAudioFile(audioFile);
    audio.onended = () => {
      setPlayingAudioFile(null);
      audioRef.current = null;
    };
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingAudioFile(null);
  };

  // Perform broadcast
  const handleBroadcast = async () => {
    if (!selectedAudio) {
      toast({
        variant: 'warning',
        title: 'Select Message',
        description: 'Please select an audio script to broadcast.',
      });
      return;
    }

    const validRecipients = filteredPatients
      .map((p) => p.contact_number)
      .filter((num): num is string => typeof num === 'string' && num.trim().length > 0);

    if (validRecipients.length === 0) {
      toast({
        variant: 'warning',
        title: 'No Recipients',
        description: 'There are no active patients with valid contacts matching filters.',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to broadcast this voice message to ${validRecipients.length} patients?`)) {
      return;
    }

    setIsBroadcasting(true);
    try {
      // 1. Fetch file as Blob from frontend assets
      const regionFolder = selectedAudio.region === 'North East' ? 'east' : 'west';
      const audioPath = `/src/assets/audio/${regionFolder}/${selectedAudio.audioFile}`;

      const response = await fetch(audioPath);
      if (!response.ok) {
        throw new Error(`Audio asset not found at path: ${audioPath}`);
      }

      const blob = await response.blob();
      const file = new File([blob], selectedAudio.audioFile, { type: 'audio/mpeg' });

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('voice_file', file);
      validRecipients.forEach((r) => formData.append('recipients[]', r));
      
      if (selectedDistrict && selectedDistrict !== 'All Districts') {
        formData.append('district', selectedDistrict);
      }
      formData.append('source', 'broadcast');

      // 3. Dispatch to API
      const result = await request<{
        message?: string;
        campaignId?: string;
        recipients?: number;
        invalidRecipients?: string[];
      }>({
        method: 'POST',
        path: 'admin/voice-sms',
        body: formData,
      });

      const successfulCount = result.recipients ?? validRecipients.length;

      toast({
        variant: 'success',
        title: 'Broadcast Triggered!',
        description: `Voice SMS dispatched to ${successfulCount} patients via ${selectedAudio.region} voice service.`,
      });

      setSelectedAudioId(null);
      handleStopAudio();
    } catch (err: any) {
      console.error('Broadcast dispatch error:', err);
      toast({
        variant: 'error',
        title: 'Broadcast Failed',
        description: err?.message || 'Unexpected failure while triggering voice SMS.',
      });
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Pagination helper
  const paginatedPatients = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    return filteredPatients.slice(startIdx, endIdx);
  }, [filteredPatients, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = patients.length;
    const filteredCount = filteredPatients.length;
    const validContactCount = filteredPatients.filter(
      (p) => p.contact_number && p.contact_number.trim().length > 0
    ).length;

    const percentTarget = totalCount > 0 ? ((filteredCount / totalCount) * 100).toFixed(1) : '0.0';
    const percentContacts = filteredCount > 0 ? ((validContactCount / filteredCount) * 100).toFixed(1) : '0.0';

    return {
      totalCount,
      filteredCount,
      validContactCount,
      percentTarget,
      percentContacts,
    };
  }, [patients, filteredPatients]);

  if (!isSuperOrAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-slate-500">Only administrators have access to the Broadcast Messaging features.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Soundwave custom micro-animations */}
      <style>{`
        @keyframes soundwave {
          0%, 100% { height: 4px; }
          50% { height: 20px; }
        }
        .animate-soundwave {
          animation: soundwave 1s ease-in-out infinite;
        }
        .soundwave-bar-0 { animation-delay: 0.1s; }
        .soundwave-bar-1 { animation-delay: 0.3s; }
        .soundwave-bar-2 { animation-delay: 0.5s; }
        .soundwave-bar-3 { animation-delay: 0.2s; }
        .soundwave-bar-4 { animation-delay: 0.4s; }
        .soundwave-bar-5 { animation-delay: 0.6s; }
      `}</style>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl p-6 shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-indigo-900 to-indigo-950 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8 animate-pulse text-indigo-200" />
              Broadcast Messaging Console
            </h1>
            <p className="text-indigo-100 mt-2 text-sm sm:text-base max-w-2xl">
              Target and dispatch pre-recorded local language voice messages directly to patient cohorts.
            </p>
          </div>
          <Button
            onClick={loadInitialData}
            disabled={loading}
            variant="secondary"
            className="bg-white/10 hover:bg-white/20 text-white border-0"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Filters & Statistics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Target Audience Filters */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                <CardTitle className="text-lg">Filter Cohorts</CardTitle>
              </div>
              <CardDescription>Scope patients geographically and demographically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Region */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Region</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">District</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districtOptions.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Age Range */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Age Range</label>
                <Select value={selectedAgeRange} onValueChange={setSelectedAgeRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Ages">All Ages</SelectItem>
                    <SelectItem value="Under 18">Under 18</SelectItem>
                    <SelectItem value="18-24">18-24</SelectItem>
                    <SelectItem value="25-34">25-34</SelectItem>
                    <SelectItem value="35-44">35-44</SelectItem>
                    <SelectItem value="45+">45 and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Broadcast Summary Card */}
          <Card className="border-slate-200 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Campaign Summary
                </CardTitle>
                {/* Percentage / Count Toggle */}
                <div className="inline-flex rounded-md shadow-sm border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    onClick={() => setStatsToggle('count')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      statsToggle === 'count' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Count
                  </button>
                  <button
                    onClick={() => setStatsToggle('percent')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      statsToggle === 'percent' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Target Audience</span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {statsToggle === 'count' ? stats.filteredCount : `${stats.percentTarget}%`}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">out of {stats.totalCount} total</span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Contacts Reached</span>
                  <div className="text-3xl font-extrabold text-indigo-600">
                    {statsToggle === 'count' ? stats.validContactCount : `${stats.percentContacts}%`}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">have valid numbers</span>
                </div>
              </div>

              {/* Selected message details */}
              {selectedAudio ? (
                <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                      Selected Audio
                    </Badge>
                    <span className="text-xs font-semibold text-indigo-700">Code: {selectedAudio.refCode}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 line-clamp-1">{selectedAudio.topic}</p>
                  <p className="text-xs text-slate-600 italic line-clamp-2">"{selectedAudio.message}"</p>
                  
                  {/* Active Playback visualization inside the card */}
                  {playingAudioFile === selectedAudio.audioFile && (
                    <div className="flex items-center gap-2 py-1 text-indigo-600 justify-end">
                      <span className="text-xs font-semibold">Playing Preview</span>
                      <div className="flex items-end gap-0.5 h-6">
                        {visualizerBars.map((bar) => (
                          <div
                            key={bar}
                            className={`w-1 bg-indigo-600 rounded-full animate-soundwave soundwave-bar-${bar}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                  Select an audio file from the catalog to trigger broadcast.
                </div>
              )}

              {/* Broadcast Actions */}
              <Button
                onClick={handleBroadcast}
                disabled={isBroadcasting || !selectedAudio || stats.validContactCount === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 text-base shadow-md transition-all duration-200 rounded-xl flex items-center justify-center gap-2 group"
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-1" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Dispatch Voice SMS ({stats.validContactCount})
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Interactive Pre-recorded Audio catalog */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-indigo-600" />
                  <CardTitle className="text-lg">Pre-recorded Script Catalog</CardTitle>
                </div>
                {activeAudioRegion && (
                  <Badge variant="outline" className="border-indigo-200 bg-indigo-50/50 text-indigo-700">
                    Scoped to {activeAudioRegion}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Select one of the validated audio recordings to link to the broadcast campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[640px] space-y-3 pr-2">
              {filteredAudioMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No scripts found mapping to the target region.
                </div>
              ) : (
                filteredAudioMessages.map((msg) => {
                  const isSelected = selectedAudioId === msg.id;
                  const isPlaying = playingAudioFile === msg.audioFile;

                  return (
                    <div
                      key={msg.id}
                      onClick={() => setSelectedAudioId(msg.id)}
                      className={`cursor-pointer border p-4 rounded-xl transition-all duration-200 relative group ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-1 ring-indigo-500'
                          : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="font-semibold text-xs text-slate-700 bg-slate-100">
                              {msg.topic}
                            </Badge>
                            <span className="text-xs font-semibold text-slate-400">Code: {msg.refCode}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{msg.region}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium pt-1">
                            "{msg.message}"
                          </p>
                        </div>

                        {/* Player preview button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation(); // prevent card selection
                            handlePlayAudio(msg.audioFile, msg.region);
                          }}
                          className={`rounded-full shrink-0 ${
                            isPlaying
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                          }`}
                        >
                          {isPlaying ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                        </Button>
                      </div>

                      {/* soundwave bar for specific items playing */}
                      {isPlaying && (
                        <div className="absolute bottom-2 right-4 flex items-end gap-0.5 h-4">
                          {visualizerBars.slice(0, 4).map((bar) => (
                            <div
                              key={bar}
                              className={`w-0.5 bg-rose-500 rounded-full animate-soundwave soundwave-bar-${bar}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* BOTTOM SECTION: Target Audience Details Table */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-indigo-600" />
                Target Audience Cohort Details ({filteredPatients.length})
              </CardTitle>
              <CardDescription>
                Complete list of patient records matching the active filters above.
              </CardDescription>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search patient name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Code</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead className="text-center">Age</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 bg-slate-100 rounded w-16" /></TableCell>
                      <TableCell><div className="h-4 bg-slate-100 rounded w-32" /></TableCell>
                      <TableCell><div className="h-4 bg-slate-100 rounded w-20" /></TableCell>
                      <TableCell><div className="h-4 bg-slate-100 rounded w-24" /></TableCell>
                      <TableCell className="text-center"><div className="h-4 bg-slate-100 rounded w-8 mx-auto" /></TableCell>
                      <TableCell><div className="h-4 bg-slate-100 rounded w-24" /></TableCell>
                      <TableCell className="text-center"><div className="h-4 bg-slate-100 rounded w-16 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No patients match the selected criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPatients.map((p) => {
                    const age = calculateAge(p.dob);
                    const hasContact = p.contact_number && p.contact_number.trim().length > 0;

                    return (
                      <TableRow key={p.patient_id} className="hover:bg-slate-50/50">
                        <TableCell className="font-semibold text-slate-800">
                          {p.patient_code || 'N/A'}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">
                          {p.name} {p.othernames || ''}
                        </TableCell>
                        <TableCell>{p.region || 'N/A'}</TableCell>
                        <TableCell>{p.district || 'N/A'}</TableCell>
                        <TableCell className="text-center">{age ?? 'N/A'}</TableCell>
                        <TableCell>
                          {hasContact ? (
                            <span className="flex items-center gap-1.5 font-medium text-slate-800">
                              <PhoneCall className="h-3 w-3 text-emerald-500" />
                              {p.contact_number}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-slate-400 italic">
                              <VolumeX className="h-3 w-3" />
                              None
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {hasContact ? (
                            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200">
                              Reachable
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-700 hover:bg-rose-50 border border-rose-200">
                              Unreachable
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Table Pagination controls */}
          {!loading && filteredPatients.length > pageSize && (
            <div className="flex justify-between items-center py-4 border-t border-slate-100 mt-4">
              <span className="text-xs text-slate-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length} entries
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((c) => c - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-600 font-medium px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((c) => c + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminMessaging;
