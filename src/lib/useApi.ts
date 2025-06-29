import { useLoading } from '@/contexts/LoadingContext';
import { apiRequest, ApiRequestOptions } from './api';

export function useApi() {
  const { showLoader, hideLoader } = useLoading();

  const request = async <T = any>(options: ApiRequestOptions): Promise<T> => {
    showLoader();
    try {
      const result = await apiRequest<T>(options);
      return result;
    } catch (error) {
      // Optionally handle errors globally here
      hideLoader(); // Ensure loader is hidden on error
      throw error;
    } finally {
      hideLoader();
    }
  };

  return { request };
}
