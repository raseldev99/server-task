<template>
  <div>
    <div class="card">
      <!-- Toolbar Section -->
      <Toolbar class="mb-6">
        <template #start>
          <Button
              label="New Server"
              icon="pi pi-plus"
              class="mr-2"
              @click="openNew"
          />
          <Button
              label="Delete"
              icon="pi pi-trash"
              severity="danger"
              variant="outlined"
              :disabled="!hasSelectedServers"
              @click="confirmDeleteSelected"
          />
          <Dropdown
              v-model="bulkStatus"
              :options="statusOptions"
              option-label="label"
              option-value="value"
              placeholder="Set Status"
              class="ml-2"
          />
          <Button
              label="Update Status"
              icon="pi pi-refresh"
              severity="secondary"
              variant="outlined"
              :disabled="!canUpdateBulkStatus"
              class="ml-2"
              @click="confirmBulkStatusUpdate"
          />
        </template>
      </Toolbar>

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
          scroll-height="500px"
          filter-display="menu"
          paginator-template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords} servers"
          table-style="min-height: 500px"
          :sort-field="currentSortField"
          :sort-order="currentSortOrder"
          @page="onPageChange"
          @filter="onFilter"
          @sort="onSort"
      >
        <template #header>
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="flex justify-between w-full">
              <Button
                  type="button"
                  icon="pi pi-filter-slash"
                  label="Clear"
                  variant="outlined"
                  @click="clearFilter"
              />
              <IconField>
                <InputIcon>
                  <i class="pi pi-search" />
                </InputIcon>
                <InputText
                    v-model="globalFilterValue"
                    placeholder="Search servers..."
                    @input="onGlobalFilterChange"
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
                @click="toggleMenu($event, slotProps.data)"
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

    <!-- Server Dialog -->
    <Dialog
        v-model:visible="serverDialog"
        :style="{ width: '700px' }"
        header="Server Details"
        :modal="true"
        @hide="resetServerForm"
    >
      <Form @submit="handleSubmit" id="serverForm" :initial-values="serverForm" :validation-schema="serverValidationSchema">
        <div class="flex flex-col gap-6">
          <!-- Server Name and IP Address -->
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="name" class="block font-bold mb-3">Server Name</label>
              <Field v-slot="{ field, errorMessage }" name="name">
                <InputText
                    id="name"
                    v-bind="field"
                    v-model="serverForm.name"
                    autofocus
                    :invalid="!!errorMessage"
                    fluid
                />
              </Field>
              <ErrorMessage name="name" class="text-red-500 text-sm mt-1" />
            </div>

            <div class="col-span-6">
              <label for="ip_address" class="block font-bold mb-3">IP Address</label>
              <Field v-slot="{ field, errorMessage }" name="ip_address">
                <InputText
                    id="ip_address"
                    v-bind="field"
                    v-model="serverForm.ip_address"
                    placeholder="192.168.1.100"
                    :invalid="!!errorMessage"
                    fluid
                />
              </Field>
              <ErrorMessage name="ip_address" class="text-red-500 text-sm mt-1" />
            </div>
          </div>

          <!-- Provider and Status -->
          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="provider" class="block font-bold mb-3">Provider</label>
              <Field v-slot="{ errorMessage, handleChange, handleBlur, value }" name="provider">
                <Select
                    id="provider"
                    @update:modelValue="handleChange"
                    @blur="handleBlur"
                    :modelValue="value"
                    :options="providerOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select Provider"
                    :invalid="!!errorMessage"
                    fluid
                />
              </Field>
              <ErrorMessage name="provider" class="text-red-500 text-sm mt-1" />
            </div>

            <div class="col-span-6">
              <label for="status" class="block font-bold mb-3">Status</label>
              <Field name="status" v-slot="{ errorMessage, handleChange, handleBlur, value }">
                <Select
                    id="status"
                    :modelValue="value"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="Select Status"
                   :invalid="!!errorMessage"
                   fluid
                  @update:modelValue="handleChange"
                  @blur="handleBlur"
                />
              </Field>
              <ErrorMessage name="status" class="text-red-500 text-sm mt-1" />
            </div>
          </div>

          <!-- CPU Cores -->
          <div>
            <label for="cpu_cores" class="block font-bold mb-3">
              CPU Cores: {{ serverForm.cpu_cores }}
            </label>
            <Field v-slot="{ field, errorMessage }" name="cpu_cores">
              <Slider
                  id="cpu_cores"
                  v-bind="field"
                  v-model="serverForm.cpu_cores"
                  :min="1"
                  :max="128"
                  :invalid="!!errorMessage"
                  class="mb-2"
              />
            </Field>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>1 Core</span>
              <span>128 Cores</span>
            </div>
            <ErrorMessage name="cpu_cores" class="text-red-500 text-sm" />
          </div>

          <!-- RAM -->
          <div>
            <label for="ram_mb" class="block font-bold mb-3">
              RAM: {{ formatMemory(serverForm.ram_mb) }}
            </label>
            <Field v-slot="{ field, errorMessage }" name="ram_mb">
              <Slider
                  id="ram_mb"
                  v-bind="field"
                  v-model="serverForm.ram_mb"
                  :min="512"
                  :max="1048576"
                  :step="512"
                  :invalid="!!errorMessage"
                  class="mb-2"
              />
            </Field>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>512 MB</span>
              <span>1 TB</span>
            </div>
            <ErrorMessage name="ram_mb" class="text-red-500 text-sm" />
          </div>

          <!-- Storage -->
          <div>
            <label for="storage_gb" class="block font-bold mb-3">
              Storage: {{ serverForm.storage_gb }} GB
            </label>
            <Field v-slot="{ field, errorMessage }" name="storage_gb">
              <Slider
                  id="storage_gb"
                  v-bind="field"
                  v-model="serverForm.storage_gb"
                  :min="10"
                  :max="1048576"
                  :step="10"
                  :invalid="!!errorMessage"
                  class="mb-2"
              />
            </Field>
            <div class="flex justify-between text-sm text-gray-600 mb-2">
              <span>10 GB</span>
              <span>1 PB</span>
            </div>
            <ErrorMessage name="storage_gb" class="text-red-500 text-sm" />
          </div>
        </div>
      </Form>
      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            text
            @click="hideDialog"
        />
        <Button
            type="submit"
            label="Save"
            form="serverForm"
            icon="pi pi-check"
            :loading="loading"
        />
      </template>
    </Dialog>

    <!-- Delete Server Dialog -->
    <Dialog
        v-model:visible="deleteServerDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="server">
          Are you sure you want to delete <b>{{ server.name }}</b>?
        </span>
      </div>
      <template #footer>
        <Button
            label="No"
            icon="pi pi-times"
            text
            severity="secondary"
            @click="deleteServerDialog = false"
        />
        <Button
            label="Yes"
            icon="pi pi-check"
            severity="danger"
            :loading="loading"
            @click="deleteServer"
        />
      </template>
    </Dialog>

    <!-- Delete Multiple Servers Dialog -->
    <Dialog
        v-model:visible="deleteServersDialog"
        :style="{ width: '450px' }"
        header="Confirm"
        :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span>Are you sure you want to delete the selected servers?</span>
      </div>
      <template #footer>
        <Button
            label="No"
            icon="pi pi-times"
            text
            severity="secondary"
            @click="deleteServersDialog = false"
        />
        <Button
            label="Yes"
            icon="pi pi-check"
            severity="danger"
            :loading="loading"
            @click="deleteSelectedServers"
        />
      </template>
    </Dialog>

    <!-- Bulk Status Update Dialog -->
    <Dialog
        v-model:visible="bulkStatusDialog"
        :style="{ width: '450px' }"
        header="Confirm Status Update"
        :modal="true"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-question-circle !text-3xl" />
        <span>
          Are you sure you want to update the status of
          {{ selectedServers.length }} server(s) to <b>{{ bulkStatus }}</b>?
        </span>
      </div>
      <template #footer>
        <Button
            label="No"
            icon="pi pi-times"
            text
            severity="secondary"
            @click="bulkStatusDialog = false"
        />
        <Button
            label="Yes"
            icon="pi pi-check"
            :loading="loading"
            @click="updateSelectedServersStatus"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, onBeforeMount} from 'vue';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { useServerStore } from '@/stores/serverStore';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
