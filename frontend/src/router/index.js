import { createMemoryHistory, createRouter } from 'vue-router'
import Login from "@/pages/Auth/Login.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import Register from "@/pages/Auth/Register.vue";

const routes = [
    {
        path: '/',
        name: 'GuestLayout',
        component: GuestLayout,
        children: [
            {
                path: '/',
                name: 'Login',
                component: Login,
            },
            {
                path: '/register',
                name: 'Register',
                component: Register
            }
        ]
    },
]

export const router = createRouter({
    history: createMemoryHistory(),
    routes,
})