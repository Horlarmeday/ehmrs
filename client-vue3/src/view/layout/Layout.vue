<script setup lang="ts">
import { computed, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppShell, { type ShellNavItem } from '../../components/shell/AppShell.vue';
import { parseJwt } from '../../common/jwt';
import { useAuthStore } from '../../stores/auth';
import { menuFor, sectionOf } from './navigation';

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const claims = computed(() => parseJwt(auth.token));
const menu = computed(() => menuFor(claims.value?.role, claims.value?.sub_role));
const navigation = computed<ShellNavItem[]>(() =>
  menu.value.map((entry) => ({ value: entry.id, label: entry.label, icon: entry.icon }))
);
const current = computed(() =>
  route.path === '/dashboard' ? 'home' : (sectionOf(route.fullPath) ?? '')
);
const userName = computed(() => claims.value?.fullname ?? 'Account');

function navigate(value: string): void {
  const entry = menu.value.find((item) => item.id === value);
  if (entry) router.push(entry.to);
}

function search(term: string): void {
  if (!term) return;
  router.push({ path: '/patient/find-patient', query: { search: term } });
}

function account(action: string): void {
  if (action === 'change-password') router.push('/settings/change-password');
  if (action === 'sign-out') auth.logoutSession().then(() => router.push('/auth/login'));
}

watch(
  () => route.path,
  async (_now, before) => {
    const label = menu.value.find((entry) => entry.id === current.value)?.label;
    document.title = label ? `${label} – eHMRS` : 'eHMRS';
    if (!before) return;
    await nextTick();
    const heading = document.querySelector<HTMLElement>('main h1');
    const target = heading ?? document.getElementById('main');
    if (!target) return;
    if (heading) heading.tabIndex = -1;
    target.focus();
  },
  { immediate: true }
);
</script>

<template>
  <AppShell
    :navigation="navigation"
    :current="current"
    :user-name="userName"
    @navigate="navigate"
    @search="search"
    @account="account"
  >
    <router-view />
  </AppShell>
</template>
