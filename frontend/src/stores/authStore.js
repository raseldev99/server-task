import { defineStore } from 'pinia'
import authService from "@/services/authService.js";
import { tokenManager } from '@/utils/tokenManager'
import {router} from "@/router/index.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: tokenManager.getUserData(),
        accessToken: tokenManager.getAccessToken(),
        loading: false,
    }),

    getters: {
        isAuthenticated: (state) => !!state.accessToken && tokenManager.isTokenValid(),
        userName: (state) => state.user?.name,
    },

    actions: {
        async login(credentials) {
            this.loading = true
            this.errors = []
            this.message = null

            try {
                const response = await authService.login(credentials)
                const { token , user } = response.data?.data ?? []
                // Store tokens and user data
                this.setAuthData(token.access_token, user)

                // Redirect to intended page or dashboard
                const redirect = router.currentRoute.value.query.redirect || '/dashboard'
                await router.push(redirect)

                return response.data
            } catch (error) {
                throw error
            } finally {
                this.loading = false
            }
        },

        async logout() {
            try {
                await authService.logout()
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                this.clearAuthData()
                await router.push('/login')
            }
        },

        async getCurrentUser() {
            try {
                const response = await authService.getCurrentUser()
                this.user = response.data
                tokenManager.setUserData(response.data)
                return response.data
            } catch (error) {
                console.error('Failed to get current user:', error)
                throw error
            }
        },

        async changePassword(data) {
                this.loading = true
                this.errors = []
                this.message = null
                try {
                    const response = await authService.changePassword(data)
                    this.clearAuthData()
                    await router.push('/login')
                    return response.data
                } catch (error) {
                    throw error
                } finally {
                    this.loading = false
                }
        },

        async updateProfile(data) {
            this.loading = true
            this.message = null
            try {
                const response = await authService.updateUser(data)
                if(response.data?.data){
                    this.updateUserProfile(response.data?.data)
                }
                return response.data
            } catch (error) {
                throw error
            } finally {
                this.loading = false
            }
        },

        setAuthData(accessToken, user) {
            this.accessToken = accessToken
            this.user = user

            tokenManager.setAccessToken(accessToken)
            tokenManager.setUserData(user)
        },

        clearAuthData() {
            this.accessToken = null
            this.user = null

            tokenManager.clearAuthData()
        },

        updateUserProfile(userData) {
            this.user = { ...this.user, ...userData }
            tokenManager.setUserData(this.user)
        }
    }
})