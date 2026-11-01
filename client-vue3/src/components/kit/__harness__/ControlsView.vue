<script setup lang="ts">
import { ref } from 'vue';
import KitButton from '../KitButton.vue';
import KitInput from '../KitInput.vue';
import KitTextarea from '../KitTextarea.vue';

const severities = ['primary', 'success', 'danger', 'warning'] as const;
const name = ref('');
const notes = ref('');
const clicks = ref(0);
</script>

<template>
  <div class="flex w-96 flex-col gap-3">
    <div class="flex items-center gap-2">
      <KitButton
        v-for="severity in severities"
        :key="severity"
        :severity="severity"
        @click="clicks += 1"
      >
        {{ severity }}
      </KitButton>
    </div>
    <div class="flex items-center gap-2">
      <KitButton size="xs">Extra small</KitButton>
      <KitButton size="lg">Large</KitButton>
      <KitButton disabled>Disabled</KitButton>
      <KitButton loading>Saving</KitButton>
    </div>
    <output data-testid="clicks">{{ clicks }}</output>
    <KitInput v-model="name" label="Name" />
    <KitInput label="Dose" error="Dose is required" />
    <KitInput label="Locked" model-value="Fixed" disabled />
    <KitTextarea v-model="notes" label="Notes" />
    <KitTextarea label="Reason" error="Reason is required" />
    <output data-testid="name">{{ name }}</output>
    <output data-testid="notes">{{ notes }}</output>
  </div>
</template>
