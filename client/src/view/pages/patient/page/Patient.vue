<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div v-for="(account, i) in accounts" :key="i" class="col-lg-6 col-xl-4 mb-10">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link :to="account.link" class="h4 text-dark text-hover-primary mb-5">
                  {{ account.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ account.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="account.link"
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
    return {
      accounts: [
        {
          name: 'Normal Account',
          desc: 'Click to create a new patient account',
          link: '/patient/create-account',
        },
        {
          name: 'Emergency Account',
          desc: 'Click to create an emergency patient account',
          link: '/patient/create-emergency-account',
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
