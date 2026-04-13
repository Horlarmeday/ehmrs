<script setup lang="ts">
/**
 * CreateEmergencyPage - Simplified form for emergency patient registration
 * Follows: Form Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import * as z from 'zod'
import { usePatientStore } from '@/stores/patient.store'
import { Gender } from '@/types/common'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DatePicker } from '@/components/ui/date-picker'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const patientStore = usePatientStore()
const isSubmitting = ref(false)

// Validation schema - minimal fields for emergency
const schema = toTypedSchema(
  z.object({
    firstname: z.string().min(2, 'First name is required'),
    lastname: z.string().min(2, 'Last name is required'),
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    date_of_birth: z
      .string()
      .default('')
      .refine((val) => !val || new Date(val) < new Date(), { message: 'Date of birth must be in the past' }),
    phone: z.string().min(10, 'Valid phone number required'),
    address: z.string().min(5, 'Address is required'),
    marital_status: z.string().optional(),
  })
)

const { handleSubmit, errors } = useForm({ validationSchema: schema })

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const patient = await patientStore.createEmergencyPatient({
      firstname: values.firstname,
      lastname: values.lastname,
      gender: values.gender as Gender,
      date_of_birth: values.date_of_birth,
      phone: values.phone,
      address: values.address,
      marital_status: values.marital_status,
    })

    toast.success('Emergency patient created successfully')
    router.push(`/patient/profile/${patient.id}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create emergency patient'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/patient/find-patient')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">Create Emergency Account</h1>
        <p class="text-sm text-gray-500 mt-1">Quick registration for emergency situations</p>
      </div>
    </div>

    <!-- Emergency Notice -->
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div class="flex gap-3">
        <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm text-amber-800">
          <p class="font-semibold">Emergency Registration</p>
          <p>Only essential information is required. You can complete the patient profile later.</p>
        </div>
      </div>
    </div>

    <!-- Form -->
    <form @submit="onSubmit">
      <Card>
        <CardHeader>
          <CardTitle>Emergency Patient Details</CardTitle>
          <CardDescription>Enter minimal information for emergency registration</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="firstname">First Name <span class="text-destructive">*</span></Label>
              <Field name="firstname" v-slot="{ componentField }">
                <Input id="firstname" v-bind="componentField" placeholder="First name" />
                <p v-if="errors.firstname" class="text-sm text-destructive mt-1">{{ errors.firstname }}</p>
              </Field>
            </div>
            <div>
              <Label for="lastname">Last Name <span class="text-destructive">*</span></Label>
              <Field name="lastname" v-slot="{ componentField }">
                <Input id="lastname" v-bind="componentField" placeholder="Last name" />
                <p v-if="errors.lastname" class="text-sm text-destructive mt-1">{{ errors.lastname }}</p>
              </Field>
            </div>
            <div>
              <Label for="gender">Gender <span class="text-destructive">*</span></Label>
              <Field name="gender" v-slot="{ componentField }">
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p v-if="errors.gender" class="text-sm text-destructive mt-1">{{ errors.gender }}</p>
              </Field>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="date_of_birth">Date of Birth</Label>
              <Field name="date_of_birth" v-slot="{ componentField }">
                <DatePicker id="date_of_birth" v-bind="componentField" label="" />
                <p v-if="errors.date_of_birth" class="text-sm text-destructive mt-1">{{ errors.date_of_birth }}</p>
              </Field>
            </div>
            <div>
              <Label for="phone">Phone Number <span class="text-destructive">*</span></Label>
              <Field name="phone" v-slot="{ componentField }">
                <Input id="phone" v-bind="componentField" placeholder="Phone number" />
                <p v-if="errors.phone" class="text-sm text-destructive mt-1">{{ errors.phone }}</p>
              </Field>
            </div>
            <div>
              <Label for="marital_status">Marital Status</Label>
              <Field name="marital_status" v-slot="{ componentField }">
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widow">Widow</SelectItem>
                      <SelectItem value="Widower">Widower</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p v-if="errors.marital_status" class="text-sm text-destructive mt-1">{{ errors.marital_status }}</p>
              </Field>
            </div>
          </div>

          <div>
            <Label for="address">Address <span class="text-destructive">*</span></Label>
            <Field name="address" v-slot="{ componentField }">
              <Input id="address" v-bind="componentField" placeholder="Address" />
              <p v-if="errors.address" class="text-sm text-destructive mt-1">{{ errors.address }}</p>
            </Field>
          </div>
        </CardContent>
      </Card>

      <!-- Submit Button -->
      <div class="flex justify-between mt-6">
        <Button type="button" variant="outline" @click="router.push('/patient/find-patient')">
          Cancel
        </Button>
        <Button type="submit" :loading="isSubmitting">
          Create Emergency Account
        </Button>
      </div>
    </form>
  </div>
</template>
