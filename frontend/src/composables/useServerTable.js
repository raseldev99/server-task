import { ref, computed, onBeforeMount } from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useServerStore } from '@/stores/serverStore';
import {
    ROWS_PER_PAGE_OPTIONS,
    GLOBAL_FILTER_FIELDS,
    STATUSES,
    PROVIDERS,
    STATUS_SEVERITY_MAP,
    PROVIDER_SEVERITY_MAP
} from '@/constants/server';
import {formatMemory} from "@/utils/format.js";

export function useServerTable() {
    const serverStore = useServerStore();

    // Table state
    const selectedServers = ref([]);
    const filters = ref({});
    const globalFilterValue = ref('');
    const currentPage = ref(1);
    const currentPerPage = ref(10);
    const currentSortField = ref(null);
    const currentSortOrder = ref(0);
    const globalFilterTimeout = ref(null);

    // Configuration
    const rowsPerPageOptions = ref(ROWS_PER_PAGE_OPTIONS);
    const globalFilterFields = ref(GLOBAL_FILTER_FIELDS);
    const statuses = ref(STATUSES);
    const providers = ref(PROVIDERS);

    // Computed properties
    const servers = computed(() => serverStore.servers);
    const totalRecords = computed(() => serverStore.pagination?.total || 0);
    const loading = computed(() => serverStore.loading);
    const hasSelectedServers = computed(() => selectedServers.value?.length > 0);


    const getStatusSeverity = (status) => STATUS_SEVERITY_MAP[status] || 'info';
    const getProviderSeverity = (provider) => PROVIDER_SEVERITY_MAP[provider] || 'info';

    // Filter initialization
    const initFilters = () => {
        filters.value = {
            global: { value: null, matchMode: FilterMatchMode.CONTAINS },
            status: { value: null, matchMode: FilterMatchMode.IN },
            provider: { value: null, matchMode: FilterMatchMode.IN },
            cpu_cores: { value: null, matchMode: FilterMatchMode.BETWEEN }
        };
    };

    // Get current filter params
    const getCurrentFilterParams = () => {
        return {
            search: filters.value.global?.value || null,
            provider: filters.value.provider?.value || null,
            status: filters.value.status?.value || null,
            min_cpu: filters.value.cpu_cores?.value ? filters.value.cpu_cores.value[0] : null,
            max_cpu: filters.value.cpu_cores?.value ? filters.value.cpu_cores.value[1] : null,
            sort_field: currentSortField.value || null,
            sort_order: currentSortOrder.value > 0 ? 'asc' : 'desc',
            page: currentPage.value,
            perPage: currentPerPage.value
        };
    };

    // Load servers with current state
    const loadServers = async () => {
        try {
            const params = getCurrentFilterParams();
            await serverStore.fetchServers(params);
        } catch (error) {
            console.error('Failed to load servers:', error);
            throw error;
        }
    };

    // Global filter handler with debouncing
    const onGlobalFilterChange = (event) => {
        const value = event.target.value;
        filters.value.global.value = value;

        if (globalFilterTimeout.value) {
            clearTimeout(globalFilterTimeout.value);
        }

        globalFilterTimeout.value = setTimeout(async () => {
            currentPage.value = 1;
            await loadServers();
        }, 300);
    };

    // Table event handlers
    const onPageChange = async (event) => {
        currentPage.value = event.page + 1;
        currentPerPage.value = event.rows;
        await loadServers();
    };

    const onFilter = async (event) => {
        filters.value = { ...event.filters };
        currentPage.value = 1;
        await loadServers();
    };

    const onSort = async (event) => {
        currentSortField.value = event.sortField;
        currentSortOrder.value = event.sortOrder;
        await loadServers();
    };

    const clearFilter = async () => {
        initFilters();
        globalFilterValue.value = '';
        currentPage.value = 1;
        currentSortField.value = null;
        currentSortOrder.value = 0;

        if (globalFilterTimeout.value) {
            clearTimeout(globalFilterTimeout.value);
            globalFilterTimeout.value = null;
        }

        await loadServers();
    };

    const clearSelection = () => {
        selectedServers.value = [];
    };

    // Initialize filters on mount
    onBeforeMount(() => {
        initFilters();
    });

    return {
        // State
        selectedServers,
        filters,
        globalFilterValue,
        currentPage,
        currentPerPage,
        currentSortField,
        currentSortOrder,

        // Configuration
        rowsPerPageOptions,
        globalFilterFields,
        statuses,
        providers,

        // Computed
        servers,
        totalRecords,
        loading,
        hasSelectedServers,

        // Methods
        formatMemory,
        getStatusSeverity,
        getProviderSeverity,
        loadServers,
        onGlobalFilterChange,
        onPageChange,
        onFilter,
        onSort,
        clearFilter,
        clearSelection,
        getCurrentFilterParams
    };
}