<script setup lang="ts">
import ControlsView from './ControlsView.vue';
import FbcEntryView from './FbcEntryView.vue';
import PickersView from './PickersView.vue';
import ValidationView from './ValidationView.vue';

const view = new URLSearchParams(window.location.search).get('view');
</script>

<template>
  <main class="min-h-screen bg-surface-page p-4 text-sm text-ink">
    <h1 class="mb-4 text-xl font-semibold">Kit harness</h1>
    <FbcEntryView v-if="view === 'fbc'" />
    <PickersView v-else-if="view === 'pickers'" />
    <ValidationView v-else-if="view === 'validation'" />
    <ControlsView v-else />
  </main>
</template>
