import React from 'react';
import { PatientSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Phone, 
  Eye,
  AlertTriangle
} from 'lucide-react';

interface PatientSnapshotCardProps {
  patient: PatientSummary;
  onViewDetails?: (patient: PatientSummary) => void;
}

const PatientSnapshotCard: React.FC<PatientSnapshotCardProps> = ({ 
  patient, 
  onViewDetails
}) => {
  // Calculate age from date of birth
  const calculateAge = (dob?: string): number | null => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date to readable format
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get priority styling - simplified with subtle colors
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'overdue':
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          border: 'border-l-red-400 border-l-4',
          text: 'text-red-700'
        };
      case 'due_soon':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          border: 'border-l-amber-400 border-l-4',
          text: 'text-amber-700'
        };
      case 'on_track':
        return {
          badge: 'bg-green-100 text-green-700 border-green-200',
          border: 'border-l-green-400 border-l-4',
          text: 'text-green-700'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          border: 'border-l-gray-300 border-l-4',
          text: 'text-gray-700'
        };
    }
  };

  const priorityStyles = getPriorityStyles(patient.priority_status);
  const age = calculateAge(patient.dob);

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 shadow-sm ${priorityStyles.border}`}>
      <CardContent className="p-5">
        {/* Header - Patient Info - Fixed Height */}
        <div className="mb-4">
          {/* Badge at top right */}
          <div className="flex justify-end mb-3">
            <Badge className={priorityStyles.badge}>
              {patient.priority_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          
          {/* Patient Name - Full Width with 2 line support and fixed height */}
          <div className="flex items-start gap-2 mb-3 min-h-[3.5rem]">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
              {patient.name}
            </h3>
          </div>
          
          {/* Other Names - Fixed Height Container */}
          <div className="h-5 mb-2">
            {patient.othernames && (
              <p className="text-sm text-gray-600 ml-6">{patient.othernames}</p>
            )}
          </div>
          
          {/* Age and ID - Fixed Position */}
          <div className="flex items-center gap-3 text-sm text-gray-500 ml-6">
            {age && <span>{age} years</span>}
            {patient.patient_code && <span>ID: {patient.patient_code}</span>}
          </div>
        </div>

        {/* Contact Info - Always show with fixed height */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 h-5">
          <Phone className="h-4 w-4 text-gray-400" />
          <span>{patient.contact_number || 'No phone number'}</span>
        </div>

        {/* Status Grid - Consistent Layout with Fixed Height */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          {/* ANC Status */}
          <div className="bg-gray-50 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="text-xs font-medium text-gray-700 mb-1">ANC</div>
            <div className={`text-sm font-semibold ${patient.anc_registered ? 'text-green-600' : 'text-gray-500'}`}>
              {patient.anc_registered ? 'Yes' : 'No'}
            </div>
          </div>
          
          {/* Total Visits */}
          <div className="bg-gray-50 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="text-xs font-medium text-gray-700 mb-1">Visits</div>
            <div className="text-sm font-semibold text-blue-600">{patient.total_visits}</div>
          </div>
          
          {/* Last Visit */}
          <div className="bg-gray-50 rounded-lg p-2 h-16 flex flex-col justify-center">
            <div className="text-xs font-medium text-gray-700 mb-1">Last</div>
            <div className="text-xs text-gray-600">
              {patient.last_visit_date ? formatDate(patient.last_visit_date) : 'None'}
            </div>
          </div>
        </div>

        {/* Priority/Next Visit Section - Fixed Height for All Cards */}
        <div className="flex items-center gap-2 p-3 rounded-lg mb-4 bg-gray-50 border border-gray-200 h-12">
          <AlertTriangle className="h-4 w-4 text-gray-600 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700">
            {patient.priority_status === 'overdue' && patient.days_overdue
              ? `${patient.days_overdue} days overdue`
              : patient.priority_status === 'due_soon' && patient.days_until_due
              ? `Due in ${patient.days_until_due} days`
              : patient.next_appointment_date
              ? `Next visit: ${formatDate(patient.next_appointment_date)}`
              : 'No upcoming visits scheduled'
            }
          </span>
        </div>

        {/* Action Button - Fixed Height */}
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(patient)}
            className="w-full h-9"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSnapshotCard;
