<script setup lang="ts">
/**
 * EditPatientPage - Form pattern for editing patient information
 * Follows: Form Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import * as z from 'zod'
import { usePatientStore } from '@/stores/patient.store'
import type { UpdatePatientRequest } from '@/types/patient'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const patientStore = usePatientStore()

const patient = computed(() => patientStore.currentPatient)
const isLoading = computed(() => patientStore.isLoading)
const isSubmitting = ref(false)

// Validation schema
const schema = toTypedSchema(
  z.object({
    firstname: z.string().min(2, 'First name is required'),
    lastname: z.string().min(2, 'Last name is required'),
    middlename: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
    date_of_birth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth is required')
      .refine((val) => new Date(val) < new Date(), { message: 'Date of birth must be in the past' }),
    phone: z.string().min(10, 'Valid phone number required'),
    alt_phone: z.string().optional(),
    address: z.string().min(5, 'Address is required'),
    country: z.string().optional(),
    state: z.string().optional(),
    lga: z.string().optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    occupation: z.string().optional(),
    marital_status: z.string().optional(),
    religion: z.string().optional(),
    hospital_id: z.string().optional(),
    next_of_kin_name: z.string().optional(),
    next_of_kin_address: z.string().optional(),
    next_of_kin_phone: z.string().optional(),
    next_of_kin_relationship: z.string().optional(),
  })
)

const { handleSubmit, errors, setValues } = useForm({ validationSchema: schema })

const onSubmit = handleSubmit(async (values) => {
  if (!patient.value) return

  isSubmitting.value = true

  try {
    const updateData: UpdatePatientRequest = {
      id: patient.value.id,
      firstname: values.firstname,
      lastname: values.lastname,
      middlename: values.middlename,
      gender: values.gender as Gender,
      date_of_birth: values.date_of_birth,
      phone: values.phone,
      alt_phone: values.alt_phone,
      address: values.address,
      country: values.country,
      state: values.state,
      lga: values.lga,
      email: values.email || undefined,
      occupation: values.occupation,
      marital_status: values.marital_status,
      religion: values.religion,
      hospital_id: values.hospital_id,
      next_of_kin_name: values.next_of_kin_name,
      next_of_kin_address: values.next_of_kin_address,
      next_of_kin_phone: values.next_of_kin_phone,
      next_of_kin_relationship: values.next_of_kin_relationship,
    }

    await patientStore.updatePatient(patient.value.id, updateData)
    toast.success('Patient updated successfully')
    router.push(`/patient/profile/${patient.value.id}`)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update patient'
    toast.error(message)
  } finally {
    isSubmitting.value = false
  }
})

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    toast.error('Invalid patient ID')
    router.push('/patient/find-patient')
    return
  }
  await patientStore.fetchPatientById(id)

  // Populate form with patient data
  if (patient.value) {
    const p = patient.value
    setValues({
      firstname: p.firstname || '',
      lastname: p.lastname || '',
      middlename: p.middlename || '',
      gender: p.gender as 'Male' | 'Female' | 'Other',
      date_of_birth: p.date_of_birth ? new Date(p.date_of_birth).toISOString().split('T')[0] : '',
      phone: p.phone || '',
      alt_phone: p.alt_phone || '',
      address: p.address || '',
      country: p.country || '',
      state: p.state || '',
      lga: p.lga || '',
      email: p.email || '',
      occupation: p.occupation || '',
      marital_status: p.marital_status || '',
      religion: p.religion || '',
      hospital_id: p.hospital_id || '',
      next_of_kin_name: p.next_of_kin_name || '',
      next_of_kin_address: p.next_of_kin_address || '',
      next_of_kin_phone: p.next_of_kin_phone || '',
      next_of_kin_relationship: p.next_of_kin_relationship || '',
    })
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.back()">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">
          Edit Patient
          <span v-if="patient" class="text-blue-600">
            {{ patient.fullname || `${patient.firstname} ${patient.lastname}` }}
          </span>
        </h1>
        <p class="text-sm text-gray-500 mt-1">Update patient demographic information</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <Card>
        <CardHeader>
          <Skeleton class="h-6 w-48" />
        </CardHeader>
        <CardContent class="space-y-4">
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
          <Skeleton class="h-10 w-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Form -->
    <form v-else-if="patient" @submit="onSubmit" class="space-y-6">
      <!-- Personal Details -->
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update patient's personal information</CardDescription>
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
              <Label for="middlename">Middle Name</Label>
              <Field name="middlename" v-slot="{ componentField }">
                <Input id="middlename" v-bind="componentField" placeholder="Middle name" />
                <p v-if="errors.middlename" class="text-sm text-destructive mt-1">{{ errors.middlename }}</p>
              </Field>
            </div>
            <div>
              <Label for="lastname">Last Name <span class="text-destructive">*</span></Label>
              <Field name="lastname" v-slot="{ componentField }">
                <Input id="lastname" v-bind="componentField" placeholder="Last name" />
                <p v-if="errors.lastname" class="text-sm text-destructive mt-1">{{ errors.lastname }}</p>
              </Field>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div>
              <Label for="date_of_birth">Date of Birth <span class="text-destructive">*</span></Label>
              <Field name="date_of_birth" v-slot="{ componentField }">
                <DatePicker id="date_of_birth" v-bind="componentField" label="" />
                <p v-if="errors.date_of_birth" class="text-sm text-destructive mt-1">{{ errors.date_of_birth }}</p>
              </Field>
            </div>
            <div>
              <Label for="hospital_id">Hospital ID</Label>
              <Field name="hospital_id" v-slot="{ componentField }">
                <Input id="hospital_id" v-bind="componentField" placeholder="Hospital ID" />
                <p v-if="errors.hospital_id" class="text-sm text-destructive mt-1">{{ errors.hospital_id }}</p>
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Contact Information -->
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Update patient's contact details</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="phone">Phone Number <span class="text-destructive">*</span></Label>
              <Field name="phone" v-slot="{ componentField }">
                <Input id="phone" v-bind="componentField" placeholder="Phone number" />
                <p v-if="errors.phone" class="text-sm text-destructive mt-1">{{ errors.phone }}</p>
              </Field>
            </div>
            <div>
              <Label for="alt_phone">Alternate Phone</Label>
              <Field name="alt_phone" v-slot="{ componentField }">
                <Input id="alt_phone" v-bind="componentField" placeholder="Alternate phone" />
                <p v-if="errors.alt_phone" class="text-sm text-destructive mt-1">{{ errors.alt_phone }}</p>
              </Field>
            </div>
            <div>
              <Label for="email">Email</Label>
              <Field name="email" v-slot="{ componentField }">
                <Input id="email" type="email" v-bind="componentField" placeholder="Email address" />
                <p v-if="errors.email" class="text-sm text-destructive mt-1">{{ errors.email }}</p>
              </Field>
            </div>
          </div>

          <div>
            <Label for="address">Home Address <span class="text-destructive">*</span></Label>
            <Field name="address" v-slot="{ componentField }">
              <Textarea id="address" v-bind="componentField" placeholder="Full address" />
              <p v-if="errors.address" class="text-sm text-destructive mt-1">{{ errors.address }}</p>
            </Field>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="country">Country</Label>
              <Field name="country" v-slot="{ componentField }">
                <Input id="country" v-bind="componentField" placeholder="Country" />
                <p v-if="errors.country" class="text-sm text-destructive mt-1">{{ errors.country }}</p>
              </Field>
            </div>
            <div>
              <Label for="state">State</Label>
              <Field name="state" v-slot="{ componentField }">
                <Input id="state" v-bind="componentField" placeholder="State" />
                <p v-if="errors.state" class="text-sm text-destructive mt-1">{{ errors.state }}</p>
              </Field>
            </div>
            <div>
              <Label for="lga">Local Government</Label>
              <Field name="lga" v-slot="{ componentField }">
                <Input id="lga" v-bind="componentField" placeholder="LGA" />
                <p v-if="errors.lga" class="text-sm text-destructive mt-1">{{ errors.lga }}</p>
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Additional Information -->
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label for="occupation">Occupation</Label>
              <Field name="occupation" v-slot="{ componentField }">
                <Input id="occupation" v-bind="componentField" placeholder="Occupation" />
                <p v-if="errors.occupation" class="text-sm text-destructive mt-1">{{ errors.occupation }}</p>
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
            <div>
              <Label for="religion">Religion</Label>
              <Field name="religion" v-slot="{ componentField }">
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
                <p v-if="errors.religion" class="text-sm text-destructive mt-1">{{ errors.religion }}</p>
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
                <Field name="next_of_kin_name" v-slot="{ componentField }">
                  <Input id="next_of_kin_name" v-bind="componentField" placeholder="Next of kin name" />
                  <p v-if="errors.next_of_kin_name" class="text-sm text-destructive mt-1">{{ errors.next_of_kin_name }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_phone">Phone</Label>
                <Field name="next_of_kin_phone" v-slot="{ componentField }">
                  <Input id="next_of_kin_phone" v-bind="componentField" placeholder="Next of kin phone" />
                  <p v-if="errors.next_of_kin_phone" class="text-sm text-destructive mt-1">{{ errors.next_of_kin_phone }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_address">Address</Label>
                <Field name="next_of_kin_address" v-slot="{ componentField }">
                  <Input id="next_of_kin_address" v-bind="componentField" placeholder="Next of kin address" />
                  <p v-if="errors.next_of_kin_address" class="text-sm text-destructive mt-1">{{ errors.next_of_kin_address }}</p>
                </Field>
              </div>
              <div>
                <Label for="next_of_kin_relationship">Relationship</Label>
                <Field name="next_of_kin_relationship" v-slot="{ componentField }">
                  <Select v-bind="componentField">
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Brother">Brother</SelectItem>
                        <SelectItem value="Sister">Sister</SelectItem>
                        <SelectItem value="Father">Father</SelectItem>
                        <SelectItem value="Mother">Mother</SelectItem>
                        <SelectItem value="Wife">Wife</SelectItem>
                        <SelectItem value="Husband">Husband</SelectItem>
                        <SelectItem value="Son">Son</SelectItem>
                        <SelectItem value="Daughter">Daughter</SelectItem>
                        <SelectItem value="Uncle">Uncle</SelectItem>
                        <SelectItem value="Aunt">Aunt</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p v-if="errors.next_of_kin_relationship" class="text-sm text-destructive mt-1">{{ errors.next_of_kin_relationship }}</p>
                </Field>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Submit Button -->
      <div class="flex justify-between">
        <Button type="button" variant="outline" @click="router.back()">
          Cancel
        </Button>
        <Button type="submit" :loading="isSubmitting">
          Update Patient
        </Button>
      </div>
    </form>
  </div>
</template>
