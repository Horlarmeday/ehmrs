<script setup lang="ts">
/**
 * PatientSearchBar - Input with debounced search, clear button, search icon
 * Reusable search component for patient lists
 */
import { ref, watch, onUnmounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  debounceMs?: number
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Search patients...',
  debounceMs: 500,
})

const emit = defineEmits<Emits>()

const searchInput = ref(props.modelValue)
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(
  () => props.modelValue,
  (newValue) => {
    searchInput.value = newValue
  }
)

function onInput() {
  emit('update:modelValue', searchInput.value)

  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeout = setTimeout(() => {
    emit('search', searchInput.value)
  }, props.debounceMs)
}

function onSearch() {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  emit('search', searchInput.value)
}

function onClear() {
  searchInput.value = ''
  emit('update:modelValue', '')
  emit('clear')
  emit('search', '')
}

onUnmounted(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
    debounceTimeout = null
  }
})
</script>

<template>
  <div class="relative flex-1">
    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      v-model="searchInput"
      :placeholder="placeholder"
      class="pl-10 pr-10"
      @input="onInput"
      @keyup.enter="onSearch"
    />
    <Button
      v-if="searchInput"
      variant="ghost"
      size="icon"
      class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
      @click="onClear"
    >
      <X class="w-3 h-3" />
    </Button>
  </div>
</template>
