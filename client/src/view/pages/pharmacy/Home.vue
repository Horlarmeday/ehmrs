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
                  to="/pharmacy/generic-drugs"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Generic Drugs
                </router-link>
                <p class="text-dark-50">
                  Click here to view all generic drugs
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/pharmacy/generic-drugs"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
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
                  to="/pharmacy/generic-drugs"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Dosage Form
                </router-link>
                <p class="text-dark-50">
                  Click here to view all dosage forms
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/pharmacy/generic-drugs"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
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
                  to="/pharmacy/generic-drugs"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Routes of Administration
                </router-link>
                <p class="text-dark-50">
                  Click here to view all routes of administration
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/pharmacy/generic-drugs"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
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
                  to="/pharmacy/generic-drugs"
                  class="h4 text-dark text-hover-primary mb-5"
                >
                  Strength/Volume
                </router-link>
                <p class="text-dark-50">
                  Click here to view all drugs strength or volumes
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  to="/pharmacy/generic-drugs"
                  class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
                >
                  View
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
