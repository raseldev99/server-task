import { createWebHistory, createRouter } from 'vue-router'
import Login from "@/pages/Auth/Login.vue";
import Register from "@/pages/Auth/Register.vue";
import {setupAuthGuards} from "@/router/guards.js";
import AllServers from "@/pages/AllServers.vue";
import FourZeroFour from "@/pages/Errors/FourZeroFour.vue";
import Dashboard from "@/pages/Dashboard.vue";
import Profile from "@/pages/Auth/Profile.vue";

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
        name: 'dashboard-redirect',
        meta: {
            title: 'Dashboard',
        }
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: {
            requiresGuest: true,
            layout: 'guest',
            title: 'Login',
        }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: {
            requiresGuest: true,
            layout: 'guest',
            title: 'Register'
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true,
            layout: 'auth',
            title: 'Profile',
        }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
            requiresAuth: true,
            layout: 'auth',
            title: 'Dashboard'
        }
    },
    {
        path: '/all-servers',
        name: 'allServers',
        component: AllServers,
        meta: {
            requiresAuth: true,
            layout: 'auth',
            title: 'All Servers',
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: FourZeroFour,
        meta: {
            title: '404 Not Found',
        }
    },
]


const router = createRouter({
    history: createWebHistory(),
    // scrollBehavior(to, from, savedPosition) {
    //     return savedPosition || { left: 0, top: 0 }
    // },
    routes,
})

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title} | NexaCloud`
    next()
})
setupAuthGuards(router)

export {
    router
};