<template>
  <div>
    <div class="row mb-10">
      <div v-for="(route, i) in routes" :key="i" class="col-lg-6 col-xl-4 mb-10">
        <div v-if="route.showComponent" class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link :to="getRouteLink(route)" class="h4 text-dark text-hover-primary mb-5">
                  {{ route.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ route.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="getRouteLink(route)"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { parseJwt } from '@/common/common';

export default {
  data: () => ({
    user: parseJwt(localStorage.getItem('user_token')),
    routes: [
      {
        name: 'Doctor Prescriptions',
        link: '/admission/doctor-prescriptions/',
        desc: 'View doctor prescriptions',
        showComponent: true,
      },
      {
        name: 'Additional Prescriptions',
        link: '/admission/additional-prescriptions/',
        desc: 'Patient additional prescriptions',
        showComponent: true,
      },
      {
        name: 'Observations',
        link: '/admission/observations/',
        desc: 'Record patient daily observations',
        showComponent: true,
      },
      {
        name: 'Care Plan',
        link: '/admission/careplans/',
        desc: 'Patient care plan',
        showComponent: true,
      },
      {
        name: 'IO Chart',
        link: '/admission/iocharts/',
        desc: 'Patient IO Chart',
        showComponent: true,
      },
      {
        name: 'Treatment',
        link: '/admission/treatments/',
        desc: 'Record patient treatments',
        showComponent: true,
      },
      {
        name: 'Nursing Note',
        link: '/admission/nursing-notes/',
        desc: 'Nursing notes',
        showComponent: true,
      },
      {
        name: 'Discharge Patient',
        link: '/admission/discharge/',
        desc: 'Discharge patient from ward',
        showComponent: true,
      },
      {
        name: 'Move Patient',
        link: '/admission/change-ward/',
        desc: 'Move patient to another ward',
        showComponent: true,
      },
      {
        name: 'Post Natal',
        link: '/admission/postnatal/',
        desc: 'Add post natal information',
        showComponent: false,
      },
      {
        name: 'Delivery',
        link: '/admission/delivery/',
        desc: 'Add delivery information',
        showComponent: false,
      },
      {
        name: 'Ante-natal',
        link: '/program/ante-natal/visit/',
        desc: 'View antenatal records',
        showComponent: false,
      },
    ],
    MATERNITY: 'Maternity',
    POST_NATAL: 'Post Natal',
    DELIVERY: 'Delivery',
    ANTE_NATAL: 'Ante-natal',
    FEMALE: 'Female',
  }),
  computed: {
    routeId() {
      return this.$route.params.id;
    },

    admission() {
      return this.$store.state.admission.admission;
    },
  },
  methods: {
    getRouteLink(route) {
      if (route.name !== this.ANTE_NATAL) {
        return route.link + this.$route.params.id;
      }
      return route.link + `${this.admission?.visit_id}?antenatal=${this.admission?.ante_natal_id}`;
    },
  },
  watch: {
    admission: {
      handler() {
        this.routes.filter(tab => {
          if (
            tab.name === this.POST_NATAL ||
            tab.name === this.DELIVERY ||
            tab.name === this.ANTE_NATAL
          ) {
            if (
              this.user.sub_role === this.MATERNITY &&
              this.admission?.patient?.gender === this.FEMALE
            ) {
              tab.showComponent = true;
            }
            return tab;
          }
        });
      },
      immediate: true,
    },
  },
  created() {
    this.$store
      .dispatch('admission/fetchAdmission', { admissionId: this.$route.params.id })
      .then(response => {
        const res = response.data.data;
        this.$store.dispatch('patient/setCurrentPatient', { ...res.patient, ...res.insurance });
      });
  },
};
</script>

<style></style>
