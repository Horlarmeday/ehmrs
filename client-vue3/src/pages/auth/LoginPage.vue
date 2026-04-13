<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm, Field } from 'vee-validate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLoading from '@/components/common/AppLoading.vue'
import { Eye, EyeOff } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showPassword = ref(false)
const isSubmitting = ref(false)

const loginSchema = toTypedSchema(
  z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  })
)

const { handleSubmit, errors } = useForm({
  validationSchema: loginSchema,
})

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    await authStore.login(values.username, values.password)

    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed. Please try again.'
    toast.error('Login Failed', { description: message })
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <span class="text-blue-600 font-bold text-2xl">E</span>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-white">EHMRS</h1>
          <p class="text-blue-100 text-sm">Healthcare Management System</p>
        </div>
      </div>
      <h2 class="text-xl font-semibold text-white">Welcome Back</h2>
      <p class="text-blue-100 mt-1">Sign in to access your dashboard</p>
    </div>

    <!-- Form -->
    <div class="p-8">
      <form @submit="onSubmit" class="space-y-6">
        <!-- Username -->
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Field name="username" v-slot="{ componentField }">
            <Input
              id="username"
              v-bind="componentField"
              type="text"
              placeholder="Enter your username"
              :class="{ 'border-destructive': errors.username }"
              :disabled="isSubmitting"
              :aria-invalid="!!errors.username"
              aria-describedby="username-error"
            />
          </Field>
          <p v-if="errors.username" id="username-error" class="text-sm text-destructive" role="alert">
            {{ errors.username }}
          </p>
        </div>

        <!-- Password -->
        <div class="space-y-2">
          <Label for="password">Password</Label>
          <div class="relative">
            <Field name="password" v-slot="{ componentField }">
              <Input
                id="password"
                v-bind="componentField"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                :class="{ 'border-destructive': errors.password, 'pr-10': true }"
                :disabled="isSubmitting"
                :aria-invalid="!!errors.password"
                aria-describedby="password-error"
              />
            </Field>
            <button
              type="button"
              tabindex="-1"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <Eye v-if="!showPassword" class="w-4 h-4" />
              <EyeOff v-else class="w-4 h-4" />
            </button>
          </div>
          <p v-if="errors.password" id="password-error" class="text-sm text-destructive" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <!-- Forgot Password -->
        <div class="text-right">
          <button type="button" class="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot your password?
          </button>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          variant="default"
          size="lg"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          class="w-full"
        >
          {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
        </Button>
      </form>

      <!-- Help Text -->
      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-600">
          Need help? Contact support at
          <a href="tel:+234XXXXXXXX" class="text-blue-600 hover:underline font-medium">
            +234 XXX XXX XXXX
          </a>
        </p>
      </div>
    </div>

    <!-- Loading Overlay -->
    <AppLoading :visible="isSubmitting" text="Signing in..." />
  </div>
</template>
