<script setup lang="ts">
import { useId } from 'vue';

defineProps<{ title: string; description?: string }>();
const id = useId();
</script>

<template>
  <section class="flex flex-col gap-3 border-t border-line-subtle pt-4" :aria-labelledby="id">
    <div>
      <h2 :id="id" class="text-md font-semibold">{{ title }}</h2>
      <p v-if="description" class="text-ink-secondary">{{ description }}</p>
    </div>
    <div class="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 xl:grid-cols-3">
      <slot />
    </div>
  </section>
</template>
