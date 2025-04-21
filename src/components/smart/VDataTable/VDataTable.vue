<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from '@/composables/useI18n';
import VButton from '@/components/core/VButton/VButton.vue';
import type {
    DataTableColumn,
    DataTablePagination,
    DataTableSort,
    DataTableFilter,
    DataTableRequest,
    DataTableAdapter
} from '@/types/dataTable';

// Import defineModel if using Vue < 3.4
// For Vue 3.4+, defineModel is built-in
// import { defineModel } from 'vue';

// Define props
interface Props {
    // Data configuration
    columns: DataTableColumn[];
    adapter: DataTableAdapter;

    // Loading state
    loading?: boolean;

    // Selection
    selectable?: boolean;
    multiSelect?: boolean;
    selected?: any[] | any;

    // Pagination
    pagination?: DataTablePagination;
    showPagination?: boolean;

    // Sorting
    sortable?: boolean;
    defaultSort?: DataTableSort;

    // Filtering
    filterable?: boolean;
    filters?: DataTableFilter[];

    // Search
    searchable?: boolean;
    searchPlaceholder?: string;

    // Presentation
    striped?: boolean;
    hoverable?: boolean;
    bordered?: boolean;
    dense?: boolean;

    // Customization
    emptyMessage?: string;
    loadingMessage?: string;
    rowClass?: string | ((row: any) => string);
    rowKey?: string;
}

// Define default values for optional props
const props = withDefaults(defineProps<Props>(), {
    loading: false,
    selectable: false,
    multiSelect: false,
    selected: () => [],
    pagination: () => ({ page: 1, pageSize: 10, total: 0, pageSizes: [10, 25, 50, 100] }),
    showPagination: true,
    sortable: true,
    filterable: false,
    filters: () => [],
    searchable: false,
    searchPlaceholder: 'Search...',
    striped: true,
    hoverable: true,
    bordered: true,
    dense: false,
    emptyMessage: 'No data available',
    loadingMessage: 'Loading data...',
    rowKey: 'id'
});

// Define v-model bindings
const selectedModel = defineModel('selected');
const pageModel = defineModel('page', { default: 1 });
const pageSizeModel = defineModel('pageSize', { default: 10 });
const sortModel = defineModel('sort');
const filtersModel = defineModel('filters');
const searchModel = defineModel('search', { default: '' });

// Define emits
const emit = defineEmits<{
    (e: 'update:selected', value: any[] | any): void;
    (e: 'update:page', value: number): void;
    (e: 'update:pageSize', value: number): void;
    (e: 'update:sort', value: DataTableSort): void;
    (e: 'update:filters', value: DataTableFilter[]): void;
    (e: 'update:search', value: string): void;
    (e: 'row-click', value: any): void;
    (e: 'row-select', value: any[]): void;
    (e: 'refresh'): void;
}>();

// Use composables
const { t } = useI18n();

// Internal state
const tableData = ref<any[]>([]);
const internalLoading = ref(props.loading);
const internalSelected = ref<any[]>(Array.isArray(props.selected) ? [...props.selected] : props.selected ? [props.selected] : []);
const internalPage = ref(pageModel.value ?? props.pagination.page);
const internalPageSize = ref(pageSizeModel.value ?? props.pagination.pageSize);
const internalTotal = ref(props.pagination.total);
const internalSort = ref<DataTableSort | undefined>(sortModel.value ?? props.defaultSort);
const internalFilters = ref<DataTableFilter[]>(filtersModel.value ?? (Array.isArray(props.filters) ? [...props.filters] : []));
const internalSearch = ref(searchModel.value ?? '');
const error = ref<string | null>(null);

// Fixed: Correct timeout type
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null);

// Watchers to sync external and internal state
watch(() => props.selected, (newVal) => {
    internalSelected.value = Array.isArray(newVal) ? [...newVal] : newVal ? [newVal] : [];
});

watch(() => selectedModel.value, (newVal) => {
    if (newVal !== undefined) {
        internalSelected.value = Array.isArray(newVal) ? [...newVal] : newVal ? [newVal] : [];
    }
});

watch(internalSelected, (newVal) => {
    const emitValue = props.multiSelect ? newVal : newVal[0] || null;
    selectedModel.value = emitValue;
    emit('update:selected', emitValue);
    emit('row-select', newVal);
});

