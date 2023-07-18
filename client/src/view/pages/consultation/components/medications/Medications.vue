<template>
  <div class="flex-row-fluid ml-lg-8">
    <div class="card card-custom gutter-b">
      <div class="card-header pt-5">
        <h3 class="card-title align-items-start flex-column">
          <span class="card-label font-weight-bolder text-dark">Medications</span>
        </h3>
      </div>
      <div class="card-body py-2">
        <div>MEdics</div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Medications',
};
</script>

<style scoped>
.flex-row-fluid {
  -webkit-box-flex: 1;
  flex: 3 auto;
  -ms-flex: 1 0 0px;
  min-width: 0;
}
</style>
