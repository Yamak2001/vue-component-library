export interface DataTableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    renderFn?: (value: any, row: any) => string | number | boolean;
    formatter?: (value: any) => string | number;
    class?: string;
    headerClass?: string;
    cellClass?: string;
  }
  
  export interface DataTablePagination {
    page: number;
    pageSize: number;
    total: number;
    pageSizes?: number[];
  }
  
  export interface DataTableSort {
    key: string;
    order: 'asc' | 'desc';
  }
  
  export interface DataTableFilter {
    key: string;
    value: string | number | boolean | string[] | number[] | null;
    operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in';
  }
  
  export interface DataTableRequest {
    pagination: DataTablePagination;
    sort?: DataTableSort;
    filters?: DataTableFilter[];
    search?: string;
  }
  
  export interface DataTableResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
  }
  
  export interface DataTableEvents {
    'update:page': number;
    'update:pageSize': number;
    'update:sort': DataTableSort;
    'update:filters': DataTableFilter[];
    'update:search': string;
    'row-click': any;
    'row-select': any[];
    'refresh': void;
  }
  
  // Data adapter interface specifically for data tables
  export interface DataTableAdapter<T = any> {
    fetchData(request: DataTableRequest): Promise<DataTableResponse<T>>;
    getInitialData?(): Promise<T[]>;
    deleteRow?(id: string | number): Promise<void>;
    updateRow?(id: string | number, data: Partial<T>): Promise<T>;
    createRow?(data: Partial<T>): Promise<T>;
  }