// PrimeVue Components
import {
  Toolbar,
  DataTable,
  InputNumber,
  Dialog,
  Button,
  Select,
  Textarea,
  Tag,
  IconField,
  InputText,
  InputIcon,
  Column,
  Dropdown,
  Menu,
  Slider
} from 'primevue';

// Constants
const STATUSES = ['active', 'inactive', 'maintenance'];
const PROVIDERS = ['aws', 'digitalocean', 'vultr', 'other'];

const DEFAULT_SERVER = {
  name: '',
  ip_address: '',
  provider: '',
  status: 'inactive',
  cpu_cores: 1,
  ram_mb: 512,
  storage_gb: 10
};

// Validation Schema using Yup
const serverValidationSchema = yup.object({
  name: yup.string()
      .required('Server name is required')
      .min(3, 'Server name must be at least 3 characters')
      .max(100, 'Server name must not exceed 100 characters'),

  ip_address: yup.string()
      .required('IP address is required')
      .matches(
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
          'Please enter a valid IP address'
      ),

  provider: yup.string()
      .required('Provider is required')
      .oneOf(PROVIDERS, 'Please select a valid provider'),

  status: yup.string()
      .required('Status is required')
      .oneOf(STATUSES, 'Please select a valid status'),

  cpu_cores: yup.number()
      .required('CPU cores is required')
      .integer('CPU cores must be a whole number')
      .min(1, 'Minimum 1 CPU core required')
      .max(128, 'Maximum 128 CPU cores allowed'),

  ram_mb: yup.number()
      .required('RAM is required')
      .integer('RAM must be a whole number')
      .min(512, 'Minimum 512 MB RAM required')
      .max(1048576, 'Maximum 1 TB RAM allowed'),

  storage_gb: yup.number()
      .required('Storage is required')
      .integer('Storage must be a whole number')
      .min(10, 'Minimum 10 GB storage required')
      .max(1048576, 'Maximum 1 PB storage allowed')
});

