import { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play, Square, Volume2, Calendar } from "lucide-react";
import { useAccessLevelFilter } from "@/hooks/useAccessLevelFilter";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

// Mock data for voice messages - All 10 messages per region
const mockVoiceMessages = [
  // North East Region (10 messages)
  {
    id: 1,
    refCode: "2002",
    topic: "Documents",
    region: "North East",
    message: "Always carry your maternal health card to every visit. This card holds important information about you and your baby.",
    audioFile: "2002.mp3",
    scheduledDate: "2026-04-01",
    recipientCount: 45,
  },
  {
    id: 2,
    refCode: "2003",
    topic: "Communication",
    region: "North East",
    message: "Prepare questions before your clinic visit. Don't be afraid to ask if you don't understand something.",
    audioFile: "2003.mp3",
    scheduledDate: "2026-04-02",
    recipientCount: 38,
  },
  {
    id: 3,
    refCode: "2004",
    topic: "Health insurance",
    region: "North East",
    message: "Have you registered for the National Health Insurance? Pregnant women can register for free and receive free care.",
    audioFile: "2004.mp3",
    scheduledDate: "2026-04-03",
    recipientCount: 52,
  },
  {
    id: 4,
    refCode: "2101",
    topic: "Work safety",
    region: "North East",
    message: "When working, take breaks every hour to rest and drink water. Avoid chemicals, heavy lifting, and standing too long.",
    audioFile: "2101.mp3",
    scheduledDate: "2026-04-04",
    recipientCount: 36,
  },
  {
    id: 5,
    refCode: "2102",
    topic: "Household management",
    region: "North East",
    message: "As your pregnancy advances, rearrange home duties. Ask family members to help with fetching water, washing clothes, and cooking.",
    audioFile: "2102.mp3",
    scheduledDate: "2026-04-05",
    recipientCount: 41,
  },
  {
    id: 6,
    refCode: "2103",
    topic: "Financial planning",
    region: "North East",
    message: "Babies bring joy and also new expenses. Start setting aside small amounts now for delivery related costs, baby clothes, and emergency transport.",
    audioFile: "2103.mp3",
    scheduledDate: "2026-04-06",
    recipientCount: 48,
  },
  {
    id: 7,
    refCode: "2104",
    topic: "Time management",
    region: "North East",
    message: "Planning your day can reduce stress. Spread your work in bits over the day so you do not get too tired.",
    audioFile: "2104.mp3",
    scheduledDate: "2026-04-07",
    recipientCount: 33,
  },
  {
    id: 8,
    refCode: "2201",
    topic: "Emergency contacts",
    region: "North East",
    message: "Save these important numbers in your phone: your midwife, local driver, nearest health facility, and a family emergency contact.",
    audioFile: "2201.mp3",
    scheduledDate: "2026-04-08",
    recipientCount: 44,
  },
  {
    id: 9,
    refCode: "2202",
    topic: "Health information",
    region: "North East",
    message: "Staying informed about your health is key to well-being. Reliable health information is available at your community health center.",
    audioFile: "2202.mp3",
    scheduledDate: "2026-04-09",
    recipientCount: 39,
  },
  {
    id: 10,
    refCode: "2203",
    topic: "Record keeping",
    region: "North East",
    message: "Keep all health cards, test results, and medicine instructions in one safe place at home, protected from water and children.",
    audioFile: "2203.mp3",
    scheduledDate: "2026-04-10",
    recipientCount: 42,
  },
  // Upper West Region (10 messages)
  {
    id: 11,
    refCode: "1101",
    topic: "Regular checkups",
    region: "Upper West",
    message: "Your baby is growing each day! Remember to visit the health center at your appointment times.",
    audioFile: "1101.mp3",
    scheduledDate: "2026-04-01",
    recipientCount: 41,
  },
  {
    id: 12,
    refCode: "1102",
    topic: "Danger signs",
    region: "Upper West",
    message: "If you notice bleeding, severe headache, fever, baby not moving, or swelling in your face and hands, don't wait!",
    audioFile: "1102.mp3",
    scheduledDate: "2026-04-02",
    recipientCount: 47,
  },
  {
    id: 13,
    refCode: "1103",
    topic: "Malaria prevention",
    region: "Upper West",
    message: "Malaria is dangerous during pregnancy. Always sleep under a treated mosquito net every night.",
    audioFile: "1103.mp3",
    scheduledDate: "2026-04-03",
    recipientCount: 44,
  },
  {
    id: 14,
    refCode: "1104",
    topic: "Managing discomforts",
    region: "Upper West",
    message: "Feeling morning sickness? Try eating small amounts often instead of big meals. For backache, rest often and avoid heavy lifting.",
    audioFile: "1104.mp3",
    scheduledDate: "2026-04-04",
    recipientCount: 35,
  },
  {
    id: 15,
    refCode: "1201",
    topic: "Birth plan",
    region: "Upper West",
    message: "It's time to prepare for birth! Talk with your family about where you will deliver, how to get there, and who will accompany you.",
    audioFile: "1201.mp3",
    scheduledDate: "2026-04-05",
    recipientCount: 50,
  },
  {
    id: 16,
    refCode: "1202",
    topic: "Labor signs",
    region: "Upper West",
    message: "Soon you will meet your baby. Labor has started when you feel regular pains that get stronger, waters break, or you see mucus with blood.",
    audioFile: "1202.mp3",
    scheduledDate: "2026-04-06",
    recipientCount: 38,
  },
  {
    id: 17,
    refCode: "1204",
    topic: "Transport planning",
    region: "Upper West",
    message: "Have you arranged how to reach the health center when labor begins? Speak with a driver or neighbor with a vehicle now.",
    audioFile: "1204.mp3",
    scheduledDate: "2026-04-07",
    recipientCount: 46,
  },
  {
    id: 18,
    refCode: "1301",
    topic: "Local nutritious foods",
    region: "Upper West",
    message: "Your baby needs good food to grow strong. Try to eat kontomire, garden eggs, groundnuts, beans, and small fish daily.",
    audioFile: "1301.mp3",
    scheduledDate: "2026-04-08",
    recipientCount: 40,
  },
  {
    id: 19,
    refCode: "1302",
    topic: "Iron-rich foods",
    region: "Upper West",
    message: "To prevent anemia and ensure a healthy pregnancy, eat dark green vegetables, beans and fruits. Also add meat or fish to your meals daily.",
    audioFile: "1302.mp3",
    scheduledDate: "2026-04-09",
    recipientCount: 43,
  },
  {
    id: 20,
    refCode: "1404",
    topic: "Managing Emotions",
    region: "Upper West",
    message: "During pregnancy, it's important to take care of your emotional well-being. Make time for activities that help you relax.",
    audioFile: "1404.mp3",
    scheduledDate: "2026-04-10",
    recipientCount: 37,
  },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const DISTRICT_PROFILES = [
  {
    region: "North East",
    district: "Mamprugu Moagduri",
    volumeFactor: 1.12,
    rateShift: 0.016,
    phase: 0.25,
    pulseSpacing: 10,
    pulseIndex: 3,
    dipSpacing: 17,
    dipIndex: 6,
  },
  {
    region: "North East",
    district: "East Mamprusi",
    volumeFactor: 0.98,
    rateShift: 0.006,
    phase: 0.9,
    pulseSpacing: 11,
    pulseIndex: 5,
    dipSpacing: 15,
    dipIndex: 7,
  },
  {
    region: "North East",
    district: "West Mamprusi",
    volumeFactor: 0.9,
    rateShift: -0.004,
    phase: 1.45,
    pulseSpacing: 9,
    pulseIndex: 4,
    dipSpacing: 14,
    dipIndex: 8,
  },
  {
    region: "North East",
    district: "Yunyoo-Nasuan",
    volumeFactor: 0.82,
    rateShift: -0.011,
    phase: 2.1,
    pulseSpacing: 12,
    pulseIndex: 2,
    dipSpacing: 16,
    dipIndex: 5,
  },
  {
    region: "Upper West",
    district: "Wa West",
    volumeFactor: 1.08,
    rateShift: 0.018,
    phase: 0.55,
    pulseSpacing: 10,
    pulseIndex: 4,
    dipSpacing: 15,
    dipIndex: 9,
  },
  {
    region: "Upper West",
    district: "Wa Municipal",
    volumeFactor: 1.02,
    rateShift: 0.009,
    phase: 1.2,
    pulseSpacing: 11,
    pulseIndex: 6,
    dipSpacing: 14,
    dipIndex: 4,
  },
  {
    region: "Upper West",
    district: "Nadowli-Kaleo",
    volumeFactor: 0.92,
    rateShift: -0.002,
    phase: 1.85,
    pulseSpacing: 9,
    pulseIndex: 1,
    dipSpacing: 13,
    dipIndex: 6,
  },
  {
    region: "Upper West",
    district: "Jirapa",
    volumeFactor: 0.86,
    rateShift: -0.008,
    phase: 2.35,
    pulseSpacing: 12,
    pulseIndex: 7,
    dipSpacing: 16,
    dipIndex: 3,
  },
] as const;

// Generate mock dates from Oct 1, 2025 to Apr 10, 2026 with the same 3-4 day cadence.
const generateDatesList = () => {
  const dates: string[] = [];
  const startDate = new Date("2025-10-01");
  const endDate = new Date("2026-04-10");
  const intervalPattern = [3, 4, 3, 4, 4, 3];
  
  let currentDate = new Date(startDate);
  let intervalIndex = 0;
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    const daysToAdd = intervalPattern[intervalIndex % intervalPattern.length];
    intervalIndex += 1;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
  }
  
  return dates;
};