watch(() => props.loading, (newVal) => {
    internalLoading.value = newVal;
});

// Handle pagination
watch(internalPage, (newVal) => {
    pageModel.value = newVal;
    emit('update:page', newVal);
    fetchTableData();
});

watch(internalPageSize, (newVal) => {
    pageSizeModel.value = newVal;
    emit('update:pageSize', newVal);
    // Reset to page 1 when changing page size
    internalPage.value = 1;
    fetchTableData();
});

// Handle sorting
watch(internalSort, (newVal) => {
    sortModel.value = newVal;
    emit('update:sort', newVal as DataTableSort);
    fetchTableData();
});

// Handle filtering
watch(internalFilters, (newVal) => {
    filtersModel.value = newVal;
    emit('update:filters', newVal);
    // Reset to page 1 when changing filters
    internalPage.value = 1;
    fetchTableData();
});

// Handle search
watch(internalSearch, (newVal) => {
    searchModel.value = newVal;
    emit('update:search', newVal);
    // Debounce search to prevent excessive API calls
    if (searchTimeout.value) clearTimeout(searchTimeout.value);
    searchTimeout.value = setTimeout(() => {
        // Reset to page 1 when searching
        internalPage.value = 1;
        fetchTableData();
    }, 300);
});

// Table pagination
const totalPages = computed(() => {
    return Math.ceil(internalTotal.value / internalPageSize.value);
});

const paginationArray = computed(() => {
    const current = internalPage.value;
    const total = totalPages.value;
    const delta = 2;
    const left = current - delta;
    const right = current + delta + 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= total; i++) {
        if (i === 1 || i === total || (i >= left && i < right)) {
            range.push(i);
        }
    }

    for (const i of range) {
        if (l) {
            if (i - l === 2) {
                rangeWithDots.push(l + 1);
            } else if (i - l !== 1) {
                rangeWithDots.push('...');
            }
        }
        rangeWithDots.push(i);
        l = i;
    }

    return rangeWithDots;
});

// Fetch data from the adapter
const fetchTableData = async () => {
    if (!props.adapter) {
        console.error('No data adapter provided to VDataTable');
        error.value = 'No data adapter provided';
        return;
    }

    try {
        internalLoading.value = true;
        error.value = null;

        const request: DataTableRequest = {
            pagination: {
                page: internalPage.value,
                pageSize: internalPageSize.value,
                total: internalTotal.value
            },
            sort: internalSort.value,
            filters: internalFilters.value,
            search: internalSearch.value || undefined
        };

        const response = await props.adapter.fetchData(request);

        tableData.value = response.data;
        internalTotal.value = response.total;

        // Update page if the response contains a different page (server-side pagination logic)
        if (response.page && response.page !== internalPage.value) {
            internalPage.value = response.page;
        }
    } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to fetch data';
        console.error('Error fetching table data:', err);
        tableData.value = [];
    } finally {
        internalLoading.value = false;
    }
};

// Initialize on mount
onMounted(async () => {
    fetchTableData();
});

// Fixed: Cleanup on unmount
onBeforeUnmount(() => {
    if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
    }
});

