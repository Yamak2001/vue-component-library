// Common types for adapters
export interface RequestOptions {
    headers?: Record<string, string>;
    params?: Record<string, any>;
    timeout?: number;
    signal?: AbortSignal;
    [key: string]: any;
  }
  
  export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers?: Record<string, string>;
    [key: string]: any;
  }
  
  export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  
  export interface ApiError {
    message: string;
    code?: string | number;
    status?: number;
    data?: any;
  }
  
  // Base adapter interface
  export interface DataAdapter {
    get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  }
  
  // GraphQL adapter interface
  export interface GraphQLAdapter {
    query<T = any>(query: string, variables?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>>;
    mutation<T = any>(mutation: string, variables?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>>;
  }
  
  // Mock adapter interface for testing
  export interface MockAdapter extends DataAdapter {
    setMockResponse(url: string, method: string, response: any): void;
    resetMocks(): void;
  }
  
  // Factory function types
  export type HttpAdapterFactory = (baseURL: string, options?: RequestOptions) => DataAdapter;
  export type GraphQLAdapterFactory = (endpoint: string, options?: RequestOptions) => GraphQLAdapter;
  export type MockAdapterFactory = () => MockAdapter;