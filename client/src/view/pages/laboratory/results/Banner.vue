<template>
  <div class="form-group mb-8">
    <div class="alert alert-custom alert-default" role="alert">
      <div class="alert-icon">
        <i class="flaticon-information text-primary"></i>
      </div>
      <div class="alert-text">
        <div style="margin-left: 25%">
          <i class="flaticon2-warning text-warning icon-lg" /> = Validation
          failed <br />
          <i class="fas fa-flag-checkered text-danger icon-lg" /> =
          Non-conformity
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Banner"
};
</script>

<style scoped>
.alert.alert-custom {
  padding: 0;
}
</style>