<template>
  <!--Begin::Row-->
  <div>
    <div class="row text-center">
      <div class="col-xl-3" v-for="(route, index) in routes" :key="index">
        <div
          class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
          @click="openPage(route.url)"
        >
          <div class="card-body">
            <span class="svg-icon svg-icon-2x svg-icon-info">
              <i class="icon-4x text-dark" :class="route.icon"></i>
            </span>
            <span
              class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 d-block"
            >{{ route.name }}</span
            >
          </div>
        </div>
      </div>
    </div>
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
