<script setup lang="ts">
import KitBadge, { type KitBadgeSeverity } from '../KitBadge.vue';
import KitSkeleton from '../KitSkeleton.vue';

const severities: KitBadgeSeverity[] = [
  'primary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <section aria-label="Badges" class="flex flex-col gap-2">
      <div v-for="variant in ['subtle', 'solid'] as const" :key="variant" class="flex gap-2">
        <KitBadge
          v-for="severity in severities"
          :key="severity"
          :severity="severity"
          :variant="variant"
          :data-testid="`badge-${severity}-${variant}`"
          >{{ severity }}</KitBadge
        >
      </div>
    </section>
    <section aria-label="Skeletons" class="flex max-w-lg flex-col gap-4">
      <KitSkeleton variant="lines" />
      <KitSkeleton variant="table" :rows="2" :columns="3" />
      <KitSkeleton variant="table" :rows="2" :columns="3" dense data-dense="true" />
      <KitSkeleton variant="form" :rows="2" />
    </section>
  </div>
</template>