const getDeliveryConditionAdjustments = (
  dateLabel: string,
  dateIndex: number,
  progress: number,
  profile: (typeof DISTRICT_PROFILES)[number]
) => {
  const date = new Date(dateLabel);
  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  const monthAdjustmentMap: Record<string, number> = {
    "2025-10": 0.013,
    "2025-11": -0.021,
    "2025-12": -0.01,
    "2026-01": 0.001,
    "2026-02": -0.024,
    "2026-03": -0.009,
    "2026-04": 0.003,
  };

  const weekBand = Math.min(4, Math.floor((date.getDate() - 1) / 7));
  const weekBandAdjustments = [0.005, -0.004, 0.002, -0.006, 0.003];
  const weekBandAdjustment = weekBandAdjustments[weekBand] ?? 0;
  const districtResilience = ((profile.volumeFactor - 1) * 0.028) + (profile.rateShift * 0.16);

  let lateStageDrag = 0;
  if (progress >= 0.7 && progress < 0.86) lateStageDrag = -0.011;
  if (progress >= 0.86 && progress < 0.94) lateStageDrag = -0.006;

  const reviewCycleEffect = dateIndex % 8 === 3
    ? -0.006
    : dateIndex % 8 === 6
      ? 0.004
      : 0;

  return {
    monthAdjustment: (monthAdjustmentMap[monthKey] ?? 0) + districtResilience,
    weekBandAdjustment,
    lateStageDrag,
    reviewCycleEffect,
  };
};