// Format cell data
const formatCellValue = (column: DataTableColumn, row: any): string => {
    const value = row[column.key];

    // Use custom render function if provided
    if (column.renderFn) {
        return column.renderFn(value, row);
    }

    // Use formatter if provided
    if (column.formatter) {
        return column.formatter(value);
    }

    // Default formatting based on value type
    if (value === null || value === undefined) {
        return '';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
};

// Row selection - Fixed to handle object and primitive values properly
const isRowSelected = (row: any): boolean => {
    const rowId = row[props.rowKey];
    return internalSelected.value.some(item => {
        // Handle both object selections and primitive value selections
        if (typeof item === 'object' && item !== null) {
            return item[props.rowKey] === rowId;
        } else {
            return item === rowId;
        }
    });
};

// Fixed toggleRowSelection to handle both object and primitive values
const toggleRowSelection = (row: any, event: MouseEvent): void => {
    if (!props.selectable) return;

    const rowId = row[props.rowKey];
    const isSelected = isRowSelected(row);

    if (props.multiSelect) {
        // Toggle selection in multi-select mode
        if (isSelected) {
            internalSelected.value = internalSelected.value.filter(item => {
                if (typeof item === 'object' && item !== null) {
                    return item[props.rowKey] !== rowId;
                } else {
                    return item !== rowId;
                }
            });
        } else {
            internalSelected.value.push(row);
        }
    } else {
        // Single select mode
        internalSelected.value = isSelected ? [] : [row];
    }
};

const handleRowClick = (row: any, event: MouseEvent): void => {
    emit('row-click', row);

    // Handle selection if selectable and not clicking a control inside the row
    if (props.selectable && event.target instanceof HTMLElement) {
        // Don't trigger selection when clicking interactive elements in the row
        const isInteractiveElement = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(
            event.target.tagName
        );

        if (!isInteractiveElement && !event.target.closest('button, a, input, select, textarea')) {
            toggleRowSelection(row, event);
        }
    }
};

// Sorting
const toggleSort = (column: DataTableColumn): void => {
    if (!props.sortable || !column.sortable) return;

    if (!internalSort.value || internalSort.value.key !== column.key) {
        // New sort
        internalSort.value = { key: column.key, order: 'asc' };
    } else if (internalSort.value.order === 'asc') {
        // Toggle to descending
        internalSort.value = { key: column.key, order: 'desc' };
    } else {
        // Clear sort
        internalSort.value = undefined;
    }
};

const getSortIcon = (column: DataTableColumn): string => {
    if (!props.sortable || !column.sortable) return '';

    if (!internalSort.value || internalSort.value.key !== column.key) {
        return '↕️';
    }

    return internalSort.value.order === 'asc' ? '↑' : '↓';
};

// Pagination controls
const goToPage = (page: number): void => {
    if (page >= 1 && page <= totalPages.value) {
        internalPage.value = page;
    }
};

const goToFirstPage = (): void => goToPage(1);
const goToPrevPage = (): void => goToPage(internalPage.value - 1);
const goToNextPage = (): void => goToPage(internalPage.value + 1);
const goToLastPage = (): void => goToPage(totalPages.value);

// Change page size
const changePageSize = (event: Event): void => {
    const select = event.target as HTMLSelectElement;
    internalPageSize.value = parseInt(select.value, 10);
};

// Refresh table data
const refreshData = (): void => {
    fetchTableData();
    emit('refresh');
};

// Compute table container classes
const tableContainerClasses = computed(() => {
    return [
        'v-data-table',
        'w-full',
        'overflow-x-auto',
        props.bordered ? 'border border-gray-200 rounded-md' : '',
    ].filter(Boolean).join(' ');
});

// Compute table classes
const tableClasses = computed(() => {
    return [
        'min-w-full',
        'divide-y divide-gray-200',
        'text-left',
        props.bordered ? 'border-collapse' : '',
    ].filter(Boolean).join(' ');
});

// Compute header row classes
const headerRowClasses = computed(() => {
    return [
        'bg-gray-100 dark:bg-gray-800',
        props.bordered ? 'border-b border-gray-200' : '',
    ].filter(Boolean).join(' ');
});

// Compute body row classes
const getBodyRowClasses = (row: any, index: number): string => {
    const baseClasses = [
        props.striped && index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : '',
        props.hoverable ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : '',
        props.bordered ? 'border-b border-gray-200' : '',
        props.dense ? 'h-8' : 'h-12',
        isRowSelected(row) ? 'bg-blue-100 dark:bg-blue-900' : '',
    ];

    // Add custom row class if provided
    if (props.rowClass) {
        if (typeof props.rowClass === 'function') {
            baseClasses.push(props.rowClass(row));
        } else {
            baseClasses.push(props.rowClass);
        }
    }

    return baseClasses.filter(Boolean).join(' ');
};

// Compute cell classes
const getCellClasses = (column: DataTableColumn): string => {
    return [
        'px-4 py-2',
        props.dense ? 'py-1' : '',
        column.align === 'center' ? 'text-center' : '',
        column.align === 'right' ? 'text-right' : '',
        column.class || '',
        column.cellClass || '',
    ].filter(Boolean).join(' ');
};

// Compute header cell classes
const getHeaderCellClasses = (column: DataTableColumn): string => {
    return [
        'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
        props.dense ? 'py-2' : '',
        column.align === 'center' ? 'text-center' : '',
        column.align === 'right' ? 'text-right' : '',
        column.sortable ? 'cursor-pointer select-none' : '',
        column.class || '',
        column.headerClass || '',
    ].filter(Boolean).join(' ');
};
</script>