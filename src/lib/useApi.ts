import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";
import { ApiRequestOptions } from "@/types";

/**
 * useApi Hook - Enhanced with Toast Suppression
 * 
 * This hook provides a robust API request system with flexible toast notification control.
 * 
 * TOAST SUPPRESSION OPTIONS:
 * - suppressToast.error: Suppress error toasts (useful for optional data fetching)
 * - suppressToast.success: Suppress success toasts (for background operations)
 * - suppressToast.warning: Suppress warning toasts
 * - suppressToast.info: Suppress info toasts
 * - suppressToast.all: Suppress all toast notifications
 * 
 * HELPER FUNCTIONS:
 * - request(): Standard API request with full toast control
 * - quietRequest(): Suppresses error toasts only (ideal for optional data)
 * - silentRequest(): Suppresses all toasts (for background operations)
 * 
 * USAGE EXAMPLES:
 * 
 * // Standard request with error toasts
 * const data = await request({ path: 'users', method: 'GET' });
 * 
 * // Suppress error toasts (for optional/expected failures)
 * const optionalData = await quietRequest({ path: 'optional-data', method: 'GET' });
 * 
 * // Suppress all toasts (for background operations)
 * const backgroundData = await silentRequest({ path: 'background-sync', method: 'POST' });
 * 
 * // Custom toast suppression
 * const data = await request({ 
 *   path: 'data', 
 *   method: 'POST',
 *   suppressToast: { error: true, warning: true }
 * });
 */
export const useApi = () => {
  const { token, logout } = useAuth();
  const { toast } = useToast();

  const request = useCallback(
    async <T = any>(options: ApiRequestOptions): Promise<T> => {
      const { path, method = "GET", body, isPublic = false, suppressToast = {} } = options;
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const url = `${apiBaseUrl}/${cleanPath}`;

      console.log('API Request Debug:', { method, url, body }); // Debug log

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Authentication: Use Bearer token if available, otherwise use API key
      if (!isPublic && token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else if (!isPublic) {
        const apiKey = import.meta.env.VITE_ENCOMPAS_API_KEY;
        if (apiKey) {
          headers["x-api-key"] = apiKey;
        }
      }

      const config: { method: string; headers: Record<string, string>; body?: string } = { method, headers };
      if (body) {
        config.body = JSON.stringify(body);
      }

      let responseData: T;
      try {
        const response = await fetch(url, config);

        if (response.status === 401) {
          // Only logout if we actually have a token and it's rejected
          // Don't logout if we're using API key authentication
          if (token) {
            console.log('401 received with token - logging out due to expired session');
            logout();
            if (!suppressToast.error && !suppressToast.all) {
              toast({
                variant: "error",
                title: "Session expired",
                description: "Please log in again.",
              });
            }
          } else {
            console.log('401 received with API key - not logging out');
            if (!suppressToast.error && !suppressToast.all) {
              toast({
                variant: "error", 
                title: "Access denied",
                description: "Authentication failed.",
              });
            }
          }
          throw new Error("Unauthorized");
        }

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          // Always log the error details for debugging
          console.error('API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            errorData,
            url,
            method,
            body,
            fullResponse: errorData
          });
          // Also log the errorData as a separate object for easy copy-paste
          console.error('API errorData:', errorData);
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }

        // Handle empty responses (e.g., 204 No Content for DELETE operations)
        const contentType = response.headers.get("content-type");
        if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
          responseData = {} as T;
        } else {
          responseData = await response.json();
        }
      } catch (error: any) {
        console.error(`API request to ${path} failed:`, error);
        if (!suppressToast.error && !suppressToast.all) {
          toast({ variant: "error", title: "API Error", description: error.message });
        }
        throw error;
      }
      return responseData;
    },
    [token, logout, toast]
  );

  // Helper function for silent requests (suppress all toasts)
  const silentRequest = useCallback(
    async <T = any>(options: Omit<ApiRequestOptions, 'suppressToast'>): Promise<T> => {
      return request<T>({ ...options, suppressToast: { all: true } });
    },
    [request]
  );

  // Helper function for requests that only suppress error toasts
  const quietRequest = useCallback(
    async <T = any>(options: Omit<ApiRequestOptions, 'suppressToast'>): Promise<T> => {
      return request<T>({ ...options, suppressToast: { error: true } });
    },
    [request]
  );

  // Helper function for background operations (suppress all toasts)
  const backgroundRequest = useCallback(
    async <T = any>(options: Omit<ApiRequestOptions, 'suppressToast'>): Promise<T> => {
      return request<T>({ ...options, suppressToast: { all: true } });
    },
    [request]
  );

  // Helper function for optional data requests (suppress error and warning toasts)
  const optionalRequest = useCallback(
    async <T = any>(options: Omit<ApiRequestOptions, 'suppressToast'>): Promise<T | null> => {
      try {
        return await request<T>({ ...options, suppressToast: { error: true, warning: true } });
      } catch (error) {
        // Return null for optional requests that fail
        return null;
      }
    },
    [request]
  );

  return { 
    request, 
    silentRequest, 
    quietRequest, 
    backgroundRequest, 
    optionalRequest 
  };
}
