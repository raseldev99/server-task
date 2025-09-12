<template>
  <Dialog
      :visible="visible"
      :style="{ width: '450px' }"
      :header="dialogTitle"
      :modal="true"
      @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span>
        <template v-if="mode === 'single' && serverData">
          Are you sure you want to delete <b>{{ serverData.name }}</b>?
        </template>
        <template v-else-if="mode === 'multiple'">
          Are you sure you want to delete the selected servers?
        </template>
      </span>
    </div>

    <template #footer>
      <Button
          label="No"
          icon="pi pi-times"
          text
          severity="secondary"
          @click="handleCancel"
      />
      <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          :loading="loading"
          @click="handleConfirm"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { computed } from 'vue';
import { Dialog, Button } from 'primevue';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'single', // 'single' or 'multiple'
    validator: (value) => ['single', 'multiple'].includes(value)
  },
  serverData: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:visible', 'confirm', 'cancel']);

// Computed
const dialogTitle = computed(() => {
  return props.mode === 'single' ? 'Delete Server' : 'Delete Servers';
});

// Event handlers
const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};
</script>