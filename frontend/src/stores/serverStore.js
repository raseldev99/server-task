import { defineStore } from 'pinia'
import { ServerService } from '@/services/ServerService'

export const useServerStore = defineStore('server', {
    state: () => ({
        servers: [],
        pagination:{},
        server: {},
        loading: false,
        error: null,
        selectedServers: []
    }),

    getters: {
        getServerById: (state) => (id) => {
            return state.servers.find(server => server.id === id)
        },
        serverCount: (state) => state.servers.length,
        activeServers: (state) => state.servers.filter(server => server.status === 'active'),
        inactiveServers: (state) => state.servers.filter(server => server.status === 'inactive'),
    },

    actions: {
        async fetchServers({
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
                           } = {}) {
            this.loading = true
            this.error = null
            try {
                const response = await ServerService.getServers({
                    page,
                    perPage,
                    search,
                    provider,
                    status,
                    min_cpu,
                    max_cpu,
                    min_ram,
                    max_ram,
                    sort_field,
                    sort_order,
                })
                this.servers = response.data.data || response.data
                this.pagination = response.data.pagination || {};
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch servers'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchServer(id) {
            this.loading = true
            this.error = null
            try {
                const response = await ServerService.getServer(id)
                this.server = response.data.data || response.data
                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch server'
                throw error
            } finally {
                this.loading = false
            }
        },

        async createServer(serverData) {
            this.loading = true
            this.error = null
            try {
                const response = await ServerService.createServer(serverData)
                const newServer = response.data.data || response.data
                this.servers.push(newServer)
                return newServer
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to create server'
                throw error
            } finally {
                this.loading = false
            }
        },

        async updateServer(id, serverData) {
            this.loading = true
            this.error = null
            try {
                const response = await ServerService.updateServer(id, serverData)
                const updatedServer = response.data.data || response.data
                const index = this.servers.findIndex(server => server.id === id)
                if (index !== -1) {
                    this.servers[index] = updatedServer
                }
                return updatedServer
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update server'
                throw error
            } finally {
                this.loading = false
            }
        },

        async deleteServer(id) {
            this.loading = true
            this.error = null
            try {
                await ServerService.deleteServer(id)
                this.servers = this.servers.filter(server => server.id !== id)
                return true
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete server'
                throw error
            } finally {
                this.loading = false
            }
        },

        async bulkUpdateStatus(serverIds, status) {
            this.loading = true
            this.error = null
            try {
                const response = await ServerService.bulkStatusUpdate({
                    ids: serverIds,
                    status: status
                })

                // Update local state
                serverIds.forEach(id => {
                    const index = this.servers.findIndex(server => server.id === id)
                    if (index !== -1) {
                        this.servers[index].status = status
                    }
                })

                return response.data
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to update server statuses'
                throw error
            } finally {
                this.loading = false
            }
        },

        async bulkDeleteServers(serverIds) {
            this.loading = true
            this.error = null
            try {
                await ServerService.bulkDeleteServers({
                    ids: serverIds
                })

                // Remove from local state
                this.servers = this.servers.filter(server => !serverIds.includes(server.id))
                this.selectedServers = []

                return true
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to delete servers'
                throw error
            } finally {
                this.loading = false
            }
        },

        // Helper methods
        setSelectedServers(servers) {
            this.selectedServers = servers
        },

        clearError() {
            this.error = null
        },

        resetServer() {
            this.server = {}
        }
    }
})
