import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@/lib/useApi';
import { useAccessLevelFilter } from '@/hooks/useAccessLevelFilter';

interface FilterableData {
  region?: string;
  district?: string;
  subdistrict?: string;
  community_name?: string;
  location?: string;
  area?: string;
  Region?: string;
  District?: string;
  Subdistrict?: string;
  Community?: string;
}

interface UseFilteredApiOptions {
  path: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  dependencies?: any[];
  applyFilter?: boolean;
  isPublic?: boolean;
  autoFetch?: boolean;
}

export const useFilteredApi = <T extends FilterableData>({
  path,
  method = "GET",
  body,
  dependencies = [],
  applyFilter = true,
  isPublic = false,
  autoFetch = true
}: UseFilteredApiOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { request } = useApi();
  const { filterByAccessLevel, getAccessLevelInfo } = useAccessLevelFilter();

  const fetchData = useCallback(async (): Promise<T[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await request<T[] | { data: T[] }>({ 
        method, 
        path, 
        body,
        isPublic 
      });
      
      // Handle different response formats
      const rawData = Array.isArray(response) ? response : (response.data || []);
      
      // Apply access level filtering if enabled
      const filteredData = applyFilter ? filterByAccessLevel(rawData) : rawData;
      setData(filteredData);
      
      return filteredData;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setData([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [request, method, path, body, isPublic, applyFilter, filterByAccessLevel]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, dependencies);

  const refetch = useCallback(async (): Promise<T[]> => {
    return await fetchData();
  }, [fetchData]);

  const filterInfo = getAccessLevelInfo();

  return { 
    data, 
    loading, 
    error, 
    refetch,
    fetchData,
    filterInfo,
    isFiltered: applyFilter && filterInfo.scope !== 'national'
  };
};
