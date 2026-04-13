<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-400 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
      <p class="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="goHome"
      >
        Go Home
      </button>
    </div>
  </div>
</template>
