<script setup lang="ts">
export type KitBadgeSeverity = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

withDefaults(defineProps<{ severity?: KitBadgeSeverity; variant?: 'subtle' | 'solid' }>(), {
  severity: 'neutral',
  variant: 'subtle',
});

const fills: Record<KitBadgeSeverity, Record<'subtle' | 'solid', string>> = {
  primary: {
    subtle: 'bg-primary-subtle text-primary-subtle-text',
    solid: 'bg-primary text-primary-on',
  },
  success: {
    subtle: 'bg-success-subtle text-success-subtle-text',
    solid: 'bg-success text-success-on',
  },
  warning: {
    subtle: 'bg-warning-subtle text-warning-subtle-text',
    solid: 'bg-warning text-warning-on',
  },
  danger: { subtle: 'bg-danger-subtle text-danger-subtle-text', solid: 'bg-danger text-danger-on' },
  info: { subtle: 'bg-info-subtle text-info-subtle-text', solid: 'bg-info text-info-on' },
  neutral: {
    subtle: 'bg-neutral-subtle text-neutral-subtle-text',
    solid: 'bg-neutral text-neutral-on',
  },
};
</script>

<template>
  <span
    class="inline-flex items-center whitespace-nowrap rounded-full px-2 text-xs font-medium"
    :class="fills[severity][variant]"
    ><slot
  /></span>
</template>
