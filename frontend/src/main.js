import './assets/main.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'jsvectormap/dist/jsvectormap.css'
import 'flatpickr/dist/flatpickr.css'
import 'primeicons/primeicons.css'

import PrimeVue from 'primevue/config';
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import ToastService from 'primevue/toastservice';
import 'vue3-toastify/dist/index.css';
import { createPinia } from 'pinia'
const pinia = createPinia()
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import Noir from "@/presets/Noir.js";

 const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Noir,
        options: {
            darkModeSelector: false,
            cssLayer: false,
        }
    }
})
    .use(ToastService)
    .use(pinia)
    .use(router)
    .use(ConfirmationService)
    .use(DialogService);

    //mount
    app.mount('#app')

