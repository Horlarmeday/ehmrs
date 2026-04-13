<script setup lang="ts">
import { computed } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

interface Props {
  modelValue?: string
  label?: string
  error?: string
  disabled?: boolean
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  error: '',
  disabled: false,
  placeholder: 'Pick a date',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder
  try {
    const date = new Date(props.modelValue)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return props.modelValue
  }
})

function handleDateInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {{ label }}
    </label>
    <div class="relative">
      <input
        type="date"
        :value="modelValue"
        :disabled="disabled"
        :placeholder="placeholder"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        @input="handleDateInput"
      />
      <CalendarIcon class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
    <p v-if="error" class="text-sm text-destructive">
      {{ error }}
    </p>
  </div>
</template>
