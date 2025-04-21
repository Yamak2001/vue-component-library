// src/adapters/autoCompleteAdapter.ts
import type { DataAdapter, RequestOptions, ApiResponse } from '@/types/adapter';
import type { AutoCompleteOption } from '@/types/autoComplete';

export interface AutoCompleteAdapter {
  search(query: string, options?: RequestOptions): Promise<AutoCompleteOption[]>;
}

export class RestAutoCompleteAdapter implements AutoCompleteAdapter {
  private adapter: DataAdapter;
  private endpoint: string;
  private valueKey: string;
  private labelKey: string;
  
  constructor(
    adapter: DataAdapter, 
    endpoint: string, 
    valueKey = 'id', 
    labelKey = 'name'
  ) {
    this.adapter = adapter;
    this.endpoint = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
    this.valueKey = valueKey;
    this.labelKey = labelKey;
  }
  
  async search(query: string, options?: RequestOptions): Promise<AutoCompleteOption[]> {
    try {
      const params = {
        ...(options?.params || {}),
        search: query
      };
      
      const response = await this.adapter.get<any[]>(this.endpoint, {
        ...options,
        params
      });
      
      return response.data.map(item => ({
        value: item[this.valueKey],
        label: item[this.labelKey],
        ...item
      }));
    } catch (error) {
      console.error('Error searching:', error);
      return [];
    }
  }
}

export class ClientSideAutoCompleteAdapter implements AutoCompleteAdapter {
  private options: AutoCompleteOption[];
  
  constructor(options: AutoCompleteOption[]) {
    this.options = options;
  }
  
  async search(query: string): Promise<AutoCompleteOption[]> {
    if (!query) return this.options.slice(0, 10);
    
    const lowerQuery = query.toLowerCase();
    return this.options
      .filter(option => 
        option.label.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10);
  }
}

// Factory functions
export const createRestAutoCompleteAdapter = (
  adapter: DataAdapter,
  endpoint: string,
  valueKey = 'id',
  labelKey = 'name'
): AutoCompleteAdapter => {
  return new RestAutoCompleteAdapter(adapter, endpoint, valueKey, labelKey);
};

export const createClientSideAutoCompleteAdapter = (
  options: AutoCompleteOption[]
): AutoCompleteAdapter => {
  return new ClientSideAutoCompleteAdapter(options);
};