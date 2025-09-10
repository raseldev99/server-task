import { useAuthStore } from '@/stores/authStore'
export function setupAuthGuards(router) {
    // Global auth guard
    router.beforeEach(async (to, from, next) => {
        const authStore = useAuthStore()
        const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
        const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
        const isAuthenticated = authStore.isAuthenticated

        // If user is authenticated and trying to access guest-only pages
        if (isAuthenticated && requiresGuest) {
            next('/dashboard')
            return
        }

        if (requiresAuth && !isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
            return
        }

        next()
    })
}