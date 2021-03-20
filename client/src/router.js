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
                  path: "generic-drugs",
                  name: "generic-drugs",
                  component: () =>
                    import("@/view/pages/store/pharmacy/GenericDrugs.vue"),
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
            }
          ]
        }
        // {
        //   path: "/vue-bootstrap",
        //   name: "vue-bootstrap",
        //   component: () =>
        //     import("@/view/pages/vue-bootstrap/VueBootstrap.vue"),
        //   children: [
        //     {
        //       path: "alert",
        //       name: "vue-bootstrap-alert",
        //       component: () => import("@/view/pages/vue-bootstrap/Alert.vue")
        //     },
        //     {
        //       path: "badge",
        //       name: "vue-bootstrap-badge",
        //       component: () => import("@/view/pages/vue-bootstrap/Badge.vue")
        //     },
        //     {
        //       path: "button",
        //       name: "vue-bootstrap-button",
        //       component: () => import("@/view/pages/vue-bootstrap/Button.vue")
        //     },
        //     {
        //       path: "button-group",
        //       name: "vue-bootstrap-button-group",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/ButtonGroup.vue")
        //     },
        //     {
        //       path: "button-toolbar",
        //       name: "vue-bootstrap-button-toolbar",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/ButtonToolbar.vue")
        //     },
        //     {
        //       path: "card",
        //       name: "vue-bootstrap-card",
        //       component: () => import("@/view/pages/vue-bootstrap/Card.vue")
        //     },
        //     {
        //       path: "carousel",
        //       name: "vue-bootstrap-carousel",
        //       component: () => import("@/view/pages/vue-bootstrap/Carousel.vue")
        //     },
        //     {
        //       path: "collapse",
        //       name: "vue-bootstrap-collapse",
        //       component: () => import("@/view/pages/vue-bootstrap/Collapse.vue")
        //     },
        //     {
        //       path: "dropdown",
        //       name: "vue-bootstrap-dropdown",
        //       component: () => import("@/view/pages/vue-bootstrap/Dropdown.vue")
        //     },
        //     {
        //       path: "embed",
        //       name: "vue-bootstrap-embed",
        //       component: () => import("@/view/pages/vue-bootstrap/Embed.vue")
        //     },
        //     {
        //       path: "form",
        //       name: "vue-bootstrap-form",
        //       component: () => import("@/view/pages/vue-bootstrap/Form.vue")
        //     },
        //     {
        //       path: "form-checkbox",
        //       name: "vue-bootstrap-form-checkbox",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormCheckbox.vue")
        //     },
        //     {
        //       path: "form-file",
        //       name: "vue-bootstrap-form-file",
        //       component: () => import("@/view/pages/vue-bootstrap/FormFile.vue")
        //     },
        //     {
        //       path: "form-group",
        //       name: "vue-bootstrap-form-group",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormGroup.vue")
        //     },
        //     {
        //       path: "form-input",
        //       name: "vue-bootstrap-form-input",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormInput.vue")
        //     },
        //     {
        //       path: "form-radio",
        //       name: "vue-bootstrap-form-radio",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormRadio.vue")
        //     },
        //     {
        //       path: "form-select",
        //       name: "vue-bootstrap-form-select",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormSelect.vue")
        //     },
        //     {
        //       path: "form-textarea",
        //       name: "vue-bootstrap-form-textarea",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/FormTextarea.vue")
        //     },
        //     {
        //       path: "image",
        //       name: "vue-bootstrap-image",
        //       component: () => import("@/view/pages/vue-bootstrap/Image.vue")
        //     },
        //     {
        //       path: "input-group",
        //       name: "vue-bootstrap-input-group",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/InputGroup.vue")
        //     },
        //     {
        //       path: "jumbotron",
        //       name: "vue-bootstrap-jumbotron",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/Jumbotron.vue")
        //     },
        //     {
        //       path: "layout-grid-system",
        //       name: "vue-bootstrap-layout-grid-system",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/LayoutGridSystem.vue")
        //     },
        //     {
        //       path: "link",
        //       name: "vue-bootstrap-link",
        //       component: () => import("@/view/pages/vue-bootstrap/Link.vue")
        //     },
        //     {
        //       path: "list-group",
        //       name: "vue-bootstrap-list-group",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/ListGroup.vue")
        //     },
        //     {
        //       path: "media",
        //       name: "vue-bootstrap-media",
        //       component: () => import("@/view/pages/vue-bootstrap/Media.vue")
        //     },
        //     {
        //       path: "modal",
        //       name: "vue-bootstrap-modal",
        //       component: () => import("@/view/pages/vue-bootstrap/Modal.vue")
        //     },
        //     {
        //       path: "nav",
        //       name: "vue-bootstrap-nav",
        //       component: () => import("@/view/pages/vue-bootstrap/Nav.vue")
        //     },
        //     {
        //       path: "navbar",
        //       name: "vue-bootstrap-navbar",
        //       component: () => import("@/view/pages/vue-bootstrap/Navbar.vue")
        //     },
        //     {
        //       path: "pagination",
        //       name: "vue-bootstrap-pagination",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/Pagination.vue")
        //     },
        //     {
        //       path: "pagination-nav",
        //       name: "vue-bootstrap-pagination-nav",
        //       component: () =>
        //         import("@/view/pages/vue-bootstrap/PaginationNav.vue")
        //     },
        //     {
        //       path: "popover",
        //       name: "vue-bootstrap-popover",
        //       component: () => import("@/view/pages/vue-bootstrap/Popover.vue")
        //     },
        //     {
        //       path: "progress",
        //       name: "vue-bootstrap-progress",
        //       component: () => import("@/view/pages/vue-bootstrap/Progress.vue")
        //     },
        //     {
        //       path: "spinner",
        //       name: "vue-bootstrap-spinner",
        //       component: () => import("@/view/pages/vue-bootstrap/Spinner.vue")
        //     },
        //     {
        //       path: "table",
        //       name: "vue-bootstrap-table",
        //       component: () => import("@/view/pages/vue-bootstrap/Table.vue")
        //     },
        //     {
        //       path: "tabs",
        //       name: "vue-bootstrap-tabs",
        //       component: () => import("@/view/pages/vue-bootstrap/Tabs.vue")
        //     },
        //     {
        //       path: "toasts",
        //       name: "vue-bootstrap-toasts",
        //       component: () => import("@/view/pages/vue-bootstrap/Toasts.vue")
        //     },
        //     {
        //       path: "tooltip",
        //       name: "vue-bootstrap-tooltip",
        //       component: () => import("@/view/pages/vue-bootstrap/Tooltip.vue")
        //     }
        //   ]
        // },
        // {
        //   path: "/vuetify",
        //   name: "vuetify",
        //   component: () => import("@/view/pages/vuetify/Vuetify.vue"),
        //   children: [
        //     {
        //       path: "alerts",
        //       name: "vuetify-alerts",
        //       component: () => import("@/view/pages/vuetify/Alerts.vue")
        //     },
        //     {
        //       path: "avatars",
        //       name: "vuetify-avatars",
        //       component: () => import("@/view/pages/vuetify/Avatars.vue")
        //     },
        //     {
        //       path: "badges",
        //       name: "vuetify-badges",
        //       component: () => import("@/view/pages/vuetify/Badges.vue")
        //     },
        //     {
        //       path: "buttons",
        //       name: "vuetify-buttons",
        //       component: () => import("@/view/pages/vuetify/Buttons.vue")
        //     },
        //     {
        //       path: "calendars",
        //       name: "vuetify-calendars",
        //       component: () => import("@/view/pages/vuetify/Calendars.vue")
        //     },
        //     {
        //       path: "cards",
        //       name: "vuetify-cards",
        //       component: () => import("@/view/pages/vuetify/Cards.vue")
        //     },
        //     {
        //       path: "chips",
        //       name: "vuetify-chips",
        //       component: () => import("@/view/pages/vuetify/Chips.vue")
        //     },
        //     {
        //       path: "dialog",
        //       name: "vuetify-dialog",
        //       component: () => import("@/view/pages/vuetify/Dialog.vue")
        //     },
        //     {
        //       path: "autocompletes",
        //       name: "vuetify-autocompletes",
        //       component: () =>
        //         import("@/view/pages/vuetify/forms/Autocompletes.vue")
        //     },
        //     {
        //       path: "file-inputs",
        //       name: "vuetify-file-inputs",
        //       component: () =>
        //         import("@/view/pages/vuetify/forms/FileInputs.vue")
        //     },
        //     {
        //       path: "forms",
        //       name: "vuetify-forms",
        //       component: () => import("@/view/pages/vuetify/forms/Forms.vue")
        //     },
        //     {
        //       path: "selection-controls",
        //       name: "vuetify-selection-controls",
        //       component: () =>
        //         import("@/view/pages/vuetify/forms/SelectionControls.vue")
        //     },
        //     {
        //       path: "selects",
        //       name: "vuetify-selects",
        //       component: () => import("@/view/pages/vuetify/forms/Selects.vue")
        //     },
        //     {
        //       path: "textareas",
        //       name: "vuetify-textareas",
        //       component: () =>
        //         import("@/view/pages/vuetify/forms/Textareas.vue")
        //     },
        //     {
        //       path: "text-fields",
        //       name: "vuetify-text-fields",
        //       component: () =>
        //         import("@/view/pages/vuetify/forms/TextFields.vue")
        //     },
        //     {
        //       path: "simple-tables",
        //       name: "vuetify-simple-tables",
        //       component: () =>
        //         import("@/view/pages/vuetify/tables/SimpleTables.vue")
        //     },
        //     {
        //       path: "data-tables",
        //       name: "vuetify-data-tables",
        //       component: () =>
        //         import("@/view/pages/vuetify/tables/DataTables.vue")
        //     },
        //     {
        //       path: "tabs",
        //       name: "vuetify-tabs",
        //       component: () => import("@/view/pages/vuetify/Tabs.vue")
        //     },
        //     {
        //       path: "timelines",
        //       name: "vuetify-timelines",
        //       component: () => import("@/view/pages/vuetify/Timelines.vue")
        //     },
        //     {
        //       path: "tooltips",
        //       name: "vuetify-tooltips",
        //       component: () => import("@/view/pages/vuetify/Tooltips.vue")
        //     },
        //     {
        //       path: "treeview",
        //       name: "vuetify-treeview",
        //       component: () => import("@/view/pages/vuetify/Treeview.vue")
        //     }
        //   ]
        // },
        // {
        //   path: "/wizard",
        //   name: "wizard",
        //   component: () => import("@/view/pages/wizard/Wizard.vue"),
        //   children: [
        //     {
        //       path: "wizard-1",
        //       name: "wizard-1",
        //       component: () => import("@/view/pages/wizard/Wizard-1.vue")
        //     },
        //     {
        //       path: "wizard-2",
        //       name: "wizard-2",
        //       component: () => import("@/view/pages/wizard/Wizard-2.vue")
        //     },
        //     {
        //       path: "wizard-3",
        //       name: "wizard-3",
        //       component: () => import("@/view/pages/wizard/Wizard-3.vue")
        //     },
        //     {
        //       path: "wizard-4",
        //       name: "wizard-4",
        //       component: () => import("@/view/pages/wizard/Wizard-4.vue")
        //     }
        //   ]
        // }
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
