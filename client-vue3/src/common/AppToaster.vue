<script setup lang="ts">
import { ref } from 'vue'
import { ToastDescription, ToastProvider, ToastRoot, ToastTitle, ToastViewport } from 'reka-ui'
import { setToastSink, type ToastPayload } from './notify'

interface VisibleToast extends ToastPayload {
  id: number
}

const toasts = ref<VisibleToast[]>([])
let nextId = 0

setToastSink((payload) => {
  nextId += 1
  toasts.value.push({ ...payload, id: nextId })
})

function dismiss(id: number): void {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}
</script>

<template>
  <ToastProvider :duration="3000">
    <ToastRoot
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type === 'error' ? 'foreground' : 'background'"
      class="rounded border border-line p-2 text-sm shadow-md"
      :class="toast.type === 'error' ? 'bg-danger-subtle text-danger-subtle-text' : 'bg-success-subtle text-success-subtle-text'"
      @update:open="(open) => { if (!open) dismiss(toast.id) }"
    >
      <ToastTitle class="font-semibold">
        {{ toast.title }}
      </ToastTitle>
      <ToastDescription v-if="toast.text">
        {{ toast.text }}
      </ToastDescription>
    </ToastRoot>
    <ToastViewport class="fixed right-4 top-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] list-none flex-col gap-2 p-0 outline-none" />
  </ToastProvider>
</template>
