import Vue from "vue";
import Router from "vue-router";
import authStore from "@/core/services/store/auth/moduleAuth";
import { RESET_LAYOUT_CONFIG } from "@/core/services/store/config.module";
import store from "@/core/services/store";

Vue.use(Router);

const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  routes: [
    {
      path: "/",
      redirect: "/auth/login"
    },
    // =============================================================================
    // MAIN LAYOUT ROUTES
    // =============================================================================
    {
      path: "",
      component: () => import("@/view/layout/Layout"),
      meta: {
        requiresAuth: true
      },
      children: [
        {
          path: "/dashboard",
          name: "dashboard",
          component: () => import("@/view/pages/home/superadmin/Dashboard.vue"),
          meta: {
            requiresAuth: true
          }
        },
        // {
        //   path: "/builder",
        //   name: "builder",
        //   component: () => import("@/view/pages/Builder.vue")
        // },
        // PATIENT
        {
          path: "/patient",
          name: "patient",
          component: () => import("@/view/pages/patient/Patient.vue"),
          children: [
            {
              path: "choose-patient-type",
              name: "choose-patient-type",
              component: () =>
                import("@/view/pages/patient/create/Patient.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "cash-patient",
              name: "cash-patient",
              component: () =>
                import("@/view/pages/patient/create/AddCashPatient.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "ordinary-patient",
              name: "ordinary-patient",
              component: () =>
                import("@/view/pages/patient/create/AddOrdinaryPatient.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "find-patient",
              name: "find-patient",
              component: () => import("@/view/pages/patient/FindPatient.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "profile/:id",
              name: "patient-profile",
              component: () =>
                import("@/view/pages/patient/PatientProfile.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "health-insurance/:id",
              name: "health-insurance-patient",
              component: () =>
                import(
                  "@/view/pages/patient/create/AddHealthInsurancePatient.vue"
                ),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // EMPLOYEE
        {
          path: "/employee",
          name: "employee",
          component: () => import("@/view/pages/employees/Employee.vue"),
          children: [
            {
              path: "choose-type",
              name: "choose-type",
              component: () =>
                import("@/view/pages/employees/create/Employee.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "create",
              name: "create",
              component: () =>
                import("@/view/pages/employees/create/AddEmployee.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "find-employee",
              name: "find-employee",
              component: () =>
                import("@/view/pages/employees/EmployeeList.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "profile/:id",
              name: "employee-profile",
              component: () =>
                import("@/view/pages/employees/EmployeeProfile.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // ADMIN SETTINGS
        {
          path: "/settings",
          name: "settings",
          component: () => import("@/view/pages/admin/Admin.vue"),
          children: [
            {
              path: "choose-type",
              name: "choose-setting-type",
              component: () => import("@/view/pages/admin/AdminModels.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "department",
              name: "department",
              component: () =>
                import("@/view/pages/admin/department/Departments.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "unit",
              name: "unit",
              component: () => import("@/view/pages/admin/unit/Units.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "ward",
              name: "ward",
              component: () => import("@/view/pages/admin/ward/Wards.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "bed",
              name: "bed",
              component: () => import("@/view/pages/admin/bed/Beds.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "services",
              name: "services",
              component: () =>
                import("@/view/pages/admin/services/Services.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // VISITS
        {
          path: "/visit",
          name: "visit",
          component: () => import("@/view/pages/visits/Visit.vue"),
          children: [
            {
              path: "active",
              name: "active",
              component: () => import("@/view/pages/visits/Visits.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // MEDICAL PROGRAMS
        {
          path: "/program",
          name: "program",
          component: () => import("@/view/pages/programs/Program.vue"),
          children: [
            {
              path: "program-type",
              name: "program-type",
              component: () => import("@/view/pages/programs/Programs.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "ante-natal",
              name: "ante-natal",
              component: () => import("@/view/pages/programs/Antenatal.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // HEALTH INSURANCE
        {
          path: "/insurance",
          name: "insurance",
          component: () => import("@/view/pages/insurance/Insurance.vue"),
          children: [
            {
              path: "insurance-type",
              name: "insurance-type",
              component: () => import("@/view/pages/insurance/Home.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "health-insurance",
              name: "health-insurance",
              component: () =>
                import("@/view/pages/insurance/InsuranceList.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "hmo",
              name: "hmo",
              component: () => import("@/view/pages/insurance/HMO/HMOList.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // STORE (LABORATORY AND PHARMACY)
        {
          path: "/store",
          name: "store",
          component: () => import("@/view/pages/store/Store.vue"),
          children: [
            {
              path: "store-type",
              name: "store-type",
              component: () => import("@/view/pages/store/StoreType.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "pharmacy",
              component: () =>
                import("@/view/pages/store/pharmacy/Pharmacy.vue"),
              children: [
                {
                  path: "",
                  name: "pharmacy",
                  component: () =>
                    import("@/view/pages/store/pharmacy/PharmacyType.vue"),
                  meta: {
                    requiresAuth: true
                  }
                },
                {
                  path: "pharmacy-items",
                  name: "pharmacy-items",
                  component: () =>
                    import("@/view/pages/store/pharmacy/StoreItems.vue"),
                  meta: {
                    requiresAuth: true
                  }
                },
                {
                  path: "add-item",
                  name: "add-item",
                  component: () =>
                    import(
                      "@/view/pages/store/pharmacy/create/CreateStoreItem.vue"
                    ),
                  meta: {
                    requiresAuth: true
                  }
                }
              ]
            },
            {
              path: "laboratory",
              component: () =>
                import("@/view/pages/store/laboratory/Laboratory.vue"),
              children: [
                {
                  path: "",
                  name: "laboratory-store",
                  component: () =>
                    import("@/view/pages/store/laboratory/LaboratoryType.vue"),
                  meta: {
                    requiresAuth: true
                  }
                },
                {
                  path: "laboratory-items",
                  name: "laboratory-items",
                  component: () =>
                    import("@/view/pages/store/laboratory/StoreItems.vue"),
                  meta: {
                    requiresAuth: true
                  }
                },
                {
                  path: "add-item",
                  name: "add-laboratory-item",
                  component: () =>
                    import(
                      "@/view/pages/store/laboratory/create/CreateStoreItem.vue"
                    ),
                  meta: {
                    requiresAuth: true
                  }
                }
              ]
            }
          ]
        },
        // PHARMACY
        {
          path: "/pharmacy",
          name: "pharmacy-module",
          component: () => import("@/view/pages/pharmacy/Pharmacy.vue"),
          children: [
            {
              path: "pharmacy-type",
              name: "pharmacy-type",
              component: () => import("@/view/pages/pharmacy/Home.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "generic-drugs",
              name: "generic-drugs",
              component: () => import("@/view/pages/pharmacy/GenericDrugs.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "dosage-forms",
              name: "dosage-forms",
              component: () => import("@/view/pages/pharmacy/DosageForms.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "dosage-measurements",
              name: "dosage-measurements",
              component: () => import("@/view/pages/pharmacy/Measurements.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "routes-of-administration",
              name: "routes-of-administration",
              component: () =>
                import("@/view/pages/pharmacy/RoutesOfAdministration.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // LABORATORY
        {
          path: "/laboratory",
          name: "laboratory",
          component: () => import("@/view/pages/laboratory/Laboratory.vue"),
          children: [
            {
              path: "laboratory-type",
              name: "laboratory-type",
              component: () => import("@/view/pages/laboratory/Home.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "sample-types",
              name: "sample-types",
              component: () =>
                import("@/view/pages/laboratory/SampleTypes.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "tests",
              name: "tests",
              component: () => import("@/view/pages/laboratory/Tests.vue"),
              meta: {
                requiresAuth: true
              }
            },
            {
              path: "nhis-tests",
              name: "nhis-tests",
              component: () => import("@/view/pages/laboratory/NhisTests.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        },
        // ORDERS
        {
          path: "/orders",
          name: "orders",
          component: () => import("@/view/pages/orders/Orders.vue"),
          children: [
            {
              path: "orders-type",
              name: "orders-type",
              component: () => import("@/view/pages/orders/Home.vue"),
              meta: {
                requiresAuth: true
              }
            }
          ]
        }
      ]
    },
    {
      path: "/error",
      name: "error",
      component: () => import("@/view/pages/error/Error.vue"),
      children: [
        {
          path: "error-1",
          name: "error-1",
          component: () => import("@/view/pages/error/Error-1.vue")
        },
        {
          path: "error-2",
          name: "error-2",
          component: () => import("@/view/pages/error/Error-2.vue")
        },
        {
          path: "error-3",
          name: "error-3",
          component: () => import("@/view/pages/error/Error-3.vue")
        },
        {
          path: "error-4",
          name: "error-4",
          component: () => import("@/view/pages/error/Error-4.vue")
        },
        {
          path: "error-5",
          name: "error-5",
          component: () => import("@/view/pages/error/Error-5.vue")
        },
        {
          path: "error-6",
          name: "error-6",
          component: () => import("@/view/pages/error/Error-6.vue")
        }
      ]
    },
    // =============================================================================
    // FULL PAGE LAYOUTS
    // =============================================================================
    {
      path: "/",
      component: () => import("@/view/pages/auth/Login-1"),
      children: [
        {
          name: "login",
          path: "/auth/login",
          component: () => import("@/view/pages/auth/Login-1")
        },
        {
          name: "register",
          path: "/auth/register",
          component: () => import("@/view/pages/auth/Register")
        }
      ]
    },
    {
      path: "*",
      redirect: "/404"
    },
    {
      // the 404 route, when none of the above matches
      path: "/404",
      name: "404",
      component: () => import("@/view/pages/error/Error-1.vue")
    }
  ]
});

router.beforeEach((to, from, next) => {
  // reset config to initial state
  store.dispatch(RESET_LAYOUT_CONFIG);

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (authStore.state.token) {
      next();
      return;
    }
    next("/auth/login");
  } else {
    next();
  }
});
export default router;
