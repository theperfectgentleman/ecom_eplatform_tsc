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
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

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
    scheduledDate: "2024-10-21",
    recipientCount: 45,
  },
  {
    id: 2,
    refCode: "2003",
    topic: "Communication",
    region: "North East",
    message: "Prepare questions before your clinic visit. Don't be afraid to ask if you don't understand something.",
    audioFile: "2003.mp3",
    scheduledDate: "2024-10-22",
    recipientCount: 38,
  },
  {
    id: 3,
    refCode: "2004",
    topic: "Health insurance",
    region: "North East",
    message: "Have you registered for the National Health Insurance? Pregnant women can register for free and receive free care.",
    audioFile: "2004.mp3",
    scheduledDate: "2024-10-23",
    recipientCount: 52,
  },
  {
    id: 4,
    refCode: "2101",
    topic: "Work safety",
    region: "North East",
    message: "When working, take breaks every hour to rest and drink water. Avoid chemicals, heavy lifting, and standing too long.",
    audioFile: "2101.mp3",
    scheduledDate: "2024-10-24",
    recipientCount: 36,
  },
  {
    id: 5,
    refCode: "2102",
    topic: "Household management",
    region: "North East",
    message: "As your pregnancy advances, rearrange home duties. Ask family members to help with fetching water, washing clothes, and cooking.",
    audioFile: "2102.mp3",
    scheduledDate: "2024-10-25",
    recipientCount: 41,
  },
  {
    id: 6,
    refCode: "2103",
    topic: "Financial planning",
    region: "North East",
    message: "Babies bring joy and also new expenses. Start setting aside small amounts now for delivery related costs, baby clothes, and emergency transport.",
    audioFile: "2103.mp3",
    scheduledDate: "2024-10-26",
    recipientCount: 48,
  },
  {
    id: 7,
    refCode: "2104",
    topic: "Time management",
    region: "North East",
    message: "Planning your day can reduce stress. Spread your work in bits over the day so you do not get too tired.",
    audioFile: "2104.mp3",
    scheduledDate: "2024-10-27",
    recipientCount: 33,
  },
  {
    id: 8,
    refCode: "2201",
    topic: "Emergency contacts",
    region: "North East",
    message: "Save these important numbers in your phone: your midwife, local driver, nearest health facility, and a family emergency contact.",
    audioFile: "2201.mp3",
    scheduledDate: "2024-10-28",
    recipientCount: 44,
  },
  {
    id: 9,
    refCode: "2202",
    topic: "Health information",
    region: "North East",
    message: "Staying informed about your health is key to well-being. Reliable health information is available at your community health center.",
    audioFile: "2202.mp3",
    scheduledDate: "2024-10-29",
    recipientCount: 39,
  },
  {
    id: 10,
    refCode: "2203",
    topic: "Record keeping",
    region: "North East",
    message: "Keep all health cards, test results, and medicine instructions in one safe place at home, protected from water and children.",
    audioFile: "2203.mp3",
    scheduledDate: "2024-10-30",
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
    scheduledDate: "2024-10-21",
    recipientCount: 41,
  },
  {
    id: 12,
    refCode: "1102",
    topic: "Danger signs",
    region: "Upper West",
    message: "If you notice bleeding, severe headache, fever, baby not moving, or swelling in your face and hands, don't wait!",
    audioFile: "1102.mp3",
    scheduledDate: "2024-10-22",
    recipientCount: 47,
  },
  {
    id: 13,
    refCode: "1103",
    topic: "Malaria prevention",
    region: "Upper West",
    message: "Malaria is dangerous during pregnancy. Always sleep under a treated mosquito net every night.",
    audioFile: "1103.mp3",
    scheduledDate: "2024-10-23",
    recipientCount: 44,
  },
  {
    id: 14,
    refCode: "1104",
    topic: "Managing discomforts",
    region: "Upper West",
    message: "Feeling morning sickness? Try eating small amounts often instead of big meals. For backache, rest often and avoid heavy lifting.",
    audioFile: "1104.mp3",
    scheduledDate: "2024-10-24",
    recipientCount: 35,
  },
  {
    id: 15,
    refCode: "1201",
    topic: "Birth plan",
    region: "Upper West",
    message: "It's time to prepare for birth! Talk with your family about where you will deliver, how to get there, and who will accompany you.",
    audioFile: "1201.mp3",
    scheduledDate: "2024-10-25",
    recipientCount: 50,
  },
  {
    id: 16,
    refCode: "1202",
    topic: "Labor signs",
    region: "Upper West",
    message: "Soon you will meet your baby. Labor has started when you feel regular pains that get stronger, waters break, or you see mucus with blood.",
    audioFile: "1202.mp3",
    scheduledDate: "2024-10-26",
    recipientCount: 38,
  },
  {
    id: 17,
    refCode: "1204",
    topic: "Transport planning",
    region: "Upper West",
    message: "Have you arranged how to reach the health center when labor begins? Speak with a driver or neighbor with a vehicle now.",
    audioFile: "1204.mp3",
    scheduledDate: "2024-10-27",
    recipientCount: 46,
  },
  {
    id: 18,
    refCode: "1301",
    topic: "Local nutritious foods",
    region: "Upper West",
    message: "Your baby needs good food to grow strong. Try to eat kontomire, garden eggs, groundnuts, beans, and small fish daily.",
    audioFile: "1301.mp3",
    scheduledDate: "2024-10-28",
    recipientCount: 40,
  },
  {
    id: 19,
    refCode: "1302",
    topic: "Iron-rich foods",
    region: "Upper West",
    message: "To prevent anemia and ensure a healthy pregnancy, eat dark green vegetables, beans and fruits. Also add meat or fish to your meals daily.",
    audioFile: "1302.mp3",
    scheduledDate: "2024-10-29",
    recipientCount: 43,
  },
  {
    id: 20,
    refCode: "1404",
    topic: "Managing Emotions",
    region: "Upper West",
    message: "During pregnancy, it's important to take care of your emotional well-being. Make time for activities that help you relax.",
    audioFile: "1404.mp3",
    scheduledDate: "2024-10-30",
    recipientCount: 37,
  },
];

