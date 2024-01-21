<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div v-for="(route, i) in routes" :key="i" class="col-lg-6 col-xl-4 mb-10">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link :to="route.link" class="h4 text-dark text-hover-primary mb-5">
                  {{ route.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ route.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="route.link"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  {{ route.name === 'Register Patient' ? 'Create' : 'View' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!--end::Callout-->
      </div>
    </div>
    <!--end::Row-->
  </div>
</template>

<script>
export default {
  data() {
    return {
      routes: [
        {
          name: 'Register Patient',
          desc: 'Create a new patient account',
          link: '/patient/choose-patient-type',
        },
        {
          name: 'Admitted Patients',
          desc: 'View current admitted patients',
          link: '/visit/admitted-patients',
        },
        {
          name: 'Discharge Records',
          desc: 'View discharge records',
          link: '/admission/discharge-patients',
        },
      ],
    };
  },
  computed: {
    insurances() {
      return this.$store.state.insurance.insurances;
    },
  },
  methods: {
    openPage(value) {
      this.$router.push(`/patient/${value}`);
    },
  },
  created() {
    this.$store.dispatch('insurance/fetchInsurances', {
      currentPage: 1,
      itemsPerPage: 10,
    });
  },
};
</script>

<style></style>
