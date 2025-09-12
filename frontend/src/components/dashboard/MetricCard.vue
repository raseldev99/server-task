<template>
  <div
      :id="`metric-${id}`"
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
  >
    <p class="text-theme-sm text-gray-500 dark:text-gray-400">
      {{ label }}
    </p>

    <div class="mt-3 flex items-end justify-between">
      <div>
        <h4 class="text-2xl font-bold text-gray-800 dark:text-white/90">
          {{ value }}
        </h4>
      </div>

      <!-- Only show percentage if provided -->
      <div v-if="percentage !== null" class="flex items-center gap-1">
        <span
            class="flex items-center gap-1 rounded-full px-2 py-0.5 text-theme-xs font-medium"
            :class="percentageColor"
        >
          {{ percentage }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  percentage: { type: [Number, String], default: null },
  type: { type: String, default: "neutral" }, // success | error | warning | neutral
});

const percentageColor = computed(() => {
  switch (props.type) {
    case "success":
      return "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500";
    case "error":
      return "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500";
    case "warning":
      return "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-500";
    default:
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
  }
});
</script>
