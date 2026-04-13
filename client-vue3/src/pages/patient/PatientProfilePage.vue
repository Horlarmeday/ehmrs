<script setup lang="ts">
/**
 * PatientProfilePage - Detail pattern for patient information
 * Follows: Detail Page Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePatientStore } from '@/stores/patient.store'
import type { Patient } from '@/types/patient'
import { PatientStatus, PatientType, PatientAccountStatus } from '@/types/patient'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import PatientStatusBadge from '@/components/patient/PatientStatusBadge.vue'
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const patientStore = usePatientStore()

const patient = computed<Patient | null>(() => patientStore.currentPatientProfile)
const isLoading = computed(() => patientStore.isLoading)
const hasError = computed(() => patientStore.error !== null)

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

function calculateAge(dateOfBirth: Date | string | undefined): number | null {
  if (!dateOfBirth) return null
  const birth = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    toast.error('Invalid patient ID')
    router.push('/patient/find-patient')
    return
  }
  await patientStore.fetchPatientProfile(id)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Deceased Patient Banner -->
    <Alert v-if="patient?.patient_status === PatientStatus.DECEASED" variant="destructive">
      <AlertTriangle class="h-4 w-4" />
      <AlertDescription>
        <strong>PATIENT DECEASED</strong> - This patient has been marked as deceased
        <span v-if="patient?.date_of_death">on {{ formatDate(patient.date_of_death) }}</span>
        <span v-if="patient?.cause_of_death"> due to {{ patient.cause_of_death }}</span>
      </AlertDescription>
    </Alert>

    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/patient/find-patient')">
          <ArrowLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Patient Profile</h1>
          <p class="text-sm text-gray-500 mt-1">
            Hospital ID: {{ patient?.hospital_id || 'N/A' }}
          </p>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="router.push(`/patient/edit/${patient?.id}`)" :disabled="!patient">
          <Edit class="w-4 h-4 mr-2" />
          Edit Patient
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <template v-if="isLoading">
      <Card>
        <CardHeader>
          <Skeleton class="h-6 w-48" />
          <Skeleton class="h-4 w-64" />
        </CardHeader>
        <CardContent class="space-y-4">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
        </CardContent>
      </Card>
    </template>

    <!-- Error State -->
    <div v-else-if="hasError" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <p class="text-gray-500 mb-4">Failed to load patient profile</p>
      <Button @click="patientStore.fetchPatientProfile(Number(route.params.id))">Retry</Button>
    </div>

    <!-- Patient Profile -->
    <template v-else-if="patient">
      <!-- Patient Summary Card -->
      <Card>
        <CardContent class="pt-6">
          <div class="flex flex-col md:flex-row md:items-center gap-4">
            <div class="flex-shrink-0">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 flex-wrap">
                <h2 class="text-xl font-bold text-gray-900">
                  {{ patient.fullname || `${patient.firstname} ${patient.lastname}` }}
                </h2>
                <Badge :variant="getStatusBadgeVariant(patient.status)">
                  {{ getStatusLabel(patient.status) }}
                </Badge>
                <PatientStatusBadge :status="patient.patient_status" />
              </div>
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span class="flex items-center gap-1">
                  <User class="w-4 h-4" />
                  {{ patient.gender }}
                  <template v-if="calculateAge(patient.date_of_birth)">
                    , {{ calculateAge(patient.date_of_birth) }} years
                  </template>
                </span>
                <span class="flex items-center gap-1">
                  <Phone class="w-4 h-4" />
                  {{ patient.phone }}
                </span>
                <span v-if="patient.email" class="flex items-center gap-1">
                  <Mail class="w-4 h-4" />
                  {{ patient.email }}
                </span>
                <span v-if="patient.address" class="flex items-center gap-1">
                  <MapPin class="w-4 h-4" />
                  {{ patient.address }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs default-value="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insurance">Insurance</TabsTrigger>
          <TabsTrigger value="dependants">Dependants</TabsTrigger>
        </TabsList>

        <!-- Overview Tab -->
        <TabsContent value="overview" class="space-y-4 mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Demographics -->
            <Card>
              <CardHeader>
                <CardTitle>Demographics</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">First Name</p>
                    <p class="font-medium">{{ patient.firstname }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Last Name</p>
                    <p class="font-medium">{{ patient.lastname }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Middle Name</p>
                    <p class="font-medium">{{ patient.middlename || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Gender</p>
                    <p class="font-medium">{{ patient.gender }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Date of Birth</p>
                    <p class="font-medium">{{ formatDate(patient.date_of_birth) }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Patient Type</p>
                    <p class="font-medium">
                      {{ patient.patient_type === PatientType.DEPENDANT ? 'Dependant' : 'Patient' }}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Contact Information -->
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="font-medium">{{ patient.phone }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Alt Phone</p>
                    <p class="font-medium">{{ patient.alt_phone || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Email</p>
                    <p class="font-medium">{{ patient.email || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Address</p>
                    <p class="font-medium">{{ patient.address || 'N/A' }}</p>
                  </div>
                  <div v-if="patient.state">
                    <p class="text-sm text-gray-500">State</p>
                    <p class="font-medium">{{ patient.state }}</p>
                  </div>
                  <div v-if="patient.lga">
                    <p class="text-sm text-gray-500">LGA</p>
                    <p class="font-medium">{{ patient.lga }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Next of Kin -->
            <Card>
              <CardHeader>
                <CardTitle>Next of Kin</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Name</p>
                    <p class="font-medium">{{ patient.next_of_kin_name || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Phone</p>
                    <p class="font-medium">{{ patient.next_of_kin_phone || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Relationship</p>
                    <p class="font-medium">{{ patient.next_of_kin_relationship || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Address</p>
                    <p class="font-medium">{{ patient.next_of_kin_address || 'N/A' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Additional Information -->
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Occupation</p>
                    <p class="font-medium">{{ patient.occupation || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Marital Status</p>
                    <p class="font-medium">{{ patient.marital_status || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Religion</p>
                    <p class="font-medium">{{ patient.religion || 'N/A' }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Has Insurance</p>
                    <p class="font-medium">{{ patient.has_insurance ? 'Yes' : 'No' }}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Quick Actions -->
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex flex-wrap gap-3">
                <Button variant="outline" @click="router.push(`/patient/edit/${patient.id}`)">
                  <Edit class="w-4 h-4 mr-2" />
                  Edit Patient
                </Button>
                <Button variant="outline" @click="router.push(`/visit/new/${patient.id}`)">
                  Start Visit
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Insurance Tab -->
        <TabsContent value="insurance" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Patient insurance details</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="patient.has_insurance" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Insurance Status</p>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <Separator />
                <p class="text-sm text-gray-500">Insurance policy details will be displayed here</p>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500 mb-4">No insurance information available</p>
                <Button variant="outline" @click="router.push(`/patient/health-insurance/${patient.id}`)">
                  Add Insurance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Dependants Tab -->
        <TabsContent value="dependants" class="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Dependants</CardTitle>
              <CardDescription>Patient dependants list</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="patient.dependants && patient.dependants.length > 0" class="space-y-4">
                <div v-for="dependant in patient.dependants" :key="dependant.id" class="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p class="font-medium">{{ dependant.fullname || `${dependant.firstname} ${dependant.lastname}` }}</p>
                    <p class="text-sm text-gray-500">{{ dependant.phone }}</p>
                  </div>
                  <Button variant="ghost" size="sm" @click="router.push(`/patient/profile/${dependant.id}`)">
                    View
                  </Button>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <p class="text-gray-500">No dependants found</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>
