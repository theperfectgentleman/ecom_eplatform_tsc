import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApi } from '@/lib/useApi';
import { AccessLevel } from '@/types';

// This hook automatically adds access level query parameters to an API request.
// It's designed to fetch lists of data that should be filtered based on the
// logged-in user's geographic access level.

interface UseFilteredQueryProps {
  path: string;
  // Allows for a trigger to refetch data, e.g., after a creation or deletion.
  refreshTrigger?: any; 
}

export const useFilteredQuery = <T>({ path, refreshTrigger }: UseFilteredQueryProps) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const { user } = useAuth();
  const { request } = useApi();

  const fetchData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const { access_level, region, district, subdistrict } = user;
    const params = new URLSearchParams();

    // Temporarily disable access level filtering for kit-distro-logs endpoint
    // until backend is updated to handle these parameters
    const shouldApplyFiltering = !path.includes('kit-distro-logs');

    // Add parameters based on the user's access level.
    // The backend will use these to filter the data.
    // We don't need to filter for NATIONAL level as they see everything.
    if (shouldApplyFiltering && access_level < AccessLevel.NATIONAL) {
      if (region) params.append('region', region);
      if (district) params.append('district', district);
      if (subdistrict) params.append('subdistrict', subdistrict);
      // It can be useful for the backend to know the exact level of the user making the request
      params.append('access_level', access_level.toString());
    }

    const queryString = params.toString();
    const fullPath = queryString ? `${path}?${queryString}` : path;

    try {
      const result = await request<T>({
        path: fullPath,
        method: 'GET',
      });
      setData(result);
    } catch (err) {
      setError(err);
      // No toast here, the component using the hook can decide
    } finally {
      setIsLoading(false);
    }
  }, [path, user, request]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  return { data, isLoading, error, refetch: fetchData };
};
