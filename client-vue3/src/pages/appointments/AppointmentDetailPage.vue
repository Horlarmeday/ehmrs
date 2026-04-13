<script setup lang="ts">
/**
 * AppointmentDetailPage - Detail pattern for a single appointment
 * Follows: Detail Page Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment.store'
import type { Appointment } from '@/types/appointment'
import dayjs from 'dayjs'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm, Field } from 'vee-validate'
import { toast } from 'vue-sonner'

// Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge.vue'

// Icons
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const appointmentStore = useAppointmentStore()

const appointment = computed(() => appointmentStore.currentAppointment)
const isLoading = computed(() => appointmentStore.isLoading)
const hasError = computed(() => appointmentStore.error !== null)

// Dialog states
const showCancelDialog = ref(false)
const showRescheduleDialog = ref(false)
const showConfirmDialog = ref(false)

// Cancel form with VeeValidate + Zod
const cancelSchema = toTypedSchema(
  z.object({
    cancellation_reason: z.string().min(1, 'Cancellation reason is required'),
  })
)
const cancelForm = useForm({ validationSchema: cancelSchema })

// Reschedule form with VeeValidate + Zod
const rescheduleSchema = toTypedSchema(
  z.object({
    appointment_date: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
      .refine((val) => val >= new Date().toISOString().split('T')[0], 'Date must be today or in the future'),
    appointment_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    rescheduling_reason: z.string().min(1, 'Rescheduling reason is required'),
  })
)
const rescheduleForm = useForm({ validationSchema: rescheduleSchema })

// Methods
async function fetchAppointment() {
  const id = Number(route.params.id)
  if (!id) {
    toast.error('Invalid appointment ID')
    router.push('/appointments/list')
    return
  }
  try {
    await appointmentStore.fetchAppointmentById(id)
  } catch {
    toast.error('Failed to fetch appointment details')
  }
}

async function handleConfirm() {
  const id = Number(route.params.id)
  if (!id) return
  try {
    await appointmentStore.confirmAppointment(id)
    toast.success('Appointment confirmed successfully')
    showConfirmDialog.value = false
    fetchAppointment()
  } catch {
    toast.error('Failed to confirm appointment')
  }
}

async function handleCancel() {
  const id = Number(route.params.id)
  if (!id) return
  await cancelForm.handleSubmit(async (values) => {
    try {
      await appointmentStore.cancelAppointment(id, values.cancellation_reason)
      toast.success('Appointment cancelled successfully')
      showCancelDialog.value = false
      cancelForm.resetForm()
      fetchAppointment()
    } catch {
      toast.error('Failed to cancel appointment')
    }
  })()
}

async function handleReschedule() {
  const id = Number(route.params.id)
  if (!id) return
  await rescheduleForm.handleSubmit(async (values) => {
    try {
      await appointmentStore.rescheduleAppointment(
        id,
        values.appointment_date,
        values.appointment_time,
        values.rescheduling_reason
      )
      toast.success('Appointment rescheduled successfully')
      showRescheduleDialog.value = false
      rescheduleForm.resetForm()
      fetchAppointment()
    } catch {
      toast.error('Failed to reschedule appointment')
    }
  })()
}

async function handleCheckIn() {
  const id = Number(route.params.id)
  if (!id) return
  try {
    const result = await appointmentStore.checkInAppointment(id)
    toast.success(`Checked in. Visit created: #${result.visit.id}`)
    fetchAppointment()
    // Optionally redirect to visit page
    // router.push(`/visits/${result.visit.id}`)
  } catch {
    toast.error('Failed to check-in appointment')
  }
}

function formatTime(time: string): string {
  if (!time) return 'N/A'
  return dayjs(`2000-01-01T${time}`).format('hh:mm A')
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).format('MMMM DD, YYYY')
}

function formatDateTime(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM DD, YYYY hh:mm A')
}

function canConfirm(status: string): boolean {
  return status === 'Scheduled'
}

function canReschedule(status: string): boolean {
  return status === 'Scheduled' || status === 'Confirmed'
}

function canCancel(status: string): boolean {
  return status === 'Scheduled' || status === 'Confirmed'
}

function canCheckIn(status: string): boolean {
  return status === 'Scheduled' || status === 'Confirmed'
}

// Lifecycle
onMounted(() => {
  fetchAppointment()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/appointments/list')">
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Appointment Details</h1>
          <p class="text-sm text-gray-500 mt-1">
            <Skeleton v-if="isLoading" class="h-4 w-24" />
            <span v-else>Appointment #{{ appointment?.id }}</span>
          </p>
        </div>
      </div>
      <div v-if="appointment" class="flex gap-2">
        <Button
          v-if="canConfirm(appointment.status)"
          variant="default"
          size="sm"
          @click="showConfirmDialog = true"
        >
          Confirm
        </Button>
        <Button
          v-if="canReschedule(appointment.status)"
          variant="outline"
          size="sm"
          @click="showRescheduleDialog = true"
        >
          Reschedule
        </Button>
        <Button
          v-if="canCancel(appointment.status)"
          variant="destructive"
          size="sm"
          @click="showCancelDialog = true"
        >
          Cancel
        </Button>
        <Button
          v-if="canCheckIn(appointment.status)"
          variant="secondary"
          size="sm"
          @click="handleCheckIn"
        >
          Check In
        </Button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-500 mb-4">Failed to load appointment details</p>
      <Button @click="fetchAppointment">Retry</Button>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton class="h-4 w-32 mb-2" />
          <Skeleton class="h-6 w-48" />
        </CardHeader>
        <CardContent class="space-y-4">
          <Skeleton v-for="i in 4" :key="i" class="h-4 w-full" />
        </CardContent>
      </Card>
    </div>

    <!-- Detail Content -->
    <div v-else-if="appointment" class="space-y-6">
      <!-- Summary Card -->
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
          <CardDescription>Key appointment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Patient</h3>
              <p class="text-base font-medium text-gray-900">
                {{ appointment.patient?.fullname || `Patient #${appointment.patient_id}` }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Doctor</h3>
              <p class="text-base font-medium text-gray-900">
                {{ appointment.doctor?.fullname || `Doctor #${appointment.doctor_id}` }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Date</h3>
              <p class="text-base font-medium text-gray-900">
                {{ formatDate(appointment.appointment_date) }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Time</h3>
              <p class="text-base font-medium text-gray-900">
                {{ formatTime(appointment.appointment_time) }}
              </p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Type</h3>
              <Badge variant="outline">{{ appointment.type }}</Badge>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Status</h3>
              <AppointmentStatusBadge :status="appointment.status" />
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Department</h3>
              <p class="text-base text-gray-900">{{ appointment.department }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Duration</h3>
              <p class="text-base text-gray-900">{{ appointment.duration_minutes }} minutes</p>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Professional</h3>
              <p class="text-base text-gray-900">{{ appointment.professional }}</p>
            </div>
            <div v-if="appointment.priority">
              <h3 class="text-sm font-medium text-gray-500 mb-1">Priority</h3>
              <p class="text-base text-gray-900">{{ appointment.priority }}</p>
            </div>
          </div>

          <div v-if="appointment.reason_for_visit">
            <Separator class="my-4" />
            <h3 class="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h3>
            <p class="text-base text-gray-900">{{ appointment.reason_for_visit }}</p>
          </div>

          <div v-if="appointment.notes">
            <Separator class="my-4" />
            <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p class="text-base text-gray-900 whitespace-pre-wrap">{{ appointment.notes }}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Cancellation Details (if cancelled) -->
      <Card v-if="appointment.status === 'Cancelled'">
        <CardHeader>
          <CardTitle class="text-destructive">Cancellation Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Reason</h3>
            <p class="text-base text-gray-900">{{ appointment.cancellation_reason || 'N/A' }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Cancelled At</h3>
              <p class="text-base text-gray-900">{{ formatDateTime(appointment.cancelled_at) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Cancelled By</h3>
              <p class="text-base text-gray-900">Staff #{{ appointment.cancelled_by || 'N/A' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Rescheduling Details (if rescheduled) -->
      <Card v-if="appointment.status === 'Rescheduled'">
        <CardHeader>
          <CardTitle>Rescheduling Details</CardTitle>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Reason</h3>
            <p class="text-base text-gray-900">{{ appointment.rescheduling_reason || 'N/A' }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Rescheduled At</h3>
              <p class="text-base text-gray-900">{{ formatDateTime(appointment.rescheduled_at) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Rescheduled By</h3>
              <p class="text-base text-gray-900">Staff #{{ appointment.rescheduled_by || 'N/A' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Confirmation Details (if confirmed) -->
      <Card v-if="appointment.status === 'Confirmed'">
        <CardHeader>
          <CardTitle>Confirmation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Confirmed At</h3>
              <p class="text-base text-gray-900">{{ formatDateTime(appointment.confirmed_at) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Confirmed By</h3>
              <p class="text-base text-gray-900">Staff #{{ appointment.confirmed_by || 'N/A' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Audit Information -->
      <Card>
        <CardHeader>
          <CardTitle>Audit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p class="text-base text-gray-900">{{ formatDate(appointment.createdAt) }}</p>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Updated At</h3>
              <p class="text-base text-gray-900">{{ formatDate(appointment.updatedAt) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Confirm Dialog -->
    <Dialog v-model:open="showConfirmDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Appointment</DialogTitle>
          <DialogDescription>
            Are you sure you want to confirm this appointment?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="showConfirmDialog = false">
            Cancel
          </Button>
          <Button @click="handleConfirm">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Cancel Dialog -->
    <Dialog v-model:open="showCancelDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Appointment</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancellation.
          </DialogDescription>
        </DialogHeader>
        <form @submit="handleCancel" class="py-4">
          <Field name="cancellation_reason" v-slot="{ componentField, errors: fieldErrors }">
            <div class="space-y-2">
              <Label for="cancel-reason">Reason <span class="text-destructive">*</span></Label>
              <Textarea
                id="cancel-reason"
                v-bind="componentField"
                placeholder="Enter cancellation reason..."
                :aria-invalid="!!fieldErrors?.length"
                aria-describedby="cancel-reason-error"
              />
              <p v-if="fieldErrors?.[0]" id="cancel-reason-error" class="text-sm text-destructive" role="alert">
                {{ fieldErrors[0] }}
              </p>
            </div>
          </Field>
          <DialogFooter class="mt-4">
            <Button type="button" variant="outline" @click="showCancelDialog = false">
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Cancel Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Reschedule Dialog -->
    <Dialog v-model:open="showRescheduleDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for this appointment.
          </DialogDescription>
        </DialogHeader>
        <form @submit="handleReschedule" class="py-4 space-y-4">
          <Field name="appointment_date" v-slot="{ componentField, errors: fieldErrors }">
            <div class="space-y-2">
              <Label for="reschedule-date">New Date <span class="text-destructive">*</span></Label>
              <Input
                id="reschedule-date"
                type="date"
                v-bind="componentField"
                :aria-invalid="!!fieldErrors?.length"
                aria-describedby="reschedule-date-error"
              />
              <p v-if="fieldErrors?.[0]" id="reschedule-date-error" class="text-sm text-destructive" role="alert">
                {{ fieldErrors[0] }}
              </p>
            </div>
          </Field>
          <Field name="appointment_time" v-slot="{ componentField, errors: fieldErrors }">
            <div class="space-y-2">
              <Label for="reschedule-time">New Time <span class="text-destructive">*</span></Label>
              <Input
                id="reschedule-time"
                type="time"
                v-bind="componentField"
                :aria-invalid="!!fieldErrors?.length"
                aria-describedby="reschedule-time-error"
              />
              <p v-if="fieldErrors?.[0]" id="reschedule-time-error" class="text-sm text-destructive" role="alert">
                {{ fieldErrors[0] }}
              </p>
            </div>
          </Field>
          <Field name="rescheduling_reason" v-slot="{ componentField, errors: fieldErrors }">
            <div class="space-y-2">
              <Label for="reschedule-reason">Reason <span class="text-destructive">*</span></Label>
              <Textarea
                id="reschedule-reason"
                v-bind="componentField"
                placeholder="Enter rescheduling reason..."
                :aria-invalid="!!fieldErrors?.length"
                aria-describedby="reschedule-reason-error"
              />
              <p v-if="fieldErrors?.[0]" id="reschedule-reason-error" class="text-sm text-destructive" role="alert">
                {{ fieldErrors[0] }}
              </p>
            </div>
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showRescheduleDialog = false">
              Cancel
            </Button>
            <Button type="submit">
              Reschedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
