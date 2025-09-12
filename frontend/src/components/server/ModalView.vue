<template>
  <Dialog
      v-model:visible="isVisible"
      header="Server Details"
      :modal="true"
      :style="{ width: '600px' }"
      :closable="true"
      @hide="handleClose"
  >
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col gap-4 p-4">
      <div class="flex flex-col gap-3">
        <Skeleton width="100%" height="1.5rem" />
        <Skeleton width="80%" height="1.5rem" />
        <Skeleton width="90%" height="1.5rem" />
        <Skeleton width="70%" height="1.5rem" />
        <Skeleton width="85%" height="1.5rem" />
        <Skeleton width="60%" height="1.5rem" />
      </div>
      <Divider />
      <div class="flex flex-col gap-3">
        <Skeleton width="75%" height="1.5rem" />
        <Skeleton width="90%" height="1.5rem" />
        <Skeleton width="80%" height="1.5rem" />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center gap-4 p-6 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-500"></i>
      <div>
        <h3 class="text-xl font-semibold mb-2">Error Loading Server</h3>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <Button
            label="Retry"
            icon="pi pi-refresh"
            @click="$emit('retry', serverId)"
            outlined
        />
      </div>
    </div>

    <!-- Content State -->
    <div v-else-if="serverData" class="p-4 space-y-6 bg-white rounded-2xl shadow-sm">
      <!-- Server Information -->
      <h4 class="text-lg font-semibold mb-2 flex items-center gap-2">
        <i class="pi pi-server text-indigo-500"></i> Server Details
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <!--  Name -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">Server Name</label>
          <span class="text-sm font-medium">{{ serverData.name }}</span>
        </div>

        <!-- IP & Provider -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">IP Address</label>
          <div class="flex items-center gap-2">
            <span class="text-sm font-mono">{{ serverData.ip_address }}</span>
            <Button icon="pi pi-copy" size="small" text rounded @click="copyToClipboard(serverData?.ip_address)" v-tooltip.top="'Copy IP'"/>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">Provider</label>
          <Tag :value="serverData?.provider?.toUpperCase()" :severity="getProviderSeverity(serverData?.provider)" class="w-fit"/>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">Status</label>
          <Tag :value="serverData?.status" :severity="getStatusSeverity(serverData?.status)" class="w-fit"/>
        </div>

        <!-- CPU / RAM / Storage -->
        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">CPU</label>
          <div class="flex items-center gap-2">
            <i class="pi pi-microchip text-blue-500"></i>
            <span class="text-sm">{{ serverData?.cpu_cores }} {{ serverData.cpu_cores === 1 ? 'Core' : 'Cores' }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">RAM</label>
          <div class="flex items-center gap-2">
            <i class="pi pi-database text-green-500"></i>
            <span class="text-sm">{{ formatMemory(serverData.ram_mb) }}</span>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-xs font-semibold text-gray-500">Storage</label>
          <div class="flex items-center gap-2">
            <i class="pi pi-hard-drive text-purple-500"></i>
            <span class="text-sm">{{ formatStorage(serverData.storage_gb) }}</span>
          </div>
        </div>
      </div>

      <!-- Owner Information -->
      <Divider />
      <div v-if="serverData.user">
        <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <i class="pi pi-user text-blue-500"></i> Owner Information
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-xs font-semibold text-gray-500">Name</label>
            <span class="text-sm">{{ serverData.user.name }}</span>
          </div>

          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-xs font-semibold text-gray-500">Email</label>
            <div class="flex items-center gap-2">
              <span class="text-sm">{{ serverData.user.email }}</span>
              <Button icon="pi pi-envelope" size="small" text rounded @click="openEmailClient(serverData.user.email)" v-tooltip.top="'Send Email'"/>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Empty State -->
    <div v-else class="flex flex-col items-center gap-4 p-6 text-center">
      <i class="pi pi-info-circle text-6xl text-gray-400"></i>
      <div>
        <h3 class="text-xl font-semibold mb-2">No Server Data</h3>
        <p class="text-gray-600">Unable to load server information.</p>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { computed, watch } from 'vue';
import { Dialog, Button, Tag, Skeleton, Divider } from 'primevue';
import { useToast } from 'primevue/usetoast';
import {formatMemory,formatDate,formatStorage} from "@/utils/format.js";

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  serverData: {
    type: Object,
    default: null
  },
  serverId: {
    type: [String, Number],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:visible', 'close', 'retry']);

// Composables
const toast = useToast();

// Computed
const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});



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

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Copied to clipboard',
      life: 2000
    });
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    toast.add({
      severity: 'success',
      summary: 'Copied',
      detail: 'Copied to clipboard',
      life: 2000
    });
  }
};

const openEmailClient = (email) => {
  window.location.href = `mailto:${email}`;
};

const handleClose = () => {
  emit('close');
  isVisible.value = false;
};

</script>

<style scoped>
.space-y-4 > * + * {
  margin-top: 1rem;
}

.p-dialog-header {
  background: linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%);
  border-bottom: 1px solid var(--surface-border);
}

.p-tag {
  font-weight: 500;
}

.p-button.p-button-text {
  color: var(--text-color-secondary);
}

.p-button.p-button-text:hover {
  background: var(--surface-hover);
  color: var(--text-color);
}

.p-divider {
  margin: 1.5rem 0;
}

/* Custom scrollbar for modal content */
.p-dialog-content {
  max-height: 70vh;
  overflow-y: auto;
}

.p-dialog-content::-webkit-scrollbar {
  width: 6px;
}

.p-dialog-content::-webkit-scrollbar-track {
  background: var(--surface-ground);
}

.p-dialog-content::-webkit-scrollbar-thumb {
  background: var(--surface-border);
  border-radius: 3px;
}

.p-dialog-content::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}
</style>