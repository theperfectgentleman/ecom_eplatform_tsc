import React, { useMemo } from 'react';
import { useAccessLevelFilter } from '@/hooks/useAccessLevelFilter';
import { AlertCircle, Filter } from 'lucide-react';

interface WithAccessFilterProps {
  data: any[];
  children: (filteredData: any[]) => React.ReactNode;
  showFilterInfo?: boolean;
  className?: string;
}

export const WithAccessFilter: React.FC<WithAccessFilterProps> = ({ 
  data, 
  children, 
  showFilterInfo = false,
  className = ""
}) => {
  const { filterByAccessLevel, getAccessLevelInfo, isNationalAccess } = useAccessLevelFilter();
  
  const filteredData = useMemo(() => {
    return filterByAccessLevel(data);
  }, [data, filterByAccessLevel]);

  const accessInfo = getAccessLevelInfo();
  const isFiltered = !isNationalAccess && data.length > filteredData.length;

  return (
    <div className={className}>
      {showFilterInfo && (
        <div className={`mb-4 p-3 rounded-lg border ${
          isFiltered 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center gap-2">
            <Filter className={`h-4 w-4 ${
              isFiltered ? 'text-blue-600' : 'text-green-600'
            }`} />
            <span className={`text-sm font-medium ${
              isFiltered ? 'text-blue-700' : 'text-green-700'
            }`}>
              {isNationalAccess 
                ? 'Viewing all data (National Access)' 
                : `Filtered for: ${accessInfo.label}`
              }
            </span>
            {isFiltered && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {filteredData.length} of {data.length} records
              </span>
            )}
          </div>
          {isFiltered && (
            <div className="mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600">
                Some data is hidden based on your access level
              </span>
            </div>
          )}
        </div>
      )}
      {children(filteredData)}
    </div>
  );
};
