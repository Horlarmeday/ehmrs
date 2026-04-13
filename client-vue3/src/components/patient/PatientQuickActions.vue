<script setup lang="ts">
/**
 * PatientQuickActions - Dropdown menu with common patient actions
 * Provides Edit, View, Create Visit, Create Appointment actions
 */
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Edit, Eye, FilePlus, CalendarPlus } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  patientId: number
}

const props = defineProps<Props>()
const router = useRouter()

function safeNavigate(path: string) {
  try {
    router.push(path)
  } catch {
    toast.error('This feature is not yet available')
  }
}

function viewPatient() {
  safeNavigate(`/patient/profile/${props.patientId}`)
}

function editPatient() {
  safeNavigate(`/patient/edit/${props.patientId}`)
}

function createVisit() {
  safeNavigate(`/visit/new/${props.patientId}`)
}

function createAppointment() {
  safeNavigate(`/appointments/book?patient=${props.patientId}`)
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop>
        <MoreVertical class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem @click="viewPatient">
        <Eye class="w-4 h-4 mr-2" />
        View Patient
      </DropdownMenuItem>
      <DropdownMenuItem @click="editPatient">
        <Edit class="w-4 h-4 mr-2" />
        Edit Patient
      </DropdownMenuItem>
      <DropdownMenuItem @click="createVisit">
        <FilePlus class="w-4 h-4 mr-2" />
        Create Visit
      </DropdownMenuItem>
      <DropdownMenuItem @click="createAppointment">
        <CalendarPlus class="w-4 h-4 mr-2" />
        Create Appointment
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
