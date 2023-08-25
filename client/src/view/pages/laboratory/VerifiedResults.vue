<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Samples Collected</span>
      </h3>
      <div class="card-toolbar">
        <div class="example">
          <b-tabs content-class="" lazy>
            <b-tab title="Today">
              <test-approvals-table period="Today" />
            </b-tab>
            <b-tab title="Backlog" lazy>
              <test-approvals-table period="Backlog" />
            </b-tab>
          </b-tabs>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import TestApprovalsTable from "@/view/pages/laboratory/verifiedResults/VerifiedResultsTable.vue";

export default {
  components: { TestApprovalsTable },
};
</script>
