<script setup lang="ts">
/**
 * AppInput - Thin wrapper around shadcn-vue Input + Label
 *
 * Maintains backward compatibility with the legacy AppInput API
 * while using shadcn-vue's accessible Input component internally.
 *
 * @deprecated For new code, use `Input` and `Label` from `@/components/ui/input` directly.
 */
import { computed, ref } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date'
  label?: string
  modelValue?: string
  error?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  error: '',
  disabled: false,
  required: false,
})

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'blur'): void
}

const emit = defineEmits<Emits>()

const showPassword = ref(false)
const isPassword = props.type === 'password'

const inputType = computed(() => {
  if (isPassword && showPassword.value) return 'text'
  return props.type
})

const inputClass = computed(() => ({
  'border-destructive': !!props.error,
}))

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = () => {
  emit('blur')
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="w-full space-y-2">
    <!-- Label -->
    <Label v-if="label" :class="{ 'text-destructive': error }">
      {{ label }}
      <span v-if="required" class="text-destructive">*</span>
    </Label>

    <!-- Input Wrapper -->
    <div class="relative">
      <!-- Input -->
      <Input
        :type="inputType"
        :model-value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClass"
        @input="handleInput"
        @blur="handleBlur"
      />

      <!-- Password Toggle -->
      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
        @click="togglePassword"
      >
        <Eye v-if="!showPassword" class="w-4 h-4" />
        <EyeOff v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
  </div>
</template>
