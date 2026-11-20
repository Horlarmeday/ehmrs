<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useField, useForm } from 'vee-validate';
import KitButton from '../../components/kit/KitButton.vue';
import KitInput from '../../components/kit/KitInput.vue';
import { notifyError } from '../../common/notify';
import SignInIllustration from '../../view/pages/auth/components/SignInIllustration.vue';

export type SignInState =
  'default' | 'errors' | 'signing' | 'server-error' | 'deactivated' | 'no-settings' | 'no-logo';

const props = defineProps<{ state: SignInState }>();

const organization = computed(() =>
  props.state === 'no-settings' ? '' : 'Electronic Hospital Management Resource System'
);
const logo = ref(
  props.state === 'no-logo' ? '/media/logos/missing-logo.png' : '/media/logos/ms.png'
);
const logoFailed = ref(false);

const { handleSubmit, validate } = useForm();
const username = useField<string>('username', 'required|min:3', {
  label: 'username',
  initialValue: props.state === 'errors' ? 'ab' : '',
  validateOnValueUpdate: false,
});
const password = useField<string>('password', 'required|min:6', {
  label: 'password',
  initialValue: props.state === 'errors' ? '12345' : '',
  validateOnValueUpdate: false,
});
const signingIn = ref(props.state === 'signing');
const notice = ref(
  props.state === 'deactivated' ? 'This account has been deactivated, please contact support' : ''
);

const onSubmit = handleSubmit(() => {
  signingIn.value = true;
  window.setTimeout(() => {
    signingIn.value = false;
    notifyError({ response: { data: { message: 'Invalid username or password' } } });
  }, 900);
});

function onLogoError(): void {
  if (logoFailed.value) return;
  logoFailed.value = true;
  logo.value = '/media/logos/ms.png';
}

onMounted(() => {
  if (props.state === 'errors') validate();
  if (props.state === 'signing') {
    username.value.value = 'amina.yusuf';
    password.value.value = 'password';
  }
  if (props.state === 'server-error') {
    notifyError({ response: { data: { message: 'Invalid username or password' } } });
  }
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
        <img :src="logo" alt="" class="h-14 w-auto" @error="onLogoError" />
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

        <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
          <KitInput
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
          <KitButton type="submit" size="lg" :loading="signingIn" class="mt-2 w-full">
            {{ signingIn ? 'Signing in…' : 'Sign in' }}
          </KitButton>
        </form>
      </div>
    </main>
  </div>
</template>
