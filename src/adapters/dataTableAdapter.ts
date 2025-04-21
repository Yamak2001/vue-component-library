import type { DataAdapter } from '@/types/adapter';
import type { 
  DataTableAdapter, 
  DataTableRequest, 
  DataTableResponse,
  DataTableFilter,
  DataTableSort
} from '@/types/dataTable';

/**
 * REST API adapter implementation for DataTable
 * This adapter transforms DataTable requests to RESTful API calls
 */
export class RestDataTableAdapter<T = any> implements DataTableAdapter<T> {
  private adapter: DataAdapter;
  private endpoint: string;
  private idField: string;
  
  constructor(adapter: DataAdapter, endpoint: string, idField = 'id') {
    this.adapter = adapter;
    this.endpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
    this.idField = idField;
  }
  
  // Convert DataTable filters to query params
  private convertFiltersToParams(filters: DataTableFilter[]): Record<string, any> {
    const params: Record<string, any> = {};
    
    filters.forEach(filter => {
      if (filter.operator) {
        // Format: filter[fieldName][operator]=value
        params[`filter[${filter.key}][${filter.operator}]`] = filter.value;
      } else {
        // Simple equals filter: filter[fieldName]=value
        params[`filter[${filter.key}]`] = filter.value;
      }
    });
    
    return params;
  }
  
  // Convert DataTable sort to query params
  private convertSortToParams(sort: DataTableSort): Record<string, any> {
    return {
      sortBy: sort.key,
      sortOrder: sort.order
    };
  }
  
  // Fetch data with pagination, sorting, and filtering
  async fetchData(request: DataTableRequest): Promise<DataTableResponse<T>> {
    try {
      // Build query parameters
      const params: Record<string, any> = {
        page: request.pagination.page,
        limit: request.pagination.pageSize,
      };
      
      // Add search param if provided
      if (request.search) {
        params.search = request.search;
      }
      
      // Add sort params if provided
      if (request.sort) {
        Object.assign(params, this.convertSortToParams(request.sort));
      }
      
      // Add filter params if provided
      if (request.filters && request.filters.length > 0) {
        Object.assign(params, this.convertFiltersToParams(request.filters));
      }
      
      // Make API request
      const response = await this.adapter.get<DataTableResponse<T>>(this.endpoint, {
        params
      });
      
      // Return formatted response
      return {
        data: response.data.data || [],
        total: response.data.total || 0,
        page: response.data.page || request.pagination.page,
        pageSize: response.data.pageSize || request.pagination.pageSize
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      // Return empty result on error
      return {
        data: [],
        total: 0,
        page: request.pagination.page,
        pageSize: request.pagination.pageSize
      };
    }
  }
  
  // Get initial data (used for immediate display before pagination)
  async getInitialData(): Promise<T[]> {
    try {
      const response = await this.adapter.get<T[]>(`${this.endpoint}?limit=10`);
      return response.data;
    } catch (error) {
      console.error('Error fetching initial data:', error);
      return [];
    }
  }
  
  // Delete a row by ID
  async deleteRow(id: string | number): Promise<void> {
    await this.adapter.delete(`${this.endpoint}${id}`);
  }
  
  // Update a row by ID
  async updateRow(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.adapter.put<T>(`${this.endpoint}${id}`, data);
    return response.data;
  }
  
  // Create a new row
  async createRow(data: Partial<T>): Promise<T> {
    const response = await this.adapter.post<T>(this.endpoint, data);
    return response.data;
  }
}

/**
 * GraphQL adapter implementation for DataTable
 * This adapter transforms DataTable requests to GraphQL queries
 */
export class GraphQLDataTableAdapter<T = any> implements DataTableAdapter<T> {
  private client: any; // GraphQL client
  private queryName: string;
  private mutationPrefix: string;
  private fragments: Record<string, string>;
  private idField: string;
  
