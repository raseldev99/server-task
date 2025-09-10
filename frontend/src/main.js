import './assets/main.css'
import PrimeVue from 'primevue/config';
import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import Vue3Toastify,{toast} from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import Aura from '@primeuix/themes/aura';

 const app = createApp(App);
    app.use(PrimeVue)
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

