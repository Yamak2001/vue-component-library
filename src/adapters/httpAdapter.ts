import type { DataAdapter, RequestOptions, ApiResponse, ApiError } from '@/types/adapter';

class HttpAdapter implements DataAdapter {
  private baseURL: string;
  private defaultOptions: RequestOptions;

  constructor(baseURL: string, options: RequestOptions = {}) {
    this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    };
  }

  // Build full URL with query parameters
  private buildURL(url: string, options?: RequestOptions): string {
    const endpoint = url.startsWith('/') ? url : `/${url}`;
    const fullURL = new URL(`${this.baseURL}${endpoint}`);
    
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fullURL.searchParams.append(key, String(value));
        }
      });
    }
    
    return fullURL.toString();
  }

  // Merge default options with request options
  private mergeOptions(method: string, options?: RequestOptions, data?: any): RequestInit {
    const mergedOptions: RequestInit = {
      method,
      headers: {
        ...this.defaultOptions.headers,
        ...options?.headers,
      },
      ...this.defaultOptions,
      ...options,
    };

    // Add request body for POST, PUT, PATCH
    if (data !== undefined && ['POST', 'PUT', 'PATCH'].includes(method)) {
      if (typeof data === 'object' && !(data instanceof FormData)) {
        mergedOptions.body = JSON.stringify(data);
      } else {
        mergedOptions.body = data as BodyInit;
        
        // Remove content-type header if FormData to let browser set it with boundary
        if (data instanceof FormData) {
          delete (mergedOptions.headers as Record<string, string>)['Content-Type'];
        }
      }
    }

    return mergedOptions;
  }

  // Parse response headers
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Process response
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const headers = this.parseHeaders(response.headers);
    const contentType = headers['content-type'] || '';
    
    let data: any;
    
    // Parse response based on content type
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('text/')) {
      data = await response.text();
    } else {
      // For binary data or other types
      data = await response.blob();
    }
    
    // Handle error responses
    if (!response.ok) {
      const error: ApiError = {
        message: typeof data === 'object' && data?.message ? data.message : response.statusText,
        status: response.status,
        data,
      };
      
      throw error;
    }
    
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers,
    };
  }

  // Make HTTP request
  private async request<T>(method: string, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    try {
      const fullURL = this.buildURL(url, options);
      const mergedOptions = this.mergeOptions(method, options, data);
      
      const response = await fetch(fullURL, mergedOptions);
      return await this.processResponse<T>(response);
    } catch (error) {
      // Handle fetch errors (network issues, etc.)
      if (error instanceof Error && !(error as ApiError).status) {
        throw {
          message: error.message,
          code: 'NETWORK_ERROR',
        } as ApiError;
      }
      throw error;
    }
  }

  // HTTP methods
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', url, data, options);
  }

  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', url, data, options);
  }

  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', url, data, options);
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', url, undefined, options);
  }
}

// Factory function to create HTTP adapter
export const createHttpAdapter = (baseURL: string, options?: RequestOptions): DataAdapter => {
  return new HttpAdapter(baseURL, options);
};