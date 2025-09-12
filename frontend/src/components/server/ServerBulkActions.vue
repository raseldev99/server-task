<template>
  <div>
    <!-- Bulk Actions Toolbar -->
    <Toolbar class="mb-6">
      <template #start>
        <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            variant="outlined"
            :disabled="!hasSelectedServers"
            @click="$emit('bulk-delete')"
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
            @click="handleBulkStatusUpdate"
        />
      </template>
      <template #end>
        <Button
            label="New Server"
            icon="pi pi-plus"
            class="mr-2"
            @click="$emit('new-server')"
        />
      </template>
    </Toolbar>

    <!-- Bulk Status Update Confirmation Dialog -->
    <Dialog
        :visible="bulkStatusDialog"
        :style="{ width: '450px' }"
        header="Confirm Status Update"
        :modal="true"
        @update:visible="bulkStatusDialog = $event"
    >
      <div class="flex items-center gap-4">
        <i class="pi pi-question-circle !text-3xl" />
        <span>
          Are you sure you want to update the status of
          {{ selectedCount }} server(s) to <b>{{ bulkStatus }}</b>?
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
            @click="confirmBulkStatusUpdate"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { STATUS_OPTIONS } from '@/constants/server';
import { Toolbar, Button, Dropdown, Dialog } from 'primevue';

// Props
const props = defineProps({
  selectedServers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits([
  'new-server',
  'bulk-delete',
  'bulk-status-update'
]);

// Local state
const bulkStatus = ref('');
const bulkStatusDialog = ref(false);
const statusOptions = STATUS_OPTIONS;

// Computed
const hasSelectedServers = computed(() => props.selectedServers?.length > 0);
const canUpdateBulkStatus = computed(() => hasSelectedServers.value && bulkStatus.value);
const selectedCount = computed(() => props.selectedServers?.length || 0);

// Event handlers
const handleBulkStatusUpdate = () => {
  if (!canUpdateBulkStatus.value) return;
  bulkStatusDialog.value = true;
};

const confirmBulkStatusUpdate = () => {
  emit('bulk-status-update', {
    serverIds: props.selectedServers.map(server => server.id),
    status: bulkStatus.value
  });
  bulkStatusDialog.value = false;
  bulkStatus.value = '';
};

</script>