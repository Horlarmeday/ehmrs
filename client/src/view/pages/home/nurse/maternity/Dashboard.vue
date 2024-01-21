<template>
  <div>
    <div
      class="alert alert-shadow shadow-sm alert-custom alert-notice alert-light-warning fade show"
      role="alert"
    >
      <div class="alert-icon"><i class="flaticon-warning"></i></div>
      <div class="alert-text">A simple primary alert—check it out!</div>
      <div class="alert-close">
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true"><i class="ki ki-close"></i></span>
        </button>
      </div>
    </div>
    <!--Begin::Row-->
    <div class="row">
      <div class="col-xl-3" v-for="(route, index) in routes" :key="index">
        <!--begin::Stats Widget 29-->
        <div
          class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover cursor-pointer text-center"
          @click="openPage(route.url)"
        >
          <!--begin::Body-->
          <div class="card-body">
            <span class="svg-icon svg-icon-2x svg-icon-info">
              <i class="icon-4x text-dark" :class="route.icon"></i>
            </span>
            <span
              class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 d-block"
              >{{ route.name }}</span
            >
          </div>
          <!--end::Body-->
        </div>
        <!--end::Stats Widget 29-->
      </div>
    </div>
    <!--End::Row-->
  </div>
</template>
<script>
import items from './dashboardItems';
export default {
  data: () => ({
    routes: items,
  }),
  methods: {
    openPage(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.card-cover {
  background-position: right top;
  background-size: 30% auto;
  background-image: url(/media/svg/shapes/abstract-1.svg);
}

.align-center {
  margin-left: 33%;
}

.pointer {
  cursor: pointer;
}

.fa,
.fas,
.fab {
  line-height: 1.5;
}
</style>
