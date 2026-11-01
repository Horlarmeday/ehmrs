<script setup lang="ts">
import ControlsView from './ControlsView.vue';
import FbcEntryView from './FbcEntryView.vue';
import DisplayView from './DisplayView.vue';
import LabDesk from '../../../prototypes/lab-entry/LabDesk.vue';
import PatientDesk from '../../../prototypes/patient-desk/PatientDesk.vue';
import OverlaysView from './OverlaysView.vue';
import PickersView from './PickersView.vue';
import TableView from './TableView.vue';
import ValidationView from './ValidationView.vue';

const view = new URLSearchParams(window.location.search).get('view');
</script>

<template>
  <PatientDesk v-if="view === 'patient-desk'" />
  <LabDesk v-else-if="view === 'lab-desk'" />
  <main v-else class="min-h-screen bg-surface-page p-4 text-sm text-ink">
    <h1 class="mb-4 text-xl font-semibold">Kit harness</h1>
    <FbcEntryView v-if="view === 'fbc'" />
    <PickersView v-else-if="view === 'pickers'" />
    <ValidationView v-else-if="view === 'validation'" />
    <TableView v-else-if="view === 'table'" />
    <DisplayView v-else-if="view === 'display'" />
    <OverlaysView v-else-if="view === 'overlays'" />
    <ControlsView v-else />
  </main>
</template>
