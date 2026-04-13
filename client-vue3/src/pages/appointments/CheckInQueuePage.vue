<script setup lang="ts">
/**
 * CheckInQueuePage - List pattern for today's scheduled appointments
 * Follows: List Page Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '@/stores/appointment.store'
import type { Appointment } from '@/types/appointment'
import type { AppointmentQueryParams } from '@/types/api'
import dayjs from 'dayjs'

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
import AppointmentStatusBadge from '@/components/appointments/AppointmentStatusBadge.vue'

// Icons
import { ArrowLeft, UserPlus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const appointmentStore = useAppointmentStore()

// Use store computed values
const appointments = computed(() => appointmentStore.appointments)
const isLoading = computed(() => appointmentStore.isLoading)
const hasError = computed(() => appointmentStore.error !== null)

// Methods
function navigateToDetail(id: number) {
  router.push(`/appointments/${id}`)
}

async function fetchTodayAppointments() {
  const today = dayjs().format('YYYY-MM-DD')
  try {
    const params: AppointmentQueryParams = {
      start: today,
      end: today,
      pageLimit: 100,
    }
    await appointmentStore.fetchAppointments(params)
  } catch {
    // Error is already handled by the store
  }
}

async function handleCheckIn(appointmentId: number) {
  try {
    const result = await appointmentStore.checkInAppointment(appointmentId)
    toast.success(`Checked in. Visit created: #${result.visit.id}`)
    // Refetch to update the list
    fetchTodayAppointments()
  } catch {
    toast.error('Failed to check-in appointment')
  }
}

function formatTime(time: string): string {
  if (!time) return 'N/A'
  return dayjs(`2000-01-01T${time}`).format('hh:mm A')
}

function canCheckIn(status: string): boolean {
  return status === 'Scheduled' || status === 'Confirmed'
}

// Lifecycle
onMounted(() => {
  fetchTodayAppointments()
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
        <h1 class="text-2xl font-bold text-gray-900">Check-In Queue</h1>
        <p class="text-sm text-gray-500 mt-1">
          Scheduled appointments for {{ dayjs().format('MMMM DD, YYYY') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-500 mb-4">Failed to load appointments</p>
      <Button @click="fetchTodayAppointments">Retry</Button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
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
              <TableCell :colspan="7" class="text-center py-8">
                <p class="text-gray-500">No scheduled appointments for today</p>
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
              @click="navigateToDetail(appointment.id)"
              @keyup.enter="navigateToDetail(appointment.id)"
            >
              <TableCell>
                <span class="text-sm font-medium text-gray-900">
                  {{ appointment.patient?.fullname || `Patient #${appointment.patient_id}` }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ formatTime(appointment.appointment_time) }}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {{ appointment.type }}
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
              <TableCell class="text-right">
                <Button
                  v-if="canCheckIn(appointment.status)"
                  size="sm"
                  @click.stop="handleCheckIn(appointment.id)"
                >
                  <UserPlus class="w-4 h-4 mr-1" />
                  Check In
                </Button>
                <span v-else class="text-sm text-gray-400">
                  {{ appointment.status === 'Completed' ? 'Already Checked In' : 'Not Available' }}
                </span>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
