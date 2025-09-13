<template>
  <div>
    <!-- Data Table Section -->
    <DataTable
        ref="dt"
        v-model:selection="selectedServers"
        v-model:filters="filters"
        :value="servers"
        :lazy="true"
        :total-records="totalRecords"
        :loading="loading"
        :rows="currentPerPage"
        :rows-per-page-options="rowsPerPageOptions"
        :global-filter-fields="globalFilterFields"
        data-key="id"
        paginator
        scrollable
        scroll-height="700px"
        filter-display="menu"
        paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        current-page-report-template="Showing {first} to {last} of {totalRecords} servers"
        table-style="min-height: 700px"
        :sort-field="currentSortField"
        :sort-order="currentSortOrder"
        @page="$emit('page-change', $event)"
        @filter="$emit('filter', $event)"
        @sort="$emit('sort', $event)"
    >
      <template #header>
        <div class="flex flex-wrap gap-2 items-center justify-between">
          <div class="flex justify-between w-full">
            <Button
                type="button"
                icon="pi pi-filter-slash"
                label="Clear"
                variant="outlined"
                @click="$emit('clear-filter')"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                  :model-value="globalFilterValue"
                  placeholder="Search servers..."
                  @input="$emit('global-filter-change', $event)"
                  @update:model-value="$emit('update:global-filter-value', $event)"
              />
            </IconField>
          </div>
        </div>
      </template>

      <!-- Table Columns -->
      <Column
          selection-mode="multiple"
          style="width: 3rem"
          :exportable="false"
      />

      <Column
          field="name"
          header="Name"
          sortable
          style="min-width: 16rem"
      />

      <Column
          field="ip_address"
          header="IP Address"
          sortable
          style="min-width: 12rem"
      />

      <Column
          field="cpu_cores"
          header="Cores"
          sortable
          :show-filter-match-modes="false"
          style="min-width: 10rem"
      >
        <template #filter="{ filterModel }">
          <Slider
              v-model="filterModel.value"
              range
              class="m-4"
              :min="1"
              :max="128"
          />
          <div class="flex items-center justify-between px-2">
            <span>1</span>
            <span>128</span>
          </div>
        </template>
      </Column>

      <Column
          field="ram_mb"
          header="RAM (MB)"
          sortable
          style="min-width: 10rem"
      >
        <template #body="slotProps">
          {{ formatMemory(slotProps.data.ram_mb) }}
        </template>
      </Column>

      <Column
          field="storage_gb"
          header="Storage (GB)"
          sortable
          style="min-width: 10rem"
      />

      <Column
          field="provider"
          header="Provider"
          sortable
          :show-filter-match-modes="false"
          style="min-width: 15rem"
      >
        <template #body="slotProps">
          <Tag
              :value="slotProps.data.provider.toUpperCase()"
              :severity="getProviderSeverity(slotProps.data.provider)"
          />
        </template>
        <template #filter="{ filterModel }">
          <Select
              v-model="filterModel.value"
              :options="providers"
              placeholder="Select One"
              show-clear
          />
        </template>
      </Column>

      <Column
          field="status"
          header="Status"
          :filter-menu-style="{ width: '14rem' }"
          :show-filter-match-modes="false"
          style="min-width: 8rem"
      >
        <template #body="slotProps">
          <Tag
              :value="slotProps.data.status"
              :severity="getStatusSeverity(slotProps.data.status)"
          />
        </template>
        <template #filter="{ filterModel }">
          <Select
              v-model="filterModel.value"
              :options="statuses"
              placeholder="Select One"
              show-clear
          >
            <template #option="slotProps">
              <Tag
                  :value="slotProps.option"
                  :severity="getStatusSeverity(slotProps.option)"
              />
            </template>
          </Select>
        </template>
      </Column>

      <Column
          :exportable="false"
          style="min-width: 5rem"
      >
        <template #body="slotProps">
          <Button
              icon="pi pi-ellipsis-v"
              class="p-button-text p-button-secondary"
              @click="$emit('toggle-menu', $event, slotProps.data)"
          />
        </template>
      </Column>

      <template #empty>
        <div class="text-center py-6 text-gray-500">
          No records found.
        </div>
      </template>
    </DataTable>

    <!-- Context Menu -->
    <Menu
        ref="menu"
        :model="contextMenuItems"
        :popup="true"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  DataTable,
  Button,
  Select,
  Tag,
  IconField,
  InputText,
  InputIcon,
  Column,
  Menu,
  Slider
} from 'primevue';

// Props
const props = defineProps({
  servers: {
    type: Array,
    default: () => []
  },
  selectedServers: {
    type: Array,
    default: () => []
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  globalFilterValue: {
    type: String,
    default: ''
  },
  currentPerPage: {
    type: Number,
    default: 10
  },
  currentSortField: {
    type: String,
    default: null
  },
  currentSortOrder: {
    type: Number,
    default: 0
  },
  rowsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50]
  },
  globalFilterFields: {
    type: Array,
    default: () => ['name', 'ip_address', 'cpu_cores', 'provider', 'status']
  },
  statuses: {
    type: Array,
    default: () => []
  },
  providers: {
    type: Array,
    default: () => []
  },
  formatMemory: {
    type: Function,
    required: true
  },
  getStatusSeverity: {
    type: Function,
    required: true
  },
  getProviderSeverity: {
    type: Function,
    required: true
  },
  contextMenuItems: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits([
  'update:selectedServers',
  'update:filters',
  'page-change',
  'filter',
  'sort',
  'clear-filter',
  'global-filter-change',
  'update:global-filter-value',
  'toggle-menu'
]);

// Refs
const dt = ref();
const menu = ref();

// Computed
const selectedServers = computed({
  get: () => props.selectedServers,
  set: (value) => emit('update:selectedServers', value)
});

const filters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
});

// Remove these computed properties since we're using direct binding now

// Expose methods for parent component
defineExpose({
  menu
});
</script>

<style scoped>
.p-datatable .p-datatable-header {
  border-top: 1px solid var(--surface-border);
  padding: 1rem 1rem;
  background: var(--surface-section);
}

.p-button.p-button-text.p-button-secondary {
  color: var(--text-color-secondary);
}

.p-button.p-button-text.p-button-secondary:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.p-slider .p-slider-handle {
  height: 1.2rem;
  width: 1.2rem;
}

.p-slider .p-slider-range {
  background: var(--primary-color);
}
</style>