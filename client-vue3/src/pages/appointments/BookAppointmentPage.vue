<script setup lang="ts">
/**
 * BookAppointmentPage - Form for booking a new appointment
 * Follows: Form Page Pattern from CLIENT_DESIGN_SYSTEM.md
 * Uses VeeValidate + Zod for validation (STANDARD FORM PATTERN)
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field } from 'vee-validate'
import * as z from 'zod'
import dayjs from 'dayjs'
import { useAppointmentStore } from '@/stores/appointment.store'
import type { CreateAppointmentRequest } from '@/types/appointment'
import { AppointmentType } from '@/types/appointment'
import * as patientService from '@/services/patient.service'
import { toast } from 'vue-sonner'

// Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { bookAppointmentSchema } from './bookAppointment.schema'

const router = useRouter()
const appointmentStore = useAppointmentStore()

// VeeValidate form schema
const schema = toTypedSchema(bookAppointmentSchema)

// Form instance
const { handleSubmit, setValues } = useForm({
  validationSchema: schema,
  initialValues: {
    duration_minutes: 30,
  },
})

const isSubmitting = ref(false)

// Submit handler
const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true

  try {
    const appointmentData: CreateAppointmentRequest = {
      patient_id: values.patient_id,
      doctor_id: values.doctor_id,
      appointment_date: values.appointment_date,
      appointment_time: values.appointment_time,
      type: values.type as AppointmentType,
      department: values.department,
      professional: values.professional,
      duration_minutes: values.duration_minutes ?? 30,
      priority: values.priority || undefined,
      reason_for_visit: values.reason_for_visit || undefined,
      notes: values.notes || undefined,
    }

    const appointment = await appointmentStore.createAppointment(appointmentData)
    toast.success('Appointment booked successfully')
    router.push(`/appointments/${appointment.id}`)
  } catch (error: unknown) {
    const axiosData = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    const message = axiosData ?? (error instanceof Error ? error.message : 'Failed to book appointment')
    toast.error('Booking Failed', { description: message })
  } finally {
    isSubmitting.value = false
  }
})

function handlePatientSelect(patientId: string | number) {
  setValues({ patient_id: Number(patientId) })
}

function handleDoctorSelect(doctorId: string | number) {
  setValues({ doctor_id: Number(doctorId) })
}

// Patient and doctor lists loaded from API
// Note: Doctors use placeholder data until staff service is implemented
const patients = ref<Array<{ id: number; name: string }>>([])
const doctors = ref<Array<{ id: number; name: string }>>([
  { id: 1, name: 'Dr. Smith (General)' },
  { id: 2, name: 'Dr. Jones (Cardiology)' },
  { id: 3, name: 'Dr. Williams (Pediatrics)' },
])

// Load patients on mount
onMounted(async () => {
  try {
    const result = await patientService.getPatients({ pageLimit: 1000 })
    patients.value = result.docs.map((p) => ({
      id: p.id,
      name: p.fullname ?? `${p.firstname} ${p.lastname}`,
    }))
  } catch {
    // If patient fetch fails, keep empty array — form validation will catch it
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/appointments/list')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div class="flex-1">
        <h1 class="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p class="text-sm text-gray-500 mt-1">Schedule a new appointment for a patient</p>
      </div>
    </div>

    <!-- Form -->
    <form @submit="onSubmit">
      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Fill in the appointment information</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Patient Selection -->
          <div>
            <Label for="patient_id">Patient <span class="text-destructive">*</span></Label>
            <Field name="patient_id" v-slot="{ componentField, errors: fieldErrors }">
              <Select @update:model-value="(v) => handlePatientSelect(v as string | number)">
                <SelectTrigger :aria-invalid="!!fieldErrors?.length" aria-describedby="patient_id-error">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="patient in patients"
                      :key="patient.id"
                      :value="String(patient.id)"
                    >
                      {{ patient.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p v-if="fieldErrors?.[0]" id="patient_id-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
            </Field>
          </div>

          <!-- Doctor Selection -->
          <div>
            <Label for="doctor_id">Doctor <span class="text-destructive">*</span></Label>
            <Field name="doctor_id" v-slot="{ componentField, errors: fieldErrors }">
              <Select @update:model-value="(v) => handleDoctorSelect(v as string | number)">
                <SelectTrigger :aria-invalid="!!fieldErrors?.length" aria-describedby="doctor_id-error">
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="doctor in doctors"
                      :key="doctor.id"
                      :value="String(doctor.id)"
                    >
                      {{ doctor.name }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p v-if="fieldErrors?.[0]" id="doctor_id-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
            </Field>
          </div>

          <!-- Appointment Type -->
          <div>
            <Label for="type">Appointment Type <span class="text-destructive">*</span></Label>
            <Field name="type" v-slot="{ componentField, errors: fieldErrors }">
              <Select v-bind="componentField">
                <SelectTrigger :aria-invalid="!!fieldErrors?.length" aria-describedby="type-error">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="t in Object.values(AppointmentType)"
                      :key="t"
                      :value="t"
                    >
                      {{ t }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p v-if="fieldErrors?.[0]" id="type-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
            </Field>
          </div>

          <!-- Department & Professional -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="department">Department <span class="text-destructive">*</span></Label>
              <Field name="department" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="department" v-bind="componentField" placeholder="Department" :aria-invalid="!!fieldErrors?.length" aria-describedby="department-error" />
                <p v-if="fieldErrors?.[0]" id="department-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="professional">Professional <span class="text-destructive">*</span></Label>
              <Field name="professional" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="professional" v-bind="componentField" placeholder="Professional name" :aria-invalid="!!fieldErrors?.length" aria-describedby="professional-error" />
                <p v-if="fieldErrors?.[0]" id="professional-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
          </div>

          <!-- Date & Time -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="appointment_date">Date <span class="text-destructive">*</span></Label>
              <Field name="appointment_date" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="appointment_date" type="date" v-bind="componentField" :aria-invalid="!!fieldErrors?.length" aria-describedby="appointment_date-error" />
                <p v-if="fieldErrors?.[0]" id="appointment_date-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="appointment_time">Time <span class="text-destructive">*</span></Label>
              <Field name="appointment_time" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="appointment_time" type="time" v-bind="componentField" :aria-invalid="!!fieldErrors?.length" aria-describedby="appointment_time-error" />
                <p v-if="fieldErrors?.[0]" id="appointment_time-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
          </div>

          <!-- Duration & Priority -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label for="duration_minutes">Duration (minutes)</Label>
              <Field name="duration_minutes" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="duration_minutes" type="number" v-bind="componentField" placeholder="30" min="15" max="240" :aria-invalid="!!fieldErrors?.length" aria-describedby="duration_minutes-error" />
                <p v-if="fieldErrors?.[0]" id="duration_minutes-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
            <div>
              <Label for="priority">Priority</Label>
              <Field name="priority" v-slot="{ componentField, errors: fieldErrors }">
                <Input id="priority" v-bind="componentField" placeholder="Normal, Urgent, etc." :aria-invalid="!!fieldErrors?.length" aria-describedby="priority-error" />
                <p v-if="fieldErrors?.[0]" id="priority-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
              </Field>
            </div>
          </div>

          <!-- Reason for Visit -->
          <div>
            <Label for="reason_for_visit">Reason for Visit</Label>
            <Field name="reason_for_visit" v-slot="{ componentField, errors: fieldErrors }">
              <Textarea id="reason_for_visit" v-bind="componentField" placeholder="Reason for visit..." rows="3" :aria-invalid="!!fieldErrors?.length" aria-describedby="reason_for_visit-error" />
              <p v-if="fieldErrors?.[0]" id="reason_for_visit-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
            </Field>
          </div>

          <!-- Notes -->
          <div>
            <Label for="notes">Notes</Label>
            <Field name="notes" v-slot="{ componentField, errors: fieldErrors }">
              <Textarea id="notes" v-bind="componentField" placeholder="Additional notes..." rows="3" :aria-invalid="!!fieldErrors?.length" aria-describedby="notes-error" />
              <p v-if="fieldErrors?.[0]" id="notes-error" class="text-sm text-destructive mt-1" role="alert">{{ fieldErrors[0] }}</p>
            </Field>
          </div>
        </CardContent>
      </Card>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-6">
        <Button type="button" variant="outline" @click="router.push('/appointments/list')">
          Cancel
        </Button>
        <Button type="submit" :loading="isSubmitting">
          Book Appointment
        </Button>
      </div>
    </form>
  </div>
</template>
