<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Investigations</span>
      </h3>
      <investigations-approval-table />
    </div>
  </div>
</template>
<script>
import InvestigationsApprovalTable from './verifiedInvestigations/VerifiedInvestigationsTable.vue';

export default {
  components: { InvestigationsApprovalTable },
};
</script>
