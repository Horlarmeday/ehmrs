<template>
  <div
    class="alert alert-shadow shadow-sm alert-custom alert-notice alert-light-primary fade show"
    role="alert"
  >
    <div class="alert-icon"><i class="flaticon-warning"></i></div>
    <div class="alert-text">
      There are
      <span class="font-size-lg font-weight-boldest">{{ recommendedCount }}</span> patients for you
      to discharge! Click
      <router-link class="text-danger" to="/admission/recommended-discharge-patients"
        >here</router-link
      >
      to view them
    </div>
  </div>
</template>
<script>
export default {
  props: {
    recommendedCount: {
      type: Number,
      required: true,
    },
  },
};
</script>

<style scoped></style>
