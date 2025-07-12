import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { useApi } from '@/lib/useApi';
import { Meeting, Account, Contact } from '@/types';
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2, Calendar, User, Clock } from 'lucide-react';
import { useToast } from '@/components/ui/toast/useToast';

const AppointmentsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [patients, setPatients] = useState<Account[]>([]);
  const [practitioners, setPractitioners] = useState<Contact[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formEditable, setFormEditable] = useState(false);
  const { request } = useApi();
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [meetingsResponse, patientsResponse, practitionersResponse] = await Promise.all([
        request<Meeting[]>({ path: '/meetings' }),
        request<Account[]>({ path: '/accounts' }),
        request<Contact[]>({ path: '/contacts' })
      ]);
      
      console.log('Meetings response:', meetingsResponse); // Debug log
      console.log('Sample meeting:', meetingsResponse?.[0]); // Debug log
      
      setMeetings(meetingsResponse);
      setPatients(patientsResponse);
      setPractitioners(practitionersResponse);
    } catch (error) {
      console.error("Failed to fetch appointments data", error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments data",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowForm(true);
    setFormEditable(true);
  };

  const handleDelete = async (meeting: Meeting) => {
    console.log('Delete meeting:', meeting); // Debug log
    console.log('Meeting ID:', meeting.meetingid); // Debug log
    console.log('All meeting keys:', Object.keys(meeting)); // Debug: see all available fields
    
    // Try different possible ID fields, with meetingid as primary
    const meetingId = meeting.meetingid || (meeting as any).meeting_id || (meeting as any).id;
    
    if (!meetingId) {
      toast({
        title: "Error",
        description: "Invalid meeting ID. Cannot delete appointment.",
        variant: "error",
      });
      return;
    }

    try {
      await request({ path: `/meetings/${meetingId}`, method: 'DELETE' });
      fetchData();
      toast({
        title: "Success",
        description: "Appointment deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete meeting", error);
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "error",
      });
    }
  };

  const handleFormSuccess = () => {
    fetchData();
    setShowForm(false);
    setSelectedMeeting(null);
  };

  const handleNewAppointment = () => {
    setSelectedMeeting(null);
    setShowForm(true);
    setFormEditable(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setSelectedMeeting(null);
    setFormEditable(false);
  };

  const findPatientName = (id: number) => {
    const patient = patients.find(p => (p.account_id === String(id)) || (p.user_id === id));
    return patient ? `${patient.firstname} ${patient.lastname}` : `ID: ${id}`;
  }

  const findPractitionerName = (id: number) => {
      const practitioner = practitioners.find(p => (p.contactid === id) || (p.ContactID === id));
      return practitioner ? (practitioner.name || practitioner.Name) : `ID: ${id}`;
  }

  const filteredMeetings = meetings.filter(meeting => {
    const term = searchTerm.toLowerCase();

    const patientName = findPatientName(meeting.patient_id)?.toLowerCase() || '';
    const practitionerName = findPractitionerName(Number(meeting.practitioner_id))?.toLowerCase() || '';
    const title = meeting.title?.toLowerCase() || '';
    const status = meeting.status?.toLowerCase() || '';
    const region = meeting.region?.toLowerCase() || '';
    const district = meeting.district?.toLowerCase() || '';

    return title.includes(term) || 
           patientName.includes(term) || 
           practitionerName.includes(term) ||
           status.includes(term) ||
           region.includes(term) ||
           district.includes(term);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Form */}
      <div className="w-1/2 p-6 bg-white border-r overflow-y-auto scrollbar-hide">
        {showForm ? (
          <AppointmentForm
            onSuccess={handleFormSuccess}
            meeting={selectedMeeting}
            onCancel={handleCancelForm}
            readOnly={!formEditable}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointment Selected</h3>
              <p className="text-gray-500 mb-4">Select an appointment to edit or create a new one</p>
              <Button onClick={handleNewAppointment}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Appointment
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Appointments List */}
      <div className="w-1/2 p-6 overflow-y-auto scrollbar-hide">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Appointments ({filteredMeetings.length})
              </CardTitle>
              <Button onClick={handleNewAppointment} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                New
              </Button>
            </div>
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-4"
            />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {filteredMeetings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments found
                </div>
              ) : (
                filteredMeetings.map((meeting) => {
                  // Get the actual ID field (try different possible names)
                  const meetingId = meeting.meetingid || (meeting as any).meeting_id || (meeting as any).id;

                  // Use patient_name if available, else lookup
                  const patientName = meeting.patient_name && meeting.patient_name.trim() !== ''
                    ? meeting.patient_name
                    : findPatientName(meeting.patient_id);

                  // Use practitioner if available, else lookup
                  const practitionerName = meeting.practitioner && meeting.practitioner.trim() !== ''
                    ? meeting.practitioner
                    : findPractitionerName(Number(meeting.practitioner_id));

                  // Format date and time
                  let dateStr = '';
                  let timeStr = '';
                  if (meeting.date) {
                    const d = new Date(meeting.date);
                    dateStr = isNaN(d.getTime()) ? '' : d.toLocaleDateString();
                  }
                  if (meeting.time) {
                    // meeting.time is "HH:mm:ss"; show as is or format
                    timeStr = meeting.time.length > 5 ? meeting.time.slice(0,5) : meeting.time;
                  }

                  return (
                    <div
                      key={meetingId || `meeting-${Math.random()}`}
                      className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedMeeting?.meetingid === meeting.meetingid || 
                        (selectedMeeting as any)?.meeting_id === (meeting as any).meeting_id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        setSelectedMeeting(meeting);
                        setShowForm(true);
                        setFormEditable(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{meeting.title}</h4>
                            <Badge
                              variant={
                                meeting.status === 'completed' ? 'default' :
                                meeting.status === 'cancelled' ? 'destructive' :
                                'secondary'
                              }
                              className="capitalize text-xs"
                            >
                              {meeting.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{practitionerName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{dateStr}</span>
                            </div>
                            {timeStr && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{timeStr}</span>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Patient: {patientName}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(meeting);
                            }}
                            disabled={formEditable && selectedMeeting?.meetingid === meeting.meetingid}
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(meeting);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={!meetingId}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsPage;
