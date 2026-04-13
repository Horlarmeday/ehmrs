<script setup lang="ts">
/**
 * FindPatientPage - List pattern for searching and filtering patients
 * Follows: List Page Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '@/stores/patient.store'
import type { Patient, PatientStatus } from '@/types/patient'
import type { PatientQueryParams } from '@/types/api'
import { PatientAccountStatus, PatientType } from '@/types/patient'
import { Gender } from '@/types/common'

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
import PatientStatusBadge from '@/components/patient/PatientStatusBadge.vue'
import PatientQuickActions from '@/components/patient/PatientQuickActions.vue'
import PatientSearchBar from '@/components/patient/PatientSearchBar.vue'

// Icons
import { Plus } from 'lucide-vue-next'

const router = useRouter()
const patientStore = usePatientStore()

// Filter controls (local state — these are user inputs, not store state)
const searchQuery = ref('')
const selectedMedicalStatus = ref('')
const selectedSortOption = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(10)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// Use store computed values instead of duplicate local state
const patients = computed(() => patientStore.patients)
const isLoading = computed(() => patientStore.isLoading)
const hasError = computed(() => patientStore.error !== null)
const totalPatients = computed(() => patientStore.totalPatients)
const totalPages = computed(() => patientStore.totalPages)

// Methods
async function fetchPatients(params?: PatientQueryParams) {
  try {
    await patientStore.fetchPatients({
      currentPage: currentPage.value,
      pageLimit: itemsPerPage.value,
      search: searchQuery.value || undefined,
      patient_status: (selectedMedicalStatus.value as PatientStatus) || undefined,
      sortBy: selectedSortOption.value,
      ...params,
    })
  } catch {
    // Error is already handled by the store
  }
}

function handleSearch(value: string) {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchPatients({ currentPage: 1 })
  }, 500)
}

function handleSearchSubmit(value: string) {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchQuery.value = value
  currentPage.value = 1
  fetchPatients({ currentPage: 1 })
}

function handleMedicalStatusChange(value: string) {
  selectedMedicalStatus.value = value
  currentPage.value = 1
  fetchPatients({ currentPage: 1 })
}

function handleSortChange(value: string) {
  selectedSortOption.value = value
  currentPage.value = 1
  fetchPatients({ currentPage: 1 })
}

function handlePageChange(page: number) {
  currentPage.value = page
  fetchPatients({ currentPage: page })
}

function navigateToProfile(patient: Patient) {
  router.push(`/patient/profile/${patient.id}`)
}

function getStatusBadgeVariant(status: PatientAccountStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case PatientAccountStatus.ACTIVE:
      return 'default'
    case PatientAccountStatus.INACTIVE:
      return 'secondary'
    case PatientAccountStatus.BANNED:
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: PatientAccountStatus): string {
  switch (status) {
    case PatientAccountStatus.ACTIVE:
      return 'Active'
    case PatientAccountStatus.INACTIVE:
      return 'Inactive'
    case PatientAccountStatus.BANNED:
      return 'Banned'
    default:
      return status
  }
}

function getPatientTypeLabel(type: PatientType): string {
  return type === PatientType.DEPENDANT ? 'Dependant' : 'Patient'
}

function getPatientTypeVariant(type: PatientType): 'default' | 'secondary' | 'outline' | 'destructive' {
  return type === PatientType.DEPENDANT ? 'secondary' : 'default'
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Cleanup timeout on unmount
onUnmounted(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
    searchTimeout = null
  }
})

// Lifecycle
onMounted(() => {
  fetchPatients()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Find Patients</h1>
        <p class="text-sm text-gray-500 mt-1">Search and manage patient records</p>
      </div>
      <Button @click="router.push('/patient/choose-patient-type')">
        <Plus class="w-4 h-4 mr-2" />
        Create Patient
      </Button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 space-y-4">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- PatientSearchBar Component -->
        <label for="patient-search" class="sr-only">Search patients</label>
        <PatientSearchBar
          id="patient-search"
          v-model="searchQuery"
          placeholder="Search by name, hospital ID, or phone..."
          @search="handleSearchSubmit"
          @clear="handleSearchSubmit('')"
        />
        <Button variant="outline" @click="handleSearchSubmit(searchQuery)">
          Search
        </Button>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Medical Status Filter -->
        <Select :model-value="selectedMedicalStatus" @update:model-value="(v) => handleMedicalStatusChange(String(v ?? ''))">
          <SelectTrigger class="w-full sm:w-[200px]">
            <SelectValue placeholder="Medical Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">All Patients</SelectItem>
              <SelectItem value="Inpatient">Inpatient</SelectItem>
              <SelectItem value="Outpatient">Outpatient</SelectItem>
              <SelectItem value="Deceased">Deceased</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <!-- Sort Options -->
        <Select :model-value="selectedSortOption" @update:model-value="(v) => handleSortChange(String(v ?? 'createdAt'))">
          <SelectTrigger class="w-full sm:w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="createdAt">Registration Date</SelectItem>
              <SelectItem value="fullname">Name</SelectItem>
              <SelectItem value="patient_status">Medical Status</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="hasError" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-500 mb-4">Failed to load patients</p>
      <Button @click="fetchPatients">Retry</Button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white rounded-lg shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hospital Number</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Registration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Medical Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <!-- Loading State -->
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-32" /></TableCell>
              <TableCell><Skeleton class="h-4 w-12" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
              <TableCell><Skeleton class="h-4 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-16" /></TableCell>
            </TableRow>
          </template>

          <!-- Empty State -->
          <template v-else-if="patients.length === 0">
            <TableRow>
              <TableCell :colspan="9" class="text-center py-8">
                <p class="text-gray-500 mb-4">No patients found</p>
                <Button @click="router.push('/patient/choose-patient-type')">
                  <Plus class="w-4 h-4 mr-2" />
                  Create Patient
                </Button>
              </TableCell>
            </TableRow>
          </template>

          <!-- Data Rows -->
          <template v-else>
            <TableRow
              v-for="patient in patients"
              :key="patient.id"
              :class="{ 'bg-red-50': patient.patient_status === 'Deceased' }"
              class="cursor-pointer hover:bg-gray-50"
              tabindex="0"
              @click="navigateToProfile(patient)"
              @keyup.enter="navigateToProfile(patient)"
            >
              <TableCell>
                <span class="text-sm font-medium text-gray-900">
                  {{ patient.hospital_id || 'No Hospital Number' }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm font-medium text-gray-900 hover:text-blue-600">
                  {{ patient.fullname || `${patient.firstname} ${patient.lastname}` }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ patient.gender }}</span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ formatDate(patient.date_of_birth) }}</span>
              </TableCell>
              <TableCell>
                <Badge :variant="getPatientTypeVariant(patient.patient_type)">
                  {{ getPatientTypeLabel(patient.patient_type) }}
                </Badge>
              </TableCell>
              <TableCell>
                <span class="text-sm text-gray-600">{{ formatDate(patient.createdAt) }}</span>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusBadgeVariant(patient.status)">
                  {{ getStatusLabel(patient.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <PatientStatusBadge :status="patient.patient_status" />
              </TableCell>
              <TableCell class="text-right" @click.stop>
                <PatientQuickActions :patient-id="patient.id" />
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <div v-if="!isLoading && totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
        <p class="text-sm text-gray-500">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalPatients) }} of {{ totalPatients }}
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
  </div>
</template>
