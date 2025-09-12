<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-4">
    <MetricCard
        id="total"
        label="Total Servers"
        :value="stats?.total || 0"
        type="neutral"
    />

    <MetricCard
        id="active"
        label="Active Servers"
        :value="stats?.active || 0"
        :percentage="stats?.active_percentage || 0"
        type="success"
    />

    <MetricCard
        id="inactive"
        label="Inactive Servers"
        :value="stats?.inactive || 0"
        :percentage="stats?.inactive_percentage || 0"
        type="error"
    />

    <MetricCard
        id="maintenance"
        label="Maintenance"
        :value="stats?.maintenance || 0"
        :percentage="stats?.maintenance_percentage || 0"
        type="warning"
    />
  </div>
  <Statistics />
</template>
<script setup lang="ts">
import Statistics from "@/components/dashboard/Statistics.vue";
import MetricCard from "@/components/dashboard/MetricCard.vue";
import {computed, onMounted, reactive} from "vue";
import { useServerStore } from '@/stores/serverStore';
import { useToast } from 'primevue/usetoast';

const serverStore = useServerStore();
const toast = useToast();

const stats = computed(() => serverStore.dashboardStats);

onMounted(async () => {
  try {
    await serverStore.getDashboardStats();
  } catch (error) {
    console.error(error);
    toast.add({ severity:'error', summary:'Error', detail: 'Failed to load stats', life: 3000 });
  }
})
</script>