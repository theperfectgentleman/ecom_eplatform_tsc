import React from 'react';
import { useAccessLevelFilter } from '@/hooks/useAccessLevelFilter';
import { Filter, Globe } from 'lucide-react';

export const FilterIndicator: React.FC = () => {
  const { getAccessLevelInfo, isNationalAccess } = useAccessLevelFilter();
  const accessInfo = getAccessLevelInfo();

  // Don't show indicator for national access users
  if (isNationalAccess) return null;

  return (
    <div className="bg-blue-600 text-white px-4 py-2 text-sm border-b">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Data Filter Active:</span>
          <span>{accessInfo.label}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-100">
          <Globe className="h-3 w-3" />
          <span className="text-xs">Limited geographic view</span>
        </div>
      </div>
    </div>
  );
};
