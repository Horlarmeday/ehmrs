<script setup lang="ts">
// Router shell — UI lands with per-domain migration issues (see docs/adr/0001).
// The toast sink bridges the frozen notifySuccess/notifyError content to the
// PrimeVue ToastService chrome (summary=legacy title, detail=legacy text,
// severity=legacy type).
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
