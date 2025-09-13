<template>
  <div class="card">
    <!-- Bulk Actions -->
    <ServerBulkActions
        :selected-servers="selectedServers"
        :loading="loading"
        @new-server="handleNewServer"
        @bulk-delete="handleBulkDelete"
        @bulk-status-update="handleBulkStatusUpdate"
    />

    <!-- Server Table -->
    <ServerTable
        ref="serverTableRef"
        :selected-servers="selectedServers"
        :filters="filters"
        :servers="servers"
        :total-records="totalRecords"
        :loading="loading"
        :global-filter-value="globalFilterValue"
        :current-per-page="currentPerPage"
        :current-sort-field="currentSortField"
        :current-sort-order="currentSortOrder"
        :rows-per-page-options="rowsPerPageOptions"
        :global-filter-fields="globalFilterFields"
        :statuses="statuses"
        :providers="providers"
        :format-memory="formatMemory"
        :get-status-severity="getStatusSeverity"
        :get-provider-severity="getProviderSeverity"
        :context-menu-items="contextMenuItems"
        @update:selected-servers="selectedServers = $event"
        @update:filters="filters = $event"
        @page-change="onPageChange"
        @filter="onFilter"
        @sort="onSort"
        @clear-filter="clearFilter"
        @global-filter-change="onGlobalFilterChange"
        @update:global-filter-value="globalFilterValue = $event"
        @toggle-menu="toggleMenu"
    />

    <!-- Server Form Dialog -->
    <ServerForm
        :visible="serverFormDialog.visible.value"
        :server-data="serverFormDialog.data.value"
        :loading="loading"
        @update:visible="serverFormDialog.visible.value = $event"
        @submit="handleServerFormSubmit"
        @cancel="serverFormDialog.close()"
    />

    <!-- Delete Confirmation Dialogs -->
    <ServerDeleteDialog
        :visible="deleteDialog.visible.value"
        mode="single"
        :server-data="deleteDialog.data.value"
        :loading="loading"
        @update:visible="deleteDialog.visible.value = $event"
        @confirm="handleDeleteServer"
        @cancel="deleteDialog.close()"
    />

    <ServerDeleteDialog
        :visible="deleteMultipleDialog.visible.value"
        mode="multiple"
        :loading="loading"
        @update:visible="deleteMultipleDialog.visible.value = $event"
        @confirm="handleDeleteMultipleServers"
        @cancel="deleteMultipleDialog.close()"
    />

    <!-- Server View Modal -->
    <ModalView
        :visible="viewServerModal.visible.value"
        :server-data="viewServerModal.data.value"
        :server-id="currentServerId"
        :loading="serverViewLoading"
        :error="serverViewError"
        @update:visible="viewServerModal.visible.value = $event"
        @retry="handleServerViewRetry"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useServerTable } from '@/composables/useServerTable';
import { useServerCrud } from '@/composables/useServerCrud';
import { useDialog } from '@/composables/useDialog';

// Import components
import ServerBulkActions from '@/components/server/ServerBulkActions.vue';
import ServerTable from '@/components/server/ServerTable.vue';
import ServerForm from '@/components/server/ServerForm.vue';
import ServerDeleteDialog from '@/components/server/ServerDeleteDialog.vue';
import ModalView from "@/components/server/ModalView.vue";

// Composables
const {
  // State
  selectedServers,
  filters,
  globalFilterValue,
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
  clearSelection
} = useServerTable();

const {
  serverForm,
  loading: crudLoading,
  createServer,
  updateServer,
  deleteServer,
  bulkDeleteServers,
  bulkUpdateStatus,
  fetchServer,
  populateForm,
  resetForm
} = useServerCrud();

// Dialog composables
const serverFormDialog = useDialog();
const deleteDialog = useDialog();
const deleteMultipleDialog = useDialog();
const viewServerModal = useDialog();

// Additional state for server view
const currentServerId = ref(null);
const serverViewLoading = ref(false);
const serverViewError = ref(null);
const currentContextServer = ref(null);
const serverTableRef = ref();

// Context menu items
const contextMenuItems = computed(() => [
  {
    label: 'View',
    icon: 'pi pi-eye',
    command: () => handleViewServer(currentContextServer.value)
  },
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => handleEditServer(currentContextServer.value)
  },
  {
    separator: true
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => handleDeleteConfirm(currentContextServer.value)
  }
]);

// Event handlers
const handleNewServer = () => {
  resetForm();
  serverFormDialog.open();
};

const handleEditServer = (serverData) => {
  populateForm(serverData);
  serverFormDialog.open(serverData);
};

const handleDeleteConfirm = (serverData) => {
  deleteDialog.open(serverData);
};

const handleBulkDelete = () => {
  deleteMultipleDialog.open();
};

const handleServerFormSubmit = async (values, actions) => {
  try {
    let success = false;

    if (serverFormDialog.data.value?.id) {
      success = await updateServer(serverFormDialog.data.value.id, values);
    } else {
      success = await createServer(values);
    }

    if (success) {
      serverFormDialog.close();
      await loadServers();
    }
  } catch (error) {
    if (error.status === 422 && actions) {
      actions.setErrors(error.response?.data?.errors || {});
    }
  }
};

const handleDeleteServer = async () => {
  if (!deleteDialog.data.value?.id) return;

  const success = await deleteServer(deleteDialog.data.value.id);
  if (success) {
    deleteDialog.close();
    await loadServers();
  }
};

const handleDeleteMultipleServers = async () => {
  if (!selectedServers.value?.length) return;

  const serverIds = selectedServers.value.map(server => server.id);
  const success = await bulkDeleteServers(serverIds);

  if (success) {
    deleteMultipleDialog.close();
    clearSelection();
    await loadServers();
  }
};

const handleBulkStatusUpdate = async ({ serverIds, status }) => {
  const success = await bulkUpdateStatus(serverIds, status);

  if (success) {
    clearSelection();
    await loadServers();
  }
};

const handleViewServer = async (serverData) => {
  if (!serverData?.id) return;

  try {
    currentServerId.value = serverData.id;
    viewServerModal.open();
    serverViewLoading.value = true;
    serverViewError.value = null;

    const detailedServer = await fetchServer(serverData.id);
    viewServerModal.data.value = detailedServer || serverData;
  } catch (error) {
    console.error('Failed to fetch server details:', error);
    serverViewError.value = error.message || 'Failed to load server details';
    viewServerModal.data.value = serverData;
  } finally {
    serverViewLoading.value = false;
  }
};

const handleServerViewRetry = async (serverId) => {
  if (!serverId) return;

  try {
    serverViewLoading.value = true;
    serverViewError.value = null;

    const serverData = await fetchServer(serverId);
    if (serverData) {
      viewServerModal.data.value = serverData;
    }
  } catch (error) {
    console.error('Retry failed:', error);
    serverViewError.value = error.message || 'Failed to load server details';
  } finally {
    serverViewLoading.value = false;
  }
};

const toggleMenu = (event, serverData) => {
  currentContextServer.value = serverData;
  serverTableRef.value?.menu?.toggle(event);
};

const resetServerViewState = () => {
  currentServerId.value = null;
  serverViewLoading.value = false;
  serverViewError.value = null;
};

// Lifecycle
onMounted(async () => {
  await loadServers();
});
</script>

<style scoped>
.card {
  background: var(--surface-card);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
}
</style>