<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import PatientRegister from './PatientRegister.vue';
import PatientSearch from './PatientSearch.vue';
import type { FakePatient } from './fakeData';
import { navigation, startVisitRoles, type DemoRole } from './roles';

type Screen = 'search' | 'register' | 'chart';
const roles: DemoRole[] = ['Medical Records', 'Admin', 'Nurse'];
const role = ref<DemoRole>('Medical Records');
const screen = ref<Screen>('search');
const draft = ref('');
const term = ref('');
const registerTerm = ref('');
const current = ref<FakePatient | null>(null);
const justRegistered = ref(false);
const notice = ref('');
const searchBox = useTemplateRef<HTMLInputElement>('search-box');

const canStartVisit = computed(
  () => startVisitRoles.includes(role.value) && current.value?.status === 'active'
);

function search(): void {
  term.value = draft.value.trim();
  screen.value = 'search';
  notice.value = '';
}

function register(from: string): void {
  registerTerm.value = from;
  screen.value = 'register';
}

function open(patient: FakePatient, registered = false): void {
  current.value = patient;
  justRegistered.value = registered;
  screen.value = 'chart';
  notice.value = '';
}

function startVisit(patient: FakePatient): void {
  open(patient);
  notice.value =
    'The visit screen comes later. In the real system, this continues to the start visit step.';
}

function onShortcut(event: KeyboardEvent): void {
  const target = event.target;
  const typing =
    target instanceof HTMLElement && target.matches('input, textarea, select, [contenteditable]');
  if (event.key === '/' && !typing) {
    event.preventDefault();
    searchBox.value?.focus();
  }
}

onMounted(() => {
  window.addEventListener('keydown', onShortcut);
  nextTick(() => searchBox.value?.focus());
});
onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut));
const title = computed(() =>
  screen.value === 'register'
    ? 'Register patient'
    : screen.value === 'chart'
      ? 'Patient'
      : 'Patients'
);
const chartSections = [
  'Overview',
  'Visit and consultation',
  'Vitals',
  'Orders and results',
  'Prescriptions',
  'Admission',
  'Insurance',
  'Dependants',
  'Details',
];
</script>

<template>
  <div class="grid min-h-screen grid-cols-[208px_minmax(0,1fr)] bg-surface-page text-sm text-ink">
    <nav aria-label="Main" class="flex flex-col gap-1 bg-surface-alt px-[10px] py-4">
      <strong class="px-[10px] pb-4 pt-1 text-md">eHMRS</strong>
      <ul class="flex flex-col gap-1">
        <li v-for="item in navigation[role]" :key="item">
          <button
            v-if="item === 'Patients'"
            type="button"
            aria-current="page"
            class="flex min-h-xs w-full items-center rounded-sm bg-surface px-[10px] font-medium shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            @click="screen = 'search'"
          >
            {{ item }}
          </button>
          <span
            v-else
            class="flex min-h-xs items-center px-[10px] font-medium text-ink-secondary"
            title="Not part of this prototype"
            >{{ item }}</span
          >
        </li>
      </ul>
      <label class="mt-auto flex flex-col gap-1 px-[10px] text-xs text-ink-secondary"
        >Prototype role
        <select
          v-model="role"
          class="min-h-xs rounded-xs border border-line-subtle bg-surface px-1 text-ink"
        >
          <option v-for="item in roles" :key="item" :value="item">{{ item }}</option>
        </select>
      </label>
    </nav>
    <main class="flex min-w-0 flex-col gap-4 px-[30px] py-[22px]">
      <header class="flex items-center gap-[14px]">
        <h1 class="flex-1 text-xl font-semibold tracking-tight">{{ title }}</h1>
        <form role="search" class="w-[380px]" @submit.prevent="search">
          <label for="global-search" class="sr-only"
            >Find a patient by name, phone or hospital number</label
          >
          <div
            class="flex min-h-sm items-center gap-2 rounded-sm border border-line-subtle bg-surface pl-3 pr-2 focus-within:border-primary focus-within:outline focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-primary"
          >
            <input
              id="global-search"
              ref="search-box"
              v-model="draft"
              type="search"
              placeholder="Name, phone or hospital number"
              class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:appearance-none"
            />
            <kbd
              aria-hidden="true"
              class="rounded-xs border border-line px-[5px] font-mono text-xs text-ink-muted"
              >/</kbd
            >
          </div>
        </form>
        <KitButton v-if="screen !== 'register'" @click="register('')">Register patient</KitButton>
      </header>
      <PatientSearch
        v-if="screen === 'search'"
        :term="term"
        :role="role"
        @open="open"
        @visit="startVisit"
        @register="register"
      />
      <PatientRegister
        v-else-if="screen === 'register'"
        :term="registerTerm"
        @cancel="screen = 'search'"
        @open="open"
        @saved="open($event, true)"
      />
      <section v-else-if="current" aria-labelledby="chart-title" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="chart-title" class="text-lg font-semibold">{{ current.name }}</h2>
            <p class="flex flex-wrap items-center gap-3 text-ink-secondary">
              <span class="font-mono text-xs">{{ current.hospitalNumber }}</span>
              <span>{{ current.gender }}, {{ current.age }}</span>
              <span>{{ current.insurance }}</span>
              <KitBadge
                variant="dot"
                :severity="current.status === 'active' ? 'success' : 'danger'"
                >{{ current.status === 'active' ? 'Active' : 'Inactive' }}</KitBadge
              >
            </p>
            <p class="text-xs text-ink-muted">
              Registered {{ current.registered }} by {{ current.registeredBy }}
            </p>
          </div>
          <KitButton :disabled="!canStartVisit" @click="startVisit(current)">Start visit</KitButton>
        </div>
        <div
          v-if="justRegistered"
          role="status"
          class="flex items-center justify-between gap-3 rounded-sm bg-success-subtle px-3 py-2 text-success-subtle-text"
        >
          <span
            >Patient registered. Hospital number
            <strong class="font-mono">{{ current.hospitalNumber }}</strong
            >. Add insurance details if they have any.</span
          >
          <div class="flex gap-1">
            <KitButton
              size="xs"
              severity="secondary"
              @click="
                notice = 'The insurance section comes later. In the real system, it opens here.'
              "
              >Add insurance</KitButton
            >
            <KitButton size="xs" severity="secondary" @click="register('')"
              >Register another</KitButton
            >
          </div>
        </div>
        <p v-if="notice" role="status" class="text-ink-secondary">{{ notice }}</p>
        <div class="flex flex-col gap-2 border-t border-line-subtle pt-4">
          <h3 class="font-semibold">Chart sections (next designs)</h3>
          <ul class="flex flex-wrap gap-x-5 gap-y-1 text-ink-secondary">
            <li v-for="item in chartSections" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>
    </main>
  </div>
</template>
