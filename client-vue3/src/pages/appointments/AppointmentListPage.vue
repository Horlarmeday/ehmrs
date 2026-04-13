<script setup lang="ts">
/**
 * AppointmentListPage - List pattern for appointments
 * Follows: List Page Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment.store'
import type { Appointment, AppointmentStatus, AppointmentType } from '@/types/appointment'
import type { AppointmentQueryParams } from '@/types/api'
import dayjs from 'dayjs'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm, Field } from 'vee-validate'
import { toast } from 'vue-sonner'

// Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge.vue'
import AppointmentQuickActions from '@/components/appointments/AppointmentQuickActions.vue'

// Icons
import { Plus, Calendar } from 'lucide-vue-next'

const router = useRouter()
const appointmentStore = useAppointmentStore()

// Filter controls (local state — these are user inputs, not store state)
const selectedStatus = ref('')
const selectedType = ref('')
const selectedDoctorId = ref('')
const startDate = ref('')
const endDate = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Dialog states
const showCancelDialog = ref(false)
const showRescheduleDialog = ref(false)
const showConfirmDialog = ref(false)
const selectedAppointmentId = ref<number | null>(null)

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

// Use store computed values
const appointments = computed(() => appointmentStore.appointments)
const isLoading = computed(() => appointmentStore.isLoading)
const hasError = computed(() => appointmentStore.error !== null)
const totalAppointments = computed(() => appointmentStore.totalAppointments)
const totalPages = computed(() => appointmentStore.totalPages)

// Methods
async function fetchAppointments(params?: AppointmentQueryParams) {
  try {
    const queryParams: AppointmentQueryParams = {
      currentPage: currentPage.value,
      pageLimit: itemsPerPage.value,
    }

    if (selectedStatus.value) {
      queryParams.status = selectedStatus.value as AppointmentStatus
    }
    if (selectedType.value) {
      queryParams.type = selectedType.value as AppointmentType
    }
    if (selectedDoctorId.value) {
      queryParams.doctor_id = Number(selectedDoctorId.value)
    }
    if (startDate.value) {
      queryParams.start = startDate.value
    }
    if (endDate.value) {
      queryParams.end = endDate.value
    }

    await appointmentStore.fetchAppointments({ ...queryParams, ...params })
  } catch {
    // Error is already handled by the store
  }
}

function handleStatusChange(value: string) {
  selectedStatus.value = value
  currentPage.value = 1
  fetchAppointments({ currentPage: 1 })
}

function handleTypeChange(value: string) {
  selectedType.value = value
  currentPage.value = 1
  fetchAppointments({ currentPage: 1 })
}

function handleDoctorChange(value: string) {
  selectedDoctorId.value = value
  currentPage.value = 1
  fetchAppointments({ currentPage: 1 })
}

function handleDateChange() {
  currentPage.value = 1
  fetchAppointments({ currentPage: 1 })
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchAppointments({ currentPage: page })
}

function navigateToDetail(appointment: Appointment) {
  router.push(`/appointments/${appointment.id}`)
}

function formatTime(time: string): string {
  if (!time) return 'N/A'
  // Handle "HH:MM:SS" format from server
  return dayjs(`2000-01-01T${time}`).format('hh:mm A')
}

function formatDate(date: string): string {
  if (!date) return 'N/A'
  return dayjs(date).format('MMM DD, YYYY')
}

function getTypeLabel(type: string): string {
  return type
}

// Quick actions handlers
function handleView(id: number) {
  router.push(`/appointments/${id}`)
}

function handleConfirm(id: number) {
  selectedAppointmentId.value = id
  showConfirmDialog.value = true
}

async function confirmAction() {
  if (selectedAppointmentId.value === null) return
  try {
    await appointmentStore.confirmAppointment(selectedAppointmentId.value)
    toast.success('Appointment confirmed successfully')
    showConfirmDialog.value = false
    fetchAppointments()
  } catch {
    toast.error('Failed to confirm appointment')
  }
}

function handleReschedule(id: number) {
  selectedAppointmentId.value = id
  rescheduleForm.resetForm()
  showRescheduleDialog.value = true
}

async function rescheduleAction() {
  if (selectedAppointmentId.value === null) return
  await rescheduleForm.handleSubmit(async (values) => {
    try {
      await appointmentStore.rescheduleAppointment(
        selectedAppointmentId.value!,
        values.appointment_date,
        values.appointment_time,
        values.rescheduling_reason
      )
      toast.success('Appointment rescheduled successfully')
      showRescheduleDialog.value = false
      rescheduleForm.resetForm()
      fetchAppointments()
    } catch {
      toast.error('Failed to reschedule appointment')
    }
  })()
}

function handleCancel(id: number) {
  selectedAppointmentId.value = id
  cancelForm.resetForm()
  showCancelDialog.value = true
}

async function cancelAction() {
  if (selectedAppointmentId.value === null) return
  await cancelForm.handleSubmit(async (values) => {
    try {
      await appointmentStore.cancelAppointment(
        selectedAppointmentId.value!,
        values.cancellation_reason
      )
      toast.success('Appointment cancelled successfully')
      showCancelDialog.value = false
      cancelForm.resetForm()
      fetchAppointments()
    } catch {
      toast.error('Failed to cancel appointment')
    }
  })()
}

function handleCheckIn(id: number) {
  selectedAppointmentId.value = id
  checkInAction()
}

async function checkInAction() {
  if (selectedAppointmentId.value === null) return
  try {
    const result = await appointmentStore.checkInAppointment(
      selectedAppointmentId.value
    )
    toast.success(`Checked in. Visit created: #${result.visit.id}`)
    fetchAppointments()
    // Optionally redirect to visit page
    // router.push(`/visits/${result.visit.id}`)
  } catch {
    toast.error('Failed to check-in appointment')
  }
}

// Lifecycle
onMounted(() => {
  fetchAppointments()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Appointments</h1>
        <p class="text-sm text-gray-500 mt-1">Manage patient appointments</p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="router.push('/appointments/check-in-queue')">
          <Calendar class="w-4 h-4 mr-2" />
          Check-In Queue
        </Button>
        <Button @click="router.push('/appointments/book')">
          <Plus class="w-4 h-4 mr-2" />
          Book Appointment
        </Button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Status Filter -->
        <Select :model-value="selectedStatus" @update:model-value="(v) => handleStatusChange(String(v ?? ''))">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="No Show">No Show</SelectItem>
              <SelectItem value="Rescheduled">Rescheduled</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <!-- Type Filter -->
        <Select :model-value="selectedType" @update:model-value="(v) => handleTypeChange(String(v ?? ''))">
          <SelectTrigger class="w-full sm:w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="Consultation">Consultation</SelectItem>
              <SelectItem value="Follow Up">Follow Up</SelectItem>
              <SelectItem value="Procedure">Procedure</SelectItem>
              <SelectItem value="Vaccination">Vaccination</SelectItem>
              <SelectItem value="Dialysis">Dialysis</SelectItem>
              <SelectItem value="Antenatal">Antenatal</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <!-- Date Range -->
        <Input
          v-model="startDate"
          type="date"
          class="w-full sm:w-[180px]"
          placeholder="Start date"
          @change="handleDateChange"
        />
        <Input
          v-model="endDate"
          type="date"
          class="w-full sm:w-[180px]"
          placeholder="End date"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-500 mb-4">Failed to load appointments</p>
      <Button @click="fetchAppointments">Retry</Button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Doctor</TableHead>
            <TableHead>Department</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading State -->
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
            </TableRow>
          </template>

          <!-- Empty State -->
          <template v-else-if="appointments.length === 0">
            <TableRow>
              <TableCell :colspan="8" class="text-center py-8">
                <p class="text-gray-500 mb-4">No appointments found</p>
                <Button @click="router.push('/appointments/book')">
                  <Plus class="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </TableCell>
            </TableRow>
          </template>

          <!-- Data Rows -->
          <template v-else>
            <TableRow
              v-for="appointment in appointments"
              :key="appointment.id"
              class="cursor-pointer hover:bg-gray-50"
              tabindex="0"
              @click="navigateToDetail(appointment)"
              @keyup.enter="navigateToDetail(appointment)"
            >
              <TableCell>
                <span class="text-sm font-medium text-gray-900">
                  {{ appointment.patient?.fullname || `Patient #${appointment.patient_id}` }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ formatDate(appointment.appointment_date) }}</span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ formatTime(appointment.appointment_time) }}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {{ getTypeLabel(appointment.type) }}
                </Badge>
              </TableCell>
              <TableCell>
                <AppointmentStatusBadge :status="appointment.status" />
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">
                  {{ appointment.doctor?.fullname || `Doctor #${appointment.doctor_id}` }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ appointment.department }}</span>
              </TableCell>
              <TableCell class="text-right" @click.stop>
                <AppointmentQuickActions
                  :appointment-id="appointment.id"
                  :status="appointment.status"
                  @view="handleView"
                  @confirm="handleConfirm"
                  @reschedule="handleReschedule"
                  @cancel="handleCancel"
                  @check-in="handleCheckIn"
                />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalAppointments) }} of {{ totalAppointments }}
        </p>
        <Pagination v-slot="{ page }" :total="totalPages" :sibling-count="1" :page="currentPage" :items-per-page="itemsPerPage" @update:page="handlePageChange">
          <PaginationContent>
            <PaginationPrevious @click="handlePageChange(Math.max(1, currentPage - 1))" />
            <PaginationItem v-for="p in totalPages" :key="p" :value="p" :is-active="p === page">
              <Button class="w-9 h-9 p-0" :variant="p === page ? 'default' : 'outline'" @click="handlePageChange(p)">
                {{ p }}
              </Button>
            </PaginationItem>
            <PaginationNext @click="handlePageChange(Math.min(totalPages, currentPage + 1))" />
          </PaginationContent>
        </Pagination>
      </div>
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
          <Button @click="confirmAction">
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
        <form @submit="cancelAction" class="py-4">
          <Field name="cancellation_reason" v-slot="{ componentField, errors: fieldErrors }">
            <div class="space-y-2">
              <Label for="cancel-reason">Reason <span class="text-destructive">*</span></Label>
              <Input
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
        <form @submit="rescheduleAction" class="py-4 space-y-4">
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
              <Input
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
