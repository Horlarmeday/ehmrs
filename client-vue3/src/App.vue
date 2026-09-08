<script setup lang="ts">
// ! toast sink bridges frozen notify content to PrimeVue chrome
import { useToast } from 'primevue/usetoast'
import { setToastSink } from './common/notify'

const toast = useToast()
setToastSink((payload) => {
  toast.add({
    summary: payload.title,
    detail: payload.text,
    severity: payload.type,
    life: 3000,
  })
})
</script>

<template>
  <router-view />
</template>