  constructor(
    client: any, 
    queryName: string, 
    mutationPrefix = '',
    fragments: Record<string, string> = {},
    idField = 'id'
  ) {
    this.client = client;
    this.queryName = queryName;
    this.mutationPrefix = mutationPrefix || queryName;
    this.fragments = fragments;
    this.idField = idField;
  }
  
  // Build GraphQL query with variables
  private buildQuery(request: DataTableRequest): { query: string, variables: Record<string, any> } {
    // Get the fragment for this entity if it exists
    const fragment = this.fragments[this.queryName] || '';
    
    // Build the query
    const query = `
      query ${this.queryName}($page: Int!, $pageSize: Int!, $filters: [FilterInput], $sort: SortInput, $search: String) {
        ${this.queryName}(page: $page, pageSize: $pageSize, filters: $filters, sort: $sort, search: $search) {
          data {
            ${fragment || `
              ${this.idField}
              # Add default fields if no fragment provided
              # This should be customized based on your API
            `}
          }
          total
          page
          pageSize
        }
      }
    `;
    
    // Build variables object
    const variables: Record<string, any> = {
      page: request.pagination.page,
      pageSize: request.pagination.pageSize,
      filters: request.filters || [],
      sort: request.sort || null,
      search: request.search || null
    };
    
    return { query, variables };
  }
  
  // Fetch data with GraphQL
  async fetchData(request: DataTableRequest): Promise<DataTableResponse<T>> {
    try {
      const { query, variables } = this.buildQuery(request);
      
      const response = await this.client.query(query, variables);
      const result = response.data[this.queryName];
      
      return {
        data: result.data || [],
        total: result.total || 0,
        page: result.page || request.pagination.page,
        pageSize: result.pageSize || request.pagination.pageSize
      };
    } catch (error) {
      console.error('Error fetching data with GraphQL:', error);
      return {
        data: [],
        total: 0,
        page: request.pagination.page,
        pageSize: request.pagination.pageSize
      };
    }
  }
  
  // Delete a row using GraphQL mutation
  async deleteRow(id: string | number): Promise<void> {
    const mutation = `
      mutation Delete${this.mutationPrefix}($id: ID!) {
        delete${this.mutationPrefix}(id: $id) {
          ${this.idField}
        }
      }
    `;
    
    await this.client.mutation(mutation, { id });
  }
  
  // Update a row using GraphQL mutation
  async updateRow(id: string | number, data: Partial<T>): Promise<T> {
    const fragment = this.fragments[this.queryName] || this.idField;
    
    const mutation = `
      mutation Update${this.mutationPrefix}($id: ID!, $data: ${this.mutationPrefix}Input!) {
        update${this.mutationPrefix}(id: $id, data: $data) {
          ${fragment}
        }
      }
    `;
    
    const response = await this.client.mutation(mutation, { id, data });
    return response.data[`update${this.mutationPrefix}`];
  }
  
  // Create a row using GraphQL mutation
  async createRow(data: Partial<T>): Promise<T> {
    const fragment = this.fragments[this.queryName] || this.idField;
    
    const mutation = `
      mutation Create${this.mutationPrefix}($data: ${this.mutationPrefix}Input!) {
        create${this.mutationPrefix}(data: $data) {
          ${fragment}
        }
      }
    `;
    
    const response = await this.client.mutation(mutation, { data });
    return response.data[`create${this.mutationPrefix}`];
  }
}

/**
 * Factory to create a REST DataTable adapter
 */
export const createRestDataTableAdapter = <T>(
  adapter: DataAdapter, 
  endpoint: string, 
  idField = 'id'
): DataTableAdapter<T> => {
  return new RestDataTableAdapter<T>(adapter, endpoint, idField);
};

/**
 * Factory to create a GraphQL DataTable adapter
 */
export const createGraphQLDataTableAdapter = <T>(
  client: any, 
  queryName: string, 
  mutationPrefix = '',
  fragments: Record<string, string> = {},
  idField = 'id'
): DataTableAdapter<T> => {
  return new GraphQLDataTableAdapter<T>(client, queryName, mutationPrefix, fragments, idField);
};