import './assets/main.css'
import PrimeVue from 'primevue/config';
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import Vue3Toastify,{toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import { createPinia } from 'pinia'
import Lara from '@primeuix/themes/lara'
import {definePreset} from "@primeuix/themes";
const pinia = createPinia()

const MyPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{indigo.50}',
            100: '{indigo.100}',
            200: '{indigo.200}',
            300: '{indigo.300}',
            400: '{indigo.400}',
            500: '{indigo.500}',
            600: '{indigo.600}',
            700: '{indigo.700}',
            800: '{indigo.800}',
            900: '{indigo.900}',
            950: '{indigo.950}'
        }
    }
});

 const app = createApp(App);
    app.use(PrimeVue, {
        theme: {
            preset: MyPreset,
            options: {
                darkModeSelector: false,
            },
        }
    })
    .use(pinia)
    .use(Vue3Toastify, {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    })
    .use(router);


    //mount
    app.mount('#app')

