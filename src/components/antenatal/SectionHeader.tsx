import { User, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SectionHeaderProps {
  patientName: string;
  patientAge?: number;
  patientContact?: string;
  category: string;
  className?: string;
}

const SectionHeader = ({ 
  patientName, 
  patientAge, 
  patientContact,
  category, 
  className = '' 
}: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      {/* Left side - Patient info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">{patientName}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            {patientAge !== undefined && (
              <span>{patientAge} years</span>
            )}
            {patientContact && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{patientContact}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side - Category */}
      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
        {category}
      </Badge>
    </div>
  );
};

export default SectionHeader;