// Generate mock district-level call results with improving but uneven success rates.
// Aggregating these district series yields the overall SMS delivery trend.
const generateDistrictCallResults = (
  dateLabel: string,
  dateIndex: number,
  totalDates: number,
  profile: (typeof DISTRICT_PROFILES)[number]
) => {
  const progress = totalDates <= 1 ? 1 : dateIndex / (totalDates - 1);
  const earlyVolumeCap = 10 + (profile.volumeFactor * 4);
  const matureVolumeCap = 34 + (profile.volumeFactor * 22);
  const growthCurve = Math.pow(progress, 0.88);
  const waveOne = Math.sin((dateIndex * 0.48) + profile.phase) * 3;
  const waveTwo = Math.cos((dateIndex * 0.17) + profile.phase) * 4;
  const campaignPulse = dateIndex % profile.pulseSpacing === profile.pulseIndex
    ? 4
    : dateIndex % profile.dipSpacing === profile.dipIndex
      ? -3
      : 0;
  let total: number;
  
  // Each district starts with smaller delivery counts and matures over time.
  if (dateIndex < 4) {
    total = Math.round(8 + (dateIndex * 2.5) + (profile.volumeFactor * 3));
  }
  else {
    const targetSize = earlyVolumeCap + (growthCurve * (matureVolumeCap - earlyVolumeCap));
    total = Math.round(targetSize + waveOne + waveTwo + campaignPulse);
    total = clamp(total, 9, 92);
  }
  
  const baselineRate = 0.108 + (Math.pow(progress, 1.17) * 0.196);
  const waveAdjustment = Math.sin((dateIndex * 0.44) + profile.phase) * 0.021 + Math.cos((dateIndex * 0.19) + profile.phase) * 0.012;
  const campaignAdjustment = dateIndex % profile.pulseSpacing === profile.pulseIndex
    ? 0.013
    : dateIndex % profile.dipSpacing === profile.dipIndex
      ? -0.011
      : 0;

  let phaseAdjustment = 0;
  if (progress > 0.1 && progress < 0.2) phaseAdjustment = 0.009;
  if (progress >= 0.2 && progress < 0.34) phaseAdjustment = -0.011;
  if (progress >= 0.34 && progress < 0.48) phaseAdjustment = 0.006;
  if (progress >= 0.48 && progress < 0.62) phaseAdjustment = -0.014;
  if (progress >= 0.62 && progress < 0.76) phaseAdjustment = 0.01;
  if (progress >= 0.76 && progress < 0.9) phaseAdjustment = -0.008;
  if (progress >= 0.9) phaseAdjustment = 0.014;

  const operationalShock = (() => {
    const cycle = dateIndex % 9;

    if (progress < 0.16) return cycle === 2 ? -0.006 : 0;
    if (progress < 0.33) return cycle === 4 ? -0.013 : cycle === 6 ? 0.006 : 0;
    if (progress < 0.55) return cycle === 1 ? 0.007 : cycle === 5 ? -0.01 : 0;
    if (progress < 0.75) return cycle === 3 ? -0.015 : cycle === 7 ? 0.008 : 0;
    if (progress < 0.92) return cycle === 0 ? 0.006 : cycle === 5 ? -0.012 : 0;
    return cycle === 6 ? -0.007 : 0.005;
  })();

  const {
    monthAdjustment,
    weekBandAdjustment,
    lateStageDrag,
    reviewCycleEffect,
  } = getDeliveryConditionAdjustments(dateLabel, dateIndex, progress, profile);

  let successRate = baselineRate
    + waveAdjustment
    + campaignAdjustment
    + phaseAdjustment
    + operationalShock
    + monthAdjustment
    + weekBandAdjustment
    + lateStageDrag
    + reviewCycleEffect
    + profile.rateShift;
  successRate = clamp(successRate, 0.09, 0.366);

  if (progress > 0.96) {
    successRate = clamp(0.319 + (profile.rateShift * 0.5) + ((progress - 0.96) / 0.04) * 0.011, 0.296, 0.349);
  }
  
  const success = Math.round(total * successRate);
  const failed = total - success;
  
  return {
    region: profile.region,
    district: profile.district,
    success,
    failed,
    total,
    successRate: (successRate * 100).toFixed(1),
  };
};

