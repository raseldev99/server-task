<template>
  <Dialog
      :visible="visible"
      :style="{ width: '700px' }"
      header="Server Details"
      :modal="true"
      @update:visible="$emit('update:visible', $event)"
      @hide="handleCancel"
  >
    <Form
        @submit="handleSubmit"
        id="serverForm"
        :initial-values="formData"
        :validation-schema="serverValidationSchema"
    >
      <div class="flex flex-col gap-6">
        <!-- Server Name and IP Address -->
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-6">
            <label for="name" class="block font-bold mb-3">Server Name</label>
            <Field v-slot="{ field, errorMessage }" name="name">
              <InputText
                  id="name"
                  v-bind="field"
                  v-model="formData.name"
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
                  v-model="formData.ip_address"
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
            CPU Cores: {{ formData.cpu_cores }}
          </label>
          <Field v-slot="{ field, errorMessage }" name="cpu_cores">
            <Slider
                id="cpu_cores"
                v-bind="field"
                v-model="formData.cpu_cores"
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
            RAM: {{ formatMemory(formData.ram_mb) }}
          </label>
          <Field v-slot="{ field, errorMessage }" name="ram_mb">
            <Slider
                id="ram_mb"
                v-bind="field"
                v-model="formData.ram_mb"
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
            Storage: {{ formData.storage_gb }} GB
          </label>
          <Field v-slot="{ field, errorMessage }" name="storage_gb">
            <Slider
                id="storage_gb"
                v-bind="field"
                v-model="formData.storage_gb"
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
          @click="handleCancel"
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
</template>

<script setup>
import { ref, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { serverValidationSchema } from '@/validations/serverSchema';
import { DEFAULT_SERVER, STATUS_OPTIONS, PROVIDER_OPTIONS } from '@/constants/server';
import {formatMemory} from "@/utils/format.js";

// PrimeVue Components
import {
  Dialog,
  Button,
  Select,
  InputText,
  Slider
} from 'primevue';

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  serverData: {
    type: Object,
    default: () => ({ ...DEFAULT_SERVER })
  },
  loading: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:visible', 'submit', 'cancel']);

// Local state
const formData = ref({ ...DEFAULT_SERVER });
const statusOptions = STATUS_OPTIONS;
const providerOptions = PROVIDER_OPTIONS;

// Watch for serverData changes to populate form
watch(
    () => props.serverData,
    (newData) => {
      if (newData) {
        formData.value = { ...newData };
      }
    },
    { deep: true, immediate: true }
);

// Watch for visibility changes to reset form when closed
watch(
    () => props.visible,
    (isVisible) => {
      if (!isVisible) {
        formData.value = { ...DEFAULT_SERVER };
      }
    }
);

// Event handlers
const handleSubmit = async (values, actions) => {
  try {
    emit('submit', values, actions);
  } catch (error) {
    console.error('Form submission error:', error);
  }
};

const handleCancel = () => {
  emit('cancel');
  emit('update:visible', false);
};

const handleHide = () => {
  emit('update:visible', false);
};
</script>

<style scoped>
.p-slider .p-slider-handle {
  height: 1.2rem;
  width: 1.2rem;
}

.p-slider .p-slider-range {
  background: var(--primary-color);
}
</style>