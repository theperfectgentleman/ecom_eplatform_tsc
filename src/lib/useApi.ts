import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/toast/useToast";
import { useCallback } from "react";

export function useApi() {
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
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.encompas.org';
      const url = `${apiBaseUrl}/api/${path}`;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (!isPublic && token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config: RequestInit = { method, headers };
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
          throw new Error(
            errorData.message || `Request failed with status ${response.status}`
          );
        }

        responseData = await response.json();
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
