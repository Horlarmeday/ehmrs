<script setup lang="ts">
/**
 * PatientStatusBadge - Maps PatientStatus enum to Badge variants
 * Wraps shadcn Badge component with patient-specific styling
 */
import { computed } from 'vue'
import { Badge } from '@/components/ui/badge'
import { PatientStatus } from '@/types/patient'

interface Props {
  status: PatientStatus
  size?: 'sm' | 'md'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
})

const variant = computed(() => {
  switch (props.status) {
    case PatientStatus.INPATIENT:
      return 'outline' as const
    case PatientStatus.OUTPATIENT:
      return 'secondary' as const
    case PatientStatus.DECEASED:
      return 'destructive' as const
    default:
      return 'outline' as const
  }
})

const labelMap: Record<PatientStatus, string> = {
  [PatientStatus.INPATIENT]: 'Inpatient',
  [PatientStatus.OUTPATIENT]: 'Outpatient',
  [PatientStatus.DECEASED]: 'Deceased',
}

const label = computed(() => labelMap[props.status] ?? props.status)
</script>

<template>
  <Badge :variant="variant" :class="[size === 'sm' ? 'text-xs' : 'text-sm']">
    {{ label }}
  </Badge>
</template>