// Generate mock dates from Sept 1 to Oct 15 with 3-4 day intervals
const generateDatesList = () => {
  const dates: string[] = [];
  const startDate = new Date("2024-09-01");
  const endDate = new Date("2024-10-15");
  
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    // Add 3 or 4 days randomly
    const daysToAdd = Math.random() > 0.5 ? 3 : 4;
    currentDate.setDate(currentDate.getDate() + daysToAdd);
  }
  
  return dates;
};

// Generate mock call results for a date with varying sample sizes
// Includes 4 outliers with higher success rates (15-28%)
const generateCallResults = (dateIndex: number, totalDates: number) => {
  let total: number;
  
  // First 3 data points: under 40
  if (dateIndex < 3) {
    total = Math.floor(Math.random() * 10) + 30; // 30-39
  } 
  // Gradually increase to around 200
  else {
    const progress = (dateIndex - 2) / (totalDates - 2); // 0 to 1
    const minSize = 40;
    const maxSize = 200;
    const targetSize = minSize + (progress * (maxSize - minSize));
    // Add some randomness
    total = Math.floor(targetSize + (Math.random() * 30 - 15));
    total = Math.max(40, Math.min(220, total)); // Clamp between 40 and 220
  }
  
  // Define outlier dates (4 outliers)
  // Outliers at indices: 1, 2, 4, 6
  // Higher success rates for lower sample sizes
  const outlierIndices = [1, 2, 4, 6];
  const isOutlier = outlierIndices.includes(dateIndex);
  
  let successRate: number;
  
  if (isOutlier) {
    // Outliers get 15-28% success rate
    // Earlier dates (smaller samples) get higher success rates
    if (dateIndex <= 2) {
      // First outliers: 22-28%
      successRate = 0.22 + Math.random() * 0.06;
    } else if (dateIndex <= 4) {
      // Mid outliers: 18-23%
      successRate = 0.18 + Math.random() * 0.05;
    } else {
      // Later outliers: 15-19%
      successRate = 0.15 + Math.random() * 0.04;
    }
  } else {
    // Normal success rate: 8-12%
    successRate = 0.08 + Math.random() * 0.04;
  }
  
  const success = Math.round(total * successRate);
  const failed = total - success;
  
  return {
    success,
    failed,
    total,
    successRate: (successRate * 100).toFixed(1),
    isOutlier, // Flag for potential highlighting in UI
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
  
  const callData = useMemo(() => {
    if (!selectedDate) return null;
    const dateIndex = datesList.indexOf(selectedDate);
    return generateCallResults(dateIndex, datesList.length);
  }, [selectedDate, datesList]);

  const pieData = useMemo(() => {
    if (!callData) return [];
    return [
      { name: "Success", value: callData.success, percentage: callData.successRate },
      { name: "Failed", value: callData.failed, percentage: (100 - parseFloat(callData.successRate)).toFixed(1) },
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
          {userLocation.region && ` Showing data for ${userLocation.region}.`}
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
            Historical voice message delivery success rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      Total Calls: {callData.total} • Success Rate: {callData.successRate}%
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
                            {callData.successRate}%
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
                            {(100 - parseFloat(callData.successRate)).toFixed(1)}%
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsMessaging;
