import Vue from 'vue';
import Router from 'vue-router';
import authStore from '@/core/services/store/auth/moduleAuth';
import { RESET_LAYOUT_CONFIG } from '@/core/services/store/config.module';
import store from '@/core/services/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: '/',
      beforeEnter: (to, from, next) => {
        if (authStore.state.token) {
          next('/dashboard');
          return;
        }
        next('/auth/login');
      },
    },
    // =============================================================================
    // MAIN LAYOUT ROUTES
    // =============================================================================
    {
      path: '',
      component: () => import('@/view/layout/Layout'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/view/pages/home/Dashboard.vue'),
          meta: {
            requiresAuth: true,
          },
        },
        // {
        //   path: "/builder",
        //   name: "builder",
        //   components: () => import("@/view/pages/Builder.vue")
        // },
        // PATIENT
        {
          path: '/patient',
          name: 'patient',
          component: () => import('@/view/pages/patient/Patient.vue'),
          children: [
            {
              path: 'patient-operations',
              name: 'patient-operations',
              component: () => import('@/view/pages/patient/page/PatientOperations.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'choose-patient-type',
              name: 'choose-patient-type',
              component: () => import('@/view/pages/patient/page/ChoosePatientType.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'create-account',
              name: 'create-account',
              component: () => import('@/view/pages/patient/page/CreatePatientAccount.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'create-emergency-account',
              name: 'create-emergency-account',
              component: () => import('@/view/pages/patient/page/CreateEmergencyAccount.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'find-patient',
              name: 'find-patient',
              component: () => import('@/view/pages/patient/page/FindPatient.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'profile/:id',
              name: 'patient-profile',
              component: () => import('@/view/pages/patient/page/PatientProfile.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'health-insurance/:id',
              name: 'health-insurance-patient',
              component: () => import('@/view/pages/patient/page/AddPatientInsurance.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'dependants/:id',
              name: 'patient-dependants',
              component: () => import('@/view/pages/patient/page/Dependants.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'health-insurance/default/:id',
              name: 'health-insurance-default',
              component: () => import('@/view/pages/patient/page/ChangeInsurance.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'edit/:id',
              name: 'profile-edit',
              component: () => import('@/view/pages/patient/page/EditPatient.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'health-insurance',
              name: 'insurance-patients',
              component: () => import('@/view/pages/nhis/page/Patients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'edit-health-insurance/:id',
              name: 'edit-health-insurance',
              component: () => import('@/view/pages/patient/page/EditPatientInsurance.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // EMPLOYEE
        {
          path: '/employee',
          name: 'employee',
          component: () => import('@/view/pages/employees/Employee.vue'),
          children: [
            {
              path: 'choose-type',
              name: 'choose-type',
              component: () => import('@/view/pages/employees/create/Employee.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'create',
              name: 'create',
              component: () => import('@/view/pages/employees/create/AddEmployee.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'find-employee',
              name: 'find-employee',
              component: () => import('@/view/pages/employees/EmployeeList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'profile/:id',
              name: 'employee-profile',
              component: () => import('@/view/pages/employees/EmployeeProfile.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // ADMIN SETTINGS
        {
          path: '/settings',
          name: 'settings',
          component: () => import('@/view/pages/admin/Admin.vue'),
          children: [
            {
              path: 'choose-type',
              name: 'choose-setting-type',
              component: () => import('@/view/pages/admin/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'departments',
              name: 'department',
              component: () => import('@/view/pages/admin/department/Departments.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'units',
              name: 'unit',
              component: () => import('@/view/pages/admin/unit/Units.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'wards',
              name: 'ward',
              component: () => import('@/view/pages/admin/ward/Wards.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'beds',
              name: 'bed',
              component: () => import('@/view/pages/admin/bed/Beds.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'services',
              name: 'services',
              component: () => import('@/view/pages/admin/services/Services.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'defaults',
              name: 'default',
              component: () => import('@/view/pages/admin/defaults/Defaults.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'defaults/create',
              name: 'create-default',
              component: () => import('@/view/pages/admin/defaults/CreateDefault.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'defaults/:id',
              name: 'one-default',
              component: () => import('@/view/pages/admin/defaults/Default.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'merge-accounts',
              name: 'merge-accounts',
              component: () => import('@/view/pages/admin/mergeAccounts/MergeAccounts.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // VISITS
        {
          path: '/visit',
          name: 'visit',
          component: () => import('@/view/pages/visits/Visit.vue'),
          children: [
            {
              path: 'all',
              name: 'all-visits',
              component: () => import('@/view/pages/visits/page/Visits.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'new/:id',
              name: 'new-visit',
              component: () => import('@/view/pages/visits/create/CreateNewVisit.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'update/:id',
              name: 'update-visit',
              component: () => import('@/view/pages/visits/page/EditVisit.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            // DOCTOR
            {
              path: 'queue',
              name: 'queue',
              component: () => import('@/view/pages/visits/page/Queue.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'inpatients',
              name: 'inpatients',
              component: () => import('@/view/pages/visits/page/Inpatients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'ante-natal',
              name: 'ante-natal-visits',
              component: () => import('@/view/pages/visits/page/AntenatalPatients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'immunization',
              name: 'immunization-visits',
              component: () => import('@/view/pages/visits/page/ImmunizationPatients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            // NURSE (OPD)
            {
              path: 'treatments',
              name: 'nurse-treatments',
              component: () => import('@/view/pages/nurse/opd/OPDTreatments.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'vitals',
              name: 'awaiting-vitals',
              component: () => import('@/view/pages/nurse/opd/AwaitingVitals.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'treatments/:id',
              name: 'treatment-records',
              component: () => import('@/view/pages/visits/page/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'admitted-patients',
              name: 'admitted-patients',
              component: () => import('@/view/pages/visits/page/AdmittedPatients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            //NHIS
            {
              path: 'nhis-active-visits',
              name: 'nhis-active-visits',
              component: () => import('@/view/pages/visits/page/NHISPatientsVisits.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'nhis-visits/:id',
              name: 'nhis-visits',
              component: () => import('@/view/pages/nhis/page/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            //CUSTOMER CARE
            {
              path: 'prescriptions',
              name: 'visit-prescriptions',
              component: () => import('@/view/pages/customerCare/ActiveVisits.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'prescriptions/:id',
              name: 'visit-prescription',
              component: () => import('@/view/pages/customerCare/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            //MATERNITY
            {
              path: 'maternity',
              name: 'maternity-visits',
              component: () => import('@/view/pages/visits/page/MaternityVisits.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'admit-patient/:id',
              name: 'maternity-admit-patient',
              component: () => import('@/view/pages/admission/page/AdmitPatient.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            // MEDICAL RECORDS
            {
              path: 'active',
              name: 'active-visits',
              component: () => import('@/view/pages/medicalRecords/page/ActiveVisits.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'active/:id',
              name: 'active-visit',
              component: () => import('@/view/pages/medicalRecords/page/AddActiveServices.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // CONSULTATION
        {
          path: '/consultation',
          name: 'consultation',
          component: () => import('@/view/pages/consultation/Consultation.vue'),
          children: [
            {
              path: ':id',
              name: 'visit-details',
              component: () => import('@/view/pages/consultation/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // MEDICAL PROGRAMS
        {
          path: '/program',
          name: 'program',
          component: () => import('@/view/pages/programs/Program.vue'),
          children: [
            {
              path: 'program-type',
              name: 'program-type',
              component: () => import('@/view/pages/programs/Programs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            // ANTENATAL
            {
              path: 'ante-natal',
              name: 'ante-natal',
              component: () => import('@/view/pages/programs/antenatal/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'ante-natal/list',
              name: 'ante-natal-list',
              component: () => import('@/view/pages/programs/antenatal/Patients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'ante-natal/enrol',
              name: 'ante-natal-enrol',
              component: () => import('@/view/pages/programs/antenatal/EnrolPatient.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'ante-natal/visit/:id',
              name: 'ante-natal-visit',
              component: () => import('@/view/pages/programs/antenatal/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'ante-natal/profile/:id',
              name: 'ante-natal-profile',
              component: () => import('@/view/pages/programs/antenatal/Profile.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            // IMMUNIZATION
            {
              path: 'immunization',
              name: 'immunization',
              component: () => import('@/view/pages/programs/immunization/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'immunization/enrol',
              name: 'immunization-enrol',
              component: () => import('@/view/pages/programs/immunization/Enrol.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'immunization/list',
              name: 'immunization-list',
              component: () => import('@/view/pages/programs/immunization/Patients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'immunization/visit/:id',
              name: 'immunization-visit',
              component: () => import('@/view/pages/programs/immunization/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // HEALTH INSURANCE
        {
          path: '/insurance',
          name: 'insurance',
          component: () => import('@/view/pages/insurance/Insurance.vue'),
          children: [
            {
              path: 'insurance-type',
              name: 'insurance-type',
              component: () => import('@/view/pages/insurance/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'health-insurance',
              name: 'health-insurance',
              component: () => import('@/view/pages/insurance/InsuranceList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'hmo',
              name: 'hmo',
              component: () => import('@/view/pages/insurance/HMO/HMOList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // STORE (LABORATORY AND PHARMACY)
        {
          path: '/store',
          name: 'store',
          component: () => import('@/view/pages/store/Store.vue'),
          children: [
            {
              path: 'store-type',
              name: 'store-type',
              component: () => import('@/view/pages/store/StoreType.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'pharmacy',
              component: () => import('@/view/pages/store/pharmacy/Pharmacy.vue'),
              children: [
                {
                  path: '',
                  name: 'pharmacy',
                  component: () => import('@/view/pages/store/pharmacy/PharmacyType.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'items',
                  name: 'pharmacy-items',
                  component: () => import('@/view/pages/store/pharmacy/StoreItems.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'update-items',
                  name: 'pharmacy-items-update',
                  component: () => import('@/view/pages/store/pharmacy/update/UpdateStoreItem.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'items/:item',
                  name: 'item-details',
                  component: () => import('@/view/pages/store/pharmacy/StoreItem.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'add-item',
                  name: 'add-item',
                  component: () => import('@/view/pages/store/pharmacy/create/CreateStoreItem.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
              ],
            },
            {
              path: 'laboratory',
              component: () => import('@/view/pages/store/laboratory/Laboratory.vue'),
              children: [
                {
                  path: '',
                  name: 'laboratory-store',
                  component: () => import('@/view/pages/store/laboratory/LaboratoryType.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'items',
                  name: 'laboratory-items',
                  component: () => import('@/view/pages/store/laboratory/StoreItems.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
                {
                  path: 'add-item',
                  name: 'add-laboratory-item',
                  component: () =>
                    import('@/view/pages/store/laboratory/create/CreateStoreItem.vue'),
                  meta: {
                    requiresAuth: true,
                  },
                },
              ],
            },
          ],
        },
        // PHARMACY
        {
          path: '/pharmacy',
          name: 'pharmacy-module',
          component: () => import('@/view/pages/pharmacy/Pharmacy.vue'),
          children: [
            {
              path: 'pharmacy-type',
              name: 'pharmacy-type',
              component: () => import('@/view/pages/pharmacy/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'generic-drugs',
              name: 'generic-drugs',
              component: () => import('@/view/pages/pharmacy/GenericDrugs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'dosage-forms',
              name: 'dosage-forms',
              component: () => import('@/view/pages/pharmacy/DosageForms.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'dosage-measurements',
              name: 'dosage-measurements',
              component: () => import('@/view/pages/pharmacy/Measurements.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'routes-of-administration',
              name: 'routes-of-administration',
              component: () => import('@/view/pages/pharmacy/RoutesOfAdministration.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'prescriptions',
              name: 'drug-prescriptions',
              component: () => import('@/view/pages/pharmacy/Prescriptions.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'prescriptions/:id',
              name: 'drug-prescription',
              component: () => import('@/view/pages/pharmacy/PrescriptionDetail.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // LABORATORY
        {
          path: '/laboratory',
          name: 'laboratory',
          component: () => import('@/view/pages/laboratory/Laboratory.vue'),
          children: [
            {
              path: 'laboratory-type',
              name: 'laboratory-type',
              component: () => import('@/view/pages/laboratory/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'sample-types',
              name: 'sample-types',
              component: () => import('@/view/pages/laboratory/SampleTypes.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'tests',
              name: 'tests',
              component: () => import('@/view/pages/laboratory/Tests.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'nhis-tests',
              name: 'nhis-tests',
              component: () => import('@/view/pages/laboratory/NhisTests.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'samples-to-collect',
              name: 'samples-to-collect',
              component: () => import('@/view/pages/laboratory/SamplesToCollect.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'samples-collected',
              name: 'samples-collected',
              component: () => import('@/view/pages/laboratory/SamplesCollected.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'result-validation/:id',
              name: 'result-validation',
              component: () => import('@/view/pages/laboratory/ResultValidation.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'add-test-result/:id',
              name: 'add-test-result',
              component: () => import('@/view/pages/laboratory/AddTestResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'collect-sample/:id',
              name: 'collect-sample',
              component: () => import('@/view/pages/laboratory/CollectTestSample.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'result-approval/:id',
              name: 'result-approval',
              component: () => import('@/view/pages/laboratory/ResultApproval.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'find-results',
              name: 'find-results',
              component: () => import('@/view/pages/laboratory/FindTestResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'test-result/:id',
              name: 'test-result',
              component: () => import('@/view/pages/laboratory/TestResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'verified-results',
              name: 'verified-results',
              component: () => import('@/view/pages/laboratory/VerifiedResults.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'reports',
              name: 'reports',
              component: () => import('@/view/pages/laboratory/Reports.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'reports/aggregate',
              name: 'aggregate-reports',
              component: () => import('@/view/pages/laboratory/reports/AggregateReport.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'forms',
              name: 'result-forms',
              component: () => import('@/view/pages/laboratory/ResultFormsList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'results-update',
              name: 'results-update',
              component: () =>
                import('@/view/pages/laboratory/approvedResults/ApprovedResults.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'results-update/:id',
              name: 'results-update-one',
              component: () => import('@/view/pages/laboratory/approvedResults/ApprovedResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // ORDERS
        {
          path: '/orders',
          name: 'orders',
          component: () => import('@/view/pages/orders/Orders.vue'),
          children: [
            {
              path: 'orders-type',
              name: 'orders-type',
              component: () => import('@/view/pages/orders/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // INVENTORY
        {
          path: '/inventory',
          name: 'inventory',
          component: () => import('@/view/pages/inventory/Inventory.vue'),
          children: [
            {
              path: 'inventory-type',
              name: 'inventory-type',
              component: () => import('@/view/pages/inventory/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: ':id',
              name: 'inventory-list',
              component: () => import('@/view/pages/inventory/InventoryList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'items/:id',
              name: 'inventory-item',
              component: () => import('@/view/pages/inventory/InventoryItem.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // RADIOLOGY
        {
          path: '/radiology',
          name: 'radiology',
          component: () => import('@/view/pages/radiology/RadiologyPage.vue'),
          children: [
            {
              path: 'radiology-type',
              name: 'radiology-type',
              component: () => import('@/view/pages/radiology/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'imaging',
              name: 'imaging',
              component: () => import('@/view/pages/radiology/components/Imaging.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'investigations',
              name: 'investigations',
              component: () => import('@/view/pages/radiology/components/Investigation.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'requested-investigations',
              name: 'requested-investigations',
              component: () => import('@/view/pages/radiology/RequestedInvestigations.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'add-test-result/:id',
              name: 'requested-investigation',
              component: () => import('@/view/pages/radiology/AddInvestigationResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'investigations-approval',
              name: 'investigations-approval',
              component: () => import('@/view/pages/radiology/VerifiedInvestigationsResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'result-approval/:id',
              name: 'radiology-result-approval',
              component: () => import('@/view/pages/radiology/ApproveInvestigationResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'investigations-results',
              name: 'investigations-results',
              component: () => import('@/view/pages/radiology/InvestigationsResults.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'investigations-results/:id',
              name: 'investigations-result',
              component: () => import('@/view/pages/radiology/InvestigationResult.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // INVENTORY REQUESTS
        {
          path: '/request',
          name: 'request',
          component: () => import('@/view/pages/requests/Request.vue'),
          children: [
            {
              path: 'request-type',
              name: 'request-type',
              component: () => import('@/view/pages/requests/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'create',
              name: 'request-create',
              component: () => import('@/view/pages/requests/CreateRequest.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'list',
              name: 'request-list',
              component: () => import('@/view/pages/requests/Requests.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'inventory-requests',
              name: 'user-requests',
              component: () => import('@/view/pages/requests/CurrentUserRequests.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'returns',
              name: 'user-returns',
              component: () => import('@/view/pages/requests/Returns.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // TRIAGE - VITALS
        {
          path: '/vitals',
          name: 'vitals',
          component: () => import('@/view/pages/triage/Triage.vue'),
          children: [
            {
              path: ':id',
              name: 'create-vitals',
              component: () => import('@/view/pages/triage/page/CreateTriage.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        // ADMISSION
        {
          path: '/admission',
          name: 'admission',
          component: () => import('@/view/pages/admission/Admission.vue'),
          children: [
            {
              path: 'discharge-patients',
              name: 'discharge-patients',
              component: () => import('@/view/pages/admission/page/DischargedPatients.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'operations/:id',
              name: 'admission-operations',
              component: () => import('@/view/pages/admission/AdmissionOperations.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'observations/:id',
              name: 'admission-observations',
              component: () => import('@/view/pages/admission/page/Observation.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'careplans/:id',
              name: 'admission-careplans',
              component: () => import('@/view/pages/admission/page/CarePlan.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'iocharts/:id',
              name: 'admission-iocharts',
              component: () => import('@/view/pages/admission/page/IOChart.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'treatments/:id',
              name: 'admission-treatments',
              component: () => import('@/view/pages/admission/page/Treatment.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'additional-prescriptions/:id',
              name: 'admission-additional-prescriptions',
              component: () => import('@/view/pages/admission/page/AdditionalPrescription.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'nursing-notes/:id',
              name: 'admission-nursing-notes',
              component: () => import('@/view/pages/admission/page/NursingNote.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'change-ward/:id',
              name: 'admission-change-ward',
              component: () => import('@/view/pages/admission/page/ChangeWard.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'discharge/:id',
              name: 'admission-discharge',
              component: () => import('@/view/pages/admission/page/Discharge.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'doctor-prescriptions/:id',
              name: 'admission-doctor-prescriptions',
              component: () => import('@/view/pages/admission/page/DoctorPrescription.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'history/:id',
              name: 'admission-history',
              component: () => import('@/view/pages/admission/page/AdmissionHistory.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'delivery/:id',
              name: 'delivery',
              component: () => import('@/view/pages/admission/page/Delivery.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'postnatal/:id',
              name: 'postnatal',
              component: () => import('@/view/pages/admission/page/Postnatal.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'recommended-discharge-patients',
              name: 'recommended-discharge-patients',
              component: () => import('@/view/pages/visits/page/DischargeRecommendations.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/surgery',
          name: 'surgery-module',
          component: () => import('@/view/pages/surgery/Surgery.vue'),
          children: [
            {
              path: 'requests',
              name: 'surgery-requests',
              component: () => import('@/view/pages/surgery/pages/Requests.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'requests/:id',
              name: 'surgery-request',
              component: () => import('@/view/pages/surgery/pages/Tabs.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/system',
          name: 'system-module',
          component: () => import('@/view/pages/settings/Settings.vue'),
          children: [
            {
              path: 'settings',
              name: 'system-settings',
              component: () => import('@/view/pages/settings/page/SystemSettings.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/nurses',
          name: 'nurses-module',
          component: () => import('@/view/pages/nurse/Nurse.vue'),
          children: [
            {
              path: 'list',
              name: 'nurses-list',
              component: () => import('@/view/pages/nurse/NursesList.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'change-department/:id',
              name: 'nurses-change-department',
              component: () => import('@/view/pages/nurse/ChangeDepartment.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/account',
          name: 'account-module',
          component: () => import('@/view/pages/account/Account.vue'),
          children: [
            {
              path: 'transactions',
              name: 'transactions',
              component: () => import('@/view/pages/account/page/Transactions.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'transactions/:id',
              name: 'transaction',
              component: () => import('@/view/pages/account/page/Transaction.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/settings',
          name: 'account-settings',
          component: () => import('@/view/pages/settings/Settings.vue'),
          children: [
            {
              path: 'change-password',
              name: 'change-password',
              component: () => import('@/view/pages/settings/page/ChangePassword.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
        {
          path: '/statistics',
          name: 'statistics-module',
          component: () => import('@/view/pages/statistics/Statistics.vue'),
          children: [
            {
              path: '/',
              name: 'statistics-home',
              component: () => import('@/view/pages/statistics/page/Home.vue'),
              meta: {
                requiresAuth: true,
              },
            },
            {
              path: 'encounters',
              name: 'encounters',
              component: () => import('@/view/pages/statistics/page/Encounters.vue'),
              meta: {
                requiresAuth: true,
              },
            },
          ],
        },
      ],
    },
    {
      path: '/error',
      name: 'error',
      component: () => import('@/view/pages/error/Error.vue'),
      children: [
        {
          path: 'error-1',
          name: 'error-1',
          component: () => import('@/view/pages/error/Error-1.vue'),
        },
        {
          path: 'error-2',
          name: 'error-2',
          component: () => import('@/view/pages/error/Error-2.vue'),
        },
        {
          path: 'error-3',
          name: 'error-3',
          component: () => import('@/view/pages/error/Error-3.vue'),
        },
        {
          path: 'error-4',
          name: 'error-4',
          component: () => import('@/view/pages/error/Error-4.vue'),
        },
        {
          path: 'error-5',
          name: 'error-5',
          component: () => import('@/view/pages/error/Error-5.vue'),
        },
        {
          path: 'error-6',
          name: 'error-6',
          component: () => import('@/view/pages/error/Error-6.vue'),
        },
      ],
    },
    // =============================================================================
    // FULL PAGE LAYOUTS
    // =============================================================================
    {
      path: '/',
      component: () => import('@/view/pages/auth/Login-1'),
      children: [
        {
          name: 'login',
          path: '/auth/login',
          component: () => import('@/view/pages/auth/Login-1'),
        },
        {
          name: 'register',
          path: '/auth/register',
          component: () => import('@/view/pages/auth/Register'),
        },
      ],
    },
    {
      name: 'quill',
      path: '/quill',
      component: () => import('@/view/pages/Quill.vue'),
    },
    {
      path: '*',
      redirect: '/404',
    },
    {
      // the 404 route, when none of the above matches
      path: '/404',
      name: '404',
      component: () => import('@/view/pages/error/Error-1.vue'),
    },
  ],
});

router.beforeEach((to, from, next) => {
  // reset config to initial state
  store.dispatch(RESET_LAYOUT_CONFIG);

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (authStore.state.token) {
      next();
      return;
    }
    next('/auth/login');
  } else {
    next();
  }
});
export default router;
