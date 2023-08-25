<template>
  <div class="card card-custom gutter-b">
    <div class="card-body card-header-tabs-line">
      <h3 class="card-title align-items-start">
        <span class="card-label font-weight-bolder text-dark">Investigations Results</span>
      </h3>
      <investigation-results-table />
    </div>
  </div>
</template>
<script>
import InvestigationResultsTable from './investigationResults/InvestigationResultsTable.vue';

export default {
  components: { InvestigationResultsTable },
};
</script>
