<template>
  <!--begin::Card-->
  <div class="card card-custom gutter-b">
    <div class="card-header">
      <div class="card-title">
        <h3 class="card-label">Tabs</h3>
      </div>
    </div>
    <div class="card-body">
      <!--begin::Example-->
      <div class="example">
        <b-tabs content-class="mt-3">
          <!-- This tabs content will always be mounted -->
          <b-tab title="Personal"
            ><b-alert show>I'm always mounted</b-alert></b-tab
          >
          <!-- and will be un-mounted when hidden -->
          <b-tab title="History" lazy>
            <History />
          </b-tab>

          <b-tab title="Diagnosis" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Visits" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Treatments" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Lab Orders" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Radiology"
            ><b-alert show>I'm always mounted</b-alert></b-tab
          >

          <b-tab title="Vitals" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Admission Details" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Programs" lazy
            ><b-alert show>I'm lazy mounted!</b-alert></b-tab
          >

          <b-tab title="Payments" lazy
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
import History from './components/History.vue';
export default {
  components: {
    History
  }
};
</script>
