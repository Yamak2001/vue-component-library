import type { MockAdapter, RequestOptions, ApiResponse, ApiError } from '@/types/adapter';

// Factory function to create mock adapter
export const createMockAdapter = (): MockAdapter => {
  return new MockClient();
};
    
class MockClient implements MockAdapter {
  private mockResponses: Map<string, Record<string, any>>;
  private defaultDelay: number;

  constructor(defaultDelay = 200) {
    this.mockResponses = new Map();
    this.defaultDelay = defaultDelay;
  }

  // Generate a unique key for each request
  private getRequestKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  // Create a simulated response with headers and status
  private createResponse<T>(data: T, status = 200, statusText = 'OK'): ApiResponse<T> {
    return {
      data,
      status,
      statusText,
      headers: {
        'content-type': 'application/json',
      },
    };
  }

  // Create an error response
  private createErrorResponse(status = 500, message = 'Server Error'): ApiError {
    return {
      message,
      status,
      code: `ERROR_${status}`,
    };
  }

  // Set mock response for a specific request
  setMockResponse(url: string, method: string, response: any): void {
    const key = this.getRequestKey(url, method);
    this.mockResponses.set(key, response);
  }

  // Reset all mock responses
  resetMocks(): void {
    this.mockResponses.clear();
  }

  // Simulate a delay to mimic network request
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Process mock request
  private async processMockRequest<T>(
    url: string,
    method: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    // Simulate network delay
    const responseDelay = options?.timeout || this.defaultDelay;
    await this.delay(responseDelay);
    
    // Check if we have a mock response for this request
    const key = this.getRequestKey(url, method);
    const mockResponse = this.mockResponses.get(key);
    
    // If no mock is set, return a 404
    if (!mockResponse) {
      throw this.createErrorResponse(404, `No mock response found for ${method} ${url}`);
    }
    
    // Handle error responses
    if (mockResponse.error) {
      throw mockResponse.error;
    }
    
    // Return successful response
    return this.createResponse<T>(
      mockResponse.data,
      mockResponse.status || 200,
      mockResponse.statusText || 'OK'
    );
  }
  
  // HTTP methods implementation
  async get<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.processMockRequest<T>(url, 'GET', options);
  }
  
  async post<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Store the request data for later assertions if needed
    if (options?.storeRequestData) {
      const key = this.getRequestKey(url, 'POST');
      this.mockResponses.set(`${key}_request`, data);
    }
    return this.processMockRequest<T>(url, 'POST', options);
  }
  
  async put<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    if (options?.storeRequestData) {
      const key = this.getRequestKey(url, 'PUT');
      this.mockResponses.set(`${key}_request`, data);
    }
    return this.processMockRequest<T>(url, 'PUT', options);
  }
  
  async patch<T>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    if (options?.storeRequestData) {
      const key = this.getRequestKey(url, 'PATCH');
      this.mockResponses.set(`${key}_request`, data);
    }
    return this.processMockRequest<T>(url, 'PATCH', options);
  }
  
  async delete<T>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.processMockRequest<T>(url, 'DELETE', options);
  }
}