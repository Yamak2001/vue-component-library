import type { GraphQLAdapter, RequestOptions, ApiResponse, ApiError } from '@/types/adapter';

class GraphQLClient implements GraphQLAdapter {
  private endpoint: string;
  private defaultOptions: RequestOptions;

  constructor(endpoint: string, options: RequestOptions = {}) {
    this.endpoint = endpoint;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...options,
    };
  }

  // Merge default options with request options
  private mergeOptions(options?: RequestOptions): RequestInit {
    return {
      method: 'POST',
      headers: {
        ...this.defaultOptions.headers,
        ...options?.headers,
      },
      ...this.defaultOptions,
      ...options,
    };
  }

  // Parse response headers
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Process GraphQL response
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const headers = this.parseHeaders(response.headers);
    const responseJson = await response.json();
    
    // Check for HTTP errors first
    if (!response.ok) {
      const error: ApiError = {
        message: responseJson.message || response.statusText,
        status: response.status,
        data: responseJson,
      };
      
      throw error;
    }
    
    // Check for GraphQL errors
    if (responseJson.errors && responseJson.errors.length) {
      const error: ApiError = {
        message: responseJson.errors[0].message,
        code: responseJson.errors[0].extensions?.code,
        status: response.status,
        data: responseJson.errors,
      };
      
      throw error;
    }
    
    return {
      data: responseJson.data,
      status: response.status,
      statusText: response.statusText,
      headers,
    };
  }

  // Execute GraphQL request (common for both query and mutation)
  private async executeOperation<T>(
    operationType: 'query' | 'mutation',
    operationString: string,
    variables?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const mergedOptions = this.mergeOptions(options);
      
      // Build GraphQL request body
      const body = JSON.stringify({
        [operationType]: operationString,
        variables,
      });
      
      mergedOptions.body = body;
      
      const response = await fetch(this.endpoint, mergedOptions);
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

  // GraphQL query
  async query<T>(query: string, variables?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeOperation<T>('query', query, variables, options);
  }

  // GraphQL mutation  
  async mutation<T>(mutation: string, variables?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeOperation<T>('mutation', mutation, variables, options);
  }
}

// Factory function to create GraphQL adapter
export const createGraphQLAdapter = (endpoint: string, options?: RequestOptions): GraphQLAdapter => {
  return new GraphQLClient(endpoint, options);
};