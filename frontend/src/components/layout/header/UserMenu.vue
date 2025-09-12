<script setup>
import { UserCircleIcon, ChevronDownIcon, LogoutIcon } from '@/components/icons/index.js'
import {RouterLink, useRouter} from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import {useAuthStore} from "@/stores/authStore.js";
import ProfilePic from "@/components/common/ProfilePic.vue";
import { useToast } from 'primevue/usetoast';

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter()

const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const loading = ref(false)



const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Edit profile' },
]

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const signOut = async () => {
  loading.value = true
  try {
    await authStore.logout()
    toast.add({severity:'success', summary:'Success', detail:'Logged out successfully',  life: 3000 })
    await router.push('/login')
  } catch (error) {
    toast.add({severity:'error', summary:'Error', detail:'Failed to logout',  life: 3000 })
  } finally {
    closeDropdown()
    loading.value = false
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <ProfilePic :name="authStore.user?.name || 'Unkhown'" :size="40" />
      <span class="block mr-1 font-medium text-theme-sm ml-2">{{authStore.user?.name || 'Unkhown'}}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{authStore.user?.name || 'Unkhown'}}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{authStore.user?.email || 'Unkhown'}}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <!-- SVG icon would go here -->
            <component
              :is="item.icon"
              class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
            {{ item.text }}
          </router-link>
        </li>
      </ul>
      <button
          @click="signOut"
          :disabled="loading"
          class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent dark:disabled:hover:bg-transparent w-full text-left"
      >
        <!-- Loading spinner -->
        <div v-if="loading" class="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full dark:border-gray-600 dark:border-t-gray-300"></div>

        <!-- Logout icon -->
        <LogoutIcon
            v-else
            class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300 group-disabled:text-gray-400"
        />

        {{ loading ? 'Signing out...' : 'Sign out' }}
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

