<script setup lang="ts">
/**
 * ChoosePatientTypePage - Wizard pattern for selecting patient type
 * Follows: Wizard Pattern from CLIENT_DESIGN_SYSTEM.md
 */
import { useRouter } from 'vue-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserPlus, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const accountTypes = [
  {
    name: 'Normal Account',
    description: 'Register a new patient with full demographic information',
    icon: Users,
    link: '/patient/create-account',
    variant: 'default' as const,
  },
  {
    name: 'Emergency Patient Account',
    description: 'Quick registration for emergency situations with minimal information',
    icon: UserPlus,
    link: '/patient/create-emergency-account',
    variant: 'destructive' as const,
  },
]

function navigateTo(link: string) {
  router.push(link)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="router.push('/patient/find-patient')">
        <ArrowLeft class="w-4 h-4" />
      </Button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Choose Patient Type</h1>
        <p class="text-sm text-gray-500 mt-1">Select the type of account to create</p>
      </div>
    </div>

    <!-- Account Type Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card
        v-for="(account, i) in accountTypes"
        :key="i"
        class="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
        @click="navigateTo(account.link)"
      >
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-blue-100">
                <component :is="account.icon" class="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>{{ account.name }}</CardTitle>
            </div>
          </div>
          <CardDescription class="mt-2">{{ account.description }}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button :variant="account.variant" class="w-full">
            Create {{ account.name }}
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
