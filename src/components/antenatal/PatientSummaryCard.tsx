import { ANCPatient } from '@/types';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MapPin, 
  Calendar, 
  Heart,
  Clock
} from 'lucide-react';

interface PatientSummaryCardProps {
  patient: ANCPatient;
  className?: string;
}

const PatientSummaryCard = ({ patient, className = '' }: PatientSummaryCardProps) => {
  const calculateAge = (yearOfBirth: number) => {
    return new Date().getFullYear() - yearOfBirth;
  };

  const getPregnancyStatus = () => {
    if (patient.antenatal_registration) {
      const registrationDate = new Date(patient.antenatal_registration.registration_date);
      const now = new Date();
      const weeksDiff = Math.floor((now.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      if (patient.antenatal_registration.estimated_delivery_date) {
        const deliveryDate = new Date(patient.antenatal_registration.estimated_delivery_date);
        const weeksToDelivery = Math.floor((deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 7));
        return {
          gestationalWeeks: Math.max(0, 40 - weeksToDelivery),
          weeksToDelivery: Math.max(0, weeksToDelivery),
          status: weeksToDelivery > 0 ? 'Active' : 'Due/Delivered'
        };
      }
      
      return {
        gestationalWeeks: weeksDiff,
        weeksToDelivery: Math.max(0, 40 - weeksDiff),
        status: 'Active'
      };
    }
    
    return null;
  };

  const pregnancyInfo = getPregnancyStatus();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Basic Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{patient.name}</h3>
          {patient.othernames && (
            <p className="text-sm text-gray-600">{patient.othernames}</p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {patient.year_of_birth && (
              <span>Age: {calculateAge(patient.year_of_birth)} years</span>
            )}
            {patient.gender && (
              <span>Gender: {patient.gender}</span>
            )}
          </div>
        </div>

        {/* Contact Info */}
        {patient.contact_number && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{patient.contact_number}</span>
          </div>
        )}

        {/* Location */}
        {(patient.region || patient.district || patient.community) && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
            <div>
              {patient.community && <div>{patient.community}</div>}
              {patient.district && <div className="text-gray-600">{patient.district}</div>}
              {patient.region && <div className="text-gray-600">{patient.region}</div>}
            </div>
          </div>
        )}

        {/* Pregnancy Status */}
        {pregnancyInfo && (
          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-pink-500" />
                <span className="font-medium">Pregnancy Status</span>
              </div>
              <Badge 
                variant={pregnancyInfo.status === 'Active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {pregnancyInfo.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{pregnancyInfo.gestationalWeeks} weeks</div>
                  <div className="text-gray-600">Gestational age</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <div className="font-medium">{pregnancyInfo.weeksToDelivery} weeks</div>
                  <div className="text-gray-600">To delivery</div>
                </div>
              </div>
            </div>

            {patient.antenatal_registration?.estimated_delivery_date && (
              <div className="text-sm">
                <span className="text-gray-600">Expected delivery: </span>
                <span className="font-medium">
                  {new Date(patient.antenatal_registration.estimated_delivery_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Registration Info */}
        {patient.antenatal_registration && (
          <div className="border-t pt-4 space-y-2">
            <div className="text-sm">
              <span className="text-gray-600">Registration: </span>
              <span className="font-medium">{patient.antenatal_registration.registration_number}</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">Registered: </span>
              <span>{new Date(patient.antenatal_registration.registration_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Visit Count */}
        {patient.visits_count !== undefined && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Total visits: </span>
              <span className="font-medium">{patient.visits_count}</span>
            </div>
          </div>
        )}
      </div>
  );
};

export default PatientSummaryCard;
