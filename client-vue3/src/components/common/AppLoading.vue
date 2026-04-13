<script setup lang="ts">
interface Props {
  visible?: boolean
  text?: string
  fullScreen?: boolean
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: 'Loading...',
  fullScreen: true,
})
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      :class="[
        'flex items-center justify-center bg-black bg-opacity-50',
        {
          'fixed inset-0 z-50': fullScreen,
          'absolute inset-0 z-10': !fullScreen,
        }
      ]"
    >
      <div class="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center">
        <!-- Spinner -->
        <svg
          class="animate-spin h-10 w-10 text-blue-600 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>

        <!-- Loading Text -->
        <p v-if="text" class="text-gray-700 font-medium">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
