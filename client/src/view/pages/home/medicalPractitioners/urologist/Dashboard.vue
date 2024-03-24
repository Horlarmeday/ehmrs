<template>
  <!--Begin::Row-->
  <div class="row">
    <div class="col-xl-3" v-for="(route, i) in routes" :key="i">
      <!--begin::Stats Widget 29-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage(route.url)"
      >
        <!--        <div v-if="countList.includes(route.name)" class="card-header-right ribbon ribbon-top ribbon-ver">-->
        <!--          <div class="ribbon-target bg-success" style="top: -2px; right: 20px;">-->
        <!--            <span class="font-weight-boldest font-size-lg">20</span>-->
        <!--          </div>-->
        <!--        </div>-->
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-info">
            <i :class="route.icon" class="icon-4x text-dark"></i>
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
</template>

<script>
import items from './dashboardItems';
const COUNT_LIST = ['Queue', 'Antenatal Visits', 'Appointments'];
export default {
  data: () => ({
    routes: items,
    countList: COUNT_LIST,
  }),
  methods: {
    openPage(value) {
      this.$router.push(value);
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

.gutter {
  /* height: calc(100% - 15px) !important; */
  width: calc(100% - 35px);
}

.fa,
.fas {
  line-height: 1.5;
}
</style>
