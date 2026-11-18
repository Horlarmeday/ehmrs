<script setup lang="ts">
import AppToaster from './common/AppToaster.vue';
import KitConfirmHost from './components/kit/KitConfirmHost.vue';
</script>

<template>
  <AppToaster />
  <KitConfirmHost />
  <router-view />
</template>
