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
                  Ante Natal Program
                </router-link>
                <p class="text-dark-50">
                  Enrol patients into the ante-natal program
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/cash-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Enrol
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
                  to="/patient/nhis-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Immunization Program
                </router-link>
                <p class="text-dark-50">
                  Enrol patients into the immunization program
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/nhis-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Enrol
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
                  to="/patient/fhss-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  HIV Program
                </router-link>
                <p class="text-dark-50">
                  Enrol patients into HIV program
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/fhss-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Enrol
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
                  to="/patient/phis-patient"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  TB Program
                </router-link>
                <p class="text-dark-50">
                  Enrol patients into TB program
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/patient/phis-patient"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  Enrol
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
  methods: {
    openPage(value) {
      this.$router.push(`/patient/${value}`);
    }
  }
};
</script>

<style></style>
