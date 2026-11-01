<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    severity?: 'primary' | 'success' | 'danger' | 'warning';
    size?: 'xs' | 'sm' | 'lg';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  { severity: 'primary', size: 'sm', type: 'button', disabled: false, loading: false }
);

const severityClasses = {
  primary:
    'bg-primary text-primary-on enabled:hover:bg-primary-hover enabled:active:bg-primary-active',
  success:
    'bg-success text-success-on enabled:hover:bg-success-hover enabled:active:bg-success-active',
  danger: 'bg-danger text-danger-on enabled:hover:bg-danger-hover enabled:active:bg-danger-active',
  warning:
    'bg-warning text-warning-on enabled:hover:bg-warning-hover enabled:active:bg-warning-active',
};

const sizeClasses = {
  xs: 'min-h-xs px-[6px] text-xs',
  sm: 'min-h-sm px-2 text-sm',
  lg: 'min-h-lg px-2 text-lg',
};

const classes = computed(() => [
  sizeClasses[props.size],
  props.disabled ? 'bg-surface-alt text-ink-secondary' : severityClasses[props.severity],
]);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    class="inline-flex items-center justify-center gap-1 rounded-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
    :class="classes"
  >
    <span
      v-if="loading"
      aria-hidden="true"
      class="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
    <slot />
  </button>
</template>
