<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Drug Prescriptions</span>
      </h3>
      <div class="card-toolbar">
        <div class="example">
          <b-tabs content-class="">
            <!-- This tabs content will always be mounted -->
            <b-tab title="Today" lazy>
              <prescriptions-table period="Today" />
            </b-tab>
            <!-- and will be un-mounted when hidden -->
            <b-tab title="Backlog" lazy>
              <prescriptions-table period="Backlog" />
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PrescriptionsTable from '@/view/pages/pharmacy/prescriptions/PrescriptionsTable.vue';

export default {
  components: { PrescriptionsTable },
};
</script>
