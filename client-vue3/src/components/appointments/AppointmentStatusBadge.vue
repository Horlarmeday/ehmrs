<script setup lang="ts">
/**
 * AppointmentStatusBadge.vue
 * Maps AppointmentStatus to Badge variants.
 *
 * Status → Variant mapping:
 * - Scheduled → outline
 * - Confirmed → default
 * - Cancelled → destructive
 * - Completed → secondary
 * - No Show → destructive
 * - Rescheduled → outline
 */
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { AppointmentStatus } from '@/types/appointment'

interface Props {
  status: AppointmentStatus | string
}

const props = defineProps<Props>()

const variant = computed<
  'default' | 'secondary' | 'destructive' | 'outline'
>(() => {
  switch (props.status) {
    case AppointmentStatus.SCHEDULED:
      return 'outline'
    case AppointmentStatus.CONFIRMED:
      return 'default'
    case AppointmentStatus.CANCELLED:
      return 'destructive'
    case AppointmentStatus.COMPLETED:
      return 'secondary'
    case AppointmentStatus.NO_SHOW:
      return 'destructive'
    case AppointmentStatus.RESCHEDULED:
      return 'outline'
    default:
      return 'outline'
  }
})

const label = computed(() => {
  return props.status
})
</script>

<template>
  <Badge :variant="variant">
    {{ label }}
  </Badge>
</template>
