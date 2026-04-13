import type { RouteRecordRaw } from 'vue-router'

/**
 * Application Routes
 * 
 * Organized by module:
 * - Auth: Login, register, password reset
 * - Dashboard: Role-based dashboard (65+ variants)
 * - Patient: Patient management (Phase 2)
 * - Appointments: Appointment scheduling (Phase 3)
 * - Visits: Visit management (Phase 4)
 * - etc.
 */
export const routes: RouteRecordRaw[] = [
  // Auth Routes
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { requiresAuth: false },
    children: [
      {
        path: 'login',
        name: 'auth-login',
        component: () => import('@/pages/auth/LoginPage.vue'),
        meta: { 
          requiresAuth: false,
          title: 'Login',
        },
      },
    ],
  },

  // Main Application Routes
  {
    path: '/',
    name: 'main',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Dashboard',
        },
      },
      // Patient routes (Phase 2)
      {
        path: 'patient',
        name: 'patient',
        component: () => import('@/pages/patient/PatientHome.vue'),
        redirect: '/patient/find-patient',
        meta: { requiresAuth: true },
        children: [
          {
            path: 'find-patient',
            name: 'patient-find',
            component: () => import('@/pages/patient/FindPatientPage.vue'),
            meta: { requiresAuth: true, title: 'Find Patients' },
          },
          {
            path: 'create-account',
            name: 'patient-create',
            component: () => import('@/pages/patient/CreatePatientPage.vue'),
            meta: { requiresAuth: true, title: 'Create Patient Account' },
          },
          {
            path: 'create-emergency-account',
            name: 'patient-create-emergency',
            component: () => import('@/pages/patient/CreateEmergencyPage.vue'),
            meta: { requiresAuth: true, title: 'Create Emergency Account' },
          },
          {
            path: 'choose-patient-type',
            name: 'patient-choose-type',
            component: () => import('@/pages/patient/ChoosePatientTypePage.vue'),
            meta: { requiresAuth: true, title: 'Choose Patient Type' },
          },
          {
            path: 'profile/:id',
            name: 'patient-profile',
            component: () => import('@/pages/patient/PatientProfilePage.vue'),
            meta: { requiresAuth: true, title: 'Patient Profile' },
          },
          {
            path: 'edit/:id',
            name: 'patient-edit',
            component: () => import('@/pages/patient/EditPatientPage.vue'),
            meta: { requiresAuth: true, title: 'Edit Patient' },
          },
        ],
      },
      // Appointments routes (Phase 3)
      {
        path: 'appointments',
        name: 'appointments',
        component: () => import('@/pages/appointments/AppointmentHome.vue'),
        redirect: '/appointments/list',
        meta: { requiresAuth: true },
        children: [
          {
            path: 'list',
            name: 'appointments-list',
            component: () => import('@/pages/appointments/AppointmentListPage.vue'),
            meta: { requiresAuth: true, title: 'Appointments' },
          },
          {
            path: 'book',
            name: 'appointments-book',
            component: () => import('@/pages/appointments/BookAppointmentPage.vue'),
            meta: { requiresAuth: true, title: 'Book Appointment' },
          },
          {
            path: 'check-in-queue',
            name: 'appointments-check-in-queue',
            component: () => import('@/pages/appointments/CheckInQueuePage.vue'),
            meta: { requiresAuth: true, title: 'Check-In Queue' },
          },
          {
            path: ':id',
            name: 'appointment-detail',
            component: () => import('@/pages/appointments/AppointmentDetailPage.vue'),
            meta: { requiresAuth: true, title: 'Appointment Details' },
          },
        ],
      },
      // Visits routes will be added in Phase 4
    ],
  },

  // Error Pages
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('@/pages/error/UnauthorizedPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/pages/error/NotFoundPage.vue'),
    meta: { requiresAuth: false },
  },
]

export default routes
