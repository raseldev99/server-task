import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useServerStore } from '@/stores/serverStore';
import { DEFAULT_SERVER } from '@/constants/server';

export function useServerCrud() {
    const serverStore = useServerStore();
    const toast = useToast();

    const serverForm = ref({ ...DEFAULT_SERVER });
    const loading = computed(() => serverStore.loading);

    const showToast = (severity, summary, detail) => {
        toast.add({ severity, summary, detail, life: 3000 });
    };

    const resetForm = () => {
        serverForm.value = { ...DEFAULT_SERVER };
    };

    const createServer = async (values) => {
        try {
            await serverStore.createServer(values);
            showToast('success', 'Success', 'Server created successfully');
            return true;
        } catch (error) {
            if (error.status === 422) {
                throw error; // Let form handle validation errors
            }
            showToast('error', 'Error', serverStore.error || 'Failed to create server');
            return false;
        }
    };

    const updateServer = async (id, values) => {
        try {
            await serverStore.updateServer(id, values);
            showToast('success', 'Success', 'Server updated successfully');
            return true;
        } catch (error) {
            if (error.status === 422) {
                throw error; // Let form handle validation errors
            }
            showToast('error', 'Error', serverStore.error || 'Failed to update server');
            return false;
        }
    };

    const deleteServer = async (id) => {
        try {
            await serverStore.deleteServer(id);
            showToast('success', 'Success', 'Server deleted successfully');
            return true;
        } catch (error) {
            showToast('error', 'Error', serverStore.error || 'Failed to delete server');
            return false;
        }
    };

    const bulkDeleteServers = async (serverIds) => {
        try {
            await serverStore.bulkDeleteServers(serverIds);
            showToast('success', 'Success', 'Servers deleted successfully');
            return true;
        } catch (error) {
            showToast('error', 'Error', serverStore.error || 'Failed to delete servers');
            return false;
        }
    };

    const bulkUpdateStatus = async (serverIds, status) => {
        try {
            await serverStore.bulkUpdateStatus(serverIds, status);
            showToast('success', 'Success', 'Server statuses updated successfully');
            return true;
        } catch (error) {
            showToast('error', 'Error', serverStore.error || 'Failed to update server statuses');
            return false;
        }
    };

    const fetchServer = async (id) => {
        try {
            await serverStore.fetchServer(id);
            return serverStore.server;
        } catch (error) {
            showToast('error', 'Error', 'Failed to load server details');
            throw error;
        }
    };

    const populateForm = (serverData) => {
        serverForm.value = { ...serverData };
    };

    return {
        serverForm,
        loading,
        resetForm,
        populateForm,
        createServer,
        updateServer,
        deleteServer,
        bulkDeleteServers,
        bulkUpdateStatus,
        fetchServer,
        showToast
    };
}