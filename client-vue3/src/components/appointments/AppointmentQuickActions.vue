<script setup lang="ts">
/**
 * AppointmentQuickActions.vue
 * DropdownMenu with View, Confirm, Reschedule, Cancel, Check-in actions.
 */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { AppointmentStatus } from '@/types/appointment'

// Icons
import {
  Eye,
  CheckCircle,
  CalendarClock,
  XCircle,
  UserPlus,
  MoreVertical,
} from 'lucide-vue-next'

interface Props {
  appointmentId: number
  status: AppointmentStatus | string
}

interface Emits {
  (e: 'view', id: number): void
  (e: 'confirm', id: number): void
  (e: 'reschedule', id: number): void
  (e: 'cancel', id: number): void
  (e: 'checkIn', id: number): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleAction(action: string, id: number) {
  switch (action) {
    case 'view':
      emit('view', id)
      break
    case 'confirm':
      emit('confirm', id)
      break
    case 'reschedule':
      emit('reschedule', id)
      break
    case 'cancel':
      emit('cancel', id)
      break
    case 'checkIn':
      emit('checkIn', id)
      break
  }
}

// Determine which actions are available based on status
function canConfirm(status: string): boolean {
  return status === AppointmentStatus.SCHEDULED
}

function canReschedule(status: string): boolean {
  return (
    status === AppointmentStatus.SCHEDULED ||
    status === AppointmentStatus.CONFIRMED
  )
}

function canCancel(status: string): boolean {
  return (
    status === AppointmentStatus.SCHEDULED ||
    status === AppointmentStatus.CONFIRMED
  )
}

function canCheckIn(status: string): boolean {
  return status === AppointmentStatus.SCHEDULED || status === AppointmentStatus.CONFIRMED
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" @click.stop>
        <MoreVertical class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="handleAction('view', appointmentId)">
        <Eye class="w-4 h-4 mr-2" />
        View
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="canConfirm(status)"
        @click="handleAction('confirm', appointmentId)"
      >
        <CheckCircle class="w-4 h-4 mr-2" />
        Confirm
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="canReschedule(status)"
        @click="handleAction('reschedule', appointmentId)"
      >
        <CalendarClock class="w-4 h-4 mr-2" />
        Reschedule
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="canCancel(status) || canCheckIn(status)" />
      <DropdownMenuItem
        v-if="canCancel(status)"
        class="text-destructive"
        @click="handleAction('cancel', appointmentId)"
      >
        <XCircle class="w-4 h-4 mr-2" />
        Cancel
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="canCheckIn(status)"
        @click="handleAction('checkIn', appointmentId)"
      >
        <UserPlus class="w-4 h-4 mr-2" />
        Check In
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
