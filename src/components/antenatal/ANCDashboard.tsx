import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ANCDashboardProps {
  onNewRegistration?: () => void;
}

const ANCDashboard = ({ onNewRegistration }: ANCDashboardProps) => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Antenatal Care Management</h2>
          <p className="text-gray-600">Get started by registering a new patient for antenatal care</p>
        </div>
        
        <Button 
          onClick={onNewRegistration}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Registration
        </Button>
      </div>
    </div>
  );
};

export default ANCDashboard;
