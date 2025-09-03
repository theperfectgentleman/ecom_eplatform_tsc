import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Search, ArrowLeft, X } from 'lucide-react';

interface PatientNotFoundNoticeProps {
  patientId: string;
  onDismiss: () => void;
  onGoToSnapshot?: () => void;
}

const PatientNotFoundNotice: React.FC<PatientNotFoundNoticeProps> = ({
  patientId,
  onDismiss,
  onGoToSnapshot
}) => {
  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm relative">
      <CardContent className="p-6">
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-amber-100 transition-colors"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4 text-amber-600" />
        </button>
        
        <div className="flex items-start space-x-4 pr-8">
          <div className="flex-shrink-0">
            <div className="p-2 bg-amber-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-amber-900 mb-2">
              Patient Not Found
            </h3>
            <div className="text-amber-800 space-y-3">
              <p>
                We couldn't find a patient with ID:{' '}
                <code className="bg-amber-100 px-2 py-1 rounded text-sm font-mono border border-amber-200">
                  {patientId}
                </code>
              </p>
              <div className="bg-amber-100/50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  Possible reasons:
                </p>
                <ul className="text-sm list-disc list-inside space-y-1 text-amber-800">
                  <li>The patient ID in the URL is incorrect</li>
                  <li>You may not have access to view this patient</li>
                  <li>The patient record may have been archived or removed</li>
                  <li>The patient data is still loading</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onDismiss}
                className="flex items-center justify-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Browsing
              </Button>
              {onGoToSnapshot && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onGoToSnapshot}
                  className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700"
                >
                  <Search className="h-4 w-4" />
                  Browse All Patients
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientNotFoundNotice;
