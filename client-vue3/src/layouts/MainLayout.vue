<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const sidebarOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
}

const navigateTo = (path: string) => {
  router.push(path)
  sidebarOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="flex items-center justify-between px-4 py-3">
        <!-- Left: Logo & Menu Toggle -->
        <div class="flex items-center gap-3">
          <!-- Mobile Menu Toggle -->
          <button
            class="lg:hidden p-2 rounded-md hover:bg-gray-100"
            @click="sidebarOpen = !sidebarOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">E</span>
            </div>
            <span class="text-xl font-bold text-gray-900 hidden sm:inline">EHMRS</span>
          </div>
        </div>

        <!-- Right: User Menu -->
        <div class="flex items-center gap-3">
          <!-- User Info -->
          <div class="hidden sm:flex items-center gap-2">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-medium text-sm">
                {{ authStore.userName.charAt(0).toUpperCase() }}
              </span>
            </div>
            <div class="text-sm">
              <p class="font-medium text-gray-900">{{ authStore.userName }}</p>
              <p class="text-gray-500 text-xs">{{ authStore.userRole }}</p>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            class="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            @click="handleLogout"
          >
            Logout
          </button>
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar -->
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:translate-x-0 lg:static lg:shadow-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        ]"
      >
        <div class="h-full overflow-y-auto py-4">
          <!-- Navigation -->
          <nav class="px-3">
            <div class="mb-6">
              <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Main
              </h3>
              <ul class="space-y-1">
                <li>
                  <button
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    @click="navigateTo('/dashboard')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Dashboard
                  </button>
                </li>
                <!-- More navigation items will be added per module -->
              </ul>
            </div>
          </nav>
        </div>
      </aside>

      <!-- Sidebar Overlay (Mobile) -->
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
        @click="sidebarOpen = false"
      />

      <!-- Main Content -->
      <main class="flex-1 p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
