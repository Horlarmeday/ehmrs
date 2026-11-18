<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: number;
    max: number;
    severity?: 'primary' | 'success' | 'warning';
    valueText?: string;
  }>(),
  { severity: 'primary', valueText: undefined }
);

const fills = {
  primary: '[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary',
  success: '[&::-webkit-progress-value]:bg-success [&::-moz-progress-bar]:bg-success',
  warning: '[&::-webkit-progress-value]:bg-warning [&::-moz-progress-bar]:bg-warning',
};
</script>

<template>
  <progress
    :value="value"
    :max="max"
    :aria-label="label"
    :aria-valuetext="valueText ?? `${value} of ${max}`"
    class="block h-[6px] w-full appearance-none overflow-hidden rounded-full bg-line-subtle [&::-webkit-progress-bar]:bg-line-subtle [&::-webkit-progress-value]:rounded-full"
    :class="fills[severity]"
  />
</template>
