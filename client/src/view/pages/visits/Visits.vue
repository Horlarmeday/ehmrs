<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Visits</h3>
      </div>
    </div>
    <div class="card-body">
      <!--begin::Example-->
      <div class="example">
        <b-tabs content-class="mt-3">
          <b-tab title="Active"><active /></b-tab>

          <b-tab title="Programs" lazy> </b-tab>

          <b-tab title="IPD" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="OPD"><b-alert show>I'm always mounted</b-alert></b-tab>

          <b-tab title="All" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >
        </b-tabs>
      </div>
      <!--end::Example-->
    </div>
  </div>
  <!--end::Card-->
</template>

<script>
import Active from "./components/Active.vue";
export default {
  components: {
    Active
  }
};
</script>

<style></style>
