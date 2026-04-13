<script setup lang="ts">
/**
 * CreatePatientPage - Multi-step form for patient registration
 * Follows: Multi-step Form Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import * as z from 'zod'
import { usePatientStore } from '@/stores/patient.store'
import type { CreatePatientRequest } from '@/types/patient'
import { PatientType } from '@/types/patient'
import { Gender } from '@/types/common'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, Check } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const patientStore = usePatientStore()

// Step management
const currentStep = ref(1)
const totalSteps = 3

// Schema for each step
const step1Schema = toTypedSchema(
  z.object({
    firstname: z.string().min(2, 'First name is required'),
    lastname: z.string().min(2, 'Last name is required'),
    middlename: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth is required')
      .refine((val) => new Date(val) < new Date(), { message: 'Date of birth must be in the past' }),
    patient_type: z.enum(['Patient', 'Dependant']).default('Patient'),
  })
)

const step2Schema = toTypedSchema(
  z.object({
    phone: z.string().min(10, 'Valid phone number required'),
    alt_phone: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    country: z.string().default('Nigeria'),
    state: z.string().optional(),
    lga: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
  })
)

const step3Schema = toTypedSchema(
  z.object({
    occupation: z.string().optional(),
    marital_status: z.string().optional(),
    religion: z.string().optional(),
    hospital_id: z.string().optional(),
    next_of_kin_name: z.string().optional(),
    next_of_kin_address: z.string().optional(),
    next_of_kin_phone: z.string().optional(),
    next_of_kin_relationship: z.string().optional(),
    has_insurance: z.boolean().default(false),
  })
)

// Forms for each step
const step1Form = useForm({ validationSchema: step1Schema })
const step2Form = useForm({ validationSchema: step2Schema })
const step3Form = useForm({ validationSchema: step3Schema })

const isSubmitting = ref(false)

// Step navigation
function nextStep() {
  if (currentStep.value === 1) {
    step1Form.validate().then(({ valid }) => {
      if (valid) currentStep.value++
    })
  } else if (currentStep.value === 2) {
    step2Form.validate().then(({ valid }) => {
      if (valid) currentStep.value++
    })
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Submit handler
const onSubmit = step3Form.handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    // Combine all form values
    const step1Values = step1Form.values
    const step2Values = step2Form.values

    const patientData: CreatePatientRequest = {
      firstname: step1Values.firstname || '',
      lastname: step1Values.lastname || '',
      middlename: step1Values.middlename,
      gender: step1Values.gender as Gender,
      date_of_birth: step1Values.date_of_birth || '',
      patient_type: (step1Values.patient_type as PatientType) || PatientType.PATIENT,
      phone: step2Values.phone || '',
      alt_phone: step2Values.alt_phone,
      address: step2Values.address || '',
      country: step2Values.country,
      state: step2Values.state,
      lga: step2Values.lga,
      email: step2Values.email,
      occupation: values.occupation,
      marital_status: values.marital_status,
      religion: values.religion,
      hospital_id: values.hospital_id,
      next_of_kin_name: values.next_of_kin_name,
      next_of_kin_address: values.next_of_kin_address,
      next_of_kin_phone: values.next_of_kin_phone,
      next_of_kin_relationship: values.next_of_kin_relationship,
      has_insurance: values.has_insurance || false,
    }

    const patient = await patientStore.createPatient(patientData)
    toast.success('Patient created successfully')
    router.push(`/patient/profile/${patient.id}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create patient'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
})

// Computed step progress
const stepProgress = computed(() => {
  return Math.round((currentStep.value / totalSteps) * 100)
})

// Ref for step heading to move focus on step change
const stepHeadingRef = ref<HTMLElement | null>(null)

// Watch step changes to move focus
watch(currentStep, () => {
  // Move focus to step heading for accessibility
  setTimeout(() => {
    stepHeadingRef.value?.focus()
  }, 100)
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
        <h1 class="text-2xl font-bold text-gray-900">Create Patient Account</h1>
        <p class="text-sm text-gray-500 mt-1">Register a new patient with demographic information</p>
      </div>
    </div>

    <!-- Step Progress -->
    <div class="bg-white rounded-lg shadow-sm p-4" aria-live="polite">
      <h2 ref="stepHeadingRef" tabindex="-1" class="sr-only">Step {{ currentStep }} of {{ totalSteps }}</h2>
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Step {{ currentStep }} of {{ totalSteps }}</span>
        <span class="text-sm text-gray-500">{{ stepProgress }}%</span>
      </div>
      <div
        class="w-full bg-gray-200 rounded-full h-2"
        role="progressbar"
        :aria-valuenow="stepProgress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Form completion progress"
      >
        <div class="bg-blue-600 h-2 rounded-full transition-all" :style="{ width: `${stepProgress}%` }" />
      </div>
      <div class="flex justify-between mt-3">
        <span :class="['text-xs', currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400']">
          <Check v-if="currentStep > 1" class="w-3 h-3 inline mr-1" />
          Basic Info
        </span>
        <span :class="['text-xs', currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400']">
          <Check v-if="currentStep > 2" class="w-3 h-3 inline mr-1" />
          Contact
        </span>
        <span :class="['text-xs', currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400']">
          Additional
        </span>
      </div>
    </div>

    <!-- Form -->
    <form @submit="onSubmit">
      <!-- Step 1: Basic Information -->
      <Card v-show="currentStep === 1">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the patient's personal details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="firstname">First Name <span class="text-destructive">*</span></Label>
              <Field name="firstname" v-slot="{ componentField, errors }">
                <Input id="firstname" v-bind="componentField" placeholder="First name" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="middlename">Middle Name</Label>
              <Field name="middlename" v-slot="{ componentField, errors }">
                <Input id="middlename" v-bind="componentField" placeholder="Middle name" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="lastname">Last Name <span class="text-destructive">*</span></Label>
              <Field name="lastname" v-slot="{ componentField, errors }">
                <Input id="lastname" v-bind="componentField" placeholder="Last name" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="gender">Gender <span class="text-destructive">*</span></Label>
              <Field name="gender" v-slot="{ componentField, errors }">
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
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="date_of_birth">Date of Birth <span class="text-destructive">*</span></Label>
              <Field name="date_of_birth" v-slot="{ componentField, errors }">
                <DatePicker id="date_of_birth" v-bind="componentField" label="" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="patient_type">Patient Type</Label>
              <Field name="patient_type" v-slot="{ componentField, errors }">
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Patient">Patient</SelectItem>
                      <SelectItem value="Dependant">Dependant</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Step 2: Contact Information -->
      <Card v-show="currentStep === 2">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Enter the patient's contact details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="phone">Phone Number <span class="text-destructive">*</span></Label>
              <Field name="phone" v-slot="{ componentField, errors }">
                <Input id="phone" v-bind="componentField" placeholder="Phone number" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="alt_phone">Alternate Phone</Label>
              <Field name="alt_phone" v-slot="{ componentField, errors }">
                <Input id="alt_phone" v-bind="componentField" placeholder="Alternate phone" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="email">Email</Label>
              <Field name="email" v-slot="{ componentField, errors }">
                <Input id="email" type="email" v-bind="componentField" placeholder="Email address" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
          </div>

          <div>
            <Label for="address">Home Address <span class="text-destructive">*</span></Label>
            <Field name="address" v-slot="{ componentField, errors }">
              <Textarea id="address" v-bind="componentField" placeholder="Full address" />
              <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
            </Field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="country">Country</Label>
              <Field name="country" v-slot="{ componentField, errors }">
                <Input id="country" v-bind="componentField" placeholder="Country" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="state">State</Label>
              <Field name="state" v-slot="{ componentField, errors }">
                <Input id="state" v-bind="componentField" placeholder="State" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="lga">Local Government</Label>
              <Field name="lga" v-slot="{ componentField, errors }">
                <Input id="lga" v-bind="componentField" placeholder="LGA" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Step 3: Additional Information -->
      <Card v-show="currentStep === 3">
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Enter optional patient details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="occupation">Occupation</Label>
              <Field name="occupation" v-slot="{ componentField, errors }">
                <Input id="occupation" v-bind="componentField" placeholder="Occupation" />
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="marital_status">Marital Status</Label>
              <Field name="marital_status" v-slot="{ componentField, errors }">
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
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="religion">Religion</Label>
              <Field name="religion" v-slot="{ componentField, errors }">
                <Select v-bind="componentField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Christianity">Christianity</SelectItem>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Traditional">Traditional</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
              </Field>
            </div>
          </div>

          <Separator />

          <!-- Next of Kin -->
          <div>
            <h3 class="text-lg font-medium mb-3">Next of Kin</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="next_of_kin_name">Name</Label>
                <Field name="next_of_kin_name" v-slot="{ componentField, errors }">
                  <Input id="next_of_kin_name" v-bind="componentField" placeholder="Next of kin name" />
                  <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_phone">Phone</Label>
                <Field name="next_of_kin_phone" v-slot="{ componentField, errors }">
                  <Input id="next_of_kin_phone" v-bind="componentField" placeholder="Next of kin phone" />
                  <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_address">Address</Label>
                <Field name="next_of_kin_address" v-slot="{ componentField, errors }">
                  <Input id="next_of_kin_address" v-bind="componentField" placeholder="Next of kin address" />
                  <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_relationship">Relationship</Label>
                <Field name="next_of_kin_relationship" v-slot="{ componentField, errors }">
                  <Select v-bind="componentField">
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Spouse">Spouse</SelectItem>
                        <SelectItem value="Parent">Parent</SelectItem>
                        <SelectItem value="Sibling">Sibling</SelectItem>
                        <SelectItem value="Child">Child</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p v-if="errors[0]" class="text-sm text-destructive mt-1">{{ errors[0] }}</p>
                </Field>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Navigation Buttons -->
      <div class="flex justify-between mt-6">
        <Button type="button" variant="outline" @click="router.push('/patient/find-patient')">
          Cancel
        </Button>
        <div class="flex gap-3">
          <Button v-if="currentStep > 1" type="button" variant="outline" @click="prevStep">
            <ArrowLeft class="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button v-if="currentStep < totalSteps" type="button" @click="nextStep">
            Next
            <ArrowRight class="w-4 h-4 ml-2" />
          </Button>
          <Button v-if="currentStep === totalSteps" type="submit" :loading="isSubmitting">
            Create Patient
          </Button>
        </div>
      </div>
    </form>
  </div>
</template>
