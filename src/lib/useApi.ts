import { useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";

export const useApi = () => {
  const { token, logout } = useAuth();
  const { toast } = useToast();

  const request = useCallback(
    async <T = any>(
      options: {
        path: string;
        method?: "GET" | "POST" | "PUT" | "DELETE";
        body?: any;
        isPublic?: boolean;
      }
    ): Promise<T> => {
      const { path, method = "GET", body, isPublic = false } = options;
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org/api').replace(/\/$/, '');
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      const url = `${apiBaseUrl}/${cleanPath}`;

      console.log('API Request Debug:', { method, url, body }); // Debug log

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (!isPublic && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config: { method: string; headers: Record<string, string>; body?: string } = { method, headers };
      if (body) {
        config.body = JSON.stringify(body);
      }

      let responseData: T;
      try {
        const response = await fetch(url, config);

        if (response.status === 401) {
          logout();
          toast({
            variant: "error",
            title: "Session expired",
            description: "Please log in again.",
          });
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
        toast({ variant: "error", title: "API Error", description: error.message });
        throw error;
      }
      return responseData;
    },
    [token, logout, toast]
  );

  return { request };
}
