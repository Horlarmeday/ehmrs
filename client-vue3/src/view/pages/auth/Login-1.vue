<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { useField, useForm } from 'vee-validate';
import KitButton from '../../../components/kit/KitButton.vue';
import KitInput from '../../../components/kit/KitInput.vue';
import { useCoarsePointer } from '../../../components/kit/useCoarsePointer';
import { useAuthStore } from '../../../stores/auth';
import { useSettingsStore, type SystemSettings } from '../../../stores/settings';
import SignInIllustration from './components/SignInIllustration.vue';
import { keepSignInNotice, takeSignInNotice } from './signInNotice';

const FALLBACK_LOGO = '/v3/media/logos/ms.png';

const auth = useAuthStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const coarsePointer = useCoarsePointer();

const isDisabled = ref(false);
const loading = ref(false);
const notice = ref(takeSignInNotice());
const logoFailed = ref(false);
const usernameInput = useTemplateRef<InstanceType<typeof KitInput>>('usernameInput');

const { handleSubmit, resetForm } = useForm();
const username = useField<string>('username', 'required|min:3', {
  label: 'username',
  initialValue: '',
  validateOnValueUpdate: false,
});
const password = useField<string>('password', 'required|min:6', {
  label: 'password',
  initialValue: '',
  validateOnValueUpdate: false,
});

function cachedSettings(): SystemSettings | null {
  try {
    const stored = localStorage.getItem('settings');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

const settings = computed(() => cachedSettings() || settingsStore.settings);
const organization = computed(() => settings.value?.name_of_organization ?? '');
const logo = computed(() => {
  const file = settings.value?.organization_logo;
  return file && !logoFailed.value ? `/static/images/${file}` : FALLBACK_LOGO;
});

function removeSpinner(): void {
  isDisabled.value = false;
}

function initialValues(): void {
  resetForm({ values: { username: '', password: '' } });
}

const onSubmitLogin = handleSubmit(() => {
  if (isDisabled.value) return;
  const credentials = { username: username.value.value, password: password.value.value };
  isDisabled.value = true;
  notice.value = '';
  return auth
    .login(credentials)
    .then(() => {
      initialValues();
      router.push('/dashboard');
      removeSpinner();
    })
    .catch((error: unknown) => {
      keepSignInNotice(error);
      removeSpinner();
    });
});

function fetchSettings(): void {
  loading.value = true;
  settingsStore
    .fetchSettings()
    .then(() => {
      localStorage.setItem('settings', JSON.stringify(settingsStore.settings));
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
}

fetchSettings();

onMounted(() => {
  document.title = 'Sign in – eHMRS';
  if (!coarsePointer.value) usernameInput.value?.$el.querySelector('input')?.focus();
});
</script>

<template>
  <div
    class="flex min-h-screen flex-col bg-surface-page text-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
  >
    <aside
      class="flex flex-col gap-6 bg-primary-subtle px-6 py-8 sm:px-10 lg:min-h-screen lg:justify-between lg:py-12"
    >
      <div class="flex items-center gap-4">
        <img :src="logo" alt="" class="h-14 w-auto" @error="logoFailed = true" />
        <p v-if="organization" class="max-w-[22ch] text-lg font-semibold leading-snug">
          {{ organization }}
        </p>
      </div>
      <div class="w-full max-w-[300px] self-center lg:max-w-[480px]">
        <SignInIllustration />
      </div>
      <p class="hidden text-sm text-ink-secondary lg:block">eHMRS</p>
    </aside>

    <main
      id="main"
      class="flex flex-1 items-start justify-center px-4 py-8 sm:px-10 lg:items-center lg:py-10"
    >
      <div class="flex w-full max-w-[380px] flex-col gap-6">
        <div class="flex flex-col gap-1">
          <h1 class="text-xl font-semibold">Sign in</h1>
          <p class="text-sm text-ink-secondary">Use your eHMRS username and password.</p>
        </div>

        <div
          v-if="notice"
          role="alert"
          class="rounded-sm border border-danger bg-danger-subtle px-4 py-3 text-sm text-danger-subtle-text"
        >
          {{ notice }}
        </div>

        <form
          class="flex flex-col gap-4"
          novalidate
          aria-label="Sign in"
          @submit.prevent="onSubmitLogin"
        >
          <KitInput
            ref="usernameInput"
            v-model="username.value.value"
            label="Username"
            name="username"
            autocomplete="username"
            autocapitalize="none"
            spellcheck="false"
            :error="username.errorMessage.value"
            @blur="username.handleBlur($event, true)"
          />
          <KitInput
            v-model="password.value.value"
            label="Password"
            name="password"
            type="password"
            autocomplete="current-password"
            :error="password.errorMessage.value"
            @blur="password.handleBlur($event, true)"
          />
          <KitButton type="submit" size="lg" :loading="isDisabled" class="mt-2 w-full">
            {{ isDisabled ? 'Signing in…' : 'Sign in' }}
          </KitButton>
        </form>
      </div>
    </main>
  </div>
</template>
