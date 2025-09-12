import {privateApi} from "@/services/axious.js";

export const ServerService = {
        getServers: ({
                         page = 1,
                         perPage = 10,
                         search = '',
                         provider = '',
                         status = '',
                         min_cpu = '',
                         max_cpu = '',
                         min_ram = '',
                         max_ram = '',
                         sort_field = 'created_at',
                         sort_order = 'desc',
                     }= {}) =>
            privateApi.get('/servers', {
                params: {
                    page,
                    per_page: perPage,
                    search,
                    provider,
                    status,
                    min_cpu,
                    max_cpu,
                    min_ram,
                    max_ram,
                    sort_field,
                    sort_order,
                },
            }),
    getServer: (id) => privateApi.get(`/servers/${id}`),
    createServer: (serverData) => privateApi.post('/servers', serverData),
    updateServer: (id, serverData) => privateApi.put(`/servers/${id}`, serverData),
    deleteServer: (id) => privateApi.delete(`/servers/${id}`),
    bulkStatusUpdate: (statusData) => privateApi.post('/servers/bulk-status-update', statusData),
    bulkDeleteServers: (serverIds) => privateApi.post('/servers/bulk-delete-server', serverIds),
    getServerStats: () => privateApi.get('/dashboard/stats')
}