<template>
  <div class="card card-custom mb-5">
    <div class="card-body">
      <div class="card-title"><h6 class="font-weight-bolder">Today's Stats</h6></div>
      <div class="d-flex align-items-center flex-wrap mt-8">
        <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
          <span class="mr-4">
            <i class="flaticon2-drop display-4 text-muted font-weight-bold"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Samples to Collect</span>
            <span class="font-weight-bolder font-size-h5"
              ><span class="text-dark-50 font-weight-bold"></span
              >{{ stats?.samplesToCollect || 0 }}</span
            >
          </div>
        </div>
        <!--end::Item-->

        <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
          <span class="mr-4">
            <i class="flaticon-confetti display-4 text-muted font-weight-bold"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Samples collected</span>
            <span class="font-weight-bolder font-size-h5"
              ><span class="text-dark-50 font-weight-bold"></span
              >{{ stats?.samplesCollected || 0 }}</span
            >
          </div>
        </div>

        <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
          <span class="mr-4">
            <i class="flaticon-pie-chart display-4 text-muted font-weight-bold"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Awaiting Validation</span>
            <span class="font-weight-bolder font-size-h5"
              ><span class="text-dark-50 font-weight-bold"></span
              >{{ stats?.awaitingValidation || 0 }}</span
            >
          </div>
        </div>

        <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
          <span class="mr-4">
            <i class="flaticon-pie-chart display-4 text-muted font-weight-bold"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Awaiting Approval</span>
            <span class="font-weight-bolder font-size-h5"
              ><span class="text-dark-50 font-weight-bold"></span
              >{{ stats?.awaitingApproval || 0 }}</span
            >
          </div>
        </div>

        <div class="d-flex align-items-center flex-lg-fill mr-5 mb-2">
          <span class="mr-4">
            <i class="flaticon-stopwatch display-4 text-muted font-weight-bold"></i>
          </span>
          <div class="d-flex flex-column text-dark-75">
            <span class="font-weight-bolder font-size-sm">Completed</span>
            <span class="font-weight-bolder font-size-h5"
              ><span class="text-dark-50 font-weight-bold"></span
              >{{ stats?.resultCompleted || 0 }}</span
            >
          </div>
        </div>
        <!--end::Item-->
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Stats',
  computed: {
    stats() {
      return this.$store.state.laboratory.stats;
    },
  },
  created() {
    this.$store.dispatch('laboratory/fetchTodayStats');
  },
};
</script>

<style scoped>
.card.card-custom > .card-body {
  padding: 1rem 2.25rem;
}
</style>
