<template>
  <div class="reports-container">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'Reports',
  data() {
    return {};
  },
};
</script>

<style scoped>
.reports-container {
  min-height: 100vh;
}
</style>
