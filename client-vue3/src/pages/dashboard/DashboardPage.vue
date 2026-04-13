<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { parseJwt } from '@/utils/jwt'

const authStore = useAuthStore()

// Parse JWT token to get user info
const userRole = computed(() => authStore.userRole)
const userDepartment = computed(() => authStore.userDepartment)
const userName = computed(() => authStore.userName)

// Get token and parse for detailed role info
const getTokenInfo = () => {
  const token = authStore.token
  if (!token) return null
  
  try {
    return parseJwt(token)
  } catch (error) {
    console.error('Failed to parse token:', error)
    return null
  }
}

const tokenInfo = computed(() => getTokenInfo())
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        Welcome, {{ userName }}!
      </h1>
      <p class="text-gray-600">
        Role: <span class="font-medium">{{ userRole }}</span>
        <span v-if="userDepartment" class="text-gray-400">|</span>
        <span v-if="userDepartment" class="font-medium">{{ userDepartment }}</span>
      </p>
    </div>

    <!-- Dashboard Content -->
    <div class="bg-white rounded-lg shadow-sm p-8">
      <div class="text-center py-12">
        <!-- Icon -->
        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>

        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Under Construction
        </h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          Your role-specific dashboard ({{ userRole }} - {{ userDepartment }}) is being built.
          This will display 65+ different dashboard variants based on your role.
        </p>

        <!-- Token Info (for debugging) -->
        <div class="bg-gray-50 rounded-lg p-4 max-w-md mx-auto text-left">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Token Information:</h3>
          <pre class="text-xs text-gray-600 overflow-auto">{{ JSON.stringify(tokenInfo, null, 2) }}</pre>
        </div>

        <!-- Info Box -->
        <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="text-sm text-blue-800">
              <p class="font-semibold mb-1">Phase 1: Core Infrastructure</p>
              <p>
                This dashboard placeholder confirms that authentication and routing are working correctly.
                Role-specific dashboards will be implemented in Phases 2-5 for each module.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
