import { config } from '../../config/env';

export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

type RequestOptions = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  signal?: AbortSignal;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    try {
      const saved = localStorage.getItem('goodviet_token');
      return saved;
    } catch {
      return null;
    }
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    // Handle relative URLs correctly by providing a base (window.location.origin)
    const base = this.baseUrl || window.location.origin;
    const url = new URL(`${this.baseUrl}${path}`, base);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    // Return relative path if no baseUrl was provided, to allow Vite proxy to work
    if (!this.baseUrl) {
      return `${path}${url.search}`
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: options?.signal,
      ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
    };

    const url = this.buildUrl(path, options?.params);

    try {
      const response = await fetch(url, fetchOptions);

      if (response.status === 401) {
        // A response can arrive after logout/login has installed a newer token.
        // Only the request that used the still-current token may clear that
        // session; a stale 401 must not erase or redirect a newer login.
        if (this.getToken() === token) {
          localStorage.removeItem('goodviet_token');
          localStorage.removeItem('goodviet_user');
          window.location.href = '/login';
        }
        throw new ApiError(401, 'Unauthorized');
      }

      if (!response.ok) {
        let data: unknown;
        try {
          data = await response.json();
          console.error('API Error Response:', data); // DEBUG: Log error response
        } catch {
          data = null;
        }
        throw new ApiError(response.status, response.statusText, data);
      }

      // 204 No Content
      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json() as T;
    } catch (err) {
      if (err instanceof ApiError) throw err;

      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new ApiError(0, 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }

      throw err;
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  async upload<T>(
    path: string,
    file: File | Blob,
    fieldName = 'file',
    extra?: Record<string, string>,
    options?: RequestOptions,
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);
    if (extra) {
      Object.entries(extra).forEach(([k, v]) => formData.append(k, v));
    }
    return this.request<T>('POST', path, formData, options);
  }
}

export const apiClient = new ApiClient(config.apiUrl);
