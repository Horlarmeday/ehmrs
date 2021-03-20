<template>
  <!--Begin::Row-->
  <div class="row">
    <div class="col-xl-3">
      <!--begin::Stats Widget 29-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('/patient/find-patient')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-info">
            <i class="flaticon-search icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 d-block"
            >Find Patient Record</span
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
        @click="openPage('/visit/active')"
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
        @click="openPage('/patient/choose-patient-type')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon2-user icon-4x text-dark font-weight-bolder"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75  text-center font-size-h3 mb-0 mt-6 d-block"
            >Register Patient</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 31-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 32-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('appointment')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon-event-calendar-symbol icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 text-hover-primary d-block"
            >Appointment Scheduling</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 32-->
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
            <i class="fas fa-user-md icon-4x text-dark font-weight-bolder"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75  text-center font-size-h3 mb-0 mt-6 d-block"
            >Assign Patient</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 31-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 32-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('/program/program-type')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon-security icon-4x  text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 text-hover-primary d-block"
            >Programs</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 32-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 32-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('reports')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="flaticon2-list-1 icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 text-hover-primary d-block"
            >Reports</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 32-->
    </div>
    <div class="col-xl-3">
      <!--begin::Stats Widget 32-->
      <div
        class="card card-custom bgi-no-repeat card-stretch gutter-b card-cover pointer text-center"
        @click="openPage('/insurance/insurance-type')"
      >
        <!--begin::Body-->
        <div class="card-body">
          <span class="svg-icon svg-icon-2x svg-icon-white">
            <i class="fab fa-medapps icon-4x text-dark"></i>
          </span>
          <span
            class="card-title font-weight-bolder text-dark-75 text-center font-size-h3 mb-0 mt-6 text-hover-primary d-block"
            >Health Insurance</span
          >
        </div>
        <!--end::Body-->
      </div>
      <!--end::Stats Widget 32-->
    </div>
  </div>
  <!--End::Row-->
</template>

<script>
export default {
  methods: {
    openPage(value) {
      this.$router.push(value);
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

.fa,
.fas,
.fab {
  line-height: 1.5;
}
</style>
