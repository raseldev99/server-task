<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GuestLayout from '@/components/layout/GuestLayout.vue'
import ThemeProvider from './components/layout/ThemeProvider.vue'
import SidebarProvider from './components/layout/SidebarProvider.vue'
import AuthLayout from "@/components/layout/AuthLayout.vue";
import {Toast} from "primevue";

const route = useRoute()

const layoutComponent = computed(() => {
  const layout = route.meta?.layout

  switch (layout) {
    case 'guest':
      return GuestLayout
    case 'auth':
      return AuthLayout
    default:
      return GuestLayout
  }
})
</script>

<template>
 <ThemeProvider>
   <SidebarProvider>
     <component :is="layoutComponent">
       <Toast position="bottom-right"/>
       <router-view />
     </component>
   </SidebarProvider>
 </ThemeProvider>
</template>

