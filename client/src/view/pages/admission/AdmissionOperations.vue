<template>
  <div>
    <div class="row mb-10">
      <div v-for="(route, i) in routes" :key="i" class="col-lg-6 col-xl-4 mb-10">
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  :to="`${route.link}${routeId}`"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  {{ route.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ route.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="`${route.link}${routeId}`"
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
export default {
  data: () => ({
    routes: [
      {
        name: 'Doctor Prescriptions',
        link: '/admission/doctor-prescriptions/',
        desc: 'View doctor prescriptions',
      },
      {
        name: 'Additional Prescriptions',
        link: '/admission/additional-prescriptions/',
        desc: 'Patient additional prescriptions',
      },
      {
        name: 'Observations',
        link: '/admission/observations/',
        desc: 'Record patient daily observations',
      },
      {
        name: 'Care Plan',
        link: '/admission/careplans/',
        desc: 'Patient care plan',
      },
      // {
      //   name: 'Ward Round',
      //   link: '/admission/wardround/',
      //   desc: 'Ward round details',
      // },
      {
        name: 'IO Chart',
        link: '/admission/iocharts/',
        desc: 'Patient IO Chart',
      },
      {
        name: 'Treatment',
        link: '/admission/treatments/',
        desc: 'Record patient treatments',
      },
      {
        name: 'Nursing Note',
        link: '/admission/nursing-notes/',
        desc: 'Nursing notes',
      },
      {
        name: 'Discharge Patient',
        link: '/admission/discharge/',
        desc: 'Discharge patient from ward',
      },
      {
        name: 'Move Patient',
        link: '/admission/change-ward/',
        desc: 'Move patient to another ward',
      },
    ],
  }),
  computed: {
    routeId() {
      return this.$route.params.id;
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
