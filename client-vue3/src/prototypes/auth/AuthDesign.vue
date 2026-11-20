<script setup lang="ts">
import AppToaster from '../../common/AppToaster.vue';
import KitConfirmHost from '../../components/kit/KitConfirmHost.vue';
import AppShell, { type ShellNavItem } from '../../components/shell/AppShell.vue';
import ChangePasswordDesign from './ChangePasswordDesign.vue';
import SignInDesign, { type SignInState } from './SignInDesign.vue';

const params = new URLSearchParams(window.location.search);
const states: SignInState[] = [
  'default',
  'errors',
  'signing',
  'server-error',
  'deactivated',
  'no-settings',
  'no-logo',
];
const state = states.find((s) => s === params.get('state')) ?? 'default';
const screen = params.get('screen') === 'change-password' ? 'change-password' : 'sign-in';
const passwordState =
  state === 'errors' ? 'errors' : state === 'server-error' ? 'server-error' : 'default';

const navigation: ShellNavItem[] = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'patients', label: 'Patients', icon: 'users' },
];
</script>

<template>
  <AppToaster />
  <KitConfirmHost />
  <SignInDesign v-if="screen === 'sign-in'" :state="state" />
  <AppShell v-else :navigation="navigation" current="" user-name="Amina Yusuf">
    <ChangePasswordDesign :state="passwordState" />
  </AppShell>
</template>
