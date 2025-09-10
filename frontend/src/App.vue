<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GuestLayout from '@/layouts/GuestLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

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