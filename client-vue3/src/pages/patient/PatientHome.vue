<script setup lang="ts">
/**
 * PatientHome - Container component for patient module
 * Renders child routes with a fade transition
 */
</script>

<template>
  <transition name="fade" mode="out-in">
    <router-view />
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
