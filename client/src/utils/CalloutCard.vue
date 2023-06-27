<template>
  <div class="card card-custom mb-2 bg-diagonal">
    <div class="card-body">
      <div
        class="d-flex align-items-center justify-content-between p-4 flex-lg-wrap flex-xl-nowrap"
      >
        <div class="d-flex flex-column mr-5">
          <router-link :to="link" class="h4 text-dark text-hover-primary mb-5">
            {{ name }}
          </router-link>
          <p class="text-dark-50">
            {{ desc }}
          </p>
        </div>
        <div class="ml-6 ml-lg-0 ml-xxl-6 flex-shrink-0">
          <router-link
            :to="link"
            class="btn font-weight-bolder text-uppercase btn-light-primary py-4 px-6"
          >
            View
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CalloutCard",
  props: {
    link: {
      type: String,
      required: true
    },
    desc: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
  }
};
</script>

<style scoped>

</style>