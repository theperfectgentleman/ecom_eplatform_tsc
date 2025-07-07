// Centralized API connection manager for Encompas E-Platform
// Handles REST API requests and can be extended for permissions, auth, etc.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ApiRequestOptions {
  method?: ApiMethod;
  path: string;
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

export async function apiRequest<T = any>({
  method = 'GET',
  path,
  body,
  headers = {},
  token,
}: ApiRequestOptions): Promise<T> {
  // Always use VITE_API_BASE_URL if set, otherwise use /api/ for proxy
  let url = '';
  if (API_BASE_URL) {
    url = `${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  } else {
    url = `/api/${path.replace(/^\/+/, '')}`;
  }
  console.log(`Making API request to: ${url}`);
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }
  
  console.log('API request options:', { 
    method, 
    headers: fetchOptions.headers, 
    hasBody: !!body 
  });
  
  let lastError: Error | null = null;
  for (let i = 0; i < 2; i++) {
    try {
      const response = await fetch(url, fetchOptions);
      console.log(`[Attempt ${i + 1}] API response status: ${response.status} ${response.statusText}`);

      if (response.ok) {
        const responseData = await response.json();
        console.log('API response data:', responseData);
        return responseData;
      }

      // If response is not ok, prepare error for retry
      const errorBody = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
      lastError = new Error(errorBody.message || `API request failed`);
      console.error(`[Attempt ${i + 1}] API error:`, lastError.message);

    } catch (error: any) {
      lastError = error;
      console.error(`[Attempt ${i + 1}] Network or fetch error:`, error.message);
    }

    // If it's not the last attempt, wait before retrying
    if (i < 1) {
      const delay = Math.pow(2, i) * 1000; // Exponential backoff: 1s
      console.log(`Waiting ${delay}ms before next retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error('API request failed after 2 attempts.');
  // After all retries, throw the last recorded error
  throw lastError || new Error('API request failed after multiple retries.');
}
