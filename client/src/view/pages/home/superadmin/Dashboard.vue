<template>
  <!--Begin::Row-->
  <div>
    <div class="form-group">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text"><i class="flaticon-search icon-lg"></i></span>
        </div>
        <input @input="filterRoutes" type="text" class="form-control" placeholder="Search" />
      </div>
    </div>
    <div class="row text-center">
      <div class="col-xl-3" v-for="(route, index) in routes" :key="index">
        <!--begin::Stats Widget 29-->
        <div
          class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
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
  data() {
    return {
      routes: items,
    };
  },
  methods: {
    openPage(value) {
      this.$router.push(value);
    },

    filterRoutes(event) {
      items.filter(
        ({ name }) => name.toLowerCase() === event.target.value.toLowerCase()
      );
      console.log(this.routes);
    },
  },
};
</script>

<style scoped>
.card-cover {
  background-position: right top;
  background-size: 30% auto;
  background-image: url(/media/svg/shapes/abstract-1.svg);
  border: 1px solid #ddd;
  /*background: linear-gradient(to bottom,#FFF,#DDD);*/
}

.align-center {
  margin-left: 33%;
}

.pointer {
  cursor: pointer;
}

.fa,
.fas,
.fab,
.far {
  line-height: 1.5;
}
</style>