const COLORS = {
  success: "#10b981",
  failed: "#ef4444",
};

const ReportsMessaging = () => {
  const { userLocation } = useAccessLevelFilter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const datesList = useMemo(() => generateDatesList(), []);
  const visibleDistrictProfiles = useMemo(() => {
    if (userLocation.district) {
      return DISTRICT_PROFILES.filter((profile) => profile.district === userLocation.district);
    }

    if (userLocation.region) {
      return DISTRICT_PROFILES.filter((profile) => profile.region === userLocation.region);
    }

    return DISTRICT_PROFILES;
  }, [userLocation.district, userLocation.region]);

  const districtDeliveryTrendData = useMemo(() => {
    return datesList.flatMap((date, index) => (
      visibleDistrictProfiles.map((profile) => {
        const result = generateDistrictCallResults(date, index, datesList.length, profile);
        return {
          date,
          region: result.region,
          district: result.district,
          success: result.success,
          failed: result.failed,
          total: result.total,
          successRate: Number(result.successRate),
        };
      })
    ));
  }, [datesList, visibleDistrictProfiles]);

  const deliveryTrendData = useMemo(() => {
    const dateMap = new Map<string, {
      date: string;
      success: number;
      failed: number;
      total: number;
    }>();

    districtDeliveryTrendData.forEach((item) => {
      const existing = dateMap.get(item.date);
      if (existing) {
        existing.success += item.success;
        existing.failed += item.failed;
        existing.total += item.total;
        return;
      }

      dateMap.set(item.date, {
        date: item.date,
        success: item.success,
        failed: item.failed,
        total: item.total,
      });
    });

    return Array.from(dateMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((item) => ({
        ...item,
        successRate: Number(((item.success / item.total) * 100).toFixed(1)),
      }));
  }, [districtDeliveryTrendData]);
  const monthlyRollupData = useMemo(() => {
    const monthMap = new Map<string, {
      monthKey: string;
      monthLabel: string;
      success: number;
      failed: number;
      total: number;
      campaigns: number;
    }>();

    deliveryTrendData.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);

      const existing = monthMap.get(monthKey);
      if (existing) {
        existing.success += item.success;
        existing.failed += item.failed;
        existing.total += item.total;
        existing.campaigns += 1;
        return;
      }

      monthMap.set(monthKey, {
        monthKey,
        monthLabel,
        success: item.success,
        failed: item.failed,
        total: item.total,
        campaigns: 1,
      });
    });

    return Array.from(monthMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map((item) => ({
        ...item,
        successRate: Number(((item.success / item.total) * 100).toFixed(1)),
      }));
  }, [deliveryTrendData]);
  
  const callData = useMemo(() => {
    if (!selectedDate) return null;
    return deliveryTrendData.find((item) => item.date === selectedDate) ?? null;
  }, [selectedDate, deliveryTrendData]);

  const latestTrendPoint = deliveryTrendData[deliveryTrendData.length - 1] ?? null;
  const baselineTrendPoint = deliveryTrendData[0] ?? null;
  const districtTrendChart = useMemo(() => {
    const latestDate = deliveryTrendData[deliveryTrendData.length - 1]?.date;
    if (!latestDate) {
      return { data: [], series: [] as string[] };
    }

    const latestDistricts = districtDeliveryTrendData
      .filter((item) => item.date === latestDate)
      .sort((a, b) => b.total - a.total)
      .slice(0, userLocation.district ? 1 : userLocation.region ? 4 : 5);

    const topDistrictSet = new Set(latestDistricts.map((item) => `${item.region}::${item.district}`));
    const seriesMap = new Map<string, string>();
    const monthMap = new Map<string, Record<string, string | number>>();

    districtDeliveryTrendData.forEach((item) => {
      const seriesKey = `${item.region}::${item.district}`;
      if (!topDistrictSet.has(seriesKey)) return;

      const seriesLabel = userLocation.region || userLocation.district
        ? item.district
        : `${item.district} (${item.region})`;
      seriesMap.set(seriesKey, seriesLabel);

      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);
      const monthEntry = monthMap.get(monthKey) || { month: monthLabel };

      const currentSuccess = Number(monthEntry[`${seriesLabel}_success`] || 0);
      const currentTotal = Number(monthEntry[`${seriesLabel}_total`] || 0);
      monthEntry[`${seriesLabel}_success`] = currentSuccess + item.success;
      monthEntry[`${seriesLabel}_total`] = currentTotal + item.total;
      monthMap.set(monthKey, monthEntry);
    });

    const data = Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, value]) => {
        const row = { month: value.month as string } as Record<string, string | number>;
        Array.from(seriesMap.values()).forEach((label) => {
          const success = Number(value[`${label}_success`] || 0);
          const total = Number(value[`${label}_total`] || 0);
          row[label] = total === 0 ? 0 : Number(((success / total) * 100).toFixed(1));
        });
        return row;
      });

    return {
      data,
      series: Array.from(seriesMap.values()),
    };
  }, [deliveryTrendData, districtDeliveryTrendData, userLocation.district, userLocation.region]);
  const latestMonthRollup = monthlyRollupData[monthlyRollupData.length - 1] ?? null;
  const firstMonthRollup = monthlyRollupData[0] ?? null;
  const bestMonthRollup = monthlyRollupData.reduce((best, current) => {
    if (!best || current.successRate > best.successRate) return current;
    return best;
  }, null as (typeof monthlyRollupData)[number] | null);

  const pieData = useMemo(() => {
    if (!callData) return [];
    return [
      { name: "Success", value: callData.success, percentage: callData.successRate.toFixed(1) },
      { name: "Failed", value: callData.failed, percentage: (100 - callData.successRate).toFixed(1) },
    ];
  }, [callData]);

  // Filter messages by user's region
  const filteredMessages = useMemo(() => {
    if (!userLocation.region) return mockVoiceMessages;
    return mockVoiceMessages.filter(msg => msg.region === userLocation.region);
  }, [userLocation.region]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedDate && datesList.length > 0) {
      setSelectedDate(datesList[datesList.length - 1]);
    }
  }, [datesList, selectedDate]);

  const handlePlayAudio = (audioFile: string, region: string) => {
    // If same audio is playing, do nothing (stop button will handle it)
    if (playingAudio === audioFile && audioRef.current) {
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const regionFolder = region === "North East" ? "east" : "west";
    const audioPath = `/src/assets/audio/${regionFolder}/${audioFile}`;
    
    const audio = new Audio(audioPath);
    audioRef.current = audio;
    
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      setPlayingAudio(null);
    });
    
    setPlayingAudio(audioFile);
    audio.onended = () => {
      setPlayingAudio(null);
      audioRef.current = null;
    };
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingAudio(null);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Count: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Volume2 className="h-4 w-4" />
          <span>Voice SMS Reports</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Messaging Analytics</h1>
        <p className="text-muted-foreground">
          Track scheduled voice messages and their delivery success rates across regions.
          {userLocation.district
            ? ` Showing data for ${userLocation.district} District.`
            : userLocation.region
              ? ` Showing data for ${userLocation.region}.`
              : ''}
        </p>
      </div>

      {/* Scheduled Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Messages for the Week</CardTitle>
          <CardDescription>
            Upcoming voice SMS messages scheduled for delivery to patients in your region
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ref Code</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="w-[400px]">Message</TableHead>
                <TableHead className="text-center">Recipients</TableHead>
                <TableHead className="text-center">Scheduled</TableHead>
                <TableHead className="text-center">Audio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-mono text-xs">{message.refCode}</TableCell>
                  <TableCell className="font-medium">{message.topic}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{message.region}</TableCell>
                  <TableCell className="text-sm">{message.message}</TableCell>
                  <TableCell className="text-center font-semibold">{message.recipientCount}</TableCell>
                  <TableCell className="text-center text-sm">{formatDate(message.scheduledDate)}</TableCell>
                  <TableCell className="text-center">
                    {playingAudio === message.audioFile ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleStopAudio}
                        className="inline-flex items-center gap-1"
                      >
                        <Square className="h-3 w-3" />
                        <span className="text-xs">Stop</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePlayAudio(message.audioFile, message.region)}
                        className="inline-flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        <span className="text-xs">Play</span>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Call Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Call Delivery Analytics</CardTitle>
          <CardDescription>
            Historical voice message delivery success rates across the full reporting window
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="rounded-lg border p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Monthly Rollup</h3>
                  <p className="text-sm text-muted-foreground">Monthly view of delivery performance for easier executive reporting.</p>
                </div>
                {firstMonthRollup && latestMonthRollup && (
                  <div className="text-sm text-muted-foreground">
                    {firstMonthRollup.monthLabel}: {firstMonthRollup.successRate.toFixed(1)}% to {latestMonthRollup.monthLabel}: {latestMonthRollup.successRate.toFixed(1)}%
                  </div>
                )}
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyRollupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="monthLabel" minTickGap={24} />
                  <YAxis domain={[0, 40]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "Monthly Success Rate") return [`${Number(value).toFixed(1)}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(value, payload) => {
                      const point = payload?.[0]?.payload;
                      if (!point) return value;
                      return `${value} • ${point.success}/${point.total} successful deliveries across ${point.campaigns} runs`;
                    }}
                  />
                  <Line type="linear" dataKey="successRate" name="Monthly Success Rate" stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="text-sm text-muted-foreground">Latest Month</div>
                  <div className="mt-2 text-2xl font-semibold">{latestMonthRollup?.successRate.toFixed(1) ?? "0.0"}%</div>
                  <div className="mt-1 text-xs text-muted-foreground">{latestMonthRollup?.monthLabel ?? "No data"}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="text-sm text-muted-foreground">Best Month</div>
                  <div className="mt-2 text-2xl font-semibold">{bestMonthRollup?.successRate.toFixed(1) ?? "0.0"}%</div>
                  <div className="mt-1 text-xs text-muted-foreground">{bestMonthRollup?.monthLabel ?? "No data"}</div>
                </div>
                <div className="rounded-lg border bg-slate-50 p-4">
                  <div className="text-sm text-muted-foreground">Latest Monthly Volume</div>
                  <div className="mt-2 text-2xl font-semibold">{latestMonthRollup?.total.toLocaleString() ?? "0"}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Total deliveries</div>
                </div>
              </div>
            </div>

            {districtTrendChart.series.length > 0 && districtTrendChart.data.length > 0 && (
              <div className="rounded-lg border p-4">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold">District Delivery Trends</h3>
                    <p className="text-sm text-muted-foreground">
                      Monthly SMS delivery success-rate trend for the top districts in the current scope.
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {userLocation.district
                      ? 'Single district view'
                      : userLocation.region
                        ? 'Top districts in selected region'
                        : 'Top districts nationally'}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={districtTrendChart.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" minTickGap={24} />
                    <YAxis domain={[0, 40]} tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: number, name: string) => [`${Number(value).toFixed(1)}%`, name]} />
                    <Legend />
                    {districtTrendChart.series.map((seriesName, index) => (
                      <Line
                        key={seriesName}
                        type="monotone"
                        dataKey={seriesName}
                        stroke={["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"][index % 5]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="rounded-lg border p-4">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h3 className="text-base font-semibold">Delivery Success Trend</h3>
                  <p className="text-sm text-muted-foreground">Gradual improvement in delivery performance from Oct 2025 to Apr 10, 2026.</p>
                </div>
                {latestTrendPoint && baselineTrendPoint && (
                  <div className="text-sm text-muted-foreground">
                    {baselineTrendPoint.successRate.toFixed(1)}% to {latestTrendPoint.successRate.toFixed(1)}% success rate
                  </div>
                )}
              </div>

              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={deliveryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    minTickGap={40}
                    tickFormatter={(value) => new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" }).format(new Date(value))}
                  />
                  <YAxis domain={[0, 40]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip
                    formatter={(value: number, name: string) => {
                      if (name === "Success Rate") return [`${Number(value).toFixed(1)}%`, name];
                      return [value, name];
                    }}
                    labelFormatter={(value) => formatDate(value as string)}
                  />
                  <Line type="linear" dataKey="successRate" name="Success Rate" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Date Selection */}
            <div className="lg:col-span-1">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Select Date
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {datesList.map((date) => {
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                        selectedDate === date
                          ? "bg-primary text-primary-foreground font-medium"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      {formatDate(date)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pie Chart */}
            <div className="lg:col-span-2">
              {selectedDate && callData ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold">
                      Results for {formatDate(selectedDate)}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Total Calls: {callData.total} • Success Rate: {callData.successRate.toFixed(1)}%
                    </p>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.name === "Success" ? COLORS.success : COLORS.failed}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600">
                            {callData.success}
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            Successful Deliveries
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {callData.successRate.toFixed(1)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-red-600">
                            {callData.failed}
                          </div>
                          <div className="text-sm text-red-700 mt-1">
                            Failed Deliveries
                          </div>
                          <div className="text-xs text-red-600 mt-1">
                            {(100 - callData.successRate).toFixed(1)}%
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a date to view call delivery analytics</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsMessaging;
