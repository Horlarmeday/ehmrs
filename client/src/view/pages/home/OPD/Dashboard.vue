<template>
  <!--Begin::Row-->
  <div class="row">
    <div class="col-xl-3">
      <!--begin::Stats Widget 29-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('searchpatient')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-info">
            <i class="flaticon-search icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 d-block"
            >Find Patients</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 29-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 29-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('searchpatient')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-info">
            <i class="flaticon-users-1 icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 d-block"
            >Active Patients</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 29-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 30-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('visits')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon2-user-1 icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75  text-center font-size-h3 mb-0 mt-6 d-block"
            >Active Visits</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 30-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 31-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('register')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon-notes icon-4x text-dark font-weight-bolder"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75  text-center font-size-h3 mb-0 mt-6 d-block"
            >Treatments</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 31-->
    </div>
  </div>
  <!--End::Row-->
</template>

<script>
export default {
  methods: {
    openPage(value) {
      this.$router.push({ name: value });
    }
  }
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
</style>
