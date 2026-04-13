<script setup lang="ts">
/**
 * AppButton - Thin wrapper around shadcn-vue Button
 *
 * Maintains backward compatibility with the legacy AppButton API
 * while using shadcn-vue's accessible Button component internally.
 *
 * @deprecated For new code, use `Button` from `@/components/ui/button` directly.
 */
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
})

interface Emits {
  (e: 'click'): void
}

const emit = defineEmits<Emits>()

const isDisabled = computed(() => props.disabled || props.loading)

// Map legacy variant names to shadcn variants
const shadcnVariant = computed(() => {
  const map: Record<string, 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'> = {
    primary: 'default',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    danger: 'destructive',
  }
  return map[props.variant] ?? 'default'
})

// Map legacy size names to shadcn sizes
const shadcnSize = computed(() => {
  const map: Record<string, 'default' | 'sm' | 'lg'> = {
    sm: 'sm',
    md: 'default',
    lg: 'lg',
  }
  return map[props.size] ?? 'default'
})

const handleClick = () => {
  if (!isDisabled.value) {
    emit('click')
  }
}
</script>

<template>
  <Button
    :variant="shadcnVariant"
    :size="shadcnSize"
    :type="type"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
    <slot />
  </Button>
</template>
