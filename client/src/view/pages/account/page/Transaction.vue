<template>
  <div class="card card-custom gutter-b">
    <div class="card-header py-5">
      <h3 class="card-title align-items-start flex-column">
        <span class="card-label font-weight-bolder text-dark">Transaction</span>
      </h3>
    </div>
    <div class="card-body">
      <div class="example">
        <b-tabs content-class="mt-3">
          <b-tab title="Medications" active>
            <prescribed-drugs-table />
          </b-tab>
          <b-tab title="Items">
            <additional-items-table />
          </b-tab>
          <b-tab title="Tests"></b-tab>
          <b-tab title="Services"></b-tab>
          <b-tab title="Investigations"></b-tab>
        </b-tabs>
      </div>
    </div>
  </div>
</template>
<script>
import PrescribedDrugsTable from '@/view/pages/account/components/drugs/PrescribedDrugsTable.vue';
import AdditionalItemsTable from '@/view/pages/account/components/drugs/AdditionalItemsTable.vue';

export default {
  components: { PrescribedDrugsTable, AdditionalItemsTable },
};
</script>

<style scoped></style>
