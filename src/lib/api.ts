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
  // Ensure only one slash between base URL and path
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
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
  const response = await fetch(url, fetchOptions);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || response.statusText);
  }
  return response.json();
}
