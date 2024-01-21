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
  data: () => ({
    routes: [
      {
        name: 'Immunization Patients',
        link: '/program/immunization/list',
        desc: 'Click to view the patients enrolled into the immunization program',
      },
      {
        name: 'Create Account',
        link: '/program/immunization/enrol',
        desc: 'Click to enrol patients into the immunization program',
      },
    ],
  }),
};
</script>

<style></style>
