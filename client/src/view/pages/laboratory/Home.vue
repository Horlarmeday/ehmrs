<template>
  <div>
    <!--begin::Row-->
    <div class="row mb-10">
      <div v-for="(item, i) in items" class="col-lg-6 col-xl-4 mb-10" :key="i">
        <!--begin::Callout-->
        <div class="card card-custom mb-2 bg-diagonal">
          <div class="card-body">
            <div
              class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
            >
              <div class="d-flex flex-column mr-5">
                <router-link :to="item.link" class="h4 text-dark text-hover-primary mb-5">
                  {{ item.name }}
                </router-link>
                <p class="text-dark-50">
                  {{ item.desc }}
                </p>
              </div>
              <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
                <router-link
                  :to="item.link"
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
  data() {
    return {
      items: [
        {
          name: 'Sample Type',
          link: '/laboratory/sample-types',
          desc: 'Click here to view all test sample type',
        },
        {
          name: 'Tests',
          link: '/laboratory/tests',
          desc: 'Click here to view all laboratory tests',
        },
        {
          name: 'Result Forms',
          link: '/laboratory/forms',
          desc: 'Click here to view all laboratory result forms',
        },
      ],
    };
  },
  methods: {
    openPage(value) {
      this.$router.push(`/patient/${value}`);
    },
  },
};
</script>

<style></style>
