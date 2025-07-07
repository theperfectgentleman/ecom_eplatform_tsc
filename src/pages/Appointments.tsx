import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import AppointmentForm from '@/components/appointments/AppointmentForm';
import { useApi } from '@/lib/useApi';
import { Meeting, Account, Contact } from '@/types';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AppointmentsPage: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [patients, setPatients] = useState<Account[]>([]);
  const [practitioners, setPractitioners] = useState<Contact[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { request } = useApi();

  const fetchData = async () => {
    try {
      const [meetingsResponse, patientsResponse, practitionersResponse] = await Promise.all([
        request<Meeting[]>({ path: '/meetings' }),
        request<Account[]>({ path: '/accounts' }),
        request<Contact[]>({ path: '/contacts' })
      ]);
      setMeetings(meetingsResponse);
      setPatients(patientsResponse);
      setPractitioners(practitionersResponse);
    } catch (error) {
      console.error("Failed to fetch appointments data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request({ path: `/meetings/${id}`, method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error("Failed to delete meeting", error);
    }
  };

  const handleFormSuccess = () => {
    fetchData();
    setIsFormOpen(false);
    setSelectedMeeting(null);
  };

  const findPatientName = (id: number) => {
    const patient = patients.find(p => p.account_id === String(id));
    return patient ? `${patient.firstname} ${patient.lastname}` : `ID: ${id}`;
  }

  const findPractitionerName = (id: number) => {
      const practitioner = practitioners.find(p => p.ContactID === id);
      return practitioner ? practitioner.Name : `ID: ${id}`;
  }

  const filteredMeetings = meetings.filter(meeting => {
    const term = searchTerm.toLowerCase();

    const patientName = findPatientName(meeting.patient_id)?.toLowerCase() || '';
    const practitionerName = findPractitionerName(meeting.practitioner_id)?.toLowerCase() || '';
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-4">
            <CardTitle>Appointments</CardTitle>
            <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
            />
        </div>
        <Button onClick={() => {
          setSelectedMeeting(null);
          setIsFormOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Appointment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Patient</TableHead>
                    <TableHead className="hidden md:table-cell">Practitioner</TableHead>
                    <TableHead className="hidden lg:table-cell">Start Time</TableHead>
                    <TableHead className="hidden lg:table-cell">End Time</TableHead>
                    <TableHead className="hidden sm:table-cell">Region</TableHead>
                    <TableHead className="hidden sm:table-cell">District</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredMeetings.map((meeting) => (
                    <TableRow key={meeting.meeting_id}>
                    <TableCell className="font-medium">{meeting.title}</TableCell>
                    <TableCell className="hidden md:table-cell">{findPatientName(meeting.patient_id)}</TableCell>
                    <TableCell className="hidden md:table-cell">{findPractitionerName(meeting.practitioner_id)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(meeting.start_time).toLocaleString()}</TableCell>
                    <TableCell className="hidden lg:table-cell">{new Date(meeting.end_time).toLocaleString()}</TableCell>
                    <TableCell className="hidden sm:table-cell">{meeting.region}</TableCell>
                    <TableCell className="hidden sm:table-cell">{meeting.district}</TableCell>
                    <TableCell>
                        <Badge 
                        variant={
                            meeting.status === 'completed' ? 'default' :
                            meeting.status === 'cancelled' ? 'destructive' :
                            'secondary'
                        }
                        className="capitalize"
                        >
                        {meeting.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                            <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(meeting)}
                            >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                            </Button>
                            <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(meeting.meeting_id)}
                            >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                            </Button>
                        </div>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
      </CardContent>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
                <DialogTitle>{selectedMeeting ? 'Edit' : 'Create'} Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentForm
                onSuccess={handleFormSuccess}
                meeting={selectedMeeting}
                onCancel={() => setIsFormOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AppointmentsPage;