// Store and composables
const serverStore = useServerStore();
const toast = useToast();

// Reactive state
const dt = ref();
const menu = ref();
const serverDialog = ref(false);
const deleteServerDialog = ref(false);
const deleteServersDialog = ref(false);
const bulkStatusDialog = ref(false);
const server = ref({ ...DEFAULT_SERVER });
const serverForm = ref({ ...DEFAULT_SERVER });
const selectedServers = ref([]);
const bulkStatus = ref('');
const filters = ref({});
const globalFilterValue = ref('');
const currentContextServer = ref(null);

// Table state management
const currentPage = ref(1);
const currentPerPage = ref(10);
const currentSortField = ref(null);
const currentSortOrder = ref(0);
const globalFilterTimeout = ref(null);

// Configuration
const rowsPerPageOptions = ref([5, 10, 25, 50]);
const globalFilterFields = ref(['name', 'ip_address', 'cpu_cores', 'provider', 'status']);

// Static options
const statuses = ref(STATUSES);
const providers = ref(PROVIDERS);

const statusOptions = ref([
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Maintenance', value: 'maintenance' }
]);

const providerOptions = ref([
  { label: 'Amazon Web Services', value: 'aws' },
  { label: 'DigitalOcean', value: 'digitalocean' },
  { label: 'Vultr', value: 'vultr' },
  { label: 'Other', value: 'other' }
]);

// Computed properties
const servers = computed(() => serverStore.servers);
const totalRecords = computed(() => serverStore.pagination?.total || 0);
const loading = computed(() => serverStore.loading);
const hasSelectedServers = computed(() => selectedServers.value?.length > 0);
const canUpdateBulkStatus = computed(() => hasSelectedServers.value && bulkStatus.value);

// Context menu items
const contextMenuItems = computed(() => [
  {
    label: 'View',
    icon: 'pi pi-eye',
    command: () => viewServer(currentContextServer.value)
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => editServer(currentContextServer.value)
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => confirmDeleteServer(currentContextServer.value)
  }
]);

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

// Global filter handler with improved debouncing
const onGlobalFilterChange = (event) => {
  const value = event.target.value;
  filters.value.global.value = value;

  // Clear existing timeout
  if (globalFilterTimeout.value) {
    clearTimeout(globalFilterTimeout.value);
  }

  // Set new timeout for debounced search
  globalFilterTimeout.value = setTimeout(async () => {
    // Reset to first page when searching
    currentPage.value = 1;
    await loadServersWithCurrentState();
  }, 300);
};

// Load servers with current state
const loadServersWithCurrentState = async () => {
  try {
    const params = getCurrentFilterParams();
    await serverStore.fetchServers(params);
  } catch (error) {
    console.error('Failed to load servers:', error);
    showToast('error', 'Error', 'Failed to load servers');
  }
};

