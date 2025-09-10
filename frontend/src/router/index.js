import { createWebHistory, createRouter } from 'vue-router'
import Login from "@/pages/Auth/Login.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import Register from "@/pages/Auth/Register.vue";
import {setupAuthGuards} from "@/router/guards.js";
import Dashboard from "@/pages/Dashboard.vue";

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            requiresGuest: true,
            layout: 'guest'  // Custom meta to specify layout
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            requiresGuest: true,
            layout: 'guest'
        }
    },
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
            requiresAuth: true,
            layout: 'auth'
        }
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})
setupAuthGuards(router)

export {
    router
};