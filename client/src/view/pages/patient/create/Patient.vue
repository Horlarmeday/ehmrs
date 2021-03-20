<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div class="col-lg-6 col-xl-4 mb-10">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  to="/patient/cash-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Cash Patient
                </router-link>
                <p class="text-dark-50">
                  These are patients that have no health insurance
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/cash-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Create
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!--end::Callout-->
      </div>

      <div
        class="col-lg-6 col-xl-4 mb-10"
        v-for="insurance in insurances"
        :key="insurance.id"
      >
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  :to="`/patient/health-insurance/${insurance.id}`"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  {{ insurance.name }} Patient
                </router-link>
                <p class="text-dark-50">
                  These are patients under {{ insurance.description }} scheme
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="`/patient/health-insurance/${insurance.id}`"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Create
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!--end::Callout-->
      </div>

      <div class="col-lg-6 col-xl-4 mb-10">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  to="/patient/ordinary-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Emergency Patient
                </router-link>
                <p class="text-dark-50">
                  These are patients under the retainerships insurance
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/ordinary-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Create
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <!--end::Callout-->
      </div>

      <div class="col-lg-6 col-xl-4 mb-10">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link
                  to="/patient/ordinary-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Ordinary Patient
                </router-link>
                <p class="text-dark-50">
                  These are patients with no hospital id
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/ordinary-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Create
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
    return {};
  },
  computed: {
    insurances() {
      return this.$store.state.insurance.insurances;
    }
  },
  methods: {
    openPage(value) {
      this.$router.push(`/patient/${value}`);
    }
  },
  created() {
    this.$store.dispatch("insurance/fetchInsurances", {
      currentPage: 1,
      itemsPerPage: 10
    });
  }
};
</script>

<style></style>