// Utility functions
const formatMemory = (mb) => {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${mb} MB`;
};

const getStatusSeverity = (status) => {
  const statusMap = {
    active: 'success',
    inactive: 'secondary',
    maintenance: 'warn'
  };
  return statusMap[status] || 'info';
};

const getProviderSeverity = (provider) => {
  const providerMap = {
    aws: 'info',
    digitalocean: 'primary',
    vultr: 'secondary',
    other: 'contrast'
  };
  return providerMap[provider] || 'info';
};

const showToast = (severity, summary, detail) => {
  toast.add({ severity, summary, detail, life: 3000 });
};

const resetServerForm = () => {
  serverForm.value = { ...DEFAULT_SERVER };
  server.value = { ...DEFAULT_SERVER };
};

// Dialog management
const openNew = () => {
  resetServerForm();
  serverDialog.value = true;
};

const hideDialog = () => {
  serverDialog.value = false;
  resetServerForm();
};

// Form submission handler
const handleSubmit = async (values,actions) => {
  try {
    if (serverForm.value.id) {
      await serverStore.updateServer(serverForm.value.id, values);
      showToast('success', 'Success', 'Server updated successfully');
    } else {
      await serverStore.createServer(values);
      showToast('success', 'Success', 'Server created successfully');
    }
    hideDialog();
    await loadServersWithCurrentState();
  } catch (error) {
    if(error.status === 422){
      actions.setErrors(error.response?.data?.errors || {})
    }else {
      showToast('error', 'Error', serverStore.error || 'Failed to save server');
    }
  }
};

// Server operations
const viewServer = (serverData) => {
  if (!serverData) return;
  showToast('info', 'View Server', `Viewing server: ${serverData.name}`);
  // Implement view logic here
};

const editServer = (serverData) => {
  if (!serverData) return;
  serverForm.value = { ...serverData };
  serverDialog.value = true;
};

const confirmDeleteServer = (serverData) => {
  if (!serverData) return;
  server.value = serverData;
  deleteServerDialog.value = true;
};

const deleteServer = async () => {
  if (!server.value?.id) return;

  try {
    await serverStore.deleteServer(server.value.id);
    deleteServerDialog.value = false;
    resetServerForm();
    await loadServersWithCurrentState();
    showToast('success', 'Success', 'Server deleted successfully');
  } catch (error) {
    console.error('Failed to delete server:', error);
    showToast('error', 'Error', serverStore.error || 'Failed to delete server');
  }
};

// Bulk operations
const confirmDeleteSelected = () => {
  if (!hasSelectedServers.value) return;
  deleteServersDialog.value = true;
};

const deleteSelectedServers = async () => {
  if (!hasSelectedServers.value) return;

  try {
    const serverIds = selectedServers.value.map(server => server.id);
    await serverStore.bulkDeleteServers(serverIds);
    deleteServersDialog.value = false;
    selectedServers.value = [];
    await loadServersWithCurrentState();
    showToast('success', 'Success', 'Servers deleted successfully');
  } catch (error) {
    console.error('Failed to delete servers:', error);
    showToast('error', 'Error', serverStore.error || 'Failed to delete servers');
  }
};

const confirmBulkStatusUpdate = () => {
  if (!canUpdateBulkStatus.value) return;
  bulkStatusDialog.value = true;
};

const updateSelectedServersStatus = async () => {
  if (!canUpdateBulkStatus.value) return;

  try {
    const serverIds = selectedServers.value.map(server => server.id);
    await serverStore.bulkUpdateStatus(serverIds, bulkStatus.value);
    bulkStatusDialog.value = false;
    selectedServers.value = [];
    bulkStatus.value = '';
    await loadServersWithCurrentState();
    showToast('success', 'Success', 'Server statuses updated successfully');
  } catch (error) {
    console.error('Failed to update server statuses:', error);
    showToast('error', 'Error', serverStore.error || 'Failed to update server statuses');
  }
};

// Table event handlers
const onPageChange = async (event) => {
  currentPage.value = event.page + 1;
  currentPerPage.value = event.rows;
  await loadServersWithCurrentState();
};

const onFilter = async (event) => {
  // Update filters but reset to first page
  filters.value = { ...event.filters };
  currentPage.value = 1;
  await loadServersWithCurrentState();
};

const onSort = async (event) => {
  currentSortField.value = event.sortField;
  currentSortOrder.value = event.sortOrder;
  await loadServersWithCurrentState();
};

const clearFilter = async () => {
  initFilters();
  globalFilterValue.value = '';
  currentPage.value = 1;
  currentSortField.value = null;
  currentSortOrder.value = 0;

  // Clear any pending search timeout
  if (globalFilterTimeout.value) {
    clearTimeout(globalFilterTimeout.value);
    globalFilterTimeout.value = null;
  }

  await loadServersWithCurrentState();
};

const toggleMenu = (event, serverData) => {
  currentContextServer.value = serverData;
  menu.value.toggle(event);
};

onBeforeMount(() => {
  initFilters();
});

// Lifecycle
onMounted(async () => {
  await loadServersWithCurrentState();
});
</script>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}

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