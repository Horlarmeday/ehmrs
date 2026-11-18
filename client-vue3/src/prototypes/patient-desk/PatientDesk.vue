<script setup lang="ts">
import { computed, ref } from 'vue';
import KitBadge from '../../components/kit/KitBadge.vue';
import KitButton from '../../components/kit/KitButton.vue';
import KitNativeSelect from '../../components/kit/KitNativeSelect.vue';
import KitPageHeader from '../../components/kit/KitPageHeader.vue';
import AppShell, { type ShellNavItem } from '../../components/shell/AppShell.vue';
import { menuFor } from '../../view/layout/navigation';
import PatientRegister from './PatientRegister.vue';
import PatientSearch from './PatientSearch.vue';
import type { FakePatient } from './fakeData';
import { startVisitRoles, type DemoRole } from './roles';

type Screen = 'search' | 'register' | 'chart';
const roles: DemoRole[] = ['Medical Records', 'Admin', 'Nurse'];
const role = ref<DemoRole>('Medical Records');
const screen = ref<Screen>('search');
const term = ref('');
const registerTerm = ref('');
const current = ref<FakePatient | null>(null);
const justRegistered = ref(false);
const notice = ref('');

const canStartVisit = computed(
  () => startVisitRoles.includes(role.value) && current.value?.status === 'active'
);

function search(next: string): void {
  term.value = next;
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

const navigation = computed<ShellNavItem[]>(() =>
  menuFor(role.value, role.value === 'Nurse' ? 'G-OPD' : undefined).map((entry) => ({
    value: entry.id,
    label: entry.label,
    icon: entry.icon,
  }))
);
const roleOptions = roles.map((value) => ({ value, label: value }));
function chooseRole(next: string | null): void {
  const match = roles.find((item) => item === next);
  if (match) role.value = match;
}
function navigate(value: string): void {
  if (value === 'patients') screen.value = 'search';
}
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
  <AppShell
    :navigation="navigation"
    current="patients"
    user-name="Prototype user"
    autofocus-search
    @navigate="navigate"
    @search="search"
  >
    <KitPageHeader :title="title">
      <template #actions>
        <KitNativeSelect
          :model-value="role"
          label="Prototype role"
          hide-label
          :options="roleOptions"
          class="w-[180px]"
          @update:model-value="chooseRole"
        />
        <KitButton v-if="screen !== 'register'" @click="register('')">Register patient</KitButton>
      </template>
    </KitPageHeader>
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
  </AppShell>
</template>
